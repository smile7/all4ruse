import { Typography } from "@/components/Typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

import { useTranslations } from "next-intl";

export default function Page() {
  const t = useTranslations("Profile");

  return (
    <div className="flex w-full items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {t("thankYouForSigningUp")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Typography.P className="text-sm text-muted-foreground">
                {t("pleaseCheckEmail")}
              </Typography.P>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
