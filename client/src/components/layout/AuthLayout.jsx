import { Outlet, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Link to="/" className="absolute top-8 left-8 text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">DevSpotlight</h1>
          <p className="text-muted-foreground mt-2">Student project showcase platform</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
