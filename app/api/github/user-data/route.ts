import { NextRequest, NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import { fetchPullRequests, fetchMonthlyPRStats } from '@/lib/github-api-utils';

// Define the type for the JWT token
interface Token {
  accessToken?: string;
  github?: {
    login: string;
    avatar_url: string;
    html_url: string;
    name?: string;
    email?: string;
    bio?: string;
    public_repos?: number;
  };
  [key: string]: any;
}

export async function GET(req: NextRequest) {  
  try {
    // Get parameters from URL
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor') || null;
    const limit = parseInt(searchParams.get('limit') || '30');
    
    // Get the token from the session JWT
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }) as Token | null;
    
    // Check if token exists and has accessToken
    if (!token || !token.accessToken) {
      console.log('No valid token found in the session');
      return NextResponse.json({ error: 'No access token found' }, { status: 401 });
    }
    
    const accessToken = token.accessToken;
    
    // Fetch PR data and monthly stats in parallel
    const [prData, statsData] = await Promise.all([
      fetchPullRequests(accessToken, cursor, limit),
      fetchMonthlyPRStats(accessToken)
    ]);
    
    // Combine and return the data
    return NextResponse.json({
      ...prData,
      ...statsData
    });
  } catch (error) {
    console.error('Error in GitHub data fetch:', error);
    // Type check error before accessing message property
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
