import Link from "next/link";
import { GitPullRequest } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center text-center max-w-md">
        {/* Icon Section */}
        <div className="rounded-full mb-2 text-[5rem]">
          🤭
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-8">
          We couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
        </p>

        {/* Button */}
        <Link
          href="/"
          className="px-4 py-1 font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
