import assert from "node:assert";
import { describe, it } from "node:test";
import { 
  withTestClient, 
  assertToolResponse,
  assertToolError 
} from "./helpers/test-client.ts";

describe("Get Crypto By Name Tool Integration Tests", () => {
  it("should list get-crypto-by-name tool", async () => {
    await withTestClient(async (client) => {
      const response = await client.listTools();
      const toolNames = response.tools.map(t => t.name);
      
      assert(toolNames.includes("get-crypto-by-name"), "Get Crypto By Name tool should be listed");
      
      const tool = response.tools.find(t => t.name === "get-crypto-by-name");
      assert.strictEqual(tool?.description, "Search for cryptocurrency data by name or symbol");
    });
  });

  it("should process valid input", async () => {
    await withTestClient(async (client) => {
      const testInput = "Test input";
      const response = await client.callTool("get-crypto-by-name", { input: testInput });
      
      assertToolResponse(response, `Processed: ${testInput}`);
    });
  });

  it("should handle special characters", async () => {
    await withTestClient(async (client) => {
      const testInput = "Special chars: @#$%^&*() 🚀";
      const response = await client.callTool("get-crypto-by-name", { input: testInput });
      
      assertToolResponse(response, `Processed: ${testInput}`);
    });
  });

  it("should reject missing input parameter", async () => {
    await withTestClient(async (client) => {
      await assertToolError(
        client.callTool("get-crypto-by-name", {}),
        undefined,
        "Should reject missing input parameter"
      );
    });
  });
});