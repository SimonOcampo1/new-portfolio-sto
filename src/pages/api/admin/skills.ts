import { NextApiRequest, NextApiResponse } from "next";
import { createSupabaseApiClient } from "@/lib/supabase-api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const supabase = createSupabaseApiClient(token || undefined);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user || data.user.email !== "ocamposimon1@gmail.com") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      const { name, category, icon } = req.body;
      const payload = { name, category, icon };
      const result = await supabase.from("skills").insert(payload).select("*").single();

      if (result.error) {
        throw result.error;
      }

      res.status(200).json(result.data);
    } catch (error) {
      console.error("Failed to create skill:", error);
      res.status(500).json({ error: "Failed to create skill" });
    }
  } else if (req.method === "PUT") {
    try {
      const { id, name, category, icon } = req.body;
      const payload = {
        name,
        category,
        icon,
        updated_at: new Date().toISOString(),
      };
      const result = await supabase.from("skills").update(payload).eq("id", id).select("*").single();

      if (result.error) {
        throw result.error;
      }

      res.status(200).json(result.data);
    } catch (error) {
      console.error("Failed to update skill:", error);
      res.status(500).json({ error: "Failed to update skill" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.body;
      const result = await supabase.from("skills").delete().eq("id", id);

      if (result.error) {
        throw result.error;
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Failed to delete skill:", error);
      res.status(500).json({ error: "Failed to delete skill" });
    }
  } else {
      res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
