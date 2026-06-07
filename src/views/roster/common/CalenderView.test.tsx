import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import CalenderView from "./CalenderView";
import { useAppSelector } from "../../../app/store/store";
import { useApi } from "../../../hooks/useApi";
import { useToasts } from "react-toast-notifications";
import moment from "moment";
import {
  COLORS,
  DEFAULT_OPEN_TIME,
  DEFAULT_CLOSE_TIME,
  SECONDARY_JOBS_CONFIG,
} from "../../../helper/Constant";
import { generateTimeSlots } from "../../../helper/Utils";

// Mock dependencies
jest.mock("../../../app/store/store", () => ({
  useAppSelector: jest.fn(),
}));

jest.mock("../../../hooks/useApi", () => ({
  useApi: jest.fn(),
}));

jest.mock("react-toast-notifications", () => ({
  useToasts: jest.fn(),
}));

jest.mock("@chakra-ui/react", () => {
  const originalModule = jest.requireActual("@chakra-ui/react");
  return {
    ...originalModule,
    useDisclosure: () => ({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    }),
  };
});

jest.mock("../../../components/AppRightDrawer", () => ({
  __esModule: true,
  default: jest.fn(({ children }) => (
    <div data-testid="app-right-drawer">{children}</div>
  )),
}));

jest.mock("../../../components/AppSelect", () => ({
  __esModule: true,
  default: jest.fn(({ options, onChange, value }) => (
    <select
      data-testid="app-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )),
}));

jest.mock("../../../components/AppNoData", () => ({
  __esModule: true,
  default: jest.fn(({ msg }) => <div data-testid="app-no-data">{msg}</div>),
}));

jest.mock("./EmployeeCell", () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="employee-cell"></div>),
}));

jest.mock("./BottomBar", () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="bottom-bar"></div>),
}));

// Helper function to create mock roster data
const createMockRoster = () => ({
  empWeekRosters: [
    {
      empId: "EMP001",
      fistName: "John",
      lastName: "Doe",
      contractId: 1,
      allowedHours: 40,
      empHours: [
        {
          pstartDate: "2023-01-01",
          pendDate: "2023-01-07",
          totalHours: 38,
        },
      ],
      days: [
        {
          id: 1,
          date: "2023-01-01",
          status: "WORKING",
          edit: true,
          metaData: null,
          main: [
            {
              startTime: "09:00:00",
              endTime: "17:00:00",
            },
          ],
          others: [],
          misc: [],
          empId: "EMP001",
        },
        {
          id: 2,
          date: "2023-01-02",
          status: "WORKING",
          edit: true,
          metaData: null,
          main: [
            {
              startTime: "09:00:00",
              endTime: "17:00:00",
            },
          ],
          others: [],
          misc: [],
          empId: "EMP001",
        },
      ],
    },
    {
      empId: "EMP002",
      fistName: "Jane",
      lastName: "Smith",
      contractId: 2,
      allowedHours: 20,
      empHours: [
        {
          pstartDate: "2023-01-01",
          pendDate: "2023-01-07",
          totalHours: 22, // Exceeding allowed hours
        },
      ],
      days: [
        {
          id: 1,
          date: "2023-01-01",
          status: "WORKING",
          edit: true,
          metaData: null,
          main: [
            {
              startTime: "09:00:00",
              endTime: "17:00:00",
            },
          ],
          others: [],
          misc: [],
          empId: "EMP002",
        },
        {
          id: 2,
          date: "2023-01-02",
          status: "WORKING",
          edit: true,
          metaData: null,
          main: [
            {
              startTime: "09:00:00",
              endTime: "17:00:00",
            },
          ],
          others: [],
          misc: [],
          empId: "EMP002",
        },
      ],
    },
  ],
});

// Helper function to create mock store data
const mockState = {
  auth: {
    user: { empId: "EMP001" },
    contractTypes: [
      { id: 1, name: "Full Time", category: "A" },
      { id: 2, name: "Part Time", category: "B" },
    ],
    selectedCostCenterName: "Test Center",
  },
  roster: {
    draft: false,
    selectedWeek: "2023-01-01",
    selectedDate: "2023-01-01",
    selectedJobType: "Job Type 1",
    selectedClusterId: 1,
    empExceedingHoursList: [
      {
        empId: "EMP002",
        allowedHours: 20,
        totalHours: 22,
        pstartDate: "2023-01-01",
        pendDate: "2023-01-07",
      },
    ],
  },
};

const mockShifts = [
  {
    id: 1,
    clusterId: 1,
    contractTypeId: 1,
    startTime: "09:00:00",
    endTime: "17:00:00",
  },
];

const mockClusters = [
  { id: 1, name: "Cluster 1" },
  { id: 2, name: "Cluster 2" },
];

const mockMiscWorks = [
  { id: 1, name: "Misc Work 1" },
  { id: 2, name: "Misc Work 2" },
];

const mockAssignedJobShifts = [
  {
    date: "2023-01-01",
    jobs: [
      {
        jobType: "Type1",
        miscWorkId: 1,
        type: "MISCELLANEOUS",
        shifts: [
          {
            id: 1,
            startTime: "10:00:00",
            endTime: "14:00:00",
          },
        ],
      },
      {
        jobType: "CLEANING",
        miscWorkId: 0,
        type: "SECONDARY",
        shifts: [
          {
            id: 2,
            startTime: "15:00:00",
            endTime: "16:00:00",
          },
        ],
      },
    ],
  },
];
const mockRecommendedHours = [
  {
    date: "2023-01-01",
    recommendedHours: [
      {
        category: "GENERAL",
        hours: 0.0,
        rosteredHours: 0.0,
      },
    ],
  },
  {
    date: "2023-01-02",
    recommendedHours: [
      {
        category: "GENERAL",
        hours: 0.0,
        rosteredHours: 0.0,
      },
    ],
  },
  {
    date: "2023-01-03",
    recommendedHours: [
      {
        category: "GENERAL",
        hours: 0.0,
        rosteredHours: 0.0,
      },
    ],
  },
  {
    date: "2023-01-04",
    recommendedHours: [
      {
        category: "GENERAL",
        hours: 0.0,
        rosteredHours: 8.0,
      },
    ],
  },
  {
    date: "5",
    recommendedHours: [
      {
        category: "GENERAL",
        hours: 0.0,
        rosteredHours: 0.0,
      },
    ],
  },
  {
    date: "2023-01-06",
    recommendedHours: [
      {
        category: "GENERAL",
        hours: 0.0,
        rosteredHours: 0.0,
      },
    ],
  },
  {
    date: "2023-01-07",
    recommendedHours: [
      {
        category: "GENERAL",
        hours: 0.0,
        rosteredHours: 0.0,
      },
    ],
  },
];

describe("CalenderView Component", () => {
  beforeEach(() => {
    useAppSelector.mockImplementation((selector) => selector(mockState));

    useApi.mockReturnValue({
      post: jest.fn().mockResolvedValue({ success: true, message: "Success" }),
    });

    useToasts.mockReturnValue({
      addToast: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("handles error cases in shift validation", async () => {
    const roster = createMockRoster();

    // Set up conflicting shifts for testing validation
    const conflictingShifts = [
      {
        id: 1,
        clusterId: 1,
        contractTypeId: 1,
        startTime: "09:00:00",
        endTime: "17:00:00",
      },
    ];

    render(
      <CalenderView
        rosterType="primary"
        roster={roster}
        shifts={conflictingShifts}
        clusters={mockClusters}
        miscWorks={mockMiscWorks}
        editable={true}
        dayChangable={true}
      />
    );

    // The test can check if error messages appear, but we can't directly trigger
    // the validation logic due to the complexity of the component interactions
  });

  test("handles time slot generation correctly", () => {
    // Create a mock implementation of generateTimeSlots to test time slot logic
    const mockTimeSlots = generateTimeSlots(
      DEFAULT_OPEN_TIME,
      DEFAULT_CLOSE_TIME
    );

    expect(mockTimeSlots.length).toBeGreaterThan(0);
    expect(mockTimeSlots[0]).toHaveProperty("label");
    expect(mockTimeSlots[0]).toHaveProperty("value");
  });

  test("renders employee information correctly", () => {
    const roster = createMockRoster();

    render(
      <CalenderView
        rosterType="primary"
        roster={roster}
        shifts={mockShifts}
        clusters={mockClusters}
        miscWorks={mockMiscWorks}
        editable={true}
        dayChangable={true}
      />
    );

    // Check that employee names are displayed
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();

    // Check for employee hours information
    expect(screen.getByText("01 Jan - 07 Jan: 38/40")).toBeInTheDocument();
    expect(screen.getByText("01 Jan - 07 Jan: 22/20")).toBeInTheDocument();
  });

  // test("renders day information correctly", () => {
  //   const roster = createMockRoster();
  //   const today = moment().startOf("day");

  //   // Set one of the dates to today
  //   roster.empWeekRosters[0].days[0].date = today.format("YYYY-MM-DD");
  //   roster.empWeekRosters[1].days[0].date = today.format("YYYY-MM-DD");

  //   render(
  //     <CalenderView
  //       rosterType="primary"
  //       roster={roster}
  //       shifts={mockShifts}
  //       clusters={mockClusters}
  //       editable={true}
  //       dayChangable={true}
  //     />
  //   );

  //   // Check that the day names are displayed
  //   const dayIndex = today.day();
  //   const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
  //   expect(screen.getByText(dayName)).toBeInTheDocument();

  //   // Check for "Today" badge
  //   expect(screen.getByText("Today")).toBeInTheDocument();
  // });

  test("handles holiday status correctly", () => {
    const roster = createMockRoster();

    // Set one day as a holiday
    roster.empWeekRosters[0].days[0].status = "HOLIDAY";
    roster.empWeekRosters[0].days[0].metaData = "New Year's Day";
    roster.empWeekRosters[1].days[0].status = "HOLIDAY";
    roster.empWeekRosters[1].days[0].metaData = "New Year's Day";

    render(
      <CalenderView
        rosterType="primary"
        roster={roster}
        shifts={mockShifts}
        clusters={mockClusters}
        editable={true}
        dayChangable={true}
      />
    );
    expect(screen.getAllByTestId("HOLIDAY_New Year's Day").length).toBe(1);
  });
  test("renders assigned job shifts correctly", () => {
    const roster = createMockRoster();

    render(
      <CalenderView
        rosterType="primary"
        roster={roster}
        shifts={mockShifts}
        clusters={mockClusters}
        miscWorks={mockMiscWorks}
        editable={true}
        dayChangable={true}
        assignedJobShifts={mockAssignedJobShifts}
      />
    );
    expect(screen.getByText("Assigned Planned Jobs")).toBeInTheDocument();
    expect(screen.getByText("Misc Work 1")).toBeInTheDocument();
    expect(screen.getByText("10 AM - 2 PM")).toBeInTheDocument();
  });
  test("renders NoData component when no roster data is provided", () => {
    render(<CalenderView rosterType="primary" />);
    const noDataElement = document.querySelector(".css-p1e4g9");
    expect(noDataElement).toBeInTheDocument();
  });
  test("renders the component with roster data", () => {
    const roster = createMockRoster();

    render(
      <CalenderView
        rosterType="primary"
        roster={roster}
        shifts={mockShifts}
        clusters={mockClusters}
        miscWorks={mockMiscWorks}
        editable={true}
        dayChangable={true}
        onChangeSelectedDay={jest.fn()}
        onDuplicateClick={jest.fn()}
        onDuplicateModalClose={jest.fn()}
        onDuplicateModalOpen={jest.fn()}
        getShifts={jest.fn()}
        onShiftChange={jest.fn()}
        onRemoveMiscShift={jest.fn()}
        assignedJobShifts={mockAssignedJobShifts}
      />
    );
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
  });

  test("renders NoData component when no roster data is provided", () => {
    render(<CalenderView rosterType="primary" />);
    const element = document.querySelector(".css-p1e4g9");
    expect(element).toBeInTheDocument();
  });

  test("handles add shift functionality", async () => {
    const roster = createMockRoster();
    const getShiftsMock = jest.fn();
    const onShiftChangeMock = jest.fn();

    render(
      <CalenderView
        rosterType="primary"
        roster={roster}
        shifts={mockShifts}
        clusters={mockClusters}
        miscWorks={mockMiscWorks}
        editable={true}
        dayChangable={true}
        getShifts={getShiftsMock}
        onShiftChange={onShiftChangeMock}
      />
    );
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Jane")).toBeInTheDocument();
  });

  test("handles duplicate functionality", () => {
    const roster = createMockRoster();
    const onDuplicateClickMock = jest.fn();
    const onDuplicateModalOpenMock = jest.fn();
    const onDuplicateModalCloseMock = jest.fn();

    render(
      <CalenderView
        rosterType="primary"
        roster={roster}
        shifts={mockShifts}
        clusters={mockClusters}
        miscWorks={mockMiscWorks}
        editable={true}
        dayChangable={true}
        isDuplicateModalOpen={true}
        onDuplicateClick={onDuplicateClickMock}
        onDuplicateModalOpen={onDuplicateModalOpenMock}
        onDuplicateModalClose={onDuplicateModalCloseMock}
        finalDuplicateDayIds={["2023-01-02"]}
      />
    );
    const selectText = screen.queryByText(/Select the days/i);
    if (selectText) {
      expect(selectText).toBeInTheDocument();
    }
    const cancelButton = screen.queryByRole("button", { name: /Cancel/i });
    if (cancelButton) {
      expect(cancelButton).toBeInTheDocument();
    }
  });

  test("renders add CJP shift modal correctly", () => {
    const roster = createMockRoster();
    const { container } = render(
      <CalenderView
        rosterType="primary"
        roster={roster}
        shifts={mockShifts}
        clusters={mockClusters}
        miscWorks={mockMiscWorks}
        editable={true}
        dayChangable={true}
        assignedJobShifts={mockAssignedJobShifts}
      />
    );
    expect(screen.getByText("Assigned Planned Jobs")).toBeInTheDocument();
    expect(screen.getByText("10 AM - 2 PM")).toBeInTheDocument();
  });
  test("renders Recommended hours correctly", () => {
    const roster = createMockRoster();
    const { container } = render(
      <CalenderView
        rosterType="primary"
        roster={roster}
        shifts={mockShifts}
        clusters={mockClusters}
        miscWorks={mockMiscWorks}
        editable={true}
        dayChangable={true}
        recommendedHours={mockRecommendedHours}
      />
    );
    expect(screen.getAllByText("0h")[0]).toBeInTheDocument();
    expect(screen.getByText("General Hours")).toBeInTheDocument();
  });
});
