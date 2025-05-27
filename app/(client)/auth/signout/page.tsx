"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";

export default function SignOut() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Sign out error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="bg-white dark:bg-zinc-900 border border-border rounded-xl shadow-md mx-auto max-w-sm w-full p-6">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Sign out</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Are you sure you want to sign out?
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => redirect("/")}
            className="w-full border border-input bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm rounded-md px-4 py-2 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className={`w-full text-sm rounded-md px-4 py-2 text-white transition-colors ${
              isLoading
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isLoading ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}
