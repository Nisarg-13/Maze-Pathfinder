# Maze Pathfinder

A Next.js application that visualizes pathfinding through a maze using the A* algorithm. Features an interactive grid editor and real-time solving animation via WebSocket.

## Project Overview

This application allows users to create custom mazes and watch the A* pathfinding algorithm solve them in real-time. The project consists of:

- Interactive 20x20 grid for maze creation
- A* pathfinding algorithm implementation
- Real-time visualization with WebSocket communication
- Responsive design for desktop and mobile devices

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- npm package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd maze-pathfinder
```

2. Install dependencies:
```bash
npm install
```

## Run Instructions

### Development Mode

1. Start the WebSocket server:
```bash
npm run server
```
This starts the WebSocket server on `ws://localhost:8080`

2. Start the Next.js development server:
```bash
npm run dev
```
This starts the frontend on `http://localhost:3000`

3. Open your browser and navigate to `http://localhost:3000`

### Production Mode

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run server` - Start WebSocket server
- `npm test` - Run unit tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## How to Use

1. Set a start point by clicking the green button and then clicking a grid cell
2. Set a goal point by clicking the red button and then clicking a grid cell
3. Draw walls by clicking the blue button and then clicking grid cells
4. Click "Solve Maze" to start the pathfinding visualization
5. Use "Clear Grid" to reset the maze

The algorithm will show visited nodes in yellow and the final path in purple.
