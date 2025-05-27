import {
  GitPullRequest,
  GitMerge,
  GitPullRequestClosed,
  Calendar,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

type PullRequest = {
  id: string;
  title: string;
  number: number;
  url: string;
  state: "OPEN" | "CLOSED" | "MERGED";
  createdAt: string;
  repository: {
    name: string;
    url: string;
  };
};

interface PullRequestCardProps {
  pullRequest: PullRequest;
  compact?: boolean;
}

export function PullRequestCard({ pullRequest, compact }: PullRequestCardProps) {
  const { title, number, url, state, createdAt, repository } = pullRequest;
 
  // Format date
  const formattedDate = format(new Date(createdAt), "MMM d, yyyy");
 
  // Status indicator
  const getStatusIndicator = () => {
    switch(state) {
      case "OPEN":
        return {
          icon: <GitPullRequest className={cn("h-4 w-4", compact && "h-3 w-3")} />,
          label: "Open",
          className: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
        };
      case "MERGED":
        return {
          icon: <GitMerge className={cn("h-4 w-4", compact && "h-3 w-3")} />,
          label: "Merged",
          className: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
        };
      case "CLOSED":
        return {
          icon: <GitPullRequestClosed className={cn("h-4 w-4", compact && "h-3 w-3")} />,
          label: "Closed",
          className: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
        };
      default:
        return {
          icon: <GitPullRequest className={cn("h-4 w-4", compact && "h-3 w-3")} />,
          label: "Unknown",
          className: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
        };
    }
  };
 
  const statusIndicator = getStatusIndicator();
 
  return (
    <div className={cn(
      "rounded-lg border bg-card text-card-foreground shadow overflow-hidden transition-all hover:border-primary/50 group",
      compact && "rounded-md"
    )}>
      <div className={cn("p-4", compact && "p-2")}>
        <div className={cn("flex flex-col space-y-2", compact && "space-y-1")}>
          <div className="flex items-start justify-between">
            <Link
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-base font-medium hover:text-primary transition-colors line-clamp-1 flex-1 group-hover:underline",
                compact && "text-xs"
              )}
            >
              {title}
              <span className={cn(
                "text-muted-foreground font-normal ml-1.5",
                compact && "text-xs"
              )}>#{number}</span>
            </Link>
           
            <div className={cn(
              "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              statusIndicator.className,
              compact && "px-2 py-0.5 text-[10px]"
            )}>
              <span className="flex items-center space-x-1">
                {statusIndicator.icon}
                <span className={cn("ml-1", compact && "ml-0.5")}>{statusIndicator.label}</span>
              </span>
            </div>
          </div>
         
          <div className={cn(
            "flex items-center justify-between text-sm text-muted-foreground",
            compact && "text-xs"
          )}>
            <Link
              href={repository.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors hover:underline"
            >
              {repository.name}
            </Link>
           
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Calendar className={cn("h-3.5 w-3.5 mr-1.5", compact && "h-3 w-3 mr-1")} />
                {formattedDate}
              </span>
             
              <Link
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className={cn("h-4 w-4", compact && "h-3 w-3")} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}