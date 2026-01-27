import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

export async function DELETE() {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        {
          status: 401,
        },
      );
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !url) {
      console.error("SUPABASE_SERVICE_ROLE_KEY or URL is not configured");
      return NextResponse.json(
        { error: "Server is not configured for account deletion" },
        { status: 500 },
      );
    }

    const adminClient = createAdminClient<Database>(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Delete related data in an order that respects foreign key constraints:
    // 1) events -> 2) profile -> 3) auth user

    const { error: eventsError } = await adminClient
      .from("events")
      .delete()
      .eq("createdBy", user.id);

    if (eventsError) {
      console.error("Error deleting events for user", eventsError);
      return NextResponse.json(
        { error: "Could not delete your events. Please try again later." },
        { status: 500 },
      );
    }

    const { error: profileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (profileError) {
      console.error("Error deleting profile", profileError);
      return NextResponse.json(
        { error: "Could not delete your profile. Please try again later." },
        { status: 500 },
      );
    }

    // Finally delete the auth user so they cannot log in again
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      user.id,
    );

    if (deleteError) {
      console.error("Error deleting auth user", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error deleting account", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
      },
    );
  }
}
