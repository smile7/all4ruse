"use client";

// import { useMemo } from "react";

import { Typography } from "@/components/Typography";
// import { ErrorAlert } from "@/components/ui";
// import { useEvents, useProfile } from "@/hooks/query";

// import { Events } from "../_components";

export default function PublishedEventsPage() {
  //   const { data: profile, isLoading: isProfileLoading } = useProfile();
  //   const { data: events = [], isLoading: isEventsLoading, error } = useEvents();

  //   const myEvents = useMemo(() => {
  //     if (!profile) return events;

  //     // ⬇️ IMPORTANT:
  //     // Replace `created_by` with the actual foreign-key field in your `events` table
  //     // that points to the user/profile (e.g. `owner_id`, `creator_id`, `profile_id`, etc).
  //     return events.filter((e) => (e as any).created_by === profile.id);
  //   }, [events, profile]);

  //   if (isProfileLoading || isEventsLoading) {
  //     return <p>Loading...</p>;
  //   }

  return (
    <div className="space-y-10">
      {/* {error && <ErrorAlert error={error.message} />} */}

      <section className="space-y-4">
        <Typography.H2>Upcoming and current events</Typography.H2>
        {/* <Events events={myEvents} timeFilter="upcoming" showEditButton /> */}
      </section>

      <section className="space-y-4">
        <Typography.H2>Past events</Typography.H2>
        {/* <Events events={myEvents} timeFilter="past" showEditButton /> */}
      </section>
    </div>
  );
}
