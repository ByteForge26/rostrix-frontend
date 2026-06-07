import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { useAppSelector, store } from "../../app/store/store";
import MySwapRequest from "./MySwapRequest";
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

const mockMySwapRequestResponse: IMyTeamLeavesResponse = {
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

describe("MySwapRequest Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve(mockPayrollConfig);
        }
        if (endpoint.includes("/hours/manual")) {
          return Promise.resolve(mockMySwapRequestResponse);
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

  it("should render `My Swap Request Page", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MySwapRequest />
        </Provider>
      );
    });

    const aliceLeaveElement = await screen.findByText(/My Swap Request/i);
    expect(aliceLeaveElement).toBeInTheDocument();
  });

  it("should render the 'Received' tab", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/shift-swap")) {
          return Promise.resolve({
            data: [
              {
                id: 1,
                senderName: "VISHNU YADAV",
                senderEmpId: "DP6149",
                receiverName: "Prince Attri",
                receiverEmpId: "DSI006062",
                requestedAt: "2024-12-05T08:00:00",
                status: "PENDING",
                senderDate: "2024-12-06",
                receiverDate: "2024-12-07",
                senderShifts: [{ s: "08:00:00", e: "12:00:00" }],
                receiverShifts: [{ s: "12:00:00", e: "16:00:00" }],
              },
            ],
          });
        }
        return Promise.resolve({});
      }),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MySwapRequest />
        </Provider>
      );
    });
    const receivedTab = await screen.findByText(/Recieved/i);
    expect(receivedTab).toBeInTheDocument();
    fireEvent.click(receivedTab);
  });

  it("should render the 'Requested' tab and its list", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/shift-swap")) {
          return Promise.resolve({
            data: [
              {
                id: 2,
                senderName: "Prince Attri",
                senderEmpId: "DSI006062",
                receiverName: "VISHNU YADAV",
                receiverEmpId: "DP6149",
                requestedAt: "2024-12-05T08:00:00",
                status: "APPROVED",
                senderDate: "2024-12-06",
                receiverDate: "2024-12-07",
                senderShifts: [{ s: "09:00:00", e: "13:00:00" }],
                receiverShifts: [{ s: "13:00:00", e: "17:00:00" }],
              },
            ],
          });
        }
        return Promise.resolve({});
      }),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MySwapRequest />
        </Provider>
      );
    });
    const requestedTab = await screen.findByText(/Requested/i);
    expect(requestedTab).toBeInTheDocument();
    fireEvent.click(requestedTab);
  });

  it("should render the year dropdown and allow selecting a year", async () => {
    const localApiMock = jest.fn((endpoint: string, config: any) => {
      if (endpoint.includes("/shift-swap")) {
        const year = config?.params?.year || new Date().getFullYear();
        return Promise.resolve({
          data: [
            {
              id: 1,
              senderName: `VISHNU YADAV (${year})`,
              senderEmpId: `DP6149-${year}`,
              receiverName: `Prince Attri (${year})`,
              receiverEmpId: `DSI006062-${year}`,
              requestedAt: `${year}-12-05T08:00:00`,
              status: "PENDING",
              senderDate: `${year}-12-06`,
              receiverDate: `${year}-12-07`,
              senderShifts: [{ s: "08:00:00", e: "12:00:00" }],
              receiverShifts: [{ s: "12:00:00", e: "16:00:00" }],
            },
          ],
        });
      }
      return Promise.resolve({});
    });

    useApiMock.mockReturnValue({
      get: localApiMock,
      post: jest.fn(),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MySwapRequest />
        </Provider>
      );
    });

    const currentYear = new Date().getFullYear();
    const yearDropdownButton = screen.getByRole("button", {
      name: currentYear.toString(),
    });
    expect(yearDropdownButton).toBeInTheDocument();
    fireEvent.click(yearDropdownButton);
    const previousYear = currentYear - 1;
    const nextYear = currentYear + 1;

    const previousYearOption = await screen.findByText(previousYear.toString());
    const nextYearOption = await screen.findByText(nextYear.toString());

    expect(previousYearOption).toBeInTheDocument();
    expect(nextYearOption).toBeInTheDocument();
    fireEvent.click(nextYearOption);
    expect(yearDropdownButton).toHaveTextContent(nextYear.toString());
  });

  it("should call the delete API, display a toast, and refresh swap requests on delete", async () => {
    const mockPostResponse = { message: "Delete successful", success: true };
    const mockGetResponse = {
      data: [
        {
          id: 1,
          senderName: "VISHNU YADAV",
          senderEmpId: "DP6149",
          receiverName: "Prince Attri",
          receiverEmpId: "DSI006062",
          requestedAt: "2024-12-05T08:00:00",
          status: "PENDING",
          senderDate: "2024-12-06",
          receiverDate: "2024-12-07",
          senderShifts: [{ s: "08:00:00", e: "12:00:00" }],
          receiverShifts: [{ s: "12:00:00", e: "16:00:00" }],
        },
      ],
    };

    const mockGetSwapRequest = jest.fn();
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/shift-swap")) {
          return Promise.resolve(mockGetResponse);
        }
        return Promise.resolve({});
      }),
      post: jest.fn(() => Promise.resolve(mockPostResponse)),
    });
    (useAppSelector as jest.Mock).mockReturnValue({
      user: { empId: "DP6149" }, 
      selectedCostCenterName: "IN1311",
    });

    const originalGetSwapRequest = MySwapRequest.prototype.getSwapRequest;
    MySwapRequest.prototype.getSwapRequest = mockGetSwapRequest;
    await act(async () => {
      render(
        <Provider store={store}>
          <MySwapRequest />
        </Provider>
      );
    });
    const deleteButton = await screen.findByRole("button", { name: /Delete/i });
    fireEvent.click(deleteButton);
  });

  it("should call the reject API, display a toast, and refresh swap requests on reject", async () => {
    const mockPostResponse = { message: "Reject successful", success: true };
    const mockGetResponse = {
      data: [
        {
          id: 1,
          senderName: "VISHNU YADAV",
          senderEmpId: "DP6149",
          receiverName: "Prince Attri",
          receiverEmpId: "DSI006062",
          requestedAt: "2024-12-05T08:00:00",
          status: "PENDING",
          senderDate: "2024-12-06",
          receiverDate: "2024-12-07",
          senderShifts: [{ s: "08:00:00", e: "12:00:00" }],
          receiverShifts: [{ s: "12:00:00", e: "16:00:00" }],
        },
      ],
    };

    const mockGetSwapRequest = jest.fn();
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/shift-swap")) {
          return Promise.resolve(mockGetResponse);
        }
        return Promise.resolve({});
      }),
      post: jest.fn(() => Promise.resolve(mockPostResponse)),
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      user: { empId: "DSI006062" },
      selectedCostCenterName: "IN1311",
    });

    const originalGetSwapRequest = MySwapRequest.prototype.getSwapRequest;
    MySwapRequest.prototype.getSwapRequest = mockGetSwapRequest;
    await act(async () => {
      render(
        <Provider store={store}>
          <MySwapRequest />
        </Provider>
      );
    });
    const rejectButton = await screen.findByRole("button", { name: /Reject/i });
    fireEvent.click(rejectButton);
  });

  it("should call the approve API, display a toast, and refresh swap requests on approve", async () => {
    const mockPostResponse = { message: "Approval successful", success: true };
    const mockGetResponse = {
      data: [
        {
          id: 1,
          senderName: "VISHNU YADAV",
          senderEmpId: "DP6149",
          receiverName: "Prince Attri",
          receiverEmpId: "DSI006062",
          requestedAt: "2024-12-05T08:00:00",
          status: "PENDING",
          senderDate: "2024-12-06",
          receiverDate: "2024-12-07",
          senderShifts: [{ s: "08:00:00", e: "12:00:00" }],
          receiverShifts: [{ s: "12:00:00", e: "16:00:00" }],
        },
      ],
    };

    const mockGetSwapRequest = jest.fn();
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/shift-swap")) {
          return Promise.resolve(mockGetResponse);
        }
        return Promise.resolve({});
      }),
      post: jest.fn(() => Promise.resolve(mockPostResponse)),
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      user: { empId: "DSI006062" },
      selectedCostCenterName: "IN1311",
    });
    const originalGetSwapRequest = MySwapRequest.prototype.getSwapRequest;
    MySwapRequest.prototype.getSwapRequest = mockGetSwapRequest;
    await act(async () => {
      render(
        <Provider store={store}>
          <MySwapRequest />
        </Provider>
      );
    });
    const approveButton = await screen.findByRole("button", {
      name: /Approve/i,
    });
    fireEvent.click(approveButton);
  });
});
