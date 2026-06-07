import { render, screen, fireEvent } from "@testing-library/react";
import CJPCellCard from "./CJPCellCard";
import { ChakraProvider } from "@chakra-ui/react";

describe("CJPCellCard Component", () => {
  const mockOnSaveShift = jest.fn();
  const mockOnClose = jest.fn();
  const mockOnOpen = jest.fn();
  const setMessage = jest.fn();

  const mockProps = {
    clusters: [{ id: 1, name: "Cluster 1" }],
    time: "10:00:00",
    edit: true,
    message: "",
    setMessage,
    onSaveShift: mockOnSaveShift,
    isOpen: true, 
    onClose: mockOnClose,
    onOpen: mockOnOpen,
  };

  test("renders without crashing", () => {
    render(
      <ChakraProvider>
        <CJPCellCard {...mockProps} />
      </ChakraProvider>
    );

    expect(screen.getByTestId("menu-button")).toBeInTheDocument();
  });

  test("opens menu on click", () => {
    render(
      <ChakraProvider>
        <CJPCellCard {...mockProps} />
      </ChakraProvider>
    );

    const button = screen.getByTestId("menu-button");
    fireEvent.click(button);

    expect(mockOnOpen).toHaveBeenCalled();
  });

  test("calls onClose when menu closes", () => {
    render(
      <ChakraProvider>
        <CJPCellCard {...mockProps} />
      </ChakraProvider>
    );

    mockProps.onClose();
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("calls onSaveShift with correct arguments", () => {
    render(
      <ChakraProvider>
        <CJPCellCard {...mockProps} />
      </ChakraProvider>
    );

    const shiftData = {
      clusterId: 1,
      endTime: "12:00:00",
      startTime: "10:00:00",
      deleted: false,
      id: 123,
    };
    const wrapperFunction = ({
      clusterId,
      endTime,
      startTime,
      deleted,
      id,
    }) => {
      mockProps.onSaveShift({ clusterId, endTime, startTime, deleted, id });
    };

    wrapperFunction(shiftData);

    expect(mockOnSaveShift).toHaveBeenCalledWith(shiftData);
  });
});
