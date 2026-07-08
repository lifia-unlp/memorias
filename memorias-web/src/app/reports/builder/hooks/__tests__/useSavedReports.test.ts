import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock("../../../actions", () => ({
  getReports: vi.fn(),
  saveReport: vi.fn(),
  deleteReport: vi.fn(),
}));

import { useSavedReports } from "../useSavedReports";
import { getReports, saveReport, deleteReport } from "../../../actions";

const mockedGetReports = vi.mocked(getReports);
const mockedSaveReport = vi.mocked(saveReport);
const mockedDeleteReport = vi.mocked(deleteReport);

describe("useSavedReports hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetReports.mockResolvedValue([]);
    mockedSaveReport.mockResolvedValue({});
    mockedDeleteReport.mockResolvedValue({});
    global.alert = vi.fn();
    global.confirm = vi.fn(() => true);
  });

  it("fetches saved reports on init list viewState", async () => {
    mockedGetReports.mockResolvedValue([{ id: "r1", title: "R1" }]);
    
    let renderResult: any;
    await act(async () => {
      renderResult = renderHook(() => useSavedReports());
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(renderResult.result.current.savedReports).toEqual([{ id: "r1", title: "R1" }]);
    expect(mockedGetReports).toHaveBeenCalled();
  });

  it("sets up blocks and shifts viewState on edit", async () => {
    let result: any;
    await act(async () => {
      const renderResult = renderHook(() => useSavedReports());
      result = renderResult.result;
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    const setBlocksMock = vi.fn();
    const compileMock = vi.fn();

    const report = {
      id: "r-edit",
      title: "Editing Title",
      blocks: [{ id: "b1", type: "markdown", content: "M" }],
    };

    await act(async () => {
      await result.current.handleEditReport(report, setBlocksMock, compileMock);
    });

    expect(result.current.reportId).toBe("r-edit");
    expect(result.current.reportTitle).toBe("Editing Title");
    expect(result.current.viewState).toBe("editor");
    expect(setBlocksMock).toHaveBeenCalledOnce();
    expect(compileMock).toHaveBeenCalledOnce();
  });

  it("clears state and sets welcome blocks on create new", async () => {
    let result: any;
    await act(async () => {
      const renderResult = renderHook(() => useSavedReports());
      result = renderResult.result;
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    const setBlocksMock = vi.fn();
    const compileMock = vi.fn();

    act(() => {
      result.current.handleCreateNewReport(setBlocksMock, compileMock);
    });

    expect(result.current.reportId).toBeNull();
    expect(result.current.reportTitle).toBe("New Research Report");
    expect(result.current.viewState).toBe("editor");
    expect(setBlocksMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: "markdown", id: "welcome-md" }),
      ])
    );
  });

  it("saves report and handles naming collisions", async () => {
    let result: any;
    await act(async () => {
      const renderResult = renderHook(() => useSavedReports());
      result = renderResult.result;
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    const setCompilingMock = vi.fn();

    // Mock duplicate result, then overwrite success
    mockedSaveReport
      .mockResolvedValueOnce({ duplicate: true, message: "Duplicate title", existingId: "existing-id" })
      .mockResolvedValueOnce({ report: { id: "existing-id" } });

    await act(async () => {
      await result.current.handleSaveReport([], setCompilingMock);
    });

    expect(mockedSaveReport).toHaveBeenCalledTimes(2);
    expect(result.current.viewState).toBe("list");
  });

  it("triggers deletion and refreshes list", async () => {
    mockedDeleteReport.mockResolvedValueOnce({ success: true } as any);
    mockedGetReports.mockResolvedValueOnce([]);

    let result: any;
    await act(async () => {
      const renderResult = renderHook(() => useSavedReports());
      result = renderResult.result;
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.handleDeleteReport("r-delete");
    });

    expect(mockedDeleteReport).toHaveBeenCalledWith("r-delete");
    expect(mockedGetReports).toHaveBeenCalled();
  });
});
