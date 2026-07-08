import { useState, useEffect } from "react";
import { createThesis, updateThesis } from "./actions";
import { slugify } from "@/lib/slugs";

interface UseThesisFormProps {
  initialData?: any;
  router: any;
}

export function useThesisForm({ initialData, router }: UseThesisFormProps) {
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
  const [level, setLevel] = useState(initialData?.level || "");
  const [progress, setProgress] = useState(
    initialData?.progress !== undefined ? String(initialData.progress) : ""
  );

  // Multi-selection states
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    initialData?.members?.map((m: any) => m.id) || []
  );
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    initialData?.projects?.map((p: any) => p.id) || []
  );
  const [selectedPublicationIds, setSelectedPublicationIds] = useState<string[]>(
    initialData?.publications?.map((p: any) => p.id) || []
  );
  const [selectedScholarshipIds, setSelectedScholarshipIds] = useState<string[]>(
    initialData?.scholarships?.map((s: any) => s.id) || []
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

    formData.delete("publications");
    selectedPublicationIds.forEach((id) => formData.append("publications", id));

    formData.delete("scholarships");
    selectedScholarshipIds.forEach((id) => formData.append("scholarships", id));
    formData.set("featured", String(featured));

    try {
      let res;
      if (initialData) {
        res = await updateThesis(initialData.id, formData);
      } else {
        res = await createThesis(formData);
      }

      if (res && res.success === false) {
        if (res.duplicate) {
          const choice = confirm(
            `${res.error}\n\nDo you want to save this thesis entry anyway?`
          );
          if (choice) {
            formData.append("ignoreDuplicateCheck", "true");
            let bypassRes;
            if (initialData) {
              bypassRes = await updateThesis(initialData.id, formData);
            } else {
              bypassRes = await createThesis(formData);
            }
            if (bypassRes && bypassRes.success === false) {
              setErrorMsg(bypassRes.error || "Failed to save thesis.");
            } else {
              router.push(initialData ? `/theses/${formData.get("slug")}` : "/theses");
            }
          }
        } else {
          setErrorMsg(res.error || "Failed to save thesis.");
        }
      } else {
        router.push(initialData ? `/theses/${formData.get("slug")}` : "/theses");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save thesis record.");
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
    level,
    setLevel,
    progress,
    setProgress,
    selectedMemberIds,
    setSelectedMemberIds,
    selectedProjectIds,
    setSelectedProjectIds,
    selectedPublicationIds,
    setSelectedPublicationIds,
    selectedScholarshipIds,
    setSelectedScholarshipIds,
    handleSubmit,
  };
}
