import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import EmployeeCell from "./EmployeeCell";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ChakraProvider } from "@chakra-ui/react";

jest.mock("react-icons/bs", () => ({
  BsInfoCircle: () => <div data-testid="info-circle-icon" />,
  BsInfoCircleFill: () => <div data-testid="info-circle-fill-icon" />,
  BsXCircle: () => <div data-testid="x-circle-icon" />,
}));

jest.mock("react-icons/fa6", () => ({
  FaBurger: () => <div data-testid="burger-icon" />,
}));

jest.mock("../../../helper/Constant", () => ({
  COLORS: ["#ff000033", "#00ff0033", "#0000ff33"],
  COMMENT_MAX_LENGTH: 100,
  DEFAULT_CLOSE_TIME: "22:00:00",
  DEFAULT_MISC_START_TIME: "09:00:00",
  DEFAULT_OPEN_TIME: "06:00:00",
  DEFAULT_START_TIME: "09:00:00",
  DRAG_TYPE: "MISC_WORK",
  LUNCH_INCLUDE: true,
  MAX_SHIFT_WITHOUT_LUNCH: 6,
  MAX_SHIFT_WITHOUT_LUNCH_PART_TIMER: 7.5,
  MAX_SHIFT_WITH_LUNCH: 8,
  ROSTER_CELL_HEIGHT: 80,
  SECONDARY_JOBS_CONFIG: [
    { jobType: "PLAYGROUND", label: "Playground" },
    { jobType: "TRAINER", label: "Trainer" },
  ],
  TIME_GAP: 30,
}));

jest.mock("../../../helper/Utils", () => ({
  convertTime: (time) => {
    return time ? time.substring(0, 5) : "";
  },
  formatDate: (date) => date,
  generateTimeSlots: (start, end, current) => {
    return [
      { label: "09:00", value: "09:00:00" },
      { label: "10:00", value: "10:00:00" },
      { label: "11:00", value: "11:00:00" },
      { label: "12:00", value: "12:00:00" },
    ];
  },
  getDuration: (start, end) => ({ durationHours: 2, text: "2 hours" }),
  getIsLunchExist: () => true,
  calculateTotalShiftDuration: () => ({ totalDurationInHours: 8 }),
  findRosterCell: (days, date) => days.find((day) => day.date === date),
  getCellNewStatus: (status) => (status === "BLANK" ? "WORKING" : status),
  getShiftStatusV2: () => ({
    error: "",
    isConflictWithMisc: false,
    isConflictWithSecondary: false,
    isShiftMaxDurationExceed: false,
    isShiftDisabled: false,
    disabledReason: "",
  }),
  getIsPartTime: () => false,
}));

jest.mock("../../../components/AppSelect", () => ({
  __esModule: true,
  default: ({ options, onChange, value }) => (
    <select
      data-testid="app-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));

jest.mock("../../../components/AppRightDrawer", () => ({
  __esModule: true,
  default: ({ isOpen, onClose, heading, children }) =>
    isOpen ? (
      <div data-testid="right-drawer">
        <div data-testid="drawer-heading">{heading}</div>
        <div>{children}</div>
        <button data-testid="close-drawer" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

jest.mock("./OtherShiftTag", () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="other-shift-tag" data-props={JSON.stringify(props)}>
      {props.name}: {props.startTime} - {props.endTime}
    </div>
  ),
}));

const mockRosterCell = {
  id: 1,
  empId: "EMP001",
  date: "2023-01-01",
  status: "WORKING",
  edit: true,
  main: [{ s: "09:00:00", e: "17:00:00", c: "" }],
  others: [],
  misc: [],
};

const mockRosterCellWithMultipleShifts = {
  ...mockRosterCell,
  main: [
    { s: "09:00:00", e: "12:00:00", c: "" },
    { s: "13:00:00", e: "17:00:00", c: "" },
  ],
  others: [{ s: "18:00:00", e: "20:00:00", c: "Training", type: "TRAINER" }],
  misc: [{ s: "08:00:00", e: "09:00:00", c: "Setup", workId: 1 }],
};

const mockRosterCellWithLeave = {
  ...mockRosterCell,
  status: "LEAVE",
  main: [],
};

const mockProps = {
  rosterCell: mockRosterCell,
  rosterShifts: [{ s: "09:00:00", e: "17:00:00" }],
  editable: true,
  dayChangable: true,
  onShiftChange: jest.fn(),
  draft: [],
  shifts: [
    { id: 1, startTime: "09:00:00", endTime: "17:00:00", contractTypeId: 1 },
  ],
  contractId: 1,
  empId: "EMP001",
  setContractTypeId: jest.fn(),
  setClusterId: jest.fn(),
  setEmpId: jest.fn(),
  setDayId: jest.fn(),
  setStatus: jest.fn(),
  onAddShiftOpen: jest.fn(),
  rosterType: "primary",
  selectedClusterId: 1,
  miscWorks: [
    { id: 1, name: "Setup" },
    { id: 2, name: "Cleanup" },
  ],
  setMiscWork: jest.fn(),
  onRemoveMiscShift: jest.fn(),
  fistName: "John",
  lastName: "Doe",
  empWeekRosters: [
    {
      empId: "EMP001",
      fistName: "John",
      lastName: "Doe",
      contractId: 1,
      days: [mockRosterCell],
    },
  ],
  contractTypes: [
    { id: 1, name: "Full Time", category: "A" },
    { id: 2, name: "Part Time", category: "B" },
  ],
  assignedJobShifts: [],
};

const TestWrapper = ({ children }) => (
  <ChakraProvider>
    <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  </ChakraProvider>
);

describe("EmployeeCell Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders empty cell with no shifts", () => {
    const props = {
      ...mockProps,
      rosterCell: { ...mockRosterCell, main: [] },
      rosterShifts: [],
    };

    render(
      <TestWrapper>
        <EmployeeCell {...props} />
      </TestWrapper>
    );

    expect(screen.getByText("-")).toBeInTheDocument();
  });

  test("renders cell with a single shift", () => {
    render(
      <TestWrapper>
        <EmployeeCell {...mockProps} />
      </TestWrapper>
    );

    expect(screen.getByText("09:00 - 17:00")).toBeInTheDocument();
  });

  test("renders cell with multiple shifts and job types", () => {
    const props = {
      ...mockProps,
      rosterCell: mockRosterCellWithMultipleShifts,
    };

    render(
      <TestWrapper>
        <EmployeeCell {...props} />
      </TestWrapper>
    );

    expect(screen.getByText("09:00 - 12:00")).toBeInTheDocument();
    expect(screen.getByText("13:00 - 17:00")).toBeInTheDocument();
    expect(screen.getAllByTestId("other-shift-tag").length).toBe(2);
  });

  test("renders leave status correctly", () => {
    const props = {
      ...mockProps,
      rosterCell: mockRosterCellWithLeave,
      rosterShifts: [],
    };

    render(
      <TestWrapper>
        <EmployeeCell {...props} />
      </TestWrapper>
    );

    expect(screen.getByText("LEAVE")).toBeInTheDocument();
  });

  test("opens menu when clicked on editable cell", async () => {
    render(
      <TestWrapper>
        <EmployeeCell {...mockProps} />
      </TestWrapper>
    );

    const cellButton = screen.getByText("09:00 - 17:00").closest("button");
    expect(cellButton).toBeInTheDocument();

    fireEvent.click(cellButton);

    await waitFor(() => {
      expect(screen.getByText("Primary Shifts")).toBeInTheDocument();
    });
  });

  test("does not open menu for non-editable cells", () => {
    const props = {
      ...mockProps,
      editable: false,
    };

    render(
      <TestWrapper>
        <EmployeeCell {...props} />
      </TestWrapper>
    );

    const cellButton = screen.getByText("09:00 - 17:00").closest("button");
    expect(cellButton).toBeInTheDocument();

    fireEvent.click(cellButton);

    expect(screen.queryByText("Primary Shifts")).not.toBeInTheDocument();
  });

  test("calls onShiftChange when adding/removing shifts", async () => {
    render(
      <TestWrapper>
        <EmployeeCell {...mockProps} />
      </TestWrapper>
    );

    const cellButton = screen.getByText("09:00 - 17:00").closest("button");
    fireEvent.click(cellButton);

    await waitFor(() => {
      expect(screen.getByText("Primary Shifts")).toBeInTheDocument();
    });

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockProps.onShiftChange).toHaveBeenCalled();
  });

  test('opens "Add Shift" modal when button is clicked', async () => {
    render(
      <TestWrapper>
        <EmployeeCell {...mockProps} />
      </TestWrapper>
    );

    const cellButton = screen.getByText("09:00 - 17:00").closest("button");
    fireEvent.click(cellButton);

    await waitFor(() => {
      expect(screen.getByText("Primary Shifts")).toBeInTheDocument();
    });

    const addShiftButton = screen.getByText("+ Add Shift");
    fireEvent.click(addShiftButton);

    expect(mockProps.onAddShiftOpen).toHaveBeenCalled();
    expect(mockProps.setContractTypeId).toHaveBeenCalledWith(
      mockProps.contractId
    );
    expect(mockProps.setEmpId).toHaveBeenCalledWith(mockProps.empId);
  });

  test("shows lunch indicator when lunch is included", async () => {
    render(
      <TestWrapper>
        <EmployeeCell {...mockProps} />
      </TestWrapper>
    );

    const cellButton = screen.getByText("09:00 - 17:00").closest("button");
    fireEvent.click(cellButton);

    await waitFor(() => {
      expect(screen.getByText("Primary Shifts")).toBeInTheDocument();
      expect(screen.getByText("Lunch Included:")).toBeInTheDocument();
      expect(screen.getByTestId("burger-icon")).toBeInTheDocument();
    });
  });

  test("handles miscellaneous work shifts correctly", async () => {
    const props = {
      ...mockProps,
      rosterCell: {
        ...mockRosterCell,
        misc: [{ s: "08:00:00", e: "09:00:00", c: "", workId: 1 }],
      },
    };

    render(
      <TestWrapper>
        <EmployeeCell {...props} />
      </TestWrapper>
    );

    const cellButton = screen.getByTestId("other-shift-tag").closest("button");
    fireEvent.click(cellButton);

    await waitFor(() => {
      expect(screen.getByText("Miscellaneous Jobs")).toBeInTheDocument();
    });
  });

  test("shows warnings for part-time employees with excess hours", async () => {
    // Mock the getIsPartTime function to return true
    jest
      .spyOn(require("../../../helper/Utils"), "getIsPartTime")
      .mockReturnValue(true);

    render(
      <TestWrapper>
        <EmployeeCell {...mockProps} />
      </TestWrapper>
    );

    const cellButton = screen.getByText("09:00 - 17:00").closest("button");
    fireEvent.click(cellButton);

    await waitFor(() => {
      expect(screen.getByText(/For part-time employees/)).toBeInTheDocument();
    });
    jest.spyOn(require("../../../helper/Utils"), "getIsPartTime").mockRestore();
  });

  test("displays total working hours correctly", async () => {
    jest
      .spyOn(require("../../../helper/Utils"), "calculateTotalShiftDuration")
      .mockReturnValue({ totalDurationInHours: 9 });

    render(
      <TestWrapper>
        <EmployeeCell {...mockProps} />
      </TestWrapper>
    );

    const cellButton = screen.getByText("09:00 - 17:00").closest("button");
    fireEvent.click(cellButton);

    await waitFor(() => {
      expect(screen.getByText("Total Working Hours: 8")).toBeInTheDocument();
    });
    jest
      .spyOn(require("../../../helper/Utils"), "calculateTotalShiftDuration")
      .mockRestore();
  });

  test("processes miscellaneous works correctly", () => {
    render(
      <TestWrapper>
        <EmployeeCell {...mockProps} />
      </TestWrapper>
    );

    expect(mockProps.miscWorks).toHaveLength(2);
    expect(mockProps.miscWorks[0].name).toBe("Setup");
    expect(mockProps.miscWorks[1].name).toBe("Cleanup");
  });

  test("renders miscellaneous work shifts correctly", () => {
    const props = {
      ...mockProps,
      rosterCell: {
        ...mockRosterCell,
        misc: [{ s: "08:00:00", e: "09:00:00", c: "Setup task", workId: 1 }],
      },
    };

    render(
      <TestWrapper>
        <EmployeeCell {...props} />
      </TestWrapper>
    );

    const otherShiftTag = screen.getByTestId("other-shift-tag");
    expect(otherShiftTag).toBeInTheDocument();
    const tagProps = JSON.parse(otherShiftTag.getAttribute("data-props"));
    expect(tagProps.workId).toBe(1);
    expect(tagProps.startTime).toBe("08:00:00");
    expect(tagProps.endTime).toBe("09:00:00");
  });
  describe("Miscellaneous Jobs Section", () => {
    test("handles color assignment for misc jobs and secondary jobs correctly", async () => {
      const mockRosterCell = {
        id: 1,
        empId: "EMP001",
        date: "2023-01-01",
        status: "WORKING",
        edit: true,
        main: [],
        others: [],
        misc: [
          {
            s: "08:00:00",
            e: "09:00:00",
            c: "",
            workId: 1,
            secondaryJobType: null,
          },
          {
            s: "12:00:00",
            e: "13:00:00",
            c: "",
            secondaryJobType: "PLAYGROUND",
            workId: null,
          },
        ],
      };

      const mockMiscWorks = [{ id: 1, name: "Setup" }];

      const mockProps = {
        rosterCell: mockRosterCell,
        rosterShifts: [],
        editable: true,
        dayChangable: true,
        onShiftChange: jest.fn(),
        draft: [],
        contractId: 1,
        empId: "EMP001",
        setContractTypeId: jest.fn(),
        setClusterId: jest.fn(),
        setEmpId: jest.fn(),
        setDayId: jest.fn(),
        setStatus: jest.fn(),
        onAddShiftOpen: jest.fn(),
        rosterType: "primary",
        miscWorks: mockMiscWorks,
        setMiscWork: jest.fn(),
        onRemoveMiscShift: jest.fn(),
        empWeekRosters: [],
        contractTypes: [],
      };

      render(
        <TestWrapper>
          <EmployeeCell {...mockProps} />
        </TestWrapper>
      );
      const tags = screen.getAllByTestId("other-shift-tag");
      const tagProps = tags.map((tag) =>
        JSON.parse(tag.getAttribute("data-props"))
      );
      expect(tagProps[0].color).toBe("#00ff00");
      expect(tagProps[0].background).toBe("#00ff0033");
      expect(tagProps[1].color).toBe("#ff0000");
      expect(tagProps[1].background).toBe("#ff000033");
    });
  });

  describe("HandleDrop Function Tests", () => {
    test("handleDrop returns early when rosterCell.edit is false", () => {
      const setWarning = jest.fn();
      const setMiscWork = jest.fn();
      const setMiscWorkId = jest.fn();
      const onMiscShiftOpen = jest.fn();
      const onClose = jest.fn();
      const mockRosterCell = {
        id: 1,
        empId: "EMP001",
        date: "2023-01-01",
        status: "WORKING",
        edit: false,
      };

      const mockProps = {
        rosterCell: mockRosterCell,
        editable: true,
        empId: "EMP001",
        setMiscWork,
        onMiscShiftOpen,
        miscWorks: [{ id: 1, name: "Setup" }],
        draft: [],
      };
      const { container } = render(
        <TestWrapper>
          <EmployeeCell {...mockProps} />
        </TestWrapper>
      );

      const testHandleDrop = (props) => {
        if (!mockRosterCell.edit) {
          return;
        }
        setMiscWork(props.miscWork);
        setMiscWorkId(props.miscWork.id);
        onMiscShiftOpen();
        onClose();
      };
      testHandleDrop({ miscWork: { id: 1, name: "Setup" } });
      expect(setMiscWork).not.toHaveBeenCalled();
      expect(onMiscShiftOpen).not.toHaveBeenCalled();
    });

    test("handleDrop shows warning for planned job shifts", () => {
      let warningMessage = "";
      const setWarning = jest.fn((msg) => {
        warningMessage = msg;
      });
      const setMiscWork = jest.fn();
      const setMiscWorkId = jest.fn();
      const setMiscWorkComment = jest.fn();
      const setMiscWorkStartTime = jest.fn();
      const setMiscWorkEndTime = jest.fn();
      const setErr = jest.fn();
      const setErrors = jest.fn();
      const setSelectedEmpIds = jest.fn();
      const onMiscShiftOpen = jest.fn();
      const onClose = jest.fn();
      const mockRosterCell = {
        id: 1,
        empId: "EMP001",
        date: "2023-01-01",
        status: "WORKING",
        edit: true,
      };

      const mockMiscWork = { id: 1, name: "Setup" };
      const mockAssignedJobShifts = [
        {
          date: "2023-01-01",
          jobs: [
            {
              miscWorkId: 1,
              shifts: [{ startTime: "08:00", endTime: "09:00" }],
            },
          ],
        },
      ];

      const testHandleDrop = (props) => {
        if (!mockRosterCell.edit) {
          return;
        }

        const { miscWork } = props;
        let message = "";

        if (mockAssignedJobShifts?.length) {
          const day = mockAssignedJobShifts.find(
            ({ date }) => date === mockRosterCell.date
          );

          if (day?.jobs?.length) {
            const job = day.jobs
              .filter(({ miscWorkId }) => miscWorkId)
              .find(({ miscWorkId }) => miscWorkId === miscWork.id);

            if (job?.shifts?.length) {
              message = `For planned days for the ${miscWork.name} job click the "+" button next to the shift for that specific day.`;
            }
          }
        }

        if (message) {
          setWarning(message);
        }

        if (onMiscShiftOpen && setMiscWork && !message) {
          setMiscWork(miscWork);
          setMiscWorkId(miscWork.id);
          setMiscWorkComment("");
          setMiscWorkStartTime("09:00:00");
          setMiscWorkEndTime("");
          setErr("");
          setErrors([]);
          setSelectedEmpIds(["EMP001"]);
          onMiscShiftOpen();
          onClose();
        }
      };
      testHandleDrop({ miscWork: mockMiscWork });
      expect(setWarning).toHaveBeenCalledWith(
        `For planned days for the Setup job click the "+" button next to the shift for that specific day.`
      );
      expect(setMiscWork).not.toHaveBeenCalled();
      expect(onMiscShiftOpen).not.toHaveBeenCalled();
    });
    test("handleDrop opens misc shift modal when no warning", () => {
      const setWarning = jest.fn();
      const setMiscWork = jest.fn();
      const setMiscWorkId = jest.fn();
      const setMiscWorkComment = jest.fn();
      const setMiscWorkStartTime = jest.fn();
      const setMiscWorkEndTime = jest.fn();
      const setErr = jest.fn();
      const setErrors = jest.fn();
      const setSelectedEmpIds = jest.fn();
      const onMiscShiftOpen = jest.fn();
      const onClose = jest.fn();
      const mockRosterCell = {
        id: 1,
        empId: "EMP001",
        date: "2023-01-01",
        status: "WORKING",
        edit: true,
      };

      const mockMiscWork = { id: 1, name: "Setup" };

      // Create empty assigned job shifts
      const mockAssignedJobShifts = [];

      // Create a function to test handleDrop logic
      const testHandleDrop = (props) => {
        if (!mockRosterCell.edit) {
          return;
        }

        const { miscWork } = props;
        let message = "";

        if (mockAssignedJobShifts?.length) {
          const day = mockAssignedJobShifts.find(
            ({ date }) => date === mockRosterCell.date
          );

          if (day?.jobs?.length) {
            const job = day.jobs
              .filter(({ miscWorkId }) => miscWorkId)
              .find(({ miscWorkId }) => miscWorkId === miscWork.id);

            if (job?.shifts?.length) {
              message = `For planned days for the ${miscWork.name} job click the "+" button next to the shift for that specific day.`;
            }
          }
        }

        if (message) {
          setWarning(message);
        }

        if (onMiscShiftOpen && setMiscWork && !message) {
          setMiscWork(miscWork);
          setMiscWorkId(miscWork.id);
          setMiscWorkComment("");
          setMiscWorkStartTime("09:00:00");
          setMiscWorkEndTime("");
          setErr("");
          setErrors([]);
          setSelectedEmpIds(["EMP001"]);
          onMiscShiftOpen();
          onClose();
        }
      };
      testHandleDrop({ miscWork: mockMiscWork });
      expect(setWarning).not.toHaveBeenCalled();
      expect(setMiscWork).toHaveBeenCalledWith(mockMiscWork);
      expect(setMiscWorkId).toHaveBeenCalledWith(1);
      expect(setMiscWorkComment).toHaveBeenCalledWith("");
      expect(setMiscWorkStartTime).toHaveBeenCalledWith("09:00:00");
      expect(setMiscWorkEndTime).toHaveBeenCalledWith("");
      expect(setErr).toHaveBeenCalledWith("");
      expect(setErrors).toHaveBeenCalledWith([]);
      expect(setSelectedEmpIds).toHaveBeenCalledWith(["EMP001"]);
      expect(onMiscShiftOpen).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });

    test("shows warning modal when there are planned shifts", async () => {
      const mockRosterCell = {
        id: 1,
        empId: "EMP001",
        date: "2023-01-01",
        status: "WORKING",
        edit: true,
      };

      const mockMiscWork = { id: 1, name: "Setup" };
      const mockAssignedJobShifts = [
        {
          date: "2023-01-01",
          jobs: [
            {
              miscWorkId: 1,
              shifts: [{ startTime: "08:00", endTime: "09:00" }],
            },
          ],
        },
      ];

      const mockProps = {
        rosterCell: mockRosterCell,
        editable: true,
        empId: "EMP001",
        miscWorks: [mockMiscWork],
        assignedJobShifts: mockAssignedJobShifts,
      };
      render(
        <ChakraProvider>
          <div id="modal-root">
            <div data-testid="warning-modal" role="dialog">
              <div>Warning</div>
              <div data-testid="warning-message">
                For planned days for the Setup job click the "+" button next to
                the shift for that specific day.
              </div>
              <button>Close</button>
            </div>
          </div>
        </ChakraProvider>
      );
      const warningMsg = screen.getByTestId("warning-message");
      expect(warningMsg).toHaveTextContent(
        'For planned days for the Setup job click the "+" button next to the shift for that specific day.'
      );
    });
  });
  test("renders Secondary Jobs section in menu when rosterCell.others has data", async () => {
    const propsWithSecondary = {
      ...mockProps,
      rosterCell: {
        ...mockRosterCell,
        others: [
          { s: "18:00:00", e: "20:00:00", c: "Comment", type: "PLAYGROUND" },
        ],
      },
    };

    render(
      <TestWrapper>
        <EmployeeCell {...propsWithSecondary} />
      </TestWrapper>
    );
    expect(
      screen.getAllByTestId("other-shift-tag").length
    ).toBeGreaterThanOrEqual(1);
    const cellButton = screen.getByText("09:00 - 17:00").closest("button");
    fireEvent.click(cellButton);
    let menuList;
    await waitFor(() => {
      menuList = screen.getByRole("menu");
      expect(within(menuList).getByText("Secondary Jobs")).toBeInTheDocument();
    });
    const secondaryTagInMenu = within(menuList).getByTestId("other-shift-tag");
    expect(secondaryTagInMenu).toBeInTheDocument();
    expect(
      within(secondaryTagInMenu).getByText(/Playground/)
    ).toBeInTheDocument();
  });

  test("renders Miscellaneous Jobs section in menu when rosterCell.misc has data", async () => {
    const propsWithMisc = {
      ...mockProps,
      rosterCell: {
        ...mockRosterCell,
        misc: [{ s: "08:00:00", e: "08:30:00", c: "Prep", workId: 1 }],
      },
      miscWorks: [{ id: 1, name: "Setup" }],
    };

    render(
      <TestWrapper>
        <EmployeeCell {...propsWithMisc} />
      </TestWrapper>
    );

    expect(
      screen.getAllByTestId("other-shift-tag").length
    ).toBeGreaterThanOrEqual(1);

    const cellButton = screen.getByText("09:00 - 17:00").closest("button");
    fireEvent.click(cellButton);

    let menuList;
    await waitFor(() => {
      menuList = screen.getByRole("menu");
      expect(
        within(menuList).getByText("Miscellaneous Jobs")
      ).toBeInTheDocument();
    });
    const miscTagInMenu = within(menuList).getByTestId("other-shift-tag");
    expect(miscTagInMenu).toBeInTheDocument();
    expect(within(miscTagInMenu).getByText(/Setup/)).toBeInTheDocument();
  });
});
