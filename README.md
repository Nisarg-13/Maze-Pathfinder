# Maze Pathfinder

A modern, interactive Next.js application that visualizes the shortest path through a maze using the A* algorithm. Features a responsive 20x20 grid, real-time solving animation via WebSocket, toast notifications, and enhanced UI with visual indicators.

## ✨ Features

### 🎮 Interactive Grid Editor
- **20x20 responsive grid**: Optimized for all screen sizes
- **Multiple editing modes**: Set start point, goal point, or draw walls
- **Visual mode indicators**: Color-coded buttons with icons
- **One-click cell editing**: Toggle walls or place points instantly
- **Clear grid function**: Reset entire maze with one click

### 🚀 Advanced Pathfinding
- **A* algorithm implementation**: Pure TypeScript, no external libraries
- **Real-time visualization**: Watch the algorithm explore the maze
- **Live animation controls**: Solve, pause, resume, and restart
- **Adjustable animation speed**: Control visualization speed (50ms - 1000ms)
- **Path length calculation**: Accurate step counting (excludes starting node)
- **Visited node tracking**: See how many nodes the algorithm explored

### 🍞 Modern User Experience
- **Toast notifications**: Non-intrusive feedback instead of alert popups
- **Success/error states**: Clear feedback for all operations
- **Path not found detection**: Intelligent handling when no route exists
- **Professional UI**: Minimalist design with functional visual indicators
- **Responsive design**: Works perfectly on desktop, tablet, and mobile

### 🔧 Technical Features
- **WebSocket communication**: Real-time bidirectional communication
- **REST API endpoint**: Programmatic solving via POST /api/solve
- **TypeScript throughout**: Full type safety and IntelliSense
- **Modern React patterns**: Hooks, functional components, and clean architecture
- **Comprehensive testing**: Jest tests for core algorithm functionality

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with WebSocket support

### Installation & Setup

#### 1. Install dependencies
```bash
npm install
```

#### 2. Start the WebSocket backend
```bash
# Production mode
npm run server

# Development mode (recommended - auto-restart on changes)
npm run server:dev
```
This starts the WebSocket server on `ws://localhost:8080` for real-time animation.

#### 3. Start the Next.js frontend
```bash
npm run dev
```
This starts the frontend on `http://localhost:3000`

#### 4. Open your browser
Navigate to `http://localhost:3000` and start creating mazes!

### Development Commands

#### Run tests
```bash
npm test
# or
npx jest
```

#### Build for production
```bash
npm run build
```

#### Lint code
```bash
npm run lint
```

## 🏗️ Architecture Overview

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript for full type safety
- **Styling**: TailwindCSS for responsive design
- **Notifications**: react-hot-toast for modern UX
- **Main Component**: `components/Grid.tsx` - Interactive maze grid

### Backend Services
- **WebSocket Server**: (`server.ts`) Real-time communication for live animation
  - Receives maze configuration and solving parameters
  - Streams pathfinding progress with visited nodes
  - Sends final path and statistics
- **A* Algorithm**: (`lib/astar.ts`) Pure TypeScript implementation
  - No external pathfinding dependencies
  - Optimized for visualization and performance
  - Comprehensive heuristic calculations
- **REST API**: (`app/api/solve/route.ts`) HTTP endpoint for programmatic access
  - POST requests with maze data
  - Returns complete solution as JSON

### Quality Assurance
- **Testing**: Jest unit tests for algorithm correctness (`lib/astar.test.ts`)
- **Linting**: ESLint for code quality and consistency
- **Formatting**: Prettier for code style enforcement
- **Type Safety**: Full TypeScript coverage with strict mode

## 🎯 How to Use

### Basic Operation
1. **Set Start Point**: Click the green "Set Start Point" button, then click a cell
2. **Set Goal Point**: Click the red "Set Goal Point" button, then click a cell
3. **Draw Walls**: Click the blue "Draw Walls" button, then click/drag to create obstacles
4. **Solve Maze**: Click the purple "Solve Maze" button to start pathfinding
5. **Control Animation**: Use pause/resume buttons to control the visualization

### Advanced Features
- **Animation Speed**: Adjust the slider to control visualization speed
- **Pause & Resume**: Interrupt solving and continue from where you left off
- **Restart**: Start fresh pathfinding from the beginning
- **Clear Grid**: Reset the entire maze to start over

### Understanding Results
- **Green Path**: The shortest route found by the algorithm
- **Yellow Cells**: Nodes visited during the search process
- **Path Length**: Number of steps in the solution (excluding start)
- **Visited Count**: Total nodes explored by the algorithm
- **Toast Notifications**: Success/error feedback with detailed information

## 📁 Project Structure

```
maze-pathfinder/
├── app/                    # Next.js App Router
│   ├── api/solve/         # REST API endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   └── grid.tsx          # Main maze grid component
├── lib/                   # Core algorithms and utilities
│   ├── astar.ts          # A* pathfinding algorithm
│   └── astar.test.ts     # Algorithm unit tests
├── server.ts             # WebSocket server
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🛠️ Technology Stack

### Core Technologies
- **Next.js 15**: React framework with App Router
- **TypeScript**: Static type checking and enhanced developer experience
- **TailwindCSS**: Utility-first CSS framework for responsive design
- **WebSocket**: Real-time bidirectional communication
- **Jest**: JavaScript testing framework

### Key Dependencies
- **react-hot-toast**: Modern toast notifications
- **ws**: WebSocket library for Node.js
- **@types/ws**: TypeScript definitions for WebSocket

### Development Tools
- **ESLint**: Code linting and quality enforcement
- **Prettier**: Code formatting and style consistency
- **nodemon**: Development server with auto-restart
- **TypeScript**: Compile-time type checking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- A* algorithm implementation inspired by classic pathfinding research
- UI/UX design principles from modern web applications
- WebSocket integration patterns from real-time application best practices
