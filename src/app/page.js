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
    </main>
  );
}
