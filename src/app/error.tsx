"use client";

import { MessageCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/format";
import { shop } from "@/shop.config";

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <h1 className="text-3xl font-extrabold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">We couldn&apos;t load the catalogue just now. Please try again, or message us directly.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button size="xl" onClick={retry}>
          <RotateCw /> Try again
        </Button>
        <Button asChild size="xl" variant="whatsapp">
          <a href={whatsappLink(`Hello ${shop.name}, `)} target="_blank" rel="noopener">
            <MessageCircle /> WhatsApp us
          </a>
        </Button>
      </div>
    </div>
  );
}
