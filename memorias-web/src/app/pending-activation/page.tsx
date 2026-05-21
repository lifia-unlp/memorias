import React from "react";
import { auth, signOut } from "@/auth";
import ClientRedirect from "./Redirect";

export default async function PendingActivationPage() {
  const session = await auth();

  // If not logged in, redirect to sign in safely using ClientRedirect to persist cookie invalidation
  if (!session || !session.user) {
    return <ClientRedirect to="/auth/signin" />;
  }

  // If already active, redirect to home dashboard safely using ClientRedirect to persist active cookie
  if (session.user.active) {
    return <ClientRedirect to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="material-card w-full max-w-md text-center py-12 px-8 space-y-6">
        {/* Animated Clock / Pending Icon */}
        <div className="mx-auto w-20 h-20 bg-secondary/10 text-secondary border border-secondary/20 flex items-center justify-center rounded-full text-4xl animate-pulse">
          ⏳
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-primary dark:text-white">Account Pending</h1>
          <p className="text-sm font-semibold text-muted">
            Waiting for Administrator Review
          </p>
        </div>

        {/* User Card */}
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-border text-left space-y-2">
          <div className="flex items-center gap-3">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-border"
              />
            ) : (
              <span className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-lg">
                👤
              </span>
            )}
            <div className="min-w-0">
              <span className="font-bold text-sm block truncate text-foreground">
                {session.user.name || "Authenticated User"}
              </span>
              <span className="text-xs text-muted block truncate">
                {session.user.email}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          Your account was successfully created! However, before you can view lab analytics or edit resources, an administrator needs to activate your membership. You will receive access automatically once approved.
        </p>

        {/* Sign Out Action */}
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/auth/signin" });
          }}
          className="pt-4"
        >
          <button
            type="submit"
            className="w-full btn-secondary cursor-pointer py-3 rounded-lg text-sm font-bold text-white transition-all shadow-md"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
