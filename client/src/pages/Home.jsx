import { Link } from "react-router-dom";
import { ArrowRight, Code, Users, Zap } from "lucide-react";
import { Button } from "../components/ui/button";

export function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center md:py-32 lg:py-40">
        <div className="max-w-[800px] space-y-8">
          <div className="inline-flex items-center rounded-full border border-border/50 px-3 py-1 text-sm font-medium bg-muted/50 text-muted-foreground">
            Welcome to DevSpotlight
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl text-foreground drop-shadow-sm">
            Showcase your <span className="text-muted-foreground">student projects</span>
          </h1>
          <p className="mx-auto max-w-[650px] text-muted-foreground md:text-xl leading-relaxed">
            Publish work, explore recent builds, and open contribution channels in one place. Join a community of student developers building the future.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link to="/register">
              <Button size="lg" className="h-12 px-8 text-base">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/feed">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 border-border/60 shadow-sm">
                Explore Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-background py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted border border-border">
                <Code className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Showcase Work</h3>
              <p className="text-muted-foreground">Upload your latest projects with images, descriptions, and tech stacks for everyone to see.</p>
            </div>
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted border border-border">
                <Users className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Collaborate</h3>
              <p className="text-muted-foreground">Open your projects to contributions. Allow other students to request access and help build.</p>
            </div>
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted border border-border">
                <Zap className="h-8 w-8 text-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Get Feedback</h3>
              <p className="text-muted-foreground">Receive likes and comments on your work. Grow as a developer through community feedback.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 mx-auto">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for students. DevSpotlight Showcase Platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
