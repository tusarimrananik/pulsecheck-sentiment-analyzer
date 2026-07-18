# PulseCheck Sentiment Analyzer

A fast, private sentiment-analysis website powered by a lightweight TinyBERT model. PulseCheck classifies English text as positive or negative directly inside the browser—no account, API key, or backend inference server required.

**Live website:** [pulsecheck-sentiment-alpha.vercel.app](https://pulsecheck-sentiment-alpha.vercel.app/)

## Features

- Client-side sentiment analysis with Transformers.js
- Lightweight 4.4M-parameter TinyBERT model
- Positive/negative classification with confidence score
- Model download progress and clear loading states
- Example sentences for quick testing
- Responsive, accessible interface
- Text stays on the user's device
- No API key or server-side model hosting

## Model

PulseCheck uses [`AdamCodd/tinybert-sentiment-amazon`](https://huggingface.co/AdamCodd/tinybert-sentiment-amazon), a TinyBERT text-classification model trained on Amazon polarity data.

The model is intended for English product-style feedback. Bangla, Banglish, sarcasm, mixed sentiment, and subtle context may not be classified reliably.

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Transformers.js
- Hugging Face Hub
- Tailwind CSS
- Vercel

## Run locally

```bash
git clone https://github.com/tusarimrananik/pulsecheck-sentiment-analyzer.git
cd pulsecheck-sentiment-analyzer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The model is downloaded from Hugging Face when the application first loads. A network connection is needed for the initial download; the browser can reuse its cached files afterward.

## Production build

```bash
npm run build
npm start
```

## Privacy

User-entered text is processed locally in the browser. This project does not send the analyzed text to its own server or store it in a database.

## Limitations

- English only
- Binary positive/negative classification
- Optimized for product and review-style text
- AI predictions can be incorrect
- The initial model download may take time on slower connections

## License

Released under the [MIT License](LICENSE).
