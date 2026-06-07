import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import AppDrawer from "./AppDrawer";
import rootReducer from "../app/slice/root.slice";
import { usePermission } from "../hooks/usePermission";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/store";

jest.mock("../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../app/store/store", () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

jest.mock("../helper/Images", () => ({
  effiMateLogoWhite: "mock-logo.png",
}));

jest.mock("../config/routes.config", () => ({
  ROUTES: [
    {
      label: "Dashboard",
      icon: "dashboard-icon.png",
      path: "dashboard",
      children: [
        {
          label: "Overview",
          path: "overview",
          isActive: true,
          hideFromNav: false,
          permissionKey: "dashboard_view",
        },
        {
          label: "New Feature",
          path: "new",
          isActive: true,
          hideFromNav: false,
          permissionKey: "dashboard_new",
          isNew: true,
        },
      ],
    },
  ],
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      root: rootReducer,
    },
    preloadedState: {
      root: {
        drawerIndex: -1,
        ...initialState,
      },
    },
  });
};

const TestWrapper: React.FC<{
  store?: ReturnType<typeof createMockStore>;
  initialRoute?: string;
}> = ({ store = createMockStore(), initialRoute = "/dashboard" }) => {
  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route
            path="*"
            element={<AppDrawer isOpen={true} onToggle={() => {}} />}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe("AppDrawer Component", () => {
  let mockNavigate: jest.Mock;
  let mockDispatch: jest.Mock;
  let mockUseAppSelector: jest.Mock;

  beforeEach(() => {
    mockNavigate = jest.fn();
    mockDispatch = jest.fn();
    mockUseAppSelector = jest.fn().mockReturnValue({ drawerIndex: -1 });

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useAppSelector as jest.Mock).mockImplementation(mockUseAppSelector);

    (usePermission as jest.Mock).mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn((routes) => routes),
    });

    delete (window as any).location;
    (window as any).location = {
      pathname: "/dashboard",
    };
  });

  test("renders logo", () => {
    render(<TestWrapper />);

    const logos = screen.queryAllByRole("img", { name: "" });

    const logo = logos.find(
      (img) => img.getAttribute("src") === "mock-logo.png"
    );

    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "mock-logo.png");
  });

  test("renders drawer menu items", () => {
    render(<TestWrapper />);

    const dashboardItem = screen.getByText("Dashboard");
    expect(dashboardItem).toBeInTheDocument();

    fireEvent.click(dashboardItem);

    const overviewItem = screen.getByText("Overview");
    const newFeatureItem = screen.getByText("New Feature");

    expect(overviewItem).toBeInTheDocument();
    expect(newFeatureItem).toBeInTheDocument();
  });

  test("navigates on menu item click", () => {
    render(<TestWrapper />);

    fireEvent.click(screen.getByText("Dashboard"));

    fireEvent.click(screen.getByText("Overview"));

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/overview");
  });

  test("displays NEW tag for new features", () => {
    render(<TestWrapper />);

    fireEvent.click(screen.getByText("Dashboard"));

    const newTag = screen.getByText("NEW");
    expect(newTag).toBeInTheDocument();
  });

  test("handles logo click", () => {
    render(<TestWrapper />);

    const logos = screen.queryAllByRole("img", { name: "" });

    const logo = logos.find(
      (img) => img.getAttribute("src") === "mock-logo.png"
    );

    if (logo) {
      fireEvent.click(logo);
    }

    expect(mockNavigate).toHaveBeenCalledWith("/home", {
      state: { click: true },
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "root/updateDrawerIndex",
      payload: -1,
    });
  });

  test("handles drawer index changes", () => {
    render(<TestWrapper />);

    fireEvent.click(screen.getByText("Dashboard"));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "root/updateDrawerIndex",
      })
    );
  });

  test("respects permission checks", () => {
    const mockCheckPermission = jest.fn().mockReturnValue(false);
    (usePermission as jest.Mock).mockReturnValue({
      checkForPermission: mockCheckPermission,
      transformRoutes: jest.fn((routes) => routes),
    });

    render(<TestWrapper />);

    fireEvent.click(screen.getByText("Dashboard"));

    expect(mockCheckPermission).toHaveBeenCalled();
  });
});
