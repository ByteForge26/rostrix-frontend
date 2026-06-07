import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { store, useAppSelector } from "../../app/store/store";
import {
  IStorePlannedJob,
  IPlannedJob,
  IApiResponse,
} from "../../helper/Interface";
import ClusterJobConfiguration from "./ClusterJobConfiguration";
import { Provider } from "react-redux";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import { act } from "react-dom/test-utils";
import React from "react";

const sleep = (ms: number | undefined) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const mockedStorePlannedJobs: IStorePlannedJob[] = [
  {
    id: 102,
    costCentre: "IN1311",
    type: "SECONDARY",
    secondaryJobType: "CASHIERING",
    miscWorkId: null,
    miscWorkJobName: "",
    disabled: false,
  },
  {
    id: 103,
    costCentre: "IN1311",
    type: "MISCELLANEOUS",
    secondaryJobType: "",
    miscWorkId: 6,
    miscWorkJobName: "Trial Room",
    disabled: true,
  },
];

const mockedPlannedJobs: IPlannedJob[] = [
  {
    id: 1,
    type: "SECONDARY",
    jobType: "CASHIERING",
    miscWorkId: 0,
    miscWorkJobName: "",
  },
  {
    id: 2,
    type: "MISCELLANEOUS",
    jobType: "",
    miscWorkId: 5,
    miscWorkJobName: "Welcomer",
  },
  {
    id: 3,
    type: "MISCELLANEOUS",
    jobType: "",
    miscWorkId: 6,
    miscWorkJobName: "Trial Room",
  },
];

const mockPutApiResponse: IApiResponse[] = [
  { success: true, message: "Configuration Disabled" },
];

const mockPostApiResponse: IApiResponse[] = [
  { success: true, message: "Configuration Created" },
];

window.scrollTo = jest.fn();
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));

// Mocking hooks
jest.mock("../../hooks/useApi", () => ({
  useApi: jest.fn(),
}));

jest.mock("../../app/store/store", () => ({
  useAppSelector: jest.fn(() => ({
    selectedCostCenterName: "IN1311",
    user: {
      empId: "DSI000486",
    },
  })),
  useAppDispatch: jest.fn(),
  store: {
    getState: jest.fn(),
    subscribe: jest.fn(),
  },
}));

jest.mock("../../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

jest.mock("moment", () => () => ({
  format: jest.fn(() => "2024-07-14"),
  startOf: () => ({
    format: jest.fn(() => "2024-07-01"),
  }),
  endOf: () => ({
    format: jest.fn(() => "2024-07-31"),
  }),
  diff: jest.fn(),
}));

const useApiMock = useApi as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;

describe("Manage Store Configuration Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/cluster-planned-jobs/store")) {
          return Promise.resolve(mockedStorePlannedJobs);
        } else if (endpoint.includes("/cluster-planned-jobs")) {
          return Promise.resolve(mockedPlannedJobs);
        }
        return Promise.resolve([]);
      }),
      post: jest.fn((endpoint: string, payload: any) => {
        if (endpoint.includes("/v1/cluster-planned-jobs/store")) {
          return Promise.resolve(mockPostApiResponse);
        }
        return Promise.reject({
          success: false,
          message: "Unknown API endpoint",
        });
      }),
      put: jest.fn((endpoint: string, payload: any) => {
        if (endpoint.includes("/v1/cluster-planned-jobs/store/disable/102")) {
          return Promise.resolve(mockPutApiResponse);
        }
        return Promise.reject({
          success: false,
          message: "Unknown API endpoint",
        });
      }),
    });
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: {
        empId: "DSI000486",
      },
    });
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render `Manage Store Configuration Page`", async () => {
    render(
      <Provider store={store}>
        <ClusterJobConfiguration />
      </Provider>
    );

    expect(
      screen.getByText("Planned Cluster Job Configuration")
    ).toBeInTheDocument();
  });

  it("should  show  ALL jobs", async () => {
    render(
      <Provider store={store}>
        <ClusterJobConfiguration />
      </Provider>
    );

    expect(
      screen.getByText("Planned Cluster Job Configuration")
    ).toBeInTheDocument();

    await sleep(2000);

    const job = screen.getByText(/Cashiering/i);
    expect(job).toBeInTheDocument();
  });

  it("should  show no  jobs", async () => {
    const mockedStorePlannedJobs: IStorePlannedJob[] = [];

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/cluster-planned-jobs/store")) {
          return Promise.resolve(mockedStorePlannedJobs);
        }
        return Promise.resolve([]);
      }),
    });

    render(
      <Provider store={store}>
        <ClusterJobConfiguration />
      </Provider>
    );

    expect(
      screen.getByText("Planned Cluster Job Configuration")
    ).toBeInTheDocument();

    await sleep(2000);

    expect(screen.queryByText(/Cashiering/i)).not.toBeInTheDocument();
  });

  it("should render `Disable Config Modal`", async () => {
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ClusterJobConfiguration />
        </Provider>
      );
    });

    const deleteButtons = screen.getAllByLabelText("Disable Button");
    await fireEvent.click(deleteButtons[0]);

    const heading = screen.queryByText("Disable Cluster Planned Job");
    expect(heading).toBeInTheDocument();

    const closeButton = await screen.findByText("Close");
    expect(closeButton).toBeInTheDocument();
    const deleteButton = await screen.findByText("Disable");
    expect(deleteButton).toBeInTheDocument();
  });

  it("should render `Delete Config Job Modal`", async () => {
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ClusterJobConfiguration />
        </Provider>
      );
    });

    const deleteButtons = screen.getAllByLabelText("Disable Button");
    await fireEvent.click(deleteButtons[0]);

    const heading = screen.queryByText("Disable Cluster Planned Job");
    expect(heading).toBeInTheDocument();

    const closeButton = await screen.findByText("Close");
    expect(closeButton).toBeInTheDocument();
    const deleteButton = await screen.findByText("Disable");
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(useApiMock().put).toHaveBeenCalledWith(
        "/v1/cluster-planned-jobs/store/disable/102"
      );
    });
  });

  it("should render `Add Config Modal`", async () => {
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ClusterJobConfiguration />
        </Provider>
      );
    });

    const button = screen.getByText(/Add Config/i);
    expect(button).toBeInTheDocument();
    await fireEvent.click(button);
    const heading = screen.queryByText("Add Cluster Planned Jobs");
    expect(heading).toBeInTheDocument();
    const Subheading = screen.queryByText("Cluster Planned Job");
    expect(Subheading).toBeInTheDocument();
    const closeButton = await screen.findByText("Close");
    expect(closeButton).toBeInTheDocument();

    const combobox = screen.getByRole("combobox");

    expect(combobox).toBeInTheDocument();
    fireEvent.change(combobox, {
      target: { value: "wel" },
    });

    const actionClick = screen.getByText(/Welcomer/i);

    fireEvent.click(actionClick);

    const SaveButton = screen.getByText("Save", { name: /Save/i });
    expect(SaveButton).not.toBeDisabled();

    fireEvent.click(SaveButton);

    await waitFor(() => {
      expect(useApiMock().post).toHaveBeenCalledWith(
        "/v1/cluster-planned-jobs/store",
        {
          data: { costCentre: "IN1041", jobIds: [2] },
        }
      );
    });
  });

  it("should render `Add Config Modal` Nojobs were left to add", async () => {
    const mockedPlannedJobs: IPlannedJob[] = [];
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/cluster-planned-jobs")) {
          return Promise.resolve(mockedPlannedJobs);
        }
        return Promise.resolve([]);
      }),
    });

    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ClusterJobConfiguration />
        </Provider>
      );
    });

    const button = screen.getByText(/Add Config/i);
    expect(button).toBeInTheDocument();
    await fireEvent.click(button);
    const heading = screen.queryByText("Add Cluster Planned Jobs");
    expect(heading).toBeInTheDocument();
    const Subheading = screen.queryByText("Cluster Planned Job");
    expect(Subheading).toBeInTheDocument();
    const closeButton = await screen.findByText("Close");
    expect(closeButton).toBeInTheDocument();

    const combobox = screen.getByRole("combobox");

    expect(combobox).toBeInTheDocument();
    fireEvent.change(combobox, {
      target: { value: "wel" },
    });

    expect(screen.queryByText(/Welcomer/i)).not.toBeInTheDocument();
  });
});
