"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deletePublication } from "../actions";

export function DeletePublicationButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleDelete = () => {
    setError("");
    startTransition(async () => {
      const res = await deletePublication(id);
      if (res.success) {
        setIsOpen(false);
        router.push("/publications");
      } else {
        setError(res.error || "Failed to delete publication");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-50 hover:bg-red-100 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-950 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md hover:shadow-lg"
      >
        🗑️ Delete Publication
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-border p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <span className="text-4xl block">⚠️</span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Confirm Deletion
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently delete the publication{" "}
                <strong className="text-slate-800 dark:text-slate-200">
                  &ldquo;{title}&rdquo;
                </strong>
                ? This action cannot be undone.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
                ⚠️ {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                {isPending ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all border border-border cursor-pointer text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
