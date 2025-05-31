"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner"

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { ChevronLeft } from "lucide-react";
import Image from "next/image";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string(),
});

export function SignInForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid credentials", {
            description: "The email or password you entered is incorrect.",
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Email not verified", {
            description: "Please verify your email address before signing in.",
          });
        } else {
          toast.error("Sign in failed", {
            description: error.message,
          });
        }
        return;
      }

      // Get the redirect URL from the search params or default to dashboard
      const redirectTo = searchParams.get("redirectedFrom") || "/dashboard";
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row items-center h-screen">
      <div className="text-center lg:w-1/2 bg-green-600 h-full"></div>
      <div className="w-full lg:w-1/2 lg:p-24">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5 w-full"
          >
            <Link
              href="/"
              className="flex gap-1 text-neutral-600 hover:border-neutral-900 transition-all duration-300"
            >
              <ChevronLeft className="size-4 relative top-px" />
              <p className="text-sm align-middle">Back to home</p>
            </Link>

            <h2 className="text-2xl font-semibold">Welcome Back 👋</h2>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@email.com"
                      autoComplete="email"
                      type="email"
                      className="rounded-full"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Password"
                      autoComplete="current-password"
                      type="password"
                      className="rounded-full"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-neutral-600 hover:text-neutral-900 transition-all duration-300">Forgot Password?</Link>
            </div>

            <Button 
              type="submit" 
              className="rounded-full bg-green-600 hover:bg-green-700 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-[1px] bg-neutral-200"></div>
              <div className="text-neutral-500">or</div>
              <div className="flex-1 h-[1px] bg-neutral-200"></div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="rounded-full border-neutral-200 cursor-pointer flex items-center gap-2"
              disabled={isLoading}
            >
             <Image src="/images/google.svg" alt="Google" width={20} height={20} /> Sign In with Google
            </Button>
            <div className="text-sm text-neutral-600">Don't have an account? <Link href="/sign-up" className="text-green-600 hover:text-green-700 transition-all duration-300 font-semibold">Sign Up</Link></div>
          </form>
        </Form>
      </div>
    </div>
  );
}
