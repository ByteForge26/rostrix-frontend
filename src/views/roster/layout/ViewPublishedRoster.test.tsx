import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { useApi } from "../../../hooks/useApi";
import { usePermission } from "../../../hooks/usePermission";
import { useRoster } from "../../../hooks/useRoster";
import ViewPublishedRoster from "./ViewPublishedRoster";
import { useDrop } from "react-dnd";
import { store, useAppSelector } from "../../../app/store/store";

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
  useNavigate: jest.fn(),
}));

const useRosterMock = useRoster as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;
const useApiMock = useApi as jest.Mock;

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

const renderComponent = () => {
  return render(
    <Provider store={store}>
      <ViewPublishedRoster />
    </Provider>
  );
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
};

const mockRoster = {
  selectedYear: 2024,
  onChangeYear: jest.fn(),
  years: [2023, 2024],
  weeks: [1, 2, 3, 4],
  onChangeWeek: jest.fn(),
  roster: {
    rosterWeekId: 1,
    empWeekRosters: [
      {
        empId: "EMP001",
        days: [{ date: "2024-12-09", shifts: ["Morning Shift"] }],
      },
    ],
  },
  shifts: [],
  onChangeSelectedClusterId: jest.fn(),
  getEmployeeCluster: jest.fn(),
  getAllClusters: jest.fn(),
  userClustersInfo: {},
  clusters: [
    { id: 1, name: "Cluster 1", editable: true },
    { id: 2, name: "Cluster 2", editable: true },
    { id: 3, name: "Cluster 3", editable: true },
    { id: 4, name: "Cluster 4", editable: true },
    { id: 5, name: "Cluster 5", editable: true },
    { id: 6, name: "Cluster 6", editable: true },
    { id: 7, name: "Cluster 7", editable: true },
  ],
  selectedClusterId: 1,
  miscWorks: [],
  onChangeSelectedDay: jest.fn(),
  visibleClusters: [1, 2, 3, 4, 5, 6, 7],
};

describe("ViewPublishedRoster", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    jest.clearAllMocks();
    useRosterMock.mockReturnValue(mockRoster);
    (useAppSelector as jest.Mock).mockReturnValue(mockAuthState);
    useApiMock.mockReturnValue({
      post: jest.fn((url, payload) => {
        return Promise.resolve({
          data: {
            success: true,
            message: "Shift swapped successfully",
          },
        });
      }),
    });

    const handleDropMock = jest.fn();
    (useDrop as jest.Mock).mockReturnValue([
      { isOver: false, canDrop: true },
      handleDropMock,
    ]);
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn(() => true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  it("should render the ViewPublishedRoster component", () => {
    renderComponent();
    expect(
      screen.getByText("Layout | View Published Roster")
    ).toBeInTheDocument();
  });

  it("Swaping shifts", () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-12-08T00:00:00Z"));
    const mockRosterTemp = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
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
              misc: [
                { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
              ],
              others: [{ s: "13:00", e: "14:00", c: "Meeting", type: "Admin" }],
            },
            {
              id: 1,
              date: "2024-12-10",
              empId: "EMP001",
              status: "WORKING",
              edit: true,
              impacted: false,
              subRole: "Lead",
              impacts: [{ type: "Overtime", ts: "2024-12-09T10:00:00Z" }],
              metaData: "{}",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [
                { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
              ],
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
        {
          empId: "EMP002",
          fistName: "Alice",
          lastName: "Doe",
          contractId: 1,
          days: [
            {
              id: 1,
              date: "2024-12-09",
              empId: "EMP002",
              status: "LEAVE",
              edit: true,
              impacted: false,
              subRole: "Lead",
              impacts: [{ type: "Overtime", ts: "2024-12-09T10:00:00Z" }],
              metaData: "{}",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [
                { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
              ],
              others: [{ s: "13:00", e: "14:00", c: "Meeting", type: "Admin" }],
            },
            {
              id: 1,
              date: "2024-12-10",
              empId: "EMP001",
              status: "LEAVE",
              edit: true,
              impacted: false,
              subRole: "Lead",
              impacts: [{ type: "Overtime", ts: "2024-12-09T10:00:00Z" }],
              metaData: "{}",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [
                { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
              ],
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
      assignedJobShifts: [
        {
          date: "2024-12-09",
          jobs: [
            {
              jobType: "CASHIERING",
              miscWorkId: 101,
              type: "Primary",
              shifts: [{ id: 1, startTime: "09:00", endTime: "12:00" }],
            },
          ],
        },
      ],
      message: "Roster generated successfully.",
      rosterStatus: "FINALIZED",
      success: true,
    };
    useRosterMock.mockReturnValueOnce({
      ...mockRoster,
      roster: {
        rosterWeekId: 1,
        empWeekRosters: [
          {
            empId: "EMP001",
            fistName: "John",
            lastName: "Doe",
            contractId: 1,
            days: [
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
                misc: [
                  { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
                ],
                others: [
                  { s: "13:00", e: "14:00", c: "Meeting", type: "Admin" },
                ],
              },
              {
                id: 1,
                date: "2024-12-10",
                empId: "EMP001",
                status: "LEAVE",
                edit: true,
                impacted: false,
                subRole: "Lead",
                impacts: [{ type: "Overtime", ts: "2024-12-09T10:00:00Z" }],
                metaData: "{}",
                main: [{ s: "09:00", e: "17:00", c: "Office" }],
                misc: [
                  { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
                ],
                others: [
                  { s: "13:00", e: "14:00", c: "Meeting", type: "Admin" },
                ],
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
          {
            empId: "EMP002",
            fistName: "Alice",
            lastName: "Doe",
            contractId: 1,
            days: [
              {
                id: 1,
                date: "2024-12-09",
                empId: "EMP002",
                status: "LEAVE",
                edit: true,
                impacted: false,
                subRole: "Lead",
                impacts: [{ type: "Overtime", ts: "2024-12-09T10:00:00Z" }],
                metaData: "{}",
                main: [{ s: "09:00", e: "17:00", c: "Office" }],
                misc: [
                  { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
                ],
                others: [
                  { s: "13:00", e: "14:00", c: "Meeting", type: "Admin" },
                ],
              },
              {
                id: 1,
                date: "2024-12-10",
                empId: "EMP001",
                status: "LEAVE",
                edit: true,
                impacted: false,
                subRole: "Lead",
                impacts: [{ type: "Overtime", ts: "2024-12-09T10:00:00Z" }],
                metaData: "{}",
                main: [{ s: "09:00", e: "17:00", c: "Office" }],
                misc: [
                  { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
                ],
                others: [
                  { s: "13:00", e: "14:00", c: "Meeting", type: "Admin" },
                ],
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
        assignedJobShifts: [
          {
            date: "2024-12-09",
            jobs: [
              {
                jobType: "CASHIERING",
                miscWorkId: 101,
                type: "Primary",
                shifts: [{ id: 1, startTime: "09:00", endTime: "12:00" }],
              },
            ],
          },
        ],
      },
      shifts: [{ shiftId: "SHIFT1", name: "Morning Shift" }],
      clusters: [
        { id: 1, name: "Cluster 1", editable: true },
        { id: 2, name: "Cluster 2", editable: true },
        { id: 3, name: "Cluster 3", editable: true },
        { id: 4, name: "Cluster 4", editable: true },
        { id: 5, name: "Cluster 5", editable: true },
        { id: 6, name: "Cluster 6", editable: true },
        { id: 7, name: "Cluster 7", editable: true },
      ],
      userClustersInfo: {
        memberOfClusters: [1],
        leaderOfClusters: [2],
      },
      visibleClusters: [1, 2, 3, 4, 5, 6, 7],
      selectedClusterId: 1,
    });

    useRosterMock.mockReturnValue({
      ...mockRoster,
      roster: {
        rosterWeekId: 1,
        empWeekRosters: [
          {
            empId: "EMP001",
            fistName: "John",
            lastName: "Doe",
            contractId: 1,
            days: [
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
                misc: [
                  { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
                ],
                others: [{ s: "13:00", e: "14:00", c: "Meeting", type: "DM" }],
              },
              {
                id: 1,
                date: "2024-12-10",
                empId: "EMP001",
                status: "LEAVE",
                edit: true,
                impacted: false,
                subRole: "Lead",
                impacts: [{ type: "Overtime", ts: "2024-12-09T10:00:00Z" }],
                metaData: "{}",
                main: [{ s: "09:00", e: "17:00", c: "Office" }],
                misc: [
                  { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
                ],
                others: [{ s: "13:00", e: "14:00", c: "Meeting", type: "DM" }],
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
          {
            empId: "EMP002",
            fistName: "Alice",
            lastName: "Doe",
            contractId: 1,
            days: [
              {
                id: 1,
                date: "2024-12-09",
                empId: "EMP002",
                status: "LEAVE",
                edit: true,
                impacted: false,
                subRole: "Lead",
                impacts: [{ type: "Overtime", ts: "2024-12-09T10:00:00Z" }],
                metaData: "{}",
                main: [{ s: "09:00", e: "17:00", c: "Office" }],
                misc: [
                  { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
                ],
                others: [{ s: "13:00", e: "14:00", c: "Meeting", type: "DM" }],
              },
              {
                id: 1,
                date: "2024-12-10",
                empId: "EMP001",
                status: "LEAVE",
                edit: true,
                impacted: false,
                subRole: "Lead",
                impacts: [{ type: "Overtime", ts: "2024-12-09T10:00:00Z" }],
                metaData: "{}",
                main: [{ s: "09:00", e: "17:00", c: "Office" }],
                misc: [
                  { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
                ],
                others: [{ s: "13:00", e: "14:00", c: "Meeting", type: "DM" }],
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
        assignedJobShifts: [
          {
            date: "2024-12-09",
            jobs: [
              {
                jobType: "CASHIERING",
                miscWorkId: 101,
                type: "Primary",
                shifts: [{ id: 1, startTime: "09:00", endTime: "12:00" }],
              },
            ],
          },
        ],
      },
      shifts: [{ shiftId: "SHIFT1", name: "Morning Shift" }],
      clusters: [
        { id: 1, name: "Cluster 1", editable: true },
        { id: 2, name: "Cluster 2", editable: true },
        { id: 3, name: "Cluster 3", editable: true },
        { id: 4, name: "Cluster 4", editable: true },
        { id: 5, name: "Cluster 5", editable: true },
        { id: 6, name: "Cluster 6", editable: true },
        { id: 7, name: "Cluster 7", editable: true },
      ],
      userClustersInfo: {
        memberOfClusters: [1],
        leaderOfClusters: [2],
      },
      visibleClusters: [1, 2, 3, 4, 5, 6, 7],
      selectedClusterId: 1,
    });

    renderComponent();

    expect(screen.getByText("Select Week")).toBeInTheDocument();

    const swapButton = screen.getByText("Swap Shift");

    const insightButton = screen.getByText("INSIGHTS");

    fireEvent.click(swapButton);

    fireEvent.click(insightButton);

    const buttons = screen.getAllByRole("button", { name: "Mon" });
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);

    const swapWithDropdown = screen.getByText("Swap With");
    expect(swapWithDropdown).toBeInTheDocument();

    const comboboxes = screen.getAllByRole("combobox");

    fireEvent.change(comboboxes[0], {
      target: { value: "Alice" },
    });

    const swap_with = screen.getByText("Alice | EMP002 | Full-Time");
    expect(swap_with).toBeInTheDocument();
    fireEvent.click(swap_with);

    const checkboxes = screen.getAllByText("9 AM - 5 PM (8 hr)");
    fireEvent.click(checkboxes[0]);

    fireEvent.click(checkboxes[1]);

    const swap = screen.getByText("Swap");

    fireEvent.click(swap);
  });
});
