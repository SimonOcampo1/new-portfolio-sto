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
      const { name, category } = req.body;
      const skill = await prisma.skill.create({
        data: {
          name, category
        }
      });
      res.status(200).json(skill);
    } catch (error) {
      res.status(500).json({ error: "Failed to create skill" });
    }
  }
}
