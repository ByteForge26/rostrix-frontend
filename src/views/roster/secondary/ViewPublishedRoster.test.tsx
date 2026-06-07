import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { store, useAppSelector } from "../../../app/store/store";

import { Provider } from "react-redux";
import { useApi } from "../../../hooks/useApi";
import { usePermission } from "../../../hooks/usePermission";
import AppNoData from "../../../components/AppNoData";
import { SECONDARY_JOBS_CONFIG } from "../../../helper/Constant";
import ViewPublishedRoster from "./ViewPublishedRoster";
import { useRoster } from "../../../hooks/useRoster";

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

jest.mock("../../../hooks/useApi", () => ({
  useApi: jest.fn(),
}));

jest.mock("../../../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

jest.mock("../../../hooks/useRoster", () => ({
  useRoster: jest.fn(),
}));

jest.mock("../../../app/store/store", () => ({
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
  return (input: any) => {
    if (input) {
      return actualMoment(input);
    }
    return {
      year: jest.fn().mockReturnValue(2024),
      month: jest.fn().mockReturnValue(12),
      date: jest.fn().mockReturnValue(22),
      diff: jest.fn().mockReturnValue(2),
    };
  };
});

describe("PublishRoster Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    useApiMock.mockReturnValue({
      get: jest.fn(),
      post: jest.fn(),
    });
    useRosterMock.mockReturnValue({
      goToRosterEdit: jest.fn(),
      storeSecondaryJobs: [],
      getStoreSecondaryJobs: jest.fn(),
      onLoading: jest.fn(),
      offLoading: jest.fn(),
      onChangeSelectedJobType: jest.fn(),
      selectedJobType: "job-type-1",
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
      payrollConfig: {},
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
      onChangeSelectedDay: jest.fn(),
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1311",
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

  it("should render `PublishRoster Page`", async () => {
    render(
      <Provider store={store}>
        <ViewPublishedRoster />
      </Provider>
    );

    expect(
      screen.getByText("Secondary | View Published Roster")
    ).toBeInTheDocument();
  });

  it("should check if SecondaryJobs is zero the it show AppNoData Component", async () => {
    render(
      <Provider store={store}>
        <ViewPublishedRoster />
      </Provider>
    );

    expect(
      screen.getByText("Secondary | View Published Roster")
    ).toBeInTheDocument();

    <AppNoData />;
  });

  it("should display job types from SECONDARY_JOBS_CONFIG", async () => {
    useRosterMock.mockReturnValue({
      ...useRosterMock(),
      storeSecondaryJobs: [
        { id: 1, jobType: "DM", costCentre: "IN1311" },
        { id: 2, jobType: "PLAYGROUND", costCentre: "IN1311" },
      ],
      getStoreSecondaryJobs: jest.fn().mockResolvedValue([
        { id: 1, jobType: "DM", costCentre: "IN1311" },
        { id: 2, jobType: "PLAYGROUND", costCentre: "IN1311" },
      ]),
      getPayrollConfig: jest.fn().mockResolvedValue({
        currentPStartDateTime: "2024-11-22T00:00:00",
        currentPEndDateTime: "2024-12-21T15:15:00",
        currentManualHourStartTime: "2024-12-21T15:20:00",
        currentManualHourEndTime: "2024-12-21T16:20:00",
        currentPayrollExtractStartTime: "2024-12-21T16:22:00",
      }),
      payrollConfig: {
        currentPStartDateTime: "2024-11-22T00:00:00",
        currentPEndDateTime: "2024-12-21T15:15:00",
        currentManualHourStartTime: "2024-12-21T15:20:00",
        currentManualHourEndTime: "2024-12-21T16:20:00",
        currentPayrollExtractStartTime: "2024-12-21T16:22:00",
      },
    });

    render(
      <Provider store={store}>
        <ViewPublishedRoster />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("DM")).toBeInTheDocument();
      expect(screen.getByText("PLAYGROUND")).toBeInTheDocument();
    });

    const dmRole = SECONDARY_JOBS_CONFIG.find((job) => job.jobType === "DM");
    const playgroundRole = SECONDARY_JOBS_CONFIG.find(
      (job) => job.jobType === "PLAYGROUND"
    );

    expect(dmRole).toBeDefined();
    expect(playgroundRole).toBeDefined();
  });

  it("should change job types from SECONDARY_JOBS_CONFIG", async () => {
    useRosterMock.mockReturnValue({
      ...useRosterMock(),
      storeSecondaryJobs: [
        { id: 1, jobType: "DM", costCentre: "IN1311" },
        { id: 2, jobType: "PLAYGROUND", costCentre: "IN1311" },
      ],
      getStoreSecondaryJobs: jest.fn().mockResolvedValue([
        { id: 1, jobType: "DM", costCentre: "IN1311" },
        { id: 2, jobType: "PLAYGROUND", costCentre: "IN1311" },
      ]),
      getPayrollConfig: jest.fn().mockResolvedValue({
        currentPStartDateTime: "2024-11-22T00:00:00",
        currentPEndDateTime: "2024-12-21T15:15:00",
        currentManualHourStartTime: "2024-12-21T15:20:00",
        currentManualHourEndTime: "2024-12-21T16:20:00",
        currentPayrollExtractStartTime: "2024-12-21T16:22:00",
      }),
      payrollConfig: {
        currentPStartDateTime: "2024-11-22T00:00:00",
        currentPEndDateTime: "2024-12-21T15:15:00",
        currentManualHourStartTime: "2024-12-21T15:20:00",
        currentManualHourEndTime: "2024-12-21T16:20:00",
        currentPayrollExtractStartTime: "2024-12-21T16:22:00",
      },
    });

    render(
      <Provider store={store}>
        <ViewPublishedRoster />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("DM")).toBeInTheDocument();
      expect(screen.getByText("PLAYGROUND")).toBeInTheDocument();
    });

    const dmRole = SECONDARY_JOBS_CONFIG.find((job) => job.jobType === "DM");
    const playgroundRole = SECONDARY_JOBS_CONFIG.find(
      (job) => job.jobType === "PLAYGROUND"
    );

    expect(dmRole).toBeDefined();
    expect(playgroundRole).toBeDefined();

    const fitnessElement = screen.getByText("PLAYGROUND");

    fireEvent.click(fitnessElement);
  });
});
