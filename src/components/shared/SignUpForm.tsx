"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr'

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";

import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner"

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const baseSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Confirm Password must be at least 8 characters.",
  }),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).optional(),
  username: z.string().min(2, { message: "Username must be at least 2 characters." }).optional(),
});

const step1Schema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Confirm Password must be at least 8 characters.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

const formSchema = baseSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export function SignUpForm() {
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(step === 1 ? step1Schema : formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      username: "",
    },
    mode: "onSubmit",
  });
  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    if (step === 1) {
      setStep(2);
      return;
    }
    
    // Validate all fields for step 2
    const result = formSchema.safeParse(values);
    if (!result.success) {
      return;
    }
    setLoading(true);
    // Sign up with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.name,
          username: values.username,
          role: 'student',
        }
      }
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      toast.error('Sign up failed', { description: signUpError.message });
      return;
    }

    // Check if we have a user
    if (!data.user) {
      setError('Failed to create user account');
      setLoading(false);
      toast.error('Sign up failed', { description: 'Failed to create user account' });
      return;
    }

    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col lg:flex-row items-center lg:h-screen">
      <div className="text-center w-full lg:w-1/2 bg-green-600 h-[200px] lg:h-screen"></div>
      <div className="w-full lg:w-1/2 lg:p-24 px-4 sm:px-6 mt-10 lg:mt-0 mb-10 lg:mb-0">
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
            <h2 className="text-2xl font-semibold">Create your account</h2>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {step === 1 && (
              <>               
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
                          autoComplete="new-password"
                          type="password"
                          className="rounded-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Confirm Password"
                          autoComplete="new-password"
                          type="password"
                          className="rounded-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="rounded-full bg-green-600 hover:bg-green-700 cursor-pointer">
                  Next
                </Button>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-[1px] bg-neutral-200"></div>
                  <div className="text-neutral-500">or</div>
                  <div className="flex-1 h-[1px] bg-neutral-200"></div>
                </div>
                <Button type="button" variant="outline" className="rounded-full border-neutral-200 cursor-pointer flex items-center gap-2">
                  <Image src="/images/google.svg" alt="Google" width={20} height={20} /> Sign Up with Google
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your name"
                          autoComplete="name"
                          className="rounded-full"
                          {...field}
                        />
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
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your username"
                          autoComplete="username"
                          className="rounded-full"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="rounded-full bg-green-600 hover:bg-green-700 flex-1" disabled={loading}>
                  {loading ? "Signing Up..." : "Sign Up"}
                </Button>
              </>
            )}
            <div className="text-sm text-neutral-600">Already have an account? <Link href="/sign-in" className="text-green-600 hover:text-green-700 transition-all duration-300 font-semibold">Sign In</Link></div>
          </form>
        </Form>
      </div>
    </div>
  );
}
