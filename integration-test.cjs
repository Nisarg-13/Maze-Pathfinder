// Integration test script demonstrating all features
const http = require("http");

console.log("🧪 MAZE PATHFINDER - INTEGRATION TESTS");
console.log("=====================================\n");

// Test data for different scenarios
const testCases = [
  {
    name: "Simple 3x3 maze with clear path",
    data: {
      maze: [
        [false, false, false],
        [false, true, false],
        [false, false, false],
      ],
      start: { row: 0, col: 0 },
      goal: { row: 2, col: 2 },
    },
    expectedPath: true,
  },
  {
    name: "No path scenario - blocked goal",
    data: {
      maze: [
        [false, true, false],
        [true, true, true],
        [false, true, false],
      ],
      start: { row: 0, col: 0 },
      goal: { row: 2, col: 2 },
    },
    expectedPath: false,
  },
  {
    name: "Same start and goal position",
    data: {
      maze: [
        [false, false],
        [false, false],
      ],
      start: { row: 0, col: 0 },
      goal: { row: 0, col: 0 },
    },
    expectedPath: true,
  },
];

// Test configurations
const servers = [
  {
    name: "Standalone Server",
    host: "localhost",
    port: 8080,
    path: "/solve",
  },
  {
    name: "Next.js API Route",
    host: "localhost",
    port: 3000,
    path: "/api/solve",
  },
];

let currentServerIndex = 0;
let currentTestIndex = 0;
let totalTests = 0;
let passedTests = 0;

function runTest(server, testCase) {
  return new Promise((resolve) => {
    const postData = JSON.stringify(testCase.data);

    const options = {
      hostname: server.host,
      port: server.port,
      path: server.path,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
      timeout: 5000,
    };

    console.log(`📡 Testing: ${server.name} - ${testCase.name}`);

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        totalTests++;

        try {
          const response = JSON.parse(data);

          if (res.statusCode === 200 && response.success !== undefined) {
            const hasPath = response.path && response.path.length > 0;

            if (hasPath === testCase.expectedPath) {
              console.log(
                `   ✅ PASS - Status: ${res.statusCode}, Path: ${hasPath}, Length: ${response.pathLength || 0}`
              );
              passedTests++;
            } else {
              console.log(
                `   ❌ FAIL - Expected path: ${testCase.expectedPath}, Got: ${hasPath}`
              );
            }
          } else {
            console.log(
              `   ❌ FAIL - Status: ${res.statusCode}, Response: ${JSON.stringify(response)}`
            );
          }
        } catch (error) {
          console.log(`   ❌ FAIL - Parse error: ${error.message}`);
        }

        resolve();
      });
    });

    req.on("error", (error) => {
      totalTests++;
      console.log(`   ❌ FAIL - Request error: ${error.message}`);
      resolve();
    });

    req.on("timeout", () => {
      totalTests++;
      console.log(`   ❌ FAIL - Request timeout`);
      req.destroy();
      resolve();
    });

    req.write(postData);
    req.end();
  });
}

async function runAllTests() {
  console.log("🚀 Starting integration tests...\n");

  for (const server of servers) {
    console.log(
      `\n🔧 Testing ${server.name} (${server.host}:${server.port}${server.path})`
    );
    console.log("-".repeat(50));

    for (const testCase of testCases) {
      await runTest(server, testCase);
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log(`\n📊 TEST SUMMARY`);
  console.log("===============");
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(
    `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
  );

  if (passedTests === totalTests) {
    console.log("\n🎉 ALL TESTS PASSED! Integration is working correctly.");
  } else {
    console.log(
      "\n⚠️  Some tests failed. Check server availability and configurations."
    );
  }

  console.log("\n💡 To run servers:");
  console.log("   Standalone: npm run server");
  console.log("   Next.js:    npm run dev");
}

// Health check first
function healthCheck() {
  console.log("🔍 Performing health checks...\n");

  const healthOptions = {
    hostname: "localhost",
    port: 8080,
    path: "/health",
    method: "GET",
    timeout: 2000,
  };

  const healthReq = http.request(healthOptions, (res) => {
    if (res.statusCode === 200) {
      console.log("✅ Standalone server health check passed");
    } else {
      console.log("⚠️  Standalone server health check failed");
    }
    runAllTests();
  });

  healthReq.on("error", () => {
    console.log("⚠️  Standalone server not running - will test anyway");
    runAllTests();
  });

  healthReq.on("timeout", () => {
    console.log("⚠️  Standalone server health check timeout");
    runAllTests();
  });

  healthReq.end();
}

// Start the integration tests
healthCheck();
