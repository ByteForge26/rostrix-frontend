import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { store, useAppSelector } from "../../app/store/store";
import { Provider } from "react-redux";
import { IMigration } from "../../helper/Interface";
import ManageMigration from "./MangeMigration";

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock("../../hooks/useApi", () => ({
  useApi: () => ({
    get: mockGet,
    post: mockPost,
  }),
}));

jest.mock("../../hooks/useApi", () => {
  const originalModule = jest.requireActual("../../hooks/useApi");
  return {
    ...originalModule,
    useApi: () => ({
      get: mockGet,
      post: mockPost,
    }),
  };
});

jest.setTimeout(20000);
const mockedMigration: IMigration[] = [
  {
    migrationEntity: "LEAVE",
    initialLoadAt: "2025-01-27T16:47:30.622754",
    initLoadSuccess: true,
    lastUpdatedAt: "2025-01-27T16:47:30.622754",
    lastSuccessAt: "2025-01-27T16:47:30.622754",
    errorMessage: "",
    status: "COMPLETED",
    lastManualUpdatedAt: "2025-01-28T10:24:19.445651",
    manualUpdateLastSuccessAt: "2025-01-28T10:24:19.445657",
    manualUpdateErrorMessage: "",
    manualUpdateSuccess: true,
    manualUpdateStatus: "COMPLETED",
    refreshEndPointPath: "/leaves",
    updateSuccess: true,
  },
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

jest.mock("../../hooks/useApi", () => ({
  useApi: () => ({
    get: mockGet,
    post: mockPost,
  }),
}));
jest.mock("../../hooks/usePermission", () => ({
  usePermission: () => ({
    checkForPermission: jest.fn(() => true),
    transformRoutes: jest.fn(() => []),
  }),
}));
jest.mock("../../app/store/store", () => ({
  useAppSelector: jest.fn(() => ({
    selectedCostCenterName: "IN1041",
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

jest.mock("moment", () => () => ({
  format: jest.fn(() => "2024-07-14"),
  startOf: () => ({
    format: jest.fn(() => "2024-07-01"),
  }),
  endOf: () => ({
    format: jest.fn(() => "2024-07-31"),
  }),
  diff: jest.fn(),
  unix: jest.fn(),
}));

describe("Humine Leave Sync Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: {
        empId: "DSI000486",
      },
    });
    mockGet.mockResolvedValue(mockedMigration);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render `Leave Buttons`", async () => {
    render(
      <Provider store={store}>
        <ManageMigration />
      </Provider>
    );
    const button1 = await screen.findByText("Update Status");
    const button2 = await screen.findAllByText("Manual Sync");
    expect(button1).toBeInTheDocument();
    expect(button2[0]).toBeInTheDocument();
  });

  it("should trigger Update Status on button click", async () => {
    render(
      <Provider store={store}>
        <ManageMigration />
      </Provider>
    );

    const updateStatusButton = await screen.findByText("Update Status");
    fireEvent.click(updateStatusButton);
  });

  it("should display No Data if migration list is empty", async () => {
    jest.mock("../../hooks/useApi", () => ({
      useApi: () => ({
        get: jest.fn(() => Promise.resolve([])),
      }),
    }));

    render(
      <Provider store={store}>
        <ManageMigration />
      </Provider>
    );
  });
  it("should trigger Manual Sync on button click", async () => {
    mockPost.mockResolvedValueOnce({
      message: "Manual Sync Successfully",
      success: true,
    });
    render(
      <Provider store={store}>
        <ManageMigration />
      </Provider>
    );

    const manualSyncButton = await screen.findAllByText("Manual Sync");
    fireEvent.click(manualSyncButton[0]);
  });

  it("should trigger Update Status on button click", async () => {
    mockPost.mockResolvedValueOnce({
      message: "Update Status Successfully",
      success: true,
    });
    render(
      <Provider store={store}>
        <ManageMigration />
      </Provider>
    );

    const updateStatusButton = await screen.findAllByText("Update Status");
    fireEvent.click(updateStatusButton[0]);
  });

  it("should trigger Manual Sync but with Status Change on button click", async () => {
    const mockedMigrationTemp: IMigration[] = [
      {
        migrationEntity: "LEAVE",
        initialLoadAt: "2025-01-27T16:47:30.622754",
        initLoadSuccess: true,
        lastUpdatedAt: "2025-01-27T16:47:30.622754",
        lastSuccessAt: "2025-01-27T16:47:30.622754",
        errorMessage: "",
        status: "STARTED",
        lastManualUpdatedAt: "2025-01-28T10:24:19.445651",
        manualUpdateLastSuccessAt: "2025-01-28T10:24:19.445657",
        manualUpdateErrorMessage: "",
        manualUpdateSuccess: true,
        manualUpdateStatus: "COMPLETED",
        refreshEndPointPath: "/leaves",
        updateSuccess: true,
      },
    ];
    mockGet.mockResolvedValue(mockedMigrationTemp);
    mockPost.mockResolvedValue({
      message: "Update Status Successfully",
      success: true,
    });
    render(
      <Provider store={store}>
        <ManageMigration />
      </Provider>
    );

    const ManualSyncButton = await screen.findAllByText("Manual Sync");
    fireEvent.click(ManualSyncButton[0]);
  });

  it("Sorting on Multiple Migration", async () => {
    const mockedMigrationTemp: IMigration[] = [
      {
        migrationEntity: "LEAVE",
        initialLoadAt: "2025-01-27T16:47:30.622754",
        initLoadSuccess: true,
        lastUpdatedAt: "2025-01-27T16:47:30.622754",
        lastSuccessAt: "2025-01-27T16:47:30.622754",
        errorMessage: "",
        status: "STARTED",
        lastManualUpdatedAt: "2025-01-28T10:24:19.445651",
        manualUpdateLastSuccessAt: "2025-01-28T10:24:19.445657",
        manualUpdateErrorMessage: "",
        manualUpdateSuccess: true,
        manualUpdateStatus: "COMPLETED",
        refreshEndPointPath: "/leaves",
        updateSuccess: true,
      },
      {
        migrationEntity: "LEAVE",
        initialLoadAt: "2025-01-27T16:47:30.622754",
        initLoadSuccess: true,
        lastUpdatedAt: "2025-01-27T16:47:30.622754",
        lastSuccessAt: "2025-01-27T16:47:30.622754",
        errorMessage: "",
        status: "STARTED",
        lastManualUpdatedAt: "2025-01-28T10:24:19.445651",
        manualUpdateLastSuccessAt: "2025-01-28T10:24:19.445657",
        manualUpdateErrorMessage: "",
        manualUpdateSuccess: true,
        manualUpdateStatus: "COMPLETED",
        refreshEndPointPath: "/leaves",
        updateSuccess: true,
      },
    ];
    mockGet.mockResolvedValue(mockedMigrationTemp);
    render(
      <Provider store={store}>
        <ManageMigration />
      </Provider>
    );

    const ManualSyncButton = await screen.findAllByText("Manual Sync");
  });
});
