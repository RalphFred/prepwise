import { Suspense } from "react";
import { SignInForm } from "@/components/shared/SignInForm";

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}