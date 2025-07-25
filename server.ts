// server.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { astar, Point, AstarResult } from "./lib/astar";

const server = createServer();
const wss = new WebSocketServer({ server });

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

type WebSocketMessage = SolveMessage | PauseMessage | ResumeMessage | StopMessage;
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
    console.log("sendVisit called", { currentState, visitQueueLength: visitQueue.length });
    
    if (currentState !== "solving" || visitQueue.length === 0) {
      // Check if we should send done message
      if (currentState === "solving" && visitQueue.length === 0 && currentResult) {
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
        console.log("Starting new solve...", { currentState, visitQueueLength: visitQueue.length });
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
        error: "Failed to process request"
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

server.listen(8080, () => {
  console.log("WebSocket server running on ws://localhost:8080");
});