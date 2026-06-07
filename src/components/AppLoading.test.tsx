import { render, screen } from "@testing-library/react";
import AppLoading from "./AppLoading";
import "@testing-library/jest-dom";

jest.mock("./AppLoader", () => () => <div data-testid="app-loader" />);

describe("AppLoading Component", () => {
  test("renders AppLoader component", () => {
    render(<AppLoading />);
    expect(screen.getByTestId("app-loader")).toBeInTheDocument();
  });
});
