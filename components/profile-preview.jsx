import {
  GitPullRequest,
  GitMerge,
  GitPullRequestClosed,
  Github,
  FileText,
} from "lucide-react";
import { StatusCard } from "@/components/dashboard/status-card";
import { PieChart } from "@/components/dashboard/pie-chart";
import { LineChart } from "@/components/dashboard/line-chart";
import { PullRequestCard } from "@/components/dashboard/pr-card";
import Link from "next/link";


export function ProfilePreview({profile, summary,settings, pullRequests, monthlyData}) {
  if (!profile || !summary) {
    return (
      <div className="container py-4 px-2 sm:px-6">
        <div className="max-w-5xl mx-auto border rounded-lg shadow bg-card">
          <div className="p-4 sm:p-6">
            <h1 className="text-xl font-bold text-center">Profile not found</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="container py-4 px-2 sm:px-6">
        <div className="max-w-5xl mx-auto border rounded-lg shadow bg-card">
          <div className="p-4 sm:p-6">
            {/* Header with User Info - Improved for mobile */}
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-secondary flex-shrink-0 flex items-center justify-center">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="rounded-full w-full h-full object-cover"
                  />
                ) : (
                  <Github className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                )}
              </div>
    
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold truncate">{(settings.customTitle?.trim() || `${profile.name}'s GitHub Contributions`)}</h1>
                  <Link
                    href={`https://github.com/${profile?.githubUsername || ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors border border-input hover:bg-accent h-7 px-2 py-1 w-fit mx-auto sm:mx-0"
                    style={{ backgroundColor: "#4F46E520" }}
                  >
                    <Github className="h-3 w-3 mr-1" />
                    View GitHub Profile
                  </Link>
                </div>
                
                <p className="text-xs md:text-sm text-muted-foreground mt-1 mb-2">{(settings.description?.trim() || profile.bio)}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 sm:gap-2 text-xs border-t pt-2 mt-1 text-leftnav">
                  <div>
                    <span className="text-muted-foreground">Username:</span> 
                    <span className="font-medium ml-1">@{profile.githubUsername}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Repositories:</span> 
                    <span className="font-medium ml-1">{profile.publicRepos || 0}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Followers:</span> 
                    <span className="font-medium ml-1">{profile.followers || 0}</span>
                  </div>
                </div>
              </div>
            </div>
    
            {/* Content Sections */}
            <div className="space-y-6">
              {/* PR Summary - only show if enabled in settings */}
              {settings.showSummary && (
                <section>
                  <h2 className="text-lg font-semibold mb-2">Pull Request Summary</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                    <StatusCard
                      title="Total PRs"
                      value={summary.open + summary.merged + summary.closed}
                      icon={<FileText className="h-4 w-4" />}
                      description="All pull requests"
                      color="bg-blue-500"
                    />
                    <StatusCard
                      title="Open PRs"
                      value={summary.open}
                      icon={<GitPullRequest className="h-4 w-4" />}
                      description="Awaiting review"
                      color="bg-amber-500"
                    />
                    <StatusCard
                      title="Merged PRs"
                      value={summary.merged}
                      icon={<GitMerge className="h-4 w-4" />}
                      description="Successfully merged"
                      color="bg-emerald-500"
                    />
                    <StatusCard
                      title="Closed PRs"
                      value={summary.closed}
                      icon={<GitPullRequestClosed className="h-4 w-4" />}
                      description="Closed without merge"
                      color="bg-red-500"
                    />
                  </div>
                </section>
              )}
    
              {/* Charts - only show if enabled in settings */}
              {settings.showCharts && (
                <section>
                  <h2 className="text-lg font-semibold mb-2">Contribution Statistics</h2>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="rounded-lg border bg-card shadow-sm">
                      <div className="p-3 sm:p-4">
                        <h3 className="text-sm font-medium mb-2">PR Status Distribution</h3>
                        <div className="h-48 sm:h-56">
                          <PieChart
                            data={[
                              { name: "Open", value: summary.open, color: "chart-4" },
                              { name: "Merged", value: summary.merged, color: "chart-2" },
                              { name: "Closed", value: summary.closed, color: "chart-1" },
                            ]}
                          />
                        </div>
                      </div>
                    </div>
    
                    <div className="rounded-lg border bg-card shadow-sm">
                      <div className="p-3 sm:p-4">
                        <h3 className="text-sm font-medium mb-2">PR Activity Timeline</h3>
                        <div className="h-48 sm:h-56">
                          <LineChart 
                            statData={monthlyData} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
    
              {/* Recent PRs - only show if enabled in settings */}
              {((settings.showRecentPRs && pullRequests?.length > 0) || (settings.showCustomPrs && settings.customPRs?.length > 0 )) && (
                <section>
                  <h2 className="text-lg font-semibold mb-2">{ settings?.showRecentPRs ? "Recent Contributions" : "Top Contributions"}</h2>
                  <div className="space-y-2">
                  {((settings.showCustomPrs ? settings.customPRs : pullRequests) || [])
                      .slice(0, settings.recentPRsCount)
                      .map((pr) => (
                        <PullRequestCard 
                          key={pr.id} 
                          pullRequest={pr} 
                        />
                      ))
                    }
                  </div>
                </section>
              )}
            </div>
          </div>
          <p className="text-center text-xs py-2">Powered by <a href="/" className="underline text-blue-500 font-bold">ShowPR</a></p>
        </div>
      </div>
  );
}
