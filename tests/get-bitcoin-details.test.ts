import assert from "node:assert";
import { describe, it } from "node:test";
import { 
  withTestClient, 
  assertToolResponse,
  assertToolError 
} from "./helpers/test-client.ts";

describe("Get Bitcoin Details Tool Integration Tests", () => {
  it("should list get-bitcoin-details tool", async () => {
    await withTestClient(async (client) => {
      const response = await client.listTools();
      const toolNames = response.tools.map(t => t.name);
      
      assert(toolNames.includes("get-bitcoin-details"), "Get Bitcoin Details tool should be listed");
      
      const tool = response.tools.find(t => t.name === "get-bitcoin-details");
      assert.strictEqual(tool?.description, "Get current Bitcoin market data and statistics from CoinGecko API");
    });
  });

  it("should process valid input", async () => {
    await withTestClient(async (client) => {
      const testInput = "Test input";
      const response = await client.callTool("get-bitcoin-details", { input: testInput });
      
      assertToolResponse(response, `Processed: ${testInput}`);
    });
  });

  it("should handle special characters", async () => {
    await withTestClient(async (client) => {
      const testInput = "Special chars: @#$%^&*() 🚀";
      const response = await client.callTool("get-bitcoin-details", { input: testInput });
      
      assertToolResponse(response, `Processed: ${testInput}`);
    });
  });

  it("should reject missing input parameter", async () => {
    await withTestClient(async (client) => {
      await assertToolError(
        client.callTool("get-bitcoin-details", {}),
        undefined,
        "Should reject missing input parameter"
      );
    });
  });
});