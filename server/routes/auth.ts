import { Router, type Request, type Response } from "express";
import { getSupabase, getSupabaseAdmin } from "../lib/supabase";
import {
  hashPassword,
  verifyPassword,
  createToken,
  authenticateToken,
  type JWTPayload,
} from "../utils/auth";

export const authRouter = Router();

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

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          error: "Missing required fields: name, email, password",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters",
        });
      }

  const supabase = getSupabase();
  const supabaseAdmin = getSupabaseAdmin();

      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = not found
        console.error("Error checking existing user:", checkError);
        return res.status(500).json({
          error: "Database error",
          details: checkError.message,
        });
      }

      if (existingUser) {
        return res.status(409).json({
          error: "User with this email already exists",
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create Supabase Auth user (so user appears in Supabase Auth)
      let authUser: any = null;
      try {
        const { data: createdAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          user_metadata: { name, phone },
        } as any);

        if (authError) {
          console.error("Error creating Supabase Auth user:", authError);
          // continue to attempt to create profile, but prefer to fail early
          return res.status(500).json({ error: "Failed to create auth user", details: authError.message });
        }

        authUser = createdAuthUser;
      } catch (err) {
        console.error("Auth admin.createUser threw:", err);
        return res.status(500).json({ error: "Failed to create auth user", details: err instanceof Error ? err.message : String(err) });
      }

      // Create user profile in users table with the same id as the auth user
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          id: authUser?.id || undefined,
          name,
          email,
          password_hash: passwordHash,
          phone: phone || null,
          role: "public", // Default role
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select("id, name, email, phone, role, created_at")
        .single();

      if (insertError) {
        console.error("Error creating user:", insertError);
        return res.status(500).json({
          error: "Failed to create user",
          details: insertError.message,
        });
      }

      // Create JWT token
      const token = createToken({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      });

      return res.status(201).json({
        message: "User registered successfully",
        token,
        user: newUser,
      });
    } catch (err) {
      console.error("Register error:", err);
      return res.status(500).json({
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }
);

// POST /api/auth/login - User login
authRouter.post(
  "/login",
  async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          error: "Missing required fields: email, password",
        });
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

      // Get user by email
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, name, email, password_hash, phone, role, avatar_url")
        .eq("email", email)
        .single();

      if (userError || !user) {
        console.error("User not found:", userError);
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      // Verify password
      const isPasswordValid = await verifyPassword(
        password,
        user.password_hash
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      // Update last_login
      await supabase
        .from("users")
        .update({
          last_login: new Date().toISOString(),
        })
        .eq("id", user.id);

      // Create JWT token
      const token = createToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      return res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar_url: user.avatar_url,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        error: "Internal server error",
        details: err instanceof Error ? err.message : "Unknown error",
      });
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

    const supabase = getSupabase();

    // Get full user data
    const { data: userData, error: userError } = await supabase
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
