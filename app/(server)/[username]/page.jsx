import { decrypt } from "@/lib/encryption";
import { fetchPullRequests, fetchMonthlyPRStats } from "@/lib/github-api-utils";
import { redirect } from "next/navigation";
import { supabase } from '@/lib/supabaseClient';
import { ProfilePreview } from "@/components/profile-preview";

export default async function PublicProfilePage({ params }) {
  const { username } = await params;

   const { data } = await supabase
    .from('github_profiles')
    .select('encrypted_token, iv, settings')
    .eq('github_username', username)
    .single()

  if (!data) {
    redirect("/"); // Server-side redirect if profile not found
  }

  // Default settings in case anything is missing
  const defaultSettings = {
    showCharts: true,
    customTitle: "GitHub Contributions",
    description: "A showcase of open source contributions and pull requests.",
    showSummary: true,
    showRecentPRs: true,
    recentPRsCount: 5,
    showCustomPrs: true,
    customPRs: [],
  };

  // Merge user settings with defaults (to handle incomplete settings)
  const settings = { ...defaultSettings, ...data.settings };

  try {
    if (!data.encrypted_token || !data.iv) {
      redirect("/");
    }
    
    const decryptedToken = await decrypt(data.encrypted_token, data.iv);

    const fetchGitHubData = async () => {
      const results = {
        userInfo: null,
        prs: null,
        counts: { open: 0, merged: 0, closed: 0 },
        monthlyData: []
      };
      
      // Setup all promises
      const promises = [
        // Get all data in one request
        fetchPullRequests(decryptedToken, null, settings.showRecentPRs ? settings.recentPRsCount : 0)
          .then(data => {
            results.userInfo = data.userInfo;
            results.prs = data.prs;
            results.counts = data.counts;
          }),
      ];
      
      // Only add stats promise if charts are enabled
      if (settings.showCharts) {
        promises.push(
          fetchMonthlyPRStats(decryptedToken)
            .then(data => {
              results.monthlyData = data.monthlyData;
            })
        );
      }
      
      // Wait for all promises to complete
      await Promise.all(promises);
      
      return results;
    };
    
    // Execute the parallel fetching
    const { userInfo, prs, counts, monthlyData } = await fetchGitHubData();
    
    const profile = {
      name: userInfo.name || userInfo.login,
      bio: userInfo.bio || "",
      image: userInfo.avatarUrl,
      githubUsername: userInfo.login,
      publicRepos: userInfo.publicRepos || 0,
      followers: userInfo.followers || 0,
    };

    const summary = {
      open: counts.open,
      merged: counts.merged,
      closed: counts.closed,
    };

    return (
      <ProfilePreview 
        profile={profile}
        summary={summary}
        settings={settings}
        pullRequests={prs}
        monthlyData={monthlyData}
      />
    );
  } catch (err) {
    console.error("Error loading GitHub data:", err);
    redirect("/");
  }
}