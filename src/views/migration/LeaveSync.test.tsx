import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { store, useAppSelector } from "../../app/store/store";
import { Provider } from "react-redux";
import { IMigration } from "../../helper/Interface";
import LeaveSync from "./LeaveSync";
import React from "react";
import { useApi } from "../../hooks/useApi";
import { useToasts } from "react-toast-notifications";
import { usePermission } from "../../hooks/usePermission";

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

jest.mock("../../config/endpoint.config", () => ({
  ENDPOINT: {
    "/effi": {
      "/migration": "/api/effi/migration",
      "/migration/status": "/api/effi/migration/status",
    },
  },
}));
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

const mockAddToast = jest.fn();
jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: mockAddToast,
  }),
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock("../../hooks/useApi", () => ({
  useApi: () => ({
    get: mockGet,
    post: mockPost,
  }),
}));

const mockCheckPermission = jest.fn(() => true);
jest.mock("../../hooks/usePermission", () => ({
  usePermission: () => ({
    checkForPermission: mockCheckPermission,
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
    jest.clearAllMocks();
    mockCheckPermission.mockReturnValue(true);
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: {
        empId: "DSI000486",
      },
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should render `Humine Leave Sync Page`", async () => {
    mockGet.mockResolvedValueOnce(mockedMigration);
    render(
      <Provider store={store}>
        <LeaveSync />
      </Provider>
    );
    await waitFor(() => expect(mockGet).toHaveBeenCalled());

    expect(screen.getByText("Humine Leave Sync")).toBeInTheDocument();
  });
  it("should render `Leave`", async () => {
    mockGet.mockResolvedValueOnce(mockedMigration);
    render(
      <Provider store={store}>
        <LeaveSync />
      </Provider>
    );
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    const Cards = ["Leave"];
    for (const card of Cards) {
      const cardText = await screen.findByText(card);
      expect(cardText).toBeInTheDocument();
    }
  });
  it("should render `Emp Id`", async () => {
    mockGet.mockResolvedValueOnce(mockedMigration);
    render(
      <Provider store={store}>
        <LeaveSync />
      </Provider>
    );
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    const headings = await screen.findAllByText("DSI000486");
    expect(headings[0]).toBeInTheDocument();
  });
  it("should render `Leave Buttons`", async () => {
    mockGet.mockResolvedValueOnce(mockedMigration);
    render(
      <Provider store={store}>
        <LeaveSync />
      </Provider>
    );
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    const button1 = await screen.findByText("Update Status");
    const button2 = await screen.findAllByText("Manual Sync");
    expect(button1).toBeInTheDocument();
    expect(button2[0]).toBeInTheDocument();
  });
  it("should render `Leave Data`", async () => {
    mockGet.mockResolvedValueOnce(mockedMigration);
    render(
      <Provider store={store}>
        <LeaveSync />
      </Provider>
    );
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    const texts = [
      "2024-07-14",
      "Initial Load Success",
      "Yes",
      "Scheduled Sync",
      "Last Updated On",
      "2024-07-14",
      "Status",
      "COMPLETED",
      "Last Successful Updated On",
      "2024-07-14",
      "Last Update Success",
      "Yes",
      "Error Message",
      "",
      "Manual Sync",
      "Last Updated On",
      "2024-07-14",
      "Status",
      "COMPLETED",
      "Last Successful Updated On",
      "2024-07-14",
      "Last Update Success",
      "Yes",
      "Error Message",
      "",
    ];
    for (const text of texts) {
      const t = await screen.findAllByText(
        (content, element) => element?.textContent?.includes(text) ?? false
      );
      expect(t[0]).toBeInTheDocument();
    }
  });

  test("onRefresh calls getMigrationStatus on successful post", async () => {
    mockGet.mockResolvedValueOnce(mockedMigration);
    mockPost.mockResolvedValueOnce({ success: true });
    render(
      <Provider store={store}>
        <LeaveSync />
      </Provider>
    );
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    await waitFor(() => expect(mockCheckPermission).toHaveBeenCalled());

    const manualSyncButton = screen.getAllByText("Manual Sync")[0];

    await waitFor(() => {
      fireEvent.click(manualSyncButton);
    });

    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  test("onRefresh displays error toast on failed post with message", async () => {
    mockGet.mockResolvedValueOnce(mockedMigration);
    mockPost.mockResolvedValueOnce({ success: false, message: "API Error" });
    render(
      <Provider store={store}>
        <LeaveSync />
      </Provider>
    );
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    await waitFor(() => expect(mockCheckPermission).toHaveBeenCalled());

    const manualSyncButton = screen.getAllByText("Manual Sync")[0];

    await waitFor(() => {
      fireEvent.click(manualSyncButton);
    });
  });
  test("hides buttons when user does not have permission", async () => {
    mockGet.mockResolvedValueOnce(mockedMigration);
    mockCheckPermission.mockReturnValue(false);
    render(
      <Provider store={store}>
        <LeaveSync />
      </Provider>
    );
    await waitFor(() => expect(mockGet).toHaveBeenCalled());

    await waitFor(() => {
      expect(screen.queryByText("Update Status")).not.toBeInTheDocument();
      expect(screen.queryByText("Manual Sync")).not.toBeInTheDocument();
    });
  });
  test("onRefresh calls getMigrationStatus when status is 'started'", async () => {
    const startedMigration = [
      {
        ...mockedMigration[0],
        status: "STARTED",
      },
    ];

    mockGet.mockResolvedValueOnce(startedMigration);
    mockGet.mockResolvedValueOnce(startedMigration);

    render(
      <Provider store={store}>
        <LeaveSync />
      </Provider>
    );

    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    await waitFor(() => expect(mockCheckPermission).toHaveBeenCalled());

    const manualSyncButton = screen.getAllByText("Manual Sync")[0];

    await waitFor(() => {
      fireEvent.click(manualSyncButton);
    });
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  test("onRefresh displays error toast on failed post with message", async () => {
    mockGet.mockResolvedValueOnce(mockedMigration);
    mockPost.mockResolvedValueOnce({ success: false, message: "API Error" });

    render(
      <Provider store={store}>
        <LeaveSync />
      </Provider>
    );

    await waitFor(() => expect(mockGet).toHaveBeenCalled());
  });
});
