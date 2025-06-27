import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

interface User {
  id: number;
  email: string;
  username: string;
  is_verified: boolean;
  role: "user" | "moderator" | "admin";
  is_active: boolean;
  profile_picture_url?: string | null;
  bio?: string | null;
  location?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  website_url?: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    username: string
  ) => Promise<void>;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to construct full URL for profile pictures
const constructFullProfilePictureUrl = (userData: User): User => {
  if (
    userData.profile_picture_url &&
    !userData.profile_picture_url.startsWith("http")
  ) {
    return {
      ...userData,
      profile_picture_url: `http://localhost:3002${userData.profile_picture_url}`,
    };
  }
  return userData;
};

export const AuthProvider = ({ children }: { children: any }) => {
  // Initialize with user data from localStorage if available
  const initializeUser = (): User | null => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        return constructFullProfilePictureUrl(JSON.parse(userData) as User);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        return null;
      }
    }
    return null;
  };

  const [user, setUser] = useState(initializeUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for stored token and validate it
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Validate token and get user info
      api
        .get("/users/me")
        .then((response) => {
          console.log("AuthContext - API response user:", response.data.user);
          const localStorageUser = localStorage.getItem("user");
          console.log(
            "AuthContext - localStorage user:",
            localStorageUser ? JSON.parse(localStorageUser) : null
          );

          const userWithFullUrl = constructFullProfilePictureUrl(
            response.data.user
          );
          console.log("AuthContext - Setting user:", userWithFullUrl);
          setUser(userWithFullUrl);

          // Update localStorage with fresh data
          localStorage.setItem("user", JSON.stringify(userWithFullUrl));
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          delete api.defaults.headers.common["Authorization"];
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      console.log("AuthContext - Starting login for:", email);

      const response = await api.post("/auth/login", { email, password });
      console.log("AuthContext - Login API response:", response.data);

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const userWithFullUrl = constructFullProfilePictureUrl(user);
      console.log("AuthContext - Login user with full URL:", userWithFullUrl);
      setUser(userWithFullUrl);

      // Update localStorage with fresh data
      localStorage.setItem("user", JSON.stringify(userWithFullUrl));
      console.log("AuthContext - Login completed, user state updated");
    } catch (err) {
      console.error("AuthContext - Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const register = async (
    email: string,
    password: string,
    username: string
  ) => {
    try {
      setError(null);
      await api.post("/auth/register", { email, password, username });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    }
  };

  const updateUser = (userData: User) => {
    setUser(constructFullProfilePictureUrl(userData));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, register, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
