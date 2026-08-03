import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DebouncedTextField } from "../DebouncedTextField";

describe("DebouncedTextField", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates local input state immediately without calling onCommit on keystroke", () => {
    const onCommit = vi.fn();
    render(
      <DebouncedTextField
        label="Start Year"
        value=""
        onCommit={onCommit}
        debounceMs={400}
      />
    );

    const input = screen.getByLabelText("Start Year") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2" } });
    expect(input.value).toBe("2");
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "20" } });
    expect(input.value).toBe("20");
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "202" } });
    expect(input.value).toBe("202");
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: "2024" } });
    expect(input.value).toBe("2024");
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("calls onCommit after the debounce delay completes", () => {
    const onCommit = vi.fn();
    render(
      <DebouncedTextField
        label="Start Year"
        value=""
        onCommit={onCommit}
        debounceMs={400}
      />
    );

    const input = screen.getByLabelText("Start Year");
    fireEvent.change(input, { target: { value: "2024" } });

    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(onCommit).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onCommit).toHaveBeenCalledWith("2024");
  });

  it("calls onCommit immediately when input loses focus (onBlur)", () => {
    const onCommit = vi.fn();
    render(
      <DebouncedTextField
        label="End Year"
        value="2020"
        onCommit={onCommit}
        debounceMs={400}
      />
    );

    const input = screen.getByLabelText("End Year");
    fireEvent.change(input, { target: { value: "2025" } });
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith("2025");
  });

  it("calls onCommit immediately when Enter is pressed on single-line inputs", () => {
    const onCommit = vi.fn();
    render(
      <DebouncedTextField
        label="Start Year"
        value=""
        onCommit={onCommit}
        debounceMs={400}
      />
    );

    const input = screen.getByLabelText("Start Year");
    fireEvent.change(input, { target: { value: "2026" } });
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(onCommit).toHaveBeenCalledWith("2026");
  });
});
