"use client"
import Link from "next/link";
import { GitPullRequest, ChevronRight, MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useTheme } from "next-themes";

// Define proper types for session
interface GitHubEmail {
  email?: string;
}

interface SessionData {
  github?: GitHubEmail;
  user?: {
    email?: string;
  };
}

export function HeroSection() {
  const { data: session, status } = useSession();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme || 'dark';

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const typedSession = session as SessionData | null;

      const userEmail: string = typedSession?.github?.email || 
                          typedSession?.user?.email || 
                          "Anonymous";
      

    await fetch("https://script.google.com/macros/s/AKfycbz-vSV6h25V3aS7RTzNFZ2FpZa1ebPuawl_6C2GKI6_KtjRATSCqbT1wvUooi6uzqeE/exec", {
      method: "POST",
      headers: {
         "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({
        message: feedback,
        email: userEmail, 
      }),
      mode: "no-cors",
    });


      setSubmitted(true);
      setFeedback("");

      setTimeout(() => {
        setShowFeedbackForm(false);
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Feedback submission failed:", error);
      setError("Failed to submit feedback. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 px-4 py-24 sm:px-6 sm:py-32 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Product Hunt Badge - Positioned top right */}
        <div className="absolute top-8 right-8 lg:right-16 z-10">
          <a 
            href="https://www.producthunt.com/posts/showpr?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-showpr" 
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image 
              src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=961587&theme=${theme === 'dark' ? 'dark' : 'light'}`} 
              alt="ShowPR - Github PR dashboard | Product Hunt" 
              width={220}
              height={54}
              className="shadow-sm hover:shadow-md transition-shadow"
            />
          </a>
        </div>



        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-6 py-2 mb-8">
            <p className="text-sm font-medium text-primary">
              <span className="hidden md:inline">Public Beta</span>
              <span className="inline md:hidden">Beta</span>
              <span className="ml-2">•</span>
              <span className="ml-2">Now Available</span>
            </p>
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Showcase your <span className="text-primary">GitHub</span> contributions
          </h1>
          <p className="mb-10 max-w-2xl text-md text-muted-foreground sm:text-lg">
            View, manage, and visually showcase your Pull Requests with an intuitive dashboard
            designed for developers who want their work to be seen.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              <GitPullRequest className="mr-2 h-5 w-5" />
              View Dashboard
            </Link>
            {status === "unauthenticated" && (
              <Link href="/auth/signin" className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                Sign in with GitHub
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

                {/* Announcement Banner */}
        <div className="my-10 rounded-lg border border-[#FF6154] bg-primary/5 p-4 shadow-md shadow-[#9b554e]">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="flex h-2 w-2 rounded-full bg-[#FF6154] mr-2 animate-pulse"></span>
              <p className="text-sm">
                <span className="text-primary font-semibold">Coming Soon:</span> <span className="font-semibold"> ShowPR - Extended Edition </span>with enhanced features and more.
              </p>
            </div>
            <button 
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="inline-flex items-center text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              aria-expanded={showFeedbackForm}
            >
              <MessageCircle className="mr-1 h-4 w-4" />
              Share your thoughts
            </button>
          </div>

          {/* Feedback Form */}
          {showFeedbackForm && (
            <div className="mt-4 pt-4 border-t border-primary/10">
              {submitted ? (
                <p className="text-sm text-green-500">Thank you for your feedback!</p>
              ) : (
                <form onSubmit={handleSubmitFeedback}>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="What would you like to see in the Extended Edition?"
                    className="w-full p-3 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary/20"
                    rows={3}
                    disabled={submitting}
                  />
                  {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
                  <div className="mt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || !feedback.trim()}
                      className="px-4 py-2 text-xs rounded-md bg-primary text-primary-foreground disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}