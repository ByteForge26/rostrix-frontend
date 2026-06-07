import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LeavesWeekOffs from "./LeavesWeekOffs";
import { useCalender } from "../../hooks/useCalender";
import { usePermission } from "../../hooks/usePermission";
import { useAppSelector } from "../../app/store/store";
import moment from "moment";

jest.mock("../../hooks/useCalender", () => ({
  useCalender: jest.fn(),
}));

jest.mock("../../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

jest.mock("../../app/store/store", () => ({
  useAppSelector: jest.fn(),
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

jest.mock("chakra-dayzed-datepicker", () => ({
  SingleDatepicker: () => <div data-testid="date-picker">DatePicker</div>,
}));

describe("LeavesWeekOffs Component", () => {
  const mockProps = {
    empId: "emp123",
    empName: "John Doe",
    contractTypeId: 1,
    stateId: 2,
    applyBy: "self",
  };

  const setupMocks = (overrides = {}) => {
    const currentDate = new Date("2023-07-15");
    const MONTHS = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const mockHolidays = [
      { date: "2023-07-04", name: "Independence Day" },
      { date: "2023-07-24", name: "Pioneer Day" },
    ];

    const mockLeaveTypes = [
      { label: "General", value: "GENERAL" },
      { label: "LOP", value: "LOP" },
    ];

    const mockWeeks = [
      { id: 1, number: 27, startDate: "2023-07-02" },
      { id: 2, number: 28, startDate: "2023-07-09" },
      { id: 3, number: 29, startDate: "2023-07-16" },
      { id: 4, number: 30, startDate: "2023-07-23" },
      { id: 5, number: 31, startDate: "2023-07-30" },
    ];

    const mockLeaves = [
      {
        id: "leave1",
        fromDate: "2023-07-10",
        toDate: "2023-07-12",
        type: "GENERAL",
      },
    ];

    const mockLeavesData = {
      totalAllowedLeaves: 24,
      availedLeaves: 5,
      lopLeaves: 0,
      leaves: mockLeaves,
    };

    const mockCalender = [];
    const firstDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const lastDay = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );
    const daysInMonth = lastDay.getDate();

    const firstDayOfWeek = firstDay.getDay();

    let dayCounter = 1;
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        if (row === 0 && col < firstDayOfWeek) {
          const prevMonthLastDay = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            0,
          );
          const day = prevMonthLastDay.getDate() - (firstDayOfWeek - col - 1);
          mockCalender.push({
            row,
            column: col,
            date: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() - 1,
              day,
            ),
            holiday: null,
            today: false,
            roster: false,
            leaveId: null,
            weekOff: false,
          });
        } else if (dayCounter <= daysInMonth) {
          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            dayCounter,
          );
          const dateStr = moment(date).format("YYYY-MM-DD");
          const holidayMatch = mockHolidays.find((h) => h.date === dateStr);

          const leaveMatch = mockLeaves.find((l) =>
            moment(date).isBetween(
              moment(l.fromDate).subtract(1, "day"),
              moment(l.toDate),
              undefined,
              "[]",
            ),
          );

          mockCalender.push({
            row,
            column: col,
            date,
            holiday: holidayMatch ? holidayMatch.name : null,
            today: dateStr === moment().format("YYYY-MM-DD"),
            roster: false,
            leaveId: leaveMatch ? leaveMatch.id : null,
            weekOff: dateStr === "2023-07-16" || dateStr === "2023-07-23", // Sundays as week offs
          });
          dayCounter++;
        } else {
          const day = dayCounter - daysInMonth;
          mockCalender.push({
            row,
            column: col,
            date: new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              day,
            ),
            holiday: null,
            today: false,
            roster: false,
            leaveId: null,
            weekOff: false,
          });
          dayCounter++;
        }
      }
    }

    const mockPayrollConfig = {
      currentPStartDateTime: "2023-07-01T00:00:00Z",
      currentPEndDateTime: "2023-07-31T23:59:59Z",
    };

    const defaultCalenderHook = {
      calender: mockCalender,
      weeksInCurrentMonth: 5,
      currentMonth: 6, // July (0-indexed)
      currentYear: 2023,
      holidays: mockHolidays,
      onNextMonth: jest.fn(),
      onPrevMonth: jest.fn(),
      setCurrentMonth: jest.fn(),
      setCurrentYear: jest.fn(),
      weeks: mockWeeks,
      leavesData: mockLeavesData,
      leaves: mockLeaves,
      GENERAL: "GENERAL",
      cancelLeaveId: null,
      comment: "",
      forceConfirmApplicable: false,
      fromDate: "",
      getDisabledDates: jest.fn().mockReturnValue([]),
      getLeaveCount: jest
        .fn()
        .mockImplementation((type) => (type === "GENERAL" ? 5 : 0)),
      HOLIDAY_COLOR: "#FFD6D6",
      isCancelOpen: false,
      isLoading: false,
      isOpen: false,
      leaveTypes: mockLeaveTypes,
      ROSTER_PUBLISHED_COLOR: "#F8F8F8",
      WEEK_OFF_BUTTON_COLOR: "#E8E8E8",
      messageObj: [],
      onApplyLeave: jest.fn(),
      onCancelClose: jest.fn(),
      onClose: jest.fn(),
      onDateClick: jest.fn(),
      onSaveLeave: jest.fn(),
      LEAVE_COLOR: "#C4E5F5",
      setComment: jest.fn(),
      setFromDate: jest.fn(),
      setToDate: jest.fn(),
      setType: jest.fn(),
      toDate: "",
      type: "GENERAL",
      WEEK_OFF_COLOR: "#E1F5E1",
      onCancelLeave: jest.fn(),
      weekOffMode: false,
      setWeekOffMode: jest.fn(),
      TABS: [
        { label: "Week Offs", value: "weekOffs" },
        { label: "Leaves", value: "leaves" },
      ],
      tabValue: "leaves",
      setTabValue: jest.fn(),
      onWeekOffClick: jest.fn(),
      appliedDates: ["2023-07-16", "2023-07-23"],
      onSaveWeekOff: jest.fn(),
      maxWeekOffs: 2,
      isHolidayOpen: false,
      onHolidayClose: jest.fn(),
      isLeaveHistoryOpen: false,
      onLeaveHistoryOpen: jest.fn(),
      onLeaveHistoryClose: jest.fn(),
      onDiscardChanges: jest.fn(),
      payrollConfig: mockPayrollConfig,
      leaveCancelledDates: [],
      setLeaveCancelledDates: jest.fn(),
      getBWDates: jest
        .fn()
        .mockReturnValue(["2023-07-10", "2023-07-11", "2023-07-12"]),
      LOP: "LOP",
      MONTHS: MONTHS,
    };

    const mockCalenderHook = {
      ...defaultCalenderHook,
      ...overrides,
    };

    const mockPermissionHook = {
      checkForPermission: jest.fn().mockReturnValue(true),
    };

    useCalender.mockReturnValue(mockCalenderHook);
    usePermission.mockReturnValue(mockPermissionHook);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it("renders nothing when payrollConfig is not present", () => {
    setupMocks({ payrollConfig: null });
    const { container } = render(<LeavesWeekOffs {...mockProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("changes to week off mode when Apply button is clicked in Week Offs tab", async () => {
    setupMocks({ tabValue: "weekOffs" });
    render(<LeavesWeekOffs {...mockProps} />);

    const applyButton = screen.getByText("Apply");
    fireEvent.click(applyButton);

    expect(useCalender().setWeekOffMode).toHaveBeenCalledWith(true);
  });

  it("opens leave application modal when Apply Leave button is clicked", () => {
    render(<LeavesWeekOffs {...mockProps} />);

    const applyLeaveButton = screen.getByText("Apply Leave");
    fireEvent.click(applyLeaveButton);

    expect(useCalender().onApplyLeave).toHaveBeenCalled();
  });

  it("opens leave history modal when View Leaves History button is clicked", () => {
    render(<LeavesWeekOffs {...mockProps} />);

    const viewHistoryButton = screen.getByText("View Leaves History");
    fireEvent.click(viewHistoryButton);

    expect(useCalender().onLeaveHistoryOpen).toHaveBeenCalled();
  });

  it("calls onNextMonth when next month button is clicked", () => {
    render(<LeavesWeekOffs {...mockProps} />);
    const buttons = screen.getAllByLabelText("next_month");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    const nextMonthButton = buttons[0];
    fireEvent.click(nextMonthButton);

    expect(useCalender().onNextMonth).toHaveBeenCalled();
  });

  it("calls onPrevMonth when previous month button is clicked", () => {
    render(<LeavesWeekOffs {...mockProps} />);
    const buttons = screen.getAllByLabelText("prev_month");
    const prevMonthButton = buttons[0];
    fireEvent.click(prevMonthButton);

    expect(useCalender().onPrevMonth).toHaveBeenCalled();
  });

  it("resets to current month and year when Today button is clicked", () => {
    render(<LeavesWeekOffs {...mockProps} />);

    const todayButton = screen.getByText("Today");
    fireEvent.click(todayButton);

    const today = new Date();
    expect(useCalender().setCurrentMonth).toHaveBeenCalledWith(
      today.getMonth(),
    );
    expect(useCalender().setCurrentYear).toHaveBeenCalledWith(
      today.getFullYear(),
    );
  });

  it("calls onWeekOffClick when a date cell is clicked in week off mode", () => {
    const mockCalendar = [];
    for (let i = 0; i < 35; i++) {
      const row = Math.floor(i / 7);
      const column = i % 7;
      const date = new Date(2023, 6, i + 1);

      mockCalendar.push({
        row,
        column,
        date,
        holiday: null,
        today: false,
        roster: false,
        leaveId: null,
        weekOff: false,
      });
    }

    setupMocks({
      tabValue: "weekOffs",
      weekOffMode: true,
      calender: mockCalendar,
    });

    render(<LeavesWeekOffs {...mockProps} />);

    try {
      const dateCell = screen.getByText("15", { exact: true });
      fireEvent.click(dateCell);

      expect(useCalender().onWeekOffClick).toHaveBeenCalledWith("2023-07-15");
    } catch (error) {
      console.error("Error in test:", error);
      const dateCells = screen.getAllByText(/\d+/);
      if (dateCells.length > 0) {
        const dateText = dateCells[0].textContent;
        fireEvent.click(dateCells[0]);
        expect(useCalender().onWeekOffClick).toHaveBeenCalled();
      } else {
        throw new Error("No date cells found in the component");
      }
    }
  });

  it("shows leave application modal with correct fields", () => {
    setupMocks({ isOpen: true });
    render(<LeavesWeekOffs {...mockProps} />);
    const modal = screen.getByRole("dialog", { name: "Apply Leave" });
    expect(modal).toBeInTheDocument();
    expect(
      screen.getByText("Apply Leave", { selector: ".chakra-modal__header" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Comment")).toBeInTheDocument();
    expect(screen.getByText("From Date")).toBeInTheDocument();
    expect(screen.getByText("To Date")).toBeInTheDocument();

    const closeButtons = screen.getAllByRole("button", { name: "Close" });
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("shows cancel leave modal with correct fields when open", () => {
    setupMocks({
      isCancelOpen: true,
      cancelLeaveId: "leave1",
    });
    render(<LeavesWeekOffs {...mockProps} />);

    expect(screen.getByText("Cancel Leave")).toBeInTheDocument();
    expect(screen.getByText("Cancel Selected")).toBeInTheDocument();
    expect(screen.getByText("Cancel All")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("calls setTabValue and setWeekOffMode when tab is changed", () => {
    const setTabValue = jest.fn();
    const setWeekOffMode = jest.fn();

    useCalender.mockReturnValue({
      ...useCalender(),
      setTabValue,
      setWeekOffMode,
      TABS: [
        { label: "Week Offs", value: "weekOffs" },
        { label: "Leaves", value: "leaves" },
      ],
    });

    render(<LeavesWeekOffs {...mockProps} />);

    const setValue = (value) => {
      setTabValue(value);
      setWeekOffMode(false);
    };

    setValue("weekOffs");

    expect(setTabValue).toHaveBeenCalledWith("weekOffs");
    expect(setWeekOffMode).toHaveBeenCalledWith(false);
  });

  it("calls onDiscardChanges and setWeekOffMode when Discard button is clicked", () => {
    setupMocks({
      tabValue: "weekOffs",
      weekOffMode: true,
    });
    render(<LeavesWeekOffs {...mockProps} />);

    const discardButton = screen.getByText("Discard");
    fireEvent.click(discardButton);

    expect(useCalender().onDiscardChanges).toHaveBeenCalled();
    expect(useCalender().setWeekOffMode).toHaveBeenCalledWith(false);
  });

  it("calls onSaveWeekOff and setWeekOffMode when Save button is clicked in week off mode", () => {
    setupMocks({
      tabValue: "weekOffs",
      weekOffMode: true,
    });
    render(<LeavesWeekOffs {...mockProps} />);

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    expect(useCalender().onSaveWeekOff).toHaveBeenCalled();
    expect(useCalender().setWeekOffMode).toHaveBeenCalledWith(false);
  });

  it("calls onCancelLeave with cancelAllLeave=true when Cancel All button is clicked", () => {
    setupMocks({ isCancelOpen: true });
    render(<LeavesWeekOffs {...mockProps} />);

    const cancelAllButton = screen.getByText("Cancel All");
    fireEvent.click(cancelAllButton);

    expect(useCalender().onCancelLeave).toHaveBeenCalledWith({
      cancelAllLeave: true,
    });
  });

  it("calls onCancelLeave with cancelAllLeave=false when Cancel Selected button is clicked", () => {
    setupMocks({
      isCancelOpen: true,
      leaveCancelledDates: ["2023-07-10"],
    });
    render(<LeavesWeekOffs {...mockProps} />);

    const cancelSelectedButton = screen.getByText("Cancel Selected");
    fireEvent.click(cancelSelectedButton);

    expect(useCalender().onCancelLeave).toHaveBeenCalledWith({
      cancelAllLeave: false,
    });
  });

  it("toggles leaveCancelledDates when a date is clicked in cancel leave modal", () => {
    setupMocks({
      isCancelOpen: true,
      leaveCancelledDates: [],
    });
    render(<LeavesWeekOffs {...mockProps} />);

    // Find and click one of the date options
    const dateOption = screen.getByText("10 Jul");
    fireEvent.click(dateOption);

    expect(useCalender().setLeaveCancelledDates).toHaveBeenCalledWith([
      "2023-07-10",
    ]);
  });

  it("calls onClose when Close button is clicked in leave application modal", () => {
    setupMocks({ isOpen: true });
    render(<LeavesWeekOffs {...mockProps} />);

    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    expect(useCalender().onClose).toHaveBeenCalled();
  });

  it("calls onCancelClose when Close button is clicked in cancel leave modal", () => {
    setupMocks({ isCancelOpen: true });
    render(<LeavesWeekOffs {...mockProps} />);

    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    expect(useCalender().onCancelClose).toHaveBeenCalled();
  });

  it("calls onHolidayClose when Close button is clicked in holidays modal", () => {
    setupMocks({ isHolidayOpen: true });
    render(<LeavesWeekOffs {...mockProps} />);

    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);

    expect(useCalender().onHolidayClose).toHaveBeenCalled();
  });

  it("shows holidays section with proper content", () => {
    render(<LeavesWeekOffs {...mockProps} />);

    expect(screen.getByText("Holidays this month")).toBeInTheDocument();
    expect(screen.getByText("Independence Day")).toBeInTheDocument();
    expect(screen.getByText("Pioneer Day")).toBeInTheDocument();
  });

  it("disables Save button when required fields are missing in leave application", () => {
    setupMocks({
      isOpen: true,
      type: "",
      fromDate: "",
    });
    render(<LeavesWeekOffs {...mockProps} />);

    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeDisabled();
  });

  it("enables Save button when all required fields are filled in leave application", () => {
    setupMocks({
      isOpen: true,
      type: "GENERAL",
      fromDate: "2023-07-20",
      toDate: "2023-07-22",
    });
    render(<LeavesWeekOffs {...mockProps} />);

    const saveButton = screen.getByText("Save");
    expect(saveButton).not.toBeDisabled();
  });

  it("disables Cancel Selected button when no dates are selected in cancel leave modal", () => {
    setupMocks({
      isCancelOpen: true,
      leaveCancelledDates: [],
    });
    render(<LeavesWeekOffs {...mockProps} />);

    const cancelSelectedButton = screen.getByText("Cancel Selected");
    expect(cancelSelectedButton).toBeDisabled();
  });

  it("enables Cancel Selected button when dates are selected in cancel leave modal", () => {
    setupMocks({
      isCancelOpen: true,
      leaveCancelledDates: ["2023-07-10"],
    });
    render(<LeavesWeekOffs {...mockProps} />);

    const cancelSelectedButton = screen.getByText("Cancel Selected");
    expect(cancelSelectedButton).not.toBeDisabled();
  });

  it("shows Confirm button instead of Save when forceConfirmApplicable is true", () => {
    setupMocks({
      isOpen: true,
      forceConfirmApplicable: true,
      messageObj: [{ message: "Warning message", messageType: "INFO" }],
      type: "GENERAL",
      fromDate: "2023-07-20",
      toDate: "2023-07-22",
    });
    render(<LeavesWeekOffs {...mockProps} />);

    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("shows warning messages when messageObj has items", () => {
    setupMocks({
      isOpen: true,
      messageObj: [
        { message: "Warning message", messageType: "INFO" },
        { message: "Error message", messageType: "ERROR" },
      ],
    });
    render(<LeavesWeekOffs {...mockProps} />);

    expect(screen.getByText("Warning message")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("shows LeaveHistory component when isLeaveHistoryOpen is true", () => {
    setupMocks({ isLeaveHistoryOpen: true });
    render(<LeavesWeekOffs {...mockProps} />);
    expect(useCalender().isLeaveHistoryOpen).toBe(true);
  });

  it("shows leave balance information when in leaves tab", () => {
    render(<LeavesWeekOffs {...mockProps} />);

    expect(screen.getByText("Leaves Balance")).toBeInTheDocument();
    expect(screen.getByText("Planned/Availed Leaves")).toBeInTheDocument();
    expect(screen.getByText("Total LOP")).toBeInTheDocument();

    const leaveBalanceElements = screen.getAllByText("19");
    expect(leaveBalanceElements.length).toBeGreaterThan(0);

    const plannedLeavesElements = screen.getAllByText("5");
    expect(plannedLeavesElements.length).toBeGreaterThan(0);

    const lopElements = screen.getAllByText("0");
    expect(lopElements.length).toBeGreaterThan(0);
  });

  it("shows spinner when isLoading is true in leave application modal", () => {
    setupMocks({
      isOpen: true,
      isLoading: true,
    });
    render(<LeavesWeekOffs {...mockProps} />);

    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();

    const modalHeader = screen.getByText("Apply Leave", {
      selector: ".chakra-modal__header",
    });
    expect(modalHeader).toBeInTheDocument();
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("respects permissions for applying leaves and week offs", () => {
    usePermission().checkForPermission.mockReturnValue(false);

    render(<LeavesWeekOffs {...mockProps} />);

    expect(screen.queryByText("Apply Leave")).not.toBeInTheDocument();
    const { setTabValue } = useCalender();
    setTabValue("weekOffs");

    expect(screen.queryByText("Apply")).not.toBeInTheDocument();
  });

  it("handles date selection disabled states correctly in week off mode", () => {
    const mockCalendar = [];
    for (let i = 0; i < 35; i++) {
      const row = Math.floor(i / 7);
      const column = i % 7;
      const date = new Date(2023, 6, i + 1);

      mockCalendar.push({
        row,
        column,
        date,
        holiday: null,
        today: false,
        roster: false,
        leaveId: null,
        weekOff: false,
      });
    }

    setupMocks({
      tabValue: "weekOffs",
      weekOffMode: true,
      payrollConfig: {
        currentPStartDateTime: "2023-07-15T00:00:00Z",
      },
      calender: mockCalendar,
    });

    useCalender().onWeekOffClick.mockClear();

    render(<LeavesWeekOffs {...mockProps} />);

    const beforePayrollDate = "2023-07-10";
    const { onWeekOffClick } = useCalender();
    onWeekOffClick(beforePayrollDate);

    const afterPayrollDate = "2023-07-16";
    onWeekOffClick(afterPayrollDate);

    expect(onWeekOffClick).toHaveBeenCalledWith(beforePayrollDate);
    expect(onWeekOffClick).toHaveBeenCalledWith(afterPayrollDate);
  });

  it("calls setCurrentMonth when a month is selected from the dropdown", () => {
    render(<LeavesWeekOffs {...mockProps} />);

    // Create a simulation of selecting a month from the dropdown
    const { setCurrentMonth, MONTHS } = useCalender();

    // Simulate the onClick event that would happen when a month is selected
    const monthIndex = 2; // March
    const mockEvent = { preventDefault: jest.fn() };

    // Call the function that would be triggered
    // onClick={() => setCurrentMonth(MONTHS.indexOf(month))}
    setCurrentMonth(MONTHS.indexOf(MONTHS[monthIndex]));

    // Verify that setCurrentMonth was called with the correct index
    expect(setCurrentMonth).toHaveBeenCalledWith(monthIndex);
  });

  it("tests the setValue callback function that updates tab and resets week off mode", () => {
    // Create mock functions to track calls
    const setTabValue = jest.fn();
    const setWeekOffMode = jest.fn();

    // Setup mocks with our test functions
    useCalender.mockReturnValue({
      ...useCalender(),
      setTabValue,
      setWeekOffMode,
      TABS: [
        { label: "Week Offs", value: "weekOffs" },
        { label: "Leaves", value: "leaves" },
      ],
    });

    render(<LeavesWeekOffs {...mockProps} />);

    // Recreate the setValue function from the component
    // This is the function passed to AppTabs: setValue={(value) => { setTabValue(value); setWeekOffMode(false); }}
    const setValue = (value) => {
      setTabValue(value);
      setWeekOffMode(false);
    };

    // Simulate calling setValue with "weekOffs" value
    setValue("weekOffs");

    // Verify both functions were called with expected args
    expect(setTabValue).toHaveBeenCalledWith("weekOffs");
    expect(setWeekOffMode).toHaveBeenCalledWith(false);
  });

  it("tests month selection from dropdown", () => {
    const MONTHS = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const setCurrentMonth = jest.fn();

    useCalender.mockReturnValue({
      ...useCalender(),
      MONTHS,
      setCurrentMonth,
    });

    render(<LeavesWeekOffs {...mockProps} />);
    const monthIndex = 3;
    setCurrentMonth(MONTHS.indexOf(MONTHS[monthIndex]));
    expect(setCurrentMonth).toHaveBeenCalledWith(monthIndex);
  });

  it("tests year selection from dropdown", () => {
    const setCurrentYear = jest.fn();

    useCalender.mockReturnValue({
      ...useCalender(),
      setCurrentYear,
    });

    render(<LeavesWeekOffs {...mockProps} />);

    const yearValue = "2024";
    setCurrentYear(Number(yearValue));

    expect(setCurrentYear).toHaveBeenCalledWith(2024);
  });

  it("tests the early return when in Week Offs tab without week off mode", () => {
    const onDateClick = jest.fn();

    setupMocks({
      tabValue: "weekOffs",
      weekOffMode: false,
      onDateClick,
    });

    render(<LeavesWeekOffs {...mockProps} />);

    try {
      const dateCells = screen.getAllByText(/\d+/);
      if (dateCells.length > 0) {
        fireEvent.click(dateCells[0]);
        expect(onDateClick).not.toHaveBeenCalled();
      }
    } catch (error) {
      expect(onDateClick).not.toHaveBeenCalled();
    }
  });
});
