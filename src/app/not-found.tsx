import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-secondary text-primary">
        <SearchX className="size-8" />
      </span>
      <h1 className="mt-5 text-3xl font-extrabold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">This product may have been removed or renamed.</p>
      <Button asChild size="xl" className="mt-6">
        <Link href="/#products">
          Browse all products <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
