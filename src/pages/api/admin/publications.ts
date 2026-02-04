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
      const { title, citationApa, url, lang, tagsEn, tagsEs } = req.body;
      const payload = {
        title,
        citation_apa: citationApa,
        url,
        lang,
        tags_en: tagsEn,
        tags_es: tagsEs,
      };

      const result = await supabase.from("publications").insert(payload).select("*").single();
      if (result.error) {
        throw result.error;
      }

      res.status(200).json(result.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create publication" });
    }
  } else if (req.method === "PUT") {
    try {
      const { id, ...data } = req.body;
      const payload = {
        title: data.title,
        citation_apa: data.citationApa,
        url: data.url,
        lang: data.lang,
        tags_en: data.tagsEn,
        tags_es: data.tagsEs,
        updated_at: new Date().toISOString(),
      };

      const result = await supabase.from("publications").update(payload).eq("id", id).select("*").single();
      if (result.error) {
        throw result.error;
      }

      res.status(200).json(result.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update publication" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.body;
      const result = await supabase.from("publications").delete().eq("id", id);
      if (result.error) {
        throw result.error;
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete publication" });
    }
  } else {
    res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
