import { render, screen, fireEvent } from "@testing-library/react";
import AppCustomizedAxisTick from "./AppCustomizedAxisTick";
import "@testing-library/jest-dom";

describe("AppCustomizedAxisTick Component", () => {
  it("tests the AppCustomizedAxisTick Component", () => {
    const costCenterName = "Anubhava";
    const mockProps = {
      x: 100,
      y: 50,
      payload: {
        value: "Anubhava",
      },
    };
    render(<AppCustomizedAxisTick {...mockProps} />);

    expect(screen.getByText(costCenterName)).toBeInTheDocument();
  });
  it("tests the AppCustomizedAxisTick Component Case 2", () => {
    const costCenterName = "Anubhava Testss...";
    const mockProps = {
      x: 100,
      y: 50,
      payload: {
        value: "Anubhava Testsssss",
      },
    };
    render(<AppCustomizedAxisTick {...mockProps} />);

    expect(screen.getByText(costCenterName)).toBeInTheDocument();
  });
});
