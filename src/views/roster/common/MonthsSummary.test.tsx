import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MonthsSummary from "./MonthsSummary";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import "@testing-library/jest-dom";
import { MONTHS, ROSTER_STATUS } from "../../../helper/Constant";

// Mock the constants first
jest.mock("../../../helper/Constant", () => ({
  MONTHS: [
    "Jan",
    "Feb",
    "March",
    "April",
    "May",
    "June",
    "July",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ],
  ROSTER_STATUS: [
    {
      status: "IP",
      name: "In Progress",
      background: "blue.500",
      color: "white",
    },
    {
      status: "NI",
      name: "Yet to be Created",
      background: "gray.500",
      color: "white",
    },
    {
      status: "NA",
      name: "Not Available",
      background: "red.500",
      color: "white",
    },
    { status: "P", name: "Published", background: "green.500", color: "white" },
  ],
  PUBLISH_OPTIONS: [
    { value: "all", label: "All" },
    { value: "managers", label: "Managers Only" },
    { value: "employees", label: "Employees Only" },
  ],
}));

// Fix the moment mock to properly handle dates with unix method
jest.mock("moment", () => {
  function mockMoment(date) {
    // Always return an object with a unix method
    return {
      unix: () => {
        if (!date) return 1614556800; // Default timestamp

        // Return different timestamps for specific dates to maintain sort order
        if (date === "2025-03-03") return 1614729600;
        if (date === "2025-03-10") return 1615334400;
        if (date === "2025-03-17") return 1615939200;
        if (date === "2025-03-24") return 1616544000;

        try {
          // Try to convert the date to a timestamp
          return Math.floor(new Date(date).getTime() / 1000);
        } catch (e) {
          // Fallback for any parsing errors
          return 1614556800;
        }
      },
      format: (fmt) => `formatted-${date || "now"}`,
      toDate: () => new Date(date || "2025-03-01"),
    };
  }

  // Mock static methods
  mockMoment.unix = (timestamp) =>
    mockMoment(new Date(timestamp * 1000).toISOString());

  return mockMoment;
});

// Mock the store with a function to allow state updates during tests
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      roster: (
        state = {
          selectedYear: 2025,
          selectedMonth: 2, // March
          selectedWeek: 10,
          ...initialState,
        }
      ) => state,
    },
  });
};

// Create a navigate mock
const mockNavigate = jest.fn();

// Mock useNavigate
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock helper utility functions
jest.mock("../../../helper/Utils", () => ({
  formatDate: (date, options) =>
    options?.time ? `formatted-${date}-with-time` : `formatted-${date}`,
  isFutureWeek: jest.fn().mockReturnValue(true),
}));

// Mock images
jest.mock("../../../helper/Images", () => ({
  rosterV2Image: "test-image-url",
}));

// Mock the modal components
jest.mock("./RosterPublishSuccess", () => {
  return function DummyComponent(props) {
    return <div data-testid="publish-success-modal" />;
  };
});

jest.mock("./RosterPublishHoursWarning", () => {
  return function DummyComponent(props) {
    return <div data-testid="publish-hours-warning-modal" />;
  };
});

jest.mock("./RosterPublishForceConfirmWarning", () => {
  return function DummyComponent(props) {
    return <div data-testid="publish-force-confirm-modal" />;
  };
});

jest.mock("./RosterPublishCJPWarning", () => {
  return function DummyComponent(props) {
    return <div data-testid="publish-cjp-warning-modal" />;
  };
});

// Mock the RosterPublishButton component
jest.mock("./RosterPublishButton", () => {
  return function DummyPublishButton({ onPublishRoster, setGlobalNotifyTo }) {
    return (
      <button
        data-testid="publish-button"
        onClick={() => onPublishRoster({ notifyTo: "all" })}
      >
        Publish
      </button>
    );
  };
});

// Mock the AppTabs component
jest.mock("../../../components/AppTabs", () => {
  return function DummyAppTabs({ tabs, setValue, value }) {
    return (
      <div data-testid="app-tabs-mock">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            data-testid={`week-tab-${tab.value}`}
            data-value={tab.value}
            onClick={() => setValue(tab.value)}
          >
            {tab.name}
          </button>
        ))}
      </div>
    );
  };
});

// Mock the useDisclosure hook
const mockDisclosure = {
  isOpen: false,
  onOpen: jest.fn(),
  onClose: jest.fn(),
};

jest.mock("@chakra-ui/react", () => {
  const originalModule = jest.requireActual("@chakra-ui/react");
  return {
    ...originalModule,
    useDisclosure: () => mockDisclosure,
  };
});

describe("MonthsSummary Component", () => {
  // Reset all mocks before each test
  beforeEach(() => {
    mockNavigate.mockReset();
    mockDisclosure.isOpen = false;
    mockDisclosure.onOpen.mockReset();
    mockDisclosure.onClose.mockReset();
    jest.clearAllMocks();
  });

  const defaultProps = {
    monthSummary: [
      {
        month: 2, // March
        publishable: true,
        status: "IP", // In Progress
        weekList: [
          {
            week: 10,
            status: "IP",
            startDate: "2025-03-03",
            endDate: "2025-03-09",
            initAt: "2025-03-01T10:00:00Z",
            initBy: "John Doe",
            updatedAt: "2025-03-02T14:30:00Z",
            updatedBy: "Jane Smith",
            impacted: false,
          },
          {
            week: 11,
            status: "NI", // Not Initialized
            startDate: "2025-03-10",
            endDate: "2025-03-16",
            initAt: null,
            initBy: null,
            updatedAt: null,
            updatedBy: null,
            impacted: false,
          },
        ],
      },
    ],
    onPublishRoster: jest.fn().mockResolvedValue(undefined),
    onChangeWeek: jest.fn(),
    onCloneWeekModalOpen: jest.fn(),
    goToRosterEdit: jest.fn(),
    isPublishedRosterModalOpen: false,
    onPublishedRosterModalClose: jest.fn(),
    rosterType: "primary",
    empExceedingHoursList: [],
    empWeeklyExceedingHoursList: [],
    empDailyExceedingHoursList: [],
    isEmpExceedingHoursListModalOpen: false,
    onEmpExceedingHoursListModalClose: jest.fn(),
    payrollConfig: {
      currentPStartDateTime: "2025-02-28T00:00:00Z",
    },
    isForceConfirmModalOpen: false,
    onForceConfirmModalClose: jest.fn(),
    messageObj: [],
    isWeekUncoveredShiftsModalOpen: false,
    onWeekUncoveredShiftsModalClose: jest.fn(),
    weekUncoveredShifts: [],
    globalNotifyTo: "all",
    setGlobalNotifyTo: jest.fn(),
  };

  const renderComponent = (props = {}, storeState = {}) => {
    return render(
      <Provider store={createMockStore(storeState)}>
        <MemoryRouter>
          <MonthsSummary {...defaultProps} {...props} />
        </MemoryRouter>
      </Provider>
    );
  };

  // Test for checking NI weeks calculation and setting state
  it("correctly identifies and sets Not Initialized weeks", async () => {
    // Setup props with multiple NI weeks
    const propsWithNIWeeks = {
      monthSummary: [
        {
          month: 2, // March
          publishable: true,
          status: "IP", // In Progress
          weekList: [
            {
              week: 10,
              status: "IP",
              startDate: "2025-03-03",
              endDate: "2025-03-09",
              initAt: "2025-03-01T10:00:00Z",
              initBy: "John Doe",
              updatedAt: "2025-03-02T14:30:00Z",
              updatedBy: "Jane Smith",
              impacted: false,
            },
            {
              week: 11,
              status: "NI", // Not Initialized
              startDate: "2025-03-10",
              endDate: "2025-03-16",
              initAt: null,
              initBy: null,
              updatedAt: null,
              updatedBy: null,
              impacted: false,
            },
            {
              week: 12,
              status: "NI", // Not Initialized
              startDate: "2025-03-17",
              endDate: "2025-03-23",
              initAt: null,
              initBy: null,
              updatedAt: null,
              updatedBy: null,
              impacted: false,
            },
          ],
        },
      ],
    };

    // Mock the publish button click to trigger checkForNIWeeks
    renderComponent(propsWithNIWeeks);

    // Click publish button to trigger checkForNIWeeks
    const publishButton = screen.getByTestId("publish-button");
    fireEvent.click(publishButton);

    // Check that onPublishWarningOpen was called, which means NI weeks were found
    expect(mockDisclosure.onOpen).toHaveBeenCalled();

    // onPublishRoster should not be called yet
    expect(defaultProps.onPublishRoster).not.toHaveBeenCalled();
  });

  // Test for handling publishing with no NI weeks
  it("calls onPublishRoster directly when there are no NI weeks", async () => {
    // Setup props with no NI weeks
    const propsWithNoNIWeeks = {
      monthSummary: [
        {
          month: 2, // March
          publishable: true,
          status: "IP", // In Progress
          weekList: [
            {
              week: 10,
              status: "IP",
              startDate: "2025-03-03",
              endDate: "2025-03-09",
              initAt: "2025-03-01T10:00:00Z",
              initBy: "John Doe",
              updatedAt: "2025-03-02T14:30:00Z",
              updatedBy: "Jane Smith",
              impacted: false,
            },
            {
              week: 11,
              status: "IP", // In Progress (not NI)
              startDate: "2025-03-10",
              endDate: "2025-03-16",
              initAt: "2025-03-05T10:00:00Z",
              initBy: "John Doe",
              updatedAt: "2025-03-06T14:30:00Z",
              updatedBy: "Jane Smith",
              impacted: false,
            },
          ],
        },
      ],
    };

    renderComponent(propsWithNoNIWeeks);

    // Click publish button - this should call onPublishRoster directly
    const publishButton = screen.getByTestId("publish-button");
    fireEvent.click(publishButton);

    // Check that onPublishRoster was called (no warning needed)
    expect(defaultProps.onPublishRoster).toHaveBeenCalledWith({
      notifyTo: "all",
    });

    // The warning modal should not be opened
    expect(mockDisclosure.onOpen).not.toHaveBeenCalled();
  });
});

//   81.81 |    56.25 |      80 |   81.81
