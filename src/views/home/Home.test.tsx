import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "./Home";
import AppContainer from "../../components/AppContainer";
import { homeImage } from "../../helper/Images";

jest.mock(
  "../../components/AppContainer",
  () =>
    ({ children }: { children: React.ReactNode }) =>
      <div data-testid="app-container">{children}</div>
);

jest.mock("../../helper/Images", () => ({
  homeImage: "test-image-src",
}));

describe("Home Component", () => {
  it("renders without crashing", () => {
    render(<Home />);
    expect(screen.getByTestId("app-container")).toBeInTheDocument();
  });

  it("displays the home image", () => {
    render(<Home />);
    const image = screen.getByRole("img");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "test-image-src");
  });

  it("renders the correct text", () => {
    render(<Home />);
    expect(
      screen.getByText(/Time to rock the roster with EffiMate!/i)
    ).toBeInTheDocument();
  });
});
