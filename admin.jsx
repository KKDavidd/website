import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, deleteDoc, doc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAafCFyainmMmbaVt4Vl_EHnjgRpFJgfU0",
    authDomain: "crazyportfoliom.firebaseapp.com",
    projectId: "crazyportfoliom",
    storageBucket: "crazyportfoliom.firebasestorage.app",
    messagingSenderId: "679897293455",
    appId: "1:679897293455:web:6b445c414e297bd45006fa"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ─── Global styles injected once ─── */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Montserrat', sans-serif; background: #3a2e27; color: #f5f0e6; }

  /* login page background pattern */
  .login-bg {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(212,195,163,0.07) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(212,195,163,0.05) 0%, transparent 50%),
      #3a2e27;
  }

  .login-card {
    background: linear-gradient(145deg, #2a211c, #322820);
    border: 1px solid rgba(212,195,163,0.2);
    border-radius: 20px;
    padding: 52px 44px 44px;
    width: 100%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,195,163,0.05);
  }

  .login-monogram {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #d4c3a3, #a89070);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 20px;
    font-size: 22px; font-weight: 700; color: #1a1411;
    letter-spacing: 1px;
  }

  .login-title {
    color: #d4c3a3;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: 2px;
    margin-bottom: 4px;
  }

  .login-sub {
    color: #8e7865;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 36px;
  }

  .login-divider {
    width: 40px; height: 2px;
    background: linear-gradient(90deg, transparent, #d4c3a3, transparent);
    margin: 0 auto 32px;
  }

  .login-field {
    position: relative;
    margin-bottom: 14px;
    text-align: left;
  }

  .login-field label {
    display: block;
    font-size: 10px;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #8e7865;
    margin-bottom: 6px;
    font-weight: 600;
  }

  .login-field input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(212,195,163,0.2);
    border-radius: 10px;
    padding: 13px 16px;
    color: #f5f0e6;
    font-family: 'Montserrat', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }

  .login-field input:focus {
    border-color: rgba(212,195,163,0.55);
    background: rgba(255,255,255,0.07);
  }

  .login-btn {
    width: 100%;
    margin-top: 8px;
    padding: 14px;
    background: linear-gradient(135deg, #d4c3a3, #c4ae8a);
    color: #1a1411;
    border: none;
    border-radius: 10px;
    font-family: 'Montserrat', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
    box-shadow: 0 4px 20px rgba(212,195,163,0.25);
  }

  .login-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .login-btn:active { transform: translateY(0); }
  .login-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .login-error {
    background: rgba(220,80,80,0.12);
    border: 1px solid rgba(220,80,80,0.3);
    border-radius: 8px;
    color: #e07070;
    font-size: 13px;
    padding: 10px 14px;
    margin-top: 4px;
    text-align: left;
  }

  /* ── Dashboard ── */
  .dash { min-height: 100vh; display: flex; flex-direction: column; background: #3a2e27; }

  .dash-header {
    background: linear-gradient(90deg, #1e1610, #2a211c);
    border-bottom: 1px solid rgba(212,195,163,0.12);
    padding: 0 36px;
    height: 62px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 20px rgba(0,0,0,0.3);
  }

  .dash-header-left { display: flex; align-items: center; gap: 14px; }

  .dash-logo-dot {
    width: 34px; height: 34px; border-radius: 10px;
    background: linear-gradient(135deg, #d4c3a3, #a89070);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px; color: #1a1411; letter-spacing: 0.5px;
  }

  .dash-header-title { color: #d4c3a3; font-weight: 700; font-size: 16px; letter-spacing: 0.5px; }
  .dash-header-sep { color: rgba(212,195,163,0.3); font-size: 16px; }
  .dash-header-sub { color: #8e7865; font-size: 13px; }

  .dash-header-right { display: flex; align-items: center; gap: 16px; }

  .dash-user-pill {
    display: flex; align-items: center; gap: 8px;
    background: rgba(212,195,163,0.07);
    border: 1px solid rgba(212,195,163,0.12);
    border-radius: 30px;
    padding: 6px 14px 6px 10px;
  }

  .dash-user-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: linear-gradient(135deg, #d4c3a3, #a89070);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #1a1411;
    flex-shrink: 0;
  }

  .dash-user-email { color: #a89070; font-size: 12px; }

  .dash-logout-btn {
    background: transparent;
    border: 1px solid rgba(212,195,163,0.25);
    color: #d4c3a3;
    border-radius: 8px;
    padding: 8px 18px;
    font-family: 'Montserrat', sans-serif;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1px;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }
  .dash-logout-btn:hover { background: rgba(212,195,163,0.08); border-color: rgba(212,195,163,0.4); }

  /* ── Main content ── */
  .dash-main { flex: 1; max-width: 900px; width: 100%; margin: 0 auto; padding: 40px 24px; }

  /* ── Stats ── */
  .stats-row { display: flex; gap: 16px; margin-bottom: 40px; }

  .stat-card {
    flex: 1;
    background: linear-gradient(145deg, #2a211c, #302620);
    border: 1px solid rgba(212,195,163,0.12);
    border-radius: 16px;
    padding: 24px 28px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }

  .stat-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: rgba(212,195,163,0.1);
    border: 1px solid rgba(212,195,163,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }

  .stat-info { display: flex; flex-direction: column; }
  .stat-num { color: #d4c3a3; font-size: 30px; font-weight: 700; line-height: 1; }
  .stat-label { color: #8e7865; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-top: 5px; }

  /* ── Section header ── */
  .section-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(212,195,163,0.1);
  }

  .section-title-wrap { display: flex; align-items: center; gap: 10px; }
  .section-title-dot { width: 4px; height: 20px; border-radius: 2px; background: linear-gradient(180deg, #d4c3a3, #a89070); }
  .section-title { color: #f5f0e6; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }

  .refresh-btn {
    display: flex; align-items: center; gap: 6px;
    background: rgba(212,195,163,0.07);
    border: 1px solid rgba(212,195,163,0.2);
    color: #d4c3a3;
    border-radius: 8px;
    padding: 8px 16px;
    font-family: 'Montserrat', sans-serif;
    font-size: 12px; font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .refresh-btn:hover { background: rgba(212,195,163,0.13); }

  /* ── Empty state ── */
  .empty-state {
    text-align: center;
    padding: 80px 20px;
    color: #8e7865;
  }
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
  .empty-title { font-size: 16px; font-weight: 600; color: #a89070; margin-bottom: 6px; }
  .empty-sub { font-size: 13px; color: #8e7865; }

  /* ── Message cards ── */
  .msg-list { display: flex; flex-direction: column; gap: 10px; }

  .msg-card {
    background: linear-gradient(145deg, #2a211c, #2e2419);
    border: 1px solid rgba(212,195,163,0.1);
    border-radius: 14px;
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .msg-card:hover { border-color: rgba(212,195,163,0.25); box-shadow: 0 4px 20px rgba(0,0,0,0.2); }
  .msg-card.expanded { border-color: rgba(212,195,163,0.3); }

  .msg-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    cursor: pointer;
    gap: 12px;
  }

  .msg-card-left { display: flex; align-items: center; gap: 14px; min-width: 0; }

  .msg-avatar {
    width: 40px; height: 40px; border-radius: 12px;
    background: rgba(212,195,163,0.1);
    border: 1px solid rgba(212,195,163,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 700; color: #d4c3a3;
    flex-shrink: 0;
  }

  .msg-name { color: #f5f0e6; font-weight: 700; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .msg-email { color: #8e7865; font-size: 12px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .msg-card-right { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
  .msg-date { color: #8e7865; font-size: 12px; white-space: nowrap; }
  .msg-chevron { color: #d4c3a3; font-size: 10px; transition: transform 0.2s; }
  .msg-chevron.open { transform: rotate(180deg); }

  .msg-card-body {
    border-top: 1px solid rgba(212,195,163,0.08);
    padding: 20px 22px;
    background: rgba(0,0,0,0.1);
  }

  .msg-label {
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: #8e7865; font-weight: 600; margin-bottom: 10px;
  }

  .msg-text {
    color: #f5f0e6;
    font-size: 14px;
    line-height: 1.75;
    white-space: pre-wrap;
    background: rgba(212,195,163,0.04);
    border: 1px solid rgba(212,195,163,0.08);
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .msg-actions { display: flex; gap: 10px; }

  .reply-btn {
    display: flex; align-items: center; gap: 7px;
    background: linear-gradient(135deg, #d4c3a3, #c4ae8a);
    color: #1a1411;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    text-decoration: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 12px; font-weight: 700;
    letter-spacing: 0.5px;
    transition: opacity 0.2s, transform 0.1s;
    box-shadow: 0 2px 12px rgba(212,195,163,0.2);
  }
  .reply-btn:hover { opacity: 0.9; transform: translateY(-1px); }

  .delete-btn {
    display: flex; align-items: center; gap: 7px;
    background: rgba(220,80,80,0.08);
    border: 1px solid rgba(220,80,80,0.25);
    color: #e07070;
    border-radius: 8px;
    padding: 10px 18px;
    font-family: 'Montserrat', sans-serif;
    font-size: 12px; font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
  }
  .delete-btn:hover { background: rgba(220,80,80,0.15); border-color: rgba(220,80,80,0.4); }
  .delete-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* ── Loading ── */
  .loading-state { text-align: center; padding: 60px; color: #8e7865; font-size: 14px; letter-spacing: 1px; }
`;

function injectStyles() {
    if (document.getElementById("admin-styles")) return;
    const el = document.createElement("style");
    el.id = "admin-styles";
    el.textContent = globalCSS;
    document.head.appendChild(el);
}

/* ─── Login Page ─── */
function LoginPage({ onLogin, error }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    injectStyles();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        await onLogin(email, password);
        setLoading(false);
    }

    return (
        <div className="login-bg">
            <div className="login-card">
                <div className="login-monogram">KD</div>
                <div className="login-title">K. Dávid</div>
                <div className="login-sub">Admin Panel</div>
                <div className="login-divider" />
                <form onSubmit={handleSubmit}>
                    <div className="login-field">
                        <label>E-mail cím</label>
                        <input
                            type="email"
                            placeholder="pelda@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="login-field">
                        <label>Jelszó</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="login-error">⚠ {error}</div>}
                    <button type="submit" className="login-btn" disabled={loading} style={{marginTop: 20}}>
                        {loading ? "Belépés..." : "Belépés"}
                    </button>
                </form>
            </div>
        </div>
    );
}

/* ─── Message Card ─── */
function MessageCard({ msg, onDelete }) {
    const [deleting, setDeleting] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const date = msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp);
    const dateStr = isNaN(date) ? "–" : date.toLocaleString("hu-HU", { year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
    const initials = (msg.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    async function handleDelete() {
        if (!confirm("Biztosan törlöd ezt az üzenetet?")) return;
        setDeleting(true);
        await onDelete(msg.id);
    }

    return (
        <div className={`msg-card ${expanded ? "expanded" : ""}`}>
            <div className="msg-card-header" onClick={() => setExpanded(e => !e)}>
                <div className="msg-card-left">
                    <div className="msg-avatar">{initials}</div>
                    <div style={{minWidth:0}}>
                        <div className="msg-name">{msg.name}</div>
                        <div className="msg-email">{msg.email}</div>
                    </div>
                </div>
                <div className="msg-card-right">
                    <span className="msg-date">{dateStr}</span>
                    <span className={`msg-chevron ${expanded ? "open" : ""}`}>▼</span>
                </div>
            </div>
            {expanded && (
                <div className="msg-card-body">
                    <div className="msg-label">Üzenet</div>
                    <div className="msg-text">{msg.message}</div>
                    <div className="msg-actions">
                        <a href={`mailto:${msg.email}?subject=Re: Megkeresés`} className="reply-btn">
                            ✉ Válasz küldése
                        </a>
                        <button className="delete-btn" onClick={handleDelete} disabled={deleting}>
                            {deleting ? "Törlés..." : "🗑 Törlés"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Dashboard ─── */
function Dashboard({ user, onLogout }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchMessages() {
        setLoading(true);
        try {
            const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
            const snap = await getDocs(q);
            setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch(e) { console.error(e); }
        setLoading(false);
    }

    useEffect(() => { fetchMessages(); }, []);

    async function handleDelete(id) {
        await deleteDoc(doc(db, "messages", id));
        setMessages(msgs => msgs.filter(m => m.id !== id));
    }

    const emailInitial = (user.email || "A")[0].toUpperCase();

    return (
        <div className="dash">
            <header className="dash-header">
                <div className="dash-header-left">
                    <div className="dash-logo-dot">KD</div>
                    <span className="dash-header-title">K. Dávid</span>
                    <span className="dash-header-sep">|</span>
                    <span className="dash-header-sub">Admin Panel</span>
                </div>
                <div className="dash-header-right">
                    <div className="dash-user-pill">
                        <div className="dash-user-avatar">{emailInitial}</div>
                        <span className="dash-user-email">{user.email}</span>
                    </div>
                    <button className="dash-logout-btn" onClick={onLogout}>Kilépés</button>
                </div>
            </header>

            <main className="dash-main">
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-icon">✉️</div>
                        <div className="stat-info">
                            <span className="stat-num">{loading ? "–" : messages.length}</span>
                            <span className="stat-label">Összes üzenet</span>
                        </div>
                    </div>
                </div>

                <div className="section-bar">
                    <div className="section-title-wrap">
                        <div className="section-title-dot" />
                        <span className="section-title">Beérkező üzenetek</span>
                    </div>
                    <button className="refresh-btn" onClick={fetchMessages}>
                        ↻ Frissítés
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">Betöltés...</div>
                ) : messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <div className="empty-title">Nincs üzenet</div>
                        <div className="empty-sub">Ha valaki küld egy ajánlatkérést, itt fog megjelenni.</div>
                    </div>
                ) : (
                    <div className="msg-list">
                        {messages.map(msg => (
                            <MessageCard key={msg.id} msg={msg} onDelete={handleDelete} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

/* ─── App root ─── */
function App() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loginError, setLoginError] = useState("");

    injectStyles();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, u => {
            setUser(u);
            setAuthLoading(false);
        });
        return unsub;
    }, []);

    async function handleLogin(email, password) {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setLoginError("");
        } catch {
            setLoginError("Hibás e-mail cím vagy jelszó.");
        }
    }

    if (authLoading) return (
        <div className="login-bg">
            <div style={{color:"#8e7865", letterSpacing:2, fontSize:13}}>BETÖLTÉS...</div>
        </div>
    );
    if (!user) return <LoginPage onLogin={handleLogin} error={loginError} />;
    return <Dashboard user={user} onLogout={() => signOut(auth)} />;
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
