"use client";

import React, { useState } from "react";
import { deleteProject } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RefObj {
  title: string;
  slug: string;
}

interface References {
  theses: RefObj[];
  scholarships: RefObj[];
  publications: RefObj[];
}

export function DeleteProjectButton({
  projectId,
  projectTitle,
}: {
  projectId: string;
  projectTitle: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [refBlock, setRefBlock] = useState<References | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteProject(projectId);
      if (res.success) {
        setShowConfirm(false);
        router.push("/projects");
      } else if (res.error === "REFERENTIAL_BLOCK" && res.references) {
        setRefBlock(res.references);
        setShowConfirm(false);
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
        🗑️ Delete Project
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-lg font-bold">Delete Project?</h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Are you sure you want to delete <strong>{projectTitle}</strong>? This action is permanent and cannot be undone.
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

      {/* Referral Block Modal */}
      {refBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-950 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center gap-3 text-red-600 border-b border-red-100 pb-3">
              <span className="text-3xl">🚫</span>
              <div>
                <h3 className="text-lg font-extrabold leading-none">Cannot Delete Project</h3>
                <span className="text-xs text-red-500 font-semibold block mt-1">
                  Active database references detected
                </span>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Before deleting <strong>{projectTitle}</strong>, you must manually remove or update its association in the following objects. Click the links below to navigate directly to each object and resolve:
            </p>

            <div className="space-y-4 pt-2">
              {/* Theses */}
              {refBlock.theses.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                    🎓 Referenced Theses ({refBlock.theses.length})
                  </span>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-border space-y-1 text-xs">
                    {refBlock.theses.map((t, i) => (
                      <Link
                        key={i}
                        href={`/theses/${t.slug}`}
                        className="text-primary hover:underline font-semibold block truncate"
                      >
                        🔗 {t.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Scholarships */}
              {refBlock.scholarships.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                    🎫 Referenced Scholarships ({refBlock.scholarships.length})
                  </span>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-border space-y-1 text-xs">
                    {refBlock.scholarships.map((s, i) => (
                      <Link
                        key={i}
                        href={`/scholarships/${s.slug}`}
                        className="text-primary hover:underline font-semibold block truncate"
                      >
                        🔗 {s.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Publications */}
              {refBlock.publications.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                    📚 Referenced Publications ({refBlock.publications.length})
                  </span>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-border space-y-1 text-xs">
                    {refBlock.publications.map((pb, i) => (
                      <Link
                        key={i}
                        href={`/publications/${pb.slug}`}
                        className="text-primary hover:underline font-semibold block truncate"
                      >
                        🔗 {pb.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button
                onClick={() => setRefBlock(null)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                Dismiss Warning
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
