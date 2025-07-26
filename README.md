# 🧩 Maze Pathfinder

A modern, interactive Next.js application that visualizes pathfinding through a maze using the A\* algorithm. Features a responsive design, real-time solving animation via WebSocket, and an intuitive user interface.

## ✨ Features

### 🎮 Interactive Maze Editor

- **20x20 responsive grid**: Optimized for all screen sizes (mobile, tablet, desktop)
- **Multiple editing modes**: Set start point, goal point, or draw walls
- **Visual mode indicators**: Color-coded buttons for easy identification
- **One-click cell editing**: Toggle walls or place points instantly
- **Clear grid function**: Reset entire maze with one click

### 🚀 Advanced Pathfinding

- **A\* algorithm implementation**: Pure TypeScript implementation
- **Real-time visualization**: Watch the algorithm explore the maze step by step
- **Live animation controls**: Solve, pause, resume, and restart functionality
- **Adjustable animation speed**: Control visualization speed (10ms - 500ms)
- **Statistics tracking**: Path length and visited nodes count
- **Path not found detection**: Intelligent handling when no route exists

### 📱 Responsive Design

- **Mobile-first approach**: Optimized touch interactions
- **Adaptive layout**:
  - **Desktop**: Left controls, center grid, right statistics
  - **Mobile**: Stacked layout with bottom statistics
- **Touch-friendly**: Proper touch targets and gesture handling
- **Cross-device compatibility**: Works on phones, tablets, and desktops

### 🎨 Modern User Experience

- **Toast notifications**: Non-intrusive feedback for user actions
- **Professional UI**: Dark theme with gradient backgrounds
- **Real-time statistics**: Live updates of path length and visited nodes
- **Visual legend**: Color-coded explanation of grid elements

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with WebSocket support

### Installation & Setup

#### 1. Clone the repository

```bash
git clone <repository-url>
cd maze-pathfinder
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Start the WebSocket server

```bash
# Development mode (recommended - auto-restart on changes)
npm run server:dev

# or production mode
npm run server
```

This starts the WebSocket server on `ws://localhost:8080` for real-time pathfinding animation.

#### 4. Start the Next.js frontend

```bash
npm run dev
```

This starts the frontend on `http://localhost:3000`

#### 5. Open your browser

Navigate to `http://localhost:3000` and start creating mazes!

### Development Commands

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Check code formatting
npm run format:check

# Format code automatically
npm run format

# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix
```

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

- **🟢 Green Cell**: Start point
- **🔴 Red Cell**: Goal point
- **⬛ Dark Cell**: Wall/obstacle
- **🟡 Yellow Cells**: Nodes visited during search
- **🟣 Purple Cells**: Final shortest path
- **Statistics**: Path length (steps) and total visited nodes

## 🏗️ Project Structure

```
maze-pathfinder/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and grid CSS
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Main page component
├── components/            # React components
│   └── Grid.tsx          # Main maze grid component
├── lib/                   # Core algorithms
│   └── astar.ts          # A* pathfinding algorithm
├── server.ts             # WebSocket server for real-time communication
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── vercel.json           # Vercel deployment configuration
├── railway.json          # Railway deployment configuration
└── README.md            # This file
```

## 🛠️ Technology Stack

### Core Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Static type checking and enhanced development experience
- **TailwindCSS 4**: Utility-first CSS framework for responsive design
- **WebSocket**: Real-time bidirectional communication for live animation
- **React Hot Toast**: Modern toast notifications

### Development & Quality Assurance

- **Jest**: Unit testing framework with comprehensive test coverage
- **ESLint**: Code linting with Next.js and Prettier integration
- **Prettier**: Automatic code formatting for consistent style
- **REST API**: POST /solve endpoint for synchronous pathfinding requests

### Architecture

- **Frontend**: Next.js with TypeScript and TailwindCSS
- **Backend**: WebSocket server using Node.js and `ws` library
- **REST API**: Next.js API routes for synchronous pathfinding
- **Algorithm**: Pure TypeScript A\* implementation
- **Testing**: Jest with comprehensive unit tests
- **Code Quality**: ESLint + Prettier for consistent formatting
- **Deployment**: Frontend on Vercel, Backend on Railway

## 🔌 API Endpoints

### WebSocket Connection

- **URL**: `ws://localhost:8080`
- **Purpose**: Real-time pathfinding animation
- **Messages**: `solve`, `pause`, `resume`, `stop`

### REST API

#### POST /solve (Standalone Server)

Synchronous pathfinding without real-time animation.

**Request Body:**

```json
{
  "maze": [
    [false, false],
    [false, false]
  ],
  "start": { "row": 0, "col": 0 },
  "goal": { "row": 1, "col": 1 }
}
```

**Response:**

```json
{
  "success": true,
  "path": [
    { "row": 0, "col": 0 },
    { "row": 0, "col": 1 },
    { "row": 1, "col": 1 }
  ],
  "pathLength": 2,
  "visitedCount": 3,
  "visitedNodes": ["0,0", "0,1", "1,1"],
  "hasPath": true,
  "message": "Path found with 2 steps"
}
```

**Testing the API:**

```bash
# Start the server
npm run server

# Test the endpoint
node test-server.cjs
```

#### POST /api/solve (Next.js API Route)

Next.js API route version of the solve endpoint.

```bash
curl -X POST http://localhost:3000/api/solve \
  -H "Content-Type: application/json" \
  -d '{
    "maze": [[false, false], [false, false]],
    "start": {"row": 0, "col": 0},
    "goal": {"row": 1, "col": 1}
  }'
```

## 🌐 Live Demo

The application is deployed and available at:

- **Frontend**: [Vercel Deployment](https://your-vercel-url.vercel.app)
- **Backend**: Railway WebSocket Server

## 📱 Mobile Experience

### Responsive Features

- **Touch-optimized grid**: Proper touch targets for mobile devices
- **Mobile-first layout**: Controls and statistics adapted for small screens
- **Gesture support**: Tap to place points and walls
- **Portrait/landscape**: Optimized for both orientations
- **Performance**: Smooth animations on mobile devices

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variable: `NEXT_PUBLIC_WS_URL=wss://your-railway-domain.up.railway.app`
3. Deploy automatically on push to main branch

### Backend (Railway)

1. Connect your GitHub repository to Railway
2. Deploy the WebSocket server using `server.ts`
3. Use the provided Railway URL for WebSocket connections

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- A\* algorithm implementation inspired by classic pathfinding research
- UI/UX design principles from modern web applications
- WebSocket integration patterns for real-time applications
- Responsive design patterns for cross-device compatibility

---

**Built with ❤️ using Next.js, TypeScript, and TailwindCSS**
