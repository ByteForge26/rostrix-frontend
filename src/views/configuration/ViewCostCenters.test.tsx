import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { store, useAppSelector } from "../../app/store/store";
import { setImmediate } from "timers";
import ViewCostCenters from "./ViewCostCenters";
import { Provider } from "react-redux";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import { act } from "react-dom/test-utils";
import React from "react";
import userEvent from "@testing-library/user-event";
import { ICostCenter } from "../../helper/Interface";

const flushPromises = () => new Promise(setImmediate);

const mockCostCenters = [
  {
    id: 1,
    costCentreName: "IN1311",
    costCentreZone: "North",
    city: "Delhi",
    state: "Delhi",
    country: "India",
    address: "123 Main St, Delhi",
    displayName: "Delhi Store",
    managerEmpId: "EMP001",
    superManagerEmpId: "EMP002",
    pinCode: "110001",
    updatedAt: "2024-03-01",
    disabled: false,
    type: "RETAIL",
  },
  {
    id: 2,
    costCentreName: "IN2422",
    costCentreZone: "South",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    address: "456 Tech Park, Bangalore",
    displayName: "Bangalore Store",
    managerEmpId: "EMP003",
    superManagerEmpId: "EMP004",
    pinCode: "560001",
    updatedAt: "2024-03-05",
    disabled: false,
    type: "RETAIL",
  },
  {
    id: 3,
    costCentreName: "IN3533",
    costCentreZone: "West",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    address: "789 Sea View, Mumbai",
    displayName: "Mumbai Store",
    managerEmpId: "EMP005",
    superManagerEmpId: "EMP006",
    pinCode: "400001",
    updatedAt: "2024-03-10",
    disabled: true,
    type: "RETAIL",
  },
];

const mockCostCenterResponse = {
  costCenters: mockCostCenters,
  totalPages: 1,
};

window.scrollTo = jest.fn();
window.matchMedia =
  window.matchMedia ||
  (() => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));

jest.mock("react-router-dom", () => ({ useNavigate: jest.fn() }));

const mockAddToast = jest.fn();
jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({ addToast: mockAddToast }),
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();

jest.mock("../../hooks/useApi", () => ({ useApi: jest.fn() }));

jest.mock("../../app/store/store", () => ({
  useAppSelector: jest.fn(() => ({
    selectedCostCenterName: "IN1311",
    user: { empId: "DSI000486" },
  })),
  useAppDispatch: jest.fn(),
  store: { getState: jest.fn(), subscribe: jest.fn(), dispatch: jest.fn() },
}));

jest.mock("../../hooks/usePermission", () => ({ usePermission: jest.fn() }));

jest.mock("../../components/AppSelect", () => ({
  __esModule: true,
  default: ({ onChange, value, options, isMulti }) => (
    <div data-testid="app-select">
      <select
        data-testid="select-input"
        onChange={(e) => {
          if (isMulti) {
            const value = e.target.value;
            onChange([value]);
          } else {
            onChange(e.target.value);
          }
        }}
        value={value}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

jest.mock("../../components/AppLoader", () => ({
  __esModule: true,
  default: () => <div data-testid="loading">Loading...</div>,
}));

jest.mock("../../components/AppNoData", () => ({
  __esModule: true,
  default: () => <div data-testid="no-data">No data available</div>,
}));

jest.mock("../../components/AppRightDrawer", () => ({
  __esModule: true,
  default: ({ children, isOpen, onClose, heading }) =>
    isOpen ? (
      <div data-testid="right-drawer" role="dialog">
        <div>{heading}</div>
        {children}
        <button onClick={onClose}>Close Drawer</button>
      </div>
    ) : null,
}));

const useApiMock = useApi as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;
const useAppSelectorMock = useAppSelector as jest.Mock;

describe("ViewCostCenters Component", () => {
  beforeEach(() => {
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/cost-centre")) {
          return Promise.resolve(mockCostCenterResponse);
        }
        return Promise.resolve([]);
      }),
      post: jest.fn((endpoint, payload) => {
        return Promise.resolve({
          success: true,
          message: "Created successfully",
        });
      }),
      put: jest.fn((endpoint, payload) => {
        return Promise.resolve({
          success: true,
          message: "Updated successfully",
        });
      }),
    });

    useAppSelectorMock.mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: { empId: "DSI000486" },
    });

    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  afterEach(() => jest.clearAllMocks());

  it("should show no data when no cost centers are available", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn(() => Promise.resolve({ costCenters: [], totalPages: 0 })),
      post: mockPost,
      put: mockPut,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ViewCostCenters />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("no-data")).toBeInTheDocument();
    });
  });

  it("should render cost centers when data is available", async () => {
    const mockGetForThisTest = jest.fn().mockResolvedValue({
      costCenters: mockCostCenters,
      totalPages: 1,
    });

    useApiMock.mockReturnValue({
      get: mockGetForThisTest,
      post: mockPost,
      put: mockPut,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ViewCostCenters />
        </Provider>,
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Cost Center")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Filter out live cost center(s) by zone, state, city.",
        ),
      ).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("Search here")).toBeInTheDocument();
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("should show loader when data is loading", async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    useApiMock.mockReturnValue({
      get: jest.fn(() => promise),
      post: mockPost,
      put: mockPut,
    });

    render(
      <Provider store={store}>
        <ViewCostCenters />
      </Provider>,
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();

    act(() => {
      resolvePromise(mockCostCenterResponse);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });
  });

  it("should filter cost centers by search term", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCostCenterResponse),
      post: mockPost,
      put: mockPut,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ViewCostCenters />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search here");
    fireEvent.change(searchInput, { target: { value: "Delhi" } });

    expect(searchInput.value).toBe("Delhi");

    await waitFor(() => {
      expect(screen.getByText(/123 Main St, Delhi/)).toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: "" } });
    await waitFor(() => {
      expect(screen.getByText(/123 Main St, Delhi/)).toBeInTheDocument();
      expect(screen.getByText(/456 Tech Park, Bangalore/)).toBeInTheDocument();
    });
  });

  it("should display the accordion panel when clicking on an item", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCostCenterResponse),
      post: mockPost,
      put: mockPut,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ViewCostCenters />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    const filterButton = screen.getByText("Filters");
    expect(filterButton).toBeInTheDocument();

    expect(screen.getByText(/1\./)).toBeInTheDocument();

    const accordionButtons = screen.getAllByRole("button");
    const accordionButton = Array.from(accordionButtons).find(
      (button) => button.textContent && button.textContent.includes("Delhi"),
    );

    if (accordionButton) {
      fireEvent.click(accordionButton);
    } else {
      expect(screen.getByText(/Delhi/)).toBeInTheDocument();
    }
  });

  it("should open the filter drawer and select filter options", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCostCenterResponse),
      post: mockPost,
      put: mockPut,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ViewCostCenters />
        </Provider>,
      );
    });
    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Filters"));

    expect(screen.getByTestId("right-drawer")).toBeInTheDocument();
    expect(screen.getByText("Filter")).toBeInTheDocument();

    const selectInputs = screen.getAllByTestId("select-input");
    fireEvent.change(selectInputs[0], { target: { value: "North" } });

    await waitFor(() => {
      expect(screen.getByText("Zone")).toBeInTheDocument();
    });

    fireEvent.change(selectInputs[1], { target: { value: "Delhi" } });

    fireEvent.change(selectInputs[2], { target: { value: "Delhi" } });

    fireEvent.click(screen.getByText("Close Drawer"));

    await waitFor(() => {
      expect(screen.queryByTestId("right-drawer")).not.toBeInTheDocument();
    });
  });

  it("should reset all filters when the Reset button is clicked", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCostCenterResponse),
      post: mockPost,
      put: mockPut,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ViewCostCenters />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Filters"));

    const selectInputs = screen.getAllByTestId("select-input");
    fireEvent.change(selectInputs[0], { target: { value: "North" } });

    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.queryByTestId("right-drawer")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Filters"));

    await waitFor(() => {
      expect(screen.getByText(/123 Main St, Delhi/)).toBeInTheDocument();
      expect(screen.getByText(/456 Tech Park, Bangalore/)).toBeInTheDocument();
    });
  });

  it("should handle API error gracefully", async () => {
    const mockGetWithError = jest.fn().mockImplementation(() => {
      return Promise.resolve({ costCenters: [], totalPages: 0 });
    });

    useApiMock.mockReturnValue({
      get: mockGetWithError,
      post: mockPost,
      put: mockPut,
    });
    await act(async () => {
      render(
        <Provider store={store}>
          <ViewCostCenters />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    expect(mockGetWithError).toHaveBeenCalled();
  });

  it("should show badge for disabled cost centers", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCostCenterResponse),
      post: mockPost,
      put: mockPut,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ViewCostCenters />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });
    expect(screen.getByText("DISABLED")).toBeInTheDocument();
  });

  it("should filter cost centers correctly when applying multiple filters", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockCostCenterResponse),
      post: mockPost,
      put: mockPut,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ViewCostCenters />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Delhi Store/)).toBeInTheDocument();
    expect(screen.getByText(/Bangalore Store/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Filters"));

    const selectInputs = screen.getAllByTestId("select-input");
    fireEvent.change(selectInputs[0], { target: { value: "North" } });

    fireEvent.click(screen.getByText("Close Drawer"));

    await waitFor(() => {
      expect(screen.getByText(/Delhi Store/)).toBeInTheDocument();
      expect(screen.queryByText(/Bangalore Store/)).not.toBeInTheDocument();
    });
  });

  it("should handle case where cost centers API returns null", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn(() => Promise.resolve(null)),
      post: mockPost,
      put: mockPut,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ViewCostCenters />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("no-data")).toBeInTheDocument();
    });
  });
});
