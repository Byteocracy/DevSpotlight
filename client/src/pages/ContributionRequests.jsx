import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects } from "../api/project.api";
import { approveContributionRequest, getContributionRequests, rejectContributionRequest } from "../api/contribution.api";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Check, X, Users } from "lucide-react";

export function ContributionRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        const response = await getProjects({ limit: 100 });
        const myProjects = response.projects.filter(p => p.userId?._id === user?._id);
        
        const allRequests = [];
        for (const project of myProjects) {
          const reqs = await getContributionRequests(project._id);
          const mappedReqs = reqs.map(r => ({ ...r, project }));
          allRequests.push(...mappedReqs);
        }
        
        setRequests(allRequests);
      } catch (error) {
        console.error("Failed to load requests", error);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, [user]);

  const handleAction = async (requestId, action) => {
    try {
      if (action === "approve") {
        await approveContributionRequest(requestId);
      } else {
        await rejectContributionRequest(requestId);
      }
      // Update local state
      setRequests(prev => prev.map(req => 
        req._id === requestId ? { ...req, status: action === "approve" ? "approved" : "rejected" } : req
      ));
    } catch (error) {
      console.error(`Failed to ${action} request`, error);
      alert(error.response?.data?.message || `Failed to ${action} request`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading requests...</div>;
  }

  return (
    <div className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contribution Requests</h2>
          <p className="text-muted-foreground mt-2">Manage incoming requests to collaborate on your projects.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/10">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">No requests yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            When other students request to contribute to your projects, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(request => (
            <Card key={request._id}>
              <CardHeader className="flex flex-row items-center justify-between p-6">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {request.userId?.fullName} <span className="text-sm font-normal text-muted-foreground">@{request.userId?.userName}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requested to contribute to <Link to={`/project/${request.project?._id}`} className="font-medium text-primary hover:underline">{request.project?.title}</Link>
                  </p>
                </div>
                <Badge variant={request.status === "pending" ? "outline" : request.status === "approved" ? "default" : "destructive"}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              </CardHeader>
              {request.status === "pending" && (
                <CardContent className="flex items-center gap-2 px-6 pb-6 pt-0">
                  <Button size="sm" onClick={() => handleAction(request._id, "approve")} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <Check className="h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAction(request._id, "reject")} className="gap-2">
                    <X className="h-4 w-4" /> Reject
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
