import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Plus } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getProjects } from "../api/project.api";
import { updateProfile } from "../api/user.api";
import { ProjectCard } from "../components/shared/ProjectCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

export function Profile() {
  const { user, updateUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    userName: "",
    fullName: "",
    email: "",
    bio: "",
    avatarFile: null,
    coverImageFile: null,
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      userName: user.userName || "",
      fullName: user.fullName || "",
      email: user.email || "",
      bio: user.bio || "",
      avatarFile: null,
      coverImageFile: null,
    });
  }, [user]);

  useEffect(() => {
    async function loadUserProjects() {
      try {
        const response = await getProjects({ limit: 100 });
        const myProjects = response.projects.filter((project) => project.userId?._id === user?._id);
        setProjects(myProjects);
      } catch (loadError) {
        console.error("Failed to load projects", loadError);
      } finally {
        setLoading(false);
      }
    }

    void loadUserProjects();
  }, [user]);

  if (!user) return null;

  const handleChange = (event) => {
    const { id, value } = event.target;
    setFormData((current) => ({ ...current, [id]: value }));
  };

  const handleFileChange = (event) => {
    const { id, files } = event.target;
    setFormData((current) => ({ ...current, [id]: files?.[0] || null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("userName", formData.userName);
      payload.append("fullName", formData.fullName);
      payload.append("email", formData.email);
      payload.append("bio", formData.bio);

      if (formData.avatarFile) {
        payload.append("avatar", formData.avatarFile);
      }

      if (formData.coverImageFile) {
        payload.append("coverImage", formData.coverImageFile);
      }

      const updatedUser = await updateProfile(payload);
      updateUser(updatedUser);
      setIsEditing(false);
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-80 flex-shrink-0 space-y-6">
          <div className="border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm">
            <div className="h-28 bg-muted/40">
              {user.coverImage ? (
                <img className="h-full w-full object-cover" src={user.coverImage} alt={`${user.fullName} cover`} />
              ) : null}
            </div>
            <div className="p-6 pt-0">
              <div className="-mt-12 mb-4">
                <img
                  className="h-24 w-24 rounded-full border-4 border-background object-cover bg-primary/10"
                  src={user.avatar}
                  alt={user.fullName || user.userName}
                />
              </div>
              <h2 className="text-2xl font-bold">{user.fullName || user.userName}</h2>
              <p className="text-muted-foreground mb-4">@{user.userName}</p>

              {user.bio ? <p className="text-sm mb-6">{user.bio}</p> : null}

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Student</span>
                </div>
              </div>

              <Button className="w-full mt-6" variant="outline" onClick={() => setIsEditing((current) => !current)}>
                {isEditing ? "Close Editor" : "Edit Profile"}
              </Button>
            </div>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="border rounded-xl p-6 bg-card text-card-foreground shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Profile details</h3>
                <p className="text-sm text-muted-foreground">Upload profile images through Cloudinary.</p>
              </div>
              {error ? <div className="text-sm text-destructive">{error}</div> : null}
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium leading-none">Full Name</label>
                <Input id="fullName" value={formData.fullName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="userName" className="text-sm font-medium leading-none">Username</label>
                <Input id="userName" value={formData.userName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium leading-none">Bio</label>
                <Textarea id="bio" value={formData.bio} onChange={handleChange} className="min-h-[120px]" />
              </div>
              <div className="space-y-2">
                <label htmlFor="avatarFile" className="text-sm font-medium leading-none">Avatar Image</label>
                <Input id="avatarFile" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
              <div className="space-y-2">
                <label htmlFor="coverImageFile" className="text-sm font-medium leading-none">Cover Image</label>
                <Input id="coverImageFile" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          ) : null}
        </div>

        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-2xl font-bold tracking-tight">Projects</h3>
            <Link to="/create-project">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> New Project
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-64 rounded-xl bg-muted/20 animate-pulse border" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border rounded-xl bg-muted/10">
              You haven&apos;t published any projects yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
