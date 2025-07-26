import { NextRequest, NextResponse } from "next/server";
import { astar } from "@/lib/astar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { maze, start, goal } = body;

    // Validate input
    if (!maze || !start || !goal) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: maze, start, goal",
        },
        { status: 400 }
      );
    }

    // Validate maze format
    if (!Array.isArray(maze) || maze.length === 0 || !Array.isArray(maze[0])) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid maze format. Expected 2D boolean array.",
        },
        { status: 400 }
      );
    }

    // Validate start/goal points
    if (
      typeof start.row !== "number" ||
      typeof start.col !== "number" ||
      typeof goal.row !== "number" ||
      typeof goal.col !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid start/goal format. Expected {row: number, col: number}",
        },
        { status: 400 }
      );
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
      return NextResponse.json(
        {
          success: false,
          error: "Start or goal point is out of maze bounds",
        },
        { status: 400 }
      );
    }

    // Check if start/goal are walls
    if (
      maze[start.row][start.col] === true ||
      maze[goal.row][goal.col] === true
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Start or goal point cannot be on a wall",
        },
        { status: 400 }
      );
    }

    console.log(
      `API /solve - Running A* from (${start.row},${start.col}) to (${goal.row},${goal.col})`
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

    console.log(
      `API /solve - Completed. Path length: ${response.pathLength}, Visited: ${response.visitedCount}`
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing /solve request:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error processing pathfinding request",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message:
        "POST /api/solve endpoint is available. Send a POST request with maze, start, and goal parameters.",
    },
    { status: 200 }
  );
}
