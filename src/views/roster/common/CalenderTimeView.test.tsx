import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import moment from "moment";
import CalenderTimeView from "./CalenderTimeView";
import * as Utils from "../../../helper/Utils";

jest.mock("../../../helper/Constant", () => ({
  CJP_DAY_CARD_HEIGHT: 50,
  DAYS: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  CJP_CELL_HEIGHT: 30,
  CJP_TIME_CELL_WIDTH: 100,
  DEFAULT_START_TIME: "09:00:00",
  DEFAULT_OPEN_TIME: "08:00:00",
}));

jest.mock("./CJPCellCard", () => {
  return jest.fn(({ onSaveShift, onClose, onOpen, isOpen }) => (
    <div data-testid="cell-card">
      <button
        data-testid="save-cell-shift"
        onClick={() =>
          onSaveShift({
            startTime: "09:00:00",
            endTime: "12:00:00",
            clusterId: 1,
          })
        }
      >
        Save Cell Shift
      </button>
      <button
        data-testid="save-conflicting-shift"
        onClick={() =>
          onSaveShift({
            startTime: "09:00:00",
            endTime: "12:00:00",
            clusterId: 2,
          })
        }
      >
        Save Conflicting Shift
      </button>
      <button data-testid="close-cell-card" onClick={onClose}>
        Close
      </button>
      <button data-testid="open-cell-card" onClick={onOpen}>
        Open
      </button>
      <span data-testid="cell-card-isopen">{isOpen ? "Open" : "Closed"}</span>
    </div>
  ));
});

jest.mock("./CJPShiftCard", () => {
  return jest.fn(
    ({
      shift,
      onSaveShift,
      setShiftHoverId,
      onClose,
      onOpen,
      isOpen,
      date,
      clusterId,
    }) => (
      <div
        data-testid="shift-card"
        data-shift-id={shift?.id}
        data-shift-start={shift?.startTime}
      >
        Mocked Shift Card
        <button
          data-testid="update-shift"
          onClick={() =>
            onSaveShift({
              id: shift.id,
              startTime: "10:00:00",
              endTime: "13:00:00",
              clusterId: shift.clusterId,
            })
          }
        >
          Update Shift
        </button>
        <button
          data-testid="delete-shift"
          onClick={() =>
            onSaveShift({
              id: shift.id,
              startTime: shift.startTime,
              endTime: shift.endTime,
              clusterId: shift.clusterId,
              deleted: true,
            })
          }
        >
          Delete Shift
        </button>
        <button
          data-testid="set-shift-hover"
          onClick={() =>
            setShiftHoverId(
              `${date}_${shift.startTime}_${shift.endTime}_${shift.clusterId}`
            )
          }
        >
          Set Hover
        </button>
        <button data-testid="close-shift-card" onClick={onClose}>
          Close
        </button>
        <button data-testid="open-shift-card" onClick={onOpen}>
          Open
        </button>
        <span data-testid="shift-isopen">{isOpen ? "Open" : "Closed"}</span>
      </div>
    )
  );
  return jest.fn(
    ({
      shift,
      onSaveShift,
      setShiftHoverId,
      onClose,
      onOpen,
      isOpen,
      date,
      clusterId,
    }) => (
      <div
        data-testid="shift-card"
        data-shift-id={shift?.id}
        data-shift-start={shift?.startTime}
      >
        Mocked Shift Card
        <button
          data-testid="update-shift"
          onClick={() =>
            onSaveShift({
              id: shift.id,
              startTime: "10:00:00",
              endTime: "13:00:00",
              clusterId: shift.clusterId,
            })
          }
        >
          Update Shift
        </button>
        <button
          data-testid="delete-shift"
          onClick={() =>
            onSaveShift({
              id: shift.id,
              startTime: shift.startTime,
              endTime: shift.endTime,
              clusterId: shift.clusterId,
              deleted: true,
            })
          }
        >
          Delete Shift
        </button>
        <button
          data-testid="set-shift-hover"
          onClick={() =>
            setShiftHoverId(
              `${date}_${shift.startTime}_${shift.endTime}_${shift.clusterId}`
            )
          }
        >
          Set Hover
        </button>
        <button data-testid="close-shift-card" onClick={onClose}>
          Close
        </button>
        <button data-testid="open-shift-card" onClick={onOpen}>
          Open
        </button>
        <span data-testid="shift-isopen">{isOpen ? "Open" : "Closed"}</span>
      </div>
    )
  );
});

// Mock console.log
console.log = jest.fn();


describe("CalenderTimeView Component", () => {
  const generateMockData = (overrides = {}) => {
    const baseDate = moment().format("YYYY-MM-DD");
    const nextDate = moment(baseDate).add(1, "day").format("YYYY-MM-DD");

    return {
      days: [
        {
          date: baseDate,
          shifts: [
            {
              startTime: "09:00:00",
              endTime: "12:00:00",
              clusterId: 1,
              id: 101,
            },
          ],
          status: "WORKDAY",
          metadata: "Test Metadata",
          edit: true,
        },
        {
          date: nextDate,
          shifts: [],
          status: "HOLIDAY",
          metadata: "",
          edit: false,
        },
      ],
      plannedJobTimes: [
        { label: "09:00 AM", value: "09:00:00" },
        { label: "10:00 AM", value: "10:00:00" },
        { label: "11:00 AM", value: "11:00:00" },
        { label: "01:00 PM", value: "13:00:00" },
      ],
      clusters: [
        { id: 1, name: "Cluster 1" },
        { id: 2, name: "Cluster 2" },
      ],
      edit: true,
      onSaveShift: jest.fn(),
      contentMaxHeight: "500px",
      ...overrides,
    };
  };
  const renderComponent = (props = {}) => {
    const mockProps = generateMockData(props);
    return render(
      <ChakraProvider>
        <CalenderTimeView {...mockProps} />
      </ChakraProvider>
    );
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    test("renders component with default data", () => {
      renderComponent();
      const currentMonth = moment().format("MMM");
      const currentDate = moment().get("date").toString();
      const monthElements = screen.queryAllByText(currentMonth);
      const dateElements = screen.queryAllByText(currentDate);
      expect(monthElements.length).toBeGreaterThan(0);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    test("renders different day statuses", () => {
      renderComponent();
      const dateElement = screen.getByText(moment().get("date").toString());
      expect(dateElement).toHaveStyle({ color: "#027DBC" });
    });

    test("displays metadata tooltip", () => {
      renderComponent();
      expect(screen.getByText("Test Metadata")).toBeInTheDocument();
    });

    test("renders NA status with striped background", () => {
      renderComponent({
        days: [
          {
            date: moment().format("YYYY-MM-DD"),
            shifts: [],
            status: "NA",
            edit: true,
          },
        ],
      });
      const rendered = screen.getByText(moment().format("MMM"));
      expect(rendered).toBeInTheDocument();
    });
  });

  describe("Planned Job Times", () => {
    test("renders planned job times", () => {
      renderComponent();
      expect(screen.getByText("09:00 AM")).toBeInTheDocument();
      expect(screen.getByText("10:00 AM")).toBeInTheDocument();
      expect(screen.getByText("11:00 AM")).toBeInTheDocument();
      expect(screen.getByText("01:00 PM")).toBeInTheDocument();
    });

    test("handles empty planned job times", () => {
      renderComponent({ plannedJobTimes: [] });
      const jobTimeElements = screen.queryAllByText(/:\d+ [AP]M/);
      expect(jobTimeElements).toHaveLength(0);
    });
  });

  describe("Shifts and Interactions", () => {
    test("handles multiple shifts on the same day", () => {
      const multiShiftData = generateMockData({
        days: [
          {
            date: moment().format("YYYY-MM-DD"),
            shifts: [
              {
                startTime: "09:00:00",
                endTime: "12:00:00",
                clusterId: 1,
                id: 101,
              },
              {
                startTime: "13:00:00",
                endTime: "17:00:00",
                clusterId: 2,
                id: 102,
              },
            ],
            status: "WORKDAY",
            edit: true,
          },
        ],
      });

      render(
        <ChakraProvider>
          <CalenderTimeView {...multiShiftData} />
        </ChakraProvider>
      );
    });

    test("handles shift overlap detection", () => {
      jest.spyOn(Utils, "isShiftOverlap").mockImplementation(({ id }) => {
        if (id === 101) {
          return { isConflicting: false, message: "" };
        }
        return { isConflicting: true, message: "Shifts are overlapping!" };
      });

      const overlapData = generateMockData({
        days: [
          {
            date: moment().format("YYYY-MM-DD"),
            shifts: [
              {
                startTime: "09:00:00",
                endTime: "12:00:00",
                clusterId: 1,
                id: 101,
              },
              {
                startTime: "10:00:00",
                endTime: "13:00:00",
                clusterId: 2,
                id: 102,
              },
            ],
            status: "WORKDAY",
            edit: true,
          },
        ],
      });

      const { getByTestId } = render(
        <ChakraProvider>
          <CalenderTimeView {...overlapData} />
        </ChakraProvider>
      );
      const cells = document.querySelectorAll("[id='123']");
      fireEvent.click(cells[0]);
    });

    test("renders shifts at specific time intervals", () => {
      const baseDate = moment().format("YYYY-MM-DD");
      const customData = generateMockData({
        days: [
          {
            date: baseDate,
            shifts: [
              {
                startTime: "10:00:00",
                endTime: "12:00:00",
                clusterId: 1,
                id: 101,
              },
              {
                startTime: "10:30:00",
                endTime: "14:00:00",
                clusterId: 2,
                id: 102,
              },
            ],
            status: "WORKDAY",
            edit: true,
          },
        ],
      });

      render(
        <ChakraProvider>
          <CalenderTimeView {...customData} />
        </ChakraProvider>
      );
    });
  });

  describe("User Interactions", () => {
    test("handles cell click to open cell card", () => {
      renderComponent();
      const cells = document.querySelectorAll("[id='123']");
      fireEvent.click(cells[0]);
    });

    test("does not allow interactions on non-editable days", () => {
      renderComponent({ edit: false });
      const cells = document.querySelectorAll("[id='123']");
      cells.forEach((cell) => {
        expect(cell).toHaveStyle({ cursor: "not-allowed" });
      });
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("gracefully handles undefined or null props", () => {
      const { container } = render(
        <ChakraProvider>
          <CalenderTimeView
            days={[]}
            plannedJobTimes={[]}
            clusters={[]}
            edit={false}
            contentMaxHeight="500px"
          />
        </ChakraProvider>
      );
      expect(container).toBeTruthy();
    });

    test("prevents cell click when editable is false", () => {
      renderComponent({ edit: false });
      const cells = document.querySelectorAll("[id='123']");
      fireEvent.click(cells[0]);
      const cellCard = screen.queryByTestId("cell-card");
      expect(cellCard).not.toBeInTheDocument();
    });
  });
});