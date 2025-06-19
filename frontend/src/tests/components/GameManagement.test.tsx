import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import GameManagement from "../../components/GameManagement";
import api from "../../services/api";

// Mock the API service
vi.mock("../../services/api");
const mockApi = api as any;

// Mock Material-UI components to avoid styling issues
vi.mock("@mui/material", () => ({
  Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  Dialog: ({ children, open, onClose, ...props }: any) =>
    open ? <div {...props}>{children}</div> : null,
  DialogTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  DialogContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  DialogActions: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  TextField: ({ name, label, value, onChange, type, ...props }: any) => (
    <input
      name={name}
      placeholder={label}
      value={value}
      onChange={onChange}
      type={type}
      {...props}
    />
  ),
  FormControlLabel: ({ control, label, ...props }: any) => (
    <label {...props}>
      {control}
      {label}
    </label>
  ),
  Checkbox: ({ name, checked, onChange, ...props }: any) => (
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      {...props}
    />
  ),
  Typography: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Alert: ({ children, severity, ...props }: any) => (
    <div role="alert" {...props}>
      {children}
    </div>
  ),
  CircularProgress: ({ size, ...props }: any) => (
    <div {...props}>Loading...</div>
  ),
}));

const mockSeries = {
  id: 1,
  name: "Test Series",
  description: "Test Description",
  type: "tournament" as const,
  start_date: "2024-01-01",
  end_date: "2024-12-31",
  created_by: 1,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

const mockOnSuccess = vi.fn();

describe("GameManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.post.mockResolvedValue({
      data: { message: "Games created successfully" },
    });
  });

  describe("Initial Render", () => {
    it("should render the Add Games button", () => {
      render(<GameManagement series={mockSeries} onSuccess={mockOnSuccess} />);

      expect(screen.getByText("Add Games")).toBeInTheDocument();
    });

    it("should not show dialog initially", () => {
      render(<GameManagement series={mockSeries} onSuccess={mockOnSuccess} />);
      // The Add Games button should be present
      expect(
        screen.getByRole("button", { name: /add games/i })
      ).toBeInTheDocument();
      // The dialog title should NOT be present
      expect(
        screen.queryByRole("heading", { name: /add games/i })
      ).not.toBeInTheDocument();
      // The Cancel button (in dialog) should NOT be present
      expect(
        screen.queryByRole("button", { name: /cancel/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Dialog Opening/Closing", () => {
    it("should open dialog when Add Games button is clicked", async () => {
      const user = userEvent.setup();
      render(<GameManagement series={mockSeries} onSuccess={mockOnSuccess} />);
      const addButton = screen.getByRole("button", { name: /add games/i });
      await user.click(addButton);
      // Dialog title should be present
      expect(
        screen.getByRole("heading", { name: /add games/i })
      ).toBeInTheDocument();
      // Cancel and Create Games buttons should be present
      expect(
        screen.getByRole("button", { name: /cancel/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create games/i })
      ).toBeInTheDocument();
    });

    it("should close dialog when Cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<GameManagement series={mockSeries} onSuccess={mockOnSuccess} />);
      // Open dialog
      const addButton = screen.getByRole("button", { name: /add games/i });
      await user.click(addButton);
      // Close dialog
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);
      // Dialog title should NOT be present
      expect(
        screen.queryByRole("heading", { name: /add games/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /cancel/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Form Interactions", () => {
    it("should handle text field changes", async () => {
      const user = userEvent.setup();
      render(<GameManagement series={mockSeries} onSuccess={mockOnSuccess} />);

      // Open dialog
      await user.click(screen.getByText("Add Games"));

      // Fill in form fields
      const dateInput = screen.getByPlaceholderText("Date");
      const timeInput = screen.getByPlaceholderText("Time");
      const locationInput = screen.getByPlaceholderText("Location");
      const opponentInput = screen.getByPlaceholderText("Opponent");

      await user.type(dateInput, "2024-01-15");
      await user.type(timeInput, "14:00");
      await user.type(locationInput, "Test Location");
      await user.type(opponentInput, "Test Opponent");

      expect(dateInput).toHaveValue("2024-01-15");
      expect(timeInput).toHaveValue("14:00");
      expect(locationInput).toHaveValue("Test Location");
      expect(opponentInput).toHaveValue("Test Opponent");
    });

    it("should handle checkbox changes", async () => {
      const user = userEvent.setup();
      render(<GameManagement series={mockSeries} onSuccess={mockOnSuccess} />);
      // Open dialog
      await user.click(screen.getByRole("button", { name: /add games/i }));
      // Find and click the home game checkbox
      const homeCheckbox = screen.getByRole("checkbox", { name: /home game/i });
      expect(homeCheckbox).not.toBeChecked();
      await user.click(homeCheckbox);
      expect(homeCheckbox).toBeChecked();
    });

    it("should handle day selection", async () => {
      const user = userEvent.setup();
      render(<GameManagement series={mockSeries} onSuccess={mockOnSuccess} />);

      // Open dialog
      await user.click(screen.getByText("Add Games"));

      // Find and click day checkboxes
      const mondayCheckbox = screen.getByRole("checkbox", { name: /monday/i });
      const tuesdayCheckbox = screen.getByRole("checkbox", {
        name: /tuesday/i,
      });

      await user.click(mondayCheckbox);
      await user.click(tuesdayCheckbox);

      expect(mondayCheckbox).toBeChecked();
      expect(tuesdayCheckbox).toBeChecked();
    });
  });

  describe("API Integration", () => {
    it("should successfully create games", async () => {
      const user = userEvent.setup();
      render(<GameManagement series={mockSeries} onSuccess={mockOnSuccess} />);

      // Open dialog
      await user.click(screen.getByText("Add Games"));

      // Fill in required fields
      const dateInput = screen.getByPlaceholderText("Date");
      const timeInput = screen.getByPlaceholderText("Time");
      const locationInput = screen.getByPlaceholderText("Location");
      const opponentInput = screen.getByPlaceholderText("Opponent");

      await user.type(dateInput, "2024-01-15");
      await user.type(timeInput, "14:00");
      await user.type(locationInput, "Test Location");
      await user.type(opponentInput, "Test Opponent");

      // Submit form
      const createButton = screen.getByText("Create Games");
      await user.click(createButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith(
          `/game-series/${mockSeries.id}/games`,
          expect.objectContaining({
            seriesId: mockSeries.id,
            date: "2024-01-15",
            time: "14:00",
            location: "Test Location",
            opponent: "Test Opponent",
            isHome: true,
            days: [],
          })
        );
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("should handle API errors", async () => {
      const errorMessage = "Failed to create games";
      mockApi.post.mockRejectedValue(new Error(errorMessage));

      const user = userEvent.setup();
      render(<GameManagement series={mockSeries} onSuccess={mockOnSuccess} />);

      // Open dialog
      await user.click(screen.getByText("Add Games"));

      // Fill in required fields
      const dateInput = screen.getByPlaceholderText("Date");
      const timeInput = screen.getByPlaceholderText("Time");
      const locationInput = screen.getByPlaceholderText("Location");
      const opponentInput = screen.getByPlaceholderText("Opponent");

      await user.type(dateInput, "2024-01-15");
      await user.type(timeInput, "14:00");
      await user.type(locationInput, "Test Location");
      await user.type(opponentInput, "Test Opponent");

      // Submit form
      const createButton = screen.getByText("Create Games");
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe("Loading States", () => {
    it("should show loading state during API call", async () => {
      // Mock a delayed API response
      mockApi.post.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const user = userEvent.setup();
      render(<GameManagement series={mockSeries} onSuccess={mockOnSuccess} />);

      // Open dialog
      await user.click(screen.getByText("Add Games"));

      // Fill in required fields
      const dateInput = screen.getByPlaceholderText("Date");
      const timeInput = screen.getByPlaceholderText("Time");
      const locationInput = screen.getByPlaceholderText("Location");
      const opponentInput = screen.getByPlaceholderText("Opponent");

      await user.type(dateInput, "2024-01-15");
      await user.type(timeInput, "14:00");
      await user.type(locationInput, "Test Location");
      await user.type(opponentInput, "Test Opponent");

      // Submit form
      const createButton = screen.getByText("Create Games");
      await user.click(createButton);

      // Check for loading state
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(createButton).toBeDisabled();
    });
  });

  describe("Form Reset", () => {
    it("should reset form when dialog is closed", async () => {
      const user = userEvent.setup();
      render(<GameManagement series={mockSeries} onSuccess={mockOnSuccess} />);

      // Open dialog
      await user.click(screen.getByText("Add Games"));

      // Fill in some fields
      const dateInput = screen.getByPlaceholderText("Date");
      const locationInput = screen.getByPlaceholderText("Location");

      await user.type(dateInput, "2024-01-15");
      await user.type(locationInput, "Test Location");

      // Close dialog
      await user.click(screen.getByText("Cancel"));

      // Reopen dialog
      await user.click(screen.getByText("Add Games"));

      // Check that fields are reset
      const newDateInput = screen.getByPlaceholderText("Date");
      const newLocationInput = screen.getByPlaceholderText("Location");

      expect(newDateInput).toHaveValue("");
      expect(newLocationInput).toHaveValue("");
    });
  });
});
