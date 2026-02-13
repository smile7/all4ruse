"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("Profile");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (!acceptTerms) {
      setError(t("acceptTermsRequired"));
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError(t("passwordsDoNotMatch"));
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            website: website,
            email: email,
          },
        },
      });

      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t("errorOccurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("signupTitle")}</CardTitle>
          <CardDescription>{t("signupButton")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label isRequired htmlFor="full-name">
                  {t("fullName")}
                </Label>
                <Input
                  id="full-name"
                  type="text"
                  placeholder="Иван Петров"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label isRequired htmlFor="email">
                  {t("email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="person@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label isRequired htmlFor="password">
                    {t("password")}
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label isRequired htmlFor="repeat-password">
                    {t("repeatPassword")}
                  </Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">{t("website")}</Label>
                <Input
                  id="website"
                  type="text"
                  placeholder="https://all4ruse.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="flex items-center mt-2 gap-2">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="size-4 accent-primary rounded focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-150"
                />
                <Label
                  htmlFor="acceptTerms"
                  className="text-base cursor-pointer select-none"
                >
                  {t("acceptTermsPrefix")}
                  <Link
                    href="/legal"
                    className="underline underline-offset-4"
                    target="_blank"
                  >
                    {t("acceptTermsLink")}
                  </Link>
                </Label>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                isLoading={isLoading}
              >
                {t("signupButton")}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t("haveAccount")}{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                {t("loginButton")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// TODO: code to handle already used email for signup
// 'use client'
// import { useState } from 'react'
// import { createClient } from '@/lib/supabase/client'

// export default function SignupPage() {
//   const supabase = createClient()
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [info, setInfo] = useState<string | null>(null)
//   const [loading, setLoading] = useState(false)

//   async function handleSignup(e: React.FormEvent) {
//     e.preventDefault()
//     setInfo(null)
//     setLoading(true)
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: { emailRedirectTo: 'http://localhost:3000/auth/callback' }
//     })
//     setLoading(false)

//     if (error) {
//       if (error.message.toLowerCase().includes('registered')) {
//         setInfo('Имейлът вече е регистриран. Ако не сте получили писмо, изпратете ново потвърждение.')
//       } else {
//         setInfo('Грешка: ' + error.message)
//       }
//       return
//     }

//     if (data.user && !data.session) {
//       // Needs email confirmation
//       setInfo('Изпратен е имейл за потвърждение. Проверете Inbox/Spam.')
//     } else {
//       setInfo('Успешна регистрация.')
//     }
//   }

//   async function handleResend() {
//     setLoading(true)
//     const { error } = await supabase.auth.resend({ type: 'signup', email })
//     setLoading(false)
//     if (error) {
//       setInfo('Грешка при повторно изпращане: ' + error.message)
//     } else {
//       setInfo('Имейлът за потвърждение е изпратен отново.')
//     }
//   }

//   return (
//     <form onSubmit={handleSignup} className="space-y-4">
//       <div>
//         <label>Email</label>
//         <input value={email} onChange={e => setEmail(e.target.value)} required type="email" />
//       </div>
//       <div>
//         <label>Парола</label>
//         <input value={password} onChange={e => setPassword(e.target.value)} required type="password" />
//       </div>
//       <button disabled={loading} type="submit">
//         {loading ? 'Моля изчакайте...' : 'Регистрация'}
//       </button>
//       {info && (
//         <div style={{ marginTop: 8 }}>
//           <p>{info}</p>
//           {info.includes('регистриран') && (
//             <button type="button" disabled={loading} onClick={handleResend}>
//               Изпрати потвърждение отново
//             </button>
//           )}
//         </div>
//       )}
//     </form>
//   )
// }
