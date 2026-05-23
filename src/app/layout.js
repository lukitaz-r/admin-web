import "./globals.css";

export const metadata = {
  title: "Platubot Admin - Panel de Control Premium",
  description: "Administrador de base de datos integrado para Platubot con autenticación de Discord OAuth2 de alta seguridad y diseño futurista.",
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body id="platubot-root">
        <div className="bg-glow"></div>
        <div className="bg-glow-bottom"></div>
        {children}
      </body>
    </html>
  );
}
