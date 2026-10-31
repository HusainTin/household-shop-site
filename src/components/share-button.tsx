"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareButton({ title, path }: { title: string; path: string }) {
  return (
    <Button
      variant="outline"
      size="xl"
      className="w-full"
      onClick={async () => {
        const url = new URL(path, window.location.origin).toString();
        try {
          if (navigator.share) {
            await navigator.share({ title, url });
            return;
          }
          await navigator.clipboard.writeText(url);
          toast.success("Link copied");
        } catch {
          /* share sheet dismissed */
        }
      }}
    >
      <Share2 /> Share
    </Button>
  );
}
