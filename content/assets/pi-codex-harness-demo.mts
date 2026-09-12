/**
 * Source-reviewed demonstration for @earendil-works/pi-ai@0.85.1.
 * Requires Node.js >= 22.19.0. No live OAuth/inference test was performed.
 *
 * npm install --save-exact @earendil-works/pi-ai@0.85.1
 * npm install --save-dev tsx
 * npx tsx pi-codex-harness-demo.mts
 *
 * Credentials stay in memory. The sole tool returns synthetic read-only data.
 * No Codex subprocess, Pi agent-core loop, shell, or filesystem tool is used.
 */
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import {
  createModels,
  Type,
  validateToolCall,
  type Context,
  type Tool,
} from "@earendil-works/pi-ai";
import { openaiCodexProvider } from
  "@earendil-works/pi-ai/providers/openai-codex";

const MAX_REQUESTS = 6;

async function main(): Promise<void> {
  const models = createModels(); // In-memory credentials; not Pi CLI auth.json.
  models.setProvider(openaiCodexProvider());
  const terminal = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log("Provider model catalog (not an entitlement guarantee):");
    for (const item of models.getModels("openai-codex")) {
      console.log(item.id);
    }
    const modelId = (
      process.env.CODEX_MODEL ?? await terminal.question("Choose a model ID: ")
    ).trim();
    const model = models.getModel("openai-codex", modelId);
    if (!model) throw new Error("Model ID is not in this provider's catalog.");

    await models.login("openai-codex", "oauth", {
      signal: AbortSignal.timeout(10 * 60_000),
      prompt: async prompt => {
        if (prompt.type === "select") {
          for (const option of prompt.options) {
            console.log(`${option.id}: ${option.label}`);
          }
        }
        // Callback login cancels the competing manual-code prompt.
        const answer = (await terminal.question(`${prompt.message} `, {
          signal: prompt.signal,
        })).trim();
        if (prompt.type === "select" && !answer) {
          const first = prompt.options[0];
          if (!first) throw new Error("The login flow offered no choices.");
          return first.id;
        }
        return answer;
      },
      notify: event => {
        if (event.type === "auth_url") {
          console.log("Open this login URL:", event.url);
        } else if (event.type === "device_code") {
          console.log("Visit:", event.verificationUri, "Code:", event.userCode);
        } else {
          console.log(event.message);
        }
      },
    });

    const tools: Tool[] = [{
      name: "read_task",
      description: "Read a synthetic demonstration task by ID.",
      parameters: Type.Object({ id: Type.String() }),
    }];
    const context: Context = {
      systemPrompt:
        "Use read_task to check task status before answering. " +
        "Do not invent records. All available task data is synthetic.",
      messages: [{
        role: "user",
        content: "Check DEMO-1 and explain what should happen next.",
        timestamp: Date.now(),
      }],
      tools,
    };
    const sessionId = randomUUID();
    const signal = AbortSignal.timeout(120_000);

    for (let step = 0; step < MAX_REQUESTS; step++) {
      signal.throwIfAborted();
      const reply = await models.completeSimple(model, context, {
        sessionId,
        transport: "sse",
        maxRetries: 0,
        signal,
      });

      // Never execute calls from truncated, failed, aborted, or pending output.
      if (reply.stopReason !== "stop" && reply.stopReason !== "toolUse") {
        throw new Error(reply.errorMessage ?? `Unsafe stop: ${reply.stopReason}`);
      }
      context.messages.push(reply); // Includes tool IDs and replay metadata.
      const calls = reply.content.filter(block => block.type === "toolCall");
      if (calls.length === 0) {
        if (reply.stopReason === "toolUse") {
          throw new Error("Response requested tool continuation without calls.");
        }
        console.log(reply.content
          .filter(block => block.type === "text")
          .map(block => block.text)
          .join("\n"));
        return;
      }
      // Do not execute more tools when no follow-up request budget remains.
      if (step + 1 === MAX_REQUESTS) {
        throw new Error("Stopped before tool execution: request budget exhausted.");
      }

      for (const call of calls) {
        signal.throwIfAborted();
        let text: string;
        let isError = false;
        try {
          const args = validateToolCall(tools, call);
          // Explicit allowlist. Never evaluate arbitrary model-supplied code.
          if (call.name !== "read_task" || args.id !== "DEMO-1") {
            throw new Error("Unknown tool or demonstration task.");
          }
          text = JSON.stringify({
            id: "DEMO-1",
            status: "awaiting_review",
            nextAction: "Ask the reviewer to review the proposed change",
          });
        } catch (error) {
          isError = true;
          text = error instanceof Error ? error.message : String(error);
        }
        context.messages.push({
          role: "toolResult",
          toolCallId: call.id,
          toolName: call.name,
          content: [{ type: "text", text }],
          isError,
          timestamp: Date.now(),
        });
      }
    }
    throw new Error("Task request budget exhausted.");
  } finally {
    terminal.close();
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
