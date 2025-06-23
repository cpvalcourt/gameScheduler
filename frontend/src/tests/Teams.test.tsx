import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./setup.tsx";
import TeamsPage from "../pages/TeamsPage";

// Mock the teams API
vi.mock("../api/teams", () => ({
  getUserTeams: vi.fn(),
  createTeam: vi.fn(),
  updateTeam: vi.fn(),
  deleteTeam: vi.fn(),
  getRoleDisplayName: vi.fn((role) => role),
  getRoleColor: vi.fn(() => "primary"),
  canManageTeam: vi.fn(() => true),
  canManageTeamBasic: vi.fn(() => true),
}));

// Mock the auth context
const mockUser = {
  id: 1,
  username: "testuser",
  email: "test@example.com",
  role: "user",
  is_verified: true,
  is_active: true,
  created_at: "2023-01-01T00:00:00Z",
  updated_at: "2023-01-01T00:00:00Z",
};

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    loading: false,
  }),
}));

// Mock the API service
vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("TeamsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders teams page with create team button", async () => {
    const { getUserTeams } = await import("../api/teams");
    vi.mocked(getUserTeams).mockResolvedValue([]);

    renderWithProviders(<TeamsPage />);

    await waitFor(() => {
      expect(screen.getByText("My Teams")).toBeInTheDocument();
    });
    expect(screen.getByText("Create Team")).toBeInTheDocument();
  });

  it("shows empty state when no teams exist", async () => {
    const { getUserTeams } = await import("../api/teams");
    vi.mocked(getUserTeams).mockResolvedValue([]);

    renderWithProviders(<TeamsPage />);

    await waitFor(() => {
      expect(screen.getByText("No teams yet")).toBeInTheDocument();
    });
    expect(screen.getByText("Create Your First Team")).toBeInTheDocument();
  });

  it("opens create team dialog when create button is clicked", async () => {
    const { getUserTeams } = await import("../api/teams");
    vi.mocked(getUserTeams).mockResolvedValue([]);

    renderWithProviders(<TeamsPage />);

    await waitFor(() => {
      expect(screen.getByText("Create Your First Team")).toBeInTheDocument();
    });

    const createButton = screen.getByText("Create Your First Team");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText("Create New Team")).toBeInTheDocument();
    });
  });

  it("displays teams when they exist", async () => {
    const { getUserTeams } = await import("../api/teams");
    const mockTeams = [
      {
        id: 1,
        name: "Test Team 1",
        description: "Test Description 1",
        created_by: 1,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
      {
        id: 2,
        name: "Test Team 2",
        description: "Test Description 2",
        created_by: 1,
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      },
    ];

    vi.mocked(getUserTeams).mockResolvedValue(mockTeams);

    renderWithProviders(<TeamsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Team 1")).toBeInTheDocument();
      expect(screen.getByText("Test Team 2")).toBeInTheDocument();
    });
  });
});
