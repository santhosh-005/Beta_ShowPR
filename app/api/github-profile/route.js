// app/api/saveProfile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { encrypt } from '@/lib/encryption'
import { getToken } from "next-auth/jwt";

export async function POST(req) {
  try {
    // Get session data
    console.log('POST /api/github-profile')
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get settings from request body
    const { settings, githubUsername } = await req.json()

    // Get user data from session
    const accessToken = token.accessToken;
    const email = token.github?.email || "";

    if (!githubUsername || !accessToken) {
      return NextResponse.json({ error: 'Invalid session data' }, { status: 400 });
    }

    // Encrypt the access token
    const { encryptedData, iv } = await encrypt(accessToken)

    // Save to database
    const { data, error } = await supabase.from('github_profiles').upsert(
      {
        github_username: githubUsername,
        encrypted_token: encryptedData,
        iv: iv,
        settings,
        email,
      },
      {
        onConflict: 'github_username',
      }
    )

    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json({ data }, { status: 200 })
  } catch (err) {
    console.error('Server error in POST /api/github-profile:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const { githubUsername, settings } = await req.json()

    if (!githubUsername) {
      return NextResponse.json(
        { error: 'GitHub username is required' },
        { status: 400 }
      )
    }

    // Only update the settings field
    const { data, error } = await supabase
      .from('github_profiles')
      .update({
        settings: settings,
      })
      .eq('github_username', githubUsername)
      .select();

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data
    }, { status: 200 })
  } catch (err) {
    console.error('Server error in PATCH /api/saveProfile:', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')

    const { data, error } = await supabase
      .from('github_profiles')
      .select('settings')
      .eq('github_username', username)
      .single()

    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json({ data }, { status: 200 })

  } catch (err) {
    console.error('Server error in GET /api/saveProfile:', err)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
