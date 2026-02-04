import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const [projectsResult, publicationsResult, skillsResult] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("publications").select("*").order("created_at", { ascending: false }),
      supabase.from("skills").select("*").order("created_at", { ascending: false }),
    ]);

    if (projectsResult.error || publicationsResult.error || skillsResult.error) {
      return NextResponse.json({
        error: "Failed to fetch data",
        details: {
          projects: projectsResult.error?.message || null,
          publications: publicationsResult.error?.message || null,
          skills: skillsResult.error?.message || null,
        },
      }, { status: 500 });
    }

    const projects = projectsResult.data || [];
    const publications = publicationsResult.data || [];
    const skills = skillsResult.data || [];

    return NextResponse.json({ projects, publications, skills }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
