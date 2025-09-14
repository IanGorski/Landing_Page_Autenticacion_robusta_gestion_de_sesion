import React from 'react';

interface SessionPayload { username: string; email: string; ts: number; expiresAt: number; duration: number }
interface HistoryItem { username: string; email: string; ts: number }

interface SessionPanelProps {
  session: SessionPayload;
  history: HistoryItem[];
  remainingMs: number;
  warn: boolean;
  onExtend: () => void;
  onLogout: () => void;
  onRegisterAnother: () => void;
  greeting: string;
  formatRemaining: (ms: number) => string;
  hashColor: (str: string) => string;
  initials: (name: string) => string;
}

const SessionPanel: React.FC<SessionPanelProps> = ({
  session,
  history,
  remainingMs,
  warn,
  onExtend,
  onLogout,
  onRegisterAnother,
  greeting,
  formatRemaining,
  hashColor,
  initials,
}) => {
  return (
    <div className="auth-form-wrapper" aria-live="polite">
      <div className="auth-form-inner session-view session-card-mount" data-component="SessionPanel">
        <div className="session-card fade-scale-in">
          <span
            className="badge-avatar"
            aria-label="Avatar usuario activo"
            data-color={hashColor(session.username)}
          >
            {initials(session.username)}
          </span>
          <div className="session-details">
            <h1 className="title">{greeting}</h1>
            <p className="subtitle session-username">
              {session.username} ({session.email})
            </p>
            <div className="session-countdown-wrapper" aria-label="Tiempo restante de sesión" data-remaining-ms={remainingMs}>
              <span className="label">Expira en</span>
              <span className={`countdown-pill ${warn ? 'countdown-warning' : ''}`}>
                {formatRemaining(remainingMs)}
              </span>
            </div>
            <p className="session-description">
              Has iniciado sesión en el entorno de demostración. Esta sesión expira automáticamente por
              seguridad o puedes cerrarla manualmente ahora.
            </p>
            {history.length > 0 && (
              <div className="session-history" aria-label="Historial de inicios recientes">
                <div className="session-history-title">Últimos inicios</div>
                <ul className="session-history-list">
                  {history.map((h) => (
                    <li key={h.ts} className="session-history-item">
                      <span className="fw600">{h.username}</span>
                      <time dateTime={new Date(h.ts).toISOString()}>
                        {new Date(h.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="session-actions">
            <button onClick={onExtend} className="ghost-btn" aria-label="Extender sesión">
              Extender
            </button>
            <button onClick={onLogout} className="ghost-btn" aria-label="Cerrar sesión">
              Logout
            </button>
            <button
              onClick={onRegisterAnother}
              className="ghost-btn"
              aria-label="Crear otra cuenta"
            >
              Registrar otro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPanel;
