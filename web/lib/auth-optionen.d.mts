import type { BetterAuthOptions } from 'better-auth';
import type { Pool } from 'pg';
export declare const BENUTZERNAME: RegExp;
export declare function authOptionen(pool: Pool): BetterAuthOptions & { plugins: NonNullable<BetterAuthOptions['plugins']> };
