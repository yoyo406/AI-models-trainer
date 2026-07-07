# transformer.js · GPU

A minimal GPT-style decoder transformer that runs **entirely in the browser** using **TensorFlow.js** with **WebGPU/WebGL acceleration**.

No backend. No server. Just your browser, your GPU, and questionable life choices.

The app has no build step. Serve the `docs/` directory over HTTP(S) and open
`index.html`; opening it directly with `file://` works in some browsers but
disables service-worker caching.

---

## ✨ Features

- ⚡ **GPU-only training** (WebGPU → fallback WebGL)
- 🧠 **Mini GPT architecture** (decoder transformer)
- 🧵 **Off-main-thread training** via a real Web Worker (falls back to same-thread execution if Workers are unavailable)
- 💾 **Autosave with IndexedDB**
- 📦 **Checkpoint export/import (JSON)**
- 🔤 **Char-level & word-level tokenization**
- 📈 **Live training metrics & loss graph**
- 🎛️ **Full hyperparameter control**
- ✍️ **Text generation with temperature, top-k, top-p**

---

## 🚀 How It Works

This app implements a small transformer model directly in the browser:

- Tokenizes input text (char or word)
- Builds a vocabulary
- Trains a GPT-like model using TensorFlow.js
- Runs everything on GPU via WebGPU or WebGL
- Generates text from a trained model

All computation happens locally. Nothing is sent anywhere.

---

## 🖥️ Requirements

- A modern browser (Chrome, Edge recommended)
- WebGPU support (preferred) or WebGL fallback
- Decent GPU (otherwise… good luck)

CPU training is **disabled on purpose**.

---

## 📂 Usage

### 1. Load data
- Paste text or upload a `.txt` file

### 2. Configure model
Adjust parameters like:
- `n_embd`
- `n_heads`
- `n_layers`
- `block size`
- `batch size`
- learning rate, etc.

### 3. Train
Click **"Train on GPU"**

Training runs off the main thread via a real Web Worker when the browser allows it (falls back to same-thread execution otherwise).

### 4. Generate
- Enter a seed
- Click **Generate**

---

## 💾 Checkpoints

- Export model → JSON file
- Import model → restore it for generation or export
- Autosave → stored in IndexedDB

⚠️ Only **schema v3** checkpoints are supported.

---

## ⚠️ Limitations

- Memory usage grows quickly with model size
- Large models may crash your browser
- Autosave can cause temporary memory spikes
- Performance depends heavily on your GPU

---

## 🛠️ Technical Details

- Framework: TensorFlow.js
- Runtime dependency: TensorFlow.js 4.22.0, pinned on jsDelivr
- Backend:
  - WebGPU (preferred)
  - WebGL (fallback)
- Architecture:
  - Decoder-only transformer (GPT-like)
  - Multi-head self-attention
  - LayerNorm + GELU
  - AdamW optimizer
  - Gradient clipping
  - Cosine LR schedule with warmup

---

## 🧪 Safety Mechanisms

- GPU-only enforcement (no CPU fallback)
- Gradient clipping
- Early stopping (patience)
- Memory monitoring
- Optional autosave throttling

---

## 📸 UI

- Apple HIG-inspired dark UI
- Glassmorphism styling
- Real-time metrics dashboard
- Training graph canvas

---

## 📌 Notes

- Training large models in-browser is experimental
- The TensorFlow.js runtime is loaded from jsDelivr, so the first load requires network access
- Expect crashes if you push it too far
- This is for learning and experimentation, not production

---

## 📜 License

Apache License 2.0

---

## 👀 Why This Exists

Because running a transformer in a browser is:
- unnecessary
- inefficient
- and somehow very satisfying

---

## 💡 Future Improvements

- Better memory management
- Model quantization
- Streaming generation
- Multi-file datasets
- Fine-tuning support

---
