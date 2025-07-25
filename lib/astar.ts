export type Point = {
  row: number;
  col: number;
};

export type AstarResult = {
  path: Point[];
  visitedCount: number;
  visitedNodes: string[];
};

// Removed unused Node type

const directions: Point[] = [
  { row: -1, col: 0 }, // up
  { row: 1, col: 0 },  // down
  { row: 0, col: -1 }, // left
  { row: 0, col: 1 },  // right
];

function heuristic(a: Point, b: Point): number {
  // Manhattan distance
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// Removed unused helper functions

export function astar(
  maze: boolean[][], 
  start: Point, 
  goal: Point, 
  onVisit?: (node: Point) => void
): AstarResult {
  const numRows = maze.length;
  const numCols = maze[0].length;

  function isValid(row: number, col: number): boolean {
    return (
      row >= 0 &&
      row < numRows &&
      col >= 0 &&
      col < numCols &&
      maze[row][col] === false
    );
  }

  const openSet: Point[] = [];
  openSet.push(start);

  const cameFrom = new Map<string, string>();

  const gScore: number[][] = Array(numRows)
    .fill(0)
    .map(() => Array(numCols).fill(Infinity));
  gScore[start.row][start.col] = 0;

  const fScore: number[][] = Array(numRows)
    .fill(0)
    .map(() => Array(numCols).fill(Infinity));
  fScore[start.row][start.col] = heuristic(start, goal);

  const visitedNodes = new Set<string>();

  while (openSet.length > 0) {
    openSet.sort((a, b) => fScore[a.row][a.col] - fScore[b.row][b.col]);
    const current = openSet.shift()!;

    visitedNodes.add(`${current.row},${current.col}`);
    if (onVisit) onVisit(current);

    if (current.row === goal.row && current.col === goal.col) {
      const path: Point[] = [];
      let temp = `${current.row},${current.col}`;
      while (cameFrom.has(temp)) {
        const [r, c] = temp.split(",").map(Number);
        path.push({ row: r, col: c });
        temp = cameFrom.get(temp)!;
      }
      path.push(start);
      path.reverse();
      return { 
        path, 
        visitedCount: visitedNodes.size, 
        visitedNodes: Array.from(visitedNodes) 
      };
    }

    for (const offset of directions) {
      const neighborRow = current.row + offset.row;
      const neighborCol = current.col + offset.col;

      if (!isValid(neighborRow, neighborCol)) continue;

      const tentativeGScore = gScore[current.row][current.col] + 1;

      if (tentativeGScore < gScore[neighborRow][neighborCol]) {
        cameFrom.set(`${neighborRow},${neighborCol}`, `${current.row},${current.col}`);
        gScore[neighborRow][neighborCol] = tentativeGScore;
        fScore[neighborRow][neighborCol] =
          tentativeGScore + heuristic({ row: neighborRow, col: neighborCol }, goal);

        if (
          !openSet.some((n) => n.row === neighborRow && n.col === neighborCol)
        ) {
          openSet.push({ row: neighborRow, col: neighborCol });
        }
      }
    }
  }

  // No path found
  return { 
    path: [], 
    visitedCount: visitedNodes.size, 
    visitedNodes: Array.from(visitedNodes) 
  };
}
