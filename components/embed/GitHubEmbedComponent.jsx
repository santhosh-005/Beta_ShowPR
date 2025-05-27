"use client"

import { useState } from 'react';
import { PieChart } from "@/components/dashboard/pie-chart";
import { LineChart } from "@/components/dashboard/line-chart";
import { PullRequestCard } from "@/components/dashboard/pr-card";
import {
  BarChart3,
  LineChart as LineChartIcon,
  GitPullRequest,
  FileText
} from "lucide-react";
import { StatusCard } from '../dashboard/status-card';

export default function GitHubEmbedComponent({ stats, prs }) {
  const [activeTab, setActiveTab] = useState('stats');
  const [chartType, setChartType] = useState('pie');

  const { totalPRs, mergedPRs, openPRs, closedPRs, monthlyStats } = stats;

  return (
    <div className="h-full w-full rounded-lg border shadow-sm bg-card overflow-hidden flex flex-col">
      {/* Tab Navigation */}
      {/* Tab Navigation */}
      <div className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-800 p-1 mb-1">
        <button
          onClick={() => setActiveTab('stats')}
          className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium flex-1 transition-all ${
            activeTab === 'stats' 
              ? 'bg-zinc-700 text-white shadow-sm' 
              : 'text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium flex-1 transition-all ${
            activeTab === 'recent' 
              ? 'bg-zinc-700 text-white shadow-sm' 
              : 'text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          <GitPullRequest className="h-4 w-4 mr-2" />
          Recent PRs
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-2 pb-2 relative">
        {/* Statistics Tab */}
        <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'stats' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
          <div className="flex flex-row gap-2 h-full">
            {/* Status Cards */}
            <div className="flex flex-col gap-2 w-1/3 h-10">
              <StatusCard
                title="Total PRs"
                value={totalPRs}
                icon={<FileText className="h-4 w-4" />}
                description="All pull requests"
                color="bg-blue-500"
                compact
              />
              <StatusCard
                title="Merged PRs"
                value={mergedPRs}
                icon={<GitPullRequest className="h-4 w-4" />}
                description="Successfully merged"
                color="bg-green-500"
                compact
              />
            </div>

            {/* Chart */}
            <div className="w-2/3 relative">
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={() => setChartType(chartType === 'pie' ? 'line' : 'pie')}
                  className="p-1 rounded-md bg-muted hover:bg-muted/80"
                  title={chartType === 'pie' ? 'Show activity timeline' : 'Show PR distribution'}
                >
                  {chartType === 'pie' ? <LineChartIcon className="h-3 w-3" /> : <BarChart3 className="h-3 w-3" />}
                </button>
              </div>  

              <div className="border rounded-md p-2 h-full bg-white dark:bg-zinc-900">
                <h4 className="text-xs font-medium mb-1">
                  {chartType === 'pie' ? 'PR Status Distribution' : 'PR Activity (Last 6 Months)'}
                </h4>

                <div className="h-[180px]">
                  {chartType === 'pie' ? (
                    <PieChart
                      data={[
                        { name: "Open", value: openPRs, color: "chart-4" },
                        { name: "Merged", value: mergedPRs, color: "chart-2" },
                        { name: "Closed", value: closedPRs, color: "chart-1" },
                      ]}
                    />
                  ) : (
                    <LineChart statData={monthlyStats} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent PRs Tab */}
        <div className={`absolute inset-0 transition-all duration-300 ${activeTab === 'recent' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
          <div className="space-y-1 h-[220px]">
            {prs?.length > 0 ? (
              prs.slice(0, 3).map((pr) => (
                <PullRequestCard
                  key={pr.id}
                  pullRequest={pr}
                />
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground">pull requests showcase turned off</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-right pr-2">
        <p className="text-[8px] text-muted-foreground">Powered by <a href="/" className="underline text-blue-500 font-bold">ShowPR</a></p>
      </div>
    </div>
  );
}
