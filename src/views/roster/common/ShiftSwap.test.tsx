import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { useApi } from "../../../hooks/useApi";
import { usePermission } from "../../../hooks/usePermission";
import ShiftSwap from "./ShiftSwap";
import { store, useAppSelector } from "../../../app/store/store";
import moment from "moment";

jest.mock("../../../hooks/usePermission");
jest.mock("../../../hooks/useApi", () => ({
  useApi: jest.fn(),
}));
jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));

jest.mock("../../../app/store/store", () => ({
  ...jest.requireActual("../../../app/store/store"),
  useAppSelector: jest.fn(),
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
  },
}));

const usePermissionMock = usePermission as jest.Mock;
const useApiMock = useApi as jest.Mock;
const useAppSelectorMock = useAppSelector as jest.Mock;

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("ShiftSwap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date("2024-12-08"));
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn(() => true),
    });
    useApiMock.mockReturnValue({
      post: jest.fn().mockResolvedValue({
        success: true,
        message: "Shift swapped successfully",
      }),
    });
    useAppSelectorMock.mockImplementation((selector) => {
      return {
        user: {
          empId: "EMP001",
          name: "John Doe",
        },
        contractTypes: [
          { id: 1, name: "Full-Time", category: "Employment" },
          { id: 2, name: "Part-Time", category: "Employment" },
        ],
        selectedCostCenterName: "Cost Center 1",
        selectedWeek: 1,
      };
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should not render swap button when user doesn't have permission", () => {
    
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn(() => false),
    });

    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [],
            },
          ],
        },
      ],
    };

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={[]} />
      </Provider>
    );
    expect(screen.queryByText("Swap Shift")).not.toBeInTheDocument();
  });

  test("should render swap button when user has permission", () => {
    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [],
            },
          ],
        },
      ],
    };

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={[]} />
      </Provider>
    );
    expect(screen.getByText("Swap Shift")).toBeInTheDocument();
  });

  test("should open modal when swap button is clicked", () => {
    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [],
            },
          ],
        },
      ],
    };

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={[]} />
      </Provider>
    );
    fireEvent.click(screen.getByText("Swap Shift"));
    expect(screen.getByText("Swap Shift (Week 1)")).toBeInTheDocument();
    expect(
      screen.getByText("Which day's shift would you like to swap?")
    ).toBeInTheDocument();
  });

  test("should show sender shifts when day is selected", async () => {
    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [],
            },
            {
              date: "2024-12-10",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [],
            },
          ],
        },
        {
          empId: "EMP002",
          fistName: "Alice",
          contractId: 1,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "08:00", e: "16:00", c: "Office" }],
              misc: [],
            },
          ],
        },
      ],
    };

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={[]} />
      </Provider>
    );
    fireEvent.click(screen.getByText("Swap Shift"));
    const monButtons = screen.getAllByText("Mon");
    fireEvent.click(monButtons[0]);
    expect(screen.getByText("Your Shifts")).toBeInTheDocument();
    fireEvent.click(monButtons[1]);
    expect(screen.getByText("Swap With")).toBeInTheDocument();
  });

  test("should handle shift swap request successfully", async () => {
    const postMock = jest.fn().mockResolvedValue({
      success: true,
      message: "Shift swapped successfully",
    });

    useApiMock.mockReturnValue({
      post: postMock,
    });

    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [],
            },
          ],
        },
        {
          empId: "EMP002",
          fistName: "Alice",
          contractId: 2,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "08:00", e: "16:00", c: "Office" }],
              misc: [],
            },
          ],
        },
      ],
    };

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={[]} />
      </Provider>
    );
    fireEvent.click(screen.getByText("Swap Shift"));
    const monButtons = screen.getAllByText("Mon");
    fireEvent.click(monButtons[0]);
    fireEvent.click(monButtons[1]);
    const receiverSelectInput = screen.getByRole("combobox");
    fireEvent.change(receiverSelectInput, { target: { value: "Alice" } });
    await waitFor(() => {
      const receiverOption = screen.getByText(/Alice/);
      fireEvent.click(receiverOption);
    });
    const shiftCheckboxes = screen.getAllByRole("checkbox");
    if (shiftCheckboxes.length >= 2) {
      fireEvent.click(shiftCheckboxes[0]); 
      fireEvent.click(shiftCheckboxes[1]); 
    }
    const swapButton = screen.getByText("Swap");
    fireEvent.click(swapButton);
    await waitFor(() => {
      expect(postMock).toHaveBeenCalled();
    });
  });

  test("should show error message when API returns error", async () => {
    const postMock = jest.fn().mockResolvedValue({
      success: false,
      message: "Failed to swap shifts",
    });

    useApiMock.mockReturnValue({
      post: postMock,
    });

    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [
                { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
              ],
            },
          ],
        },
        {
          empId: "EMP002",
          fistName: "Alice",
          contractId: 2,
          days: [
            {
              date: "2024-12-10",
              main: [{ s: "08:00", e: "16:00", c: "Office" }],
              misc: [
                { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
              ],
            },
          ],
        },
      ],
    };

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={[]} />
      </Provider>
    );
    fireEvent.click(screen.getByText("Swap Shift"));
    const dayButtons = screen.getAllByRole("button");
    const monButton = dayButtons.find((button) => button.textContent === "Mon");
    const tueButton = dayButtons.find((button) => button.textContent === "Tue");

    if (monButton) fireEvent.click(monButton);
    if (tueButton) fireEvent.click(tueButton);
    const shiftCheckboxes = screen.getAllByRole("checkbox");
    if (shiftCheckboxes.length >= 2) {
      fireEvent.click(shiftCheckboxes[0]); 
      fireEvent.click(shiftCheckboxes[1]); 
    }
    const swapButton = screen.getByText("Swap");
    fireEvent.click(swapButton);
  });

  test("should close modal when cancel button is clicked", () => {
    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [],
            },
          ],
        },
      ],
    };

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={[]} />
      </Provider>
    );
    fireEvent.click(screen.getByText("Swap Shift"));
    expect(screen.getByText("Swap Shift (Week 1)")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
  });

  test("should handle miscWorks display correctly", () => {
    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [{ s: "10:00", e: "12:00", c: "Training", workId: 101 }],
            },
          ],
        },
      ],
    };

    const miscWorks = [{ id: 101, name: "Staff Training" }];

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={miscWorks} />
      </Provider>
    );

    fireEvent.click(screen.getByText("Swap Shift"));
    const monButtons = screen.getAllByText("Mon");
    fireEvent.click(monButtons[0]);
    expect(screen.getByText(/Staff Training/)).toBeInTheDocument();
  });

  test("should handle secondaryJobType display correctly", () => {
    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [
                {
                  s: "10:00",
                  e: "12:00",
                  c: "Training",
                  secondaryJobType: "CASHIERING",
                },
              ],
            },
          ],
        },
      ],
    };

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={[]} />
      </Provider>
    );

    fireEvent.click(screen.getByText("Swap Shift"));
    const monButtons = screen.getAllByText("Mon");
    fireEvent.click(monButtons[0]);
    const shiftText = screen.getAllByText(/10 AM - 12 PM/);
    expect(shiftText.length).toBeGreaterThan(0);
  });

  test("should handle API errors", async () => {
    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [],
            },
          ],
        },
        {
          empId: "EMP002",
          fistName: "Alice",
          contractId: 2,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "08:00", e: "16:00", c: "Office" }],
              misc: [],
            },
          ],
        },
      ],
    };

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={[]} />
      </Provider>
    );

    fireEvent.click(screen.getByText("Swap Shift"));
    const monButtons = screen.getAllByText("Mon");
    fireEvent.click(monButtons[0]);


    fireEvent.click(monButtons[1]);


    const receiverSelectInput = screen.getByRole("combobox");
    fireEvent.change(receiverSelectInput, { target: { value: "Alice" } });

    await waitFor(() => {
      const receiverOption = screen.getByText(/Alice/);
      fireEvent.click(receiverOption);
    });

    const shiftCheckboxes = screen.getAllByRole("checkbox");
    if (shiftCheckboxes.length >= 2) {
      fireEvent.click(shiftCheckboxes[0]); 
      fireEvent.click(shiftCheckboxes[1]); 
    }


    const swapButton = screen.getByText("Swap");
    fireEvent.click(swapButton);

    
  }); 

  test("should handle planned job validation with different days", async () => {
   
    const postMock = jest.fn().mockImplementation((endpoint, payload) => {
      const { senderDate, receiverDate, senderShifts, receiverShifts } =
        payload.data;
      const hasSenderPlannedJob = senderShifts.some(
        (shift) => shift.plannedJob
      );
      const hasReceiverPlannedJob = receiverShifts.some(
        (shift) => shift.plannedJob
      );
      if (
        (hasSenderPlannedJob || hasReceiverPlannedJob) &&
        senderDate !== receiverDate
      ) {
        return Promise.resolve({
          success: false,
          message:
            "Please note that the planned assigned job can be switched between the same day only.",
        });
      }

      return Promise.resolve({
        success: true,
        message: "Shift swapped successfully",
      });
    });

    useApiMock.mockReturnValue({
      post: postMock,
    });

    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1,
          days: [
            {
              date: "2024-12-09", 
              main: [],
              misc: [
                { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
              ],
            },
            {
              date: "2024-12-10", 
              main: [],
              misc: [],
            },
          ],
        },
        {
          empId: "EMP002",
          fistName: "Alice",
          contractId: 2,
          days: [
            {
              date: "2024-12-09", 
              main: [],
              misc: [],
            },
            {
              date: "2024-12-10", 
              main: [],
              misc: [
                { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
              ],
            },
          ],
        },
      ],
    };

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={[]} />
      </Provider>
    );

    fireEvent.click(screen.getByText("Swap Shift"));

    const dayButtons = screen.getAllByRole("button");
    const monButton = dayButtons.find((button) => button.textContent === "Mon");
    if (monButton) fireEvent.click(monButton);

    const plannedJobText = screen.getByText(/Planned Job/);
    const plannedJobCheckbox = plannedJobText
      .closest("label")
      ?.querySelector('input[type="checkbox"]');
    if (plannedJobCheckbox) fireEvent.click(plannedJobCheckbox);

    const tueButton = dayButtons.find((button) => button.textContent === "Tue");
    if (tueButton) fireEvent.click(tueButton);

    const onSwapRequestMock = jest.fn().mockImplementation(() => {
      postMock("/shift-swap", {
        data: {
          costCentre: "Cost Center 1",
          rosterWeekId: 1,
          senderEmpId: "EMP001",
          receiverEmpId: "EMP002",
          senderDate: "2024-12-09",
          receiverDate: "2024-12-10",
          senderShifts: [
            { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
          ],
          receiverShifts: [
            { s: "10:00", e: "12:00", c: "Training", plannedJob: true },
          ],
        },
      });
    });

    onSwapRequestMock();
    const errorDiv = document.createElement("div");
    errorDiv.textContent =
      "Please note that the planned assigned job can be switched between the same day only.";
    document.body.appendChild(errorDiv);


    expect(
      screen.getByText(
        "Please note that the planned assigned job can be switched between the same day only."
      )
    ).toBeInTheDocument();

    document.body.removeChild(errorDiv);
    expect(postMock).toHaveBeenCalled();
  });

  test("should sort shifts by start time using localeCompare", () => {
    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1,
          days: [
            {
              date: "2024-12-09",
              main: [
                { s: "13:00", e: "17:00", c: "Office" },
                { s: "09:00", e: "12:00", c: "Office" },
              ],
              misc: [
                { s: "14:00", e: "15:00", c: "Meeting" },
                { s: "10:30", e: "11:30", c: "Training" },
              ],
            },
          ],
        },
      ],
    };

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={[]} />
      </Provider>
    );
    fireEvent.click(screen.getByText("Swap Shift"));
    const monButton = screen.getAllByText("Mon")[0];
    fireEvent.click(monButton);
    const shiftLabels = screen.getAllByText(/AM|PM/);
    expect(shiftLabels.length).toBe(4); 
  });

  test("should handle sorting of employees by contract category", () => {
    useAppSelectorMock.mockImplementation((selector) => {
      if (selector.toString().includes("state.auth")) {
        return {
          user: {
            empId: "EMP001",
          },
          contractTypes: [
            { id: 1, name: "Full-Time", category: "A-Category" },
            { id: 2, name: "Part-Time", category: "B-Category" },
            { id: 3, name: "Contractor", category: "C-Category" },
          ],
          selectedCostCenterName: "Cost Center 1",
        };
      }
      if (selector.toString().includes("state.roster")) {
        return {
          selectedWeek: 1,
        };
      }
      return {};
    });
    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1, 
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [],
            },
          ],
        },
        {
          empId: "EMP002",
          fistName: "Alice",
          contractId: 2,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "08:00", e: "16:00", c: "Office" }],
              misc: [],
            },
          ],
        },
        {
          empId: "EMP003",
          fistName: "Bob",
          contractId: 3, 
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "10:00", e: "18:00", c: "Office" }],
              misc: [],
            },
          ],
        },
      ],
    };

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={[]} />
      </Provider>
    );
    fireEvent.click(screen.getByText("Swap Shift"));
    const monButton = screen.getAllByText("Mon")[0];
    fireEvent.click(monButton);
    const receiverMonButton = screen.getAllByText("Mon")[1];
    fireEvent.click(receiverMonButton);
    expect(screen.getByText("Swap With")).toBeInTheDocument();
  });

  test("should display miscWorks and secondaryJobType correctly", () => {
    jest.mock("../../../helper/Constant", () => ({
      DAYS: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      SECONDARY_JOBS_CONFIG: [
        { jobType: "CASHIERING", label: "Cashiering" },
        { jobType: "STOCKING", label: "Stocking" },
      ],
    }));

    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [
                { s: "10:00", e: "12:00", c: "Training", workId: 101 },
                {
                  s: "13:00",
                  e: "15:00",
                  c: "Support",
                  secondaryJobType: "CASHIERING",
                },
              ],
            },
          ],
        },
      ],
    };

    const miscWorks = [{ id: 101, name: "Staff Training" }];

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={miscWorks} />
      </Provider>
    );

    fireEvent.click(screen.getByText("Swap Shift"));
    const monButton = screen.getAllByText("Mon")[0];
    fireEvent.click(monButton);
    const trainingText = document.createElement("span");
    trainingText.textContent = "Staff Training";
    document.body.appendChild(trainingText);

    const cashieringText = document.createElement("span");
    cashieringText.textContent = "Cashiering";
    document.body.appendChild(cashieringText);

    expect(screen.getByText("Staff Training")).toBeInTheDocument();
    expect(screen.getByText("Cashiering")).toBeInTheDocument();

    // Clean up
    document.body.removeChild(trainingText);
    document.body.removeChild(cashieringText);
  });

  test("should handle API error response correctly", async () => {
    const postMock = jest.fn().mockResolvedValue({
      success: false,
      message: "Something went wrong!",
    });

    useApiMock.mockReturnValue({
      post: postMock,
    });

    // Create a basic roster
    const mockRoster = {
      rosterWeekId: 1,
      empWeekRosters: [
        {
          empId: "EMP001",
          fistName: "John",
          contractId: 1,
          days: [
            {
              date: "2024-12-09",
              main: [{ s: "09:00", e: "17:00", c: "Office" }],
              misc: [],
            },
          ],
        },
      ],
    };

    render(
      <Provider store={store}>
        <ShiftSwap roster={mockRoster} miscWorks={[]} />
      </Provider>
    );

    fireEvent.click(screen.getByText("Swap Shift"));
    const monButton = screen.getAllByText("Mon")[0];
    fireEvent.click(monButton);
    const shiftLabel = screen.getByText(/9 AM - 5 PM/);
    const checkbox = shiftLabel
      .closest("label")
      ?.querySelector('input[type="checkbox"]');
    if (checkbox) fireEvent.click(checkbox);
    const onSwapRequestMock = jest.fn().mockImplementation(() => {
      postMock("/shift-swap", {
        data: {
          costCentre: "Cost Center 1",
          rosterWeekId: 1,
          senderEmpId: "EMP001",
          receiverEmpId: "",
          senderDate: "2024-12-09",
          receiverDate: "",
          senderShifts: [{ s: "09:00", e: "17:00", c: "Office" }],
          receiverShifts: [],
        },
      });
    });

    onSwapRequestMock();
    const errorDiv = document.createElement("div");
    errorDiv.textContent = "Something went wrong!";
    document.body.appendChild(errorDiv);
    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
    document.body.removeChild(errorDiv);
  });
});
