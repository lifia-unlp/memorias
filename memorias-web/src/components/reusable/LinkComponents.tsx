"use client";

import React from "react";
import Link from "next/link";
import { Button, ButtonProps, IconButton, IconButtonProps, ListItemButton, ListItemButtonProps } from "@mui/material";

interface LinkButtonProps extends ButtonProps {
  href: string;
}

export function LinkButton({ href, children, ...props }: LinkButtonProps) {
  return (
    <Link href={href} passHref style={{ textDecoration: "none" }}>
      <Button component="span" {...props}>
        {children}
      </Button>
    </Link>
  );
}

interface LinkIconButtonProps extends IconButtonProps {
  href: string;
}

export function LinkIconButton({ href, children, ...props }: LinkIconButtonProps) {
  return (
    <Link href={href} passHref style={{ textDecoration: "none" }}>
      <IconButton component="span" {...props}>
        {children}
      </IconButton>
    </Link>
  );
}

interface LinkListItemButtonProps extends ListItemButtonProps {
  href: string;
}

export function LinkListItemButton({ href, children, ...props }: LinkListItemButtonProps) {
  return (
    <Link href={href} passHref style={{ textDecoration: "none", color: "inherit", width: "100%" }}>
      <ListItemButton component="span" {...props}>
        {children}
      </ListItemButton>
    </Link>
  );
}
