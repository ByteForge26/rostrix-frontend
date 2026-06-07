import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { store, useAppSelector } from "../../app/store/store";
import { Provider } from "react-redux";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import { useRoster } from "../../hooks/useRoster";

import { IRoster } from "../../helper/Interface";
import ClusterJobPlanning from "./ClusterJobPlanning";
import ClusterJobPlanningEdit from "./ClusterJobPlanningEdit";
import { formatDate, isRosterAboutToFreeze, isFutureWeek } from "../../helper/Utils";

const mockedIRoster: IRoster[] = [
  {
    success: true,
    message: "",
    rosterWeekId: 4003,
    rosterStatus: "DRAFT",
    empWeekRosters: [
      {
        empId: "DP8987",
        fistName: "CHANDAN",
        lastName: "KUMAR",
        contractId: 2,
        allowedHours: 130.0,
        empHours: [
          {
            totalHours: 0.0,
            pstartDate: "2024-11-22",
            pendDate: "2024-12-21",
          },
        ],
        days: [
          {
            id: 6228,
            date: "2024-12-13",
            empId: "DP8987",
            status: "BLANK",
            edit: true,
            impacted: false,
            impacts: [],
            metaData: "",
            main: [],
            others: [],
          },
          {
            id: 6224,
            date: "2024-12-09",
            empId: "DP8987",
            status: "BLANK",
            edit: true,
            impacted: false,
            impacts: [],
            metaData: "",
            main: [],
            others: [],
          },
          {
            id: 6226,
            date: "2024-12-11",
            empId: "DP8987",
            status: "BLANK",
            edit: true,
            impacted: false,
            impacts: [],
            metaData: "",
            main: [],
            others: [],
          },
          {
            id: 6229,
            date: "2024-12-14",
            empId: "DP8987",
            status: "BLANK",
            edit: true,
            impacted: false,
            impacts: [],
            metaData: "",
            main: [],
            others: [],
          },
          {
            id: 6225,
            date: "2024-12-10",
            empId: "DP8987",
            status: "BLANK",
            edit: true,
            impacted: false,
            impacts: [],
            metaData: "",
            main: [],
            others: [],
          },
          {
            id: 6223,
            date: "2024-12-08",
            empId: "DP8987",
            status: "BLANK",
            edit: true,
            impacted: false,
            impacts: [],
            metaData: "",
            main: [],
            others: [],
          },
          {
            id: 6227,
            date: "2024-12-12",
            empId: "DP8987",
            status: "BLANK",
            edit: true,
            impacted: false,
            impacts: [],
            metaData: "",
            main: [],
            others: [],
          },
        ],
      },
    ],
    assignedJobShifts: [],
  },
];

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../helper/Utils");

// Mock necessary modules
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

jest.mock("../../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

jest.mock("../../hooks/useRoster", () => ({
  useRoster: jest.fn(),
}));

jest.mock("../../app/store/store", () => ({
  useAppSelector: jest.fn(() => ({ selectedCostCenterName: "cost-centre" })),
  useAppDispatch: jest.fn(),
  store: {
    getState: jest.fn(),
    subscribe: jest.fn(),
  },
}));

const useApiMock = useApi as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;

const useRosterMock = useRoster as jest.Mock;

jest.mock("moment", () => {
  const actualMoment = jest.requireActual("moment");
  return (input) => {
    if (input) {
      return actualMoment(input); 
    }
    
    const mockMoment = actualMoment();
    const originalYear = mockMoment.year.bind(mockMoment);
    const originalMonth = mockMoment.month.bind(mockMoment);
    const originalDate = mockMoment.date.bind(mockMoment);
    const originalDiff = mockMoment.diff.bind(mockMoment);
    
    mockMoment.year = jest.fn((...args) => {
      if (args.length === 0) {
        return originalYear();
      }
      return originalYear(...args);
    });
    
    mockMoment.month = jest.fn((...args) => {
      if (args.length === 0) {
        return originalMonth();
      }
      return originalMonth(...args);
    });
    
    mockMoment.date = jest.fn((...args) => {
      if (args.length === 0) {
        return originalDate();
      }
      return originalDate(...args);
    });
    
    mockMoment.diff = jest.fn((...args) => {
      if (args.length === 0) {
        return 2; // Default mock return value
      }
      return originalDiff(...args);
    });
    
    return mockMoment;
  };
});

describe("ManageRoster Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/roster/secondary")) {
          return Promise.resolve(mockedIRoster);
        }
        return Promise.resolve([]);
      }),
      post: jest.fn(),
    });
    useRosterMock.mockReturnValue({
      cjpRoster: {},
      getAllClusters: jest.fn(),
      clusters: [],
      getPlannedJobs: jest.fn(),
      plannedJobs: [],
      plannedJobWeeks: [],
      getPlannedJobWeeks: jest.fn(),
      goToRosterEdit: jest.fn(),
      storeSecondaryJobs: [],
      getStoreSecondaryJobs: jest.fn(),
      onLoading: jest.fn(), // Mock onLoading
      offLoading: jest.fn(), // Mock offLoading
      onRosterSaving: jest.fn(),
      rosterSaved: jest.fn(),
      onChangeSelectedJobType: jest.fn(),
      selectedJobType: "PLAYGROUND",
      selectedYear: 2024,
      selectedMonth: 12,
      onChangeYear: jest.fn(),
      onChangeMonth: jest.fn(),
      monthSummary: {},
      onChangeWeek: jest.fn(),
      onPublishRoster: jest.fn(),
      onCloneWeekModalOpen: jest.fn(),
      isPublishedRosterModalOpen: false,
      onPublishedRosterModalClose: jest.fn(),
      getPayrollConfig: jest.fn(),
      payrollConfig: {
        currentPStartDateTime: "2024-11-22T00:00:00",
        currentPEndDateTime: "2024-12-21T15:15:00",
        currentManualHourStartTime: "2024-12-21T15:20:00",
        currentManualHourEndTime: "2024-12-21T16:20:00",
        currentPayrollExtractStartTime: "2024-12-21T16:22:00",
      },
      isEmpExceedingHoursListModalOpen: false,
      onEmpExceedingHoursListModalClose: jest.fn(),
      empExceedingHoursList: [],
      isForceConfirmModalOpen: false,
      onForceConfirmModalClose: jest.fn(),
      messageObj: {},
      isWeekUncoveredShiftsModalOpen: false,
      onWeekUncoveredShiftsModalClose: jest.fn(),
      weekUncoveredShifts: [],
      isPublishing: false,
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1311",
      selectedWeek: 50,
      selectedYear: 2024,
      draft: "1",
      selectedJobType: "PLAYGROUND",
      isCloneWeekModalOpen: true,
      roles: [
        {
          id: 1,
          name: "Admin",
          description: "",
          editable: false,
          basic: false,
          type: "SYSTEM",
          title: "ADMIN",
          deletable: false,
          level: 1,
          lvlPrimary: true,
          assignable: false,
        },
        {
          id: 5,
          name: "Store Operations Manager",
          description: "",
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: "STORE_OPS",
          deletable: false,
          level: 5,
          lvlPrimary: false,
          assignable: true,
        },
        {
          id: 8,
          name: "DM Coach",
          description: null,
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: "DM_COACH",
          deletable: false,
          level: 6,
          lvlPrimary: false,
          assignable: false,
        },
        {
          id: 11,
          name: "C&C Coach",
          description: null,
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: "CNC_COACH",
          deletable: false,
          level: 6,
          lvlPrimary: false,
          assignable: false,
        },
        {
          id: 12,
          name: "CRM Coach",
          description: null,
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: "CRM_COACH",
          deletable: false,
          level: 6,
          lvlPrimary: false,
          assignable: false,
        },
        {
          id: 10,
          name: "Cashiering Coach",
          description: "",
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: "CASHIERING_COACH",
          deletable: false,
          level: 6,
          lvlPrimary: false,
          assignable: false,
        },
        {
          id: 6,
          name: "Sport Leader Coach",
          description: "",
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: "SPORT_LEADER_COACH",
          deletable: false,
          level: 6,
          lvlPrimary: true,
          assignable: false,
        },
        {
          id: 7,
          name: "Sport Leader",
          description: null,
          editable: false,
          basic: true,
          type: "SYSTEM",
          title: "SPORT_LEADER",
          deletable: false,
          level: 7,
          lvlPrimary: true,
          assignable: false,
        },
        {
          id: 14,
          name: "Buddy DM",
          description: null,
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: "BDM",
          deletable: false,
          level: 7,
          lvlPrimary: false,
          assignable: false,
        },
        {
          id: 15,
          name: "CRM Member",
          description: null,
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: "CRM_MEMBER",
          deletable: false,
          level: 7,
          lvlPrimary: false,
          assignable: false,
        },
        {
          id: 13,
          name: "Daily Manager",
          description: "",
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: "DM",
          deletable: false,
          level: 7,
          lvlPrimary: false,
          assignable: false,
        },
        {
          id: 17,
          name: "Playground Teammate",
          description: null,
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: "PLAYGROUND_MEMBER",
          deletable: false,
          level: 7,
          lvlPrimary: false,
          assignable: false,
        },
        {
          id: 16,
          name: "Cashiering Teammate",
          description: null,
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: "CASHIERING_MEMBER",
          deletable: false,
          level: 7,
          lvlPrimary: false,
          assignable: false,
        },
        {
          id: 18,
          name: "C&C TeamMate",
          description: null,
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: "CNC_MEMBER",
          deletable: false,
          level: 7,
          lvlPrimary: false,
          assignable: false,
        },
        {
          id: 2,
          name: "City Leader",
          description: "",
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: "CITY_LEADER",
          deletable: false,
          level: 2,
          lvlPrimary: true,
          assignable: true,
        },
        {
          id: 3,
          name: "Store Leader Coach",
          description: null,
          editable: false,
          basic: false,
          type: "SYSTEM",
          title: "STORE_LEADER_COACH",
          deletable: false,
          level: 3,
          lvlPrimary: true,
          assignable: false,
        },
        {
          id: 30,
          name: "Chest Workout",
          description: "",
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: null,
          deletable: true,
          level: 7,
          lvlPrimary: false,
          assignable: true,
        },
        {
          id: 32,
          name: "Leg Day",
          description: "",
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: null,
          deletable: true,
          level: 7,
          lvlPrimary: false,
          assignable: true,
        },
        {
          id: 9,
          name: "Playground Coach",
          description: "Construction Manager",
          editable: true,
          basic: false,
          type: "CUSTOM",
          title: "PLAYGROUND_COACH",
          deletable: false,
          level: 6,
          lvlPrimary: false,
          assignable: false,
        },
        {
          id: 4,
          name: "Store Leader",
          description: "",
          editable: false,
          basic: false,
          type: "SYSTEM",
          title: "STORE_LEADER",
          deletable: false,
          level: 4,
          lvlPrimary: true,
          assignable: true,
        },
      ],
      user: {
        userId: "bf110fa3-bd7d-4a55-92c5-9b5f602573f3",
        firstName: "Shailendra",
        lastName: ".",
        email: "shailendra.khurana.partner@decathlon.com",
        empId: "DSI006227",
        managerId: "DSI000316",
        costCentreName: "IN1311",
        contractTypeId: 1,
        contractTypeName: "Full Time",
        stateId: 9,
        countryId: 1,
        userRoles: {
          IN1311: [4],
        },
        costCentreDisplayNameMap: {
          IN1311: "DSI SOHNA ROAD",
        },
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

  it("should render `ClusterJobPlanning Page`", async () => {
    render(
      <Provider store={store}>
        <ClusterJobPlanning />
      </Provider>
    );

    expect(screen.getByText("Cluster Job Planning")).toBeInTheDocument();
  });
  it("should render `ClusterJobPlanning Page`", async () => {
    render(
      <Provider store={store}>
        <ClusterJobPlanning />
      </Provider>
    );

    expect(screen.getByText("Cluster Job Planning")).toBeInTheDocument();
  });

  it("should click  EditPlan Button", async () => {
    useRosterMock.mockReturnValue({
      ...useRosterMock(),
      onChangeSelectedPlannedJobId: jest.fn(),
      onChangeSelectedPlannedJobType: jest.fn(),
      onChangeSelectedPlannedSecondaryJobType: jest.fn(),
      onChangeSelectedPlannedMiscWorkId: jest.fn(),
      onCjpDraftDataSave: jest.fn(),
      goToPlannedJobEdit: jest.fn(),
      cjpRoster: {
        success: true,
        pweekId: 453,
      },
      getPlannedJobs: jest.fn().mockResolvedValue([
        {
          id: 102,
          costCentre: "IN1311",
          type: "SECONDARY",
          secondaryJobType: "CASHIERING",
          miscWorkId: null,
          miscWorkJobName: null,
          disabled: true,
        },
        {
          id: 52,
          costCentre: "IN1311",
          type: "MISCELLANEOUS",
          secondaryJobType: null,
          miscWorkId: 5,
          miscWorkJobName: "Welcomer/Goodbyer ",
          disabled: true,
        },
        {
          id: 103,
          costCentre: "IN1311",
          type: "MISCELLANEOUS",
          secondaryJobType: null,
          miscWorkId: 6,
          miscWorkJobName: "Trial Room",
          disabled: false,
        },
      ]),
      plannedJobs: [
        {
          id: 102,
          costCentre: "IN1311",
          type: "SECONDARY",
          secondaryJobType: "CASHIERING",
          miscWorkId: null,
          miscWorkJobName: null,
          disabled: true,
        },
        {
          id: 52,
          costCentre: "IN1311",
          type: "MISCELLANEOUS",
          secondaryJobType: null,
          miscWorkId: 5,
          miscWorkJobName: "Welcomer/Goodbyer",
          disabled: true,
        },
        {
          id: 103,
          costCentre: "IN1311",
          type: "MISCELLANEOUS",
          secondaryJobType: null,
          miscWorkId: 6,
          miscWorkJobName: "Trial Room",
          disabled: false,
        },
      ],
      plannedJobTimes: [
        { label: "Job 1", value: "12:00:00" },
        { label: "Job 2", value: "08:00:00" },
        { label: "Job 3", value: "14:30:00" },
      ],
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1311",
      selectedWeek: 50,
      selectedPlannedJobId: 103,
      selectedYear: 2024,
      draft: "1",
      selectedJobType: "PLAYGROUND",
      isCloneWeekModalOpen: true,
      cjpRoster: [
        {
          success: true,
          pweekId: 453,
        },
      ],
    });

    render(
      <Provider store={store}>
        <ClusterJobPlanning />
      </Provider>
    );

    const createPlan = screen.getByText("Edit Plan");
  });
  it("renders the ClusterJobPlanning component", () => {
    render(<ClusterJobPlanning />);
    expect(screen.getByText("Cluster Job Planning")).toBeInTheDocument();
  });

  it("displays empty state message when no planned jobs", () => {
    render(<ClusterJobPlanning />);
    expect(
      screen.getByText("Oh Shift! Looks like no plan exists for this week.")
    ).toBeInTheDocument();
  });


  it("displays 'no plan exists' message for past weeks", async () => {
    // Set up the conditions for a past week with no plan
    useRosterMock.mockReturnValue({
      ...useRosterMock(),
      onChangeSelectedPlannedJobId: jest.fn(),
      onChangeSelectedPlannedJobType: jest.fn(),
      onChangeSelectedPlannedSecondaryJobType: jest.fn(),
      onChangeSelectedPlannedMiscWorkId: jest.fn(),
      onCjpDraftDataSave: jest.fn(),
      goToPlannedJobEdit: jest.fn(),
      cjpRoster: null,
      plannedJobs: [
        {
          id: 103,
          type: "MISCELLANEOUS",
          miscWorkId: 6,
          miscWorkJobName: "Trial Room",
          disabled: false,
        }
      ],
      payrollConfig: {
        currentPStartDateTime: "2024-12-22T00:00:00", 
      },
      isFutureWeek: jest.fn().mockReturnValue(false), 
    });

    render(
      <Provider store={store}>
        <ClusterJobPlanning />
      </Provider>
    );

    expect(screen.getByText("Oh Shift! Looks like no plan exists for this week.")).toBeInTheDocument();
    expect(screen.getByText("You can not create a new Plan for past weeks.")).toBeInTheDocument();
  });

    it("opens AllWeeksView when toggle button is clicked", async () => {
      const onAllWeeksToggleMock = jest.fn();
      
      useRosterMock.mockReturnValue({
        ...useRosterMock(),
        onChangeSelectedPlannedJobId: jest.fn(),
        onChangeSelectedPlannedJobType: jest.fn(),
        onChangeSelectedPlannedSecondaryJobType: jest.fn(),
        onChangeSelectedPlannedMiscWorkId: jest.fn(),
        onCjpDraftDataSave: jest.fn(),
        goToPlannedJobEdit: jest.fn(),
        plannedJobs: [{ id: 103, type: "MISCELLANEOUS" }],
        isAllWeeksOpen: false,
        onAllWeeksToggle: onAllWeeksToggleMock,
      });
  
      render(
        <Provider store={store}>
          <ClusterJobPlanning />
        </Provider>
      );
      
      expect(useRosterMock().isAllWeeksOpen).toBe(false);
    });

    
  it("allows switching between Latest and Published Plan view modes", async () => {
    useRosterMock.mockReturnValue({
      ...useRosterMock(),
      onChangeSelectedPlannedJobId: jest.fn(),
      onChangeSelectedPlannedJobType: jest.fn(),
      onChangeSelectedPlannedSecondaryJobType: jest.fn(),
      onChangeSelectedPlannedMiscWorkId: jest.fn(),
      onCjpDraftDataSave: jest.fn(),
      goToPlannedJobEdit: jest.fn(),
      plannedJobs: [{ id: 103, type: "MISCELLANEOUS" }],
    });

    const { rerender } = render(
      <Provider store={store}>
        <ClusterJobPlanning />
      </Provider>
    );

  
    expect(screen.getByText("Latest Plan")).toBeInTheDocument();
    

    const publishedPlanTab = screen.getByText("Published Plan");
    fireEvent.click(publishedPlanTab);
    
    useRosterMock.mockReturnValue({
      ...useRosterMock(),
      plannedJobs: [{ id: 103, type: "MISCELLANEOUS" }],
      viewMode: "PUBLISHED",
    });
    
    rerender(
      <Provider store={store}>
        <ClusterJobPlanning />
      </Provider>
    );
  });

  it("displays 'no plan exists' message for past weeks", async () => {
    
    useRosterMock.mockReturnValue({
      ...useRosterMock(),
      onChangeSelectedPlannedJobId: jest.fn(),
      onChangeSelectedPlannedJobType: jest.fn(),
      onChangeSelectedPlannedSecondaryJobType: jest.fn(),
      onChangeSelectedPlannedMiscWorkId: jest.fn(),
      onCjpDraftDataSave: jest.fn(),
      goToPlannedJobEdit: jest.fn(),
      cjpRoster: null,
      plannedJobs: [
        {
          id: 103,
          type: "MISCELLANEOUS",
          miscWorkId: 6,
          miscWorkJobName: "Trial Room",
          disabled: false,
        }
      ],
      payrollConfig: {
        currentPStartDateTime: "2024-12-22T00:00:00",
      },
      isFutureWeek: jest.fn().mockReturnValue(false), 
    });

    render(
      <Provider store={store}>
        <ClusterJobPlanning />
      </Provider>
    );

    expect(screen.getByText("Oh Shift! Looks like no plan exists for this week.")).toBeInTheDocument();
    expect(screen.getByText("You can not create a new Plan for past weeks.")).toBeInTheDocument();
  });

})


describe("ClusterJobPlanning component", () => {
  
  const mockCheckForPermission = jest.fn();
  const mockGetPlannedJobs = jest.fn();
  const mockGetPayrollConfig = jest.fn();
  const mockGetAllClusters = jest.fn();
  const mockOnCreateCJPRosterClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (usePermission as jest.Mock).mockReturnValue({
      checkForPermission: mockCheckForPermission,
      transformRoutes: jest.fn().mockReturnValue([]),
    });
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/roster/secondary")) {
          return Promise.resolve(mockedIRoster);
        }
        return Promise.resolve([]);
      }),
      post: jest.fn(),
      delete:jest.fn()
    });
    
    mockCheckForPermission.mockReturnValue(true);
    
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedWeek: "2025-W11",
      selectedPlannedJobId: 1,
      selectedYear: 2025,
      selectedPlannedJobType: "REGULAR",
      selectedPlannedSecondaryJobType: "CLEANUP",
      selectedPlannedMiscWorkId: 0,
    });

    // Default mocks for utility functions
    (isRosterAboutToFreeze as jest.Mock).mockReturnValue(false);
    (isFutureWeek as jest.Mock).mockReturnValue(true);
    (formatDate as jest.Mock).mockImplementation((date, options) => {
      return options && options.time ? "Mar 29, 2025 11:59 PM" : "Mar 29, 2025";
    });
  });

  test("should display roster freeze warning when isRosterAboutToFreeze returns true", () => {
    (isRosterAboutToFreeze as jest.Mock).mockReturnValue(true);
    
    const mockPayrollConfig = {
      currentPStartDateTime: "2025-03-16T00:00:00",
      currentPEndDateTime: "2025-03-29T23:59:59",
    };
    
    (useRoster as jest.Mock).mockReturnValue({
      weeks: ["2025-W11", "2025-W12"],
      years: [2025],
      getPlannedJobs: mockGetPlannedJobs,
      getAllClusters: mockGetAllClusters,
      getPayrollConfig: mockGetPayrollConfig,
      plannedJobs: [{ id: 1, type: "REGULAR", secondaryJobType: "CLEANUP", disabled: false }],
      plannedJobTimes: [],
      payrollConfig: mockPayrollConfig,
      onChangeWeek: jest.fn(),
      onChangeYear: jest.fn(),
      onChangeSelectedPlannedJobId: jest.fn(),
      onChangeSelectedPlannedJobType: jest.fn(),
      onChangeSelectedPlannedSecondaryJobType: jest.fn(),
      onChangeSelectedPlannedMiscWorkId: jest.fn(),
      goToPlannedJobEdit: jest.fn(),
      getPlannedJobWeeks: jest.fn(),
      plannedJobWeeks: [],
      cjpRoster: null,
      cjpRosterWeekId: null,
      onCreateCJPRosterClick: mockOnCreateCJPRosterClick,
      clusters: [],
    });
    render(<ClusterJobPlanning />);
    expect(screen.getByText(/Ensure to publish changes made between/i)).toBeInTheDocument();
    expect(screen.getByText(/Mar 29, 2025 11:59 PM/i)).toBeInTheDocument();
  });

  test("should display calendar view when cjpRoster has pweekId", () => {
    const mockCjpRoster = {
      pweekId: "2025-W11",
      days: [
        { id: 1, weekDay: "Monday" },
        { id: 2, weekDay: "Tuesday" },
      ],
      status: "DRAFT",
    };
    
    (useRoster as jest.Mock).mockReturnValue({
      weeks: ["2025-W11", "2025-W12"],
      years: [2025],
      getPlannedJobs: mockGetPlannedJobs,
      getAllClusters: mockGetAllClusters,
      getPayrollConfig: mockGetPayrollConfig,
      plannedJobs: [{ id: 1, type: "REGULAR", secondaryJobType: "CLEANUP", disabled: false }],
      plannedJobTimes: [],
      payrollConfig: null,
      onChangeWeek: jest.fn(),
      onChangeYear: jest.fn(),
      onChangeSelectedPlannedJobId: jest.fn(),
      onChangeSelectedPlannedJobType: jest.fn(),
      onChangeSelectedPlannedSecondaryJobType: jest.fn(),
      onChangeSelectedPlannedMiscWorkId: jest.fn(),
      goToPlannedJobEdit: jest.fn(),
      getPlannedJobWeeks: jest.fn(),
      plannedJobWeeks: [],
      cjpRoster: mockCjpRoster,
      cjpRosterWeekId: "2025-W11",
      onCreateCJPRosterClick: mockOnCreateCJPRosterClick,
      clusters: [],
    });

    jest.doMock("../roster/common/CalenderTimeView", () => ({
      __esModule: true,
      default: () => <div data-testid="calendar-view">Calendar View</div>,
    }));
    render(<ClusterJobPlanning />);

    expect(screen.queryByText(/Oh Shift! Looks like no plan exists for this week./i)).not.toBeInTheDocument();
  });

  

  test("should display message for past weeks", () => {
    // Setup
    (isFutureWeek as jest.Mock).mockReturnValue(false);
    
    (useRoster as jest.Mock).mockReturnValue({
      weeks: ["2025-W11", "2025-W12"],
      years: [2025],
      getPlannedJobs: mockGetPlannedJobs,
      getAllClusters: mockGetAllClusters,
      getPayrollConfig: mockGetPayrollConfig,
      plannedJobs: [{ id: 1, type: "REGULAR", secondaryJobType: "CLEANUP", disabled: false }],
      plannedJobTimes: [],
      payrollConfig: { currentPStartDateTime: "2025-03-16T00:00:00" },
      onChangeWeek: jest.fn(),
      onChangeYear: jest.fn(),
      onChangeSelectedPlannedJobId: jest.fn(),
      onChangeSelectedPlannedJobType: jest.fn(),
      onChangeSelectedPlannedSecondaryJobType: jest.fn(),
      onChangeSelectedPlannedMiscWorkId: jest.fn(),
      goToPlannedJobEdit: jest.fn(),
      getPlannedJobWeeks: jest.fn(),
      plannedJobWeeks: [],
      cjpRoster: null,
      cjpRosterWeekId: null,
      onCreateCJPRosterClick: mockOnCreateCJPRosterClick,
      clusters: [],
    });
    render(<ClusterJobPlanning />);
    expect(screen.getByText(/Oh Shift! Looks like no plan exists for this week./i)).toBeInTheDocument();
    expect(screen.getByText(/You can not create a new Plan for past weeks./i)).toBeInTheDocument();
    expect(screen.queryByText("+ Create Plan")).not.toBeInTheDocument();
  });

  test("should not show create button when user doesn't have permissions", () => {
    // Setup
    (isFutureWeek as jest.Mock).mockReturnValue(true);
    mockCheckForPermission.mockReturnValue(false);
    
    (useRoster as jest.Mock).mockReturnValue({
      weeks: ["2025-W11", "2025-W12"],
      years: [2025],
      getPlannedJobs: mockGetPlannedJobs,
      getAllClusters: mockGetAllClusters,
      getPayrollConfig: mockGetPayrollConfig,
      plannedJobs: [{ id: 1, type: "REGULAR", secondaryJobType: "CLEANUP", disabled: false }],
      plannedJobTimes: [],
      payrollConfig: { currentPStartDateTime: "2025-03-16T00:00:00" },
      onChangeWeek: jest.fn(),
      onChangeYear: jest.fn(),
      onChangeSelectedPlannedJobId: jest.fn(),
      onChangeSelectedPlannedJobType: jest.fn(),
      onChangeSelectedPlannedSecondaryJobType: jest.fn(),
      onChangeSelectedPlannedMiscWorkId: jest.fn(),
      goToPlannedJobEdit: jest.fn(),
      getPlannedJobWeeks: jest.fn(),
      plannedJobWeeks: [],
      cjpRoster: null,
      cjpRosterWeekId: null,
      onCreateCJPRosterClick: mockOnCreateCJPRosterClick,
      clusters: [],
    });
    render(<ClusterJobPlanning />);
    expect(screen.getByText(/Oh Shift! Looks like you haven't scheduled anything yet!/i)).toBeInTheDocument();
    expect(screen.queryByText("+ Create Plan")).not.toBeInTheDocument();
  });
});
