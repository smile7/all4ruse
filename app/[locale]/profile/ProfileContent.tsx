"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Key, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { UpdatePasswordForm } from "@/components/Auth";
import { DrawerDialog } from "@/components/DialogDrawer";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ErrorAlert,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Label,
  Separator,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import {
  ProfileFormValues,
  useDeleteAccount,
  useProfile,
  useUpdateProfile,
} from "@/hooks/query";
import { Typography } from "@/components/Typography";

export default function ProfileContent() {
  const t = useTranslations("Profile");
  const { data, isLoading, error } = useProfile();

  // TODO: fix skeleton styles
  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center">
        <div className="w-full max-w-sm space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (Boolean(error) || !data) {
    return (
      <div className="flex min-h-svh w-full items-center">
        <div className="w-full max-w-sm">
          <p className="text-sm text-muted-foreground">
            {t("profileNotFound")}
          </p>
        </div>
      </div>
    );
  }

  const defaultValues: ProfileFormValues = {
    full_name: data.full_name || "",
    email: data.email || "",
    username: data.username || "",
    website: data.website || "",
  };

  return <ProfileForm defaultValues={defaultValues} />;
}

function ProfileForm({ defaultValues }: { defaultValues: ProfileFormValues }) {
  const t = useTranslations("Profile");

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<ProfileFormValues>({
    defaultValues,
  });

  const { mutate, isPending, error } = useUpdateProfile();
  const { mutate: deleteAccount, isPending: isDeletingAccount } =
    useDeleteAccount();

  const onSubmit = (values: ProfileFormValues) => {
    mutate(values);
  };

  return (
    <Tabs defaultValue="personal" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="personal">{t("personal")}</TabsTrigger>
        <TabsTrigger value="account">{t("account")}</TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("personalInformation")}</CardTitle>
            <CardDescription>{t("personalInformationDescr")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("fullName")}</FormLabel>
                        <FormControl>
                          <Input id="full_name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("email")}</FormLabel>
                        <FormControl>
                          <Input id="email" type="email" disabled {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("username")}</FormLabel>
                        <FormControl>
                          <Input id="username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("website")}</FormLabel>
                        <FormControl>
                          <Input
                            id="website"
                            placeholder="https://all4ruse.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {Boolean(error) && (
                  <ErrorAlert error="">{t("errorMessage")}</ErrorAlert>
                )}

                <Button
                  type="submit"
                  variant="default"
                  disabled={isPending}
                  isLoading={isPending}
                  className="w-full md:w-fit md:self-end"
                >
                  {t("edit")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="account" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("accountSettings")}</CardTitle>
            <Separator className="mt-3" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t("status")}</Label>
                <p className="text-muted-foreground text-sm">
                  {t("statusDescr")}
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-green-200 bg-green-50 text-green-700"
              >
                {t("active")}
              </Badge>
            </div>
            <Separator />
            <Collapsible>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">{t("password")}</Label>
                  <p className="text-muted-foreground text-sm">
                    {t("passwordDescr")}
                  </p>
                </div>

                <CollapsibleTrigger asChild>
                  <Button variant="outline" type="button">
                    <Key className="mr-2 size-4" />
                    {t("changePassword")}
                  </Button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="pt-4">
                <UpdatePasswordForm />
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base">{t("deleteAccount")}</Label>
                <p className="text-muted-foreground text-sm">
                  {t("deleteAccountDescr")}
                </p>
              </div>
              <DrawerDialog
                title={t("deleteAccount")}
                open={isDeleteDialogOpen}
                setOpen={setIsDeleteDialogOpen}
                showDrawerCancel
                trigger={
                  <Button
                    variant="destructive"
                    type="button"
                    disabled={isDeletingAccount}
                    isLoading={isDeletingAccount}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("deleteAccount")}
                  </Button>
                }
              >
                <Typography.P className="mb-4 px-4 md:px-0">
                  {t("deleteAccountIrreversibleWarning")}
                </Typography.P>
                <div className="mt-4 flex flex-col w-full md:flex-row justify-end gap-4 px-4 md:mb-6 md:px-0">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                    }}
                    className="hidden md:inline-flex"
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isDeletingAccount}
                    isLoading={isDeletingAccount}
                    onClick={() => deleteAccount()}
                  >
                    {t("confirmDeleteAccount")}
                  </Button>
                </div>
              </DrawerDialog>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
