/**
 * @module Prompts/CryptoMarketSummary
 * @category Prompts
 */

import { z } from "zod";
import type { RegisterableModule } from "../registry/types.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import axios from "axios";
import { PromptArgumentSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * Schema for crypto-market-summary prompt arguments
 * @internal
 */
const cryptoMarketSummarySchema = {
  type: z.enum(["top5", "gainers", "losers"]).describe("Choose summary type: top5, gainers, losers")
} as const;

/**
 * Summarize top cryptocurrencies or biggest movers
 * 
 * @example
 * ```typescript
 * // Usage in MCP client
 * const prompt = await client.getPrompt("crypto-market-summary", { 
 *   topic: "example topic" 
 * });
 * ```
 */
const cryptoMarketSummaryModule: RegisterableModule = {
  type: "prompt",
  name: "crypto-market-summary",
  description: "Summarize top cryptocurrencies or biggest movers",
  register(server: McpServer) {


    server.registerPrompt(
      "crypto-market-summary",
      {
        title: "Crypto Market Summary",
        description: "Summarize top cryptocurrencies or biggest movers",
        argsSchema: cryptoMarketSummarySchema,

      },

      async ({ type }) => {

        const resourceData = {
          response: await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: {
              vs_currency: 'usd',
              order: 'market_cap_desc',
              per_page: 100,
              page: 1
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

        let data;
        if (type === "top5") {
          data = resourceData.response.data.slice(0, 5);
        } else if (type === "gainers") {
          data = [...resourceData.response.data].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);
        } else {
          data = [...resourceData.response.data].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5);
        }


        return {
          messages: [
            {
              role: "assistant" as const,
              content: {
                type: "text" as const,
                text: JSON.stringify({ type, data }, null, 2),
              },
            },
          ],
        };
      }
    );
  }
};

export default cryptoMarketSummaryModule;