import { useState, useEffect, useMemo } from "react";
import { createMember, updateMember } from "./actions";
import { slugify } from "@/lib/slugs";

interface UseMemberFormProps {
  initialData?: any;
  router: any;
}

export function useMemberForm({ initialData, router }: UseMemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [startDateType, setStartDateType] = useState(initialData?.startDate ? "date" : "text");
  const [endDateType, setEndDateType] = useState(initialData?.endDate ? "date" : "text");

  // Form States
  const [firstName, setFirstName] = useState(initialData?.firstName || "");
  const [lastName, setLastName] = useState(initialData?.lastName || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isSlugOverridden, setIsSlugOverridden] = useState(
    initialData ? true : false
  );

  // ACM CCS Interests States
  const [isAcmSelectorOpen, setIsAcmSelectorOpen] = useState(false);
  
  const initialAcmIds = useMemo<string[]>(() => {
    const value = initialData?.interestsInEnglish;
    if (!value) return [];
    const trimmed = value.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === "string");
        }
      } catch (e) {
        // Fallback
      }
    }
    return [];
  }, [initialData]);
  
  const [acmInterests, setAcmInterests] = useState<string[]>(initialAcmIds);

  const isLegacyText = useMemo(() => {
    const val = initialData?.interestsInEnglish;
    if (!val) return false;
    const trimmed = val.trim();
    return !trimmed.startsWith("[") || !trimmed.endsWith("]");
  }, [initialData]);

  // Solution D: Compute plain text full paths to store in interestsInSpanish as a search index
  const plainTextPaths = useMemo(() => {
    // Import dynamically or get path calculations
    // In our component, we calculate paths using getAcmCcsPath from "@/lib/acm-ccs-utils"
    return acmInterests;
  }, [acmInterests]);

  // Auto-generate slug when name changes, unless overridden
  useEffect(() => {
    if (!isSlugOverridden) {
      const generated = slugify(`${firstName} ${lastName}`);
      setSlug(generated);
    }
  }, [firstName, lastName, isSlugOverridden]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    try {
      if (initialData) {
        await updateMember(initialData.id, formData);
        router.push(`/members/${formData.get("slug")}`);
      } else {
        await createMember(formData);
        router.push("/members");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save member profile.");
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
    firstName,
    setFirstName,
    lastName,
    setLastName,
    slug,
    setSlug,
    isSlugOverridden,
    setIsSlugOverridden,
    isAcmSelectorOpen,
    setIsAcmSelectorOpen,
    acmInterests,
    setAcmInterests,
    isLegacyText,
    plainTextPaths,
    handleSubmit,
  };
}
