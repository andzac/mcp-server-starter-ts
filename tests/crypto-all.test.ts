import assert from "node:assert";
import { describe, it } from "node:test";
import { 
  withTestClient,
  assertJSONResource 
} from "./helpers/test-client.ts";

describe("Crypto All Resource Integration Tests", () => {
  it("should list crypto-all resource", async () => {
    await withTestClient(async (client) => {
      const response = await client.listResources();
      const resourceUris = response.resources.map(r => r.uri);
      
      assert(resourceUris.includes("crypto-all://info"), "Crypto All resource should be listed");
      
      const resource = response.resources.find(r => r.uri === "crypto-all://info");
      assert.strictEqual(resource?.name, "Crypto All");
      assert.strictEqual(resource?.description, "Get top 100 cryptocurrencies by market cap from CoinGecko API");
    });
  });

  it("should read crypto-all resource content", async () => {
    await withTestClient(async (client) => {
      const response = await client.readResource("crypto-all://info");
      
      const data = assertJSONResource(
        response,
        "crypto-all://info",
        (parsed: unknown) => {
          assert(typeof parsed === "object" && parsed !== null, "Response should be an object");
          
          const obj = parsed as Record<string, unknown>;
          assert.strictEqual(obj.message, "This is the crypto-all resource", "Should have expected message");
          assert(typeof obj.timestamp === "string", "Should have timestamp string");
        }
      );
      
      assert(data !== undefined, "Resource data should be defined");
    });
  });

  it("should return valid JSON format", async () => {
    await withTestClient(async (client) => {
      const response = await client.readResource("crypto-all://info");
      
      assert(response.contents !== undefined, "Response should have contents");
      assert(response.contents.length > 0, "Response should have at least one content item");
      
      const content = response.contents[0];
      assert(content !== undefined, "First content item should exist");
      assert.strictEqual(content.mimeType, "application/json", "Content should be JSON");
      
      // Verify it's valid JSON
      assert.doesNotThrow(() => {
        if (content.text) {
          JSON.parse(content.text);
        }
      }, "Content should be valid JSON");
    });
  });
});