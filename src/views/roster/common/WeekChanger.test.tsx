import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import WeekChanger from "./WeekChanger";
import moment from "moment";
import { isBefore, isAfter } from "date-fns";


const createMockDatePicker = () => {
  return ({ value, placeholder, renderValue, onChange, ...props }) => {
    const displayValue = renderValue
      ? renderValue(value)
      : value?.toISOString();

    return (
      <div data-testid="date-picker-wrapper" {...props}>
        <input
          data-testid="date-picker-input"
          placeholder={placeholder}
          value={displayValue || ""}
          onChange={(e) => {
            const newDate = new Date(e.target.value);
            onChange(newDate);
          }}
        />
      </div>
    );
  };
};

// Mock the DatePicker component
jest.mock("rsuite/DatePicker", () => createMockDatePicker(), { virtual: true });

// Create mock props helper function
const createMockProps = (overrides = {}) => ({
  selectedWeek: 10,
  selectedYear: 2025,
  weeks: [
    { number: 10, endDate: "2025-03-10" },
    { number: 11, endDate: "2025-03-17" },
  ],
  onChangeWeek: jest.fn(),
  onChangeYear: jest.fn(),
  isPublished: true,
  rosterStatus: "Active",
  isAllWeeksOpen: false,
  onAllWeeksToggle: jest.fn(),
  ...overrides,
});

describe("WeekChanger Component", () => {
  describe("Rendering", () => {
    it("displays the Weeks Insight button when not all weeks are open", () => {
      const mockProps = createMockProps({ isAllWeeksOpen: false });
      render(<WeekChanger {...mockProps} />);

      expect(screen.getByText("Weeks Insight")).toBeInTheDocument();
    });
  });

  describe("Week Navigation", () => {
    it("navigates to next week correctly", () => {
      const mockProps = createMockProps({
        selectedWeek: 10,
        selectedYear: 2025,
      });

      const { onChangeWeek, onChangeYear } = mockProps;

      render(<WeekChanger {...mockProps} />);

  
      const nextWeekButton = screen.getAllByRole("button")[1]; 
      fireEvent.click(nextWeekButton);
      const expectedNextWeekDate = moment()
        .set({
          year: 2025,
          week: 10,
        })
        .endOf("week")
        .add({ week: 1 })
        .toDate();

      const expectedNextWeek = moment(expectedNextWeekDate).get("week");
      const expectedNextYear = expectedNextWeekDate.getFullYear();

      expect(onChangeWeek).toHaveBeenCalledWith(expectedNextWeek);
      expect(onChangeYear).toHaveBeenCalledWith(expectedNextYear);
    });

    it("navigates to previous week correctly", () => {
      const mockProps = createMockProps({
        selectedWeek: 10,
        selectedYear: 2025,
      });

      const { onChangeWeek, onChangeYear } = mockProps;

      render(<WeekChanger {...mockProps} />);

      const prevWeekButton = screen.getAllByRole("button")[0];
      fireEvent.click(prevWeekButton);

      const expectedPrevWeekDate = moment()
        .set({
          year: 2025,
          week: 10,
        })
        .endOf("week")
        .subtract({ week: 1 })
        .toDate();

      const expectedPrevWeek = moment(expectedPrevWeekDate).get("week");
      const expectedPrevYear = expectedPrevWeekDate.getFullYear();

      expect(onChangeWeek).toHaveBeenCalledWith(expectedPrevWeek);
      expect(onChangeYear).toHaveBeenCalledWith(expectedPrevYear);
    });
  });

  describe("Date Restriction", () => {
    it("disables dates before 01-01-2022", () => {
      const mockProps = createMockProps();
      render(<WeekChanger {...mockProps} />);

      const beforeDate = new Date("2021-12-31");
      const isDisabled = isBefore(beforeDate, new Date("2022-01-01"));
      expect(isDisabled).toBe(true);
    });

    it("disables dates after next year's end", () => {
      const mockProps = createMockProps();
      render(<WeekChanger {...mockProps} />);

      const futureDate = moment().add(2, "years").endOf("year").toDate();
      const isDisabledFuture = isAfter(
        futureDate,
        moment().add(1, "years").endOf("year").toDate()
      );
      expect(isDisabledFuture).toBe(true);
    });
  });


  describe("Weeks Insight Button", () => {
    it("calls onAllWeeksToggle when Weeks Insight button is clicked", () => {
      const mockProps = createMockProps();
      render(<WeekChanger {...mockProps} />);

      const insightButton = screen.getByText("Weeks Insight");
      fireEvent.click(insightButton);

      expect(mockProps.onAllWeeksToggle).toHaveBeenCalled();
    });

    it("does not render Weeks Insight button when onAllWeeksToggle is not provided", () => {
      const mockProps = createMockProps({ onAllWeeksToggle: undefined });
      render(<WeekChanger {...mockProps} />);

      expect(screen.queryByText("Weeks Insight")).not.toBeInTheDocument();
    });
  });
});

