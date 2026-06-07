import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RosterPublishHoursWarning from "./RosterPublishHoursWarning";
import { ChakraProvider } from "@chakra-ui/react";

const mockProps = {
  isEmpExceedingHoursListModalOpen: true,
  onEmpExceedingHoursListModalClose: jest.fn(),
  empDailyExceedingHoursList: [
    {
      empId: "E123",
      empName: "John Doe",
      date: "2025-02-20",
      weekNumber: 3,
      workHours: 10,
    },
    {
      empId: "E456",
      empName: "Jane Smith",
      date: "2025-02-21",
      weekNumber: 3,
      workHours: 12,
    },
  ],
  empWeeklyExceedingHoursList: [
    {
      empId: "E123",
      empName: "John Doe",
      weekNumber: 1,
      wstartDate: "2025-01-29",
      wendDate: "2025-02-04",
      totalHours: 50,
      allowedHours: 40,
    },
    {
      empId: "E456",
      empName: "Jane Smith",
      weekNumber: 2,
      wstartDate: "2025-02-05",
      wendDate: "2025-02-11",
      totalHours: 55,
      allowedHours: 40,
    },
  ],
  empExceedingHoursList: [
    {
      empId: "E123",
      empName: "John Doe",
      pstartDate: "2025-02-01",
      pendDate: "2025-02-28",
      totalHours: 200,
      allowedHours: 160,
    },
    {
      empId: "E456",
      empName: "Jane Smith",
      pstartDate: "2025-02-01",
      pendDate: "2025-02-28",
      totalHours: 220,
      allowedHours: 160,
    },
  ],
  onChangeWeek: jest.fn(),
  goToRosterEdit: jest.fn(),
};

const RenderWithChakra = (props: any) => (
  <ChakraProvider>
    <RosterPublishHoursWarning {...props} />
  </ChakraProvider>
);

const renderComponent = (props = mockProps) =>
  render(<RenderWithChakra {...props} />);

describe("RosterPublishHoursWarning Component", () => {
  it("should render the modal with the correct heading", () => {
    renderComponent();
    expect(screen.getByText("Review and Fix Hours")).toBeInTheDocument();
  });

  it("should display warning message", () => {
    renderComponent();
    expect(
      screen.getByText(
        /Please review the working hours for the following employees/i
      )
    ).toBeInTheDocument();
  });

  it("should display daily exceeding hours table", () => {
    renderComponent();
    expect(screen.getByText("Daily Working Hours Issues")).toBeInTheDocument();

    const employeeElements = screen.queryAllByText(
      /(John Doe \(E123\)|Jane Smith \(E456\))/
    );
    expect(employeeElements.length).toBeGreaterThanOrEqual(2);
  });

  it("should sort daily exceeding hours by date", () => {
    const dailyList = [
      {
        empId: "E123",
        empName: "John Doe",
        date: "2025-02-21",
        weekNumber: 3,
        workHours: 11,
      },
      {
        empId: "E456",
        empName: "Jane Smith",
        date: "2025-02-20",
        weekNumber: 3,
        workHours: 10,
      },
    ];

    const sortedProps = { ...mockProps, empDailyExceedingHoursList: dailyList };
    renderComponent(sortedProps);

    const dateElements = screen.getAllByText((content, element) => {
      return (
        element?.textContent?.match(/20\s?Feb\s?2025|21\s?Feb\s?2025/) !== null
      );
    });

    expect(dateElements[0]).toHaveTextContent(/20\s?Feb\s?2025/);
    expect(dateElements[1]).toHaveTextContent(/21\s?Feb\s?2025/);
  });

  it("should sort weekly exceeding hours by week number", () => {
    const weeklyList = [
      {
        empId: "E123",
        empName: "John Doe",
        weekNumber: 2,
        wstartDate: "2025-02-05",
        wendDate: "2025-02-11",
        totalHours: 45,
        allowedHours: 40,
      },
      {
        empId: "E456",
        empName: "Jane Smith",
        weekNumber: 1,
        wstartDate: "2025-01-29",
        wendDate: "2025-02-04",
        totalHours: 50,
        allowedHours: 40,
      },
    ];

    const sortedProps = {
      ...mockProps,
      empDailyExceedingHoursList: [], 
      empWeeklyExceedingHoursList: weeklyList,
      empExceedingHoursList: [],
    };
    renderComponent(sortedProps);

   
    const weekElements = screen.getAllByRole("button", { name: /Week \d+/ });

    expect(weekElements[0]).toHaveTextContent("Week 1");
    expect(weekElements[1]).toHaveTextContent("Week 2");
  });

  it("should display weekly exceeding hours table", () => {
    renderComponent();
    expect(screen.getByText("Weekly Working Hours Issues")).toBeInTheDocument();
    expect(screen.getByText("50/40")).toBeInTheDocument();
  });

  it("should display monthly exceeding hours table", () => {
    renderComponent();
    expect(
      screen.getByText("Monthly Working Hours Issues")
    ).toBeInTheDocument();
    expect(screen.getByText("200/160")).toBeInTheDocument();
  });

  it("should not render tables when lists are empty", () => {
    const emptyProps = {
      ...mockProps,
      empDailyExceedingHoursList: [],
      empWeeklyExceedingHoursList: [],
      empExceedingHoursList: [],
    };

    renderComponent(emptyProps);
    expect(screen.queryByText("Daily Working Hours Issues")).toBeNull();
    expect(screen.queryByText("Weekly Working Hours Issues")).toBeNull();
    expect(screen.queryByText("Monthly Working Hours Issues")).toBeNull();
  });

  it("should call onChangeWeek and goToRosterEdit when week button is clicked", () => {
    renderComponent();
    const weekButtons = screen.getAllByText(/Week 3/i);
    fireEvent.click(weekButtons[0]);
    expect(mockProps.onEmpExceedingHoursListModalClose).toHaveBeenCalled();
    expect(mockProps.onChangeWeek).toHaveBeenCalledWith(3);
    expect(mockProps.goToRosterEdit).toHaveBeenCalledWith(3);
  });

  it("should close the modal when close button is clicked", () => {
    renderComponent();
    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);
    expect(mockProps.onEmpExceedingHoursListModalClose).toHaveBeenCalled();
  });
});

