import { render, screen, fireEvent } from "@testing-library/react";
import OtherShiftTag from "./OtherShiftTag";
import { convertTime } from "../../../helper/Utils";

describe("OtherShiftTag Component", () => {
  const defaultProps = {
    name: "Test Shift",
    comment: "This is a test comment",
    startTime: "09:00",
    endTime: "17:00",
    empId: "123",
    id: 1,
    color: "blue",
    background: "lightgray",
  };

  it("renders shift time correctly", () => {
    render(<OtherShiftTag {...defaultProps} />);
    const timeText = `${convertTime(defaultProps.startTime)} - ${convertTime(
      defaultProps.endTime
    )}`;
    expect(screen.getByText(timeText)).toBeInTheDocument();
  });

  it("renders shift name with tooltip", async () => {
    render(<OtherShiftTag {...defaultProps} />);
    expect(screen.getByText(defaultProps.name)).toBeInTheDocument();
  });

  it("does not render comment icon when viewOnly is true", () => {
    render(<OtherShiftTag {...defaultProps} viewOnly={true} />);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("does not show remove button when onRemoveShift is not provided", () => {
    render(<OtherShiftTag {...defaultProps} />);
    expect(screen.queryByTestId("menu-button")).not.toBeInTheDocument();
  });

  it("calls onRemoveShift with correct shift properties when remove button is clicked", () => {
    const onRemoveShift = jest.fn();
    const props = {
      ...defaultProps,
      onRemoveShift,
      workId: 42,
      secondaryJobType: "Special Shift",
    };

    render(<OtherShiftTag {...props} />);

    const removeButton = screen.getByTestId("menu-button");
    expect(removeButton).toBeInTheDocument();

    const removeIcon = removeButton.querySelector("svg");
    fireEvent.click(removeIcon);
    expect(onRemoveShift).toHaveBeenCalledTimes(1);
    expect(onRemoveShift).toHaveBeenCalledWith({
      empId: props.empId,
      id: props.id,
      shift: {
        endTime: props.endTime,
        startTime: props.startTime,
        comment: props.comment,
        workId: props.workId,
        secondaryJobType: props.secondaryJobType,
      },
    });
  });

  it("uses default values for workId and secondaryJobType when they are not provided", () => {
    const onRemoveShift = jest.fn();
    const props = {
      ...defaultProps,
      onRemoveShift,
    };

    render(<OtherShiftTag {...props} />);

    const removeButton = screen.getByTestId("menu-button");
    const removeIcon = removeButton.querySelector("svg");
    fireEvent.click(removeIcon);
    expect(onRemoveShift).toHaveBeenCalledWith({
      empId: props.empId,
      id: props.id,
      shift: {
        endTime: props.endTime,
        startTime: props.startTime,
        comment: props.comment,
        workId: 0, 
        secondaryJobType: "", 
      },
    });
  });
});

