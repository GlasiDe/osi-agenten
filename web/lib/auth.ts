import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { pool } from './db';
import { authOptionen } from './auth-optionen.mjs';

const optionen = authOptionen(pool);

export const auth = betterAuth({ ...optionen, plugins: [...optionen.plugins, nextCookies()] });
