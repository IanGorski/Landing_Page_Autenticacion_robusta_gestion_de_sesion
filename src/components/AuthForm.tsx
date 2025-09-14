import React, { useState, useEffect, useRef } from 'react';
import './AuthForm.css';
import { startSessionTimer } from '../utils/sessionTimer';
import { evaluatePasswordStrength } from '../utils/passwordStrength';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import SessionPanel from './SessionPanel';

// Types
interface SessionPayload { username: string; email: string; ts: number; expiresAt: number; duration: number; }
interface HistoryItem { username: string; email: string; ts: number; }
interface PwStrength { score: number; label: string; }
interface Criteria { len6: boolean; len10: boolean; upper: boolean; digit: boolean; symbol: boolean; }
interface StatusMsg { type: 'idle' | 'loading' | 'error' | 'success'; message: string; ts: number; }

const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;
const DEFAULT_SESSION_DURATION_MS = 15 * 60 * 1000;
const DURATION_KEY = 'auth-session-duration';
const LAST_MODE_KEY = 'auth-last-mode';
const SESSION_KEY = 'auth-demo-session';
const HISTORY_KEY = 'auth-demo-history';

interface AuthFormProps { debugSessionDurationMs?: number; debugNoDelay?: boolean; debugDisableFeedback?: boolean; debugNow?: () => number; debugFastHash?: boolean }

const AuthForm: React.FC<AuthFormProps> = ({ debugSessionDurationMs, debugNoDelay, debugDisableFeedback, debugNow, debugFastHash }) => {
    const [mode, setMode] = useState<'login' | 'register'>(() => (localStorage.getItem(LAST_MODE_KEY) as 'login' | 'register') || 'login');
    const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', remember: true });
    const [registered, setRegistered] = useState<Array<{ username: string; email: string; password: string }>>([]);
    const [showPw, setShowPw] = useState(false);
    const [showPw2, setShowPw2] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<StatusMsg>({ type: 'idle', message: '', ts: 0 });
    const [pwStrength, setPwStrength] = useState<PwStrength>({ score: 0, label: '' });
    const [criteria, setCriteria] = useState<Criteria>({ len6: false, len10: false, upper: false, digit: false, symbol: false });
    const [session, setSession] = useState<SessionPayload | null>(() => {
        try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
    });
    const [remainingMs, setRemainingMs] = useState(0);
    const [warn, setWarn] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>(() => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; } });
    const nowFn = debugNow || Date.now;
    const [sessionDurationMs, setSessionDurationMs] = useState(() => {
        if (debugSessionDurationMs && debugSessionDurationMs > 0) return debugSessionDurationMs;
        const saved = parseInt(localStorage.getItem(DURATION_KEY) || '', 10);
        return !isNaN(saved) && saved > 0 ? saved : DEFAULT_SESSION_DURATION_MS;
    });
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const expiredNotifiedRef = useRef(false);

    function pushStatus(type: StatusMsg['type'], message: string) { setStatus({ type, message, ts: Date.now() }); }

    useEffect(() => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { /* ignore persist error */ } }, [history]);
    useEffect(() => { try { localStorage.setItem(LAST_MODE_KEY, mode); } catch { /* persist mode ignore */ } }, [mode]);

    function greeting() { const h = new Date().getHours(); if (h < 6) return 'Buenas noches'; if (h < 12) return 'Buenos días'; if (h < 20) return 'Buenas tardes'; return 'Buenas noches'; }
    function formatRemaining(ms: number) { const total = Math.max(0, Math.floor(ms / 1000)); const m = Math.floor(total / 60).toString().padStart(2, '0'); const s = (total % 60).toString().padStart(2, '0'); return `${m}:${s}`; }
    function hashColor(str: string) { let h = 0; for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0; const hue = Math.abs(h) % 360; return `hsl(${hue} 65% 55%)`; }
    function initials(name: string) { if (!name) return '?'; return name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase(); }

    useEffect(() => {
        if (!session) { setRemainingMs(0); return; }
        function playExpireFeedback() {
            try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'sine';
                o.frequency.setValueAtTime(740, ctx.currentTime);
                g.gain.setValueAtTime(0.001, ctx.currentTime);
                g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
                g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
                o.connect(g).connect(ctx.destination);
                o.start();
                o.stop(ctx.currentTime + 0.65);
            } catch { /* audio unsupported */ }
            if (navigator.vibrate) { try { navigator.vibrate([80, 40, 80]); } catch { /* vibrate unsupported */ } }
        }
        const stop = startSessionTimer({
            getSession: () => session,
            now: nowFn,
            onTick: (remaining, isWarn) => { setRemainingMs(remaining); setWarn(isWarn); },
            onExpire: () => {
                setSession(null); setWarn(false);
                if (!expiredNotifiedRef.current) { if (!debugDisableFeedback) playExpireFeedback(); expiredNotifiedRef.current = true; }
                pushStatus('error', 'Sesión expirada.');
            }
        });
        return () => { stop(); };
    }, [session, nowFn, debugDisableFeedback]);

    function evaluateStrength(pw: string) {
        const res = evaluatePasswordStrength(pw);
        setCriteria(res.criteria as Criteria);
        setPwStrength({ score: res.score, label: res.label });
    }
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) { const { id, type } = e.target; const v = (type === 'checkbox' && e.target instanceof HTMLInputElement) ? e.target.checked : e.target.value; setForm(prev => ({ ...prev, [id]: v })); if (id === 'password' && typeof v === 'string') evaluateStrength(v); }
    function simpleHash(str: string) { let h = 0; for (let i = 0; i < str.length; i++) { h = (Math.imul(31, h) + str.charCodeAt(i)) | 0; } return ('00000000' + (h >>> 0).toString(16)).slice(-8); }
    async function hashPassword(plain: string) {
        if (debugFastHash) {
            // Fast deterministic hash for test environment (avoids async crypto timing issues under fake timers)
            return simpleHash(plain);
        }
        const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain));
        return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    function validate() { const newErr: Record<string, string> = {}; if (!form.username.trim()) newErr.username = 'Username requerido'; if (mode === 'register') { if (!form.email.trim()) newErr.email = 'Email requerido'; else if (!emailRegex.test(form.email)) newErr.email = 'Email inválido'; } if (!form.password) newErr.password = 'Password requerida'; else if (form.password.length < 6) newErr.password = 'Mínimo 6 caracteres'; if (mode === 'register') { if (!form.confirm) newErr.confirm = 'Repite la contraseña'; else if (form.confirm !== form.password) newErr.confirm = 'No coincide'; } setErrors(newErr); return Object.keys(newErr).length === 0; }
    function logout() { setSession(null); pushStatus('success', 'Sesión cerrada.'); }
    function extendSession() { if (!session) return; const extended: SessionPayload = { ...session, expiresAt: nowFn() + (session.duration || sessionDurationMs) }; setSession(extended); pushStatus('success', 'Sesión extendida.'); }
    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        pushStatus('idle', '');
        if (!validate()) { pushStatus('error', 'Revisa los campos marcados.'); return; }
        pushStatus('loading', 'Enviando...');
        const delay = debugNoDelay ? 0 : 900;
        const execute = async () => {
            // Debug instrumentation to trace submit flow in tests
            if (debugFastHash) {
                // eslint-disable-next-line no-console
                console.log('[AuthForm submit] execute start mode=%s status=%s', mode, status.type);
            }
            if (mode === 'register') {
                if (registered.some(u => u.username === form.username || u.email === form.email)) {
                    pushStatus('error', 'Ya existe un usuario con ese username o email.');
                } else {
                    if (debugFastHash && debugNoDelay) {
                        // Ultra-fast deterministic branch: skip loading transition entirely
                        const hashedFast = simpleHash(form.password);
                        setRegistered(prev => [...prev, { username: form.username, email: form.email, password: hashedFast }]);
                        pushStatus('success', 'Registro creado exitosamente.');
                        if (debugFastHash) { console.log('[AuthForm submit] fast register complete'); }
                        return;
                    }
                    // Fast path: avoid awaiting a promise when debugFastHash (synchronous hash) to help tests with fake timers
                    const hashed = debugFastHash ? simpleHash(form.password) : await hashPassword(form.password);
                    setRegistered(prev => [...prev, { username: form.username, email: form.email, password: hashed }]);
                    pushStatus('success', 'Registro creado exitosamente.');
                }
            } else {
                const input = form.username;
                if (debugFastHash && debugNoDelay) {
                    const candidateFast = simpleHash(form.password);
                    const userFast = registered.find(u => (u.username === input || u.email === input) && (u.password === candidateFast || u.password === form.password));
                    if (!userFast) {
                        pushStatus('error', 'Credenciales inválidas o usuario no registrado.');
                    } else {
                        const now = nowFn();
                        const payload: SessionPayload = { username: userFast.username, email: userFast.email, ts: now, expiresAt: now + sessionDurationMs, duration: sessionDurationMs };
                        if (form.remember) { setSession(payload); } else { setSession(payload); sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload)); }
                        setHistory(prev => [{ username: userFast.username, email: userFast.email, ts: now }, ...prev].slice(0, 5));
                        pushStatus('success', 'Ingreso exitoso.');
                        if (debugFastHash) { console.log('[AuthForm submit] fast login complete'); }
                    }
                    return;
                }
                const candidateHash = debugFastHash ? simpleHash(form.password) : await hashPassword(form.password);
                const user = registered.find(u => (u.username === input || u.email === input) && (u.password === candidateHash || u.password === form.password));
                if (!user) {
                    pushStatus('error', 'Credenciales inválidas o usuario no registrado.');
                } else {
                    const now = nowFn();
                    const payload: SessionPayload = { username: user.username, email: user.email, ts: now, expiresAt: now + sessionDurationMs, duration: sessionDurationMs };
                    if (form.remember) { setSession(payload); } else { setSession(payload); sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload)); }
                    setHistory(prev => [{ username: user.username, email: user.email, ts: now }, ...prev].slice(0, 5));
                    pushStatus('success', 'Ingreso exitoso.');
                }
            }
            if (debugFastHash) {
                // eslint-disable-next-line no-console
                console.log('[AuthForm submit] execute end status=%s', status.type);
            }
        };
        if (delay === 0) {
            // Execute immediately (synchronous path) to avoid relying on microtask scheduling under fake timers
            void execute();
        } else {
            setTimeout(execute, delay);
        }
    }
    useEffect(() => { try { localStorage.setItem(DURATION_KEY, String(sessionDurationMs)); } catch { /* ignore persist error */ } }, [sessionDurationMs]);

    if (session) {
        return (
            <SessionPanel
                session={session}
                history={history}
                remainingMs={remainingMs}
                warn={warn}
                onExtend={extendSession}
                onLogout={logout}
                onRegisterAnother={() => { setMode('register'); setSession(null); }}
                greeting={greeting()}
                formatRemaining={formatRemaining}
                hashColor={hashColor}
                initials={initials}
            />
        );
    }

    return (
        <div className="auth-form-wrapper" aria-live="polite">
            <div className="auth-form-inner">
                <div className="auth-form-header">
                    <div className="brand-badge" aria-label="Brand">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v3m0 14v3m10-10h-3M5 12H2m15.07 6.07-2.12-2.12M9.05 9.05 6.93 6.93m0 10.14 2.12-2.12m6.02-6.02 2.12-2.12" /></svg>
                        AUTH
                    </div>
                    <div className="header-right">
                        <span className="form-avatar" aria-label="Avatar de vista previa" data-color={hashColor(form.username || '?')}>{initials(form.username)}</span>
                        <div className="mode-switch">
                            {mode === 'login' ? (
                                <span className="alt-text">¿No tienes cuenta? <button type="button" className="link" onClick={() => setMode('register')}>Regístrate</button></span>
                            ) : (
                                <span className="alt-text">¿Ya tienes cuenta? <button type="button" className="link" onClick={() => setMode('login')}>Inicia sesión</button></span>
                            )}
                        </div>
                    </div>
                </div>

                <h1 className="title">{mode === 'login' ? 'Hello Again!' : 'Create Account'}</h1>
                <p className="subtitle">
                    {mode === 'login' ? 'Welcome back you\'ve been missed!' : 'Join us and explore la plataforma.'}
                </p>

                <div className="session-duration-row">
                    <label htmlFor="sessionDuration">Duración sesión</label>
                    <select id="sessionDuration" value={sessionDurationMs} onChange={e => setSessionDurationMs(parseInt(e.target.value, 10))}>
                        <option value={5 * 60 * 1000}>5 min</option>
                        <option value={10 * 60 * 1000}>10 min</option>
                        <option value={15 * 60 * 1000}>15 min</option>
                        <option value={30 * 60 * 1000}>30 min</option>
                        <option value={60 * 60 * 1000}>60 min</option>
                    </select>
                    <span className="hint">Aplicará al próximo inicio de sesión</span>
                </div>

                <form className="auth-form" onSubmit={onSubmit} noValidate>
                    <div className={`field-group ${errors.username ? 'has-error' : ''}`}>
                        <label htmlFor="username">Username o Email</label>
                        <input ref={usernameRef} id="username" type="text" placeholder="Username o Email" value={form.username} onChange={handleChange} {...(errors.username ? { 'aria-invalid': 'true', 'aria-describedby': 'err-username' } : {})} />
                        {errors.username && <span className="error-msg" id="err-username">{errors.username}</span>}
                    </div>
                    {mode === 'register' && (
                        <div className={`field-group ${errors.email ? 'has-error' : ''}`}>
                            <label htmlFor="email">Email</label>
                            <input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} {...(errors.email ? { 'aria-invalid': 'true', 'aria-describedby': 'err-email' } : {})} />
                            {errors.email && <span className="error-msg" id="err-email">{errors.email}</span>}
                        </div>
                    )}
                    <div className={`field-group ${errors.password ? 'has-error' : ''}`}>
                        <label htmlFor="password">Password</label>
                        <div className="password-wrapper">
                            <input id="password" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handleChange} {...(errors.password ? { 'aria-invalid': 'true', 'aria-describedby': 'err-password' } : {})} />
                            <button type="button" className="eye-btn" aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPw(p => !p)}>
                                <span aria-hidden="true">
                                    {showPw ? (
                                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 11C3.5 5.5 8 3 11 3C14 3 18.5 5.5 21 11C18.5 16.5 14 19 11 19C8 19 3.5 16.5 1 11Z" stroke="#566072" strokeWidth="2" fill="none" />
                                            <circle cx="11" cy="11" r="4" stroke="#566072" strokeWidth="2" fill="none" />
                                        </svg>
                                    ) : (
                                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 11C3.5 5.5 8 3 11 3C14 3 18.5 5.5 21 11C18.5 16.5 14 19 11 19C8 19 3.5 16.5 1 11Z" stroke="#566072" strokeWidth="2" fill="none" />
                                            <circle cx="11" cy="11" r="4" stroke="#566072" strokeWidth="2" fill="none" />
                                            <line x1="5" y1="17" x2="17" y2="5" stroke="#566072" strokeWidth="2" />
                                        </svg>
                                    )}
                                </span>
                            </button>
                        </div>
                        {errors.password && <span className="error-msg" id="err-password">{errors.password}</span>}
                        {mode === 'register' && (
                            <PasswordStrengthMeter strength={pwStrength} criteria={criteria} />
                        )}
                    </div>
                    {mode === 'register' && (
                        <div className={`field-group ${errors.confirm ? 'has-error' : ''}`}>
                            <label htmlFor="confirm">Confirm Password</label>
                            <div className="password-wrapper">
                                <input id="confirm" type={showPw2 ? 'text' : 'password'} placeholder="Repite la contraseña" value={form.confirm} onChange={handleChange} {...(errors.confirm ? { 'aria-invalid': 'true', 'aria-describedby': 'err-confirm' } : {})} />
                                <button type="button" className="eye-btn" aria-label={showPw2 ? 'Ocultar confirmación' : 'Mostrar confirmación'} onClick={() => setShowPw2(p => !p)}>
                                    <span aria-hidden="true">
                                        {showPw2 ? (
                                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 11C3.5 5.5 8 3 11 3C14 3 18.5 5.5 21 11C18.5 16.5 14 19 11 19C8 19 3.5 16.5 1 11Z" stroke="#566072" strokeWidth="2" fill="none" />
                                                <circle cx="11" cy="11" r="4" stroke="#566072" strokeWidth="2" fill="none" />
                                            </svg>
                                        ) : (
                                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M1 11C3.5 5.5 8 3 11 3C14 3 18.5 5.5 21 11C18.5 16.5 14 19 11 19C8 19 3.5 16.5 1 11Z" stroke="#566072" strokeWidth="2" fill="none" />
                                                <circle cx="11" cy="11" r="4" stroke="#566072" strokeWidth="2" fill="none" />
                                                <line x1="5" y1="17" x2="17" y2="5" stroke="#566072" strokeWidth="2" />
                                            </svg>
                                        )}
                                    </span>
                                </button>
                            </div>
                            {errors.confirm && <span className="error-msg" id="err-confirm">{errors.confirm}</span>}
                        </div>
                    )}
                    {mode === 'login' && (
                        <div className="actions-inline login-inline-actions">
                            <label>
                                <input id="remember" type="checkbox" checked={form.remember} onChange={handleChange} /> Remember me
                            </label>
                            <button type="button" className="link sm">Recovery Password</button>
                        </div>
                    )}
                    <button type="submit" className="primary-btn stretch" disabled={status.type === 'loading'}>
                        {status.type === 'loading' ? '...' : mode === 'login' ? 'Sign In' : 'Register'}
                    </button>
                    {status.type !== 'idle' && status.message && (
                        <div key={status.ts} className={`form-status toast ${status.type}`} role="alert" aria-live="assertive">
                            <span>{status.message}</span>
                            <button type="button" className="toast-close" aria-label="Cerrar notificación" onClick={() => pushStatus('idle', '')}>×</button>
                        </div>
                    )}
                </form>

                <div className="divider"><span>Or continue with</span></div>
                <div className="providers" role="group" aria-label="Proveedores de identidad">
                    <button type="button" className="provider google" aria-label="Google">G</button>
                    <button type="button" className="provider apple" aria-label="Apple"></button>
                    <button type="button" className="provider facebook" aria-label="Facebook">f</button>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
