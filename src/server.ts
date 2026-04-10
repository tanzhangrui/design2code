// src/server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const FIGMA_API_BASE = "https://api.figma.com/v1";
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

const server = new Server(
  {
    name: "figma-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_figma_file",
        description: "获取Figma文件的节点树和样式信息",
        inputSchema: {
          type: "object",
          properties: {
            fileKey: {
              type: "string",
              description: "Figma文件的key",
            },
            nodeId: {
              type: "string",
              description: "要获取的节点ID",
            },
          },
          required: ["fileKey", "nodeId"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_figma_file") {
    const { fileKey, nodeId } = args;
    try {
      const response = await axios.get(`${FIGMA_API_BASE}/files/${fileKey}/nodes?ids=${nodeId}`, {
        headers: {
          "X-Figma-Token": FIGMA_ACCESS_TOKEN,
        },
      });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `获取Figma文件失败: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`未知工具: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Figma MCP Server 已启动");
}

main().catch((error) => {
  console.error("服务器启动失败:", error);
  process.exit(1);
});