// Jest setup file for additional configuration
// This file is executed before each test file

// Mock WebSocket for tests
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 1; // OPEN
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;
  }

  send(data) {
    // Mock send method
  }

  close() {
    // Mock close method
  }
};

// Mock environment variables
process.env.NEXT_PUBLIC_WS_URL = "ws://localhost:8080";

// Mock toast notifications
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
  Toaster: () => null,
}));
