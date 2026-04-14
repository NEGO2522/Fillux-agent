import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../firebase/firebase";

const FEATURES = [
  { icon: "🔍", title: "Smart Detection", desc: "Reads any form structure automatically" },
  { icon: "⚡", title: "Instant Fill",    desc: "Completes forms in under 2 seconds"    },
  { icon: "🔒", title: "Private & Safe",  desc: "Your data stays in Supabase, not shared" },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialMode = new URLSearchParams(location.search).get("mode") === "signup" ? "signup" : "login";
  const [mode,        setMode]        = useState(initialMode);
  const [email,       setEmail]       = useState("");
  const [pass,        setPass]        = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [fullName,    setFullName]    = useState("");
  const [error,       setError]       = useState("");
  const [busy,        setBusy]        = useState(false);

  const [ef,  setEf]  = useState(false);
  const [pf,  setPf]  = useState(false);
  const [cpf, setCpf] = useState(false);
  const [nf,  setNf]  = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await goToCorrectPage(session.user);
    });
  }, []);

  const clearErr = () => setError("");

  const switchMode = (m) => {
    setMode(m);
    setFullName("");
    setConfirmPass("");
    clearErr();
  };

  const goToCorrectPage = async (u) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("uid")
        .eq("uid", u.id)
        .single();
      navigate(data ? "/home" : "/form", { replace: true });
    } catch {
      navigate("/form", { replace: true });
    }
  };

  const handleSubmit = async () => {
    if (!email || !pass) { setError("Enter your email and password."); return; }
    if (mode === "signup") {
      if (!fullName.trim())     { setError("Please enter your full name."); return; }
      if (pass.length < 6)      { setError("Password must be at least 6 characters."); return; }
      if (pass !== confirmPass) { setError("Passwords do not match. Please try again."); return; }
    }
    clearErr(); setBusy(true);
    try {
      let result;
      if (mode === "login") {
        result = await supabase.auth.signInWithPassword({ email, password: pass });
      } else {
        result = await supabase.auth.signUp({
          email, password: pass,
          options: { data: { full_name: fullName.trim() } },
        });
      }
      if (result.error) throw result.error;
      if (result.data?.user) await goToCorrectPage(result.data.user);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally { setBusy(false); }
  };

  return (
    <div className="fl-root">

      {/* ═══ LEFT PANEL — desktop only ═══ */}
      <div className="fl-left">
        <div className="fl-grid-overlay" />
        <div className="fl-glow-blob" />

        <div className="fl-left-inner">
          <div className="fl-brand">
            <div className="fl-brand-icon">⚡</div>
            <span className="fl-brand-name">Fillux</span>
          </div>

          <div className="fl-hero">
            <div className="fl-badge">Smart Form Autofill</div>
            <h1 className="fl-headline">
              Stop filling<br />forms <span className="fl-dim">manually.</span>
            </h1>
            <p className="fl-sub">
              Fillux reads any web form and completes it instantly using your saved profile. One click. Every form.
            </p>
            <div className="fl-features">
              {FEATURES.map(f => (
                <div key={f.title} className="fl-feature-row">
                  <div className="fl-feature-icon">{f.icon}</div>
                  <div>
                    <div className="fl-feature-title">{f.title}</div>
                    <div className="fl-feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="fl-footer">© 2025 Fillux · MIT License</div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — form ═══ */}
      <div className="fl-right">
        <div className="fl-form-wrap">

          {/* Mobile brand */}
          <div className="fl-mobile-brand">
            <div className="fl-brand-icon fl-brand-icon--sm">⚡</div>
            <span className="fl-brand-name fl-brand-name--sm">Fillux</span>
          </div>

          {/* Mode toggle */}
          <div className="fl-toggle">
            {["login", "signup"].map(m => (
              <button
                key={m}
                className={`fl-toggle-btn${mode === m ? " fl-toggle-btn--active" : ""}`}
                onClick={() => switchMode(m)}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="fl-heading">
            <h2 className="fl-h2">
              {mode === "login" ? "Welcome back" : "Get started"}
            </h2>
            <p className="fl-h2-sub">
              {mode === "login" ? "Sign in to your Fillux account" : "Create your free account in seconds"}
            </p>
          </div>

          {/* Full Name — signup only */}
          {mode === "signup" && (
            <div className="fl-field">
              <label className="fl-label">Full Name</label>
              <input
                className={`fl-input${nf ? " fl-input--focus" : ""}`}
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                disabled={busy}
                onFocus={() => setNf(true)}
                onBlur={() => setNf(false)}
              />
            </div>
          )}

          {/* Email */}
          <div className="fl-field">
            <label className="fl-label">Email address</label>
            <input
              className={`fl-input${ef ? " fl-input--focus" : ""}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              disabled={busy}
              onFocus={() => setEf(true)}
              onBlur={() => setEf(false)}
            />
          </div>

          {/* Password */}
          <div className="fl-field">
            <div className="fl-label-row">
              <label className="fl-label">Password</label>
              {mode === "login" && <span className="fl-forgot">Forgot?</span>}
            </div>
            <input
              className={`fl-input${pf ? " fl-input--focus" : ""}`}
              type="password"
              placeholder={mode === "signup" ? "Min. 6 characters" : "••••••••"}
              value={pass}
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              disabled={busy}
              onFocus={() => setPf(true)}
              onBlur={() => setPf(false)}
            />
          </div>

          {/* Re-enter Password — signup only */}
          {mode === "signup" && (
            <div className="fl-field">
              <label className="fl-label">Re-enter Password</label>
              <input
                className={`fl-input${cpf ? " fl-input--focus" : ""}${confirmPass && pass !== confirmPass ? " fl-input--error" : ""}`}
                type="password"
                placeholder="Confirm your password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                disabled={busy}
                onFocus={() => setCpf(true)}
                onBlur={() => setCpf(false)}
              />
              {confirmPass && pass !== confirmPass && (
                <p className="fl-inline-error">Passwords don't match</p>
              )}
            </div>
          )}

          {/* Error banner */}
          {error && <div className="fl-error-banner">{error}</div>}

          {/* Submit */}
          <button className="fl-submit" onClick={handleSubmit} disabled={busy}>
            {busy && <span className="fl-spinner" />}
            {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>

          {/* Switch mode */}
          <p className="fl-switch">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              className="fl-switch-btn"
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .fl-root {
          display: flex;
          min-height: 100vh; min-height: 100dvh;
          background: #080808;
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        }

        .fl-left {
          display: none; position: relative; width: 52%;
          flex-direction: column; overflow: hidden;
          border-right: 1px solid rgba(255,255,255,0.06);
          background: #0c0c0c;
        }
        @media (min-width: 1024px) { .fl-left { display: flex; } }

        .fl-grid-overlay {
          pointer-events: none; position: absolute; inset: 0; opacity: 0.035;
          background-image: linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 44px 44px;
        }
        .fl-glow-blob {
          pointer-events: none; position: absolute;
          bottom: -8rem; left: -8rem; height: 500px; width: 500px;
          border-radius: 9999px; background: white; opacity: 0.018; filter: blur(96px);
        }
        .fl-left-inner {
          position: relative; z-index: 10; display: flex;
          height: 100%; flex-direction: column; padding: 3rem 3.5rem;
        }

        .fl-brand { display: flex; align-items: center; gap: 0.75rem; }
        .fl-brand-icon {
          display: flex; height: 2.25rem; width: 2.25rem;
          align-items: center; justify-content: center;
          border-radius: 0.75rem; background: white; color: black;
          font-size: 1rem; font-weight: 900; flex-shrink: 0;
        }
        .fl-brand-icon--sm { height: 2rem; width: 2rem; font-size: 0.875rem; border-radius: 0.625rem; }
        .fl-brand-name {
          font-size: 1.0625rem; font-weight: 700; letter-spacing: -0.02em; color: white;
          font-family: 'Comic Sans MS', 'Comic Sans', cursive;
        }
        .fl-brand-name--sm { font-size: 1rem; }

        .fl-hero { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 4rem 0; }
        .fl-badge {
          display: inline-block; margin-bottom: 1.75rem; border-radius: 9999px;
          padding: 0.375rem 1rem; font-size: 0.6875rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.15em; color: rgba(255,255,255,0.3);
        }
        .fl-headline {
          margin-bottom: 1.25rem; font-size: 3.25rem; font-weight: 800;
          line-height: 1.05; letter-spacing: -0.04em; color: white;
        }
        .fl-dim { color: rgba(255,255,255,0.25); }
        .fl-sub {
          margin-bottom: 3rem; max-width: 380px; font-size: 0.9375rem;
          line-height: 1.75; color: rgba(255,255,255,0.35);
        }
        .fl-features { display: flex; flex-direction: column; gap: 1rem; }
        .fl-feature-row { display: flex; align-items: center; gap: 1rem; }
        .fl-feature-icon {
          display: flex; height: 2.5rem; width: 2.5rem; flex-shrink: 0;
          align-items: center; justify-content: center; border-radius: 0.75rem;
          border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); font-size: 1rem;
        }
        .fl-feature-title { font-size: 0.8125rem; font-weight: 600; color: rgba(255,255,255,0.7); }
        .fl-feature-desc  { font-size: 0.75rem; color: rgba(255,255,255,0.3); }
        .fl-footer { font-size: 0.75rem; color: rgba(255,255,255,0.15); }

        .fl-right {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 1.25rem 1rem;
          padding-bottom: calc(1.25rem + env(safe-area-inset-bottom));
          overflow-y: auto;
        }
        @media (min-width: 480px) { .fl-right { padding: 2rem 1.5rem; } }
        @media (min-width: 768px) { .fl-right { padding: 3rem 2rem; } }

        .fl-form-wrap { width: 100%; max-width: 400px; padding-top: 0.5rem; padding-bottom: 1rem; }

        .fl-mobile-brand { display: flex; align-items: center; gap: 0.625rem; margin-bottom: 1.75rem; }
        @media (min-width: 1024px) { .fl-mobile-brand { display: none; } }

        .fl-toggle {
          display: flex; gap: 0.25rem; border-radius: 0.875rem;
          border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04);
          padding: 0.25rem; margin-bottom: 1.5rem;
        }
        .fl-toggle-btn {
          flex: 1; border-radius: 0.625rem; padding: 0.625rem 0;
          font-size: 0.8125rem; font-weight: 600; border: none; cursor: pointer;
          transition: all 0.2s; background: transparent; color: rgba(255,255,255,0.35);
          font-family: inherit; min-height: 2.5rem;
        }
        .fl-toggle-btn--active { background: white; color: black; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }

        .fl-heading { margin-bottom: 1.25rem; }
        .fl-h2 { font-size: clamp(1.375rem, 5vw, 1.625rem); font-weight: 800; letter-spacing: -0.03em; color: white; }
        .fl-h2-sub { margin-top: 0.25rem; font-size: 0.875rem; color: rgba(255,255,255,0.35); }

        .fl-field { margin-bottom: 0.875rem; }
        .fl-label {
          display: block; margin-bottom: 0.4rem; font-size: 0.6875rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.35);
        }
        .fl-label-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; }
        .fl-forgot { font-size: 0.6875rem; color: rgba(255,255,255,0.2); cursor: pointer; }

        .fl-input {
          width: 100%; border-radius: 0.6875rem;
          border: 1px solid rgba(255,255,255,0.09); background: rgba(255,255,255,0.04);
          padding: 0.8125rem 0.875rem; font-size: 1rem; color: white; outline: none;
          transition: border-color 0.2s, background-color 0.2s;
          font-family: inherit; -webkit-appearance: none; appearance: none;
        }
        @media (min-width: 480px) { .fl-input { font-size: 0.875rem; padding: 0.6875rem 0.875rem; } }
        .fl-input--focus { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.06); }
        .fl-input--error { border-color: rgba(239,68,68,0.5) !important; }
        .fl-input:disabled { opacity: 0.4; }
        .fl-input::placeholder { color: rgba(255,255,255,0.15); }

        .fl-inline-error { margin-top: 0.35rem; font-size: 0.75rem; color: rgb(248,113,113); }

        .fl-error-banner {
          margin-bottom: 0.875rem; border-radius: 0.625rem;
          border: 1px solid rgba(239,68,68,0.2); background: rgba(239,68,68,0.07);
          padding: 0.75rem 1rem; font-size: 0.8125rem; font-weight: 500; color: rgb(248,113,113);
        }

        .fl-submit {
          display: flex; width: 100%; align-items: center; justify-content: center;
          gap: 0.625rem; border-radius: 0.75rem; background: white; padding: 0.9375rem 0;
          font-size: 0.9375rem; font-weight: 700; color: black; border: none; cursor: pointer;
          transition: background-color 0.2s, opacity 0.2s; font-family: inherit;
          min-height: 3rem; margin-top: 0.25rem; -webkit-tap-highlight-color: transparent;
        }
        .fl-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        .fl-submit:not(:disabled):hover { background: rgba(255,255,255,0.88); }
        .fl-submit:not(:disabled):active { background: rgba(255,255,255,0.75); transform: scale(0.99); }

        @keyframes aSpin { to { transform: rotate(360deg); } }
        .fl-spinner {
          display: block; height: 1rem; width: 1rem; border-radius: 9999px;
          border: 2px solid rgba(0,0,0,0.2); border-top-color: black;
          animation: aSpin 0.7s linear infinite; flex-shrink: 0;
        }

        .fl-switch { margin-top: 1.125rem; text-align: center; font-size: 0.8125rem; color: rgba(255,255,255,0.25); }
        .fl-switch-btn {
          font-weight: 600; color: rgba(255,255,255,0.6); background: none; border: none;
          cursor: pointer; padding: 0; font-size: inherit; font-family: inherit;
          -webkit-tap-highlight-color: transparent;
        }
        .fl-switch-btn:hover { color: rgba(255,255,255,0.85); }

        @media (max-width: 359px) {
          .fl-form-wrap { padding-left: 0.25rem; padding-right: 0.25rem; }
          .fl-h2 { font-size: 1.25rem; }
        }
      `}</style>
    </div>
  );
}
