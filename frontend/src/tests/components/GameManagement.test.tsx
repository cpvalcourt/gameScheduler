import { screen, waitFor, act, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import { I18nProvider } from "../../contexts/I18nContext";
import GameManagement from "../../components/GameManagement";
import { mockGet, mockPost, mockPut, mockDelete } from "../__mocks__/api";

const renderWithProviders = (component: any) => {
  return render(
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>{component}</AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  );
};

const mockSeries = {
  id: 1,
  name: "Test Series",
  description: "Test Description",
  type: "tournament" as const,
  start_date: "2023-01-01",
  end_date: "2023-12-31",
  created_by: 1,
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
};

const mockOnSuccess = vi.fn();

describe("GameManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render game management form", () => {
    renderWithProviders(
      <GameManagement series={mockSeries} onSuccess={mockOnSuccess} />
    );

    expect(screen.getByText("Add Games")).toBeInTheDocument();
  });

  it("should open dialog when Add Games button is clicked", async () => {
    renderWithProviders(
      <GameManagement series={mockSeries} onSuccess={mockOnSuccess} />
    );

    const user = userEvent.setup();

    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Add Games" }));
    });

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByLabelText("Date")).toBeInTheDocument();
      expect(screen.getByLabelText("Time")).toBeInTheDocument();
      expect(screen.getByLabelText("Location")).toBeInTheDocument();
      expect(screen.getByLabelText("Opponent")).toBeInTheDocument();
    });
  });

  it("should create games successfully", async () => {
    mockGet.mockResolvedValue({ data: [] });
    mockPost.mockResolvedValue({
      data: { message: "Games created successfully" },
    });

    renderWithProviders(
      <GameManagement series={mockSeries} onSuccess={mockOnSuccess} />
    );

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Add Games")).toBeInTheDocument();
    });

    // Open dialog
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Add Games" }));
    });

    // Fill out the form (clear time input first)
    await act(async () => {
      await user.clear(screen.getByLabelText("Time"));
      await user.type(screen.getByLabelText("Date"), "2023-12-25");
      await user.type(screen.getByLabelText("Time"), "14:00");
      await user.type(screen.getByLabelText("Location"), "Test Arena");
      await user.type(screen.getByLabelText("Opponent"), "Test Team");
    });

    // Submit form
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Create Games" }));
    });

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        `/game-series/${mockSeries.id}/games`,
        {
          seriesId: mockSeries.id,
          date: "2023-12-25",
          time: "14:00",
          location: "Test Arena",
          opponent: "Test Team",
          isHome: true,
          days: [],
        }
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("should handle form validation errors", async () => {
    renderWithProviders(
      <GameManagement series={mockSeries} onSuccess={mockOnSuccess} />
    );

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Add Games")).toBeInTheDocument();
    });

    // Open dialog
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Add Games" }));
    });

    // Try to submit without filling required fields
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Create Games" }));
    });

    await waitFor(() => {
      expect(screen.getByText("All fields are required.")).toBeInTheDocument();
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  it("should handle API errors when creating games", async () => {
    mockPost.mockRejectedValue(new Error("Failed to create games"));

    renderWithProviders(
      <GameManagement series={mockSeries} onSuccess={mockOnSuccess} />
    );

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Add Games")).toBeInTheDocument();
    });

    // Open dialog
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Add Games" }));
    });

    // Fill out the form
    await act(async () => {
      await user.clear(screen.getByLabelText("Time"));
      await user.type(screen.getByLabelText("Date"), "2023-12-25");
      await user.type(screen.getByLabelText("Time"), "14:00");
      await user.type(screen.getByLabelText("Location"), "Test Arena");
      await user.type(screen.getByLabelText("Opponent"), "Test Team");
    });

    // Submit form
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Create Games" }));
    });

    await waitFor(() => {
      expect(screen.getByText("Failed to create games")).toBeInTheDocument();
    });
  });

  it("should close dialog when Cancel button is clicked", async () => {
    renderWithProviders(
      <GameManagement series={mockSeries} onSuccess={mockOnSuccess} />
    );

    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getByText("Add Games")).toBeInTheDocument();
    });

    // Open dialog
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Add Games" }));
    });

    // Close dialog
    await act(async () => {
      await user.click(screen.getByRole("button", { name: "Cancel" }));
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
