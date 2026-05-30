import "./globals.css";

export const metadata = {
  title: "Platubot Admin — Panel de Control",
  description:
    "Panel de administración de Platubot: gestión de base de datos, logs de VPS y terminal controlada con autenticación Discord OAuth2.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body id="platubot-root">{children}</body>
    </html>
  );
}
