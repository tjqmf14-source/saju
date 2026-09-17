#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const COMFY_URL = process.env.COMFY_URL || "http://127.0.0.1:8188";
const COMFY_OUTPUT_DIR =
  process.env.COMFY_OUTPUT_DIR ||
  "C:\\ComfyUI_AMD\\ComfyUI_windows_portable\\ComfyUI\\output";

const serverInfo = {
  name: "local-comfyui",
  version: "0.1.0",
};

const tools = [
  {
    name: "comfyui_status",
    description: "Check whether the local ComfyUI API is running and return system/GPU stats.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "comfyui_run_workflow",
    description:
      "Queue a ComfyUI API workflow prompt. Provide either workflow_json or workflow_path. The workflow must be ComfyUI API-format JSON, not the visual UI workflow export.",
    inputSchema: {
      type: "object",
      properties: {
        workflow_json: {
          type: "object",
          description: "ComfyUI API-format prompt JSON.",
        },
        workflow_path: {
          type: "string",
          description: "Path to a ComfyUI API-format prompt JSON file.",
        },
        client_id: {
          type: "string",
          description: "Optional ComfyUI client id.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "comfyui_generate_image",
    description:
      "Generate an image with the local SDXL Turbo checkpoint installed in ComfyUI. Returns the queued prompt id; use comfyui_history or comfyui_list_outputs to inspect results.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Positive text prompt." },
        negative_prompt: {
          type: "string",
          description: "Negative prompt. Defaults to common low-quality exclusions.",
        },
        width: { type: "number", description: "Image width. Defaults to 1024." },
        height: { type: "number", description: "Image height. Defaults to 1024." },
        steps: { type: "number", description: "Sampling steps. Defaults to 4 for SDXL Turbo." },
        cfg: { type: "number", description: "CFG scale. Defaults to 1.0 for SDXL Turbo." },
        seed: { type: "number", description: "Seed. Defaults to a random safe integer." },
        filename_prefix: {
          type: "string",
          description: "Output filename prefix. Defaults to codex_sdxl_turbo.",
        },
      },
      required: ["prompt"],
      additionalProperties: false,
    },
  },
  {
    name: "comfyui_generate_video_api",
    description:
      "Queue a partner API text-to-video workflow in ComfyUI. Providers require ComfyUI/Comfy Cloud authentication or credits. Supported providers: seedance, kling, veo, sora, ltx.",
    inputSchema: {
      type: "object",
      properties: {
        provider: {
          type: "string",
          description: "seedance, kling, veo, sora, or ltx.",
        },
        prompt: { type: "string", description: "Video prompt." },
        negative_prompt: { type: "string", description: "Negative prompt where supported." },
        aspect_ratio: { type: "string", description: "Defaults to 16:9." },
        duration: { type: "number", description: "Duration in seconds." },
        resolution: { type: "string", description: "Provider-specific resolution." },
        seed: { type: "number", description: "Seed where supported." },
        filename_prefix: {
          type: "string",
          description: "Output filename prefix. Defaults to codex_video.",
        },
      },
      required: ["provider", "prompt"],
      additionalProperties: false,
    },
  },
  {
    name: "comfyui_history",
    description: "Read ComfyUI history for a queued prompt id.",
    inputSchema: {
      type: "object",
      properties: {
        prompt_id: { type: "string" },
      },
      required: ["prompt_id"],
      additionalProperties: false,
    },
  },
  {
    name: "comfyui_list_outputs",
    description: "List recently generated files from the local ComfyUI output folder.",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of files to return. Defaults to 20.",
        },
      },
      additionalProperties: false,
    },
  },
  {
    name: "comfyui_get_output_file",
    description: "Return metadata and absolute path for a generated ComfyUI output file.",
    inputSchema: {
      type: "object",
      properties: {
        filename: {
          type: "string",
          description: "Output filename, for example ComfyUI_00001_.png.",
        },
      },
      required: ["filename"],
      additionalProperties: false,
    },
  },
];

let buffer = Buffer.alloc(0);

process.stdin.on("data", async (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  while (true) {
    const headerEnd = buffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) return;

    const header = buffer.subarray(0, headerEnd).toString("utf8");
    const match = header.match(/content-length:\s*(\d+)/i);
    if (!match) {
      buffer = buffer.subarray(headerEnd + 4);
      continue;
    }

    const contentLength = Number(match[1]);
    const messageStart = headerEnd + 4;
    const messageEnd = messageStart + contentLength;
    if (buffer.length < messageEnd) return;

    const rawMessage = buffer.subarray(messageStart, messageEnd).toString("utf8");
    buffer = buffer.subarray(messageEnd);

    try {
      const message = JSON.parse(rawMessage);
      await handleMessage(message);
    } catch (error) {
      sendError(null, -32700, error.message);
    }
  }
});

async function handleMessage(message) {
  if (!message || typeof message !== "object") return;

  if (message.method === "initialize") {
    sendResult(message.id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo,
    });
    return;
  }

  if (message.method === "notifications/initialized") return;

  if (message.method === "tools/list") {
    sendResult(message.id, { tools });
    return;
  }

  if (message.method === "tools/call") {
    try {
      const result = await callTool(message.params?.name, message.params?.arguments || {});
      sendResult(message.id, {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      });
    } catch (error) {
      sendResult(message.id, {
        isError: true,
        content: [{ type: "text", text: error.message }],
      });
    }
    return;
  }

  if (message.id !== undefined) {
    sendError(message.id, -32601, `Unknown method: ${message.method}`);
  }
}

async function callTool(name, args) {
  switch (name) {
    case "comfyui_status":
      return comfyFetchJson("/system_stats");
    case "comfyui_run_workflow":
      return runWorkflow(args);
    case "comfyui_generate_image":
      return generateImage(args);
    case "comfyui_generate_video_api":
      return generateVideoApi(args);
    case "comfyui_history":
      return comfyFetchJson(`/history/${encodeURIComponent(args.prompt_id)}`);
    case "comfyui_list_outputs":
      return listOutputs(args.limit || 20);
    case "comfyui_get_output_file":
      return getOutputFile(args.filename);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function generateVideoApi(args) {
  const provider = String(args.provider || "").toLowerCase();
  const prefix = args.filename_prefix || `codex_video_${provider}`;
  const workflow = videoWorkflow(provider, args, prefix);
  const queued = await runWorkflow({ workflow_json: workflow });
  return {
    ...queued,
    provider,
    note: "This is a ComfyUI partner/API workflow. It requires ComfyUI authentication/credits for the selected provider.",
  };
}

function videoWorkflow(provider, args, prefix) {
  const prompt = args.prompt;
  const negative = args.negative_prompt || "";
  const seed = args.seed === undefined ? 0 : Math.max(0, Math.floor(Number(args.seed)));

  if (provider === "seedance" || provider === "bytedance") {
    return {
      1: {
        class_type: "ByteDanceTextToVideoNode",
        inputs: {
          model: "seedance-1-0-pro-fast-251015",
          prompt,
          resolution: args.resolution || "720p",
          aspect_ratio: args.aspect_ratio || "16:9",
          duration: Math.max(3, Math.min(Math.floor(args.duration || 5), 12)),
          seed,
          camera_fixed: false,
          watermark: false,
          generate_audio: false,
        },
      },
      2: {
        class_type: "SaveVideo",
        inputs: {
          video: ["1", 0],
          filename_prefix: prefix,
          format: "mp4",
          codec: "auto",
        },
      },
    };
  }

  if (provider === "kling") {
    const seconds = Number(args.duration || 5) >= 10 ? "10s" : "5s";
    return {
      1: {
        class_type: "KlingTextToVideoNode",
        inputs: {
          prompt,
          negative_prompt: negative,
          cfg_scale: 0.5,
          aspect_ratio: args.aspect_ratio || "16:9",
          mode: `pro mode / ${seconds} duration / kling-v2-5-turbo`,
        },
      },
      2: {
        class_type: "SaveVideo",
        inputs: {
          video: ["1", 0],
          filename_prefix: prefix,
          format: "mp4",
          codec: "auto",
        },
      },
    };
  }

  if (provider === "veo") {
    return {
      1: {
        class_type: "Veo3VideoGenerationNode",
        inputs: {
          prompt,
          aspect_ratio: args.aspect_ratio || "16:9",
          resolution: args.resolution || "720p",
          negative_prompt: negative,
          duration_seconds: Number(args.duration || 8) >= 8 ? 8 : 4,
          enhance_prompt: true,
          person_generation: "ALLOW",
          seed,
          model: "veo-3.1-fast-generate",
          generate_audio: false,
        },
      },
      2: {
        class_type: "SaveVideo",
        inputs: {
          video: ["1", 0],
          filename_prefix: prefix,
          format: "mp4",
          codec: "auto",
        },
      },
    };
  }

  if (provider === "sora") {
    return {
      1: {
        class_type: "OpenAIVideoSora2",
        inputs: {
          model: "sora-2",
          prompt,
          size: args.aspect_ratio === "9:16" ? "720x1280" : "1280x720",
          duration: [4, 8, 12].includes(Number(args.duration))
            ? Number(args.duration)
            : 4,
          seed,
        },
      },
      2: {
        class_type: "SaveVideo",
        inputs: {
          video: ["1", 0],
          filename_prefix: prefix,
          format: "mp4",
          codec: "auto",
        },
      },
    };
  }

  if (provider === "ltx") {
    return {
      1: {
        class_type: "LtxvApiTextToVideo",
        inputs: {
          model: "LTX-2 (Fast)",
          prompt,
          duration: nearestOption(Number(args.duration || 8), [6, 8, 10, 12, 14, 16, 18, 20]),
          resolution: args.resolution || "1920x1080",
          fps: 25,
          generate_audio: false,
        },
      },
      2: {
        class_type: "SaveVideo",
        inputs: {
          video: ["1", 0],
          filename_prefix: prefix,
          format: "mp4",
          codec: "auto",
        },
      },
    };
  }

  throw new Error("Unsupported provider. Use seedance, kling, veo, sora, or ltx.");
}

function nearestOption(value, options) {
  return options.reduce((best, current) =>
    Math.abs(current - value) < Math.abs(best - value) ? current : best,
  );
}

async function generateImage(args) {
  const seed =
    args.seed === undefined
      ? Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
      : Math.max(0, Math.floor(Number(args.seed)));

  const workflow = {
    1: {
      class_type: "CheckpointLoaderSimple",
      inputs: { ckpt_name: "sd_xl_turbo_1.0_fp16.safetensors" },
    },
    2: {
      class_type: "CLIPTextEncode",
      inputs: { text: args.prompt, clip: ["1", 1] },
    },
    3: {
      class_type: "CLIPTextEncode",
      inputs: {
        text:
          args.negative_prompt ||
          "low quality, blurry, distorted, deformed, watermark, text, logo",
        clip: ["1", 1],
      },
    },
    4: {
      class_type: "EmptyLatentImage",
      inputs: {
        width: clampToMultiple(args.width || 1024, 16, 2048, 8),
        height: clampToMultiple(args.height || 1024, 16, 2048, 8),
        batch_size: 1,
      },
    },
    5: {
      class_type: "KSampler",
      inputs: {
        model: ["1", 0],
        seed,
        steps: Math.max(1, Math.min(Math.floor(args.steps || 4), 50)),
        cfg: Number(args.cfg || 1.0),
        sampler_name: "euler",
        scheduler: "simple",
        positive: ["2", 0],
        negative: ["3", 0],
        latent_image: ["4", 0],
        denoise: 1,
      },
    },
    6: {
      class_type: "VAEDecode",
      inputs: { samples: ["5", 0], vae: ["1", 2] },
    },
    7: {
      class_type: "SaveImage",
      inputs: {
        images: ["6", 0],
        filename_prefix: args.filename_prefix || "codex_sdxl_turbo",
      },
    },
  };

  const queued = await runWorkflow({ workflow_json: workflow });
  return {
    ...queued,
    seed,
    model: "sd_xl_turbo_1.0_fp16.safetensors",
  };
}

function clampToMultiple(value, min, max, multiple) {
  const n = Math.max(min, Math.min(Number(value) || min, max));
  return Math.round(n / multiple) * multiple;
}

async function runWorkflow(args) {
  let prompt = args.workflow_json;
  if (!prompt && args.workflow_path) {
    const raw = await fs.readFile(args.workflow_path, "utf8");
    prompt = JSON.parse(raw);
  }
  if (!prompt || typeof prompt !== "object") {
    throw new Error("Provide workflow_json or workflow_path.");
  }

  const body = {
    prompt,
    client_id: args.client_id || `codex-${Date.now()}`,
  };

  return comfyFetchJson("/prompt", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function listOutputs(limit) {
  const entries = await fs.readdir(COMFY_OUTPUT_DIR, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const fullPath = path.join(COMFY_OUTPUT_DIR, entry.name);
        const stat = await fs.stat(fullPath);
        return {
          filename: entry.name,
          path: fullPath,
          size: stat.size,
          modified: stat.mtime.toISOString(),
        };
      }),
  );

  return files
    .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime())
    .slice(0, Math.max(1, Math.min(Number(limit) || 20, 100)));
}

async function getOutputFile(filename) {
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    throw new Error("filename must be a single file name from the ComfyUI output directory.");
  }
  const fullPath = path.join(COMFY_OUTPUT_DIR, filename);
  const stat = await fs.stat(fullPath);
  return {
    filename,
    path: fullPath,
    size: stat.size,
    modified: stat.mtime.toISOString(),
  };
}

async function comfyFetchJson(endpoint, options = {}) {
  const response = await fetch(`${COMFY_URL}${endpoint}`, options);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`ComfyUI API error ${response.status}: ${text}`);
  }
  return response.json();
}

function sendResult(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function sendError(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

function send(message) {
  const json = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`);
}
