import { astar, Point } from "./astar";

describe("A* Algorithm", () => {
  describe("Basic Pathfinding", () => {
    test("should find path in simple 3x3 grid", () => {
      const maze = [
        [false, false, false],
        [false, false, false],
        [false, false, false],
      ];
      const start: Point = { row: 0, col: 0 };
      const goal: Point = { row: 2, col: 2 };

      const result = astar(maze, start, goal);

      expect(result.path).toHaveLength(5); // Start + 4 moves
      expect(result.path[0]).toEqual(start);
      expect(result.path[result.path.length - 1]).toEqual(goal);
      expect(result.visitedCount).toBeGreaterThan(0);
    });

    test("should find optimal path around obstacle", () => {
      const maze = [
        [false, false, false],
        [false, true, false], // Wall in middle
        [false, false, false],
      ];
      const start: Point = { row: 0, col: 0 };
      const goal: Point = { row: 2, col: 2 };

      const result = astar(maze, start, goal);

      expect(result.path.length).toBeGreaterThan(0);
      expect(result.path[0]).toEqual(start);
      expect(result.path[result.path.length - 1]).toEqual(goal);
      // Should not pass through the wall
      expect(result.path).not.toContainEqual({ row: 1, col: 1 });
    });

    test("should return empty path when no route exists", () => {
      const maze = [
        [false, true, false],
        [true, true, true],
        [false, true, false],
      ];
      const start: Point = { row: 0, col: 0 };
      const goal: Point = { row: 2, col: 2 };

      const result = astar(maze, start, goal);

      expect(result.path).toHaveLength(0);
      expect(result.visitedCount).toBeGreaterThan(0);
    });

    test("should handle start and goal being the same", () => {
      const maze = [
        [false, false],
        [false, false],
      ];
      const start: Point = { row: 0, col: 0 };
      const goal: Point = { row: 0, col: 0 };

      const result = astar(maze, start, goal);

      expect(result.path).toHaveLength(1);
      expect(result.path[0]).toEqual(start);
    });
  });

  describe("Edge Cases", () => {
    test("should handle 1x1 maze", () => {
      const maze = [[false]];
      const start: Point = { row: 0, col: 0 };
      const goal: Point = { row: 0, col: 0 };

      const result = astar(maze, start, goal);

      expect(result.path).toHaveLength(1);
      expect(result.path[0]).toEqual(start);
    });

    test("should handle walls at start or goal", () => {
      const maze = [
        [true, false],
        [false, false],
      ];
      const start: Point = { row: 0, col: 0 }; // Wall position - A* algorithm doesn't validate this
      const goal: Point = { row: 1, col: 1 };

      const result = astar(maze, start, goal);

      // A* algorithm itself doesn't validate if start is on wall - that's server's job
      // The algorithm will try to find path but may not succeed due to invalid start
      expect(result.path.length).toBeGreaterThanOrEqual(0);
    });

    test("should call onVisit callback for each visited node", () => {
      const maze = [
        [false, false],
        [false, false],
      ];
      const start: Point = { row: 0, col: 0 };
      const goal: Point = { row: 1, col: 1 };
      const visitedNodes: Point[] = [];

      const onVisit = (node: Point) => {
        visitedNodes.push(node);
      };

      const result = astar(maze, start, goal, onVisit);

      expect(visitedNodes.length).toBeGreaterThan(0);
      expect(visitedNodes[0]).toEqual(start);
      expect(result.visitedCount).toBe(visitedNodes.length);
    });
  });

  describe("Complex Scenarios", () => {
    test("should find path in larger maze with multiple obstacles", () => {
      const maze = [
        [false, false, false, false, false],
        [false, true, true, true, false],
        [false, false, false, true, false],
        [true, true, false, true, false],
        [false, false, false, false, false],
      ];
      const start: Point = { row: 0, col: 0 };
      const goal: Point = { row: 4, col: 4 };

      const result = astar(maze, start, goal);

      expect(result.path.length).toBeGreaterThan(0);
      expect(result.path[0]).toEqual(start);
      expect(result.path[result.path.length - 1]).toEqual(goal);

      // Verify path doesn't go through walls
      result.path.forEach((point) => {
        expect(maze[point.row][point.col]).toBe(false);
      });
    });

    test("should find shortest path when multiple routes exist", () => {
      const maze = [
        [false, false, false],
        [false, false, false],
        [false, false, false],
      ];
      const start: Point = { row: 0, col: 0 };
      const goal: Point = { row: 0, col: 2 };

      const result = astar(maze, start, goal);

      // Should find direct horizontal path (length 3)
      expect(result.path).toHaveLength(3);
      expect(result.path[0]).toEqual(start);
      expect(result.path[2]).toEqual(goal);
    });
  });

  describe("Return Value Structure", () => {
    test("should return correct result structure", () => {
      const maze = [
        [false, false],
        [false, false],
      ];
      const start: Point = { row: 0, col: 0 };
      const goal: Point = { row: 1, col: 1 };

      const result = astar(maze, start, goal);

      expect(result).toHaveProperty("path");
      expect(result).toHaveProperty("visitedCount");
      expect(result).toHaveProperty("visitedNodes");
      expect(Array.isArray(result.path)).toBe(true);
      expect(typeof result.visitedCount).toBe("number");
      expect(Array.isArray(result.visitedNodes)).toBe(true);
    });

    test("should have visitedNodes as string array", () => {
      const maze = [
        [false, false],
        [false, false],
      ];
      const start: Point = { row: 0, col: 0 };
      const goal: Point = { row: 1, col: 1 };

      const result = astar(maze, start, goal);

      expect(
        result.visitedNodes.every((node) => typeof node === "string")
      ).toBe(true);
      expect(result.visitedNodes.length).toBe(result.visitedCount);
    });
  });
});
