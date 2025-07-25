import { NextRequest, NextResponse } from 'next/server';
import { astar, Point, AstarResult } from '../../../lib/astar';

interface SolveRequest {
  maze: boolean[][];
  start: Point;
  goal: Point;
}

interface SolveResponse {
  path: Point[];
  pathLength: number;
  visitedCount: number;
  visitedNodes: string[];
  error?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<SolveResponse>> {
  try {
    const body: SolveRequest = await req.json();
    const { maze, start, goal } = body;
    
    if (!maze || !start || !goal) {
      return NextResponse.json(
        { 
          path: [],
          pathLength: 0,
          visitedCount: 0,
          visitedNodes: [],
          error: 'Missing maze, start, or goal' 
        }, 
        { status: 400 }
      );
    }
    
    const result: AstarResult = astar(maze, start, goal);
    
    return NextResponse.json({
      path: result.path,
      pathLength: result.path.length,
      visitedCount: result.visitedCount,
      visitedNodes: result.visitedNodes,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        path: [],
        pathLength: 0,
        visitedCount: 0,
        visitedNodes: [],
        error: 'Invalid request' 
      }, 
      { status: 400 }
    );
  }
}