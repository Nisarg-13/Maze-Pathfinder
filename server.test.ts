import { astar, Point } from "./lib/astar";

// Test the server's POST /solve logic independently
describe("Server POST /solve Logic", () => {
  describe("Input Validation", () => {
    test("should validate valid maze format", () => {
      const validMaze = [
        [false, false],
        [false, false],
      ];

      expect(() => {
        if (
          !validMaze ||
          !Array.isArray(validMaze) ||
          validMaze.length === 0 ||
          !Array.isArray(validMaze[0])
        ) {
          throw new Error("Invalid maze format");
        }
      }).not.toThrow();
    });

    test("should invalidate empty array", () => {
      const invalidMaze: any = [];

      expect(() => {
        if (
          !invalidMaze ||
          !Array.isArray(invalidMaze) ||
          invalidMaze.length === 0 ||
          !Array.isArray(invalidMaze[0])
        ) {
          throw new Error("Invalid maze format");
        }
      }).toThrow("Invalid maze format");
    });

    test("should validate start/goal points format", () => {
      const invalidPoints = [
        undefined,
        null,
        {},
        { row: "a", col: 1 },
        { row: 1, col: "b" },
        { row: 1 }, // missing col
        { col: 1 }, // missing row
      ];

      invalidPoints.forEach((point) => {
        expect(() => {
          if (
            !point ||
            typeof point.row !== "number" ||
            typeof point.col !== "number"
          ) {
            throw new Error("Invalid point format");
          }
        }).toThrow("Invalid point format");
      });
    });

    test("should validate bounds checking", () => {
      const maze = [
        [false, false],
        [false, false],
      ];

      const outOfBoundsPoints = [
        { row: -1, col: 0 },
        { row: 0, col: -1 },
        { row: 2, col: 0 },
        { row: 0, col: 2 },
        { row: 2, col: 2 },
      ];

      outOfBoundsPoints.forEach((point) => {
        expect(() => {
          const numRows = maze.length;
          const numCols = maze[0].length;

          if (
            point.row < 0 ||
            point.row >= numRows ||
            point.col < 0 ||
            point.col >= numCols
          ) {
            throw new Error("Point out of bounds");
          }
        }).toThrow("Point out of bounds");
      });
    });

    test("should validate wall placement", () => {
      const maze = [
        [true, false], // Wall at (0,0)
        [false, true], // Wall at (1,1)
      ];

      const wallPoints = [
        { row: 0, col: 0 },
        { row: 1, col: 1 },
      ];

      wallPoints.forEach((point) => {
        expect(() => {
          if (maze[point.row][point.col] === true) {
            throw new Error("Point cannot be on a wall");
          }
        }).toThrow("Point cannot be on a wall");
      });
    });
  });

  describe("Response Format", () => {
    test("should return correct response structure for successful pathfinding", () => {
      const maze = [
        [false, false],
        [false, false],
      ];
      const start: Point = { row: 0, col: 0 };
      const goal: Point = { row: 1, col: 1 };

      const result = astar(maze, start, goal);

      const response = {
        success: true,
        path: result.path,
        pathLength: Math.max(0, result.path.length - 1),
        visitedCount: result.visitedCount,
        visitedNodes: result.visitedNodes,
        hasPath: result.path.length > 0,
        message:
          result.path.length > 0
            ? `Path found with ${result.path.length - 1} steps`
            : "No path found between start and goal",
      };

      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("path");
      expect(response).toHaveProperty("pathLength");
      expect(response).toHaveProperty("visitedCount");
      expect(response).toHaveProperty("visitedNodes");
      expect(response).toHaveProperty("hasPath");
      expect(response).toHaveProperty("message");

      expect(Array.isArray(response.path)).toBe(true);
      expect(typeof response.pathLength).toBe("number");
      expect(typeof response.visitedCount).toBe("number");
      expect(Array.isArray(response.visitedNodes)).toBe(true);
      expect(typeof response.hasPath).toBe("boolean");
      expect(typeof response.message).toBe("string");
    });

    test("should return correct response for no path scenario", () => {
      const maze = [
        [false, true, false],
        [true, true, true],
        [false, true, false],
      ];
      const start: Point = { row: 0, col: 0 };
      const goal: Point = { row: 2, col: 2 };

      const result = astar(maze, start, goal);

      const response = {
        success: true,
        path: result.path,
        pathLength: Math.max(0, result.path.length - 1),
        visitedCount: result.visitedCount,
        visitedNodes: result.visitedNodes,
        hasPath: result.path.length > 0,
        message:
          result.path.length > 0
            ? `Path found with ${result.path.length - 1} steps`
            : "No path found between start and goal",
      };

      expect(response.success).toBe(true);
      expect(response.path).toHaveLength(0);
      expect(response.pathLength).toBe(0);
      expect(response.hasPath).toBe(false);
      expect(response.message).toBe("No path found between start and goal");
      expect(response.visitedCount).toBeGreaterThan(0);
    });
  });

  describe("Path Length Calculation", () => {
    test("should exclude start node from path length", () => {
      const maze = [[false, false, false]];
      const start: Point = { row: 0, col: 0 };
      const goal: Point = { row: 0, col: 2 };

      const result = astar(maze, start, goal);

      // Path should be [(0,0), (0,1), (0,2)] = 3 nodes
      // But path length should be 2 steps (excluding start)
      expect(result.path).toHaveLength(3);

      const pathLength = Math.max(0, result.path.length - 1);
      expect(pathLength).toBe(2);
    });

    test("should handle zero path length for same start/goal", () => {
      const maze = [[false]];
      const start: Point = { row: 0, col: 0 };
      const goal: Point = { row: 0, col: 0 };

      const result = astar(maze, start, goal);

      expect(result.path).toHaveLength(1);

      const pathLength = Math.max(0, result.path.length - 1);
      expect(pathLength).toBe(0);
    });
  });
});
