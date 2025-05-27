// app/embed/[username]/page.jsx
import { fetchPullRequests, fetchMonthlyPRStats } from "@/lib/github-api-utils";
import { decrypt } from "@/lib/encryption";
import GitHubEmbedComponent from "@/components/embed/GitHubEmbedComponent";
import { supabase } from '@/lib/supabaseClient';

export const viewport = {
  width: "700",
  height: "360",
};

async function fetchGitHubData(username) {
  try {
    const { data } = await supabase
    .from('github_profiles')
    .select('encrypted_token, iv, settings')
    .eq('github_username', username)
    .single()
    
    if (!data) {
      return { error: 'User profile not found' };
    }

    // Process and decrypt token
    const decryptedToken = await decrypt(data.encrypted_token, data.iv);
    
    // Use Promise.all to fetch PR data and monthly stats concurrently
    const [prData, monthlyStatsData] = await Promise.all([
      fetchPullRequests(decryptedToken, null, data.settings.showRecentPRs ? 3 : 0),
      fetchMonthlyPRStats(decryptedToken)
    ]);
    
    // Destructure the results from the concurrent operations
    const { prs, counts } = prData;
    const { monthlyData } = monthlyStatsData;
   
    // Prepare the response data
    return {
      PRdata: {
        totalPRs: counts.open + counts.merged + counts.closed,
        openPRs: counts.open,
        mergedPRs: counts.merged,
        closedPRs: counts.closed,
        monthlyStats: monthlyData
      },
      prs: data.settings.showRecentPRs ? prs : data.settings.showCustomPrs ? data.settings.customPRs : [],
    };
  } catch (err) {
    console.error('Error fetching GitHub embed data:', err);
    return { error: 'Error fetching GitHub embed data' };
  }
}

// Main page component that renders the embed
export default async function EmbedPage({ params }) {
  const { username } = await params;
  
  const githubData = await fetchGitHubData(username);
  
  if (githubData.error) {
    return (
      <div className="w-[700px] h-[360px] flex items-center justify-center bg-card border rounded-lg">
        <p className="text-sm text-muted-foreground">{githubData.error}</p>
      </div>
    );
  }
  
  return (
    <div className="w-[720px] h-[320px]">
      <GitHubEmbedComponent
        stats={githubData.PRdata}
        prs={githubData.prs}
      />
    </div>
  );
}

// API handler for when you need to access the same data via API
// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const username = searchParams.get('username');
  
//   if (!username) {
//     return NextResponse.json({ error: 'Username is required' }, { status: 400 });
//   }
  
//   const githubData = await fetchGitHubData(username);
  
//   if (githubData.error) {
//     return NextResponse.json({ error: githubData.error }, { status: 404 });
//   }
  
//   return NextResponse.json({ data: githubData });
// }