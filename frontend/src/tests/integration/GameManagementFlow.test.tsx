import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import App from "../../App";
import api from "../../services/api";

// Mock the API service
vi.mock("../../services/api");
const mockApi = api as any;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock Material-UI components for simpler testing
vi.mock("@mui/material", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    Box: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Button: ({ children, onClick, disabled, ...props }: any) => (
      <button onClick={onClick} disabled={disabled} {...props}>
        {children}
      </button>
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
    Typography: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    Alert: ({ children, severity, ...props }: any) => (
      <div role="alert" {...props}>
        {children}
      </div>
    ),
    CircularProgress: ({ size, ...props }: any) => (
      <div {...props}>Loading...</div>
    ),
    Dialog: ({ children, open, onClose, ...props }: any) =>
      open ? <div {...props}>{children}</div> : null,
    DialogTitle: ({ children, ...props }: any) => (
      <h2 {...props}>{children}</h2>
    ),
    DialogContent: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    DialogActions: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
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
    Container: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  };
});

describe("Game Management Flow Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {});
    localStorageMock.removeItem.mockImplementation(() => {});
  });

  describe("Complete Game Management Flow", () => {
    it("should allow users to create game series and manage games", async () => {
      const user = userEvent.setup();

      // Mock successful login
      mockApi.post.mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            is_verified: true,
          },
          token: "test-token",
        },
      });

      // Mock successful game series creation
      mockApi.post.mockResolvedValueOnce({
        data: {
          id: 1,
          name: "Test Series",
          description: "Test Description",
          type: "tournament",
          start_date: "2024-01-01",
          end_date: "2024-12-31",
          created_by: 1,
        },
      });

      // Mock successful game creation
      mockApi.post.mockResolvedValueOnce({
        data: {
          message: "Games created successfully",
        },
      });

      // Mock game series list
      mockApi.get.mockResolvedValueOnce({
        data: {
          series: [
            {
              id: 1,
              name: "Test Series",
              description: "Test Description",
              type: "tournament",
              start_date: "2024-01-01",
              end_date: "2024-12-31",
              created_by: 1,
            },
          ],
        },
      });

      // Mock games list
      mockApi.get.mockResolvedValueOnce({
        data: {
          games: [
            {
              id: 1,
              date: "2024-01-15",
              time: "14:00",
              location: "Test Location",
              opponent: "Test Opponent",
              is_home: true,
              series_id: 1,
            },
          ],
        },
      });

      render(<App />);

      // Login first
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      const loginButton = screen.getByText(/sign in/i);
      await user.click(loginButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "token",
          "test-token"
        );
      });

      // Navigate to game series section
      const seriesLink =
        screen.getByText(/series/i) || screen.getByText(/games/i);
      await user.click(seriesLink);

      // Create a new game series
      const createSeriesButton =
        screen.getByText(/create series/i) || screen.getByText(/add series/i);
      await user.click(createSeriesButton);

      // Fill series form
      const nameInput = screen.getByPlaceholderText(/name/i);
      const descriptionInput = screen.getByPlaceholderText(/description/i);
      const startDateInput = screen.getByPlaceholderText(/start date/i);
      const endDateInput = screen.getByPlaceholderText(/end date/i);

      await user.type(nameInput, "Test Series");
      await user.type(descriptionInput, "Test Description");
      await user.type(startDateInput, "2024-01-01");
      await user.type(endDateInput, "2024-12-31");

      // Submit series creation
      const submitButton =
        screen.getByText(/create/i) || screen.getByText(/save/i);
      await user.click(submitButton);

      // Wait for series creation to complete
      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith(
          "/game-series",
          expect.any(Object)
        );
      });

      // Should see the created series
      await waitFor(() => {
        expect(screen.getByText(/test series/i)).toBeInTheDocument();
      });

      // Click on the series to manage games
      const seriesItem = screen.getByText(/test series/i);
      await user.click(seriesItem);

      // Add games to the series
      const addGamesButton = screen.getByText(/add games/i);
      await user.click(addGamesButton);

      // Fill game form
      const gameDateInput = screen.getByPlaceholderText(/date/i);
      const gameTimeInput = screen.getByPlaceholderText(/time/i);
      const locationInput = screen.getByPlaceholderText(/location/i);
      const opponentInput = screen.getByPlaceholderText(/opponent/i);

      await user.type(gameDateInput, "2024-01-15");
      await user.type(gameTimeInput, "14:00");
      await user.type(locationInput, "Test Location");
      await user.type(opponentInput, "Test Opponent");

      // Submit game creation
      const createGamesButton = screen.getByText(/create games/i);
      await user.click(createGamesButton);

      // Wait for game creation to complete
      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith(
          "/game-series/1/games",
          expect.any(Object)
        );
      });

      // Should see the created game
      await waitFor(() => {
        expect(screen.getByText(/test opponent/i)).toBeInTheDocument();
      });
    });

    it("should handle errors in game management flow", async () => {
      const user = userEvent.setup();

      // Mock successful login
      mockApi.post.mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            is_verified: true,
          },
          token: "test-token",
        },
      });

      // Mock failed game series creation
      mockApi.post.mockRejectedValueOnce(new Error("Series creation failed"));

      render(<App />);

      // Login first
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      const loginButton = screen.getByText(/sign in/i);
      await user.click(loginButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "token",
          "test-token"
        );
      });

      // Navigate to game series section
      const seriesLink =
        screen.getByText(/series/i) || screen.getByText(/games/i);
      await user.click(seriesLink);

      // Try to create a game series
      const createSeriesButton =
        screen.getByText(/create series/i) || screen.getByText(/add series/i);
      await user.click(createSeriesButton);

      // Fill series form
      const nameInput = screen.getByPlaceholderText(/name/i);
      const descriptionInput = screen.getByPlaceholderText(/description/i);

      await user.type(nameInput, "Test Series");
      await user.type(descriptionInput, "Test Description");

      // Submit series creation
      const submitButton =
        screen.getByText(/create/i) || screen.getByText(/save/i);
      await user.click(submitButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/series creation failed/i)).toBeInTheDocument();
      });
    });
  });

  describe("Game Series Management", () => {
    it("should allow users to view and edit game series", async () => {
      const user = userEvent.setup();

      // Mock successful login
      mockApi.post.mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            is_verified: true,
          },
          token: "test-token",
        },
      });

      // Mock game series list
      mockApi.get.mockResolvedValueOnce({
        data: {
          series: [
            {
              id: 1,
              name: "Test Series",
              description: "Test Description",
              type: "tournament",
              start_date: "2024-01-01",
              end_date: "2024-12-31",
              created_by: 1,
            },
          ],
        },
      });

      // Mock successful series update
      mockApi.put.mockResolvedValueOnce({
        data: {
          message: "Series updated successfully",
        },
      });

      render(<App />);

      // Login first
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      const loginButton = screen.getByText(/sign in/i);
      await user.click(loginButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "token",
          "test-token"
        );
      });

      // Navigate to game series section
      const seriesLink =
        screen.getByText(/series/i) || screen.getByText(/games/i);
      await user.click(seriesLink);

      // Should see the series list
      await waitFor(() => {
        expect(screen.getByText(/test series/i)).toBeInTheDocument();
      });

      // Click on series to view details
      const seriesItem = screen.getByText(/test series/i);
      await user.click(seriesItem);

      // Should see series details
      await waitFor(() => {
        expect(screen.getByText(/test description/i)).toBeInTheDocument();
      });
    });
  });

  describe("Game Management", () => {
    it("should allow users to manage individual games", async () => {
      const user = userEvent.setup();

      // Mock successful login
      mockApi.post.mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            is_verified: true,
          },
          token: "test-token",
        },
      });

      // Mock games list
      mockApi.get.mockResolvedValueOnce({
        data: {
          games: [
            {
              id: 1,
              date: "2024-01-15",
              time: "14:00",
              location: "Test Location",
              opponent: "Test Opponent",
              is_home: true,
              series_id: 1,
            },
          ],
        },
      });

      // Mock successful game update
      mockApi.put.mockResolvedValueOnce({
        data: {
          message: "Game updated successfully",
        },
      });

      render(<App />);

      // Login first
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      const loginButton = screen.getByText(/sign in/i);
      await user.click(loginButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "token",
          "test-token"
        );
      });

      // Navigate to games section
      const gamesLink = screen.getByText(/games/i);
      await user.click(gamesLink);

      // Should see the games list
      await waitFor(() => {
        expect(screen.getByText(/test opponent/i)).toBeInTheDocument();
      });

      // Click on game to view details
      const gameItem = screen.getByText(/test opponent/i);
      await user.click(gameItem);

      // Should see game details
      await waitFor(() => {
        expect(screen.getByText(/test location/i)).toBeInTheDocument();
      });
    });
  });

  describe("Data Validation", () => {
    it("should validate form inputs in game management", async () => {
      const user = userEvent.setup();

      // Mock successful login
      mockApi.post.mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            is_verified: true,
          },
          token: "test-token",
        },
      });

      render(<App />);

      // Login first
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      const loginButton = screen.getByText(/sign in/i);
      await user.click(loginButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          "token",
          "test-token"
        );
      });

      // Navigate to game series section
      const seriesLink =
        screen.getByText(/series/i) || screen.getByText(/games/i);
      await user.click(seriesLink);

      // Try to create series without required fields
      const createSeriesButton =
        screen.getByText(/create series/i) || screen.getByText(/add series/i);
      await user.click(createSeriesButton);

      // Submit without filling required fields
      const submitButton =
        screen.getByText(/create/i) || screen.getByText(/save/i);
      await user.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(
          screen.getByText(/required/i) || screen.getByText(/invalid/i)
        ).toBeInTheDocument();
      });
    });
  });
});
