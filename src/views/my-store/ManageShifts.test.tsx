import React from "react";
import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import { Provider } from "react-redux";
import ManageShifts from "./ManageShifts";
import { useApi } from "../../hooks/useApi";
import { useAppSelector, store } from "../../app/store/store";
import { useToasts } from "react-toast-notifications";
import { usePermission } from "../../hooks/usePermission";

import {
  IApiResponse,
  IClusterResponse,
  IShift,
  IStoreSecondaryJob,
} from "../../helper/Interface";

const mockShifts: IShift[] = [
  {
    id: 1,
    jobType: "Full-time",
    startTime: "08:00",
    endTime: "16:00",
    contractTypeId: 1,
    costCentre: "IN1311",
    lunchHours: 1,
    clusterId: 101,
  },
  {
    id: 2,
    jobType: "Part-time",
    startTime: "16:00",
    endTime: "20:00",
    contractTypeId: 2,
    costCentre: "IN1311",
    lunchHours: 0,
    clusterId: 102,
  },
];

const mockStoreSecondaryJobs: IStoreSecondaryJob[] = [
  {
    id: 952,
    jobType: "PLAYGROUND",
    costCentre: "IN1311",
    coachEmpId: "",
    firstName: "",
    lastName: "",
  },
  {
    id: 1004,
    jobType: "CRM",
    costCentre: "IN1311",
    coachEmpId: "",
    firstName: "",
    lastName: "",
  },
];

const mockClusterResponses: IClusterResponse[] = [
  {
    id: 101,
    name: "Cluster A",
    sportIds: [1, 2],
    costCentre: "IN1311",
    leaderEmpId: "EMP001",
    leaderEmpName: "Jane Smith",
    editable: true,
  },
  {
    id: 102,
    name: "Cluster B",
    sportIds: [3],
    costCentre: "IN1312",
    leaderEmpId: "EMP002",
    leaderEmpName: "John Doe",
    editable: true,
  },
  {
    id: 103,
    name: "Cluster C",
    sportIds: [3],
    costCentre: "IN1312",
    leaderEmpId: "EMP002",
    leaderEmpName: "John Doe",
    editable: true,
  },
  {
    id: 2760,
    name: "Running",
    sportIds: [],
    costCentre: "IN1311",
    leaderEmpId: "",
    leaderEmpName: "",
    editable: true,
  },
];

const mockDeleteApiResponse: IApiResponse[] = [
  { success: true, message: "Configuration Disabled" },
];

// Mocking external dependencies
jest.mock("../../hooks/useApi");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("react-toast-notifications", () => ({
  useToasts: jest.fn(),
}));

jest.mock("../../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

jest.mock("../../app/store/store", () => ({
  ...jest.requireActual("../../app/store/store"),
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

const sleep = (ms: number | undefined) =>
  new Promise((resolve) => setTimeout(resolve, ms));

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

const useApiMock = useApi as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;

describe("ManageShifts Component", () => {
  const mockAddToast = jest.fn();

  beforeEach(() => {
    jest.setTimeout(60000);
    jest.clearAllMocks();

    // Mock the useToasts hook
    (useToasts as jest.Mock).mockReturnValue({
      addToast: mockAddToast,
      removeToast: jest.fn(),
      removeAllToasts: jest.fn(),
      toastStack: [],
      updateToast: jest.fn(),
    });

    // Default API mock for normal tests
    useApiMock.mockReturnValue({
      get: jest.fn().mockImplementation((url) => {
        if (url.includes("shift")) {
          return Promise.resolve(mockShifts);
        }
        if (url.includes("secondary")) {
          return Promise.resolve(mockStoreSecondaryJobs);
        }
        if (url.includes("cluster")) {
          return Promise.resolve(mockClusterResponses);
        }
        return Promise.resolve([]);
      }),
      post: jest.fn().mockResolvedValue({
        success: true,
        message: "Shift added successfully!",
      }),
      Delete: jest.fn((endpoint) => {
        if (endpoint.includes("/v1/shift/1"))
          return Promise.resolve(mockDeleteApiResponse);
        return Promise.reject({
          success: false,
          message: "Unknown API endpoint",
        });
      }),
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1311",
      contractTypes: [
        { id: 101, name: "Full-time" },
        { id: 102, name: "Part-time" },
        { id: 105, name: "Temporary" },
      ],
    });
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  test("renders fallback content when no data is present", async () => {
    useApiMock.mockReturnValueOnce({
      get: jest.fn((url) => {
        if (url.includes("shift")) return Promise.resolve([]);
        if (url.includes("secondary")) return Promise.resolve([]);
        if (url.includes("cluster")) return Promise.resolve([]);
        return Promise.resolve([]);
      }),
      post: jest.fn(),
      Delete: jest.fn(),
    });

    render(
      <Provider store={store}>
        <ManageShifts />
      </Provider>
    );
  });

  test("shows loading state initially", async () => {
    // Mock a delay in API response
    useApiMock.mockReturnValueOnce({
      get: jest.fn(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: mockShifts }), 500)
          )
      ),
      post: jest.fn(),
      Delete: jest.fn(),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageShifts />
        </Provider>
      );
    });

    // Assert loading state
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  test("shows empty state initially", async () => {
    useApiMock.mockReturnValueOnce({
      get: jest.fn((url) => {
        if (url.includes("shift")) return Promise.resolve([]);
        return Promise.resolve([]);
      }),
      post: jest.fn(),
      Delete: jest.fn(),
    });

    render(
      <Provider store={store}>
        <ManageShifts />
      </Provider>
    );
  });

  test("Should shows all tabs", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageShifts />
        </Provider>
      );
    });
    expect(screen.getByText(/PLAYGROUND/i)).toBeInTheDocument();
    expect(screen.getByText(/CRM/i)).toBeInTheDocument();
  });

  it("should delete shift", async () => {
    usePermissionMock.mockReturnValueOnce({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageShifts />
        </Provider>
      );
    });

    const deleteMock = useApiMock().Delete;

    const allDeleteIcons = screen.getAllByLabelText("deleteIcon");
    fireEvent.click(allDeleteIcons[0]);

    expect(screen.getByText("Delete Shift")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to Delete Shift?")
    ).toBeInTheDocument();

    const deleteButton = await screen.findByRole("button", {
      name: /Delete/i,
    });

    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalledWith("/v1/shift/1");
    });
  });

  test("allows adding a new shift with successful toast", async () => {
    const mockPostResponse = {
      success: true,
      message: "Shift added successfully!",
    };

    const mockAddToast = jest.fn();
    (useToasts as jest.Mock).mockReturnValue({
      addToast: mockAddToast,
    });
    useApiMock.mockReturnValue({
      post: jest.fn().mockResolvedValue(mockPostResponse),
      get: jest.fn((url) => {
        if (url.includes("shift")) {
          return Promise.resolve(mockShifts);
        }
        if (url.includes("secondary")) {
          return Promise.resolve(mockStoreSecondaryJobs);
        }
        if (url.includes("cluster")) {
          return Promise.resolve(mockClusterResponses);
        }
        return Promise.resolve([]);
      }),
    });
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageShifts />
        </Provider>
      );
    });

    const addShiftButton = screen.getByText(/Add Shift/i);
    fireEvent.click(addShiftButton);

    const modalField = await screen.findByText("Add Shift (LAYOUT)");
    expect(modalField).toBeInTheDocument();
    const comboboxes = screen.getAllByRole("combobox");
    fireEvent.change(comboboxes[0], {
      target: { value: "run" },
    });
    const cluster_value = screen.getByText(/Running/i);
    expect(cluster_value).toBeInTheDocument();
    fireEvent.click(cluster_value);

    fireEvent.change(comboboxes[1], {
      target: { value: "Full" },
    });
    const contract_value = screen.getByText(/full/i);
    expect(contract_value).toBeInTheDocument();
    fireEvent.click(contract_value);

    fireEvent.change(comboboxes[3], {
      target: { value: "07" },
    });
    const endTimeValue = screen.getByText(/07:30/);
    expect(endTimeValue).toBeInTheDocument();
    fireEvent.click(endTimeValue);

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);
  });
});
