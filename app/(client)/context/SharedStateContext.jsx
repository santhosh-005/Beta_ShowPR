'use client';
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from "next-auth/react";
import axios from 'axios';

const SharedStateContext = createContext();

export const SharedStateProvider = ({ children }) => {
  const { data: session, status } = useSession();
  
  // Refs to track if operations are in progress
  const profileFetchInProgress = useRef(false);
  const dashboardFetchInProgress = useRef(false);
  const abortControllers = useRef({});

  const initialDashboardPageData = {
    dataFetched: false,
    pullRequests: [],
    summary: { open: 0, closed: 0, merged: 0, total: 0 },
    pageInfo: {},
    statData: {},
    repositories: []
  };
 
  const intialProfilePageData = {
    dataFetched: false,
    showSummary: true,
    showCharts: true,
    showRecentPRs: true,
    recentPRsCount: 3,
    showCustomPrs: false,
    customPRs: [],
    customTitle: "My GitHub Contributions",
    description: "A showcase of my open source contributions and pull requests.",
  }

  const [dashboardPageData, setDashboardPageData] = useState(initialDashboardPageData);
  const [profilePageData, setProfilePageData] = useState(intialProfilePageData);
  const [originalData, setOriginalData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cleanup function for abort controllers
  const cleanupRequest = (key) => {
    if (abortControllers.current[key]) {
      abortControllers.current[key].abort();
      delete abortControllers.current[key];
    }
  };

  // Function to fetch PR data from backend
  const fetchPRData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (dashboardFetchInProgress.current) {
      return;
    }

    dashboardFetchInProgress.current = true;
    setLoading(true);
    setError(null);
    
    // Create abort controller for this request
    const controller = new AbortController();
    abortControllers.current.dashboard = controller;

    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/github/user-data`,
        { signal: controller.signal }
      );
      
      const { prs, counts, pageInfo, monthlyData } = data;
      const repos = Array.from(new Set(prs.map(pr => pr.repository.name)));

      setDashboardPageData(prev => ({
        ...prev,
        dataFetched: true,
        pullRequests: prs,
        summary: counts,
        pageInfo,
        statData: monthlyData,
        repositories: repos,
      }));
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        console.error('Error fetching PR data:', err);
      }
    } finally {
      setLoading(false);
      dashboardFetchInProgress.current = false;
      cleanupRequest('dashboard');
    }
  }, [dashboardPageData.dataFetched]);

  const handleSaveNewUser = useCallback(async () => {
    try {
      const controller = new AbortController();
      abortControllers.current.saveUser = controller;

      const res = await fetch('/api/github-profile', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUsername: session?.github?.login,
          settings: profilePageData,
        }),
        signal: controller.signal,
      });
              
      const result = await res.json();  
      if (!res.ok) {
        throw new Error(result.error || 'Failed to save user profile');
      }

      // Send welcome email only once after successful profile creation
      try {
        const emailController = new AbortController();
        const payload = {
          send_to: session?.github?.email || "",
          user_name: session?.github?.login || "",
        };
        const url = 'https://script.google.com/macros/s/AKfycbz4jWNd_uufl8d_gCvxB0s3eUQhSvUXMcH5ahDx4xX3MVkb1I33-atKM16_3Bl_I8tq/exec';

        await fetch(url, {
          method: 'POST',
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: JSON.stringify(payload),
          mode: "no-cors",
          signal: emailController.signal,
        });
      } catch (emailErr) {
        console.log("Error sending welcome email:", emailErr);
      }
      
      return result;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error saving user profile:', err);
        throw err;
      }
    } finally {
      cleanupRequest('saveUser');
    }
  }, [session?.github?.email]);

  // Effect to fetch profile data
  useEffect(() => {
    const getData = async () => {
      // Prevent multiple simultaneous calls
      if (profileFetchInProgress.current) {
        return;
      }

      profileFetchInProgress.current = true;
      const controller = new AbortController();
      abortControllers.current.profile = controller;

      try {
        const res = await fetch(
          `/api/github-profile?username=${session?.github?.login}`,
          { signal: controller.signal }
        );
        const { data, error } = await res.json();
  
        if (!res.ok || error) {
          console.error("API error:", error);
          if (error?.code === "PGRST116") {
            console.log("No profile data found, creating new profile...");
            await handleSaveNewUser();
          }
          return;
        }
  
        if (res.ok && data?.settings) {
          const newData = {
            ...intialProfilePageData,
            ...data.settings,
            dataFetched: true,
          };
          setProfilePageData(newData);
          setOriginalData(newData);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
          console.error("Error fetching profile data:", err);
        }
      } finally {
        profileFetchInProgress.current = false;
        cleanupRequest('profile');
      }
    };

    // Only fetch if authenticated and data not yet fetched
    if (status === "authenticated" && 
        !profilePageData?.dataFetched && 
        !profileFetchInProgress.current) {
      getData();
    }
  }, [status]);

  // Effect to fetch dashboard data when authenticated
  useEffect(() => {
    if (status === "authenticated" && 
        !dashboardPageData.dataFetched && 
        !dashboardFetchInProgress.current) {
      fetchPRData();
    }
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.keys(abortControllers.current).forEach(cleanupRequest);
    };
  }, []);

  const value = {
    dashboardPageData,
    setDashboardPageData,
    profilePageData,
    setProfilePageData,
    originalData,
    setOriginalData,
    loading,
    error,
    fetchPRData,
    handleSaveNewUser,
    setHasChanges,
    hasChanges
  };

  return (
    <SharedStateContext.Provider value={value}>
      <div className="min-h-screen flex flex-col bg-background">
        {children}
      </div>
    </SharedStateContext.Provider>
  );
};

export const useSharedState = () => useContext(SharedStateContext);