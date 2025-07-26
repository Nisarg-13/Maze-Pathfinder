// WebSocket server for real-time maze pathfinding visualization
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { astar, Point, AstarResult } from "./lib/astar";

// Create HTTP server that handles both REST API and WebSocket connections
const server = createServer((req, res) => {
  // Set CORS headers to allow requests from any origin
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Simple health check endpoint to verify server is running
  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ status: "ok", timestamp: new Date().toISOString() })
    );
    return;
  }

  // REST API endpoint for synchronous pathfinding (without real-time animation)
  if (req.url === "/solve" && req.method === "POST") {
    let body = "";

    // Collect request body data
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    // Process the request when all data is received
    req.on("end", () => {
      try {
        const { maze, start, goal } = JSON.parse(body);

        // Validate that all required fields are present
        if (!maze || !start || !goal) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Missing required fields: maze, start, goal",
            })
          );
          return;
        }

        // Validate maze format
        if (
          !Array.isArray(maze) ||
          maze.length === 0 ||
          !Array.isArray(maze[0])
        ) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Invalid maze format. Expected 2D boolean array.",
            })
          );
          return;
        }

        // Validate start/goal points
        if (
          typeof start.row !== "number" ||
          typeof start.col !== "number" ||
          typeof goal.row !== "number" ||
          typeof goal.col !== "number"
        ) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error:
                "Invalid start/goal format. Expected {row: number, col: number}",
            })
          );
          return;
        }

        // Check bounds
        const numRows = maze.length;
        const numCols = maze[0].length;

        if (
          start.row < 0 ||
          start.row >= numRows ||
          start.col < 0 ||
          start.col >= numCols ||
          goal.row < 0 ||
          goal.row >= numRows ||
          goal.col < 0 ||
          goal.col >= numCols
        ) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Start or goal point is out of maze bounds",
            })
          );
          return;
        }

        // Check if start/goal are walls
        if (
          maze[start.row][start.col] === true ||
          maze[goal.row][goal.col] === true
        ) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error: "Start or goal point cannot be on a wall",
            })
          );
          return;
        }

        console.log(
          `POST /solve - Running A* from (${start.row},${start.col}) to (${goal.row},${goal.col})`
        );

        // Run A* algorithm
        const result = astar(maze, start, goal);

        // Prepare response
        const response = {
          success: true,
          path: result.path,
          pathLength: Math.max(0, result.path.length - 1), // Exclude starting node from length
          visitedCount: result.visitedCount,
          visitedNodes: result.visitedNodes,
          hasPath: result.path.length > 0,
          message:
            result.path.length > 0
              ? `Path found with ${result.path.length - 1} steps`
              : "No path found between start and goal",
        };

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response));

        console.log(
          `POST /solve - Completed. Path length: ${response.pathLength}, Visited: ${response.visitedCount}`
        );
      } catch (error) {
        console.error("Error processing /solve request:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            success: false,
            error: "Internal server error processing pathfinding request",
          })
        );
      }
    });

    req.on("error", (error) => {
      console.error("Request error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          error: "Request processing error",
        })
      );
    });

    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

const wss = new WebSocketServer({
  server,
});

interface SolveMessage {
  type: "solve";
  maze: boolean[][];
  start: Point;
  goal: Point;
  animationSpeed?: number;
}

interface PauseMessage {
  type: "pause";
}

interface ResumeMessage {
  type: "resume";
}

interface StopMessage {
  type: "stop";
}

interface VisitMessage {
  type: "visit";
  node: Point;
}

interface DoneMessage {
  type: "done";
  path: Point[];
  pathLength: number;
  visitedCount: number;
  visitedNodes: string[];
  error?: string;
}

type WebSocketMessage =
  | SolveMessage
  | PauseMessage
  | ResumeMessage
  | StopMessage;
type OutgoingMessage = VisitMessage | DoneMessage;

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  // State for pause/resume functionality
  let currentState: "idle" | "solving" | "paused" | "stopped" = "idle";
  let visitQueue: Point[] = [];
  let visitedNodes: Point[] = [];
  let currentResult: AstarResult | null = null;
  let animationSpeed = 100;
  let sendTimeout: NodeJS.Timeout | null = null;

  function sendVisit(): void {
    console.log("sendVisit called", {
      currentState,
      visitQueueLength: visitQueue.length,
    });

    if (currentState !== "solving" || visitQueue.length === 0) {
      // Check if we should send done message
      if (
        currentState === "solving" &&
        visitQueue.length === 0 &&
        currentResult
      ) {
        console.log("Sending done message...");
        sendDoneMessage();
      }
      return;
    }

    const node = visitQueue.shift()!;
    const visitMessage: VisitMessage = { type: "visit", node };
    ws.send(JSON.stringify(visitMessage));

    // Schedule next visit
    sendTimeout = setTimeout(sendVisit, animationSpeed);
  }

  function sendDoneMessage(): void {
    if (!currentResult) return;

    const doneMessage: DoneMessage = {
      type: "done",
      path: currentResult.path,
      pathLength: Math.max(0, currentResult.path.length - 1), // Exclude starting node
      visitedCount: currentResult.visitedCount,
      visitedNodes: currentResult.visitedNodes,
    };
    ws.send(JSON.stringify(doneMessage));
    currentState = "idle";
  }

  function stopSending(): void {
    if (sendTimeout) {
      clearTimeout(sendTimeout);
      sendTimeout = null;
    }
  }

  ws.on("message", async (message: Buffer) => {
    try {
      const data: WebSocketMessage = JSON.parse(message.toString());
      console.log("Received:", data);

      if (data.type === "solve") {
        console.log("Starting new solve...", {
          currentState,
          visitQueueLength: visitQueue.length,
        });
        const { maze, start, goal, animationSpeed: speed } = data;

        // Stop any current processing
        stopSending();

        // Reset state
        visitQueue = [];
        visitedNodes = [];
        currentResult = null;
        animationSpeed = speed || 100;
        currentState = "solving";

        console.log("State reset complete, running pathfinding algorithm...");

        const onVisit = (node: Point): void => {
          visitQueue.push(node);
          visitedNodes.push(node);
        };

        // Run pathfinding algorithm
        currentResult = astar(maze, start, goal, onVisit);

        // Start sending visit messages
        sendVisit();
      } else if (data.type === "pause") {
        console.log("Pausing pathfinding...");
        if (currentState === "solving") {
          currentState = "paused";
          stopSending();
        }
      } else if (data.type === "resume") {
        console.log("Resuming pathfinding...");
        if (currentState === "paused") {
          currentState = "solving";
          sendVisit(); // Resume sending
        }
      } else if (data.type === "stop") {
        console.log("Stopping pathfinding...");
        currentState = "stopped";
        stopSending();

        // Clear state
        visitQueue = [];
        visitedNodes = [];
        currentResult = null;
        currentState = "idle";
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: DoneMessage = {
        type: "done",
        path: [],
        pathLength: 0,
        visitedCount: 0,
        visitedNodes: [],
        error: "Failed to process request",
      };
      ws.send(JSON.stringify(errorMessage));
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    stopSending();
  });

  ws.on("error", (error: Error) => {
    console.error("WebSocket error:", error);
    stopSending();
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
