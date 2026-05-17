"use client";

import React, { useState } from "react";
import { deleteThesis } from "../actions";
import { useRouter } from "next/navigation";

export function DeleteThesisButton({
  thesisId,
  thesisTitle,
}: {
  thesisId: string;
  thesisTitle: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteThesis(thesisId);
      if (res.success) {
        setShowConfirm(false);
        router.push("/theses");
      } else {
        alert("An error occurred during deletion.");
      }
    } catch (err: any) {
      alert(err.message || "Unauthorized action.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="bg-red-50 hover:bg-red-100 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-950 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md hover:shadow-lg"
      >
        🗑️ Delete Thesis
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold">Delete Thesis?</h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Are you sure you want to delete <strong>{thesisTitle}</strong>? This action is permanent and cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-border text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
