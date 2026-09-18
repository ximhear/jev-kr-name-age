import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import type { Prediction } from "../server/predict.ts";
import { BANDS, bandOf } from "./bands.ts";

const EXAMPLES = ["서준", "지혜", "영수", "민지", "순자", "현우", "하린", "말자"];

type Shown = { name: string; result: Prediction };

export default function App() {
  const [name, setName] = useState("");
  // The last successful result stays on screen while the next one loads, so the card updates in place.
  const [shown, setShown] = useState<Shown | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);

  async function predict(target: string) {
    const trimmed = target.trim();
    if (!trimmed) return;
    const id = ++latest.current;
    setName(trimmed);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/age?name=${encodeURIComponent(trimmed)}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      if (id === latest.current) setShown({ name: trimmed, result: body });
    } catch (err) {
      if (id === latest.current) setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (id === latest.current) setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    predict(name);
  }

  // The whole page takes on the predicted band's color; --accent is a registered property, so it transitions.
  const accent = shown ? bandOf(shown.result.age.choice).color : undefined;

  return (
    <div className="page" style={accent ? ({ "--accent": accent } as CSSProperties) : undefined}>
      <div className="blobs" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <main className="wrap">
        <header>
          <p className="eyebrow">
            <span className="dot" /> powered by Jev
          </p>
          <h1>
            이름만 대봐,
            <br />
            <span className="hl">나이 맞혀볼게</span> <span className="wave">👀</span>
          </h1>
          <p className="lede">요즘 이름 vs 옛날 이름, 작명 트렌드로 나이대를 콕 집어드려요.</p>
        </header>

        <form onSubmit={onSubmit} className="search">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력해 주세요"
            maxLength={5}
            autoFocus
            aria-label="이름"
          />
          <button disabled={loading || !name.trim()}>{loading ? <span className="spinner" /> : "맞혀봐!"}</button>
        </form>

        <div className="chips">
          {EXAMPLES.map((ex, i) => (
            <button
              key={ex}
              type="button"
              onClick={() => predict(ex)}
              disabled={loading}
              style={{ "--chip": BANDS[i % BANDS.length].color } as CSSProperties}
            >
              {ex}
            </button>
          ))}
        </div>

        {error && (
          <p className="error">
            <span>😵</span> {error}
          </p>
        )}
        {shown ? <Result {...shown} busy={loading} /> : loading && <Loading />}

        <footer>이름만으로 하는 재미용 추정이에요. 실제 나이와 다를 수 있어요 ✌️</footer>
      </main>
    </div>
  );
}

function Loading() {
  return (
    <div className="loading" aria-live="polite">
      {BANDS.map((b, i) => (
        <span key={b.key} style={{ animationDelay: `${i * 90}ms` }}>
          {b.emoji}
        </span>
      ))}
      <p>이름 기운 읽는 중…</p>
    </div>
  );
}

/** Eases a displayed number toward `value` instead of jumping. */
function useTweened(value: number, duration = 700) {
  const [shown, setShown] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const origin = from.current;
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const v = origin + (value - origin) * (1 - (1 - t) ** 3);
      from.current = v;
      setShown(v);
      if (t < 1) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return shown;
}

function Pct({ value }: { value: number }) {
  return <>{Math.round(useTweened(value * 100))}%</>;
}

function Result({ name, result, busy }: Shown & { busy: boolean }) {
  const { age, gender } = result;
  const top = bandOf(age.choice);
  const probs = age.probabilities as Record<string, number>;
  const max = Math.max(...BANDS.map((b) => probs[b.key] ?? 0));

  // Bars start at zero on first mount, then transition to (and between) real widths.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className={`card${busy ? " busy" : ""}`} aria-busy={busy}>
      <div className="hero">
        <div className="emoji">
          <span key={top.key}>{top.emoji}</span>
        </div>
        <div>
          <p className="who">
            <strong key={name} className="swap">
              {name}
            </strong>{" "}
            님은 아마…
          </p>
          <p key={top.key} className="band swap">
            {top.key}!
          </p>
          <p key={`${top.key}-tag`} className="tagline swap">
            #{top.tagline}
          </p>
        </div>
      </div>

      <div className="stats">
        <div>
          <span>확신도</span>
          <strong>
            <Pct value={age.confidence} />
          </strong>
        </div>
        <div>
          <span>추정 성별</span>
          <strong>
            {gender.choice === "남성" ? "🙋‍♂️" : "🙋‍♀️"} {gender.choice}{" "}
            <Pct value={gender.probabilities[gender.choice]} />
          </strong>
        </div>
      </div>

      <ul className="bars">
        {BANDS.map((b, i) => {
          const p = probs[b.key] ?? 0;
          const width = ready && max ? Math.max((p / max) * 100, 2) : 0;
          return (
            <li
              key={b.key}
              className={b.key === top.key ? "top" : ""}
              style={{ "--c": b.color, "--w": `${width}%`, "--i": i } as CSSProperties}
            >
              <span className="label">
                <span className="mini">{b.emoji}</span>
                {b.key}
              </span>
              <span className="track">
                <span className="fill" />
              </span>
              <span className="value">
                <Pct value={p} />
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
