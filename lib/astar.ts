// Define the structure for a point in the grid
export type Point = {
  row: number;
  col: number;
};

// Define the result structure returned by the A* algorithm
export type AstarResult = {
  path: Point[];
  visitedCount: number;
  visitedNodes: string[];
};

// Define the four possible movement directions (up, down, left, right)
const directions: Point[] = [
  { row: -1, col: 0 }, // up
  { row: 1, col: 0 }, // down
  { row: 0, col: -1 }, // left
  { row: 0, col: 1 }, // right
];

// Calculate Manhattan distance between two points
// This is used as the heuristic function for A* algorithm
function heuristic(a: Point, b: Point): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

// Main A* pathfinding algorithm implementation
export function astar(
  maze: boolean[][],
  start: Point,
  goal: Point,
  onVisit?: (node: Point) => void
): AstarResult {
  // Get maze dimensions
  const numRows = maze.length;
  const numCols = maze[0].length;

  // Check if a position is valid (within bounds and not a wall)
  function isValid(row: number, col: number): boolean {
    return (
      row >= 0 &&
      row < numRows &&
      col >= 0 &&
      col < numCols &&
      maze[row][col] === false // false means empty cell, true means wall
    );
  }

  // Open set contains nodes to be evaluated
  const openSet: Point[] = [];
  openSet.push(start);

  // Map to track the path - stores parent of each node
  const cameFrom = new Map<string, string>();

  // gScore tracks the cost from start to each node
  const gScore: number[][] = Array(numRows)
    .fill(0)
    .map(() => Array(numCols).fill(Infinity));
  gScore[start.row][start.col] = 0;

  // fScore tracks the estimated total cost from start to goal through each node
  const fScore: number[][] = Array(numRows)
    .fill(0)
    .map(() => Array(numCols).fill(Infinity));
  fScore[start.row][start.col] = heuristic(start, goal);

  // Keep track of all visited nodes for visualization
  const visitedNodes = new Set<string>();

  // Main algorithm loop - continue until no more nodes to evaluate
  while (openSet.length > 0) {
    // Sort open set by fScore to get the most promising node
    openSet.sort((a, b) => fScore[a.row][a.col] - fScore[b.row][b.col]);
    const current = openSet.shift()!; // Get the node with lowest fScore

    // Mark current node as visited
    visitedNodes.add(`${current.row},${current.col}`);
    if (onVisit) onVisit(current); // Call callback for visualization

    // Check if we reached the goal
    if (current.row === goal.row && current.col === goal.col) {
      // Reconstruct the path by following the cameFrom chain
      const path: Point[] = [];
      let temp = `${current.row},${current.col}`;
      while (cameFrom.has(temp)) {
        const [r, c] = temp.split(",").map(Number);
        path.push({ row: r, col: c });
        temp = cameFrom.get(temp)!;
      }
      path.push(start);
      path.reverse(); // Reverse to get path from start to goal
      return {
        path,
        visitedCount: visitedNodes.size,
        visitedNodes: Array.from(visitedNodes),
      };
    }

    // Check all neighboring cells
    for (const offset of directions) {
      const neighborRow = current.row + offset.row;
      const neighborCol = current.col + offset.col;

      // Skip invalid neighbors (out of bounds or walls)
      if (!isValid(neighborRow, neighborCol)) continue;

      // Calculate tentative gScore for this neighbor
      const tentativeGScore = gScore[current.row][current.col] + 1;

      // If we found a better path to this neighbor
      if (tentativeGScore < gScore[neighborRow][neighborCol]) {
        // Record the path
        cameFrom.set(
          `${neighborRow},${neighborCol}`,
          `${current.row},${current.col}`
        );
        // Update scores
        gScore[neighborRow][neighborCol] = tentativeGScore;
        fScore[neighborRow][neighborCol] =
          tentativeGScore +
          heuristic({ row: neighborRow, col: neighborCol }, goal);

        // Add neighbor to open set if not already there
        if (
          !openSet.some((n) => n.row === neighborRow && n.col === neighborCol)
        ) {
          openSet.push({ row: neighborRow, col: neighborCol });
        }
      }
    }
  }

  // No path found - return empty result
  return {
    path: [],
    visitedCount: visitedNodes.size,
    visitedNodes: Array.from(visitedNodes),
  };
}
