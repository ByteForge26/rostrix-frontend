import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import LeaveHistory from "./LeaveHistory";
import { store } from "../../app/store/store";
import { IMyLeaveResponse, IPayrollConfig } from "../../helper/Interface";
import { AUTO_APPROVED } from "../../helper/Constant";
import React from "react";


const mockLeavesData: IMyLeaveResponse = {
  leaves: [
    {
      id: 1,
      fromDate: "2024-01-10",
      toDate: "2024-01-12",
      appliedOn: "2024-01-05",
      status: AUTO_APPROVED,
      comment: "Family Emergency",
      type: "1",
      empId: "",
      authorizedBy: "",
      actedOn: "",
    },
    {
      id: 2,
      fromDate: "2024-02-15",
      toDate: "2024-02-16",
      appliedOn: "2024-02-10",
      status: AUTO_APPROVED,
      comment: "Medical Leave",
      type: "2",
      empId: "",
      authorizedBy: "",
      actedOn: "",
    },
  ],
  totalAllowedLeaves: 0,
  stateId: 0,
  contractTypeId: 0,
};

const mockPayrollConfig: IPayrollConfig = {
  currentPStartDateTime: "2024-01-01T00:00:00",
  currentPEndDateTime: "2024-12-31T23:59:59",
  currentManualHourStartTime: "2024-12-01T09:00:00",
  currentManualHourEndTime: "2024-12-01T18:00:00",
  currentPayrollExtractStartTime: "2024-12-01T18:30:00",
};

const mockOnLeaveHistoryClose = jest.fn();
const mockOnDateClick = jest.fn();

describe("LeaveHistory Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    jest.clearAllMocks();
  });

  it("does not render leave data when no data is provided", async () => {
    render(
      <Provider store={store}>
        <LeaveHistory
          isLeaveHistoryOpen={true}
          onLeaveHistoryClose={mockOnLeaveHistoryClose}
          onDateClick={mockOnDateClick}
          canCancelLeave={false}
          empName="John Doe"
          year={2024}
          payrollConfig={mockPayrollConfig}
        />
      </Provider>
    );

    expect(screen.queryByText(/Family Emergency/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Medical Leave/i)).not.toBeInTheDocument();
  });

  it("filters out non-approved leaves", async () => {
    const mockNonApprovedLeaveData: IMyLeaveResponse = {
      leaves: [
        {
          id: 3,
          fromDate: "2024-01-05",
          toDate: "2024-01-07",
          appliedOn: "2024-01-01",
          status: "PENDING", 
          comment: "Vacation",
          type: "1",
          empId: "",
          authorizedBy: "",
          actedOn: "",
        },
        ...mockLeavesData.leaves,
      ],
      totalAllowedLeaves: 0,
      stateId: 0,
      contractTypeId: 0,
    };

    render(
      <Provider store={store}>
        <LeaveHistory
          isLeaveHistoryOpen={true}
          onLeaveHistoryClose={mockOnLeaveHistoryClose}
          leavesData={mockNonApprovedLeaveData}
          onDateClick={mockOnDateClick}
          canCancelLeave={true}
          empName="John Doe"
          year={2024}
          payrollConfig={mockPayrollConfig}
        />
      </Provider>
    );
    expect(screen.queryByText(/Vacation/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Family Emergency/i)).toBeInTheDocument();
    expect(screen.getByText(/Medical Leave/i)).toBeInTheDocument();
  });

  it("does not show the cancel button when conditions are not met", async () => {
    render(
      <Provider store={store}>
        <LeaveHistory
          isLeaveHistoryOpen={true}
          onLeaveHistoryClose={mockOnLeaveHistoryClose}
          leavesData={mockLeavesData}
          onDateClick={mockOnDateClick}
          canCancelLeave={false}
          empName="John Doe"
          year={2024}
          payrollConfig={mockPayrollConfig}
        />
      </Provider>
    );
    expect(screen.queryByText(/Cancel/i)).not.toBeInTheDocument();
  });

  it("calls onDateClick when cancel button is clicked", async () => {
    render(
      <Provider store={store}>
        <LeaveHistory
          isLeaveHistoryOpen={true}
          onLeaveHistoryClose={mockOnLeaveHistoryClose}
          leavesData={mockLeavesData}
          onDateClick={mockOnDateClick}
          canCancelLeave={true}
          empName="John Doe"
          year={2024}
          payrollConfig={mockPayrollConfig}
        />
      </Provider>
    );
  });

  it("calls onLeaveHistoryClose when the close button is clicked", () => {
    render(
      <Provider store={store}>
        <LeaveHistory
          isLeaveHistoryOpen={true}
          onLeaveHistoryClose={mockOnLeaveHistoryClose}
          leavesData={mockLeavesData}
          onDateClick={mockOnDateClick}
          canCancelLeave={true}
          empName="John Doe"
          year={2024}
          payrollConfig={mockPayrollConfig}
        />
      </Provider>
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnLeaveHistoryClose).toHaveBeenCalledTimes(1);
  });
});
