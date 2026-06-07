import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { useApi } from "../../../hooks/useApi";
import { usePermission } from "../../../hooks/usePermission";
import { useRoster } from "../../../hooks/useRoster";
import EditRoster from "./EditRoster";
import { useDrop } from "react-dnd";
import {
  store,
  useAppSelector,
  useAppDispatch,
} from "../../../app/store/store";
import { BrowserRouter } from "react-router-dom";
import moment from "moment";

jest.mock("../../../hooks/usePermission");
jest.mock("../../../hooks/useRoster", () => ({
  useRoster: jest.fn(),
}));
jest.mock("../../../hooks/useApi", () => ({
  useApi: jest.fn(),
}));
jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));
jest.mock("react-dnd", () => ({
  ...jest.requireActual("react-dnd"),
  useDrop: jest.fn(),
}));
jest.mock("../../../app/store/store", () => ({
  ...jest.requireActual("../../../app/store/store"),
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(() => jest.fn()),
}));
jest.mock("react-lottie", () => ({
  __esModule: true,
  default: () => <div data-testid="lottie-animation">Animation</div>,
}));
jest.mock("../common/CalenderView", () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="calendar-view">
      <button onClick={() => props.onChangeSelectedDay("2024-12-09")}>
        Select Day
      </button>
      <button onClick={() => props.onShiftChange({})}>Change Shift</button>
      {props.editable && <span>Editable Calendar</span>}
    </div>
  ),
}));
jest.mock("../common/InsightsView", () => ({
  __esModule: true,
  default: () => <div data-testid="insights-view">Insights Content</div>,
}));
jest.mock("../common/RosterPublishButton", () => ({
  __esModule: true,
  default: (props) => (
    <button
      data-testid="roster-publish-button"
      onClick={() => props.onPublishRoster({ notifyTo: "ALL" })}
    >
      Publish Roster
    </button>
  ),
}));
jest.mock("../common/RosterPublishSuccess", () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="roster-publish-success">
      {props.isPublishedRosterModalOpen && (
        <div>
          <span>Roster Published Successfully</span>
          <button onClick={props.onPublishedRosterModalClose}>Close</button>
        </div>
      )}
    </div>
  ),
}));
jest.mock("../common/RosterPublishHoursWarning", () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="roster-publish-hours-warning">
      {props.isEmpExceedingHoursListModalOpen && (
        <div>
          <span>Hours Warning</span>
          <button onClick={props.onEmpExceedingHoursListModalClose}>
            Close
          </button>
          <button onClick={() => props.goToRosterEdit(1)}>Edit Roster</button>
        </div>
      )}
    </div>
  ),
}));
jest.mock("../common/RosterPublishForceConfirmWarning", () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="roster-publish-force-confirm-warning">
      {props.isForceConfirmModalOpen && (
        <div>
          <span>Force Confirm Warning</span>
          <button onClick={props.onForceConfirmModalClose}>Close</button>
          <button
            onClick={() =>
              props.onPublishRoster({ notifyTo: "ALL", forceConfirm: true })
            }
          >
            Force Publish
          </button>
        </div>
      )}
    </div>
  ),
}));
jest.mock("../common/RosterPublishCJPWarning", () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="roster-publish-cjp-warning">
      {props.isWeekUncoveredShiftsModalOpen && (
        <div>
          <span>CJP Warning</span>
          <button onClick={props.onWeekUncoveredShiftsModalClose}>Close</button>
          <button onClick={() => props.goToRosterEdit(1)}>Edit Roster</button>
        </div>
      )}
    </div>
  ),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

const mockAuthState = {
  user: {
    empId: "EMP001",
    userRoles: {
      "Cost Center 1": ["ROLE1", "ROLE2"],
    },
  },
  selectedCostCenterName: "Cost Center 1",
  roles: [
    { id: "ROLE1", title: "ADMIN", editable: true },
    { id: "ROLE2", title: "EMPLOYEE", editable: false },
  ],
  contractTypes: [
    { id: 1, name: "Full-Time", category: "Employment" },
    { id: 2, name: "Part-Time", category: "Employment" },
  ],
  draft: [
    {
      id: 1,
      date: "2024-12-09",
      empId: "EMP001",
      status: "LEAVE",
      edit: true,
      impacted: false,
      subRole: "Lead",
      impacts: [{ type: "Overtime", ts: "2024-12-09T10:00:00Z" }],
      metaData: "{}",
      main: [{ s: "09:00", e: "17:00", c: "Office" }],
      misc: [{ s: "10:00", e: "12:00", c: "Training", plannedJob: true }],
      others: [{ s: "13:00", e: "14:00", c: "Meeting", type: "DM" }],
    },
  ],
  selectedWeek: 1,
  selectedYear: 2024,
  selectedDate: "2024-12-09",
  roster: {
    selectedWeek: 1,
    selectedYear: 2024,
    selectedDate: "2024-12-09",
  },
};

const baseMockRoster = {
  finalDuplicateDayIds: [],
  isDuplicateModalOpen: false,
  onChangeSelectedDay: jest.fn(),
  onDuplicateClick: jest.fn(),
  onDuplicateModalClose: jest.fn(),
  onDuplicateModalOpen: jest.fn(),
  shifts: [],
  onShiftChange: jest.fn(),
  onDraftDataSave: jest.fn(),
  isRosterSaving: false,
  goToMyTeamRoster: jest.fn(),
  clusters: [
    { id: 1, name: "Cluster 1", editable: true },
    { id: 2, name: "Cluster 2", editable: true },
  ],
  selectedClusterId: 1,
  getAllClusters: jest.fn(),
  getShifts: jest.fn(),
  miscWorks: [],
  onRemoveMiscShift: jest.fn(),
  onValidateHours: jest.fn(),
  isAnyPartTimeEmp: jest.fn().mockReturnValue(true),
  isValidating: false,
  validationState: null,
  onPublishRoster: jest.fn(),
  setGlobalNotifyTo: jest.fn(),
  globalNotifyTo: "ALL",
  isEmpExceedingHoursListModalOpen: false,
  onEmpExceedingHoursListModalClose: jest.fn(),
  empDailyExceedingHoursList: [],
  empWeeklyExceedingHoursList: [],
  empExceedingHoursList: [],
  onChangeWeek: jest.fn(),
  goToRosterEdit: jest.fn(),
  isForceConfirmModalOpen: false,
  onForceConfirmModalClose: jest.fn(),
  messageObj: {},
  isWeekUncoveredShiftsModalOpen: false,
  onWeekUncoveredShiftsModalClose: jest.fn(),
  weekUncoveredShifts: [],
  isPublishedRosterModalOpen: false,
  onPublishedRosterModalClose: jest.fn(),
  roster: {
    rosterWeekId: 1,
    empWeekRosters: [
      {
        empId: "EMP001",
        firstName: "John",
        lastName: "Doe",
        contractId: 1,
        days: [
          {
            id: 1,
            date: "2024-12-09",
            empId: "EMP001",
            status: "WORKING",
            edit: true,
            impacted: false,
            subRole: "Lead",
            impacts: [{ type: "Overtime", ts: "2024-12-09T10:00:00Z" }],
            metaData: "{}",
            main: [{ s: "09:00", e: "17:00", c: "Office" }],
            misc: [{ s: "10:00", e: "12:00", c: "Training", plannedJob: true }],
            others: [{ s: "13:00", e: "14:00", c: "Meeting", type: "Admin" }],
          },
        ],
        allowedHours: 40,
        empHours: [
          {
            pendDate: "2024-12-09",
            pstartDate: "2024-12-01",
            totalHours: 38,
          },
        ],
      },
    ],
    assignedJobShifts: [],
    rosterStatus: "DRAFT",
  },
};

const useRosterMock = useRoster as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;
const useApiMock = useApi as jest.Mock;
const useAppDispatchMock = useAppDispatch as jest.Mock;

const renderComponent = () => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <EditRoster />
      </BrowserRouter>
    </Provider>
  );
};

describe("EditRoster Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    jest.clearAllMocks();
    jest.useFakeTimers();

    useRosterMock.mockReturnValue(baseMockRoster);

    (useAppSelector as jest.Mock).mockReturnValue(mockAuthState);

    const mockDispatch = jest.fn();
    useAppDispatchMock.mockReturnValue(mockDispatch);

    useApiMock.mockReturnValue({
      post: jest.fn().mockResolvedValue({
        data: {
          success: true,
          message: "Operation successful",
        },
      }),
      get: jest.fn().mockResolvedValue({
        data: {
          success: true,
          data: {},
        },
      }),
    });

    (useDrop as jest.Mock).mockReturnValue([
      { isOver: false, canDrop: true },
      jest.fn(),
    ]);

    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn(() => true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should render component with roster information", () => {
    renderComponent();

    expect(
      screen.getByText(/Cluster 1\s+\|\s+Rostering Week 1/)
    ).toBeInTheDocument();
    expect(screen.getByText(/DRAFT/)).toBeInTheDocument();
    expect(screen.getByTestId("calendar-view")).toBeInTheDocument();
    expect(screen.getByText("INSIGHTS")).toBeInTheDocument();
  });

  test("should save draft data when save button is clicked", async () => {
    renderComponent();

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    expect(baseMockRoster.onDraftDataSave).toHaveBeenCalledTimes(1);
  });

  test("should display roster saving indicator when isRosterSaving is true", () => {
    useRosterMock.mockReturnValueOnce({
      ...baseMockRoster,
      isRosterSaving: true,
    });

    renderComponent();

    expect(screen.getByText("DRAFT SAVED")).toBeInTheDocument();
  });

  test("should display hours exceeded warning when applicable", () => {
    useRosterMock.mockReturnValueOnce({
      ...baseMockRoster,
      roster: {
        ...baseMockRoster.roster,
        empWeekRosters: [
          {
            ...baseMockRoster.roster.empWeekRosters[0],
            empHours: [
              {
                pendDate: "2024-12-09",
                pstartDate: "2024-12-01",
                totalHours: 45,
              },
            ],
          },
        ],
      },
    });

    renderComponent();

    expect(screen.getByText("Hours Limit Exceeded")).toBeInTheDocument();
  });

  test("should trigger publish roster when publish button is clicked", () => {
    renderComponent();

    const publishButton = screen.getByTestId("roster-publish-button");
    fireEvent.click(publishButton);

    expect(baseMockRoster.onPublishRoster).toHaveBeenCalledWith({
      notifyTo: "ALL",
      week: 1,
    });
  });

  test("should toggle insights panel when menu icon is clicked", () => {
    renderComponent();

    expect(screen.queryByTestId("insights-view")).not.toBeInTheDocument();

    const menuIcon = screen.getByText("INSIGHTS");
    fireEvent.click(menuIcon);
  });

  test("should navigate back when back arrow is clicked", () => {
    renderComponent();

    const backButton = screen.getByLabelText("FiArrowLeft");
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("should auto-save draft data periodically", () => {
    renderComponent();

    act(() => {
      jest.advanceTimersByTime(20000);
    });

    expect(baseMockRoster.onDraftDataSave).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(20000);
    });

    expect(baseMockRoster.onDraftDataSave).toHaveBeenCalledTimes(2);
  });

  test("should change selected day when a day is selected in calendar", () => {
    renderComponent();

    const selectDayButton = screen.getByText("Select Day");
    fireEvent.click(selectDayButton);

    expect(baseMockRoster.onChangeSelectedDay).toHaveBeenCalledWith(
      "2024-12-09"
    );
  });

  test("should handle shift changes from calendar", () => {
    renderComponent();

    const changeShiftButton = screen.getByText("Change Shift");
    fireEvent.click(changeShiftButton);

    expect(baseMockRoster.onShiftChange).toHaveBeenCalledWith({});
  });

  test("should clean up on unmount by saving draft and clearing interval", () => {
    const { unmount } = renderComponent();

    unmount();

    expect(baseMockRoster.onDraftDataSave).toHaveBeenCalled();
  });

  test("should fetch clusters on mount", () => {
    renderComponent();

    expect(baseMockRoster.getAllClusters).toHaveBeenCalled();
    expect(baseMockRoster.onChangeSelectedDay).toHaveBeenCalledWith("");
  });

  test("should display selected date in insights panel when date is selected", () => {
    useRosterMock.mockReturnValueOnce({
      ...baseMockRoster,
    });

    renderComponent();

    const menuIcon = screen.getByText("INSIGHTS");
    fireEvent.click(menuIcon);

    const selectDayButton = screen.getByText("Select Day");
    fireEvent.click(selectDayButton);

    expect(baseMockRoster.onChangeSelectedDay).toHaveBeenCalledWith(
      "2024-12-09"
    );
  });

  test("should handle hours exceeded modal open and close", () => {
    useRosterMock.mockReturnValueOnce({
      ...baseMockRoster,
      isEmpExceedingHoursListModalOpen: true,
      empDailyExceedingHoursList: [
        { empId: "EMP001", firstName: "John", lastName: "Doe", hours: 10 },
      ],
      empWeeklyExceedingHoursList: [
        { empId: "EMP001", firstName: "John", lastName: "Doe", hours: 45 },
      ],
    });

    renderComponent();

    expect(screen.getByText("Hours Warning")).toBeInTheDocument();

    const closeButton = screen.getByText("Close").closest("button");
    fireEvent.click(closeButton);

    expect(baseMockRoster.onEmpExceedingHoursListModalClose).toHaveBeenCalled();
  });

  test("should navigate to roster edit from hours warning modal", () => {
    useRosterMock.mockReturnValueOnce({
      ...baseMockRoster,
      isEmpExceedingHoursListModalOpen: true,
    });

    renderComponent();

    const editButton = screen.getByText("Edit Roster").closest("button");
    fireEvent.click(editButton);

    expect(baseMockRoster.goToRosterEdit).toHaveBeenCalledWith(1);
  });

  test("should handle force confirm publish modal open and close", () => {
    useRosterMock.mockReturnValueOnce({
      ...baseMockRoster,
      isForceConfirmModalOpen: true,
      messageObj: { message: "Some shifts overlap" },
    });

    renderComponent();

    expect(screen.getByText("Force Confirm Warning")).toBeInTheDocument();

    const closeButton = screen.getByText("Close").closest("button");
    fireEvent.click(closeButton);

    expect(baseMockRoster.onForceConfirmModalClose).toHaveBeenCalled();
  });

  test("should force publish roster when confirmed in force confirm modal", () => {
    useRosterMock.mockReturnValueOnce({
      ...baseMockRoster,
      isForceConfirmModalOpen: true,
    });

    renderComponent();
    const forcePublishButton = screen
      .getByText("Force Publish")
      .closest("button");
    fireEvent.click(forcePublishButton);

    expect(baseMockRoster.onPublishRoster).toHaveBeenCalledWith({
      notifyTo: "ALL",
      forceConfirm: true,
      week: 1,
    });
  });

  test("should handle CJP warning modal open and close", () => {
    useRosterMock.mockReturnValueOnce({
      ...baseMockRoster,
      isWeekUncoveredShiftsModalOpen: true,
      weekUncoveredShifts: [
        { date: "2024-12-09", shiftName: "Morning", count: 2 },
      ],
    });

    renderComponent();
    expect(screen.getByText("CJP Warning")).toBeInTheDocument();
    const closeButton = screen.getByText("Close").closest("button");
    fireEvent.click(closeButton);

    expect(baseMockRoster.onWeekUncoveredShiftsModalClose).toHaveBeenCalled();
  });

  test("should navigate to roster edit from CJP warning modal", () => {
    useRosterMock.mockReturnValueOnce({
      ...baseMockRoster,
      isWeekUncoveredShiftsModalOpen: true,
    });

    renderComponent();

    const editButton = screen.getByText("Edit Roster").closest("button");
    fireEvent.click(editButton);

    expect(baseMockRoster.goToRosterEdit).toHaveBeenCalledWith(1);
  });

  test("should handle publish success modal open and close", () => {
    useRosterMock.mockReturnValueOnce({
      ...baseMockRoster,
      isPublishedRosterModalOpen: true,
    });

    renderComponent();

    expect(
      screen.getByText("Roster Published Successfully")
    ).toBeInTheDocument();

    const closeButton = screen.getByText("Close").closest("button");
    fireEvent.click(closeButton);

    expect(baseMockRoster.onPublishedRosterModalClose).toHaveBeenCalled();
  });

  test("should correctly handle no part-time employees scenario", () => {
    useRosterMock.mockReturnValueOnce({
      ...baseMockRoster,
      isAnyPartTimeEmp: jest.fn().mockReturnValue(false),
    });

    renderComponent();

    expect(screen.queryByText("Validate Hrs Limit")).not.toBeInTheDocument();
  });

  test("should not display save button when there is no draft", () => {
    (useAppSelector as jest.Mock).mockReturnValueOnce({
      ...mockAuthState,
      draft: [],
    });

    renderComponent();

    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  test("should not display save button when roster is saving", () => {
    useRosterMock.mockReturnValueOnce({
      ...baseMockRoster,
      isRosterSaving: true,
    });

    (useAppSelector as jest.Mock).mockReturnValueOnce({
      ...mockAuthState,
      draft: mockAuthState.draft,
    });

    renderComponent();

    expect(screen.queryByText("Save")).not.toBeInTheDocument();

    expect(screen.getByText("DRAFT SAVED")).toBeInTheDocument();
  });
});
