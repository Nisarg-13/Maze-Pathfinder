// Simple test script to verify the POST /solve endpoint works
const http = require("http");

const testData = {
  maze: [
    [false, false, false],
    [false, true, false],
    [false, false, false],
  ],
  start: { row: 0, col: 0 },
  goal: { row: 2, col: 2 },
};

const postData = JSON.stringify(testData);

const options = {
  hostname: "localhost",
  port: 8080,
  path: "/solve",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
  },
};

console.log("Testing POST /solve endpoint...");
console.log("Make sure server is running with: npm run server");
console.log("\nSending request:", JSON.stringify(testData, null, 2));

const req = http.request(options, (res) => {
  console.log("\n=== Response ===");
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    try {
      const response = JSON.parse(data);
      console.log("\nResponse body:", JSON.stringify(response, null, 2));

      if (response.success && response.path && response.path.length > 0) {
        console.log("\n✅ POST /solve endpoint is working correctly!");
        console.log(`Found path with ${response.pathLength} steps`);
        console.log(`Visited ${response.visitedCount} nodes`);
      } else {
        console.log("\n⚠️ Endpoint responded but no path found");
      }
    } catch (error) {
      console.log("\n❌ Error parsing response:", error.message);
      console.log("Raw response:", data);
    }
  });
});

req.on("error", (error) => {
  console.log("\n❌ Request failed:", error.message);
  console.log("Make sure the server is running on port 8080");
});

req.write(postData);
req.end();
