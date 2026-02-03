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
      const { name, category, icon } = req.body;
      const skill = await prisma.skill.create({
        data: {
          name, category, icon
        }
      });
      res.status(200).json(skill);
    } catch (error) {
      console.error("Failed to create skill:", error);
      res.status(500).json({ error: "Failed to create skill" });
    }
  } else if (req.method === "PUT") {
    try {
      const { id, name, category, icon } = req.body;
      const skill = await prisma.skill.update({
        where: { id },
        data: { name, category, icon },
      });
      res.status(200).json(skill);
    } catch (error) {
      console.error("Failed to update skill:", error);
      res.status(500).json({ error: "Failed to update skill" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.body;
      await prisma.skill.delete({ where: { id } });
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
