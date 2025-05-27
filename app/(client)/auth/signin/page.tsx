"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Github } from "lucide-react";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Authentication error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="mx-auto max-w-sm w-full rounded-lg border border-border bg-background shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-border space-y-1">
          <h1 className="text-2xl font-bold">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Connect with your GitHub account to continue
          </p>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4 border-0">
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></span>
                Connecting...
              </>
            ) : (
              <>
                <Github className="h-4 w-4" />
                Sign in with GitHub
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 text-center text-xs text-muted-foreground border-t border-border">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
