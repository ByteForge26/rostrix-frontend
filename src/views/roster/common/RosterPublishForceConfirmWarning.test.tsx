import { render, screen, fireEvent } from "@testing-library/react";
import RosterPublishForceConfirmWarning from "./RosterPublishForceConfirmWarning";
import "@testing-library/jest-dom";

describe("RosterPublishForceConfirmWarning", () => {
  const mockOnClose = jest.fn();
  const mockOnPublishRoster = jest.fn();

  const defaultProps = {
    isForceConfirmModalOpen: true,
    onForceConfirmModalClose: mockOnClose,
    messageObj: [
      { messageType: "INFO", message: "This is an info message" },
      { messageType: "WARN", message: "This is a warning message" },
    ],
    onPublishRoster: mockOnPublishRoster,
    globalNotifyTo: "test@example.com",
  };

  it("renders the modal with messages", () => {
    render(<RosterPublishForceConfirmWarning {...defaultProps} />);

    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("This is an info message")).toBeInTheDocument();
    expect(screen.getByText("This is a warning message")).toBeInTheDocument();
  });

  it("closes the modal when Close button is clicked", () => {
    render(<RosterPublishForceConfirmWarning {...defaultProps} />);

    fireEvent.click(screen.getByText("Close"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onPublishRoster with correct parameters when Confirm button is clicked", () => {
    render(<RosterPublishForceConfirmWarning {...defaultProps} />);

    fireEvent.click(screen.getByText("Confirm"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnPublishRoster).toHaveBeenCalledWith({
      notifyTo: "test@example.com",
      forceConfirm: true,
    });
  });

  it("does not render any message if messageObj is empty", () => {
    render(
      <RosterPublishForceConfirmWarning
        {...defaultProps}
        messageObj={undefined}
      />
    );

    expect(
      screen.queryByText("This is an info message")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("This is a warning message")
    ).not.toBeInTheDocument();
  });
});
