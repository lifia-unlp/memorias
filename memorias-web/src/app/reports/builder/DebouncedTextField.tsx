"use client";

import React, { useState, useEffect, useRef } from "react";
import { TextField, TextFieldProps } from "@mui/material";

export interface DebouncedTextFieldProps extends Omit<TextFieldProps, "onChange"> {
  value: string | number;
  onCommit: (value: string) => void;
  debounceMs?: number;
}

export function DebouncedTextField({
  value: propValue,
  onCommit,
  debounceMs = 400,
  onBlur,
  onKeyDown,
  ...rest
}: DebouncedTextFieldProps) {
  const [localValue, setLocalValue] = useState<string | number>(propValue ?? "");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalValue(propValue ?? "");
  }, [propValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setLocalValue(newVal);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      onCommit(newVal);
    }, debounceMs);
  };

  const handleBlur = (e: React.FocusEvent<any>) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    onCommit(String(localValue));
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<any>) => {
    if (e.key === "Enter" && !rest.multiline) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      onCommit(String(localValue));
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <TextField
      {...rest}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}
