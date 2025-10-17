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

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
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
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating an account..." : "Sign up"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
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
