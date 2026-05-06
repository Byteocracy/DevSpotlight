import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Badge } from "../ui/badge";

export function ProjectCard({ project }) {
  if (!project) return null;

  return (
    <Card className="flex flex-col h-full transition-shadow group border-border">
      <Link to={`/project/${project._id}`} className="flex-1 flex flex-col">
        <CardHeader className="p-5 pb-0 flex flex-row items-start justify-between">
          <div className="flex flex-wrap gap-1.5 mt-1">
            {project.techStack?.slice(0, 3).map((tech, i) => (
              <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0.5 font-medium bg-secondary/50">
                {tech}
              </Badge>
            ))}
            {(project.techStack?.length || 0) > 3 && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 text-muted-foreground border-border/50">
                +{project.techStack.length - 3}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-5 flex-1 mt-2">
          <h3 className="font-bold text-xl tracking-tight line-clamp-1 group-hover:text-primary transition-colors text-foreground">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </CardContent>
      </Link>
      <CardFooter className="p-4 pt-3 border-t border-border/40 mt-auto flex items-center justify-between text-xs text-muted-foreground bg-muted/20 rounded-b-xl">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
            {project.userId?.userName?.charAt(0).toUpperCase()}
          </div>
          <span className="truncate max-w-[100px] font-medium text-foreground">@{project.userId?.userName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] whitespace-nowrap opacity-70">
            {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
          </span>
          <div className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            <span>{project.likeCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{project.commentCount || 0}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
