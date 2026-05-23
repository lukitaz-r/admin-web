import { cookies } from 'next/headers.js';
import { decryptSession } from './utils/session.js';
import Dashboard from './components/Dashboard.js';

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const error = params.error;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('platubot_session')?.value;
  const sessionSecret = process.env.SESSION_SECRET || 'platubot-secure-session-key-must-be-long-32';

  const user = sessionCookie ? decryptSession(sessionCookie, sessionSecret) : null;

  // If the user has a valid active session, load the CRUD Dashboard
  if (user) {
    return <Dashboard user={user} />;
  }

  // Define descriptive error messages for the UI
  let errorMessage = '';
  if (error) {
    switch (error) {
      case 'unauthorized':
        errorMessage = 'ACCESO DENEGADO: No tienes el rol requerido "1455042543770407156" en el servidor "1403145326717833408".';
        break;
      case 'bot_validation_failed':
        errorMessage = 'ERROR DE COMUNICACIÓN: No se pudo conectar con el servidor API del Bot.';
        break;
      case 'token_exchange_failed':
      case 'user_fetch_failed':
      case 'auth_failed':
        errorMessage = 'ERROR DE AUTENTICACIÓN: Ocurrió un problema al validar con Discord.';
        break;
      default:
        errorMessage = 'ERROR: Ocurrió un error inesperado al iniciar sesión.';
    }
  }

  return (
    <main className="landing-container">
      <div className="landing-card glass-panel animate-fade-in">
        <div className="branding">
          <h1 className="logo neon-text">PLATUBOT</h1>
          <h2 className="subtitle">SISTEMA CENTRAL DE CONTROL</h2>
        </div>

        <p className="description">
          Portal exclusivo para administradores autorizados. Permite la visualización de colecciones de datos, copias de seguridad de GitHub y edición CRUD en tiempo real.
        </p>

        {errorMessage && (
          <div className="error-alert">
            <div className="error-icon">⚠️</div>
            <div className="error-text">{errorMessage}</div>
          </div>
        )}

        <a href="/api/auth/discord/login" className="login-btn">
          <svg className="discord-logo" viewBox="0 0 127.14 96.36">
            <path fill="currentColor" d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.87-.64,1.71-1.32,2.5-2a75.46,75.46,0,0,0,73,0c.8,1,1.62,1.86,2.5,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.87,50.77,123.57,28.06,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
          </svg>
          Ingresar con Discord
        </a>
      </div>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .landing-card {
          width: 100%;
          max-width: 480px;
          padding: 48px 40px;
          text-align: center;
          border-radius: 16px;
        }

        .branding {
          margin-bottom: 32px;
        }

        .logo {
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: 6px;
          line-height: 1;
          margin-bottom: 8px;
        }

        .subtitle {
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 4px;
          color: var(--text-secondary);
        }

        .description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .error-alert {
          background: rgba(255, 42, 95, 0.08);
          border: 1px solid rgba(255, 42, 95, 0.3);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          text-align: left;
          gap: 12px;
          animation: fadeIn 0.4s ease;
        }

        .error-icon {
          font-size: 1.25rem;
        }

        .error-text {
          font-size: 0.85rem;
          font-weight: 500;
          color: #ff5c81;
          line-height: 1.4;
        }

        .login-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 16px;
          background: transparent;
          border: 2px solid var(--rose-neon);
          color: #ffffff;
          font-weight: 700;
          text-decoration: none;
          border-radius: 8px;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-size: 0.9rem;
          transition: var(--transition-smooth);
          box-shadow: 0 0 10px rgba(255, 42, 95, 0.1);
        }

        .login-btn:hover {
          background: var(--rose-neon);
          color: #000000;
          box-shadow: var(--rose-glow);
          transform: translateY(-2px);
        }

        .discord-logo {
          width: 20px;
          height: 20px;
        }
      `}</style>
    </main>
  );
}
