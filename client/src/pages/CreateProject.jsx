import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../api/project.api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card";

export function CreateProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: "",
    githubLink: "",
    liveLink: "",
    images: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("techStack", formData.techStack);
      payload.append("githubLink", formData.githubLink);
      payload.append("liveLink", formData.liveLink);
      payload.append("images", formData.images);

      imageFiles.forEach((file) => {
        payload.append("images", file);
      });

      const created = await createProject(payload);
      navigate(`/project/${created._id}`);
    } catch (error) {
      console.error("Failed to create project", error);
      alert(error.response?.data?.message || "Failed to create project");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Publish Project</h2>
        <p className="text-muted-foreground mt-2">Share your latest work with the community.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Fill in the basic information about your project.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium leading-none">Project Title</label>
              <Input id="title" placeholder="E.g. DevSpotlight Platform" required value={formData.title} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium leading-none">Description</label>
              <Textarea 
                id="description" 
                placeholder="Describe what your project does, the problem it solves..." 
                className="min-h-[120px]" 
                required 
                value={formData.description} 
                onChange={handleChange} 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="techStack" className="text-sm font-medium leading-none">Tech Stack</label>
              <Input id="techStack" placeholder="React, Node.js, MongoDB (Comma separated)" required value={formData.techStack} onChange={handleChange} />
              <p className="text-xs text-muted-foreground">Separate technologies with commas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="githubLink" className="text-sm font-medium leading-none">GitHub URL</label>
                <Input id="githubLink" placeholder="https://github.com/..." value={formData.githubLink} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="liveLink" className="text-sm font-medium leading-none">Live Demo URL (Optional)</label>
                <Input id="liveLink" placeholder="https://..." value={formData.liveLink} onChange={handleChange} />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="images" className="text-sm font-medium leading-none">Existing Image URLs</label>
              <Input id="images" placeholder="https://image1.png, https://image2.jpg" value={formData.images} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <label htmlFor="projectImages" className="text-sm font-medium leading-none">Upload Project Images</label>
              <Input id="projectImages" type="file" accept="image/*" multiple onChange={(event) => setImageFiles(Array.from(event.target.files || []))} />
              <p className="text-xs text-muted-foreground">Files are uploaded to Cloudinary and saved to the project.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4 border-t pt-6">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Publishing..." : "Publish Project"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
