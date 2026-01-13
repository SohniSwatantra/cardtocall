import { createAuthClient } from '@neondatabase/auth';
import { BetterAuthReactAdapter } from '@neondatabase/auth/react/adapters';

const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
  console.error('VITE_NEON_AUTH_URL is not set. Auth will not work.');
}

export const authClient = createAuthClient(authUrl || '', {
  adapter: BetterAuthReactAdapter(),
});
