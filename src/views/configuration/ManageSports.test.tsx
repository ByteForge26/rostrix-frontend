import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { store, useAppSelector } from "../../app/store/store";
import {
  IStorePlannedJob,
  IPlannedJob,
  IApiResponse,
} from "../../helper/Interface";
import ManageSports from "./ManageSports";
import { Provider } from "react-redux";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import { act } from "react-dom/test-utils";
import React from "react";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mockedSports = [
  { id: 1, name: "Football" },
  { id: 2, name: "Basketball" },
  { id: 3, name: "Tennis" },
];

const mockPutApiResponse = {
  success: true,
  message: "Sport updated successfully",
};
const mockPostApiResponse = {
  success: true,
  message: "Sport created successfully",
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

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({ addToast: jest.fn() }),
}));

jest.mock("../../hooks/useApi", () => ({ useApi: jest.fn() }));

jest.mock("../../app/store/store", () => ({
  useAppSelector: jest.fn(() => ({
    selectedCostCenterName: "IN1311",
    user: { empId: "DSI000486" },
  })),
  useAppDispatch: jest.fn(),
  store: { getState: jest.fn(), subscribe: jest.fn() },
}));

jest.mock("../../hooks/usePermission", () => ({ usePermission: jest.fn() }));

jest.mock("moment", () => () => ({
  format: jest.fn(() => "2024-07-14"),
  startOf: () => ({ format: jest.fn(() => "2024-07-01") }),
  endOf: () => ({ format: jest.fn(() => "2024-07-31") }),
  diff: jest.fn(),
}));

const useApiMock = useApi;
const usePermissionMock = usePermission;

describe("Manage Sports Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/master/sport"))
          return Promise.resolve(mockedSports);
        return Promise.resolve([]);
      }),
      post: jest.fn((endpoint, payload) => {
        if (endpoint.includes("/master/sport"))
          return Promise.resolve(mockPostApiResponse);
        return Promise.reject({
          success: false,
          message: "Unknown API endpoint",
        });
      }),
      put: jest.fn((endpoint, payload) => {
        if (endpoint.includes("/master/sport"))
          return Promise.resolve(mockPutApiResponse);
        return Promise.reject({
          success: false,
          message: "Unknown API endpoint",
        });
      }),
    });

    useAppSelector.mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: { empId: "DSI000486" },
    });
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  afterEach(() => jest.clearAllMocks());

  it("should show ALL sports", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageSports />
        </Provider>
      );
    });

    await sleep(2000);
    expect(screen.getByText("Football")).toBeInTheDocument();
    expect(screen.getByText("Basketball")).toBeInTheDocument();
    expect(screen.getByText("Tennis")).toBeInTheDocument();
  });

  it("should open the modal when Add Sport button is clicked", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageSports />
        </Provider>
      );
    });

    await sleep(2000);
    const addSportButton = screen.getByText("+ Add Sport");
    fireEvent.click(addSportButton);

    expect(screen.getByText("Add Sport")).toBeInTheDocument();
  });

  it("should open the modal with sport data when Edit button is clicked", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageSports />
        </Provider>
      );
    });

    await sleep(2000);
    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    expect(screen.getByText("Edit Sport")).toBeInTheDocument();
    expect(screen.getAllByText("Sports")[0]).toBeInTheDocument();
  });

  it("should save the sport when Save button is clicked", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageSports />
        </Provider>
      );
    });

    await sleep(2000);
    const addSportButton = screen.getByText("+ Add Sport");
    fireEvent.click(addSportButton);

    const sportNameInput = screen.getByPlaceholderText("Enter here");
    fireEvent.change(sportNameInput, { target: { value: "Cricket" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() =>
      expect(screen.queryByText("Add Sport")).not.toBeInTheDocument()
    );
  });
});
