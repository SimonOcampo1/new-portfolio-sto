import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, {});

  if (!session || session.user?.email !== "ocamposimon1@gmail.com") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      const { title, citationApa, url, lang, tagsEn, tagsEs } = req.body;
      const publication = await prisma.publication.create({
        data: {
          title, citationApa, url, lang, tagsEn, tagsEs
        }
      });
      res.status(200).json(publication);
    } catch (error) {
      res.status(500).json({ error: "Failed to create publication" });
    }
  }
}
