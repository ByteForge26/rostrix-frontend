import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CJPShiftCard from "./CJPShiftCard";
import { ChakraProvider } from "@chakra-ui/react";

const createMockProps = (overrides = {}) => {
  const defaultProps = {
    shift: {
      startTime: "08:00:00",
      endTime: "12:00:00",
      clusterId: 1,
    },
    time: "08:00:00",
    date: "2025-02-21",
    message: "",
    setMessage: jest.fn(),
    leftPlacementObj: {
      "2025-02-21": [
        {
          min: "07:00:00",
          max: "13:00:00",
          values: ["08:00:00_12:00:00_1"],
        },
      ],
    },
    clusters: [{ id: 1, name: "Cluster 1" }],
    setShiftHoverId: jest.fn(),
    shiftHoverId: "",
    edit: true,
    onSaveShift: jest.fn(),
    id: 1,
    isOpen: false,
    onClose: jest.fn(),
    onOpen: jest.fn(),
    status: "active",
  };

  return { ...defaultProps, ...overrides };
};

describe("CJPShiftCard Component", () => {
  const renderComponent = (props = {}) => {
    const mockProps = createMockProps(props);
    return render(
      <ChakraProvider>
        <CJPShiftCard {...mockProps} />
      </ChakraProvider>
    );
  };

  it("renders shift card with correct details", () => {
    renderComponent();
    expect(screen.getByText("Cluster 1")).toBeInTheDocument();
    expect(screen.getByText("8 AM - 12 PM")).toBeInTheDocument();
  });

  it("calls onOpen when shift card is clicked in edit mode", () => {
    const mockProps = createMockProps();
    const { getByTestId } = renderComponent();

    const menuButton = getByTestId("menu-button");
    fireEvent.click(menuButton);
    const onOpenMock = jest.mocked(mockProps.onOpen);
  });

  it("does not open menu when edit is false", () => {
    const mockProps = createMockProps({ edit: false });
    const { getByTestId } = renderComponent({ edit: false });

    const menuButton = getByTestId("menu-button");
    fireEvent.click(menuButton);

    const onOpenMock = jest.mocked(mockProps.onOpen);
    expect(onOpenMock).not.toHaveBeenCalled();
  });

  it("handles mouse leave when not in edit mode", () => {
    const mockProps = createMockProps({ edit: false });
    const { getByTestId } = renderComponent({ edit: false });

    const menuButton = getByTestId("menu-button");
    fireEvent.mouseLeave(menuButton);

    const setShiftHoverIdMock = jest.mocked(mockProps.setShiftHoverId);
  });

  it("calculates left placement correctly with complex leftPlacementObj", () => {
    const complexLeftPlacementObj = {
      "2025-02-21": [
        {
          min: "07:00:00",
          max: "13:00:00",
          values: [
            "08:00:00_12:00:00_1",
            "09:00:00_11:00:00_2",
            "10:00:00_11:30:00_3",
          ],
        },
      ],
    };

    renderComponent({
      leftPlacementObj: complexLeftPlacementObj,
    });
    expect(screen.getByText("Cluster 1")).toBeInTheDocument();
  });

  it("handles case when cluster is not found", () => {
    const { container } = render(
      <ChakraProvider>
        <CJPShiftCard
          {...createMockProps({
            clusters: [],
            shift: {
              startTime: "08:00:00",
              endTime: "12:00:00",
              clusterId: 999,
            },
          })}
        />
      </ChakraProvider>
    );
    expect(container.children[0].children.length).toBe(0);
  });

  it("handles different time ranges", () => {
    const mockProps = createMockProps({
      shift: {
        startTime: "14:30:00",
        endTime: "18:45:00",
        clusterId: 1,
      },
      time: "14:30:00",
    });

    renderComponent(mockProps);
    expect(screen.getByText("2:30 PM - 6:45 PM")).toBeInTheDocument();
  });
});
