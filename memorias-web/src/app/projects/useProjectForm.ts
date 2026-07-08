import { useState, useEffect } from "react";
import { createProject, updateProject } from "./actions";
import { slugify } from "@/lib/slugs";

interface UseProjectFormProps {
  initialData?: any;
  router: any;
}

export function useProjectForm({ initialData, router }: UseProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [startDateType, setStartDateType] = useState(initialData?.startDate ? "date" : "text");
  const [endDateType, setEndDateType] = useState(initialData?.endDate ? "date" : "text");

  // Core States
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugOverridden, setIsSlugOverridden] = useState(
    initialData ? true : false
  );
  const [featured, setFeatured] = useState<boolean>(initialData?.featured || false);

  // Members selection state
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    initialData?.members?.map((m: any) => m.id) || []
  );

  // Auto-generate slug when title changes, unless overridden
  useEffect(() => {
    if (!isSlugOverridden) {
      const generated = slugify(title);
      setSlug(generated);
    }
  }, [title, isSlugOverridden]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    // Explicitly set the checked members
    formData.delete("members");
    selectedMemberIds.forEach((id) => formData.append("members", id));
    formData.set("featured", String(featured));

    try {
      let res;
      if (initialData) {
        res = await updateProject(initialData.id, formData);
      } else {
        res = await createProject(formData);
      }

      if (res && res.success === false) {
        if (res.duplicate) {
          const choice = confirm(
            `${res.error}\n\nDo you want to save this project entry anyway?`
          );
          if (choice) {
            formData.append("ignoreDuplicateCheck", "true");
            let bypassRes;
            if (initialData) {
              bypassRes = await updateProject(initialData.id, formData);
            } else {
              bypassRes = await createProject(formData);
            }
            if (bypassRes && bypassRes.success === false) {
              setErrorMsg(bypassRes.error || "Failed to save project.");
            } else {
              router.push(initialData ? `/projects/${formData.get("slug")}` : "/projects");
            }
          }
        } else {
          setErrorMsg(res.error || "Failed to save project.");
        }
      } else {
        router.push(initialData ? `/projects/${formData.get("slug")}` : "/projects");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    errorMsg,
    setErrorMsg,
    startDateType,
    setStartDateType,
    endDateType,
    setEndDateType,
    title,
    setTitle,
    slug,
    setSlug,
    isSlugOverridden,
    setIsSlugOverridden,
    featured,
    setFeatured,
    selectedMemberIds,
    setSelectedMemberIds,
    handleSubmit,
  };
}
