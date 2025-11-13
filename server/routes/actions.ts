import { Router, type Request, type Response } from "express";
import { getSupabase, getSupabaseAdmin } from "../lib/supabase";
import { authenticateToken } from "../utils/auth";

export const actionsRouter = Router();

// POST /api/actions/empty - record an empty-bin action (optionally tied to a bin)
actionsRouter.post(
  "/empty",
  authenticateToken,
  async (req: any, res: Response) => {
    try {
      const user = req.user;
      const { bin_id, notes } = req.body as { bin_id?: string; notes?: string };
      const admin = getSupabaseAdmin();

      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      const userId = typeof user?.id === 'string' && uuidRegex.test(user.id) ? user.id : null;
      const safeBinId = typeof bin_id === 'string' && uuidRegex.test(bin_id) ? bin_id : null;

      // Insert into action_history (bin_id optional)
      const { data, error } = await admin
        .from("action_history")
        .insert({
          user_id: userId,
          bin_id: safeBinId,
          action: "EMPTY_BIN",
          notes: notes || null,
          created_at: new Date().toISOString(),
        })
        .select("id, user_id, bin_id, action, notes, created_at")
        .single();

      if (error) {
        console.error("Record empty action failed:", error);
        return res.status(500).json({ error: "Failed to record action", details: error.message });
      }

      // Optionally, if bin_id provided, update bin state
      if (bin_id) {
        const supabase = getSupabase();
        await supabase
          .from("trash_bins")
          .update({ fill_level: 0, status: "normal", last_collection: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", bin_id);
      }

      return res.status(201).json({ message: "Action recorded", action: data });
    } catch (err) {
      console.error("Empty action error:", err);
      return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : "Unknown error" });
    }
  }
);

// GET /api/actions/history - list action history (most recent first)
actionsRouter.get("/history", authenticateToken, async (req: any, res: Response) => {
  try {
    const admin = getSupabaseAdmin();
    const { limit = 50, offset = 0 } = req.query as Record<string, any>;

    const { data, error } = await admin
      .from("action_history")
      .select("id, action, notes, created_at, user_id, bin_id")
      .order("created_at", { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      console.error("Fetch history failed:", error);
      return res.status(500).json({ error: "Failed to fetch history", details: error.message });
    }

    return res.status(200).json({ history: data || [], limit: parseInt(limit), offset: parseInt(offset) });
  } catch (err) {
    console.error("Get history error:", err);
    return res.status(500).json({ error: "Internal server error", details: err instanceof Error ? err.message : "Unknown error" });
  }
});

export default actionsRouter;