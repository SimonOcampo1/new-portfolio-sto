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
      const {
        titleEn,
        titleEs,
        shortDescEn,
        shortDescEs,
        fullDescEn,
        fullDescEs,
        year,
        technologies,
        liveUrl,
        codeUrl,
        tagsEn,
        tagsEs,
        mediaImages,
        mediaVideos,
      } = req.body;

      const payload = {
        title_en: titleEn,
        title_es: titleEs,
        short_desc_en: shortDescEn,
        short_desc_es: shortDescEs,
        full_desc_en: fullDescEn,
        full_desc_es: fullDescEs,
        year,
        technologies,
        live_url: liveUrl || null,
        code_url: codeUrl || null,
        tags_en: tagsEn,
        tags_es: tagsEs,
        media_images: Array.isArray(mediaImages) ? mediaImages : [],
        media_videos: Array.isArray(mediaVideos) ? mediaVideos : [],
      };

      const result = await supabase.from("projects").insert(payload).select("*").single();

      if (result.error) {
        throw result.error;
      }

      res.status(200).json(result.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create project" });
    }
  } else if (req.method === "PUT") {
    try {
      const { id, ...data } = req.body;

      const payload = {
        title_en: data.titleEn,
        title_es: data.titleEs,
        short_desc_en: data.shortDescEn,
        short_desc_es: data.shortDescEs,
        full_desc_en: data.fullDescEn,
        full_desc_es: data.fullDescEs,
        year: data.year,
        technologies: data.technologies,
        live_url: data.liveUrl || null,
        code_url: data.codeUrl || null,
        tags_en: data.tagsEn,
        tags_es: data.tagsEs,
        media_images: Array.isArray(data.mediaImages) ? data.mediaImages : [],
        media_videos: Array.isArray(data.mediaVideos) ? data.mediaVideos : [],
        updated_at: new Date().toISOString(),
      };

      const result = await supabase.from("projects").update(payload).eq("id", id).select("*").single();

      if (result.error) {
        throw result.error;
      }

      res.status(200).json(result.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update project" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.body;
      const result = await supabase.from("projects").delete().eq("id", id);

      if (result.error) {
        throw result.error;
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  } else {
    res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
