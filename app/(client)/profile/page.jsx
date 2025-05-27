"use client";

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ExternalLink, Search, Plus, X, RefreshCw } from 'lucide-react';
import {
  Save,
  Share,
  Code,
  Copy,
  Check,
  Eye
} from "lucide-react";
import * as Tabs from '@radix-ui/react-tabs';
import * as Switch from '@radix-ui/react-switch';
import { ProfilePreview } from "@/components/profile-preview";
import { useSharedState } from "../context/SharedStateContext";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }

  const { 
    profilePageData, 
    setProfilePageData, 
    originalData, 
    setOriginalData,
    dashboardPageData,
    setHasChanges,
    hasChanges,
    error
  } = useSharedState();
  const [copiedState, setCopiedState] = useState({
    profile: false,
    github: false,
    website: false
  });
  const [sendStatus, setSendStatus] = useState('idle');
  const [prSearchQuery, setPrSearchQuery] = useState('');

  // Check if current data differs from original data
  const checkForChanges = (newData) => {
    if (!originalData) return false;
    return JSON.stringify(newData) !== JSON.stringify(originalData);
  };

  const handleSave = async () => {
    setSendStatus("loading");
    try {
      const res = await fetch('/api/github-profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUsername: session?.github?.login,
          settings: profilePageData,
        }),
      });

      const result = await res.json();
      
      if (!res.ok) {
        console.error('Save failed:', result.error);
      } else {
        setOriginalData(profilePageData); // Update original data
        setHasChanges(false); // Reset changes flag
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save changes!');
    }

    setSendStatus("done");
    setTimeout(() => {
      setSendStatus("idle");
    }, 3000);
  }

  const handleCopy = (text, target) => {
    navigator.clipboard.writeText(text); 
    setCopiedState(prev => ({
      ...prev,
      [target]: true
    }));
    setTimeout(() => {
      setCopiedState(prev => ({
        ...prev,
        [target]: false
      }));
    }, 2000);
  };

  // Update specific profile property in shared state
  const updateProfileProperty = (property, value) => {
    const newData = {
      ...profilePageData,
      [property]: value
    };
    setProfilePageData(newData);
    setHasChanges(checkForChanges(newData));
  };

  // console.log("Profile Page Data:", profilePageData);

  // Filter PRs based on search query
  const filteredPRs = useMemo(() => {
    if (!dashboardPageData?.pullRequests || !prSearchQuery.trim()) {
      return [];
    }
    
    const query = prSearchQuery.toLowerCase();
    return dashboardPageData.pullRequests.filter(pr => 
      pr.title.toLowerCase().includes(query) || 
      pr.repository.name.toLowerCase().includes(query)
    );
  }, [prSearchQuery, dashboardPageData?.pullRequests]);

// Add a PR to the custom selection
const addToCustomPRs = (pr) => {
  if (profilePageData.customPRs?.some(selectedPR => selectedPR.id === pr.id)) {
    return;
  }
  if (profilePageData.customPRs?.length >= 10) {
    alert("You can't select more than 10 PRs");
    return;
  }
  const updatedCustomPRs = [...profilePageData.customPRs, pr];
  const newData = {
    ...profilePageData,
    customPRs: updatedCustomPRs
  };
  setProfilePageData(newData);
  setHasChanges(checkForChanges(newData));
  setPrSearchQuery(''); // Clear search after adding
};

// Remove a PR from the custom selection
const removeFromCustomPRs = (prId) => {
  const updatedCustomPRs = profilePageData.customPRs.filter(pr => pr.id !== prId);
  const newData = {
    ...profilePageData,
    customPRs: updatedCustomPRs
  };
  setProfilePageData(newData);
  setHasChanges(checkForChanges(newData));
};

  const embedCode = `<iframe 
  src="${process.env.NEXT_PUBLIC_BASE_URL}/embed/${session?.github?.login}" 
  width="720" 
  height="320"
  frameborder="0"
  loading="lazy"
></iframe>`;

  if (status === "loading") {
    return (
      <div className="h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div>
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="container py-6 px-4 h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground text-xs">
            Customize how your PR profile appears to others
          </p>
        </div>

        <div className="mt-4 md:mt-0 space-x-2">
          <a
            href={`/${session?.github?.login}`}
            target="_blank"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </a>
          <button
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
            onClick={handleSave}
            disabled={sendStatus !== 'idle' || !hasChanges}
          >
            {
              sendStatus == 'loading' ?
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg> 
                Saving...
              </>
            : sendStatus == 'done' ? 
            <>
              <Check className="h-4 w-4 mr-2" />
              Changes Saved
            </>
            :
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
            }
          </button>
        </div>
      </div>      {error && (
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

      <div className="grid gap-6 md:grid-cols-12 h-[calc(100vh-4rem-100px)]">
        <div className="md:col-span-5 lg:col-span-4 overflow-y-auto pr-2 h-full">
          <div className="space-y-6">            {/* Display Options Card */}
            <div className="rounded-lg border bg-card text-card-foreground shadow">              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="font-semibold leading-none tracking-tight">Display Options</h3>
                <p className="text-sm text-muted-foreground">Customize your profile appearance</p>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <div className="space-y-2 pb-4">
                  <div className="space-y-2">
                    <label htmlFor="customTitle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Profile Header
                    </label>
                    <input
                      id="customTitle"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={profilePageData.customTitle || ""}
                      onChange={(e) => updateProfileProperty('customTitle', e.target.value)}
                      placeholder="Enter a title for your profile"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Profile Description
                    </label>
                    <textarea
                      id="description"
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      value={profilePageData.description || ""}
                      onChange={(e) => updateProfileProperty('description', e.target.value)}
                      rows={3}
                      placeholder="Add a description about your contributions"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="showSummary"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Show PR Summary
                  </label>
                  <Switch.Root
                    id="showSummary"
                    checked={profilePageData.showSummary || false}
                    onCheckedChange={(checked) => updateProfileProperty('showSummary', checked)}
                    className="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                  >
                    <Switch.Thumb className="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
                  </Switch.Root>
                </div>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="showCharts"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Show Charts
                  </label>
                  <Switch.Root
                    id="showCharts"
                    checked={profilePageData.showCharts || false}
                    onCheckedChange={(checked) => updateProfileProperty('showCharts', checked)}
                    className="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                  >
                    <Switch.Thumb className="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
                  </Switch.Root>
                </div>

                <div className="flex items-center justify-between">
                  <label
                    htmlFor="showRecentPRs"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Show Recent PRs
                  </label>
                  <Switch.Root
                    id="showRecentPRs"
                    checked={profilePageData.showRecentPRs || false}
                    onCheckedChange={(checked) => {
                      const updates = { showRecentPRs: checked };
                      if (checked) {
                        updates.showCustomPrs = false;
                      }
                      const newData = {
                        ...profilePageData,
                        ...updates
                      };
                      setProfilePageData(newData);
                      setHasChanges(checkForChanges(newData));
                    }}
                    className="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                  >
                    <Switch.Thumb className="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
                  </Switch.Root>
                </div>

                {profilePageData.showRecentPRs && (
                  <div className="flex items-center justify-between mt-2 pl-6">
                    <label
                      htmlFor="recentPRsCount"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Number of PRs to show
                    </label>
                    <select
                      id="recentPRsCount"
                      value={profilePageData.recentPRsCount || 3}
                      onChange={(e) => updateProfileProperty('recentPRsCount', parseInt(e.target.value))}
                      className="h-9 w-20 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value={3}>3</option>
                      <option value={6}>6</option>
                      <option value={10}>10</option>
                    </select>
                  </div>
                )}

                {/* New Custom PR Selection Toggle */}
                <div className="flex items-center justify-between mt-4">
                  <label
                    htmlFor="showCustomPrs"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Use Custom PR Selection
                  </label>
                  <Switch.Root
                    id="showCustomPrs"
                    checked={profilePageData.showCustomPrs || false}
                    onCheckedChange={(checked) => {
                      const updates = { showCustomPrs: checked };                      
                      if (checked) {
                        updates.showRecentPRs = false;
                      }
                      const newData = {
                        ...profilePageData,
                        ...updates
                      };
                      setProfilePageData(newData);
                      setHasChanges(checkForChanges(newData));
                    }}
                    className="peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                  >
                    <Switch.Thumb className="pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0" />
                  </Switch.Root>
                </div>

                {/* Custom PR Selection UI */}
                {profilePageData.showCustomPrs && (
                  <div className="mt-2 space-y-4 border-t pt-4">
                    <div className="text-sm font-medium">
                      Custom PR Selection 
                      <span className="text-xs text-muted-foreground ml-2">
                        ({(profilePageData.customPRs?.length || 0)}/10)
                      </span>
                    </div>
                    
                    {/* PR Search */}
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        placeholder="Search your PRs by title or repository..."
                        value={prSearchQuery}
                        onChange={(e) => setPrSearchQuery(e.target.value)}
                        className="pl-8 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    
                    {/* Search Results */}
                    {filteredPRs.length > 0 && prSearchQuery.trim() !== '' && (
                      <div className="max-h-48 overflow-y-auto border rounded-md">
                        {filteredPRs.slice(0, 5).map(pr => (
                          <div 
                            key={pr.id} 
                            className="p-2 hover:bg-accent flex justify-between items-center cursor-pointer border-b last:border-b-0"
                            onClick={() => addToCustomPRs(pr)}
                          >
                            <div className="overflow-hidden">
                              <div className="text-sm font-medium truncate">{pr.title}</div>
                              <div className="text-xs text-muted-foreground">{pr.repository.name}</div>
                            </div>
                            <button className="p-1 hover:bg-primary hover:text-primary-foreground rounded">
                              <Plus size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Selected PRs */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Selected Pull Requests</p>
                      {(!profilePageData.customPRs || profilePageData.customPRs.length === 0) ? (
                        <div className="text-sm text-muted-foreground italic">
                          No PRs selected. Search and add PRs above.
                        </div>
                      ) : (
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {profilePageData.customPRs.map(pr => (
                            <div 
                              key={pr.id} 
                              className="p-2 border rounded-md flex justify-between items-center hover:bg-accent/20"
                            >
                              <div className="overflow-hidden">
                                <div className="text-sm font-medium truncate">{pr.title}</div>
                                <div className="text-xs text-muted-foreground">{pr.repository.name}</div>
                              </div>
                              <button 
                                className="p-1 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400 rounded-full"
                                onClick={() => removeFromCustomPRs(pr.id)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sharing Options Card */}
            <div className="rounded-lg border bg-card text-card-foreground shadow">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="font-semibold leading-none tracking-tight">Sharing Options</h3>
                <p className="text-sm text-muted-foreground">Share your PR profile with others</p>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <Tabs.Root defaultValue="link" className="w-full">
                  <Tabs.List className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full mb-4">
                    <Tabs.Trigger
                      value="link"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex-1"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Profile Link
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="embed"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow flex-1"
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Embed Code
                    </Tabs.Trigger>
                  </Tabs.List>

                  <Tabs.Content value="link" className="mt-2">
                    <div className="space-y-2">
                      <label htmlFor="profileLink" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Public Profile URL
                      </label>
                      <div className="flex space-x-2">
                        <input
                          id="profileLink"
                          readOnly
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 text-primary"
                          value={`${process.env.NEXT_PUBLIC_BASE_URL}/${session?.github?.login}`}
                        />
                        <button
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9"
                          onClick={() => handleCopy(`${process.env.NEXT_PUBLIC_BASE_URL}/${session?.github?.login}`, "profile")}
                        >
                           {copiedState.profile ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Share this link on your resume, LinkedIn, or portfolio website.
                      </p>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="embed" className="mt-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="embedCodeGitHub" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Embed Code for GitHub README
                        </label>
                        <div className="relative">
                          <textarea
                            id="embedCodeGitHub"
                            readOnly
                            value={`![ShowPR](${process.env.NEXT_PUBLIC_BASE_URL}/api/badge/${session?.github?.login}?v=1)`}
                            rows={2}
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none pr-10 font-mono text-xs text-primary"
                          />
                          <button
                            className="absolute top-2 right-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                            onClick={() => handleCopy(`[![ShowPR](${process.env.NEXT_PUBLIC_BASE_URL}/api/badge/${session?.github?.login}?v=1)](${process.env.NEXT_PUBLIC_BASE_URL}/${session?.github?.login})`,"github")}
                          >
                            {copiedState.github ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Add this code to your GitHub README to show your PR activity.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="embedCodePersonal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Embed Code for Website
                        </label>
                        <div className="relative">
                          <textarea
                            id="embedCodePersonal"
                            readOnly
                            value={embedCode}
                            rows={4}
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none pr-10 font-mono text-xs text-primary"
                          />
                          <button
                            className="absolute top-2 right-2 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8"
                            onClick={() => handleCopy(embedCode, "website")}
                          >
                            {copiedState.website ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Add this code to your personal website or portfolio to showcase your PR activity.
                        </p>
                      </div>
                    </div>
                  </Tabs.Content>
                </Tabs.Root>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="md:col-span-7 lg:col-span-8 overflow-y-auto pl-2 h-full">
          <div className="rounded-lg border border-primary/50 bg-card text-card-foreground shadow">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="font-semibold leading-none tracking-tight">Profile Preview</h3>
              <p className="text-sm text-muted-foreground">Here's how your profile will look to others</p>
            </div>            <div className="p-0">
              <ProfilePreview 
                profile={{
                  name: session?.github?.name || session?.github?.login,
                  bio: session?.github?.bio || "",
                  image: session?.github?.avatar_url,
                  githubUsername: session?.github?.login,
                  publicRepos: session?.github?.public_repos || 0,
                  followers: session?.github?.followers || 0,
                }}
                summary={dashboardPageData?.summary || {
                  open: 0,
                  merged: 0,
                  closed: 0
                }}
                settings={profilePageData}
                pullRequests={profilePageData.showRecentPRs ? 
                  dashboardPageData?.pullRequests?.slice(0, profilePageData.recentPRsCount) : 
                  profilePageData.showCustomPrs ? 
                  profilePageData.customPRs : 
                  []
                }
                monthlyData={dashboardPageData?.statData}
              />
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}