import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AllWeeksView from "./AllWeeksView";
import { AiOutlineClose } from "react-icons/ai";
import { BsCheckCircle, BsDashCircleDotted, BsEyeFill } from "react-icons/bs";
import { IPlannedJobWeekResponse } from "../../../helper/Interface";
import { useAppSelector } from "../../../app/store/store";

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));

jest.mock("../../../app/store/store", () => ({
  useAppSelector: jest.fn(),
}));

jest.mock("react-icons/ai", () => ({
  AiOutlineClose: () => <div data-testid="close-icon">CloseIcon</div>,
}));

jest.mock("react-icons/bs", () => ({
  BsCheckCircle: () => (
    <div data-testid="check-circle-icon">CheckCircleIcon</div>
  ),
  BsDashCircleDotted: () => (
    <div data-testid="dash-circle-icon">DashCircleDottedIcon</div>
  ),
  BsEyeFill: () => <div data-testid="eye-fill-icon">EyeFillIcon</div>,
}));

describe("AllWeeksView", () => {
  const mockPlannedJobWeeks: IPlannedJobWeekResponse[] = [
    {
      week: 1,
      year: 2023,
      startDate: "2023-01-01",
      endDate: "2023-01-07",
      weekStatus: "DRAFT",
    },
    {
      week: 2,
      year: 2023,
      startDate: "2023-01-08",
      endDate: "2023-01-14",
      weekStatus: "PUBLISHED",
    },
    {
      week: 3,
      year: 2023,
      startDate: "2023-01-15",
      endDate: "2023-01-21",
      weekStatus: "PUB_DRAFT",
    },
    {
      week: 4,
      year: 2023,
      startDate: "2023-01-22",
      endDate: "2023-01-28",
      weekStatus: "NI",
    },
  ];

  const mockOnAllWeeksClose = jest.fn();
  const mockOnChangeWeek = jest.fn();

  describe("useAppSelector", () => {
    it("selects the correct year and week from the store", () => {
      (useAppSelector as jest.Mock).mockReturnValue({
        selectedYear: 2023,
        selectedWeek: 2,
      });

      render(
        <AllWeeksView
          isAllWeeksOpen={true}
          onAllWeeksClose={mockOnAllWeeksClose}
          plannedJobWeeks={mockPlannedJobWeeks}
          onChangeWeek={mockOnChangeWeek}
          contentMaxHeight="500px"
        />
      );
      const weekElement = screen.getByText("Week 2, 2023");
      expect(weekElement).toBeInTheDocument();
    });

    it("handles different selected years and weeks", () => {
      (useAppSelector as jest.Mock).mockReturnValue({
        selectedYear: 2024,
        selectedWeek: 3,
      });

      render(
        <AllWeeksView
          isAllWeeksOpen={true}
          onAllWeeksClose={mockOnAllWeeksClose}
          plannedJobWeeks={mockPlannedJobWeeks}
          onChangeWeek={mockOnChangeWeek}
          contentMaxHeight="500px"
        />
      );
      expect(screen.getByText("Weeks Insight")).toBeInTheDocument();
    });

    it("handles undefined selected year and week", () => {
      (useAppSelector as jest.Mock).mockReturnValue({
        selectedYear: undefined,
        selectedWeek: undefined,
      });

      render(
        <AllWeeksView
          isAllWeeksOpen={true}
          onAllWeeksClose={mockOnAllWeeksClose}
          plannedJobWeeks={mockPlannedJobWeeks}
          onChangeWeek={mockOnChangeWeek}
          contentMaxHeight="500px"
        />
      );
      expect(screen.getByText("Weeks Insight")).toBeInTheDocument();
    });
  });

  describe("Rendering and Interactions", () => {
    beforeEach(() => {
      (useAppSelector as jest.Mock).mockReturnValue({
        selectedYear: 2023,
        selectedWeek: 1,
      });
    });

    it("displays the correct icons based on weekStatus", () => {
      render(
        <AllWeeksView
          isAllWeeksOpen={true}
          onAllWeeksClose={mockOnAllWeeksClose}
          plannedJobWeeks={mockPlannedJobWeeks}
          onChangeWeek={mockOnChangeWeek}
          contentMaxHeight="500px"
        />
      );
      const dashCircleIcons = screen.queryAllByTestId("dash-circle-icon");
      const checkCircleIcons = screen.queryAllByTestId("check-circle-icon");
      expect(dashCircleIcons.length).toBeGreaterThanOrEqual(2);
      expect(checkCircleIcons.length).toBeGreaterThanOrEqual(1);
    });
    it("renders correctly when isAllWeeksOpen is true", () => {
      render(
        <AllWeeksView
          isAllWeeksOpen={true}
          onAllWeeksClose={mockOnAllWeeksClose}
          plannedJobWeeks={mockPlannedJobWeeks}
          onChangeWeek={mockOnChangeWeek}
          contentMaxHeight="500px"
        />
      );

      expect(screen.getByText("Weeks Insight")).toBeInTheDocument();
      expect(screen.getByTestId("close-icon")).toBeInTheDocument();
      expect(screen.getByText("Week 1, 2023")).toBeInTheDocument();
      expect(screen.getByText("Week 2, 2023")).toBeInTheDocument();
    });

    it("calls onAllWeeksClose when the close button is clicked", () => {
      render(
        <AllWeeksView
          isAllWeeksOpen={true}
          onAllWeeksClose={mockOnAllWeeksClose}
          plannedJobWeeks={mockPlannedJobWeeks}
          onChangeWeek={mockOnChangeWeek}
          contentMaxHeight="500px"
        />
      );

      fireEvent.click(screen.getByTestId("close-icon"));
      expect(mockOnAllWeeksClose).toHaveBeenCalled();
    });

    it("calls onChangeWeek when a week is clicked", () => {
      render(
        <AllWeeksView
          isAllWeeksOpen={true}
          onAllWeeksClose={mockOnAllWeeksClose}
          plannedJobWeeks={mockPlannedJobWeeks}
          onChangeWeek={mockOnChangeWeek}
          contentMaxHeight="500px"
        />
      );

      fireEvent.click(screen.getByText("Week 1, 2023"));
      expect(mockOnChangeWeek).toHaveBeenCalledWith(1);
    });

    it("handles different week statuses correctly", () => {
      render(
        <AllWeeksView
          isAllWeeksOpen={true}
          onAllWeeksClose={mockOnAllWeeksClose}
          plannedJobWeeks={mockPlannedJobWeeks}
          onChangeWeek={mockOnChangeWeek}
          contentMaxHeight="500px"
        />
      );

      // Verify all weeks are rendered
      mockPlannedJobWeeks.forEach((week) => {
        expect(
          screen.getByText(`Week ${week.week}, ${week.year}`)
        ).toBeInTheDocument();
      });
    });
  });
});

//   94.11 |    89.18 |    87.5 |   94.11
