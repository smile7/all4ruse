import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with theme toggle */}
        <div className="flex justify-end mb-8">
          <ThemeToggle />
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <Image
                className="mx-auto mb-4"
                src="/all4ruse.svg"
                alt="All4Ruse logo"
                width={180}
                height={38}
              />
              <CardTitle className="text-4xl font-bold">
                Welcome to All4Ruse
              </CardTitle>
              <CardDescription className="text-lg">
                See all events in the city and connect with your community!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/events">View Events</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/about">About Us</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Theme</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
