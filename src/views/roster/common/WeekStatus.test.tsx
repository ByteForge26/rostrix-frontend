import { render, screen } from "@testing-library/react";
import WeekStatus from "./WeekStatus";
import React from "react";

describe("WeekStatus Component", () => {
  it("renders 'PUBLISHED' badge when rosterStatus is 'PUBLISHED'", () => {
    render(<WeekStatus rosterStatus="PUBLISHED" />);

    expect(screen.getByText("PUBLISHED")).toBeInTheDocument();
  });

  it("renders 'PUBLISHED DRAFT' badge when rosterStatus is 'PUB_DRAFT'", () => {
    render(<WeekStatus rosterStatus="PUB_DRAFT" />);

    expect(screen.getByText("PUBLISHED DRAFT")).toBeInTheDocument();
  });

  it("renders 'DRAFT' badge when rosterStatus is 'DRAFT'", () => {
    render(<WeekStatus rosterStatus="DRAFT" />);

    expect(screen.getByText("DRAFT")).toBeInTheDocument();
  });

  it("renders 'PUBLISHED' badge when isPublished is true", () => {
    render(<WeekStatus isPublished={true} />);

    expect(screen.getByText("PUBLISHED")).toBeInTheDocument();
  });

  it("does not render any badge when isPublished is false and rosterStatus is undefined", () => {
    render(<WeekStatus isPublished={false} />);

    expect(screen.queryByText(/PUBLISHED|DRAFT/)).not.toBeInTheDocument();
  });

  it("does not render any badge for invalid rosterStatus", () => {
    render(<WeekStatus rosterStatus="INVALID" />);

    expect(screen.queryByText(/PUBLISHED|DRAFT/)).not.toBeInTheDocument();
  });
});
