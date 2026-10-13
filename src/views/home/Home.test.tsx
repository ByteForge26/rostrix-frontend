import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "./Home";

jest.mock(
  "../../components/AppContainer",
  () =>
    ({ children }: { children: React.ReactNode }) =>
      <div data-testid="app-container">{children}</div>
);

describe("Home Component", () => {
  it("renders without crashing", () => {
    render(<Home />);
    expect(screen.getByTestId("app-container")).toBeInTheDocument();
  });

  it("displays the home image", () => {
    render(<Home />);
    const image = screen.getByAltText("Illustration of a team planning workspace");
    expect(image).toBeInTheDocument();
  });

  it("renders the correct text", () => {
    render(<Home />);
    expect(screen.getByText("Good work begins with a well-planned team.")).toBeInTheDocument();
    expect(screen.getByText(/Welcome to Rostrix/)).toBeInTheDocument();
  });
});
