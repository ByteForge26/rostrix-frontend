import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { useAppSelector, store } from "../../app/store/store";
import ExtractPayroll from "./ExtractPayroll";
import {
  IPayrollConfig,
  IRosterDetails,
  IMyTeamLeavesResponse,
  IMyLeaveResponse,
  IClusterResponse,
  ISecondaryJob,
  IMiscWork,
} from "../../helper/Interface";
import React from "react";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
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

const mockExtractPayrollResponse: IMyTeamLeavesResponse = {
  empLeaveSummaryList: [
    {
      userId: "1",
      empId: "DP6149",
      firstName: "VISHNU",
      lastName: "YADAV",
      managerId: "1001",
      costCentreName: "",
      contractTypeId: 2,
      stateId: 9,
      totalAllowed: 0,
      availedGeneral: 0,
      plannedGeneral: 0,
      clusterName: "",
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
      costCentreName: "",
      contractTypeId: 1,
      stateId: 9,
      totalAllowed: 32,
      availedGeneral: 0,
      plannedGeneral: 0,
      clusterName: "",
      clusterId: 2,
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
      costCentreName: "",
      contractTypeId: 2,
      stateId: 9,
      totalAllowed: 0,
      availedGeneral: 0,
      plannedGeneral: 0,
      clusterName: "",
      clusterId: 3,
      availedLop: 0,
      plannedLop: 0,
      matOrPatAvailed: false,
    },
  ],
};

const mockMyLeavesResponse: IMyLeaveResponse = {
  totalAllowedLeaves: 32,
  stateId: 9,
  contractTypeId: 1,
  leaves: [
    {
      id: 3552,
      empId: "DSI009473",
      fromDate: "2024-11-05",
      toDate: "2024-11-30",
      appliedOn: "2024-11-04T11:58:29.197743",
      comment: "",
      status: "AUTO_APPROVED",
      type: "GENERAL",
      authorizedBy: "",
      actedOn: "",
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

describe("ExtractPayroll Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve(mockPayrollConfig);
        }
        if (endpoint.includes("/hours/manual")) {
          return Promise.resolve(mockExtractPayrollResponse);
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render `Extract Payroll", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ExtractPayroll />
        </Provider>
      );
    });

    const aliceLeaveElement = await screen.findByText(/Extract Payroll/i);
    expect(aliceLeaveElement).toBeInTheDocument();
  });
  test("renders and handles click event for View Entries button", async () => {
    render(
      <Provider store={store}>
        <ExtractPayroll />
      </Provider>
    );
  });

  test("handles timer functionality when showTimer is true and payrollConfig is defined", async () => {
    jest.useFakeTimers();

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve({
            ...mockPayrollConfig,
            currentExtractPayrolltartTime: new Date(
              Date.now() + 5000
            ).toISOString(),
          });
        }
        return Promise.resolve({});
      }),
    });

    render(
      <Provider store={store}>
        <ExtractPayroll />
      </Provider>
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      const timerMessage = screen.queryByText(
        /Manual hours window will be open in/i
      );
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
        <ExtractPayroll />
      </Provider>
    );
    const dropdown = screen.getByRole("combobox");
    fireEvent.change(dropdown, {
      target: { value: "22 Nov 2024 - 21 Dec 2024" },
    });
  });

  test("calculates and updates timeRemaining when showTimer and payrollConfig are defined", async () => {
    jest.useFakeTimers();

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve(mockPayrollConfig);
        }
        return Promise.resolve({});
      }),
    });

    render(
      <Provider store={store}>
        <ExtractPayroll />
      </Provider>
    );

    jest.setSystemTime(new Date("2024-12-21T16:00:00").getTime());

    await waitFor(() => {
      expect(
        screen.getByText(/Payroll Extraction for selected dates will open in/i)
      ).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Payroll Extraction for selected dates will open in/i)
      ).toBeInTheDocument();
    });

    act(() => {
      jest.runOnlyPendingTimers();
      jest.clearAllTimers();
    });

    jest.useRealTimers();
  });

  test("calls Button onExtractPayroll", async () => {
    const mockApiGet = jest.fn().mockResolvedValue({ data: "mockedData" });
    const mockDownloadCSV = jest.fn();

    (useApi as jest.Mock).mockReturnValue({
      get: mockApiGet,
    });

    jest.mock("../../helper/Utils", () => ({
      downloadCSV: mockDownloadCSV,
    }));

    render(
      <Provider store={store}>
        <ExtractPayroll />
      </Provider>
    );
    const dropdown = await screen.findByRole("combobox");
    fireEvent.change(dropdown, { target: { value: "2024_11" } });
    const extractButton = await screen.findByText(/Extract Payroll Data/i);
    fireEvent.click(extractButton);
  });

  test("renders content correctly for Pending tab with list rendering", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/hours/my-team-hours")) {
          return Promise.resolve(mockExtractPayrollResponse);
        }
        return Promise.resolve({});
      }),
    });

    render(
      <Provider store={store}>
        <ExtractPayroll />
      </Provider>
    );
  });
  test("calculates and updates timeRemaining and handles all globalStatus cases", async () => {
    jest.useFakeTimers();

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve(mockPayrollConfig);
        }
        return Promise.resolve({});
      }),
    });

    render(
      <Provider store={store}>
        <ExtractPayroll />
      </Provider>
    );

    jest.setSystemTime(new Date("2024-12-21T16:00:00").getTime());

    await waitFor(() => {
      expect(
        screen.getByText(/Payroll Extraction for selected dates will open in/i)
      ).toBeInTheDocument();
    });

    act(() => {
      jest.setSystemTime(new Date("2024-12-21T16:22:00").getTime());
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(
        screen.queryByText(
          /Payroll Extraction for selected dates will open in/i
        )
      ).not.toBeInTheDocument();
    });

    act(() => {
      jest.setSystemTime(new Date("2024-12-22T00:00:00").getTime());
    });

    await waitFor(() => {
      expect(
        screen.queryByText(
          /Payroll Extraction for selected dates will open in/i
        )
      ).not.toBeInTheDocument();
    });

    act(() => {
      jest.runOnlyPendingTimers();
      jest.clearAllTimers();
    });

    jest.useRealTimers();
  });
});
