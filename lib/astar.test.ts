import { astar, Point, AstarResult } from './astar';

describe('astar', () => {
  it('finds the shortest path in a simple maze', () => {
    // 3x3 maze, no walls
    const maze: boolean[][] = [
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ];
    const start: Point = { row: 0, col: 0 };
    const goal: Point = { row: 2, col: 2 };
    const result: AstarResult = astar(maze, start, goal);
    // The shortest path should be 5 steps (0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2)
    expect(result.path.length).toBeGreaterThan(0);
    expect(result.path[0]).toEqual(start);
    expect(result.path[result.path.length - 1]).toEqual(goal);
    expect(result.visitedCount).toBeGreaterThan(0);
    expect(result.visitedNodes).toContain('2,2');
  });

  it('returns empty path if no path exists', () => {
    // 3x3 maze, wall blocks the way
    const maze: boolean[][] = [
      [false, true, false],
      [false, true, false],
      [false, true, false],
    ];
    const start: Point = { row: 0, col: 0 };
    const goal: Point = { row: 2, col: 2 };
    const result: AstarResult = astar(maze, start, goal);
    expect(result.path.length).toBe(0);
  });

  it('calls onVisit callback for each visited node', () => {
    const maze: boolean[][] = [
      [false, false, false],
      [false, false, false],
      [false, false, false],
    ];
    const start: Point = { row: 0, col: 0 };
    const goal: Point = { row: 2, col: 2 };
    const visitedNodes: Point[] = [];
    
    const onVisit = (node: Point) => {
      visitedNodes.push(node);
    };
    
    const result: AstarResult = astar(maze, start, goal, onVisit);
    expect(visitedNodes.length).toBeGreaterThan(0);
    expect(visitedNodes[0]).toEqual(start);
    expect(result.path.length).toBeGreaterThan(0);
  });
}); 