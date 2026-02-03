"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Button onClick={() => signIn("google")}>Sign in with Google</Button>
      </div>
    );
  }

  const handleSubmit = async (endpoint: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Success!");
        setFormData({});
      } else {
        alert("Error");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
            <p>Welcome, {session.user?.name}</p>
            <Button variant="destructive" onClick={() => signOut()}>Sign Out</Button>
        </div>
      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <Card className="p-6 space-y-4">
            <h2 className="text-xl">Add Project</h2>
            <div className="grid grid-cols-2 gap-4">
                <Input name="titleEn" placeholder="Title (EN)" onChange={handleInputChange} />
                <Input name="titleEs" placeholder="Title (ES)" onChange={handleInputChange} />
                <Textarea name="shortDescEn" placeholder="Short Desc (EN)" onChange={handleInputChange} />
                <Textarea name="shortDescEs" placeholder="Short Desc (ES)" onChange={handleInputChange} />
                <Input name="year" placeholder="Year" onChange={handleInputChange} />
                <Input name="technologies" placeholder="Technologies (comma sep)" onChange={handleInputChange} />
                <Input name="liveUrl" placeholder="Live URL" onChange={handleInputChange} />
                <Input name="codeUrl" placeholder="Code URL" onChange={handleInputChange} />
            </div>
            <Button onClick={() => handleSubmit("projects")} disabled={loading}>
              {loading ? "Saving..." : "Save Project"}
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="publications">
           <Card className="p-6 space-y-4">
            <h2 className="text-xl">Add Publication</h2>
             <div className="grid grid-cols-2 gap-4">
                <Input name="title" placeholder="Title" onChange={handleInputChange} />
                <Input name="citationApa" placeholder="Citation (APA)" onChange={handleInputChange} />
                <Input name="url" placeholder="URL" onChange={handleInputChange} />
                <Input name="lang" placeholder="Language (en/es)" onChange={handleInputChange} />
                <Input name="tagsEn" placeholder="Tags EN (comma sep)" onChange={handleInputChange} />
                <Input name="tagsEs" placeholder="Tags ES (comma sep)" onChange={handleInputChange} />
            </div>
            <Button onClick={() => handleSubmit("publications")} disabled={loading}>
              {loading ? "Saving..." : "Save Publication"}
            </Button>
           </Card>
        </TabsContent>

        <TabsContent value="skills">
            <Card className="p-6 space-y-4">
                <h2 className="text-xl">Add Skill</h2>
                <div className="grid grid-cols-2 gap-4">
                    <Input name="name" placeholder="Skill Name" onChange={handleInputChange} />
                    <Input name="category" placeholder="Category (technical, academic, languages)" onChange={handleInputChange} />
                </div>
                 <Button onClick={() => handleSubmit("skills")} disabled={loading}>
                    {loading ? "Saving..." : "Save Skill"}
                </Button>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
