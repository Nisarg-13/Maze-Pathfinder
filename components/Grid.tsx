"use client";

import { useEffect, useState, useRef } from "react";
import toast, { Toaster } from 'react-hot-toast';

type CellType = "free" | "wall" | "start" | "goal" | "start-goal";
type Point = { row: number; col: number };

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

interface ErrorMessage {
  type: "error";
  message: string;
}

type WebSocketMessage = VisitMessage | DoneMessage | ErrorMessage;

const GRID_SIZE = 20;

export default function MazeGrid() {
  const [grid, setGrid] = useState<CellType[][]>(
    Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill("free"))
  );
  const [mode, setMode] = useState<"start" | "goal" | null>("start");
  const [pathCells, setPathCells] = useState<Set<string>>(new Set());
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
  const [pathLength, setPathLength] = useState(0);
  const [visitedCount, setVisitedCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(100); // ms delay
  const [solvingState, setSolvingState] = useState<"idle" | "solving" | "paused" | "completed">("idle");
  const wsRef = useRef<WebSocket | null>(null);
  const solveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldIgnoreMessages = useRef(false);

  // Helper to convert point to key string
  const pointKey = (p: Point) => `${p.row},${p.col}`;

  // Reset animation states
  const resetAnimation = () => {
    setPathCells(new Set());
    setVisitedCells(new Set());
    setPathLength(0);
    setVisitedCount(0);
    setIsAnimating(false);
    setSolvingState("idle");
    
    // Reset the ignore flag
    shouldIgnoreMessages.current = false;

    // Clear any existing timeout
    if (solveTimeoutRef.current) {
      clearTimeout(solveTimeoutRef.current);
      solveTimeoutRef.current = null;
    }
  };

  // Stop/Resume the current pathfinding process
  const onToggleSolving = () => {
    if (solvingState === "solving") {
      // Pause the solving
      console.log("Pausing pathfinding...");
      
      // Set flag to ignore incoming messages
      shouldIgnoreMessages.current = true;
      
      // Stop the animation
      setIsAnimating(false);
      setSolvingState("paused");
      
      // Clear the timeout
      if (solveTimeoutRef.current) {
        clearTimeout(solveTimeoutRef.current);
        solveTimeoutRef.current = null;
      }
      
      // Send pause command to WebSocket server if connected
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "pause" }));
      }
      
      console.log("Pathfinding paused by user");
    } else if (solvingState === "paused") {
      // Resume the solving
      console.log("Resuming pathfinding...");
      
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        toast.error("WebSocket is not connected. Please check if the server is running.");
        return;
      }

      // Send resume command to backend
      wsRef.current.send(JSON.stringify({ type: "resume" }));
      
      // Reset flag to process incoming messages
      shouldIgnoreMessages.current = false;
      
      // Resume the animation
      setIsAnimating(true);
      setSolvingState("solving");
      
      // Set a new timeout
      const timeoutDuration = Math.max(60000, (400 * animationSpeed) + 30000);
      solveTimeoutRef.current = setTimeout(() => {
        console.log("Solve timeout reached, stopping animation");
        setIsAnimating(false);
        setSolvingState("paused");
        toast.error(
          `Pathfinding timeout (${Math.round(timeoutDuration/1000)}s). Try faster animation or check maze design.`,
          { duration: 6000 }
        );
      }, timeoutDuration);
      
      console.log("Pathfinding resumed by user");
    }
  };

  // On cell click: toggle wall/start/goal
  const onCellClick = (row: number, col: number) => {
    setGrid((oldGrid) => {
      const newGrid = oldGrid.map((r) => [...r]);
      const currentCell = newGrid[row][col];

      if (mode === "start") {
        // Remove old start and start-goal cells
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            if (newGrid[i][j] === "start") newGrid[i][j] = "free";
            if (newGrid[i][j] === "start-goal") newGrid[i][j] = "goal";
          }
        }

        // Smart behavior: if clicking on goal, make it start-goal
        if (currentCell === "goal") {
          newGrid[row][col] = "start-goal";
        } else {
          newGrid[row][col] = "start";
        }
      } else if (mode === "goal") {
        // Remove old goal and start-goal cells
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            if (newGrid[i][j] === "goal") newGrid[i][j] = "free";
            if (newGrid[i][j] === "start-goal") newGrid[i][j] = "start";
          }
        }

        // Smart behavior: if clicking on start, make it start-goal
        if (currentCell === "start") {
          newGrid[row][col] = "start-goal";
        } else {
          newGrid[row][col] = "goal";
        }
      } else {
        // Toggle wall
        if (newGrid[row][col] === "free") newGrid[row][col] = "wall";
        else if (newGrid[row][col] === "wall") newGrid[row][col] = "free";
      }
      return newGrid;
    });

    resetAnimation();
  };

  // Find cell position for start/goal
  const findCell = (type: CellType): Point | null => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === type) return { row: r, col: c };
        // Also check for start-goal cells
        if (type === "start" && grid[r][c] === "start-goal")
          return { row: r, col: c };
        if (type === "goal" && grid[r][c] === "start-goal")
          return { row: r, col: c };
      }
    }
    return null;
  };

  // Connect to WebSocket and handle messages
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WS connected");
    };

    ws.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);
      console.log("WebSocket message received:", data);

      // Ignore messages if user has stopped the solving
      if (shouldIgnoreMessages.current && (data.type === "visit" || data.type === "done")) {
        console.log("Ignoring message because solving was stopped by user");
        return;
      }

      if (data.type === "visit") {
        // Animate visited node immediately (no batching for slower animation)
        const nodeKey = pointKey(data.node);
        setVisitedCells((prev) => new Set([...prev, nodeKey]));
        setVisitedCount((prev) => prev + 1);
      } else if (data.type === "done") {
        console.log("Pathfinding completed, setting state to completed");

        // Clear the timeout since we got a response
        if (solveTimeoutRef.current) {
          clearTimeout(solveTimeoutRef.current);
          solveTimeoutRef.current = null;
        }

        const pathKeys = data.path ? data.path.map((p: Point) => pointKey(p)) : [];
        const visitedKeys = new Set(data.visitedNodes || []);

        setPathCells(new Set(pathKeys));
        setVisitedCells(visitedKeys);
        setPathLength(data.pathLength || 0);
        setVisitedCount(data.visitedCount || 0);
        setIsAnimating(false);
        setSolvingState("completed");
        
        // Show success or no path toast
        if (!data.error) {
          if ((data.pathLength || 0) === 0) {
            toast.error("Path not found! No route exists between start and goal.");
          } else {
            toast.success(`Path found! Length: ${data.pathLength} steps, Visited: ${data.visitedCount || 0} nodes`);
          }
        }

        if (data.error) {
          toast.error(data.error);
          setIsAnimating(false);
          setSolvingState("paused"); // Set to paused on error so user can restart
        }
      } else if (data.type === "error") {
        console.error("WebSocket error message:", data);
        toast.error(data.message || "An error occurred during pathfinding");

        // Clear the timeout
        if (solveTimeoutRef.current) {
          clearTimeout(solveTimeoutRef.current);
          solveTimeoutRef.current = null;
        }

        setIsAnimating(false);
      }
    };

    ws.onerror = (error) => {
      console.error("WS error", error);
      setIsAnimating(false);
      
      // Clear timeout on error
      if (solveTimeoutRef.current) {
        clearTimeout(solveTimeoutRef.current);
        solveTimeoutRef.current = null;
      }
      
      toast.error("WebSocket connection error. Please check if the server is running.", {
        duration: 5000
      });
    };

    ws.onclose = (event) => {
      console.log("WS closed", event.code, event.reason);
      setIsAnimating(false);
      
      // Clear timeout on close
      if (solveTimeoutRef.current) {
        clearTimeout(solveTimeoutRef.current);
        solveTimeoutRef.current = null;
      }
      
      // Only show toast if it wasn't a normal close
      if (event.code !== 1000) {
        toast.error("WebSocket connection lost. Please check if the server is still running.", {
          duration: 5000
        });
      }
    };

    return () => {
      ws.close();
      // Clear timeout on cleanup
      if (solveTimeoutRef.current) {
        clearTimeout(solveTimeoutRef.current);
        solveTimeoutRef.current = null;
      }
    };
  }, []);

  // Start solving or restart solving
  const onSolveOrRestart = () => {
    if (solvingState === "idle" || solvingState === "completed") {
      // Start new solve
      const start = findCell("start");
      const goal = findCell("goal");

      if (!start || !goal) {
        toast.error("Please set both start and goal points.");
        return;
      }

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        toast.error("WebSocket is not connected. Please start the server with 'npm run server:dev'", {
          duration: 5000
        });
        return;
      }

      // Prepare maze array of booleans where true = wall
      const maze = grid.map((row) => row.map((cell) => cell === "wall"));

      // Send solve command with animation speed
      wsRef.current.send(JSON.stringify({ 
        type: "solve", 
        maze, 
        start, 
        goal, 
        animationSpeed 
      }));

      // Reset animation states for new solve
      setPathCells(new Set());
      setVisitedCells(new Set());
      setPathLength(0);
      setVisitedCount(0);
      setIsAnimating(true);
      setSolvingState("solving");
      
      // Reset the ignore flag for new solve
      shouldIgnoreMessages.current = false;

      // Set a dynamic timeout based on animation speed
      const timeoutDuration = Math.max(60000, (400 * animationSpeed) + 30000);
      
      solveTimeoutRef.current = setTimeout(() => {
        console.log("Solve timeout reached, stopping animation");
        setIsAnimating(false);
        setSolvingState("paused");
        toast.error(
          `Pathfinding timeout (${Math.round(timeoutDuration/1000)}s). Try faster animation or check maze design.`,
          { duration: 6000 }
        );
      }, timeoutDuration);
    } else if (solvingState === "paused") {
      // Restart from beginning
      console.log("Restarting pathfinding from beginning...");
      
      // Send stop command to backend to reset its state
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "stop" }));
      }
      
      // Clear current state
      setPathCells(new Set());
      setVisitedCells(new Set());
      setPathLength(0);
      setVisitedCount(0);
      
      // Start fresh solve directly (don't use recursive call)
      const start = findCell("start");
      const goal = findCell("goal");

      if (!start || !goal) {
        toast.error("Please set both start and goal points.");
        setSolvingState("idle");
        return;
      }

      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        toast.error("WebSocket is not connected. Please start the server with 'npm run server:dev'", {
          duration: 5000
        });
        setSolvingState("idle");
        return;
      }

      // Prepare maze array of booleans where true = wall
      const maze = grid.map((row) => row.map((cell) => cell === "wall"));

      // Send solve command with animation speed
      wsRef.current.send(JSON.stringify({ 
        type: "solve", 
        maze, 
        start, 
        goal, 
        animationSpeed 
      }));

      setIsAnimating(true);
      setSolvingState("solving");
      
      // Reset the ignore flag for new solve
      shouldIgnoreMessages.current = false;

      // Set a dynamic timeout based on animation speed
      const timeoutDuration = Math.max(60000, (400 * animationSpeed) + 30000);
      
      solveTimeoutRef.current = setTimeout(() => {
        console.log("Solve timeout reached, stopping animation");
        setIsAnimating(false);
        setSolvingState("paused");
        toast.error(
          `Pathfinding timeout (${Math.round(timeoutDuration/1000)}s). Try faster animation or check maze design.`,
          { duration: 6000 }
        );
      }, timeoutDuration);
    }
  };

  const onClearGrid = () => {
    setGrid(
      Array(GRID_SIZE)
        .fill(null)
        .map(() => Array(GRID_SIZE).fill("free"))
    );
    resetAnimation();
    setMode("start"); // Reset to start mode after clearing
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10 flex-shrink-0">
        <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Maze Pathfinder
              </h1>
            </div>

            {/* Stats */}
            <div className="flex gap-3 sm:gap-6">
              <div className="text-center bg-black/30 rounded-lg px-2 sm:px-4 py-1 sm:py-2 border border-white/10">
                <p className="text-gray-400 text-xs sm:text-sm">Path Length</p>
                <p className={`font-bold text-lg sm:text-xl ${pathLength === 0 && solvingState === "completed" ? "text-red-400" : "text-cyan-400"}`}>
                  {pathLength === 0 && solvingState === "completed" ? "Not Found" : pathLength}
                </p>
              </div>
              <div className="text-center bg-black/30 rounded-lg px-2 sm:px-4 py-1 sm:py-2 border border-white/10">
                <p className="text-gray-400 text-xs sm:text-sm">Visited Nodes</p>
                <p className="text-yellow-400 font-bold text-lg sm:text-xl">
                  {visitedCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 bg-black/20 backdrop-blur-sm border-b lg:border-b-0 lg:border-r border-white/10 p-3 sm:p-4 lg:p-6 overflow-y-auto flex-shrink-0">
          <div className="space-y-4 lg:space-y-6">
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-white mb-3 lg:mb-4">
                Controls
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-3">
                <button
                  className={`w-full px-2 sm:px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-sm lg:text-base font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    mode === "start"
                      ? "bg-green-600 text-white border-2 border-green-500 shadow-lg shadow-green-500/25"
                      : "bg-gray-800 text-gray-300 hover:bg-green-600/20 hover:text-green-400 border border-gray-600"
                  }`}
                  onClick={() => setMode(mode === "start" ? null : "start")}
                >
                  <span className="hidden sm:inline lg:inline">Set Start Point</span>
                  <span className="sm:hidden">Start</span>
                </button>

                <button
                  className={`w-full px-2 sm:px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-sm lg:text-base font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    mode === "goal"
                      ? "bg-red-600 text-white border-2 border-red-500 shadow-lg shadow-red-500/25"
                      : "bg-gray-800 text-gray-300 hover:bg-red-600/20 hover:text-red-400 border border-gray-600"
                  }`}
                  onClick={() => setMode(mode === "goal" ? null : "goal")}
                >
                  <span className="hidden sm:inline lg:inline">Set Goal Point</span>
                  <span className="sm:hidden">Goal</span>
                </button>

                <button
                  className={`w-full px-2 sm:px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-sm lg:text-base font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    mode === null
                      ? "bg-blue-600 text-white border-2 border-blue-500 shadow-lg shadow-blue-500/25"
                      : "bg-gray-800 text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 border border-gray-600"
                  }`}
                  onClick={() => setMode(null)}
                >
                  <span className="hidden sm:inline lg:inline">Draw Walls</span>
                  <span className="sm:hidden">Walls</span>
                </button>

                <button
                  className="w-full px-2 sm:px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-sm lg:text-base font-medium bg-orange-600 text-white hover:bg-orange-700 transition-all duration-300 flex items-center justify-center gap-2 border border-orange-500 shadow-lg shadow-orange-500/25"
                  onClick={onClearGrid}
                >
                  <span className="hidden sm:inline lg:inline">Clear Grid</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 lg:pt-6 space-y-3">
              {/* Solve/Restart Button */}
              <button
                onClick={onSolveOrRestart}
                disabled={solvingState === "solving"}
                className={`w-full px-4 lg:px-6 py-3 lg:py-4 rounded-lg font-semibold text-base lg:text-lg transition-all duration-300 flex items-center justify-center gap-3 ${
                  solvingState === "solving"
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed border border-gray-500"
                    : solvingState === "paused"
                    ? "bg-orange-600 text-white hover:bg-orange-700 border-2 border-orange-500 shadow-lg shadow-orange-500/25"
                    : "bg-purple-600 text-white hover:bg-purple-700 border-2 border-purple-500 shadow-lg shadow-purple-500/25"
                }`}
              >
                {solvingState === "solving" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Solving...</span>
                  </>
                ) : solvingState === "paused" ? (
                  <>
                    <span>Restart Maze</span>
                  </>
                ) : (
                  <>
                    <span>Solve Maze</span>
                  </>
                )}
              </button>
              
              {/* Stop/Resume Button */}
              <button
                onClick={onToggleSolving}
                disabled={solvingState === "idle" || solvingState === "completed"}
                className={`w-full px-4 lg:px-6 py-2 lg:py-3 rounded-lg font-semibold text-sm lg:text-base transition-all duration-300 flex items-center justify-center gap-3 ${
                  solvingState === "solving"
                    ? "bg-red-600 text-white hover:bg-red-700 border-2 border-red-500 shadow-lg shadow-red-500/25"
                    : solvingState === "paused"
                    ? "bg-green-600 text-white hover:bg-green-700 border-2 border-green-500 shadow-lg shadow-green-500/25"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed border border-gray-600"
                }`}
              >
                {solvingState === "solving" ? (
                  <>
                    <span>Pause Solving</span>
                  </>
                ) : solvingState === "paused" ? (
                  <>
                    <span>Resume Solving</span>
                  </>
                ) : (
                  <>
                    <span>Pause Solving</span>
                  </>
                )}
              </button>
            </div>

            {/* Animation Speed Control */}
            <div className="bg-black/30 rounded-xl p-3 lg:p-4 border border-white/10">
              <h4 className="text-white font-semibold mb-2 lg:mb-3 text-sm lg:text-base">Animation Speed</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Fast</span>
                  <span>{animationSpeed}ms</span>
                  <span>Slow</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  disabled={isAnimating}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed slider"
                />
                <div className="text-xs text-gray-400 mt-2">
                  Max timeout: {Math.round(Math.max(60000, (400 * animationSpeed) + 30000) / 1000)}s
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-semibold mb-3">Legend</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded border-2 border-green-300"></div>
                  <span className="text-gray-300">Start Point</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded border-2 border-red-300"></div>
                  <span className="text-gray-300">Goal Point</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-800 rounded border border-gray-600"></div>
                  <span className="text-gray-300">Wall</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span className="text-gray-300">Visited</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-gray-300">Path</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Area */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4 lg:p-8 overflow-hidden">
          <div className="bg-black/20 backdrop-blur-sm rounded-xl lg:rounded-2xl p-2 sm:p-4 lg:p-8 border border-white/10 shadow-2xl flex items-center justify-center">
            <div className="grid-cols-20 bg-gray-900/50 p-2 sm:p-3 lg:p-4 rounded-lg lg:rounded-xl" style={{ width: 'min(85vw, 85vh)', height: 'min(85vw, 85vh)' }}>
              {Array.from({ length: GRID_SIZE }, (_, r) =>
                Array.from({ length: GRID_SIZE }, (_, c) => {
                  const cell = grid[r][c];
                  let bgColor = "bg-gray-100 hover:bg-gray-200";
                  let borderColor = "border-gray-300";

                  if (cell === "wall") {
                    bgColor = "bg-gray-800 border-gray-700";
                    borderColor = "border-gray-600";
                  } else if (cell === "start" || cell === "start-goal") {
                    bgColor = "bg-green-500 shadow-lg shadow-green-500/50";
                    borderColor = "border-green-400";
                  } else if (cell === "goal") {
                    bgColor = "bg-red-500 shadow-lg shadow-red-500/50";
                    borderColor = "border-red-400";
                  }

                  // Animation overlays
                  if (visitedCells.has(`${r},${c}`)) {
                    if (!pathCells.has(`${r},${c}`) && cell !== "start" && cell !== "goal" && cell !== "start-goal") {
                      bgColor = "bg-yellow-400 shadow-lg shadow-yellow-400/50";
                    }
                  }

                  if (pathCells.has(`${r},${c}`) && cell !== "start" && cell !== "goal" && cell !== "start-goal") {
                    bgColor = "bg-purple-500 shadow-lg shadow-purple-500/50";
                  }

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`border cursor-pointer transition-all duration-200 rounded-sm ${bgColor} ${borderColor} hover:scale-110`}
                      onClick={() => onCellClick(r, c)}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
          },
          success: {
            style: {
              background: '#065f46',
              color: '#ecfdf5',
              border: '1px solid #10b981',
            },
          },
          error: {
            style: {
              background: '#7f1d1d',
              color: '#fef2f2',
              border: '1px solid #ef4444',
            },
          },
        }}
      />
    </div>
  );
}