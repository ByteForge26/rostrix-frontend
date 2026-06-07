import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { useAppSelector, store } from "../../app/store/store";
import ManualHours from "./ManualHours";
import {
  IPayrollConfig,
  IRosterDetails,
  IManualHours,
  IClusterResponse,
  IStoreSecondaryJob,
  IMiscWork,
  IApiResponse,
} from "../../helper/Interface";

import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import { setImmediate } from "timers";
import React from "react";
const flushPromises = () => new Promise(setImmediate);

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

const mockPayrollConfigPast: IPayrollConfig = {
  ...mockPayrollConfig,
  currentManualHourStartTime: "2024-12-20T15:20:00",
  currentManualHourEndTime: "2024-12-20T16:20:00",
};

const mockPayrollConfigFuture: IPayrollConfig = {
  ...mockPayrollConfig,
  currentManualHourStartTime: "2024-12-22T15:20:00",
  currentManualHourEndTime: "2024-12-22T16:20:00",
};

const mockPayrollConfigSameDayFuture: IPayrollConfig = {
  ...mockPayrollConfig,
  currentManualHourStartTime: "2024-12-21T16:20:00",
  currentManualHourEndTime: "2024-12-21T17:20:00",
};

const mockManualHoursHistory: IManualHours[] = [
  {
    empId: "DSI006062",
    fistName: "Prince",
    lastName: "Attri",
    date: "2024-11-25",
    prevHours: 8,
    updatedHours: 10,
    action: "EDIT_WORK",
    comment: "Added additional hours",
    modifiedDate: "2024-11-25T14:30:00",
  },
  {
    empId: "DP6149",
    fistName: "VISHNU",
    lastName: "YADAV",
    date: "2024-11-26",
    prevHours: 8,
    updatedHours: 0,
    action: "ASSIGN_LEAVE",
    comment: "Sick leave",
    modifiedDate: "2024-11-26T10:15:00",
  },
];

const mockClusters: IClusterResponse[] = [
  {
    id: 1,
    name: "Cluster 1",
    sportIds: [],
    costCentre: "IN1311",
    leaderEmpId: "LEAD001",
    leaderEmpName: "Team Lead",
    editable: true,
  },
  {
    id: 2,
    name: "Cluster 2",
    sportIds: [],
    costCentre: "IN1311",
    leaderEmpId: "LEAD002",
    leaderEmpName: "Team Lead 2",
    editable: true,
  },
];

const mockStoreSecondaryJobs: IStoreSecondaryJob[] = [
  {
    id: 1,
    jobType: "COACH",
    costCentre: "IN1311",
    isDefault: true,
  },
  {
    id: 2,
    jobType: "TRAINER",
    costCentre: "IN1311",
    isDefault: false,
  },
];

const mockMiscWorks: IMiscWork[] = [
  { id: 1, name: "Training", hourCategory: "TRAINING" },
  { id: 2, name: "Meeting", hourCategory: "MEETING" },
];

const mockRosterDetails: IRosterDetails = {
  data: {
    firstName: "Prince",
    lastName: "Attri",
    costCentre: "IN1311",
    empId: "DSI006062",
    assignedClusterId: 1,
    assignedSJTypes: ["COACH"],
    dayStatus: "LEAVE",
    metaData: "",
    main: [
      { s: "08:00:00", e: "12:00:00", c: "" },
      { s: "14:00:00", e: "18:00:00", c: "" },
    ],
    others: [{ s: "09:00:00", e: "11:00:00", c: "", type: "COACH" }],
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

const mockRosterDetailsLeave: IRosterDetails = {
  data: {
    ...mockRosterDetails.data,
    dayStatus: "LEAVE",
    empId: "DP6149",
    main: [],
    others: [],
    misc: [],
  },
  applicableForChange: true,
  message: "",
  success: true,
};

const mockRosterDetailsWeekOff: IRosterDetails = {
  data: {
    ...mockRosterDetails.data,
    dayStatus: "WEEK_OFF",
    empId: "DP6150",
    main: [],
    others: [],
    misc: [],
  },
  applicableForChange: true,
  message: "",
  success: true,
};

const mockRosterDetailsHoliday: IRosterDetails = {
  data: {
    ...mockRosterDetails.data,
    dayStatus: "HOLIDAY",
    empId: "DP6151",
    main: [],
    others: [],
    misc: [],
  },
  applicableForChange: true,
  message: "",
  success: true,
};

const mockRosterDetailsBlank: IRosterDetails = {
  data: {
    ...mockRosterDetails.data,
    dayStatus: "BLANK",
    empId: "DP6152",
    main: [],
    others: [],
    misc: [],
  },
  applicableForChange: true,
  message: "",
  success: true,
};

const mockRosterDetailsWithPlannedJob: IRosterDetails = {
  data: {
    ...mockRosterDetails.data,
    empId: "DP6153",
    misc: [
      {
        s: "13:00:00",
        e: "15:00:00",
        c: "",
        workId: 1,
        plannedJob: true,
        secondaryJobType: "COACH",
      },
    ],
  },
  applicableForChange: true,
  message: "",
  success: true,
};

const mockRosterDetailsWorkingHoliday: IRosterDetails = {
  data: {
    ...mockRosterDetails.data,
    dayStatus: "WORKING_HOLIDAY",
    empId: "DP6154",
    main: [],
    others: [],
    misc: [],
  },
  applicableForChange: true,
  message: "",
  success: true,
};

const mockApiResponse: IApiResponse = {
  success: true,
  message: "Operation completed successfully",
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

jest.useFakeTimers();
jest.setSystemTime(new Date(2024, 11, 21, 15, 30, 0));

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
const getMock = jest.fn();
const postMock = jest.fn();

describe("ManualHours Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2024, 11, 21, 15, 30, 0));
    getMock.mockImplementation((endpoint: string, options = {}) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfig);
      }
      if (endpoint.includes("/v1/hours/manual")) {
        return Promise.resolve(mockManualHoursHistory);
      }
      if (endpoint.includes("/v1/hours/emp/DSI006062")) {
        return Promise.resolve(mockRosterDetails);
      }
      if (endpoint.includes("/v1/hours/emp/DP6149")) {
        return Promise.resolve(mockRosterDetailsLeave);
      }
      if (endpoint.includes("/v1/hours/emp/DP6150")) {
        return Promise.resolve(mockRosterDetailsWeekOff);
      }
      if (endpoint.includes("/v1/hours/emp/DP6151")) {
        return Promise.resolve(mockRosterDetailsHoliday);
      }
      if (endpoint.includes("/v1/hours/emp/DP6152")) {
        return Promise.resolve(mockRosterDetailsBlank);
      }
      if (endpoint.includes("/v1/hours/emp/DP6153")) {
        return Promise.resolve(mockRosterDetailsWithPlannedJob);
      }
      if (endpoint.includes("/v1/hours/emp/DP6154")) {
        return Promise.resolve(mockRosterDetailsWorkingHoliday);
      }
      if (endpoint.includes("/v1/hours/emp/INVALID")) {
        return Promise.resolve({
          success: false,
          message: "User Not Found!",
        });
      }
      if (endpoint.includes("/v1/cluster")) {
        return Promise.resolve(mockClusters);
      }
      if (endpoint.includes("/v1/secondary/store-config")) {
        return Promise.resolve(mockStoreSecondaryJobs);
      }
      if (endpoint.includes("/v1/roster/primary/miscWork")) {
        return Promise.resolve(mockMiscWorks);
      }
      return Promise.resolve([]);
    });

    postMock.mockImplementation((endpoint: string, data = {}) => {
      if (data.data && data.data.action === "REMOVE_LEAVE") {
        return Promise.resolve({
          success: true,
          message: "Leave removed successfully",
        });
      }
      if (data.data && data.data.action === "REMOVE_WEEK_OFF") {
        return Promise.resolve({
          success: true,
          message: "Week off removed successfully",
        });
      }
      if (data.data && data.data.action === "ASSIGN_LEAVE") {
        return Promise.resolve({
          success: true,
          message: "Leave assigned successfully",
        });
      }
      if (data.data && data.data.action === "ASSIGN_WEEK_OFF") {
        return Promise.resolve({
          success: true,
          message: "Week off assigned successfully",
        });
      }
      if (data.data && data.data.action === "EDIT_WORK") {
        return Promise.resolve({
          success: true,
          message: "Manual hours updated successfully",
        });
      }
      if (
        endpoint.includes("/v1/hours/manual") &&
        data.data &&
        data.data.empId === "INVALID_UPDATE"
      ) {
        return Promise.resolve({
          success: false,
          message: "Invalid Time to add manual Hours",
        });
      }
      return Promise.resolve(mockApiResponse);
    });

    useApiMock.mockReturnValue({
      get: getMock,
      post: postMock,
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1311",
      contractTypes: [
        { id: 1, name: "Full Time" },
        { id: 2, name: "Part Time" },
      ],
      user: { empId: "DSI006062" },
    });

    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test("renders the component with initial state", async () => {
    render(
      <Provider store={store}>
        <ManualHours />
      </Provider>
    );
    expect(screen.getByText("Manual Hours")).toBeInTheDocument();

    const dropdown = screen.getByRole("combobox");
    expect(dropdown).toBeInTheDocument();

    expect(screen.getByText("View Entries")).toBeInTheDocument();

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });
  });

  test("displays manual hours history when View Entries is clicked", async () => {
    render(
      <Provider store={store}>
        <ManualHours />
      </Provider>
    );

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });

    const viewEntriesButton = screen.getByText("View Entries");
    fireEvent.click(viewEntriesButton);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith(
        "/v1/hours/manual",
        expect.any(Object)
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
      expect(screen.getByText("VISHNU YADAV")).toBeInTheDocument();
    });
  });

  test("renders the past manual hours window state", async () => {
    getMock.mockImplementation((endpoint) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfigPast);
      }
      return getMock.getMockImplementation()(endpoint);
    });

    render(
      <Provider store={store}>
        <ManualHours />
      </Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Manual hours window has now been closed.")
      ).toBeInTheDocument();
    });
  });

  test("renders the future manual hours window state", async () => {
    getMock.mockImplementation((endpoint) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfigFuture);
      }
      return getMock.getMockImplementation()(endpoint);
    });

    render(
      <Provider store={store}>
        <ManualHours />
      </Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Manual hours window will be open from/i)
      ).toBeInTheDocument();
    });
  });

  test("renders the same day future manual hours window state with timer", async () => {
    getMock.mockImplementation((endpoint) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfigSameDayFuture);
      }
      return getMock.getMockImplementation()(endpoint);
    });

    render(
      <Provider store={store}>
        <ManualHours />
      </Provider>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Manual hours window will be open in/i)
      ).toBeInTheDocument();
    });
  });
  test("Get Details and Reset Button button ", async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManualHours />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Manual Hours")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });
    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    const dateInput = screen.getAllByRole("textbox")[1];
    const empIdInput = screen.getByPlaceholderText("Enter Employee Id");

    fireEvent.change(empIdInput, { target: { value: "DSI006062" } });

    fireEvent.click(dateInput);

    fireEvent.click(await screen.getByText("19"));

    const getDetailsButton = screen.getByText("Get Details");

    fireEvent.click(getDetailsButton);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });

    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Reset"));
  });
  test("Remove Leave", async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManualHours />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Manual Hours")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });
    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    const dateInput = screen.getAllByRole("textbox")[1];
    const empIdInput = screen.getByPlaceholderText("Enter Employee Id");

    fireEvent.change(empIdInput, { target: { value: "DSI006062" } });

    fireEvent.click(dateInput);

    fireEvent.click(await screen.getByText("19"));

    const getDetailsButton = screen.getByText("Get Details");

    fireEvent.click(getDetailsButton);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });

    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
    });

    fireEvent.click(await screen.getByText("Remove Leave"));
  });

  test("Click On Save Shift Button", async () => {
    const mockRosterDetailsTemp: IRosterDetails = {
      data: {
        firstName: "Prince",
        lastName: "Attri",
        costCentre: "IN1311",
        empId: "DSI006062",
        assignedClusterId: 1,
        assignedSJTypes: ["COACH"],
        dayStatus: "WORKING",
        metaData: "",
        main: [],
        others: [],
        misc: [],
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

    getMock.mockImplementation((endpoint: string, options = {}) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfig);
      }
      if (endpoint.includes("/v1/hours/emp")) {
        return Promise.resolve(mockRosterDetailsTemp);
      }
      if (endpoint.includes("/v1/hours/manual")) {
        return Promise.resolve(mockManualHoursHistory);
      }
      if (endpoint.includes("/v1/cluster")) {
        return Promise.resolve(mockClusters);
      }
      if (endpoint.includes("/v1/secondary/store-config")) {
        return Promise.resolve(mockStoreSecondaryJobs);
      }
      if (endpoint.includes("/v1/roster/primary/miscWork")) {
        return Promise.resolve(mockMiscWorks);
      }
      return Promise.resolve([]);
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManualHours />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Manual Hours")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });
    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    const dateInput = screen.getAllByRole("textbox")[1];
    const empIdInput = screen.getByPlaceholderText("Enter Employee Id");

    fireEvent.change(empIdInput, { target: { value: "DSI006062" } });

    fireEvent.click(dateInput);

    fireEvent.click(await screen.getByText("19"));

    const getDetailsButton = screen.getByText("Get Details");

    fireEvent.click(getDetailsButton);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });

    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
    });

    fireEvent.click(await screen.getByText("Edit"));

    fireEvent.click((await screen.getAllByText("+ Add Shift"))[0]);
    const comboboxes = screen.getAllByRole("combobox");

    fireEvent.change(comboboxes[0], { target: { value: "9" } });

    fireEvent.click(await screen.getByText("09:00 AM"));

    fireEvent.change(comboboxes[1], { target: { value: "9" } });

    fireEvent.click(await screen.getByText("09:30 AM (30 min)"));

    fireEvent.click(await screen.getAllByText("Save")[1]);
  });

  test("Click On Edit Shift Button", async () => {
    const mockRosterDetails: IRosterDetails = {
      data: {
        firstName: "Prince",
        lastName: "Attri",
        costCentre: "IN1311",
        empId: "DSI006062",
        assignedClusterId: 1,
        assignedSJTypes: ["COACH"],
        dayStatus: "WORKING",
        metaData: "",
        main: [
          { s: "08:00:00", e: "12:00:00", c: "" },
          { s: "14:00:00", e: "18:00:00", c: "" },
        ],
        others: [{ s: "09:00:00", e: "11:00:00", c: "", type: "COACH" }],
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
    getMock.mockImplementation((endpoint: string, options = {}) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfig);
      }
      if (endpoint.includes("/v1/hours/emp")) {
        return Promise.resolve(mockRosterDetails);
      }
      if (endpoint.includes("/v1/hours/manual")) {
        return Promise.resolve(mockManualHoursHistory);
      }
      if (endpoint.includes("/v1/cluster")) {
        return Promise.resolve(mockClusters);
      }
      if (endpoint.includes("/v1/secondary/store-config")) {
        return Promise.resolve(mockStoreSecondaryJobs);
      }
      if (endpoint.includes("/v1/roster/primary/miscWork")) {
        return Promise.resolve(mockMiscWorks);
      }
      return Promise.resolve([]);
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManualHours />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });
    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    const dateInput = screen.getAllByRole("textbox")[1];
    const empIdInput = screen.getByPlaceholderText("Enter Employee Id");

    fireEvent.change(empIdInput, { target: { value: "DSI006062" } });

    fireEvent.click(dateInput);

    fireEvent.click(await screen.getByText("19"));

    const getDetailsButton = screen.getByText("Get Details");

    fireEvent.click(getDetailsButton);

    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
    });

    fireEvent.click(await screen.getAllByText("Edit")[0]);

    fireEvent.click(await screen.getByLabelText("EditButton"));

    fireEvent.click(await screen.getAllByText("Save")[1]);

    fireEvent.click(await screen.getAllByText("Save")[0]);
  });

  test("Click On Delete Shift Button", async () => {
    const mockRosterDetails: IRosterDetails = {
      data: {
        firstName: "Prince",
        lastName: "Attri",
        costCentre: "IN1311",
        empId: "DSI006062",
        assignedClusterId: 1,
        assignedSJTypes: ["COACH"],
        dayStatus: "WORKING",
        metaData: "",
        main: [
          { s: "08:00:00", e: "12:00:00", c: "" },
          { s: "14:00:00", e: "18:00:00", c: "" },
        ],
        others: [{ s: "09:00:00", e: "11:00:00", c: "", type: "COACH" }],
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
    getMock.mockImplementation((endpoint: string, options = {}) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfig);
      }
      if (endpoint.includes("/v1/hours/emp")) {
        return Promise.resolve(mockRosterDetails);
      }
      if (endpoint.includes("/v1/hours/manual")) {
        return Promise.resolve(mockManualHoursHistory);
      }
      if (endpoint.includes("/v1/cluster")) {
        return Promise.resolve(mockClusters);
      }
      if (endpoint.includes("/v1/secondary/store-config")) {
        return Promise.resolve(mockStoreSecondaryJobs);
      }
      if (endpoint.includes("/v1/roster/primary/miscWork")) {
        return Promise.resolve(mockMiscWorks);
      }
      return Promise.resolve([]);
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManualHours />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });
    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    const dateInput = screen.getAllByRole("textbox")[1];
    const empIdInput = screen.getByPlaceholderText("Enter Employee Id");

    fireEvent.change(empIdInput, { target: { value: "DSI006062" } });

    fireEvent.click(dateInput);

    fireEvent.click(await screen.getByText("19"));

    const getDetailsButton = screen.getByText("Get Details");

    fireEvent.click(getDetailsButton);

    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
    });

    fireEvent.click(await screen.getAllByText("Edit")[0]);

    fireEvent.click(await screen.getByLabelText("DeleteButton"));

    fireEvent.click(await screen.getByText("Delete"));
  });

  test("Mock Roster failure", async () => {
    const mockRosterDetailsTemp: IRosterDetails = {
      data: {
        firstName: "Prince",
        lastName: "Attri",
        costCentre: "IN1311",
        empId: "DSI006062",
        assignedClusterId: 1,
        assignedSJTypes: ["COACH"],
        dayStatus: "WORKING",
        metaData: "",
        main: [],
        others: [],
        misc: [],
        exited: false,
        lastWorkingDate: "",
        costCenterChange: false,
        newCostCentre: "",
        costCentreChangeDate: "",
      },
      applicableForChange: true,
      message: "",
      success: false,
    };

    getMock.mockImplementation((endpoint: string, options = {}) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfig);
      }
      if (endpoint.includes("/v1/hours/emp")) {
        return Promise.resolve(mockRosterDetailsTemp);
      }
      if (endpoint.includes("/v1/hours/manual")) {
        return Promise.resolve(mockManualHoursHistory);
      }
      if (endpoint.includes("/v1/cluster")) {
        return Promise.resolve(mockClusters);
      }
      if (endpoint.includes("/v1/secondary/store-config")) {
        return Promise.resolve(mockStoreSecondaryJobs);
      }
      if (endpoint.includes("/v1/roster/primary/miscWork")) {
        return Promise.resolve(mockMiscWorks);
      }
      return Promise.resolve([]);
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManualHours />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Manual Hours")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });
    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    const dateInput = screen.getAllByRole("textbox")[1];
    const empIdInput = screen.getByPlaceholderText("Enter Employee Id");

    fireEvent.change(empIdInput, { target: { value: "DSI006062" } });

    fireEvent.click(dateInput);

    fireEvent.click(await screen.getByText("19"));

    const getDetailsButton = screen.getByText("Get Details");

    fireEvent.click(getDetailsButton);
  });

  test("Click On Main Edit Shift Button", async () => {
    const mockRosterDetails: IRosterDetails = {
      data: {
        firstName: "Prince",
        lastName: "Attri",
        costCentre: "IN1311",
        empId: "DSI006062",
        assignedClusterId: 1,
        assignedSJTypes: ["COACH"],
        dayStatus: "WORKING",
        metaData: "",
        main: [
          { s: "08:00:00", e: "12:00:00", c: "" },
          { s: "14:00:00", e: "18:00:00", c: "" },
        ],
        others: [{ s: "09:00:00", e: "11:00:00", c: "", type: "COACH" }],
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
    getMock.mockImplementation((endpoint: string, options = {}) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfig);
      }
      if (endpoint.includes("/v1/hours/emp")) {
        return Promise.resolve(mockRosterDetails);
      }
      if (endpoint.includes("/v1/hours/manual")) {
        return Promise.resolve(mockManualHoursHistory);
      }
      if (endpoint.includes("/v1/cluster")) {
        return Promise.resolve(mockClusters);
      }
      if (endpoint.includes("/v1/secondary/store-config")) {
        return Promise.resolve(mockStoreSecondaryJobs);
      }
      if (endpoint.includes("/v1/roster/primary/miscWork")) {
        return Promise.resolve(mockMiscWorks);
      }
      return Promise.resolve([]);
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManualHours />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });
    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    const dateInput = screen.getAllByRole("textbox")[1];
    const empIdInput = screen.getByPlaceholderText("Enter Employee Id");

    fireEvent.change(empIdInput, { target: { value: "DSI006062" } });

    fireEvent.click(dateInput);

    fireEvent.click(await screen.getByText("19"));

    const getDetailsButton = screen.getByText("Get Details");

    fireEvent.click(getDetailsButton);

    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
    });

    fireEvent.click(await screen.getAllByText("Edit")[0]);

    fireEvent.click(await screen.getAllByLabelText("mainEdit")[0]);
  });

  test("Click On Other Edit Shift Button", async () => {
    const mockRosterDetails: IRosterDetails = {
      data: {
        firstName: "Prince",
        lastName: "Attri",
        costCentre: "IN1311",
        empId: "DSI006062",
        assignedClusterId: 1,
        assignedSJTypes: ["COACH"],
        dayStatus: "WORKING",
        metaData: "",
        main: [
          { s: "08:00:00", e: "12:00:00", c: "" },
          { s: "14:00:00", e: "18:00:00", c: "" },
        ],
        others: [{ s: "09:00:00", e: "11:00:00", c: "", type: "COACH" }],
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
    getMock.mockImplementation((endpoint: string, options = {}) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfig);
      }
      if (endpoint.includes("/v1/hours/emp")) {
        return Promise.resolve(mockRosterDetails);
      }
      if (endpoint.includes("/v1/hours/manual")) {
        return Promise.resolve(mockManualHoursHistory);
      }
      if (endpoint.includes("/v1/cluster")) {
        return Promise.resolve(mockClusters);
      }
      if (endpoint.includes("/v1/secondary/store-config")) {
        return Promise.resolve(mockStoreSecondaryJobs);
      }
      if (endpoint.includes("/v1/roster/primary/miscWork")) {
        return Promise.resolve(mockMiscWorks);
      }
      return Promise.resolve([]);
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManualHours />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });
    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    const dateInput = screen.getAllByRole("textbox")[1];
    const empIdInput = screen.getByPlaceholderText("Enter Employee Id");

    fireEvent.change(empIdInput, { target: { value: "DSI006062" } });

    fireEvent.click(dateInput);

    fireEvent.click(await screen.getByText("19"));

    const getDetailsButton = screen.getByText("Get Details");

    fireEvent.click(getDetailsButton);

    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
    });

    fireEvent.click(await screen.getAllByText("Edit")[0]);

    fireEvent.click(await screen.getAllByLabelText("otherEdit")[0]);
  });

  test("Deleting misc shift with workId and plannedJob", async () => {
    const mockRosterDetailsWithMisc = {
      data: {
        firstName: "Prince",
        lastName: "Attri",
        costCentre: "IN1311",
        empId: "DSI006062",
        assignedClusterId: 1,
        assignedSJTypes: ["COACH"],
        dayStatus: "WORKING",
        metaData: "",
        main: [],
        others: [],
        misc: [
          {
            s: "13:00:00",
            e: "15:00:00",
            c: "",
            workId: 1,
            plannedJob: true,
            secondaryJobType: "COACH",
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

    getMock.mockImplementation((endpoint) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfig);
      }
      if (endpoint.includes("/v1/hours/emp")) {
        return Promise.resolve(mockRosterDetailsWithMisc);
      }
      if (endpoint.includes("/v1/cluster")) {
        return Promise.resolve(mockClusters);
      }
      if (endpoint.includes("/v1/secondary/store-config")) {
        return Promise.resolve(mockStoreSecondaryJobs);
      }
      if (endpoint.includes("/v1/roster/primary/miscWork")) {
        return Promise.resolve(mockMiscWorks);
      }
      return Promise.resolve([]);
    });

    render(
      <Provider store={store}>
        <ManualHours />
      </Provider>
    );

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });

    await waitFor(() => {
      expect(screen.getByText("Manual Hours")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    const empIdInput = await screen.findByPlaceholderText("Enter Employee Id");

    fireEvent.change(empIdInput, { target: { value: "DSI006062" } });

    const dateInput = screen.getAllByRole("textbox")[1];
    fireEvent.click(dateInput);

    await waitFor(() => {
      fireEvent.click(screen.getByText("19"));
    });
    const getDetailsButton = screen.getByText("Get Details");
    fireEvent.click(getDetailsButton);
    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Edit"));

    await waitFor(() => {
      const deleteButton = screen.getByLabelText("DeleteButton");
      fireEvent.click(deleteButton);
    });
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      const noShiftMessages = screen.getAllByText("No Shift Assigned");
      expect(noShiftMessages.length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getAllByText("Save")[0]);

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith(
        expect.stringContaining("/v1/hours/manual"),
        expect.objectContaining({
          data: expect.objectContaining({
            action: "EDIT_WORK",
            empId: "DSI006062",
          }),
        })
      );
    });
  });

  test("Deleting misc shift with workId and plannedJob", async () => {
    const mockRosterDetailsWithMisc = {
      data: {
        firstName: "Prince",
        lastName: "Attri",
        costCentre: "IN1311",
        empId: "DSI006062",
        assignedClusterId: 1,
        assignedSJTypes: ["COACH"],
        dayStatus: "WORKING",
        metaData: "",
        main: [],
        others: [],
        misc: [
          {
            s: "13:00:00",
            e: "15:00:00",
            c: "",
            workId: 1,
            plannedJob: true,
            secondaryJobType: "COACH",
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

    getMock.mockImplementation((endpoint) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfig);
      }
      if (endpoint.includes("/v1/hours/emp")) {
        return Promise.resolve(mockRosterDetailsWithMisc);
      }
      if (endpoint.includes("/v1/cluster")) {
        return Promise.resolve(mockClusters);
      }
      if (endpoint.includes("/v1/secondary/store-config")) {
        return Promise.resolve(mockStoreSecondaryJobs);
      }
      if (endpoint.includes("/v1/roster/primary/miscWork")) {
        return Promise.resolve(mockMiscWorks);
      }
      return Promise.resolve([]);
    });

    render(
      <Provider store={store}>
        <ManualHours />
      </Provider>
    );

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });

    await waitFor(() => {
      expect(screen.getByText("Manual Hours")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    const empIdInput = await screen.findByPlaceholderText("Enter Employee Id");

    fireEvent.change(empIdInput, { target: { value: "DSI006062" } });

    const dateInput = screen.getAllByRole("textbox")[1];
    fireEvent.click(dateInput);

    await waitFor(() => {
      fireEvent.click(screen.getByText("19"));
    });

    const getDetailsButton = screen.getByText("Get Details");
    fireEvent.click(getDetailsButton);

    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Edit"));

    await waitFor(() => {
      const deleteButton = screen.getByLabelText("DeleteButton");
      fireEvent.click(deleteButton);
    });

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      const noShiftMessages = screen.getAllByText("No Shift Assigned");
      expect(noShiftMessages.length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getAllByText("Save")[0]);

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith(
        expect.stringContaining("/v1/hours/manual"),
        expect.objectContaining({
          data: expect.objectContaining({
            action: "EDIT_WORK",
            empId: "DSI006062",
          }),
        })
      );
    });
  });

  test("ManualHours component handles empty data correctly", async () => {
    getMock.mockImplementation((endpoint) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfig);
      }
      if (endpoint.includes("/v1/hours/emp")) {
        return Promise.resolve({
          success: false,
          message: "No data found",
          applicableForChange: false,
          data: null,
        });
      }
      if (endpoint.includes("/v1/hours/manual")) {
        return Promise.resolve([]);
      }
      if (endpoint.includes("/v1/cluster")) {
        return Promise.resolve([]);
      }
      if (endpoint.includes("/v1/secondary/store-config")) {
        return Promise.resolve([]);
      }
      if (endpoint.includes("/v1/roster/primary/miscWork")) {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    render(
      <Provider store={store}>
        <ManualHours />
      </Provider>
    );

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });
    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    const empIdInput = await screen.findByPlaceholderText("Enter Employee Id");

    fireEvent.change(empIdInput, { target: { value: "INVALID" } });

    const dateInput = screen.getAllByRole("textbox")[1];
    fireEvent.click(dateInput);

    await waitFor(() => {
      fireEvent.click(screen.getByText("19"));
    });
    const getDetailsButton = screen.getByText("Get Details");
    fireEvent.click(getDetailsButton);

    await waitFor(() => {
      expect(screen.queryByText("Prince Attri")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("View Entries"));

    await waitFor(() => {
      expect(screen.getByText(/Manual Hours Entries/)).toBeInTheDocument();

      const drawerBody = screen.getByRole("dialog");
      expect(drawerBody).toBeInTheDocument();
    });
  });

  test("Shift validation errors are handled correctly", async () => {
    const mockRosterDetailsWithShifts = {
      data: {
        firstName: "Prince",
        lastName: "Attri",
        costCentre: "IN1311",
        empId: "DSI006062",
        assignedClusterId: 1,
        assignedSJTypes: ["COACH"],
        dayStatus: "WORKING",
        metaData: "",
        main: [{ s: "09:00:00", e: "13:00:00", c: "" }],
        others: [{ s: "14:00:00", e: "16:00:00", c: "", type: "COACH" }],
        misc: [
          {
            s: "16:30:00",
            e: "18:30:00",
            c: "",
            workId: 1,
            plannedJob: false,
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

    getMock.mockImplementation((endpoint) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfig);
      }
      if (endpoint.includes("/v1/hours/emp")) {
        return Promise.resolve(mockRosterDetailsWithShifts);
      }
      if (endpoint.includes("/v1/cluster")) {
        return Promise.resolve(mockClusters);
      }
      if (endpoint.includes("/v1/secondary/store-config")) {
        return Promise.resolve(mockStoreSecondaryJobs);
      }
      if (endpoint.includes("/v1/roster/primary/miscWork")) {
        return Promise.resolve(mockMiscWorks);
      }
      return Promise.resolve([]);
    });

    render(
      <Provider store={store}>
        <ManualHours />
      </Provider>
    );

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    const empIdInput = await screen.findByPlaceholderText("Enter Employee Id");

    fireEvent.change(empIdInput, { target: { value: "DSI006062" } });

    const dateInput = screen.getAllByRole("textbox")[1];
    fireEvent.click(dateInput);

    await waitFor(() => {
      fireEvent.click(screen.getByText("19"));
    });

    const getDetailsButton = screen.getByText("Get Details");
    fireEvent.click(getDetailsButton);

    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));

    fireEvent.click(screen.getAllByText("+ Add Shift")[0]);

    await waitFor(() => {
      expect(screen.getByText(/Start Time/i)).toBeInTheDocument();
    });

    const modalSelects = screen.getAllByRole("combobox");

    fireEvent.change(modalSelects[0], { target: { value: "10" } });
    fireEvent.click(screen.getByText("10:00 AM"));

    fireEvent.change(modalSelects[1], { target: { value: "11" } });
    fireEvent.click(screen.getByText("11:00 AM (1 hr)"));

    fireEvent.click(screen.getAllByText("Save")[1]);

    await waitFor(() => {
      const modalHeader = screen.getByText(/Add Primary Shift/i);
      expect(modalHeader).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Close"));

    fireEvent.click(screen.getAllByText("+ Add Shift")[0]);

    await waitFor(() => {
      expect(screen.getByText(/Start Time/i)).toBeInTheDocument();
    });
    const maxDurationSelects = screen.getAllByRole("combobox");

    fireEvent.change(maxDurationSelects[0], { target: { value: "01" } });
    fireEvent.click(screen.getByText("01:00 AM"));

    fireEvent.change(maxDurationSelects[1], { target: { value: "09" } });
    fireEvent.click(screen.getByText("09:00 AM (8 hr)"));

    fireEvent.click(screen.getAllByText("Save")[1]);

    await waitFor(() => {
      const modalHeader = screen.getByText(/Add Primary Shift/i);
      expect(modalHeader).toBeInTheDocument();
    });
  });

  test("Handles 'Invalid Time to add manual Hours' error correctly", async () => {
    // Mock roster details
    const mockRosterDetails = {
      data: {
        firstName: "Prince",
        lastName: "Attri",
        costCentre: "IN1311",
        empId: "DSI006062",
        assignedClusterId: 1,
        assignedSJTypes: ["COACH"],
        dayStatus: "WORKING",
        metaData: "",
        main: [{ s: "08:00:00", e: "12:00:00", c: "" }],
        others: [],
        misc: [],
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

    // Configure get mock
    getMock.mockImplementation((endpoint) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfig);
      }
      if (endpoint.includes("/v1/hours/emp")) {
        return Promise.resolve(mockRosterDetails);
      }
      if (endpoint.includes("/v1/cluster")) {
        return Promise.resolve(mockClusters);
      }
      if (endpoint.includes("/v1/secondary/store-config")) {
        return Promise.resolve(mockStoreSecondaryJobs);
      }
      if (endpoint.includes("/v1/roster/primary/miscWork")) {
        return Promise.resolve(mockMiscWorks);
      }
      return Promise.resolve([]);
    });

    // Configure post mock to return "Invalid Time" error
    postMock.mockImplementation((endpoint, data) => {
      if (endpoint.includes("/v1/hours/manual")) {
        return Promise.resolve({
          success: false,
          message: "Invalid Time to add manual Hours",
        });
      }
      return Promise.resolve(mockApiResponse);
    });

    // Render the component
    render(
      <Provider store={store}>
        <ManualHours />
      </Provider>
    );

    // Wait for initial render and API calls
    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    // Find input fields and setup
    const empIdInput = await screen.findByPlaceholderText("Enter Employee Id");
    fireEvent.change(empIdInput, { target: { value: "DSI006062" } });

    // Set date
    const dateInput = screen.getAllByRole("textbox")[1];
    fireEvent.click(dateInput);

    await waitFor(() => {
      fireEvent.click(screen.getByText("19"));
    });

    // Get Details
    const getDetailsButton = screen.getByText("Get Details");
    fireEvent.click(getDetailsButton);

    // Wait for the roster details to load
    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
    });

    // Enter edit mode
    fireEvent.click(screen.getByText("Edit"));

    // Make a change - add a shift
    fireEvent.click(screen.getAllByText("+ Add Shift")[0]);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText(/Start Time/i)).toBeInTheDocument();
    });

    // Select times using a more flexible approach
    const modalSelects = screen.getAllByRole("combobox");

    // Set start time value
    fireEvent.change(modalSelects[0], { target: { value: "14" } });

    // Find and click the start time option using regex
    const startTimeOptions = await screen.findAllByText(/14:00|2:00 PM/i);
    fireEvent.click(startTimeOptions[0]);

    // Set end time value
    fireEvent.change(modalSelects[1], { target: { value: "15" } });

    // Find and click the end time option using regex
    const endTimeOptions = await screen.findAllByText(/15:00|3:00 PM/i);
    fireEvent.click(endTimeOptions[0]);

    // Save the shift
    fireEvent.click(screen.getAllByText("Save")[1]);

    // Now try to save all changes
    fireEvent.click(screen.getAllByText("Save")[0]);

    // Wait for the API call to complete
    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith(
        expect.stringContaining("/v1/hours/manual"),
        expect.objectContaining({
          data: expect.objectContaining({
            action: "EDIT_WORK",
            empId: "DSI006062",
          }),
        })
      );
    });

    // Verify that the toast was NOT called with the error message
    expect(mockAddToast).not.toHaveBeenCalledWith(
      "Invalid Time to add manual Hours",
      expect.anything()
    );

    // Verify that the form is reset (employee details should disappear)
    await waitFor(() => {
      expect(screen.queryByText("Prince Attri")).not.toBeInTheDocument();
    });
  });

  test("Reset button in edit mode resets draft values", async () => {
    // Mock roster details with existing shifts
    const mockRosterDetails = {
      data: {
        firstName: "Prince",
        lastName: "Attri",
        costCentre: "IN1311",
        empId: "DSI006062",
        assignedClusterId: 1,
        assignedSJTypes: ["COACH"],
        dayStatus: "WORKING",
        metaData: "",
        main: [{ s: "08:00:00", e: "12:00:00", c: "" }],
        others: [{ s: "14:00:00", e: "16:00:00", c: "", type: "COACH" }],
        misc: [],
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

    // Configure mocks
    getMock.mockImplementation((endpoint) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfig);
      }
      if (endpoint.includes("/v1/hours/emp")) {
        return Promise.resolve(mockRosterDetails);
      }
      if (endpoint.includes("/v1/cluster")) {
        return Promise.resolve(mockClusters);
      }
      if (endpoint.includes("/v1/secondary/store-config")) {
        return Promise.resolve(mockStoreSecondaryJobs);
      }
      if (endpoint.includes("/v1/roster/primary/miscWork")) {
        return Promise.resolve(mockMiscWorks);
      }
      return Promise.resolve([]);
    });

    // Render the component
    render(
      <Provider store={store}>
        <ManualHours />
      </Provider>
    );

    // Wait for initial render and API calls to complete
    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    // Find the input fields
    const empIdInput = await screen.findByPlaceholderText("Enter Employee Id");

    // Enter employee ID
    fireEvent.change(empIdInput, { target: { value: "DSI006062" } });

    // Set date
    const dateInput = screen.getAllByRole("textbox")[1];
    fireEvent.click(dateInput);

    // Select a date
    await waitFor(() => {
      fireEvent.click(screen.getByText("19"));
    });

    // Get Details
    const getDetailsButton = screen.getByText("Get Details");
    fireEvent.click(getDetailsButton);

    // Wait for the roster details to load
    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
    });

    // Enter edit mode
    fireEvent.click(screen.getByText("Edit"));

    // Make a change - add a primary shift
    fireEvent.click(screen.getAllByText("+ Add Shift")[0]);

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText(/Start Time/i)).toBeInTheDocument();
    });

    // Select start time
    const modalSelects = screen.getAllByRole("combobox");
    fireEvent.change(modalSelects[0], { target: { value: "18" } });

    // Find and click the time option
    const startTimeOptions = await screen.findAllByText(/18:00|6:00 PM/i);
    fireEvent.click(startTimeOptions[0]);

    // Select end time
    fireEvent.change(modalSelects[1], { target: { value: "19" } });

    // Find and click the time option
    const endTimeOptions = await screen.findAllByText(/19:00|7:00 PM/i);
    fireEvent.click(endTimeOptions[0]);

    // Save the shift
    fireEvent.click(screen.getAllByText("Save")[1]);

    const resetButtons = screen.getAllByText("Reset");

    // Look for the Reset button that's next to a Save button (the one in edit mode)
    let editModeResetButton;
    for (const button of resetButtons) {
      // Check if the button's parent element contains a "Save" button
      const parentElement = button.parentElement;
      if (parentElement && parentElement.textContent.includes("Save")) {
        editModeResetButton = button;
        break;
      }
    }

    // If we found the edit mode Reset button, click it
    if (editModeResetButton) {
      fireEvent.click(editModeResetButton);
    } else {
      // Alternative approach: find the Reset button within the edit section
      // This uses the fact that there's a specific Reset button near the "Edit" text
      const editSectionButtons = screen.getAllByText("Reset");
      fireEvent.click(editSectionButtons[0]); // Take the first one if we can't identify specifically
    }

    // Verify we're back in view mode (Edit button is visible again)
    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });
  });

  test("Handles edge case when start time equals closing time", async () => {
    const mockRosterDetails = {
      data: {
        firstName: "Prince",
        lastName: "Attri",
        costCentre: "IN1311",
        empId: "DSI006062",
        assignedClusterId: 1,
        assignedSJTypes: ["COACH"],
        dayStatus: "WORKING",
        metaData: "",
        main: [],
        others: [],
        misc: [],
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

    getMock.mockImplementation((endpoint) => {
      if (endpoint.includes("/v1/hours/payroll-config")) {
        return Promise.resolve(mockPayrollConfig);
      }
      if (endpoint.includes("/v1/hours/emp")) {
        return Promise.resolve(mockRosterDetails);
      }
      if (endpoint.includes("/v1/cluster")) {
        return Promise.resolve(mockClusters);
      }
      if (endpoint.includes("/v1/secondary/store-config")) {
        return Promise.resolve(mockStoreSecondaryJobs);
      }
      if (endpoint.includes("/v1/roster/primary/miscWork")) {
        return Promise.resolve(mockMiscWorks);
      }
      return Promise.resolve([]);
    });

    render(
      <Provider store={store}>
        <ManualHours />
      </Provider>
    );

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/hours/payroll-config");
    });

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith("/v1/cluster?costCentre=IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/secondary/store-config/IN1311");
      expect(getMock).toHaveBeenCalledWith("/v1/roster/primary/miscWork");
    });

    const empIdInput = await screen.findByPlaceholderText("Enter Employee Id");

    fireEvent.change(empIdInput, { target: { value: "DSI006062" } });

    const dateInput = screen.getAllByRole("textbox")[1];
    fireEvent.click(dateInput);

    await waitFor(() => {
      fireEvent.click(screen.getByText("19"));
    });

    const getDetailsButton = screen.getByText("Get Details");
    fireEvent.click(getDetailsButton);

    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Edit"));

    fireEvent.click(screen.getAllByText("+ Add Shift")[0]);

    await waitFor(() => {
      expect(screen.getByText(/Start Time/i)).toBeInTheDocument();
    });

    const modalSelects = screen.getAllByRole("combobox");

    fireEvent.change(modalSelects[0], { target: { value: "23" } });

    const closingTimeOptions = await screen.findAllByText(/23:30|11:30 PM/i);
    fireEvent.click(closingTimeOptions[0]);

    await waitFor(() => {
      const saveButton = screen.getAllByText("Save")[1];
      expect(saveButton).toBeDisabled();
    });

    fireEvent.click(screen.getByText("Close"));
  });
});
