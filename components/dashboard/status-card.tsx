import { cn } from "@/lib/utils";

interface StatusCardProps {
  title: string;
  value: number | null;
  icon: React.ReactNode;
  description: string;
  color: string;
  compact?: boolean;
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-300 dark:bg-zinc-700 ${className ?? ""}`}
    />
  );
}

export function StatusCard({ title, value, icon, description, color, compact }: StatusCardProps) {
  return (
    <div className={cn(
      "border rounded-xl bg-white dark:bg-zinc-900 shadow-sm hover:border-primary/50 transition-all",
      compact && "rounded-lg",
      "sm:rounded-xl rounded-lg"
    )}>
      <div className={cn("p-6", compact && "p-3", "sm:p-6 p-3")}>
        <div className="flex justify-between items-start">
          <div>
            <p className={cn(
              "text-sm font-medium text-muted-foreground text-gray-500 dark:text-gray-400 mb-1",
              compact && "text-xs mb-0.5",
              "sm:text-sm sm:mb-1 text-xs mb-0.5"
            )}>
              {title}
            </p>
            {value === null ? (
              <Skeleton className={cn("h-9 w-16", compact && "h-6 w-12", "sm:h-9 sm:w-16 h-6 w-12")} />
            ) : (
              <p className={cn("text-3xl font-bold", compact && "text-xl",  "sm:text-3xl text-xl")}>{value}</p>
            )}
            <p className={cn(
              "text-xs text-muted-foreground text-gray-500 dark:text-gray-400 mt-1",
              compact && "text-[10px] mt-0.5",
              "sm:text-xs sm:mt-1 text-[10px] mt-0.5"
            )}>
              {description}
            </p>
          </div>

          <div className={cn(
            "p-2 rounded-full",
            color.replace("bg-", "bg-opacity-20"),
            compact && "p-1",
            "sm:p-2 p-1"
          )}>
            <div className={cn("p-1 rounded-full text-white", color)}>
              {icon}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
