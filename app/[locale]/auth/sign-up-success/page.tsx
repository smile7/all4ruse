import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Благодарим ви, че се регистрирахте!
              </CardTitle>
              <CardDescription>
                Проверете имейла си, за да потвърдите
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Успешно се регистрирахте. Моля, проверете имейла си, за да
                потвърдите акаунта си, преди да влезете.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
