// Better-Auth-Einstellungen – EINE Quelle für die App (lib/auth.ts) und die Migration (scripts/migrate.mjs).
// Anmeldung nur mit Benutzername + Passwort. Better Auth verlangt intern eine E-Mail-Adresse: Die App vergibt
// beim Registrieren eine zufällige Adresse unter der reservierten Domain .invalid – sie wird nie angezeigt oder angeschrieben.
import { username } from 'better-auth/plugins';

// 3–24 Zeichen: Kleinbuchstaben, Ziffern, Punkt, Unterstrich, Bindestrich; beginnt mit Buchstabe oder Ziffer
export const BENUTZERNAME = /^[a-z0-9][a-z0-9._-]{2,23}$/;

const mitHttps = host => (host ? `https://${host}` : null);

export function authOptionen(pool) {
  const basis = process.env.BETTER_AUTH_URL || mitHttps(process.env.VERCEL_URL) || 'http://localhost:3000';
  return {
    appName: 'OSI-Agenten',
    database: pool,
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: basis,
    // Produktion, Vorschau-Deployments von Vercel und lokal
    trustedOrigins: [basis, mitHttps(process.env.VERCEL_URL), mitHttps(process.env.VERCEL_BRANCH_URL), mitHttps(process.env.VERCEL_PROJECT_PRODUCTION_URL)].filter(Boolean),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true, // Konten entstehen nur über /api/registrieren (Klassencode bzw. Lehrkraft-Antrag)
      minPasswordLength: 8,
      maxPasswordLength: 128
    },
    user: {
      additionalFields: {
        // nicht von außen setzbar (input: false) – nur der Server vergibt Rollen
        rolle: { type: 'string', required: false, defaultValue: 'lernend', input: false },
        lehrkraftStatus: { type: 'string', required: false, input: false }
      }
    },
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    rateLimit: {
      enabled: true,
      storage: 'database',
      window: 60,
      max: 120,
      customRules: { '/sign-in/username': { window: 60, max: 15 }, '/change-password': { window: 60, max: 10 } }
    },
    plugins: [username({ minUsernameLength: 3, maxUsernameLength: 24, usernameValidator: u => BENUTZERNAME.test(u) })]
  };
}
