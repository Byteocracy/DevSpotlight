import { Bell } from "lucide-react";


export function Notifications() {
  return (
    <div className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground mt-2">Stay updated on your project activity.</p>
      </div>

      <div className="space-y-4">
        {/* Placeholder for notifications - current backend doesn't seem to have a dedicated notifications API, 
            but this is designed as requested for future integration */}
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-muted/10">
          <Bell className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">You&apos;re all caught up</h3>
          <p className="text-sm text-muted-foreground mt-1">No new notifications at the moment.</p>
        </div>
      </div>
    </div>
  );
}
