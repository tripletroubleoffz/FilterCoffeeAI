import { IAuthService } from './interface';
import { db } from '../../db';
import { supabaseAdmin } from '../../supabaseAdmin';

export class SupabaseAuthService implements IAuthService {
  /**
   * Called from tRPC context on every server request.
   * Reads the Supabase JWT from the Authorization header or the sb-* cookie,
   * then upserts the user into our own Prisma User table.
   */
  async getSessionUser(req?: Request): Promise<any | null> {
    try {
      let token = '';

      // 1. Check Authorization header
      if (req) {
        const authHeader = req.headers.get('authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      // 2. Check cookies if token is not in header
      if (!token && req) {
        const cookiesHeader = req.headers.get('cookie') || '';
        const cookiePairs = cookiesHeader.split(';');
        let rawValue = '';
        for (const pair of cookiePairs) {
          const trimmed = pair.trim();
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const name = trimmed.substring(0, eqIdx);
            const val = trimmed.substring(eqIdx + 1);
            if (name.startsWith('sb-') && (name.endsWith('-auth-token') || name.endsWith('-auth-token.0'))) {
              rawValue = val;
              break;
            }
          }
        }

        if (rawValue) {
          try {
            // Supabase client cookie values are JSON stringified arrays [access_token, refresh_token, ...]
            const decoded = decodeURIComponent(rawValue);
            const parsed = JSON.parse(decoded);
            if (Array.isArray(parsed) && parsed[0]) {
              token = parsed[0];
            } else if (typeof parsed === 'string') {
              token = parsed;
            }
          } catch (e: any) {
            console.error('[DEBUG AUTH] Failed to parse cookie JSON:', e.message);
            token = decodeURIComponent(rawValue);
          }
        }
      }

      if (!token) {
        // Fallback to checking Next.js headers if req is not passed directly (rare case)
        try {
          const { cookies } = await import('next/headers');
          const cookieStore = await cookies();
          const cookieList = cookieStore.getAll();
          const sbCookie = cookieList.find(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
          if (sbCookie?.value) {
            const parsed = JSON.parse(sbCookie.value);
            if (Array.isArray(parsed) && parsed[0]) {
              token = parsed[0];
            } else if (typeof parsed === 'string') {
              token = parsed;
            }
          }
        } catch (e: any) {
          console.error('[DEBUG AUTH] Fallback check error:', e.message);
        }
      }

      if (!token) {
        return null;
      }

      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        console.error('[DEBUG AUTH] Supabase admin getUser failed:', error);
        return null;
      }

      // Fetch the user from the database
      const dbUser = await db.user.findUnique({
        where: { supabaseId: user.id },
        include: { subscription: true },
      });

      if (!dbUser) {
        // Automatically upsert in case metadata matches
        return await this.upsertSupabaseUser(user.id, user.email || '', user.user_metadata?.name);
      }

      return dbUser;
    } catch (error: any) {
      console.error('[DEBUG AUTH] Supabase session fetch error:', error);
      return null;
    }
  }

  /**
   * Upsert a Supabase auth user into our Prisma User table.
   * Called after the client completes sign-in/sign-up successfully.
   */
  async upsertSupabaseUser(supabaseUserId: string, email: string, name?: string): Promise<any> {
    try {
      let user = await db.user.findUnique({
        where: { supabaseId: supabaseUserId },
        include: { subscription: true },
      });

      if (!user) {
        user = await db.user.create({
          data: {
            supabaseId: supabaseUserId,
            email,
            name: name || email.split('@')[0],
            role: email === 'founder@filtercoffee.ai' ? 'ADMIN' : 'USER',
          },
          include: { subscription: true },
        });

        await db.subscription.create({
          data: {
            userId: user.id,
            stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 11)}`,
            status: 'INACTIVE',
          },
        });

        user = await db.user.findUnique({
          where: { id: user.id },
          include: { subscription: true },
        });
      }

      return user;
    } catch (error) {
      console.error('Supabase upsert user error:', error);
      return null;
    }
  }

  async signIn(email: string): Promise<{ success: boolean; user: any }> {
    throw new Error('Sign-in is handled by Supabase client SDK directly.');
  }

  async signUp(email: string, name: string): Promise<{ success: boolean; user: any }> {
    throw new Error('Sign-up is handled by Supabase client SDK directly.');
  }

  async signOut(): Promise<{ success: boolean }> {
    // Client calls supabase.auth.signOut() directly.
    return { success: true };
  }
}
