import Link from 'next/link';

export function Fuss() {
  return (
    <p className="fuss">
      <Link href="/datenschutz">Datenschutz</Link>·<Link href="/impressum">Impressum</Link>·
      <a href="https://github.com/GlasiDe/osi-agenten">Quelltext</a>·
      <a href="https://glaside.github.io/osi-agenten/spiel/">Lite-Version ohne Konto</a>
    </p>
  );
}
