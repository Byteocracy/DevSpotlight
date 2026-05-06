import { useEffect, useState } from "react";
import { getProjects } from "../api/project.api";
import { ProjectCard } from "../components/shared/ProjectCard";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search } from "lucide-react";

export function ProjectFeed() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const loadProjects = async (pageToLoad, searchQuery) => {
    try {
      const response = await getProjects({ page: pageToLoad, limit: pagination.limit, query: searchQuery });
      setProjects(response.projects);
      setPagination(prev => ({ ...prev, ...response.pagination, page: pageToLoad }));
    } catch (error) {
      console.error("Failed to load projects", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    getProjects({ page: 1, limit: 12, query: "" }).then(response => {
      if (mounted) {
        setProjects(response.projects);
        setPagination(prev => ({ ...prev, ...response.pagination, page: 1 }));
        setLoading(false);
      }
    }).catch(err => {
      if (mounted) {
        console.error("Failed to load projects", err);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProjects(1, query);
  };

  return (
    <div className="flex-1 p-8 pt-6">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Project Feed</h2>
            <p className="text-muted-foreground mt-1">Explore the latest projects from students.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, stack, or description..."
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-muted/20 animate-pulse border" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            No projects found matching your search.
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {projects.map(project => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>

            {(pagination.hasPreviousPage || pagination.hasNextPage) && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button 
                  variant="outline" 
                  disabled={!pagination.hasPreviousPage}
                  onClick={() => loadProjects(pagination.page - 1, query)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button 
                  variant="outline" 
                  disabled={!pagination.hasNextPage}
                  onClick={() => loadProjects(pagination.page + 1, query)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
