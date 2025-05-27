"use client";
import { useSharedState } from "@/app/(client)/context/SharedStateContext";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  GitPullRequest,
  GitMerge,
  GitPullRequestClosed,
  FileText,
  RefreshCw,
  Filter,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { StatusCard } from "@/components/dashboard/status-card";
import { PullRequestCard } from "@/components/dashboard/pr-card";
import * as Select from "@radix-ui/react-select";
import { PieChart } from "@/components/dashboard/pie-chart";
import { LineChart } from "@/components/dashboard/line-chart";

type PullRequestStatus = "OPEN" | "CLOSED" | "MERGED" | "ALL";

interface Repository {
  name: string;
  url: string;
}

interface PullRequest {
  id: string;
  title: string;
  number: number;
  url: string;
  state: "OPEN" | "CLOSED" | "MERGED";
  createdAt: string;
  repository: Repository;
}

interface PRCounts {
  total: number;
  open: number;
  merged: number;
  closed: number;
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface PRResult {
  prs: PullRequest[];
  counts: PRCounts;
  pageInfo: PageInfo;
}

interface MonthlyData {
  month: string;
  opened: number;
  merged: number;
  closed: number;
}

interface MonthlyPRStats {
  monthlyData: MonthlyData[];
}

interface DashboardPageData {
  dataFetched: boolean;
  pullRequests: PullRequest[];
  summary: PRCounts;
  pageInfo: PageInfo;
  statData: MonthlyData[];
  repositories: string[];
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [loadMorePRLoading, setLoadMorePRLoading] = useState<boolean>(false);
  const [filteredPRs, setFilteredPRs] = useState<PullRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<PullRequestStatus>("ALL");
  const [repoFilter, setRepoFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const { dashboardPageData, setDashboardPageData, fetchPRData, loading, error } = useSharedState();
  const { pullRequests, summary, pageInfo, statData, dataFetched, repositories } = dashboardPageData;

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  // Filter pull requests
  useEffect(() => {
    let filtered = [...pullRequests];

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(pr => pr.state === statusFilter);
    }

    // Filter by repository
    if (repoFilter !== "all") {
      filtered = filtered.filter(pr => pr.repository.name === repoFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pr =>
        pr.title.toLowerCase().includes(query) ||
        pr.repository.name.toLowerCase().includes(query) ||
        pr.number.toString().includes(query)
      );
    }

    setFilteredPRs(filtered);
  }, [pullRequests, statusFilter, repoFilter, searchQuery]);

  const loadMorePRs = async () => {
    if (!pageInfo.hasNextPage) return;

    setLoadMorePRLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/github/user-data?cursor=${pageInfo.endCursor}`
      );

      const updatedPRs = [...pullRequests, ...data.prs];

      setDashboardPageData({
        ...dashboardPageData,
        pullRequests: updatedPRs,
        pageInfo: data.pageInfo,
      });
    } catch (err) {
      console.error("Error loading more PRs:", err);
    } finally {
      setLoadMorePRLoading(false);
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (status === "loading") {
    return (
      <div className="h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div>
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-8 px-3 md:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pull Request Dashboard</h1>
          <p className="text-muted-foreground text-xs">
            View and manage all your GitHub pull requests
          </p>
        </div>

        <button
          className={`mt-4 md:mt-0 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
          onClick={fetchPRData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 flex items-center justify-between">
          <p className="text-xs md:text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="ml-4 p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors"
            title="Refresh page"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 lg:grid-cols-12">
        {/* Summary Cards - Mobile Scroll View */}
        <div className="md:hidden col-span-1 w-full overflow-x-auto pb-2">
          <div className="flex space-x-3 min-w-max">
            <StatusCard
              title="Total PRs"
              value={loading ? null : summary.total}
              icon={<FileText className="h-4 w-4" />}
              description="All pull requests"
              color="bg-blue-500"
            />

            <StatusCard
              title="Open PRs"
              value={loading ? null : summary.open}
              icon={<GitPullRequest className="h-4 w-4" />}
              description="Awaiting review"
              color="bg-amber-500"
            />

            <StatusCard
              title="Merged PRs"
              value={loading ? null : summary.merged}
              icon={<GitMerge className="h-4 w-4" />}
              description="Successfully merged"
              color="bg-emerald-500"
            />

            <StatusCard
              title="Closed PRs"
              value={loading ? null : summary.closed}
              icon={<GitPullRequestClosed className="h-4 w-4" />}
              description="Closed without merge"
              color="bg-red-500"
            />
          </div>
        </div>

        {/* Left Section (2/3 width) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-8 space-y-4 md:space-y-6">
          {/* Summary Cards - Desktop View */}
          <div className="hidden md:grid gap-4 grid-cols-4">
            <StatusCard
              title="Total PRs"
              value={loading ? null : summary.total}
              icon={<FileText className="h-5 w-5" />}
              description="All pull requests"
              color="bg-blue-500"
            />

            <StatusCard
              title="Open PRs"
              value={loading ? null : summary.open}
              icon={<GitPullRequest className="h-5 w-5" />}
              description="Awaiting review"
              color="bg-amber-500"
            />

            <StatusCard
              title="Merged PRs"
              value={loading ? null : summary.merged}
              icon={<GitMerge className="h-5 w-5" />}
              description="Successfully merged"
              color="bg-emerald-500"
            />

            <StatusCard
              title="Closed PRs"
              value={loading ? null : summary.closed}
              icon={<GitPullRequestClosed className="h-5 w-5" />}
              description="Closed without merge"
              color="bg-red-500"
            />
          </div>

          {/* Mobile Filter Toggle Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleFilters}
              className="w-full flex items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm font-medium"
            >
              <span className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </span>
              {showFilters ? 
                <ChevronUp className="h-4 w-4" /> : 
                <ChevronDown className="h-4 w-4" />
              }
            </button>
          </div>

          {/* Filters */}
          <div className={`rounded-lg border bg-card text-card-foreground shadow ${!showFilters ? 'hidden md:block' : ''}`}>
            <div className="p-3 md:p-4">
              <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex-1 relative">
                  <input
                    placeholder="Search pull requests..."
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-2">
                  {/* Status Select with Radix UI */}
                  <Select.Root
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as PullRequestStatus)}
                  >
                    <Select.Trigger className="flex h-9 w-full sm:w-[160px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                      <Select.Value placeholder="Status" />
                      <Select.Icon>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
                        <Select.Viewport className="p-1">
                          <Select.Item value="ALL" className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground">
                            <Select.ItemText>All PRs</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="OPEN" className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground">
                            <Select.ItemText>Open</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="MERGED" className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground">
                            <Select.ItemText>Merged</Select.ItemText>
                          </Select.Item>
                          <Select.Item value="CLOSED" className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground">
                            <Select.ItemText>Closed</Select.ItemText>
                          </Select.Item>
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>

                  {/* Repository Select with Radix UI */}
                  <Select.Root
                    value={repoFilter}
                    onValueChange={setRepoFilter}
                  >
                    <Select.Trigger className="flex h-9 w-full sm:w-[180px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 truncate">
                      <Select.Value placeholder="Repository" />
                      <Select.Icon>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Select.Icon>
                    </Select.Trigger>
                    <Select.Portal>
                      <Select.Content className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
                        <Select.Viewport className="p-1 max-h-60 overflow-y-auto">
                          <Select.Item value="all" className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground">
                            <Select.ItemText>All Repositories</Select.ItemText>
                          </Select.Item>
                          {repositories.map((repo: string) => (
                            <Select.Item
                              key={repo}
                              value={repo}
                              className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
                            >
                              <Select.ItemText className="truncate">{repo}</Select.ItemText>
                            </Select.Item>
                          ))}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>
              </div>
            </div>
          </div>

          {/* PR Listing */}
          <div className="space-y-3 md:space-y-4 border p-1 rounded-lg">
            <div className="w-full flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-medium">Pull Requests <span className="text-muted-foreground  text-xs"> ({filteredPRs?.length || 0})</span></h2>
              <p className="w-fit text-muted-foreground text-xs pr-2">Total loaded prs: {pullRequests?.length || 0}</p>
            </div>

            {loading ? (
              <div className="space-y-3 h-80 md:h-96 overflow-y-auto">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="rounded-lg border bg-card text-card-foreground shadow">
                    <div className="p-3 md:p-4">
                      <div className="flex flex-col space-y-3">
                        <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                        <div className="flex justify-between">
                          <div className="h-4 w-1/4 bg-slate-200 rounded animate-pulse"></div>
                          <div className="h-4 w-1/5 bg-slate-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !pullRequests?.length ? (
              <div className="rounded-lg border bg-card text-card-foreground shadow h-80 md:h-96 flex items-center justify-center">
                <div className="p-6 md:p-8 text-center">
                  <p className="text-muted-foreground text-sm">No pull requests found. You haven't created any pull requests yet.</p>
                  <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-2"
                    onClick={fetchPRData}
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
            ) : filteredPRs.length === 0 ? (
              <div className="rounded-lg border bg-card text-card-foreground shadow h-80 md:h-96 flex items-center justify-center">
                <div className="p-6 md:p-8 text-center">
                  <p className="text-muted-foreground text-sm">No pull requests found matching your filters.</p>
                  <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-2"
                    onClick={() => {
                      setStatusFilter("ALL");
                      setRepoFilter("all");
                      setSearchQuery("");
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 h-[calc(100vh-280px)] md:h-[calc(100vh-220px)] overflow-y-auto pr-1 md:pr-2">
                {filteredPRs.map((pr) => (
                  <PullRequestCard key={pr.id} pullRequest={pr} />
                ))}

              </div>
              )}
                {pageInfo.hasNextPage && (
                  <div className="px-3 py-2 md:px-4 md:py-3 border-t border-gray-200 dark:border-gray-700 text-right">
                    <button
                      onClick={loadMorePRs}
                      disabled={loadMorePRLoading}
                      className="inline-flex justify-center items-center py-2 px-3 md:px-4 focus:outline-none bg-primary rounded-md text-xs md:text-sm text-white hover:bg-primary/80 transition-colors duration-200 ease-in-out"
                    >
                      {loadMorePRLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 md:h-4 md:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
          </div>
        </div>

        {/* Right Section (1/3 width) */}
        <div className="col-span-1 md:col-span-1 lg:col-span-4 space-y-4 md:space-y-6">
          {/* Pie Chart */}
          <div className="rounded-lg border bg-card text-card-foreground shadow">
            <div className="flex flex-col space-y-1 p-3 md:p-4">
              <h3 className="font-semibold leading-none tracking-tight">PR Status Distribution</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Breakdown of your pull requests</p>
            </div>
            <div className="pt-0">
              {loading ? (
                <div className="h-[180px] md:h-[220px] flex items-center justify-center">
                  <div className="h-[160px] w-[160px] md:h-[200px] md:w-[200px] rounded-full bg-slate-200 animate-pulse"></div>
                </div>
              ) : (
                <PieChart
                  data={[
                    { name: "Open", value: summary.open, color: "chart-4" },
                    { name: "Merged", value: summary.merged, color: "chart-2" },
                    { name: "Closed", value: summary.closed, color: "chart-1" },
                  ]}
                />
              )}
            </div>
          </div>

          {/* Line Chart */}
          <div className="rounded-lg border bg-card text-card-foreground shadow">
            <div className="flex flex-col space-y-1 p-3 md:p-4">
              <h3 className="font-semibold leading-none tracking-tight">PR Activity Timeline</h3>
              <p className="text-xs md:text-sm text-muted-foreground">Pull requests over time</p>
            </div>
            <div className="py-0">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-[140px] md:h-[180px] bg-slate-200 rounded animate-pulse"></div>
                  <div className="flex justify-between px-2 md:px-4">
                    <div className="h-3 md:h-4 w-8 md:w-12 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 md:h-4 w-8 md:w-12 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 md:h-4 w-8 md:w-12 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-3 md:h-4 w-8 md:w-12 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <LineChart statData={statData} />
              )}
            </div>
          </div>

          {/* Quick Actions - Updated to show "Feature coming soon" */}
          <div className="rounded-lg border bg-card text-card-foreground shadow">
            <div className="flex flex-col space-y-1 p-3 md:p-4 pb-0">
              <h3 className="font-semibold leading-none tracking-tight">Quick Actions</h3>
            </div>
            <div className="flex items-center justify-center h-20 md:h-28">
              <p className="text-xs md:text-sm text-muted-foreground">Feature coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}