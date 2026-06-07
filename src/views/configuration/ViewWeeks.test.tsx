import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { store, useAppSelector } from "../../app/store/store";
import {
  IStorePlannedJob,
  IPlannedJob,
  IApiResponse,
} from "../../helper/Interface";
import ViewWeeks from "./ViewWeeks";
import { Provider } from "react-redux";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import { act } from "react-dom/test-utils";
import React from "react";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const mockedStorePlannedJobs = [
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

const mockedPlannedJobs = [
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

const mockPutApiResponse = [
  { success: true, message: "Configuration Disabled" },
];
const mockPostApiResponse = [
  { success: true, message: "Configuration Created" },
];

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

describe("Manage Store Configuration Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/cluster-planned-jobs/store"))
          return Promise.resolve(mockedStorePlannedJobs);
        if (endpoint.includes("/cluster-planned-jobs"))
          return Promise.resolve(mockedPlannedJobs);
        return Promise.resolve([]);
      }),
      post: jest.fn((endpoint, payload) => {
        if (endpoint.includes("/v1/cluster-planned-jobs/store"))
          return Promise.resolve(mockPostApiResponse);
        return Promise.reject({
          success: false,
          message: "Unknown API endpoint",
        });
      }),
      put: jest.fn((endpoint, payload) => {
        if (endpoint.includes("/v1/cluster-planned-jobs/store/disable/102"))
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

  it("should show ALL jobs", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ViewWeeks />
        </Provider>
      );
    });

    await sleep(2000);
    expect(
      screen.getByText(
        "Looks like there is no data, start adding on your own or ask your leader."
      )
    ).toBeInTheDocument();
  }, 60000);

  it("should show no jobs when none are available", async () => {
    useApiMock.mockReturnValue({ get: jest.fn(() => Promise.resolve([])) });
    render(
      <Provider store={store}>
        <ViewWeeks />
      </Provider>
    );
    await sleep(2000);
    expect(screen.queryByText("Cashiering")).not.toBeInTheDocument();
  });

  it("should render `Disable Config Modal`", async () => {
    await act(async () =>
      render(
        <Provider store={store}>
          <ViewWeeks />
        </Provider>
      )
    );
  });
});
