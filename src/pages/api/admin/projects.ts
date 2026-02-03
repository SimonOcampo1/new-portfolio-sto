import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session || session.user?.email !== "ocamposimon1@gmail.com") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      const { titleEn, titleEs, shortDescEn, shortDescEs, fullDescEn, fullDescEs, year, technologies, liveUrl, codeUrl, tagsEn, tagsEs } = req.body;
      const project = await prisma.project.create({
        data: {
          titleEn, titleEs, shortDescEn, shortDescEs, fullDescEn, fullDescEs, year, technologies, liveUrl, codeUrl, tagsEn, tagsEs
        }
      });
      res.status(200).json(project);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create project" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
