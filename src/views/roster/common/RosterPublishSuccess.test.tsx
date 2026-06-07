import React from "react";
import { render, screen } from "@testing-library/react";
import RosterPublishSuccess from "./RosterPublishSuccess";
import { MONTHS } from "../../../helper/Constant";
import "@testing-library/jest-dom";

describe("RosterPublishSuccess Component", () => {
  const mockOnClose = jest.fn();

  it("renders modal when open", () => {
    render(
      <RosterPublishSuccess
        isPublishedRosterModalOpen={true}
        onPublishedRosterModalClose={mockOnClose}
        globalNotifyTo="NONE"
      />
    );

    expect(
      screen.getByText("Well hello there, Roster Master!")
    ).toBeInTheDocument();
  });

  it("displays correct message for month-based roster", () => {
    render(
      <RosterPublishSuccess
        isPublishedRosterModalOpen={true}
        onPublishedRosterModalClose={mockOnClose}
        selectedMonth={2} // March
        globalNotifyTo="NONE"
      />
    );

    expect(
      screen.getByText(
        `Roster for March month has been published. Keep up the amazing work, & let's conquer more rosters together!`
      )
    ).toBeInTheDocument();
  });

  it("displays correct message for week-based roster", () => {
    render(
      <RosterPublishSuccess
        isPublishedRosterModalOpen={true}
        onPublishedRosterModalClose={mockOnClose}
        selectedWeek={3}
        globalNotifyTo="NONE"
      />
    );

    expect(
      screen.getByText(
        `Roster for Week: 3 has been published. Keep up the amazing work, & let's conquer more rosters together!`
      )
    ).toBeInTheDocument();
  });

  it("includes sharing message when globalNotifyTo is not NONE", () => {
    render(
      <RosterPublishSuccess
        isPublishedRosterModalOpen={true}
        onPublishedRosterModalClose={mockOnClose}
        selectedMonth={4} // May
        globalNotifyTo="ALL"
      />
    );

    expect(
      screen.getByText(
        `Roster for May month has been published and shared with team. Keep up the amazing work, & let's conquer more rosters together!`
      )
    ).toBeInTheDocument();
  });

  it("does not render text when no month or week is provided", () => {
    render(
      <RosterPublishSuccess
        isPublishedRosterModalOpen={true}
        onPublishedRosterModalClose={mockOnClose}
        globalNotifyTo="NONE"
      />
    );

    expect(screen.queryByText(/Roster for/)).not.toBeInTheDocument();
  });
});
