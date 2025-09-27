/**
 * @module Resources/CryptoAll
 * @category Resources
 */

import axios from "axios";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { error } from "console";

/**
 * Get top 100 cryptocurrencies by market cap from CoinGecko API
 * 
 * @example
 * ```typescript
 * // Usage in MCP client
 * const resource = await client.getResource("crypto-all://info");
 * const data = JSON.parse(resource.contents[0].text);
 * ```
 */
const cryptoAllModule: RegisterableModule = {
  type: "resource",
  name: "crypto-all",
  description: "Get top 100 cryptocurrencies by market cap from CoinGecko API",

  register(server: McpServer) {
    server.resource(
      "crypto-all",
      "crypto-all://info",
      {
        name: "Crypto All",
        description: "Get top 100 cryptocurrencies by market cap from CoinGecko API",
      },
      async () => {
        // TODO: Implement your resource logic here
        const resourceData = {
          message: "This is the crypto-all resource",
          timestamp: new Date().toISOString(),
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
        };

        if (!resourceData.response.data || !Array.isArray(resourceData.response.data)) {
          throw new Error('Invalid response format from CoinGecko API');
        }

        return {
          contents: [
            {
              uri: "crypto-all://info",
              mimeType: "application/json",
              text: JSON.stringify(resourceData.response.data[0], null, 2),
            },
          ],
        };
      }
    );
  }
};

export default cryptoAllModule;
