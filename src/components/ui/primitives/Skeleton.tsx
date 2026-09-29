import * as React from "react";

import { cn } from "@/lib/utils";

export type SkeletonVariant = "row" | "card" | "text";

export interface SkeletonProps {
  variant: SkeletonVariant;
  count?: number;
  className?: string;
}

const shimmer = "animate-pulse bg-muted motion-reduce:animate-none";

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      {/* Image area — aspect-video matches PostCard */}
      <div className={cn(shimmer, "aspect-video w-full")} />
      {/* Text body */}
      <div className="flex flex-col gap-3 p-5">
        <div className={cn(shimmer, "h-5 w-2/3 rounded-md")} />
        <div className={cn(shimmer, "h-3 w-full rounded")} />
        <div className={cn(shimmer, "h-3 w-4/5 rounded")} />
        <div className="mt-2 flex gap-2">
          <div className={cn(shimmer, "h-5 w-14 rounded-md")} />
          <div className={cn(shimmer, "h-5 w-14 rounded-md")} />
          <div className={cn(shimmer, "h-5 w-14 rounded-md")} />
        </div>
      </div>
    </div>
  );
}

export function Skeleton({ variant, count = 1, className }: SkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === "card") {
    return (
      <>
        {items.map((_, index) => (
          <CardSkeleton key={index} className={className} />
        ))}
      </>
    );
  }

  const lineClass: Record<Exclude<SkeletonVariant, "card">, string> = {
    row: "h-16 w-full rounded-lg",
    text: "h-4 w-full rounded",
  };

  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {items.map((_, index) => (
        <div
          key={index}
          className={cn(shimmer, lineClass[variant as Exclude<SkeletonVariant, "card">], className)}
        />
      ))}
    </div>
  );
}
