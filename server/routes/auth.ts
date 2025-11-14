import { Router, type Request, type Response } from "express";
import { getSupabase, getSupabaseAdmin } from "../lib/supabase";
import {
  hashPassword,
  createToken,
  authenticateToken,
  type JWTPayload,
} from "../utils/auth";

export const authRouter = Router();

// Simple in-memory throttle per email to avoid rapid re-requests to Supabase (10s rule)
const lastRegisterRequestByEmail = new Map<string, number>();
const REGISTER_MIN_INTERVAL_MS = 12_000; // 12s to be safe
const lastResendRequestByEmail = new Map<string, number>();
const RESEND_MIN_INTERVAL_MS = 12_000;

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

// POST /api/auth/register - User registration
authRouter.post(
  "/register",
  async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          error: "Missing required fields: name, email, password",
        });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      // Throttle to respect Supabase email limit (security: 10s)
      const now = Date.now();
      const lastAt = lastRegisterRequestByEmail.get(email);
      if (lastAt && now - lastAt < REGISTER_MIN_INTERVAL_MS) {
        const waitSec = Math.ceil((REGISTER_MIN_INTERVAL_MS - (now - lastAt)) / 1000);
        return res.status(429).json({ error: `Please wait ${waitSec}s before requesting another confirmation email.` });
      }

      const supabase = getSupabase();
      const admin = getSupabaseAdmin();

      // Ensure no duplicate profile in our users table (use admin to bypass RLS)
      const { data: existingUser, error: checkError } = await admin
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();
      if (checkError) {
        // Be tolerant: if table missing or RLS/policy issues, do not block registration
        console.warn("Warning checking existing user (ignored):", checkError);
      }
      if (existingUser) {
        return res.status(409).json({ error: "User with this email already exists" });
      }

      // Use Supabase Auth signUp to trigger email confirmation
      const redirectTo = process.env.EMAIL_CONFIRM_REDIRECT_TO || "http://localhost:5000";
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: { name, phone },
        },
      });
      if (signUpError) {
        console.error("Supabase signUp error:", signUpError);
        // Map rate-limit error to 429 for clarity
        const message = signUpError.message || "Registration failed";
        if (message.toLowerCase().includes("only request this after 10 seconds")) {
          lastRegisterRequestByEmail.set(email, Date.now());
          return res.status(429).json({ error: "Terlalu cepat. Silakan coba lagi dalam 10 detik." });
        }
        return res.status(400).json({ error: message });
      }

      const authUserId = signUpData.user?.id;
      if (!authUserId) {
        return res.status(500).json({ error: "Failed to create auth user" });
      }

      // Keep local profile row in sync (optional password_hash retained for legacy compatibility)
      const passwordHash = await hashPassword(password);
      const { data: newUser, error: insertError } = await admin
        .from("users")
        .insert({
          id: authUserId,
          name,
          email,
          password_hash: passwordHash,
          phone: phone || null,
          role: "public",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id, name, email, phone, role, created_at")
        .single();
      if (insertError) {
        // Do not block registration: profile will be auto-created on first login
        console.warn("User profile insert failed (ignored; will auto-create on login):", insertError);
      }

      lastRegisterRequestByEmail.set(email, Date.now());
      return res.status(201).json({
        message: "Registrasi berhasil. Cek email untuk konfirmasi akun.",
        user: newUser || { id: authUserId, name, email, phone: phone || null, role: 'public' },
      });
    } catch (err) {
      console.error("Register error:", err);
      return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : "Unknown error" });
    }
  }
);

// POST /api/auth/resend-confirmation - resend signup confirmation email
authRouter.post('/resend-confirmation', async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    const now = Date.now();
    const lastAt = lastResendRequestByEmail.get(email);
    if (lastAt && now - lastAt < RESEND_MIN_INTERVAL_MS) {
      const waitSec = Math.ceil((RESEND_MIN_INTERVAL_MS - (now - lastAt)) / 1000);
      return res.status(429).json({ error: `Please wait ${waitSec}s before resending confirmation.` });
    }

    const supabase = getSupabase();
    const redirectTo = process.env.EMAIL_CONFIRM_REDIRECT_TO || 'http://localhost:5000';
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: redirectTo }
    });

    if (error) {
      const msg = error.message || 'Failed to resend confirmation';
      if (msg.toLowerCase().includes('only request this after 10 seconds')) {
        lastResendRequestByEmail.set(email, Date.now());
        return res.status(429).json({ error: 'Terlalu cepat. Coba lagi dalam 10 detik.' });
      }
      return res.status(400).json({ error: msg });
    }

    lastResendRequestByEmail.set(email, Date.now());
    return res.json({ message: 'Email konfirmasi dikirim ulang. Periksa inbox/spam.' });
  } catch (err) {
    console.error('Resend confirmation error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login - User login
authRouter.post(
  "/login",
  async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Missing required fields: email, password" });
      }

      // Development bypass: if DEV_BYPASS_AUTH is set to 1 or true, skip DB checks
      const devBypass = process.env.DEV_BYPASS_AUTH === "1" || process.env.DEV_BYPASS_AUTH === "true";
      if (devBypass) {
        // Return a fake user and JWT so the frontend can continue without a DB
        const fakeUser = {
          id: "dev-user-1",
          name: "Developer",
          email,
          phone: null,
          role: "admin",
          avatar_url: null,
        };

        const token = createToken({
          id: fakeUser.id,
          email: fakeUser.email,
          name: fakeUser.name,
          role: fakeUser.role,
        });

        return res.status(200).json({
          message: "Dev bypass login",
          token,
          user: fakeUser,
        });
      }

      const supabase = getSupabase();
      const admin = getSupabaseAdmin();

      // Delegate credential check to Supabase Auth (enforces email confirmation if enabled)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError || !signInData.user) {
        return res.status(401).json({ error: signInError?.message || "Invalid email or password" });
      }

      // Try to load profile by Auth ID first, then fallback to email
      let user: any | null = null;
      let userError: any | null = null;
      {
        const byId = await admin
          .from("users")
          .select("id, name, email, phone, role, avatar_url")
          .eq("id", signInData.user.id)
          .maybeSingle();
        if (!byId.error && byId.data) {
          user = byId.data;
        } else {
          const byEmail = await admin
            .from("users")
            .select("id, name, email, phone, role, avatar_url")
            .eq("email", email)
            .maybeSingle();
          user = byEmail.data ?? null;
          userError = byId.error && !byEmail.data ? byId.error : byEmail.error;
        }
      }

      // If profile missing (legacy or earlier schema failures), create it on-the-fly using service role
      if (userError || !user) {
        const authUser = signInData.user;
        const fallbackName = (authUser.user_metadata as any)?.name || (authUser.email?.split("@")[0] ?? "User");
        const passwordHash = await hashPassword("auth-managed");

        const insertRes = await admin
          .from("users")
          .insert({
            id: authUser.id,
            name: fallbackName,
            email: authUser.email,
            password_hash: passwordHash,
            phone: (authUser.user_metadata as any)?.phone ?? null,
            role: "public",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select("id, name, email, phone, role, avatar_url")
          .single();

        if (insertRes.error) {
          const code: any = (insertRes.error as any).code;
          const msg = insertRes.error.message || "";
          // If unique violation on email, fetch existing row by email and continue
          if (code === '23505' || /duplicate key value/i.test(msg)) {
            const exist = await admin
              .from("users")
              .select("id, name, email, phone, role, avatar_url")
              .eq("email", authUser.email as string)
              .maybeSingle();
            if (!exist.error && exist.data) {
              user = exist.data;
            } else {
              console.error("Auto-create conflict but failed to fetch existing:", exist.error);
              // Proceed with Auth-only user instead of failing
              user = {
                id: authUser.id,
                name: fallbackName,
                email: authUser.email as string,
                phone: (authUser.user_metadata as any)?.phone ?? null,
                role: 'public',
                avatar_url: (authUser.user_metadata as any)?.avatar_url ?? null,
              };
            }
          } else {
            // Attempt a minimal insert as a universal fallback (handles not-null/unknown columns)
            const fallbackHash = await hashPassword("auth-managed");
            const minimal = await admin
              .from("users")
              .insert({ id: authUser.id, name: fallbackName, email: authUser.email, password_hash: fallbackHash, role: 'public' })
              .select("id, name, email, phone, role, avatar_url")
              .maybeSingle();
            if (!minimal.error && minimal.data) {
              user = minimal.data;
            } else if ((minimal.error as any)?.code === '23505' || /duplicate key value/i.test((minimal.error as any)?.message || '')) {
              // If minimal insert hit duplicate, fetch and continue
              const exist2 = await admin
                .from("users")
                .select("id, name, email, phone, role, avatar_url")
                .eq("email", authUser.email as string)
                .maybeSingle();
              if (!exist2.error && exist2.data) {
                user = exist2.data;
              } else {
                console.error("Minimal insert duplicate but fetch failed:", exist2.error);
                // Proceed with Auth-only user instead of failing
                user = {
                  id: authUser.id,
                  name: fallbackName,
                  email: authUser.email as string,
                  phone: (authUser.user_metadata as any)?.phone ?? null,
                  role: 'public',
                  avatar_url: (authUser.user_metadata as any)?.avatar_url ?? null,
                };
              }
            } else if ((insertRes.error as any).code === 'PGRST204' || (minimal.error as any)?.code === 'PGRST204') {
              console.warn('Schema not fully deployed; proceeding with Auth-only user for now.');
              user = {
                id: authUser.id,
                name: fallbackName,
                email: authUser.email as string,
                phone: (authUser.user_metadata as any)?.phone ?? null,
                role: 'public',
                avatar_url: (authUser.user_metadata as any)?.avatar_url ?? null,
              };
            } else {
              console.error("Auto-create profile failed (fallback too):", insertRes.error, minimal.error);
              // Proceed with Auth-only user to avoid blocking login
              user = {
                id: authUser.id,
                name: fallbackName,
                email: authUser.email as string,
                phone: (authUser.user_metadata as any)?.phone ?? null,
                role: 'public',
                avatar_url: (authUser.user_metadata as any)?.avatar_url ?? null,
              };
            }
          }
        } else {
          user = insertRes.data;
        }
      }

      // Update last_login
      try {
        await admin
          .from("users")
          .update({ last_login: new Date().toISOString() })
          .eq("id", user.id);
      } catch (e) {
        console.warn('Failed to update last_login (non-fatal):', e);
      }

      // Prefer users table data; if absent, fallback to Supabase Auth user metadata
      const authUser = signInData.user;
      const merged = {
        id: user?.id ?? authUser.id,
        name: user?.name ?? ((authUser.user_metadata as any)?.name || (authUser.email?.split("@")[0] ?? "User")),
        email: user?.email ?? (authUser.email as string),
        phone: user?.phone ?? ((authUser.user_metadata as any)?.phone ?? null),
        role: user?.role ?? ((authUser.user_metadata as any)?.role ?? "public"),
        avatar_url: user?.avatar_url ?? ((authUser.user_metadata as any)?.avatar_url ?? null),
      };

      // Issue our API JWT for backend routes from merged profile
      const token = createToken({ id: merged.id, email: merged.email, name: merged.name, role: merged.role });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: merged,
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : "Unknown error" });
    }
  }
);

// GET /api/auth/me - Get current user profile (requires auth)
authRouter.get("/me", authenticateToken, async (req: any, res: Response) => {
  try {
    const user: JWTPayload | undefined = req.user;

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }
    // If development bypass is enabled, return a stable fake profile
    const devBypass = process.env.DEV_BYPASS_AUTH === "1" || process.env.DEV_BYPASS_AUTH === "true";
    if (devBypass) {
      const fakeProfile = {
        id: (user && user.id) || "dev-user-1",
        name: (user && user.name) || "Developer",
        email: (user && user.email) || "dev@example.com",
        phone: null,
        role: (user && user.role) || "admin",
        avatar_url: null,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return res.status(200).json({ user: fakeProfile });
    }

    const admin = getSupabaseAdmin();

    // Get full user data
    const { data: userData, error: userError } = await admin
      .from("users")
      .select(
        "id, name, email, phone, role, avatar_url, created_at, last_login, updated_at"
      )
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user:", userError);
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      user: userData,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// POST /api/auth/logout - User logout (optional, mainly for client-side)
authRouter.post("/logout", (req: Request, res: Response) => {
  // Logout is typically handled on the client by clearing the token
  // This endpoint can be used for server-side session cleanup if needed
  return res.status(200).json({
    message: "Logged out successfully",
  });
});
