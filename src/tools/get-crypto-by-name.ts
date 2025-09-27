/**
 * @module Tools/GetCryptoByName
 * @category Tools
 */

import { z } from "zod";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";

/**
 * Search for cryptocurrency data by name or symbol
 * 
 * @example
 * ```typescript
 * // Usage in MCP client
 * const result = await client.callTool("get-crypto-by-name", { 
 *   input: "example input" 
 * });
 * ```
 */

const getCryptoByNameModule: RegisterableModule = {
  type: "tool",
  name: "get-crypto-by-name",
  description: "Search for cryptocurrency data by name or symbol",
  register(server: McpServer) {
    server.tool(
      "get-crypto-by-name",
      "Search for cryptocurrency data by name or symbol",
      {
        name: z.string().describe("Name or symbol of the cryptocurrency to search for")

      },
      async ({ name }) => {
        if (!name || name.trim().length === 0) {
          throw new Error('Cryptocurrency name cannot be empty');
        }
        const resourceData = {
          response: await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
              vs_currency: 'usd',
              order: 'market_cap_desc',
              per_page: 100,
              page: 1,
              sparkline: false
            },
            timeout: 10000, // 10 second timeout
          }).catch(function (error) {
            console.log(error.response.status);
            console.log(error.response.headers);
            throw new Error(error)
          })

        }

        if (!resourceData.response.data || !Array.isArray(resourceData.response.data)) {
          throw new Error('Invalid response format from CoinGecko API');
        }

        const allCoins = resourceData.response.data;
        const filteredCoins = allCoins.filter((coin: any) =>
          coin.name.toLowerCase().includes(name.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(name.toLowerCase())
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                searchTerm: name,
                count: filteredCoins.length,
                results: filteredCoins
              }, null, 2),
            },
          ],
        };
      }
    );
  }
};

export default getCryptoByNameModule;