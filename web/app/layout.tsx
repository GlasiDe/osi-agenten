import type { Metadata } from 'next';
import './app.css';

export const metadata: Metadata = {
  title: 'OSI-Agenten · Operation Lohnzettel',
  description: 'Agenten-Krimi zum OSI-Modell – online mit Konto, Klassen und Live-Einsatzzentrale.',
  icons: { icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='9' fill='%23ff9600'/%3E%3Ctext x='16' y='22' font-size='15' font-family='Arial' font-weight='900' text-anchor='middle' fill='%23fff'%3EE7%3C/text%3E%3C/svg%3E" }
};

// Das Designsystem kommt aus dem Spiel (public/spiel/css), damit Online-Seiten und Spiel gleich aussehen
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <link rel="stylesheet" href="/spiel/css/tokens.css" />
        <link rel="stylesheet" href="/spiel/css/base.css" />
        <link rel="stylesheet" href="/spiel/css/components.css" />
        <link rel="stylesheet" href="/spiel/css/steps.css" />
        <script src="/spiel/js/kit/theme.js" />
      </head>
      <body>{children}</body>
    </html>
  );
}
