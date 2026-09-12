#!/usr/bin/env node
/**
 * Minimal one-turn Codex app-server client (Node.js 20+, macOS/Linux).
 *
 * Run `codex login` first, selecting ChatGPT sign-in, then:
 *   node codex-app-server-demo.mjs /absolute/project "Explain this repository."
 * Optional: CODEX_BIN=/absolute/path/to/codex CODEX_HOME=/absolute/codex/home
 *
 * No credentials are read or copied by this client. Codex owns authentication.
 * This demo requires a reported ChatGPT account and rejects API-key account mode.
 * Use a ChatGPT-backed OpenAI configuration; provider overrides are still inherited.
 * It requests a read-only local sandbox and declines approval requests. Inherited
 * tools, MCP servers, and hooks are not a universal no-side-effects guarantee:
 * run only with a trusted working directory and trusted Codex configuration.
 *
 * Source-reviewed against T3 4a4c6dd2adc3 and Codex c4017a87aacc (2026-09-11 PDT).
 * Protocol mock-tested, not tested against a live authenticated Codex instance.
 * The documented app-server command is experimental; check installed schemas.
 */
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { statSync } from 'node:fs';

function milliseconds(name, fallback) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer in milliseconds.`);
  }
  return value;
}

// Transport glue: newline framing, request correlation, and server requests.
function connectCodex(cwd, requestTimeoutMs) {
  const env = { ...process.env };
  if (env.CODEX_HOME === '~') env.CODEX_HOME = homedir();
  else if (env.CODEX_HOME?.startsWith('~/')) {
    env.CODEX_HOME = join(homedir(), env.CODEX_HOME.slice(2));
  }
  const child = spawn(env.CODEX_BIN || 'codex', ['app-server'], {
    cwd, env, shell: false, stdio: ['pipe', 'pipe', 'inherit'],
  });
  const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
  const pending = new Map();
  const listeners = new Set();
  const waiters = new Set();
  let nextId = 0;
  let terminalError;
  let closing = false;

  function fail(error) {
    if (terminalError) return;
    terminalError = error;
    for (const entry of pending.values()) {
      clearTimeout(entry.timer);
      entry.reject(error);
    }
    pending.clear();
    for (const waiter of [...waiters]) waiter.reject(error);
  }
  function send(message) {
    if (terminalError) throw terminalError;
    // App-server omits the JSON-RPC `jsonrpc` field. Stdout is JSONL, not HTTP.
    child.stdin.write(`${JSON.stringify(message)}\n`, (error) => {
      if (error) fail(error);
    });
  }
  child.on('error', (error) => fail(new Error(`Cannot launch Codex: ${error.message}`)));
  child.stdin.on('error', fail);
  child.stdout.on('error', fail);
  child.on('close', (code, signal) => {
    if (!closing) fail(new Error(`Codex exited (code=${code}, signal=${signal}).`));
    lines.close();
  });

  lines.on('line', (line) => {
    if (!line.trim() || terminalError) return;
    try {
      const message = JSON.parse(line);
      if (!message || typeof message !== 'object' || Array.isArray(message)) {
        throw new Error('Expected a JSON object on Codex stdout.');
      }
      const hasId = Object.hasOwn(message, 'id');
      if (hasId && typeof message.method === 'string') {
        // A server request is NOT a response, even if its ID matches our request.
        const method = message.method;
        if (method === 'item/commandExecution/requestApproval' ||
            method === 'item/fileChange/requestApproval') {
          send({ id: message.id, result: { decision: 'decline' } });
        } else {
          // Do not invent successful approvals or hang on unsupported methods.
          send({ id: message.id, error: {
            code: -32601, message: `Demo does not implement server request: ${method}`,
          } });
        }
        return;
      }
      if (hasId) {
        const entry = pending.get(message.id);
        if (!entry) return; // A timed-out or unrelated response.
        pending.delete(message.id);
        clearTimeout(entry.timer);
        if (message.error) entry.reject(new Error(
          `${entry.method}: ${message.error.message ?? 'RPC error'} ` +
          `(code=${message.error.code ?? 'unknown'})`,
        ));
        else if (Object.hasOwn(message, 'result')) entry.resolve(message.result);
        else entry.reject(new Error(`${entry.method}: malformed RPC response.`));
        return;
      }
      if (typeof message.method !== 'string') throw new Error('Malformed notification.');
      for (const listener of [...listeners]) listener(message);
      for (const waiter of [...waiters]) {
        if (waiter.predicate(message)) waiter.resolve(message);
      }
    } catch (error) { fail(error); }
  });

  return {
    request(method, params = {}) {
      if (terminalError) return Promise.reject(terminalError);
      const id = `client-${++nextId}`;
      return new Promise((resolveRequest, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new Error(`${method} timed out after ${requestTimeoutMs} ms.`));
        }, requestTimeoutMs);
        pending.set(id, { method, resolve: resolveRequest, reject, timer });
        try { send({ id, method, params }); }
        catch (error) {
          clearTimeout(timer); pending.delete(id); reject(error);
        }
      });
    },
    notify(method, params = {}) { send({ method, params }); },
    onNotification(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    waitFor(predicate, timeoutMs) {
      let waiter;
      let timer;
      const promise = new Promise((resolveWait, rejectWait) => {
        const settle = (fn, value) => {
          clearTimeout(timer); waiters.delete(waiter); fn(value);
        };
        waiter = {
          predicate,
          resolve: (value) => settle(resolveWait, value),
          reject: (error) => settle(rejectWait, error),
        };
        waiters.add(waiter);
        timer = setTimeout(() => waiter.reject(new Error(
          `Turn did not complete within ${timeoutMs} ms.`,
        )), timeoutMs);
        if (terminalError) waiter.reject(terminalError);
      });
      // A failure may precede the turn/start response; handle that early race.
      promise.catch(() => {});
      return { promise, cancel: () => waiter.reject(new Error('Wait cancelled.')) };
    },
    close() {
      if (closing) return;
      closing = true;
      fail(new Error('Codex connection closed.'));
      listeners.clear();
      lines.close();
      child.stdin.end();
      if (child.exitCode === null && child.signalCode === null) {
        child.kill('SIGTERM');
        const timer = setTimeout(() => {
          if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
        }, 2000);
        timer.unref();
      }
    },
  };
}

async function main() {
  const cwd = resolve(process.argv[2] || '.');
  const prompt = process.argv.slice(3).join(' ').trim() ||
    'Explain the structure of this repository. Do not change files or remote resources.';
  if (!statSync(cwd).isDirectory()) throw new Error(`Not a directory: ${cwd}`);
  const rpc = connectCodex(cwd, milliseconds('CODEX_RPC_TIMEOUT_MS', 30_000));
  let completion;
  let unsubscribe;
  try {
    await rpc.request('initialize', {
      clientInfo: { name: 'personal_note_demo', title: 'Personal Note Demo', version: '0.1.0' },
    });
    rpc.notify('initialized');
    const auth = await rpc.request('account/read', {});
    if (auth.account?.type !== 'chatgpt') {
      throw new Error('This demo requires ChatGPT sign-in. Run `codex login` using the same ' +
        'CODEX_HOME and select ChatGPT. API-key billing is deliberately not enabled here.');
    }
    const { thread } = await rpc.request('thread/start', {
      cwd, sandbox: 'read-only', approvalPolicy: 'never',
    });
    if (typeof thread?.id !== 'string') throw new Error('Missing thread ID.');
    unsubscribe = rpc.onNotification(({ method, params }) => {
      if (params?.threadId === thread.id && method === 'item/agentMessage/delta' &&
          typeof params.delta === 'string') process.stdout.write(params.delta);
    });
    // Subscribe BEFORE turn/start. Completion/deltas can arrive before its reply.
    completion = rpc.waitFor(
      (message) => message.method === 'turn/completed' && message.params?.threadId === thread.id,
      milliseconds('CODEX_TURN_TIMEOUT_MS', 300_000),
    );
    const { turn } = await rpc.request('turn/start', {
      threadId: thread.id, input: [{ type: 'text', text: prompt }],
    });
    const notification = await completion.promise;
    const finished = notification.params.turn;
    if (!turn?.id || finished?.id !== turn.id) throw new Error('Mismatched completed turn ID.');
    if (finished.status !== 'completed') {
      throw new Error(finished.error?.message || `Turn ended with status: ${finished.status}`);
    }
    process.stdout.write('\n');
  } finally {
    unsubscribe?.();
    completion?.cancel();
    rpc.close();
  }
}
main().catch((error) => {
  console.error(`\n${error.message || String(error)}`);
  process.exitCode = 1;
});
