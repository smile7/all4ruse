"use client";

import { MailIcon } from "lucide-react";

import { Avatar, AvatarImage, Card, CardContent } from "@/components/ui";
import { DEFAULT_AVATAR } from "@/constants";
import { useProfile } from "@/hooks/query";

import ProfileContent from "./ProfileContent";

export default function ProfilePage() {
  const { data, isLoading, error } = useProfile();

  // TODO: add skeleton
  if (isLoading || Boolean(error) || !data) return null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent>
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={data.avatar_url || DEFAULT_AVATAR}
                  alt="avatar"
                />
              </Avatar>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <h1 className="text-2xl font-bold">{data.full_name}</h1>
              </div>
              {data.website && (
                <p className="break-all text-muted-foreground">
                  {data.website}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MailIcon className="size-4" />
                  {data.email}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfileContent />
    </div>
  );
}
