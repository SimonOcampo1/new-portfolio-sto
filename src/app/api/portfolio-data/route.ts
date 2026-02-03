import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
    const publications = await prisma.publication.findMany({ orderBy: { createdAt: "desc" } });
    const skills = await prisma.skill.findMany({ orderBy: { createdAt: "desc" } });

    return NextResponse.json({ projects, publications, skills }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
