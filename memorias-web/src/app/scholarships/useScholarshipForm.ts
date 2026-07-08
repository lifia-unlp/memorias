import { useState, useEffect } from "react";
import { createScholarship, updateScholarship } from "./actions";
import { slugify } from "@/lib/slugs";

interface UseScholarshipFormProps {
  initialData?: any;
  router: any;
}

export function useScholarshipForm({ initialData, router }: UseScholarshipFormProps) {
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
  const [type, setType] = useState(initialData?.type || "");

  // Multi-selection states
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    initialData?.members?.map((m: any) => m.id) || []
  );
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    initialData?.projects?.map((p: any) => p.id) || []
  );
  const [selectedThesisIds, setSelectedThesisIds] = useState<string[]>(
    initialData?.theses?.map((t: any) => t.id) || []
  );

  // Auto-generate slug from title
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
    
    // Explicitly override connected relations arrays
    formData.delete("members");
    selectedMemberIds.forEach((id) => formData.append("members", id));

    formData.delete("projects");
    selectedProjectIds.forEach((id) => formData.append("projects", id));

    formData.delete("theses");
    selectedThesisIds.forEach((id) => formData.append("theses", id));

    try {
      let res;
      if (initialData) {
        res = await updateScholarship(initialData.id, formData);
      } else {
        res = await createScholarship(formData);
      }

      if (res && res.success === false) {
        if (res.duplicate) {
          const choice = confirm(
            `${res.error}\n\nDo you want to save this scholarship entry anyway?`
          );
          if (choice) {
            formData.append("ignoreDuplicateCheck", "true");
            let bypassRes;
            if (initialData) {
              bypassRes = await updateScholarship(initialData.id, formData);
            } else {
              bypassRes = await createScholarship(formData);
            }
            if (bypassRes && bypassRes.success === false) {
              setErrorMsg(bypassRes.error || "Failed to save scholarship.");
            } else {
              router.push(initialData ? `/scholarships/${formData.get("slug")}` : "/scholarships");
            }
          }
        } else {
          setErrorMsg(res.error || "Failed to save scholarship.");
        }
      } else {
        router.push(initialData ? `/scholarships/${formData.get("slug")}` : "/scholarships");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save scholarship record.");
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
    type,
    setType,
    selectedMemberIds,
    setSelectedMemberIds,
    selectedProjectIds,
    setSelectedProjectIds,
    selectedThesisIds,
    setSelectedThesisIds,
    handleSubmit,
  };
}
