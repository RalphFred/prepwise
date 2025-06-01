import { SignUpForm } from "@/components/shared/SignUpForm";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <Suspense>
    <SignUpForm />
  </Suspense>
  );
}