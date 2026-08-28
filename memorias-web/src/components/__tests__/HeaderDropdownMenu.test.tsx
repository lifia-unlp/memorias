import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { UserDropdown } from "../HeaderDropdownMenu";
import { HeaderClient } from "../HeaderClient";

vi.mock("@/app/auth/actions", () => ({
  handleSignOut: vi.fn().mockResolvedValue(undefined),
}));

import { handleSignOut } from "@/app/auth/actions";

describe("UserDropdown component", () => {
  const mockSession = {
    user: {
      name: "Jane Doe",
      email: "jane@lifia.edu.ar",
      role: "EDITOR",
      active: true,
      avatarUrl: "https://example.com/avatar.png",
    },
  };

  it("renders user avatar and name", () => {
    render(<UserDropdown session={mockSession} handleSignOut={vi.fn()} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("opens menu and invokes handleSignOut when Sign Out is clicked", async () => {
    const onSignOutMock = vi.fn();
    render(<UserDropdown session={mockSession} handleSignOut={onSignOutMock} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(screen.getByText("Preferences")).toBeInTheDocument();
    const signOutOption = screen.getByText("Sign Out");
    expect(signOutOption).toBeInTheDocument();

    fireEvent.click(signOutOption);
    await waitFor(() => {
      expect(onSignOutMock).toHaveBeenCalledTimes(1);
    });
  });
});

describe("HeaderClient component", () => {
  const mockSession = {
    user: {
      name: "Jane Doe",
      email: "jane@lifia.edu.ar",
      role: "EDITOR",
      active: true,
    },
  };

  it("renders UserDropdown for authenticated user and invokes handleSignOut server action on sign out", async () => {
    render(<HeaderClient session={mockSession} logoUrl={null} />);

    const button = screen.getByText("Jane Doe");
    fireEvent.click(button);

    const signOutOption = screen.getByText("Sign Out");
    fireEvent.click(signOutOption);

    await waitFor(() => {
      expect(handleSignOut).toHaveBeenCalledWith("/");
    });
  });

  it("renders Sign In button when unauthenticated", () => {
    render(<HeaderClient session={null} logoUrl={null} />);
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });
});
