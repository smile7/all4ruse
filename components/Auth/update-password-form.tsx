"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  Button,
  Card,
  CardContent,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type UpdatePasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("Profile");
  const supabase = createClient();

  const form = useForm<UpdatePasswordFormValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: UpdatePasswordFormValues) => {
    form.clearErrors();

    if (values.password.length < 6) {
      form.setError("password", {
        type: "manual",
        message: t("passwordLength"),
      });
      return;
    }

    if (values.password !== values.confirmPassword) {
      form.setError("confirmPassword", {
        type: "manual",
        message: t("passwordsDoNotMatch"),
      });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        throw error;
      }

      toast.success(t("passwordUpdatedSuccessfully"));
      form.reset();
    } catch (err: unknown) {
      toast.error(t("errorUpdatingPassword"));
      form.setError("root", {
        type: "server",
        message: err instanceof Error ? err.message : t("errorOccurred"),
      });
    }
  };

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = form;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
            >
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("newPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("repeatPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {errors.root?.message && (
                <p className="text-sm text-destructive">
                  {errors.root.message as string}
                </p>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                >
                  {t("edit")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
