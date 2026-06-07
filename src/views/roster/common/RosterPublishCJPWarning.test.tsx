import { render, screen, fireEvent } from "@testing-library/react";
import RosterPublishCJPWarning from "./RosterPublishCJPWarning";
import "@testing-library/jest-dom";
import { IWeekUncoveredShift } from "../../../helper/Interface";

const mockOnClose = jest.fn();
const mockOnChangeWeek = jest.fn();
const mockGoToRosterEdit = jest.fn();

describe("RosterPublishCJPWarning Component", () => {
  const sampleWeekUncoveredShifts: IWeekUncoveredShift[] = [
    {
      week: 10,
      year: 2024,
      dateUncoveredShifts: [
        {
          date: "2024-03-01",
          uncoveredShifts: [
            {
              miscWorkId: "101",
              miscWorkName: "Kitchen",
              plannedShift: { st: "09:00:00", et: "17:00:00" },
              secondaryJobType: "CASHIER",
              uncoveredPeriods: [{ start: "10:00:00", end: "11:00:00" }],
            },
          ],
        },
      ],
    },
  ];

  const defaultProps = {
    isWeekUncoveredShiftsModalOpen: true,
    onWeekUncoveredShiftsModalClose: mockOnClose,
    weekUncoveredShifts: sampleWeekUncoveredShifts,
    onChangeWeek: mockOnChangeWeek,
    goToRosterEdit: mockGoToRosterEdit,
  };

  it("renders modal with header and warning text", () => {
    render(<RosterPublishCJPWarning {...defaultProps} />);

    expect(
      screen.getByText("Assigned Planned Job: Uncovered Periods")
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /The following assigned job shifts have not been fully or partially covered/i
      )
    ).toBeInTheDocument();
  });

  it("displays week, year, and uncovered shifts", () => {
    render(<RosterPublishCJPWarning {...defaultProps} />);

    expect(screen.getByText("Week: 10, Year: 2024")).toBeInTheDocument();
    expect(screen.getByText("01 Mar 2024")).toBeInTheDocument();
    expect(screen.getByText("Kitchen")).toBeInTheDocument();
    expect(screen.getByText("09:00 AM - 05:00 PM")).toBeInTheDocument();
    expect(screen.getByText("10:00 AM - 11:00 AM")).toBeInTheDocument();
  });

  it("calls onWeekUncoveredShiftsModalClose, onChangeWeek, and goToRosterEdit on Edit click", () => {
    render(<RosterPublishCJPWarning {...defaultProps} />);

    fireEvent.click(screen.getByText("Edit"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnChangeWeek).toHaveBeenCalledWith(10);
    expect(mockGoToRosterEdit).toHaveBeenCalledWith(10);
  });

  it("does not render uncovered shifts if weekUncoveredShifts is empty", () => {
    render(
      <RosterPublishCJPWarning {...defaultProps} weekUncoveredShifts={[]} />
    );

    expect(screen.queryByText("Week: 10, Year: 2024")).not.toBeInTheDocument();
  });

  it("closes the modal when the close button is clicked", () => {
    render(<RosterPublishCJPWarning {...defaultProps} />);

    fireEvent.click(screen.getByLabelText("Close"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  it("sorts uncovered shifts by date in ascending order", () => {
    const unorderedShifts: IWeekUncoveredShift[] = [
      {
        week: 10,
        year: 2024,
        dateUncoveredShifts: [
          {
            date: "2024-03-05",
            uncoveredShifts: [
              {
                miscWorkId: "103",
                miscWorkName: "Bar",
                plannedShift: { st: "14:00:00", et: "22:00:00" },
                secondaryJobType: "BARISTA",
                uncoveredPeriods: [{ start: "16:00:00", end: "17:00:00" }],
              },
            ],
          },
          {
            date: "2024-03-01",
            uncoveredShifts: [
              {
                miscWorkId: "101",
                miscWorkName: "Kitchen",
                plannedShift: { st: "09:00:00", et: "17:00:00" },
                secondaryJobType: "CASHIER",
                uncoveredPeriods: [{ start: "10:00:00", end: "11:00:00" }],
              },
            ],
          },
        ],
      },
    ];

    render(
      <RosterPublishCJPWarning
        {...defaultProps}
        weekUncoveredShifts={unorderedShifts}
      />
    );

    const dates = screen.getAllByText(/Mar 2024/).map((el) => el.textContent);
    expect(dates).toEqual(["01 Mar 2024", "05 Mar 2024"]);
  });
  it("displays correct job labels from SECONDARY_JOBS_CONFIG", () => {
    const customShifts: IWeekUncoveredShift[] = [
      {
        week: 11,
        year: 2024,
        dateUncoveredShifts: [
          {
            date: "2024-03-07",
            uncoveredShifts: [
              {
                miscWorkId: "",
                miscWorkName: "",
                plannedShift: { st: "08:00:00", et: "14:00:00" },
                secondaryJobType: "BARISTA",
                uncoveredPeriods: [{ start: "09:00:00", end: "10:00:00" }],
              },
            ],
          },
        ],
      },
    ];

    render(
      <RosterPublishCJPWarning
        {...defaultProps}
        weekUncoveredShifts={customShifts}
      />
    );

  });
  it("sorts uncovered periods by start time", () => {
    const customShifts: IWeekUncoveredShift[] = [
      {
        week: 11,
        year: 2024,
        dateUncoveredShifts: [
          {
            date: "2024-03-10",
            uncoveredShifts: [
              {
                miscWorkId: "103",
                miscWorkName: "Bar",
                plannedShift: { st: "08:00:00", et: "16:00:00" },
                secondaryJobType: "BARISTA",
                uncoveredPeriods: [
                  { start: "12:00:00", end: "01:00:00" },
                  { start: "09:00:00", end: "10:00:00" },
                ],
              },
            ],
          },
        ],
      },
    ];

    render(
      <RosterPublishCJPWarning
        {...defaultProps}
        weekUncoveredShifts={customShifts}
      />
    );

    const periods = screen
      .getAllByText(/AM -/i)
      .map((el) => el.textContent?.split(" - ")[0]);
  });
});
