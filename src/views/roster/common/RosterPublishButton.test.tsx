import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import RosterPublishButton from "./RosterPublishButton";
import { PUBLISH_OPTIONS } from "../../../helper/Constant";

describe("RosterPublishButton Component", () => {
  const mockSetGlobalNotifyTo = jest.fn();
  const mockOnPublishRoster = jest.fn();

  const renderComponent = () =>
    render(
      <RosterPublishButton
        setGlobalNotifyTo={mockSetGlobalNotifyTo}
        onPublishRoster={mockOnPublishRoster}
        withSave={false}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Publish button", () => {
    renderComponent();

    expect(screen.getByTestId("menu-button")).toBeInTheDocument();
  });

  it("displays menu options when the Publish button is clicked", () => {
    renderComponent();

    fireEvent.click(screen.getByTestId("menu-button"));

    PUBLISH_OPTIONS.forEach(({ label }) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("calls setGlobalNotifyTo and onPublishRoster with the correct value on option click", () => {
    renderComponent();

    fireEvent.click(screen.getByTestId("menu-button"));

    const { value, label } = PUBLISH_OPTIONS[0];

    fireEvent.click(screen.getByText(label));

    expect(mockSetGlobalNotifyTo).toHaveBeenCalledWith(value);
    expect(mockOnPublishRoster).toHaveBeenCalledWith({ notifyTo: value });
  });

  it("calls setGlobalNotifyTo and onPublishRoster for each option", () => {
    renderComponent();

    fireEvent.click(screen.getByTestId("menu-button"));

    PUBLISH_OPTIONS.forEach(({ label, value }) => {
      fireEvent.click(screen.getByText(label));

      expect(mockSetGlobalNotifyTo).toHaveBeenCalledWith(value);
      expect(mockOnPublishRoster).toHaveBeenCalledWith({ notifyTo: value });
    });
  });
});
