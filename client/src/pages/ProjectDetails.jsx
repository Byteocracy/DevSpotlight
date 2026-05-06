import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, Code, Heart, MessageSquare, Users } from "lucide-react";
import { getProjectById, toggleProjectLike } from "../api/project.api";
import { getProjectComments, addComment } from "../api/comment.api";
import { sendContributionRequest } from "../api/contribution.api";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";

export function ProjectDetails() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchProjectData() {
      try {
        const [projectData, commentsData] = await Promise.all([
          getProjectById(id),
          getProjectComments(id)
        ]);
        setProject(projectData);
        setComments(commentsData);
      } catch (error) {
        console.error("Failed to load project details", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjectData();
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await toggleProjectLike(id);
      setProject(prev => ({ ...prev, likeCount: response.likeCount }));
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !newComment.trim()) return;
    setActionLoading(true);
    try {
      const comment = await addComment(id, { content: newComment });
      setComments(prev => [comment, ...prev]);
      setNewComment("");
      setProject(prev => ({ ...prev, commentCount: prev.commentCount + 1 }));
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestContribution = async () => {
    if (!isAuthenticated) return;
    setActionLoading(true);
    try {
      await sendContributionRequest(id);
      alert("Contribution request sent!");
    } catch (error) {
      console.error("Failed to request contribution", error);
      alert(error.response?.data?.message || "Failed to send request");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex-1 p-8 text-center text-muted-foreground">Loading project...</div>;
  }

  if (!project) {
    return <div className="flex-1 p-8 text-center text-muted-foreground">Project not found.</div>;
  }

  const isOwner = user?._id === project.userId?._id;

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            {project.techStack?.map((tech, i) => (
              <Badge key={i} variant="secondary" className="px-3 py-1 text-xs font-medium bg-secondary/60">{tech}</Badge>
            ))}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-foreground">{project.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground text-[15px]">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                {project.userId?.userName?.charAt(0).toUpperCase()}
              </div>
              <span>By <span className="font-semibold text-foreground">@{project.userId?.userName}</span></span>
            </div>
            <span className="opacity-50">•</span>
            <span>{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-4 py-6 border-y border-border/40">
          <Button variant="ghost" onClick={handleLike} className="gap-2 hover:bg-muted hover:text-foreground rounded-full px-4">
            <Heart className="h-4 w-4" />
            <span className="font-medium">{project.likeCount || 0} Likes</span>
          </Button>
          <div className="flex items-center gap-2 px-4 border-l border-border/60 text-[15px] font-medium text-muted-foreground">
            <MessageSquare className="h-4 w-4 opacity-70" />
            {project.commentCount || 0} Comments
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {project.githubLink && (
              <a href={project.githubLink} target="_blank" rel="noreferrer">
                <Button variant="outline" className="gap-2 border-border/60 shadow-sm bg-transparent">
                  <Code className="h-4 w-4" /> Source
                </Button>
              </a>
            )}
            {project.liveLink && (
              <a href={project.liveLink} target="_blank" rel="noreferrer">
                <Button variant="outline" className="gap-2 border-border/60 shadow-sm bg-transparent">
                  <ExternalLink className="h-4 w-4" /> Live Demo
                </Button>
              </a>
            )}
            {!isOwner && isAuthenticated && (
              <Button className="gap-2 shadow-sm" onClick={handleRequestContribution} disabled={actionLoading}>
                <Users className="h-4 w-4" /> Request Access
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-foreground whitespace-pre-wrap">{project.description}</p>
        </div>

        {/* Images */}
        {project.images?.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 mt-8">
            {project.images.map((img, i) => (
              <img key={i} src={img} alt="Project screenshot" className="rounded-xl border object-cover w-full h-64 bg-muted" />
            ))}
          </div>
        )}

        {/* Comments Section */}
        <div className="pt-12 mt-12 border-t border-border/40 space-y-8">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">Comments <span className="text-muted-foreground text-lg font-normal">({comments.length})</span></h3>
          
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="space-y-4">
              <Textarea 
                placeholder="Share your thoughts or feedback..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="resize-none border-border/60 shadow-sm rounded-xl focus-visible:ring-primary/20 bg-background"
              />
              <Button type="submit" disabled={actionLoading || !newComment.trim()} className="rounded-lg shadow-sm">
                Post Comment
              </Button>
            </form>
          ) : (
            <div className="bg-muted/30 border border-border/40 p-6 rounded-xl text-center shadow-sm">
              <p className="text-muted-foreground text-[15px]">
                <Link to="/login" className="text-primary hover:underline font-semibold transition-all">Log in</Link> to join the conversation and share feedback.
              </p>
            </div>
          )}

          <div className="space-y-5 mt-8">
            {comments.map((comment) => (
              <div key={comment._id} className="flex gap-4 p-5 rounded-xl bg-card border border-border/60 shadow-soft">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[15px] text-foreground flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {comment.owner?.userName?.charAt(0).toUpperCase()}
                      </div>
                      {comment.owner?.fullName} <span className="text-muted-foreground font-normal text-sm">@{comment.owner?.userName}</span>
                    </p>
                    <span className="text-xs text-muted-foreground opacity-70">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-[15px] text-muted-foreground leading-relaxed pl-8">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
