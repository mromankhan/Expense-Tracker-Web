import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-screen flex flex-col justify-center items-center gap-3 bg-gradient-to-b from-primary/8 via-background to-background">
      <div className="size-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
        <Loader2 className="size-7 animate-spin text-primary-foreground" />
      </div>
      <p className="text-sm text-muted-foreground font-medium">Loading…</p>
    </div>
  );
}
