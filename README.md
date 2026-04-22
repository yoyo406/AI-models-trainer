# gpt.js — Mini GPT Language Model Trainer

Small app. Powerful. Train GPT model in browser. No server. No cloud. Pure JavaScript.

## What It Does

- **Train** model on your text. Learn patterns.
- **Generate** new text. Based on learning.
- **Zero data leaks**. Everything stays local.
- **Works offline**. Load once. Use anywhere.

## Quick Start

### GitHub Pages

1. Fork repo. Or create new.
2. Rename to `username.github.io`.
3. Add files to root:
   ```
   username.github.io/
   ├── index.html
   ├── manifest.json
   ├── service-worker.js
   └── icons/
   ```
4. Settings → Pages → Source: main branch.
5. URL: `https://username.github.io`

### Local Test

```bash
cd folder/
python3 -m http.server 8000
```

Go to: `http://localhost:8000`

## File Structure

```
gpt.js/
├── index.html           # Main app
├── manifest.json        # PWA config
├── service-worker.js    # Offline cache
├── icons/
│   ├── icon-192.png     # Mobile
│   ├── icon-512.png     # Desktop
└── README.md
```

## How to Use

### 1. Load Data

Paste text. Or upload `.txt` file.

App builds vocab auto.

### 2. Parameters

- **blockSize**: Context window. Tokens model sees.
- **nEmbd**: Embedding dimension. Vector size. Bigger = stronger.
- **nHeads**: Attention heads. Model "eyes".
- **nLayers**: Network depth. More = more power.
- **epochs**: Data passes. More = better learning.
- **batch size**: Examples per step.
- **learning rate**: Learning speed. Small = stable. Large = fast but chaotic.
- **dropout**: Regularization. Prevent overfitting.

### 3. Train

Click **Train**. Watch loss drop. Good sign.

Progress bar shows status.

### 4. Generate

Give **seed** (char or words). Model continues text.

Adjust **temperature** for vibe:
- 0.5 = conservative. Predictable.
- 1.0 = normal. Good balance.
- 2.0 = creative. Chaotic. Weird.

### 5. Save

Click **Export Model**. Download checkpoint JSON.

Load later with **Import Model**.

## Training Tips

| Dataset | Parameters |
|---------|-----------|
| **Small** (<10k chars) | blockSize=32, nEmbd=64, nHeads=2, nLayers=2 |
| **Medium** (10k-100k) | blockSize=128, nEmbd=256, nHeads=4, nLayers=4 |
| **Large** (>100k) | blockSize=256, nEmbd=512, nHeads=8, nLayers=6 |

More epochs if loss stalls. Lower learning rate if diverges.

## PWA Features

✅ **Installable**: "Add to homescreen"  
✅ **Offline**: Works without internet after first load  
✅ **Clean icon**: Orange infinity on all devices  
✅ **Dark theme**: No eye burn  
✅ **Fast**: Service worker caches everything

## Tech Stack

- **Vanilla JS**: No dependencies. Lightweight.
- **WebGL**: Fast CPU math.
- **LocalStorage**: Save models in browser.
- **Service Worker**: Offline + caching.

## Limitations

- Small models only. (No GPU in browser.)
- Slow on huge data. (JS not optimized.)
- Memory limited. (Browser max ~1GB.)

## Troubleshooting

**Service Worker 404?**
→ File missing on server. Upload all files. Same folder.

**Loss not dropping?**
→ Learning rate too big. Lower to 0.001. Or bad text format.

**App very slow?**
→ Too much data. Reduce. Or params too big.

**Model generates nonsense?**
→ Not enough epochs. Train longer.

## Resources

- [Transformers](https://en.wikipedia.org/wiki/Transformer_(machine_learning_model)) — Architecture
- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) — Original paper
- [Neural Networks Zero to Hero](https://www.youtube.com/@AndrejKarpathy) — Karpathy course

## License

MIT. Free to use. Credits appreciated.

---

**Built with ❤️ and lots of JavaScript.**

Happy training!
