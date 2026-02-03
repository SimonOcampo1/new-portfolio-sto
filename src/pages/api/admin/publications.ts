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
      const { title, citationApa, url, lang, tagsEn, tagsEs } = req.body;
      const publication = await prisma.publication.create({
        data: {
          title, citationApa, url, lang, tagsEn, tagsEs
        }
      });
      res.status(200).json(publication);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create publication" });
    }
  } else if (req.method === "PUT") {
    try {
      const { id, ...data } = req.body;
      const publication = await prisma.publication.update({
        where: { id },
        data,
      });
      res.status(200).json(publication);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to update publication" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.body;
      await prisma.publication.delete({ where: { id } });
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
