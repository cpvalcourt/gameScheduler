import "@testing-library/jest-dom";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { vi } from "vitest";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { I18nProvider } from "../contexts/I18nContext";
import React from "react";

// Mock the entire API module using the mock file
vi.mock("../services/api", () => {
  return vi.importActual("./__mocks__/api");
});

// Export the mock functions from the mock file
export { mockGet, mockPost, mockPut, mockDelete } from "./__mocks__/api";

// Mock window.location for navigation tests
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    pathname: "/",
    search: "",
    hash: "",
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});

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

// Mock console.warn to suppress React Router warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("React Router Future Flag Warning") ||
      args[0].includes("v7_startTransition") ||
      args[0].includes("v7_relativeSplatPath"))
  ) {
    return;
  }
  originalWarn(...args);
};

// Mock console.error to suppress some errors
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("Warning: An update to") ||
      args[0].includes("Warning: ReactDOM.render is no longer supported"))
  ) {
    return;
  }
  originalError(...args);
};

afterEach(() => {
  cleanup();
});

export function renderWithProviders(ui: any) {
  return render(
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>{ui}</AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
