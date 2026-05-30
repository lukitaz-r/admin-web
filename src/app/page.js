import { cookies } from 'next/headers';
import { decryptSession } from './utils/session';
import DashboardWrapper from './components/DashboardWrapper';


export default async function Home({ searchParams }) {
  const params = await searchParams;
  const error = params.error;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('platubot_session')?.value;
  const sessionSecret = process.env.SESSION_SECRET || 'platubot-secure-session-key-must-be-long-32';

  const user = sessionCookie ? decryptSession(sessionCookie, sessionSecret) : null;

  // If the user has a valid active session, load the CRUD Dashboard
  if (user) {
    return <DashboardWrapper user={user} />;
  }

  // Define descriptive error messages for the UI
  let errorMessage = '';
  if (error) {
    switch (error) {
      case 'unauthorized':
        errorMessage = 'ACCESO DENEGADO: No tenés el rol requerido "1455042543770407156" en el servidor oficial de Platubot.';
        break;
      case 'bot_validation_failed':
        errorMessage = 'ERROR DE CONEXIÓN: No se pudo verificar tu sesión con el VPS de Platubot.';
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
    <main className="min-screen flex items-center justify-center p-4 bg-zinc-950 relative overflow-hidden font-sans">
      {/* Dynamic background glow grids */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-[420px] p-8 md:p-10 rounded-3xl glass-panel flex flex-col gap-8 text-center relative z-10 animate-[fadeIn_0.3s_var(--ease-smooth)]">
        {/* Logo and branding */}
        <div className="flex flex-col items-center gap-3">
          <div className="p-3.5 rounded-2xl border border-border bg-glass/40 text-primary flex items-center justify-center shadow-lg shadow-primary/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
              <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-1.5">
              <span>Platubot Admin</span>
            </h1>
            <p className="text-xs text-zinc-500 mt-1.5 tracking-wider uppercase font-semibold">
              Sistema de Autenticación Central
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl border border-danger/10 bg-danger-dim text-danger text-xs font-semibold flex items-start gap-2.5 text-left animate-[slideDown_0.2s_var(--ease-smooth)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Login Action */}
        <div className="flex flex-col gap-4">
          <a
            href="/api/auth/discord/login"
            className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-bold tracking-wide transition-all shadow-lg hover:shadow-[#5865F2]/10 cursor-pointer"
          >
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.87-.64,1.71-1.32,2.5-2a75.46,75.46,0,0,0,73,0c.8,1,1.62,1.86,2.5,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.87,50.77,123.57,28.06,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
            </svg>
            <span>Iniciar Sesión con Discord</span>
          </a>
          <p className="text-[10px] text-zinc-550 leading-relaxed max-w-xs mx-auto">
            El acceso está restringido a administradores verificados. Al continuar, otorgás acceso a tu perfil básico de Discord.
          </p>
        </div>
      </div>
    </main>
  );
}
