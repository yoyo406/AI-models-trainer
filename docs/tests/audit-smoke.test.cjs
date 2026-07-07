const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'docs', 'index.html'), 'utf8');
const workerMatch = html.match(/const WORKER_SOURCE = `([\s\S]*?)`;\s*\/\/ ={20,}/);

function loadWorkerHelpers(tf = {}) {
  assert.ok(workerMatch, 'embedded worker source must be present');
  const self = { importScripts() {}, postMessage() {}, onmessage: null };
  const workerSource = new Function(`${workerMatch[0]}\nreturn WORKER_SOURCE;`)();
  return new Function('self', 'tf', `${workerSource}; return {
    clampNumber, clampInteger, tokenizeText, buildVocabulary, validateCheckpoint,
    isWebGPUImplementationError, MiniGPT
  };`)(self, tf);
}

test('worker request responses retain their correlation id', () => {
  assert.ok(workerMatch, 'embedded worker source must be present');
  const workerSource = new Function(`${workerMatch[0]}\nreturn WORKER_SOURCE;`)();
  assert.match(workerSource, /postStatus\('reset',\s*\{\s*id: msg\.id/);
  assert.doesNotMatch(workerSource, /return\s+probs\.array\(\)/);
});

function zeros(length) {
  return Array.from({ length }, () => 0);
}

function validCheckpoint() {
  const V = 2, T = 4, C = 8, H = 1, L = 1;
  return {
    schema: 3,
    tokenizer: 'char',
    config: {},
    vocab: ['a', 'b'],
    model: {
      V, T, C, H, L, dr: 0,
      wte: zeros(V * C), wpe: zeros(T * C),
      lnFg: zeros(C), lnFb: zeros(C),
      head: zeros(C * V), bhead: zeros(V),
      blocks: [{
        ln1g: zeros(C), ln1b: zeros(C),
        Wq: zeros(C * C), Wk: zeros(C * C), Wv: zeros(C * C),
        Wo: zeros(C * C), bo: zeros(C),
        ln2g: zeros(C), ln2b: zeros(C),
        Wf1: zeros(C * 4 * C), bf1: zeros(4 * C),
        Wf2: zeros(4 * C * C), bf2: zeros(C)
      }]
    }
  };
}

test('all JavaScript and JSON sources parse', () => {
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
    .map(match => match[1])
    .filter(source => source.trim());
  scripts.forEach(source => new Function(source));
  new Function(fs.readFileSync(path.join(root, 'docs', 'service-worker.js'), 'utf8'));
  JSON.parse(fs.readFileSync(path.join(root, 'docs', 'manifest.json'), 'utf8'));
});

test('HTML ids are unique', () => {
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
});

test('manifest local resources exist', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'manifest.json'), 'utf8'));
  for (const resource of [manifest.start_url, ...manifest.icons.map(icon => icon.src)]) {
    assert.ok(fs.existsSync(path.resolve(root, 'docs', resource)), resource);
  }
  for (const icon of manifest.icons) {
    const png = fs.readFileSync(path.resolve(root, 'docs', icon.src));
    const dimensions = `${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`;
    assert.equal(dimensions, icon.sizes, icon.src);
  }
});

test('worker parsing preserves valid zero values and tokenizes consistently', () => {
  const helpers = loadWorkerHelpers();
  assert.equal(helpers.clampNumber(0, 0.1, 0, 0.5), 0);
  assert.equal(helpers.clampInteger(999, 10, 1, 100), 100);
  assert.deepEqual(helpers.tokenizeText('a  b', 'word'), ['a', '  ', 'b']);
  assert.equal(helpers.buildVocabulary('ababa', 'char').indices.length, 5);
});

test('checkpoint validation accepts schema 3 and rejects malformed input', () => {
  const { validateCheckpoint } = loadWorkerHelpers();
  const checkpoint = validCheckpoint();
  assert.doesNotThrow(() => validateCheckpoint(checkpoint));
  assert.throws(() => validateCheckpoint({ ...checkpoint, schema: 4 }), /schema 3/);
  const malformed = validCheckpoint();
  malformed.model.wte.pop();
  assert.throws(() => validateCheckpoint(malformed), /wte/);
});

test('failed model construction disposes partial variables and uses a fresh namespace', () => {
  let variableCalls = 0;
  let initialDisposals = 0;
  let variableDisposals = 0;
  const names = [];
  const initialTensor = () => ({ dispose() { initialDisposals++; } });
  const fakeTf = {
    truncatedNormal: initialTensor,
    ones: initialTensor,
    zeros: initialTensor,
    tidy(fn) { return fn(); },
    linalg: { bandPart(tensor) { return tensor; } },
    variable(_initial, _trainable, name) {
      variableCalls++;
      names.push(name);
      if (variableCalls === 2) throw new Error('synthetic allocation failure');
      return { dispose() { variableDisposals++; } };
    }
  };
  const { MiniGPT } = loadWorkerHelpers(fakeTf);
  assert.throws(() => new MiniGPT(2, 4, 8, 1, 1, 0), /synthetic allocation failure/);
  assert.equal(initialDisposals, 2);
  assert.equal(variableDisposals, 1);
  const model = new MiniGPT(2, 4, 8, 1, 1, 0);
  assert.ok(names.includes('m1_wte'));
  assert.ok(names.includes('m2_wte'));
  model.dispose();
});

test('WebGPU mapped-buffer failures are recognized for WebGL fallback', () => {
  const { isWebGPUImplementationError } = loadWorkerHelpers();
  assert.equal(isWebGPUImplementationError(new Error(
    "Failed to execute 'createBuffer' on 'GPUDevice': mappedAtCreation"
  )), true);
  assert.equal(isWebGPUImplementationError(new Error('invalid checkpoint')), false);
});
