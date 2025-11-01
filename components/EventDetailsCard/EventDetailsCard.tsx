import { Building, CalendarDays, Clock, Phone, Ticket } from "lucide-react";

import { Typography } from "@/components/Typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, Host } from "@/lib/api";
import { formatDateRange, formatTimeRange } from "@/lib/utils";

function OrganizersList({ organizers }: { organizers: Host[] }) {
  return (
    <div className="space-y-1">
      {organizers.map((org, idx) => (
        <div key={idx}>
          {org.link ? (
            <a
              href={org.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
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
          {/* Date */}
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-gray-500" />
            <Typography.P>
              {formatDateRange(event.startDate, event.endDate)}
            </Typography.P>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <Typography.P>
              {formatTimeRange(event.startTime, event.endTime)}
            </Typography.P>
          </div>

          {/* Place */}
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-gray-500" />
            <Typography.P>
              <strong>{event.place}</strong>, {event.address}, {event.town}
            </Typography.P>
          </div>

          {/* Phone (clickable) */}
          {event.phoneNumber?.trim() && (
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-gray-500" />
              <Typography.P>
                <a
                  href={`tel:${event.phoneNumber}`}
                  className="text-primary hover:underline"
                >
                  {event.phoneNumber}
                </a>
              </Typography.P>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          {/* Organizers */}
          {organizers.length > 0 && (
            <div>
              <Typography.P className="font-semibold">
                Организатори:{" "}
              </Typography.P>
              <OrganizersList organizers={organizers} />
            </div>
          )}

          {/* Tickets */}
          {event.ticketsLink?.trim() && (
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-gray-500" />
              <a
                href={event.ticketsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Билети
              </a>
            </div>
          )}

          {/* Price */}
          {event.price?.trim() && (
            <Typography.P>
              <strong>Цена:</strong> {event.price}лв
            </Typography.P>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
