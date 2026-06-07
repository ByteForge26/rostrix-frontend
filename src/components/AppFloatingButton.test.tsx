import { render, screen, fireEvent } from "@testing-library/react";
import AppFloatingButton from "./AppFloatingButton";
import "@testing-library/jest-dom";

describe("AppFloatingButton Component", () => {
  test("renders button with provided label", () => {
    render(<AppFloatingButton label="Click Me" onClick={() => {}} />);
    expect(
      screen.getByRole("button", { name: /click me/i })
    ).toBeInTheDocument();
  });

  test("calls onClick when button is clicked", () => {
    const onClickMock = jest.fn();
    render(<AppFloatingButton label="Click Me" onClick={onClickMock} />);

    fireEvent.click(screen.getByRole("button", { name: /click me/i }));
    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
