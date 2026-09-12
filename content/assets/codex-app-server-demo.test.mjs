/** Offline transport tests; never connect to OpenAI or use real credentials. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const demo = join(dirname(fileURLToPath(import.meta.url)), 'codex-app-server-demo.mjs');
const mockSource = `
import { createInterface } from 'node:readline';
const scenario = process.env.DEMO_SCENARIO;
const send = value => process.stdout.write(JSON.stringify(value) + '\\n');
const done = () => send({method:'turn/completed', params:{threadId:'thread-1', turn:{
  id:'turn-1', status:scenario === 'failed' ? 'failed' : 'completed',
  ...(scenario === 'failed' ? {error:{message:'Deliberate test failure'}} : {})
}}});
let startId;
let approvalIndex = 0;
function requestApproval() {
  const methods = ['item/commandExecution/requestApproval',
    'item/fileChange/requestApproval', 'test/unsupported'];
  send({id:startId, method:methods[approvalIndex], params:{}});
}
function startResult() {
  send({id:startId, result:{turn:{id:'turn-1'}}});
  send({method:'item/agentMessage/delta', params:{threadId:'thread-1', delta:'Mock answer'}});
  done();
}
createInterface({input:process.stdin}).on('line', line => {
  const msg = JSON.parse(line);
  if (!msg.method && scenario === 'server-requests') {
    const correct = approvalIndex < 2 ? msg.result?.decision === 'decline'
      : msg.error?.code === -32601;
    if (!correct) process.exit(7);
    if (++approvalIndex < 3) requestApproval(); else startResult();
    return;
  }
  if (msg.method === 'initialize') {
    if (scenario === 'rpc-timeout') return;
    if (scenario === 'malformed') { process.stdout.write('{bad JSON\\n'); return; }
    send({id:msg.id, result:{userAgent:'mock/1.0'}});
  } else if (msg.method === 'account/read') {
    send({id:msg.id, result:{account:scenario === 'unauthenticated' ? null :
      {type:scenario === 'api-key' ? 'apiKey' : 'chatgpt'}}});
  } else if (msg.method === 'thread/start') {
    if (msg.params.sandbox !== 'read-only' || msg.params.approvalPolicy !== 'never') process.exit(8);
    send({id:msg.id, result:{thread:{id:'thread-1'}}});
  } else if (msg.method === 'turn/start') {
    startId = msg.id;
    if (scenario === 'early-completion') {
      done(); send({id:startId, result:{turn:{id:'turn-1'}}});
    } else if (scenario === 'server-requests') requestApproval();
    else if (scenario === 'turn-timeout') send({id:startId,result:{turn:{id:'turn-1'}}});
    else startResult();
  }
});
`;

function run(scenario) {
  const dir = mkdtempSync(join(tmpdir(), 'codex-note-test-'));
  try {
    const mock = join(dir, 'mock-codex.mjs');
    writeFileSync(mock, `#!${process.execPath}\n${mockSource}`, {mode:0o700});
    const result = spawnSync(process.execPath, [demo, dir, 'Test prompt'], {
      encoding:'utf8', timeout:5000,
      env:{PATH:process.env.PATH, HOME:dir, CODEX_HOME:dir,
        CODEX_BIN:scenario === 'missing' ? join(dir, 'absent') : mock,
        DEMO_SCENARIO:scenario, CODEX_RPC_TIMEOUT_MS:'600', CODEX_TURN_TIMEOUT_MS:'600'},
    });
    assert.ifError(result.error);
    return result;
  } finally { rmSync(dir, {recursive:true, force:true}); }
}
function succeeds(scenario, expected) {
  const result = run(scenario);
  assert.equal(result.status, 0, result.stderr);
  if (expected) assert.match(result.stdout, expected);
}
function fails(scenario, expected) {
  const result = run(scenario);
  assert.equal(result.status, 1, result.stderr);
  assert.match(result.stderr, expected);
}

test('normal completion streams the answer', () => succeeds('normal', /Mock answer/));
test('completion may arrive before turn/start response', () => succeeds('early-completion'));
test('server requests can reuse client IDs; approvals declined and unknown methods rejected',
  () => succeeds('server-requests', /Mock answer/));
test('failed turns return an error', () => fails('failed', /Deliberate test failure/));
test('missing login and API-key mode are rejected', () => {
  fails('unauthenticated', /requires ChatGPT sign-in/);
  fails('api-key', /requires ChatGPT sign-in/);
});
test('request and turn timeouts are bounded', () => {
  fails('rpc-timeout', /initialize timed out/);
  fails('turn-timeout', /Turn did not complete/);
});
test('malformed protocol output fails', () => fails('malformed', /JSON|property name/i));
test('missing executable fails', () => fails('missing', /Cannot launch Codex/));
