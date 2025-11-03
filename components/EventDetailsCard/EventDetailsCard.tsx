import {
  BuildingIcon,
  CalendarDaysIcon,
  ClockIcon,
  PhoneIcon,
  ReceiptEuroIcon,
  TicketIcon,
  UsersIcon,
} from "lucide-react";
import { PersonIcon } from "@radix-ui/react-icons";

import { Typography } from "@/components/Typography";
import { Card, CardContent } from "@/components/ui/card";
import { Event, Host } from "@/lib/api";
import { formatDateRange, formatTimeRange } from "@/lib/utils";

function OrganizersList({ organizers }: { organizers: Host[] }) {
  return (
    <div className="space-y-1">
      {organizers.map((org, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <PersonIcon className="size-4 shrink-0" />
          {org.link ? (
            <a href={org.link} target="_blank" rel="noopener noreferrer">
              {org.name}
            </a>
          ) : (
            org.name
          )}
        </div>
      ))}
    </div>
  );
}

export function EventDetailsCard({ event }: { event: Event }) {
  const organizers = event.organizers as Host[];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="size-4 shrink-0" />
            <Typography.P>
              {formatDateRange(event.startDate, event.endDate)}
            </Typography.P>
          </div>

          <div className="flex items-center gap-2">
            <ClockIcon className="size-4 shrink-0" />
            <Typography.P>
              {formatTimeRange(event.startTime, event.endTime)}
            </Typography.P>
          </div>

          <div className="flex items-center gap-2">
            <BuildingIcon className="size-4 shrink-0" />
            <Typography.P className="leading-tight">
              {event.place}, {event.address}, {event.town}
            </Typography.P>
          </div>

          {event.phoneNumber?.trim() && (
            <div className="flex items-center gap-2">
              <PhoneIcon className="size-4 shrink-0" />
              <Typography.P>
                <a
                  href={`tel:${event.phoneNumber}`}
                  className="text-primary hover:underline block md:hidden"
                >
                  {event.phoneNumber}
                </a>

                <span className="hidden md:block">{event.phoneNumber}</span>
              </Typography.P>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          {event.ticketsLink?.trim() && (
            <div className="flex items-center gap-2">
              <TicketIcon className="size-4 shrink-0" />
              <a
                href={event.ticketsLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Билети
              </a>
            </div>
          )}

          {event.price?.trim() && (
            <div className="flex items-center gap-2">
              <ReceiptEuroIcon className="size-4 shrink-0" />
              <Typography.P>Цена: {event.price}лв</Typography.P>
            </div>
          )}

          {organizers.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <UsersIcon className="size-4 shrink-0" />
                <Typography.P>Организатори: </Typography.P>
              </div>
              <OrganizersList organizers={organizers} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
