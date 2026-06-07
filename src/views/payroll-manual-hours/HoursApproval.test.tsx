import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { useAppSelector, store } from "../../app/store/store";
import HoursApproval from "./HoursApproval";
import {
  IPayrollConfig,
  IRosterDetails,
  IMyTeamLeavesResponse,
  IMyLeaveResponse,
  IClusterResponse,
  ISecondaryJob,
  IMiscWork,
  IMyTeamHours,
} from "../../helper/Interface";

import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import React from "react";

const mockAddToast = jest.fn();
jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: mockAddToast,
  }),
}));

jest.mock("../../app/store/store", () => ({
  ...jest.requireActual("../../app/store/store"),
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));
const mockPayrollConfig: IPayrollConfig = {
  currentPStartDateTime: "2024-11-22T00:00:00",
  currentPEndDateTime: "2024-12-21T15:15:00",
  currentManualHourStartTime: "2024-12-21T15:20:00",
  currentManualHourEndTime: "2024-12-21T16:20:00",
  currentPayrollExtractStartTime: "2024-12-21T16:22:00",
};
const mockMyTeamHours: IMyTeamHours = {
  status: "FINALISED",
  message: "Data fetched successfully",
  success: true,
  finalisedWorkHoursList: [
    {
      id: 1,
      name: "VISHNU YADAV",
      empId: "DP6149",
      contractTypeName: "Full Time",
      numWorkingHours: 40,
      numWorkingHolidays: 2,
      manualHours: 5,
      totalHours: 45,
      numLop: 0,
      approvalStatus: "PENDING",
      clusterName: "Cluster 1",
      approvalLogs: [
        {
          actionTimestamp: "2025-11-04T17:31:17.052623",
          comment: "Approved by Leader",
          email: "samruddha.gadnayakkk@decathlon.com",
          empId: "DSI000597kk",
          name: "GERALD RAKESH MOHAN",
          status: "APPROVED Status",
          version: 1999,
        },
      ],
    },
    {
      id: 2,
      name: "Prince Attri",
      empId: "DSI006062",
      contractTypeName: "Part Time",
      numWorkingHours: 20,
      numWorkingHolidays: 1,
      manualHours: 3,
      totalHours: 23,
      numLop: 0,
      approvalStatus: "APPROVED",
      clusterName: "Cluster 2",
    },
  ],
};

const mockHoursApprovalResponse: IMyTeamLeavesResponse = {
  empLeaveSummaryList: [
    {
      userId: "1",
      empId: "DP6149",
      firstName: "VISHNU",
      lastName: "YADAV",
      managerId: "1001",
      costCentreName: "Cost Centre 1",
      contractTypeId: 2,
      stateId: 9,
      totalAllowed: 0,
      availedGeneral: 0,
      plannedGeneral: 0,
      clusterName: "Cluster 1",
      clusterId: 1,
      availedLop: 0,
      plannedLop: 0,
      matOrPatAvailed: false,
    },
    {
      userId: "2",
      empId: "DSI006062",
      firstName: "Prince",
      lastName: "Attri",
      managerId: "1002",
      costCentreName: "Cost Centre 1",
      contractTypeId: 1,
      stateId: 9,
      totalAllowed: 32,
      availedGeneral: 0,
      plannedGeneral: 0,
      clusterName: "Cluster 1",
      clusterId: 1,
      availedLop: 0,
      plannedLop: 0,
      matOrPatAvailed: false,
    },
    {
      userId: "3",
      empId: "DP6515",
      firstName: "Himkar",
      lastName: ".",
      managerId: "1003",
      costCentreName: "Cost Centre 1",
      contractTypeId: 2,
      stateId: 9,
      totalAllowed: 0,
      availedGeneral: 0,
      plannedGeneral: 0,
      clusterName: "Cluster 1",
      clusterId: 1,
      availedLop: 0,
      plannedLop: 0,
      matOrPatAvailed: false,
    },
  ],
};

const mockClusters: IClusterResponse[] = [
  {
    id: 1,
    name: "Cluster 1",
    sportIds: [],
    costCentre: "",
    leaderEmpId: "",
    leaderEmpName: "",
    editable: true,
  },
  {
    id: 2,
    name: "Cluster 2",
    sportIds: [],
    costCentre: "",
    leaderEmpId: "",
    leaderEmpName: "",
    editable: true,
  },
];

const mockSecondaryJobs: ISecondaryJob[] = [
  {
    id: 1,
    type: "SecondaryJob1",
    hourCategory: "",
    description: "Secondary Job 1",
    allowSubMem: false,
    subMemName: "",
  },
  {
    id: 2,
    type: "SecondaryJob2",
    hourCategory: "",
    description: "Secondary Job 2",
    allowSubMem: false,
    subMemName: "",
  },
];

const mockMiscWork: IMiscWork[] = [
  { id: 1, name: "Misc Job 1", hourCategory: "" },
  { id: 2, name: "Misc Job 2", hourCategory: "" },
];

const mockRosterDetails: IRosterDetails = {
  data: {
    firstName: "Prince",
    lastName: "Attri",
    costCentre: "",
    empId: "DSI006062",
    assignedClusterId: 1,
    assignedSJTypes: ["SecondaryJob1"],
    dayStatus: "WORKING",
    metaData: "",
    main: [
      { s: "08:00:00", e: "12:00:00", c: "" },
      { s: "14:00:00", e: "18:00:00", c: "" },
    ],
    others: [{ s: "09:00:00", e: "11:00:00", c: "", type: "SecondaryJob1" }],
    misc: [
      {
        s: "13:00:00",
        e: "15:00:00",
        c: "",
        workId: 1,
        plannedJob: false,
        secondaryJobType: undefined,
      },
    ],
    exited: false,
    lastWorkingDate: "",
    costCenterChange: false,
    newCostCentre: "",
    costCentreChangeDate: "",
  },
  applicableForChange: true,
  message: "",
  success: true,
};

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

jest.mock("../../hooks/useApi", () => ({
  useApi: jest.fn(),
}));

jest.mock("../../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

const useApiMock = useApi as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;

describe("HoursApproval Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve(mockPayrollConfig);
        }
        if (endpoint.includes("/hours/manual")) {
          return Promise.resolve(mockHoursApprovalResponse);
        }
        if (endpoint.includes("/hours/emp")) {
          return Promise.resolve(mockRosterDetails);
        }
        if (endpoint.includes("/cluster")) {
          return Promise.resolve(mockClusters);
        }
        if (endpoint.includes("/secondary/store-config")) {
          return Promise.resolve(mockSecondaryJobs);
        }
        if (endpoint.includes("/roster/primary/miscWork")) {
          return Promise.resolve(mockMiscWork);
        }
        return Promise.resolve({});
      }),
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1311",
      contractTypes: [
        { id: 1, name: "Full Time" },
        { id: 2, name: "Part Time" },
      ],
    });
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  it("should render `Hours Approval  Page", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <HoursApproval />
        </Provider>
      );
    });

    const aliceLeaveElement = await screen.findByText(/Hours Approval/i);
    expect(aliceLeaveElement).toBeInTheDocument();
  });
  test("renders and handles click event for View Entries button", async () => {
    render(
      <Provider store={store}>
        <HoursApproval />
      </Provider>
    );
    await waitFor(() => {
      const drawerHeader = screen.getByText(/Hours Approval/i);
      expect(drawerHeader).toBeInTheDocument();
    });
  });

  test("handles timer functionality when showTimer is true and payrollConfig is defined", async () => {
    jest.useFakeTimers();

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve({
            ...mockPayrollConfig,
            currentHoursApprovaltartTime: new Date(
              Date.now() + 5000
            ).toISOString(),
          });
        }
        return Promise.resolve({});
      }),
    });

    render(
      <Provider store={store}>
        <HoursApproval />
      </Provider>
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      jest.runOnlyPendingTimers();
      jest.clearAllTimers();
    });

    jest.useRealTimers();
  });

  test("displays the correct header when a date range is selected", async () => {
    render(
      <Provider store={store}>
        <HoursApproval />
      </Provider>
    );

    const dropdown = screen.getByRole("combobox");
    fireEvent.change(dropdown, {
      target: { value: "22 Nov 2024 - 21 Dec 2024" },
    });
  });

  test("renders content correctly for Pending tab with list rendering", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve(mockPayrollConfig);
        }
        if (endpoint.includes("/hours/my-team-hours")) {
          return Promise.resolve(mockMyTeamHours);
        }
        return Promise.resolve({});
      }),
    });

    render(
      <Provider store={store}>
        <HoursApproval />
      </Provider>
    );
    const pendingTab = screen.getByText(/Pending/i);
    fireEvent.click(pendingTab);

    await waitFor(() => {
      expect(screen.getAllByText(/VISHNU YADAV/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/Cluster 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Logs/i)).toBeInTheDocument();
      expect(screen.getByText(/View/i)).toBeInTheDocument();
    });
    const viewTab = screen.getByText(/View/i);
    fireEvent.click(viewTab);
    await waitFor(() => {
      // main heading
      expect(
        screen.getByText("Approval Logs | VISHNU YADAV :")
      ).toBeInTheDocument();
      // title
      expect(screen.getByText("Version")).toBeInTheDocument();
      expect(screen.getByText("Action User")).toBeInTheDocument();
      expect(screen.getByText("Action User Email")).toBeInTheDocument();
      expect(screen.getByText("Action User Employee ID")).toBeInTheDocument();
      expect(screen.getByText("Comment")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Action At")).toBeInTheDocument();
      // data
      expect(screen.getByText("1999")).toBeInTheDocument();
      expect(screen.getByText("GERALD RAKESH MOHAN")).toBeInTheDocument();
      expect(
        screen.getByText("samruddha.gadnayakkk@decathlon.com")
      ).toBeInTheDocument();
      expect(screen.getByText("DSI000597kk")).toBeInTheDocument();
      expect(screen.getByText("Approved by Leader")).toBeInTheDocument();
      expect(screen.getByText("APPROVED Status")).toBeInTheDocument();
      expect(screen.getByText("04 Nov 2025, 05:31 PM")).toBeInTheDocument();
    });

    const closeTab = screen.getByTestId("drawer-close");
    fireEvent.click(closeTab);
    await waitFor(() => {
      expect(
        screen.queryByText("Approval Logs | VISHNU YADAV :")
      ).not.toBeInTheDocument();
    });
  });
  test("renders content correctly for Approved tab with list rendering", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve(mockPayrollConfig);
        }
        if (endpoint.includes("/hours/my-team-hours")) {
          return Promise.resolve(mockMyTeamHours);
        }
        return Promise.resolve({});
      }),
    });

    render(
      <Provider store={store}>
        <HoursApproval />
      </Provider>
    );

    const approvedTab = screen.getByText(/Approved/i);
    fireEvent.click(approvedTab);

    await waitFor(() => {
      expect(screen.getByText(/Prince Attri/i)).toBeInTheDocument();
      expect(screen.getByText(/Cluster 1/i)).toBeInTheDocument();
    });
  });

  test("renders and triggers approve all action when conditions are met", async () => {
    const mockPost = jest.fn().mockResolvedValue({
      success: true,
      message: "Approved successfully",
    });

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve(mockPayrollConfig);
        }
        if (endpoint.includes("/hours/my-team-hours")) {
          return Promise.resolve(mockMyTeamHours);
        }
        return Promise.resolve({});
      }),
      post: mockPost,
    });
    jest
      .useFakeTimers()
      .setSystemTime(new Date("2024-12-21T15:30:00").getTime());

    render(
      <Provider store={store}>
        <HoursApproval />
      </Provider>
    );

    const pendingTab = screen.getByText(/Pending/i);
    fireEvent.click(pendingTab);

    const approveAllButton = await screen.findByText(/Approve All/i);
    expect(approveAllButton).toBeInTheDocument();

    fireEvent.click(approveAllButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(expect.anything(), {
        data: expect.objectContaining({
          ids:
            mockMyTeamHours.finalisedWorkHoursList?.map((item) => item.id) ??
            [],
        }),
      });

      expect(mockAddToast).toHaveBeenCalledTimes(1);
      expect(mockAddToast).toHaveBeenCalledWith("Approved successfully", {
        appearance: "success",
      });
    });

    jest.useRealTimers();
  });
});
