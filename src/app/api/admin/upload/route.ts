import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseBucket } from "@/lib/supabase-config";

const MAX_FILE_SIZE_MB = 25;

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no-op
      },
    },
    global: token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined,
  });
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user || data.user.email !== "ocamposimon1@gmail.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const mediaType = String(formData.get("mediaType") || "");
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (mediaType !== "images" && mediaType !== "videos") {
      return NextResponse.json({ error: "Invalid media type" }, { status: 400 });
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!file || typeof file.arrayBuffer !== "function") {
        continue;
      }

      const contentType = file.type || "";
      const isImage = contentType.startsWith("image/");
      const isVideo = contentType.startsWith("video/");

      if (mediaType === "images" && !isImage) {
        continue;
      }
      if (mediaType === "videos" && !isVideo) {
        continue;
      }

      const sizeMb = file.size / (1024 * 1024);
      if (sizeMb > MAX_FILE_SIZE_MB) {
        continue;
      }

      const originalName = file.name || "upload";
      const extension = originalName.includes(".") ? originalName.slice(originalName.lastIndexOf(".")) : (isImage ? ".png" : ".mp4");
      const fileName = `${Date.now()}-${randomUUID()}${extension}`;
      const filePath = `projects/${fileName}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult = await supabase.storage
        .from(supabaseBucket)
        .upload(filePath, buffer, {
          contentType: contentType || (isImage ? "image/png" : "video/mp4"),
          upsert: false,
        });

      if (uploadResult.error) {
        continue;
      }

      const publicUrlResult = supabase.storage.from(supabaseBucket).getPublicUrl(filePath);
      if (publicUrlResult.data?.publicUrl) {
        urls.push(publicUrlResult.data.publicUrl);
      }
    }

    return NextResponse.json({ urls }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
}
