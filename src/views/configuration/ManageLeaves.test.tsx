import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { store, useAppSelector } from "../../app/store/store";
import {
  IStorePlannedJob,
  IPlannedJob,
  IApiResponse,
} from "../../helper/Interface";
import ManageLeaves from "./MangeLeaves";
import { Provider } from "react-redux";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import { act } from "react-dom/test-utils";
import React from "react";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const mockDateGlobally = (mockDate) => {
  const OriginalDate = global.Date;

  class MockDate extends OriginalDate {
    constructor(...args) {
      if (args.length === 0) {
        return mockDate;
      }
      return new OriginalDate(...args);
    }
  }
  MockDate.UTC = OriginalDate.UTC;
  MockDate.parse = OriginalDate.parse;
  MockDate.now = jest.fn(() => mockDate.getTime());

  global.Date = MockDate;

  return () => {
    global.Date = OriginalDate;
  };
};

describe("Manage Leaves Component", () => {
  let mockGetFn;
  let mockPostFn;
  let mockPutFn;
  let addToastMock;
  let restoreDate;

  beforeEach(() => {
    jest.setTimeout(60000);

    addToastMock = jest.fn();
    mockGetFn = jest.fn();
    mockPostFn = jest.fn();
    mockPutFn = jest.fn();

    mockGetFn.mockImplementation((endpoint) => {
      if (endpoint.includes("/v1/master/state")) {
        return Promise.resolve([
          {
            id: 1,
            name: "California",
            code: "CA",
            countryId: 101,
            countryName: "USA",
          },
          {
            id: 2,
            name: "Texas",
            code: "TX",
            countryId: 101,
            countryName: "USA",
          },
        ]);
      }
      if (endpoint.includes("/v1/master/leave")) {
        return Promise.resolve([
          {
            id: 1,
            numLeaves: 10,
            effectiveDate: "2025-01-01",
            state: "California",
            stateId: "1",
          },
          {
            id: 2,
            numLeaves: 5,
            effectiveDate: "2025-02-01",
            state: "Texas",
            stateId: "2",
          },
        ]);
      }
      return Promise.resolve([]);
    });

    mockPostFn.mockImplementation((endpoint, payload) => {
      if (endpoint.includes("/v1/master/leave")) {
        return Promise.resolve({ success: true, message: "Leave Created" });
      }
      return Promise.reject({
        success: false,
        message: "Unknown API endpoint",
      });
    });

    mockPutFn.mockImplementation((endpoint, payload) => {
      if (endpoint.includes("/v1/master/leave")) {
        if (payload.data && payload.data.delete) {
          return Promise.resolve({ success: true, message: "Leave Deleted" });
        }
        return Promise.resolve({ success: true, message: "Leave Updated" });
      }
      return Promise.reject({
        success: false,
        message: "Unknown API endpoint",
      });
    });

    useApiMock.mockReturnValue({
      get: mockGetFn,
      post: mockPostFn,
      put: mockPutFn,
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

  afterEach(() => {
    jest.clearAllMocks();
    if (restoreDate) {
      restoreDate();
      restoreDate = null;
    }
  });

  it("should display leave data in the table", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageLeaves />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("California")).toBeInTheDocument();
      expect(screen.getByText("Texas")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  it("should show no data when no leaves are available", async () => {
    mockGetFn.mockImplementation((endpoint) => {
      if (endpoint.includes("/v1/master/state")) {
        return Promise.resolve([
          {
            id: 1,
            name: "California",
            code: "CA",
            countryId: 101,
            countryName: "USA",
          },
        ]);
      }
      return Promise.resolve([]);
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageLeaves />
        </Provider>
      );
    });

    await sleep(1000);
    expect(screen.queryByText("California")).not.toBeInTheDocument();
    expect(screen.queryByText("Texas")).not.toBeInTheDocument();
  });

  it("should show edit/delete buttons for future dates", async () => {
    const mockDate = new Date(2024, 0, 1);
    restoreDate = mockDateGlobally(mockDate);

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageLeaves />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("California")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByText("Edit").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Delete").length).toBeGreaterThan(0);
    });
  });

  it("should hide edit/delete buttons for past dates", async () => {
    const mockDate = new Date(2025, 2, 1);
    restoreDate = mockDateGlobally(mockDate);

    mockGetFn.mockImplementation((endpoint) => {
      if (endpoint.includes("/v1/master/state")) {
        return Promise.resolve([
          {
            id: 1,
            name: "California",
            code: "CA",
            countryId: 101,
            countryName: "USA",
          },
        ]);
      }
      if (endpoint.includes("/v1/master/leave")) {
        return Promise.resolve([
          {
            id: 1,
            numLeaves: 10,
            effectiveDate: "2025-01-01",
            state: "California",
            stateId: "1",
          },
        ]);
      }
      return Promise.resolve([]);
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageLeaves />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("California")).toBeInTheDocument();
    });

    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("should open add modal with empty fields when '+ Add Leaves' is clicked", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageLeaves />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("+ Add Leaves")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("+ Add Leaves"));

    await waitFor(() => {
      expect(screen.getByText("Add Leaves")).toBeInTheDocument();
    });

    const numLeavesInput = screen.getByPlaceholderText("Enter here");
    expect(numLeavesInput.value).toBe("");

    expect(screen.getByText("Save")).toBeDisabled();
  });

  it("should open edit modal with populated fields when Edit button is clicked", async () => {
    const mockDate = new Date(2024, 0, 1);
    restoreDate = mockDateGlobally(mockDate);

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageLeaves />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText("Edit").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByText("Edit")[0]);

    await waitFor(() => {
      expect(screen.getByText("Edit Leaves")).toBeInTheDocument();
    });

    const numLeavesInput = screen.getByPlaceholderText("Enter here");
    expect(numLeavesInput.value).toBeTruthy();
  });

  it("should open delete confirmation modal when Delete button is clicked", async () => {
    const mockDate = new Date(2024, 0, 1);
    restoreDate = mockDateGlobally(mockDate);

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageLeaves />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText("Delete").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(screen.getByText("Delete Leaves")).toBeInTheDocument();
      expect(
        screen.getByText("Are you sure you want to delete?")
      ).toBeInTheDocument();
    });
  });

  it("should call put API when editing an existing leave", async () => {
    const mockDate = new Date(2024, 0, 1);
    restoreDate = mockDateGlobally(mockDate);

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageLeaves />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText("Edit").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByText("Edit")[0]);

    await waitFor(() => {
      expect(screen.getByText("Edit Leaves")).toBeInTheDocument();
    });

    const numLeavesInput = screen.getByPlaceholderText("Enter here");
    fireEvent.change(numLeavesInput, { target: { value: "20" } });

    const saveButton = screen.getByText("Save");
    Object.defineProperty(saveButton, "disabled", {
      value: false,
      configurable: true,
    });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockPutFn).toHaveBeenCalled();
      expect(mockPutFn).toHaveBeenCalledWith(
        expect.stringContaining("/v1/master/leave"),
        expect.objectContaining({
          data: expect.objectContaining({
            numLeaves: "20",
          }),
        })
      );
    });
  });

  it("should call put API with delete flag when confirming delete", async () => {
    const mockDate = new Date(2024, 0, 1);
    restoreDate = mockDateGlobally(mockDate);

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageLeaves />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText("Delete").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(screen.getByText("Delete Leaves")).toBeInTheDocument();
    });

    const confirmDeleteButton =
      screen.getAllByText("Delete")[screen.getAllByText("Delete").length - 1];
    Object.defineProperty(confirmDeleteButton, "disabled", {
      value: false,
      configurable: true,
    });

    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockPutFn).toHaveBeenCalled();
      expect(mockPutFn).toHaveBeenCalledWith(
        expect.stringContaining("/v1/master/leave"),
        expect.objectContaining({
          data: expect.objectContaining({
            delete: true,
          }),
        })
      );
    });
  });

  it("should update numLeaves state when number of leaves input changes", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageLeaves />
        </Provider>
      );
    });

    fireEvent.click(screen.getByText("+ Add Leaves"));

    await waitFor(() => {
      expect(screen.getByText("Add Leaves")).toBeInTheDocument();
    });

    const numLeavesInput = screen.getByPlaceholderText("Enter here");
    fireEvent.change(numLeavesInput, { target: { value: "25" } });

    expect(numLeavesInput.value).toBe("25");
  });

  it("should show no data when there are no leaves", async () => {
    mockGetFn.mockImplementation((endpoint) => {
      if (endpoint.includes("/v1/master/state")) {
        return Promise.resolve([
          {
            id: 1,
            name: "California",
            code: "CA",
            countryId: 101,
            countryName: "USA",
          },
        ]);
      }
      return Promise.resolve([]);
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageLeaves />
        </Provider>
      );
    });

    await sleep(1000);
    expect(screen.queryByText("California")).not.toBeInTheDocument();
    expect(screen.queryByText("Texas")).not.toBeInTheDocument();
  });

  it("should close add modal when Close button is clicked", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageLeaves />
        </Provider>
      );
    });

    fireEvent.click(screen.getByText("+ Add Leaves"));

    await waitFor(() => {
      expect(screen.getByText("Add Leaves")).toBeInTheDocument();
    });

    const closeButton = screen.getAllByText("Close")[0];
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Add Leaves")).not.toBeInTheDocument();
    });
  });

  it("should close delete confirmation modal when Close button is clicked", async () => {
    const mockDate = new Date(2024, 0, 1);
    restoreDate = mockDateGlobally(mockDate);

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageLeaves />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getAllByText("Delete").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByText("Delete")[0]);

    await waitFor(() => {
      expect(screen.getByText("Delete Leaves")).toBeInTheDocument();
    });

    const closeButton = screen.getAllByText("Close")[0];
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Delete Leaves")).not.toBeInTheDocument();
    });
  });
});
