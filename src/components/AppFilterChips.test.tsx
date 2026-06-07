import { render, screen, fireEvent } from "@testing-library/react";
import AppFilterChips from "./AppFilterChips";
import { AiOutlineEdit } from "react-icons/ai";
import "@testing-library/jest-dom";

describe("AppFilterChips Component", () => {
  test("renders filters correctly", () => {
    const filters = ["Filter1", "Filter2"];
    render(<AppFilterChips filters={filters} />);

    filters.forEach((filter) => {
      expect(screen.getByText(filter)).toBeInTheDocument();
    });
  });

  test("triggers onClick when filter is clicked", () => {
    const onClickMock = jest.fn();
    const filters = ["Filter1"];

    render(<AppFilterChips filters={filters} onClick={onClickMock} />);

    fireEvent.click(screen.getByText("Filter1"));
    expect(onClickMock).toHaveBeenCalled();
  });

  test("does not render anything if filters array is empty", () => {
    render(<AppFilterChips filters={[]} />);
    expect(screen.queryByText("Filter1")).not.toBeInTheDocument();
  });
});
