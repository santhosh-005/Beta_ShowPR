import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from '@/lib/supabaseClient'

const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-hub-signature-256");
  const body = await req.text();

  const hmac = crypto.createHmac("sha256", GITHUB_WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(body).digest("hex");

  if (signature !== digest) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const event = req.headers.get("x-github-event");

  // Handle events like 'marketplace_purchase'
  if (event === "marketplace_purchase") {
    // Handle new purchase, change, cancellation
    const action = payload.action;
    
    await supabase.from('github_marketplace_events').insert({
        github_account_id: payload.marketplace_purchase.account.id,
        account_login: payload.marketplace_purchase.account.login,
        event_action: payload.action,
        plan_name: payload.marketplace_purchase.plan.name,
        plan_id: payload.marketplace_purchase.plan.id,
        sender_login: payload.sender.login,
        payload: payload, // optional
    });
  }

  return NextResponse.json({ success: true });
}
