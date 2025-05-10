import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster, toast } from "sonner";
import { useState } from "react";
import { Dashboard } from "./Dashboard";
import { OnboardingFlow } from "./OnboardingFlow";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold accent-text">Crypto Platform</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const progress = useQuery(api.onboarding.getCurrentStep);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Authenticated>
        {progress?.status === "completed" ? (
          <Dashboard />
        ) : (
          <OnboardingFlow progress={progress} />
        )}
      </Authenticated>
      <Unauthenticated>
        <div className="text-center">
          <h1 className="text-5xl font-bold accent-text mb-4">Crypto Platform</h1>
          <p className="text-xl text-slate-600 mb-8">Sign in to get started</p>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
