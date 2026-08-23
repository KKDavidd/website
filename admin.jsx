import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

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

function Icon({ name }) {
    return (
        <svg className="icon" aria-hidden="true">
            <use href={`#icon-${name}`}></use>
        </svg>
    );
}

function LoginPage({ onLogin, error }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        await onLogin(email, password);
        setLoading(false);
    }

    return (
        <div className="login-screen">
            <div className="login-card">
                <div className="login-bar" aria-hidden="true">
                    <span></span><span></span><span></span>
                </div>
                <div className="login-body">
                    <div className="login-mark" aria-hidden="true">KD</div>
                    <div className="login-title">K. Dávid</div>
                    <div className="login-sub">Admin Panel</div>
                    <form onSubmit={handleSubmit}>
                        <div className="login-field">
                            <label htmlFor="login-email">E-mail cím</label>
                            <input
                                id="login-email"
                                type="email"
                                placeholder="pelda@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div className="login-field">
                            <label htmlFor="login-password">Jelszó</label>
                            <input
                                id="login-password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <div className="login-error" role="alert">
                                <Icon name="warning" />
                                <span>{error}</span>
                            </div>
                        )}
                        <button type="submit" className="login-submit" disabled={loading}>
                            {loading ? "Belépés..." : "Belépés"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function MessageCard({ msg, onDelete }) {
    const [deleting, setDeleting] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const date = msg.timestamp?.toDate ? msg.timestamp.toDate() : new Date(msg.timestamp);
    const dateStr = isNaN(date) ? "–" : date.toLocaleString("hu-HU", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    const initials = (msg.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    async function handleDelete() {
        if (!confirm("Biztosan törlöd ezt az üzenetet?")) return;
        setDeleting(true);
        await onDelete(msg.id);
    }

    return (
        <li className={`msg-card ${expanded ? "expanded" : ""}`}>
            <button
                type="button"
                className="msg-toggle"
                aria-expanded={expanded}
                onClick={() => setExpanded(e => !e)}
            >
                <span className="msg-toggle-left">
                    <span className="msg-avatar" aria-hidden="true">{initials}</span>
                    <span style={{ minWidth: 0 }}>
                        <span className="msg-name" style={{ display: "block" }}>{msg.name}</span>
                        <span className="msg-email" style={{ display: "block" }}>{msg.email}</span>
                    </span>
                </span>
                <span className="msg-toggle-right">
                    <span className="msg-date">{dateStr}</span>
                    <span className={`msg-chevron ${expanded ? "open" : ""}`}><Icon name="chevron-down" /></span>
                </span>
            </button>
            {expanded && (
                <div className="msg-body">
                    <div className="msg-label">Üzenet</div>
                    <div className="msg-text">{msg.message}</div>
                    <div className="msg-actions">
                        <a href={`mailto:${msg.email}?subject=Re: Megkeresés`} className="reply-btn">
                            <Icon name="reply" /> Válasz küldése
                        </a>
                        <button type="button" className="delete-btn" onClick={handleDelete} disabled={deleting}>
                            <Icon name="trash" /> {deleting ? "Törlés..." : "Törlés"}
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
}

function Dashboard({ user, onLogout }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    async function fetchMessages() {
        setLoading(true);
        try {
            const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
            const snap = await getDocs(q);
            setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    useEffect(() => { fetchMessages(); }, []);

    async function handleDelete(id) {
        await deleteDoc(doc(db, "messages", id));
        setMessages(msgs => msgs.filter(m => m.id !== id));
    }

    const emailInitial = (user.email || "A")[0].toUpperCase();

    return (
        <div>
            <header className="dash-header">
                <div className="dash-brand">
                    <span className="brand-mark" aria-hidden="true">KD</span>
                    <span className="dash-brand-name">K. Dávid</span>
                    <span className="dash-brand-sep">/</span>
                    <span className="dash-brand-sub">Admin</span>
                </div>
                <div className="dash-user">
                    <div className="dash-user-pill">
                        <span className="dash-user-avatar" aria-hidden="true">{emailInitial}</span>
                        <span className="dash-user-email">{user.email}</span>
                    </div>
                    <button type="button" className="dash-logout" onClick={onLogout}>Kilépés</button>
                </div>
            </header>

            <main className="dash-main">
                <div className="stats-row">
                    <div className="stat-card">
                        <span className="stat-icon" aria-hidden="true"><Icon name="mail" /></span>
                        <div>
                            <span className="stat-num">{loading ? "–" : messages.length}</span>
                            <span className="stat-label">Összes üzenet</span>
                        </div>
                    </div>
                </div>

                <div className="section-bar">
                    <span className="section-title">Beérkező üzenetek</span>
                    <button type="button" className="refresh-btn" onClick={fetchMessages}>
                        <Icon name="refresh" /> Frissítés
                    </button>
                </div>

                {loading ? (
                    <p className="loading-state" role="status" aria-live="polite">Betöltés...</p>
                ) : messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon" aria-hidden="true"><Icon name="inbox" /></div>
                        <div className="empty-title">Nincs üzenet</div>
                        <div className="empty-sub">Ha valaki küld egy ajánlatkérést, itt fog megjelenni.</div>
                    </div>
                ) : (
                    <ul className="msg-list">
                        {messages.map(msg => (
                            <MessageCard key={msg.id} msg={msg} onDelete={handleDelete} />
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [loginError, setLoginError] = useState("");

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

    if (authLoading) {
        return (
            <div className="login-screen">
                <p className="login-status" role="status" aria-live="polite">Betöltés...</p>
            </div>
        );
    }

    if (!user) return <LoginPage onLogin={handleLogin} error={loginError} />;
    return <Dashboard user={user} onLogout={() => signOut(auth)} />;
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
