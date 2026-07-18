"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SentimentResult = { label: string; score: number };
type Classifier = (
  input: string,
  options?: Record<string, unknown>,
) => Promise<SentimentResult[]>;

const MODEL_ID = "AdamCodd/tinybert-sentiment-amazon";
const EXAMPLES = [
  "This product is fantastic and made my day!",
  "It arrived late and stopped working immediately.",
  "The quality is fine, but the packaging could be better.",
];

export default function Home() {
  const classifierRef = useRef<Classifier | null>(null);
  const loadingRef = useRef(false);
  const [text, setText] = useState(EXAMPLES[0]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Model not loaded");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const loadModel = useCallback(async () => {
    if (classifierRef.current || loadingRef.current) return classifierRef.current;
    loadingRef.current = true;
    setStatus("loading");
    setStatusText("Preparing the tiny AI model…");
    try {
      const { pipeline, env } = await import("@huggingface/transformers");
      env.allowLocalModels = false;
      const classifier = await pipeline("sentiment-analysis", MODEL_ID, {
        dtype: "fp32",
        progress_callback: (event: { status?: string; progress?: number; file?: string }) => {
          if (typeof event.progress === "number") {
            setProgress(Math.max(1, Math.min(100, Math.round(event.progress))));
          }
          if (event.status === "progress") setStatusText("Downloading model securely…");
          if (event.status === "ready") setStatusText("Model ready");
        },
      });
      classifierRef.current = classifier as unknown as Classifier;
      setProgress(100);
      setStatus("ready");
      setStatusText("Ready · analysis stays on this device");
      loadingRef.current = false;
      return classifierRef.current;
    } catch (error) {
      console.error(error);
      setStatus("error");
      setStatusText("Could not load the model. Check your connection and retry.");
      loadingRef.current = false;
      return null;
    }
  }, []);

  useEffect(() => {
    void loadModel();
  }, [loadModel]);

  async function analyze() {
    if (!text.trim()) return;
    setAnalyzing(true);
    setResult(null);
    const classifier = classifierRef.current ?? (await loadModel());
    if (!classifier) {
      setAnalyzing(false);
      return;
    }
    try {
      const output = await classifier(text.trim());
      setResult(output[0]);
    } catch (error) {
      console.error(error);
      setStatusText("Analysis failed. Try a shorter English sentence.");
    } finally {
      setAnalyzing(false);
    }
  }

  const positive = result
    ? result.label.toLowerCase().includes("pos")
      ? result.score
      : 1 - result.score
    : 0;
  const confidence = result ? Math.round(result.score * 100) : 0;

  return (
    <main>
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="PulseCheck home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>PulseCheck</span>
        </a>
        <div className="nav-meta">
          <span className="privacy-pill"><span className="privacy-dot" /> Private by design</span>
          <a href={`https://huggingface.co/${MODEL_ID}`} target="_blank" rel="noreferrer">Model card ↗</a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow">Tiny AI · Big signal</div>
        <h1>Understand the feeling<br />behind the words.</h1>
        <p className="hero-copy">Fast, private sentiment analysis that runs entirely in your browser. No account. No text uploaded. Just a clear signal.</p>
        <div className="trust-row" aria-label="Product features">
          <span>4.4M parameters</span><span>English</span><span>Runs on-device</span>
        </div>
      </section>

      <section className="analyzer shell" aria-label="Sentiment analyzer">
        <div className="input-panel">
          <div className="panel-heading">
            <label htmlFor="sentiment-text">Your text</label>
            <span>{text.length} / 500</span>
          </div>
          <textarea
            id="sentiment-text"
            value={text}
            maxLength={500}
            onChange={(event) => { setText(event.target.value); setResult(null); }}
            placeholder="Type or paste an English sentence…"
          />
          <div className="input-footer">
            <div className={`model-status ${status}`}>
              <span className="status-icon" aria-hidden="true" />
              <span>{statusText}</span>
            </div>
            <button onClick={analyze} disabled={!text.trim() || analyzing || status === "loading"}>
              {analyzing ? "Reading tone…" : status === "loading" ? `Loading ${progress}%` : "Analyze sentiment"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
          {status === "loading" && <div className="progress-track" aria-label={`Model loading ${progress}%`}><span style={{ width: `${progress}%` }} /></div>}
        </div>

        <div className={`result-panel ${result ? (positive >= 0.5 ? "is-positive" : "is-negative") : "empty"}`} aria-live="polite">
          {result ? (
            <>
              <div className="result-topline"><span>Result</span><span>{confidence}% confidence</span></div>
              <div className="result-main">
                <div className="face" aria-hidden="true"><span /><span /><i /></div>
                <div>
                  <p>This reads as</p>
                  <h2>{positive >= 0.5 ? "Positive" : "Negative"}</h2>
                </div>
              </div>
              <div className="meter-labels"><span>Negative</span><span>Positive</span></div>
              <div className="sentiment-meter"><span style={{ width: `${Math.round(positive * 100)}%` }} /></div>
              <p className="score-note">The model is {confidence}% confident in this classification.</p>
            </>
          ) : (
            <div className="empty-state">
              <div className="signal-icon" aria-hidden="true"><i /><i /><i /><i /></div>
              <h2>Your result will appear here</h2>
              <p>Enter some text, then select “Analyze sentiment” to reveal its emotional signal.</p>
            </div>
          )}
        </div>
      </section>

      <section className="examples shell">
        <div>
          <span className="section-number">01</span>
          <h2>Need a starting point?</h2>
        </div>
        <div className="example-list">
          {EXAMPLES.map((example, index) => (
            <button key={example} onClick={() => { setText(example); setResult(null); }}>
              <span>0{index + 1}</span><q>{example}</q><i>Try it →</i>
            </button>
          ))}
        </div>
      </section>

      <section className="details shell">
        <article><span className="detail-icon lock">⌁</span><h3>Private by default</h3><p>Your writing never leaves your device. The model runs locally after its first download.</p></article>
        <article><span className="detail-icon bolt">ϟ</span><h3>Small and fast</h3><p>A compact TinyBERT model gives quick results without requiring a powerful computer.</p></article>
        <article><span className="detail-icon scope">◎</span><h3>Know its limits</h3><p>Designed for English product-style text. Bangla, Banglish, sarcasm, and subtle context may be misread.</p></article>
      </section>

      <footer className="shell">
        <p>PulseCheck <span>·</span> Browser-based sentiment analysis</p>
        <p>Powered by <a href="https://huggingface.co" target="_blank" rel="noreferrer">Hugging Face</a> + Transformers.js</p>
      </footer>
    </main>
  );
}
