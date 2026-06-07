import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { store, useAppSelector } from "../../app/store/store";
import { Provider } from "react-redux";
import { IIntegration } from "../../helper/Interface";
import IntegratedJobSync from "./IntegratedJobSync";

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock("../../hooks/useApi", () => ({
  useApi: () => ({
    get: mockGet,
    post: mockPost,
  }),
}));
//
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
const mockedIntegration: IIntegration[] = [
  {
    jobEntity: "PILOTED_TO_QTY",
    dateMode: "RANGE",
    costCentreBased: true,
    allowedFutureDate: "2025-07-03",
    allowedPastDate: "2024-10-06",
    refreshEndPointPath: "/sync-piloted-to-qty",
    lastScheduleUpdatedAt: "",
    scheduleUpdatedStatus: "",
    manualUpdateStatus: "COMPLETED_WITH_ERRORS",
    lastManualUpdatedAt: "2025-04-02T16:41:14.83202",
  },
  {
    jobEntity: "POST_REALISED_HOURS",
    dateMode: "PAY_ROLL",
    costCentreBased: true,
    allowedFutureDate: "2025-03-20",
    allowedPastDate: "2024-09-21",
    refreshEndPointPath: "/sync-post-realised-hours",
    lastScheduleUpdatedAt: "",
    scheduleUpdatedStatus: "",
    manualUpdateStatus: "COMPLETED",
    lastManualUpdatedAt: "2025-04-03T19:04:05.394227",
  },
  {
    jobEntity: "POST_PILOTED_HOURS",
    dateMode: "RANGE",
    costCentreBased: true,
    allowedFutureDate: "2025-07-03",
    allowedPastDate: "2024-10-06",
    refreshEndPointPath: "/sync-post-piloted-hours",
    lastScheduleUpdatedAt: "2025-04-03T22:25:01.759749",
    scheduleUpdatedStatus: "COMPLETED",
    manualUpdateStatus: "COMPLETED_WITH_ERRORS",
    lastManualUpdatedAt: "2025-04-03T18:35:30.455438",
  },
  {
    jobEntity: "REALISED_TO_QTY",
    dateMode: "RANGE",
    costCentreBased: true,
    allowedFutureDate: "2025-04-03",
    allowedPastDate: "2024-10-06",
    refreshEndPointPath: "/sync-realised-to-qty",
    lastScheduleUpdatedAt: "2025-04-03T22:25:45.675629",
    scheduleUpdatedStatus: "COMPLETED",
    manualUpdateStatus: "COMPLETED",
    lastManualUpdatedAt: "2025-04-03T20:31:55.183227",
  },
  {
    jobEntity: "CLUSTER",
    dateMode: "NO_DATE",
    costCentreBased: true,
    allowedFutureDate: "",
    allowedPastDate: "",
    refreshEndPointPath: "/sync-cluster",
    lastScheduleUpdatedAt: "2025-04-03T21:55:10.23064",
    scheduleUpdatedStatus: "COMPLETED",
    manualUpdateStatus: "COMPLETED",
    lastManualUpdatedAt: "2025-04-04T00:14:12.260967",
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
    removeAllToasts: jest.fn(),
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
  add: () => ({
    format: jest.fn(() => "2024-07-14"),
  }),
  startOf: () => ({
    format: jest.fn(() => "2024-07-01"),
  }),
  endOf: () => ({
    format: jest.fn(() => "2024-07-31"),
  }),
  diff: jest.fn(),
  unix: jest.fn(),
  toDate: jest.fn(() => "2024-07-14"),
  get: jest.fn(() => "14"),
  set: () => ({
    toDate: jest.fn(() => "2024-07-31"),
    unix: jest.fn(),
    set: () => ({
      set: () => ({
        set: () => ({
          format: jest.fn(() => "2024-07-14"),
        }),
        subtract: () => ({
          set: () => ({
            format: jest.fn(() => "2024-07-14"),
          }),
        }),
      }),
    }),
  }),
}));

describe("Integrated Job Sync Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: {
        empId: "DSI000486",
      },
    });
    mockGet.mockResolvedValue(mockedIntegration);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render `Buttons`", async () => {
    render(
      <Provider store={store}>
        <IntegratedJobSync />
      </Provider>
    );
    const button1 = await screen.findAllByText("Update Status");
    const button2 = await screen.findAllByText("Manual Sync");
    expect(button1[0]).toBeInTheDocument();
    expect(button2[0]).toBeInTheDocument();
  });
  it("should render `data`", async () => {
    render(
      <Provider store={store}>
        <IntegratedJobSync />
      </Provider>
    );
    const text1 = await screen.findAllByText("2024-07-14");
    expect(text1[0]).toBeInTheDocument();
    const text2 = await screen.findAllByText("Perfeco: Realised TO/Qty Sync");
    expect(text2[0]).toBeInTheDocument();
  });

  it("should trigger Update Status on button click", async () => {
    render(
      <Provider store={store}>
        <IntegratedJobSync />
      </Provider>
    );

    const updateStatusButton = await screen.findAllByText("Update Status");
    fireEvent.click(updateStatusButton[0]);
  });

  it("should display No Data if Integration list is empty", async () => {
    jest.mock("../../hooks/useApi", () => ({
      useApi: () => ({
        get: jest.fn(() => Promise.resolve([])),
      }),
    }));

    render(
      <Provider store={store}>
        <IntegratedJobSync />
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
        <IntegratedJobSync />
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
        <IntegratedJobSync />
      </Provider>
    );

    const updateStatusButton = await screen.findAllByText("Update Status");
    fireEvent.click(updateStatusButton[0]);
  });

  it("should trigger Manual Sync but with Status Change on button click", async () => {
    const mockedIntegrationTemp: IIntegration[] = [
      {
        jobEntity: "PILOTED_TO_QTY",
        dateMode: "RANGE",
        costCentreBased: true,
        allowedFutureDate: "2025-07-03",
        allowedPastDate: "2024-10-06",
        refreshEndPointPath: "/sync-piloted-to-qty",
        lastScheduleUpdatedAt: "",
        scheduleUpdatedStatus: "",
        manualUpdateStatus: "COMPLETED_WITH_ERRORS",
        lastManualUpdatedAt: "2025-04-02T16:41:14.83202",
      },
    ];
    mockGet.mockResolvedValue(mockedIntegrationTemp);
    mockPost.mockResolvedValue({
      message: "Update Status Successfully",
      success: true,
    });
    render(
      <Provider store={store}>
        <IntegratedJobSync />
      </Provider>
    );

    const ManualSyncButton = await screen.findAllByText("Manual Sync");
    fireEvent.click(ManualSyncButton[0]);
  });

  it("Sorting on Multiple Integration", async () => {
    const mockedIntegrationTemp: IIntegration[] = [
      {
        jobEntity: "PILOTED_TO_QTY",
        dateMode: "RANGE",
        costCentreBased: true,
        allowedFutureDate: "2025-07-03",
        allowedPastDate: "2024-10-06",
        refreshEndPointPath: "/sync-piloted-to-qty",
        lastScheduleUpdatedAt: "",
        scheduleUpdatedStatus: "",
        manualUpdateStatus: "COMPLETED_WITH_ERRORS",
        lastManualUpdatedAt: "2025-04-02T16:41:14.83202",
      },
      {
        jobEntity: "POST_REALISED_HOURS",
        dateMode: "PAY_ROLL",
        costCentreBased: true,
        allowedFutureDate: "2025-03-20",
        allowedPastDate: "2024-09-21",
        refreshEndPointPath: "/sync-post-realised-hours",
        lastScheduleUpdatedAt: "",
        scheduleUpdatedStatus: "",
        manualUpdateStatus: "COMPLETED",
        lastManualUpdatedAt: "2025-04-03T19:04:05.394227",
      },
    ];
    mockGet.mockResolvedValue(mockedIntegrationTemp);
    render(
      <Provider store={store}>
        <IntegratedJobSync />
      </Provider>
    );

    const ManualSyncButton = await screen.findAllByText("Manual Sync");
    fireEvent.click(ManualSyncButton[0]);
  });
});
