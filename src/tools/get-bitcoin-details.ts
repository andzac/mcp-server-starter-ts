/**
 * @module Tools/GetBitcoinDetails
 * @category Tools
 */

import { z } from "zod";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";

/**
 * Get current Bitcoin market data and statistics from CoinGecko API
 * 
 * @example
 * ```typescript
 * // Usage in MCP client
 * const result = await client.callTool("get-bitcoin-details", { 
 *   input: "example input" 
 * });
 * ```
 */
const getBitcoinDetailsModule: RegisterableModule = {
  type: "tool",
  name: "get-bitcoin-details",
  description: "Get current Bitcoin market data and statistics from CoinGecko API",
  register(server: McpServer) {
    server.tool(
      "get-bitcoin-details",
      "Get current Bitcoin market data and statistics from CoinGecko API",
      {},
      async () => {
        const resourceData = {
          response: await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
              vs_currency: 'usd',
              order: 'market_cap_desc',
              per_page: 100,
              page: 1,
              sparkline: false,
              ids: 'bitcoin'
            },
            timeout: 10000, // 10 second timeout
          }).catch(function (error) {
            console.log(error.response.status);
            console.log(error.response.headers);
            throw new Error(error.toJSON)
          })
        }

        if (!resourceData.response.data || !Array.isArray(resourceData.response.data)) {
          throw new Error('Invalid response format from CoinGecko API');
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(resourceData.response.data[0], null, 2),
            },
          ],
        };
      }
    );
  }
};

export default getBitcoinDetailsModule;