import { cn } from "@/lib/utils";
import { Tag } from "./Tag";
import { SmartLink } from "./SmartLink";

export interface PostCardProps {
  kind: string;
  readTime: string;
  title: string;
  description: string;
  tags: string[];
  href: string;
  image?: string;
}

export function PostCard({ kind, readTime, title, description, tags, href, image }: PostCardProps) {
  return (
    <SmartLink
      href={href}
      className={cn(
        "group block rounded-xl border border-border bg-card no-underline transition-all overflow-hidden",
        "hover:-translate-y-1 hover:border-primary/50 motion-reduce:transition-colors motion-reduce:hover:translate-y-0",
      )}
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center justify-between font-mono text-xs">
          <span className="text-primary">{kind}</span>
          <span className="text-muted-foreground">{readTime}</span>
        </div>
        <h3 className="mt-3 font-display text-xl text-foreground md:text-2xl">{title}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}
      </div>
    </SmartLink>
  );
}
