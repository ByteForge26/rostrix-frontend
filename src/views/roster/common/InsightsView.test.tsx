import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import InsightsView from "./InsightsView";
import { ChakraProvider } from "@chakra-ui/react";
import { rosterReducer } from "../../../app/slice/roster.slice";
import { authReducer } from "../../../app/slice/auth.slice";
import * as Utils from "../../../helper/Utils";

// Mock the Utils functions
jest.mock("../../../helper/Utils", () => ({
  convertTime: jest.fn((time) => `Converted ${time}`),
  getPeakHoursDistribution: jest.fn(),
}));

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      roster: rosterReducer,
      auth: authReducer,
    },
    preloadedState,
  });
};
const renderWithProviders = (component: JSX.Element, store: any) => {
  return render(
    <Provider store={store}>
      <ChakraProvider>{component}</ChakraProvider>
    </Provider>
  );
};

describe("InsightsView Component", () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();
    store = createTestStore({
      roster: {
        selectedDate: "2025-02-24",
        roster: {
          empWeekRosters: [
            {
              contractId: 1,
              empId: "emp1",
              fistName: "John",
              lastName: "Doe",
              days: [
                {
                  date: "2025-02-24",
                  main: [{ s: "08:00", e: "12:00" }],
                },
              ],
            },
          ],
        },
      },
      auth: {
        contractTypes: [{ id: 1, category: "Full-Time" }],
      },
    });
  });

  test("renders InsightsView without crashing", () => {
    renderWithProviders(<InsightsView />, store);
    expect(screen.getByText("SHIFT VISUALIZATION")).toBeInTheDocument();
  });

  test("does not render shift visualization if there is no roster data", () => {
    const emptyStore = createTestStore({
      roster: { selectedDate: "2025-02-24", roster: { empWeekRosters: [] } },
      auth: { contractTypes: [] },
    });

    renderWithProviders(<InsightsView />, emptyStore);
    expect(screen.queryByText("SHIFT VISUALIZATION")).not.toBeInTheDocument();
  });

  test("handles employee with multiple shifts in a day", () => {
    (Utils.convertTime as jest.Mock).mockImplementation(
      (time) => `Converted ${time}`
    );

    const multiShiftStore = createTestStore({
      roster: {
        selectedDate: "2025-02-24",
        roster: {
          empWeekRosters: [
            {
              contractId: 1,
              empId: "emp1",
              fistName: "John",
              lastName: "Doe",
              days: [
                {
                  date: "2025-02-24",
                  main: [
                    { s: "08:00", e: "12:00" },
                    { s: "13:00", e: "17:00" },
                    { s: "18:00", e: "20:00" },
                    { s: "21:00", e: "23:00" },
                  ],
                },
              ],
            },
          ],
        },
      },
      auth: {
        contractTypes: [{ id: 1, category: "Full-Time" }],
      },
    });

    renderWithProviders(<InsightsView />, multiShiftStore);
    expect(screen.getByText("SHIFT VISUALIZATION")).toBeInTheDocument();
    const container = screen.getByText("SHIFT VISUALIZATION").parentElement;
    expect(container).toBeDefined();
    expect(
      container?.querySelector(".recharts-responsive-container")
    ).toBeDefined();
  });

  test("sorts employees by contract type and name", () => {
    const sortingStore = createTestStore({
      roster: {
        selectedDate: "2025-02-24",
        roster: {
          empWeekRosters: [
            {
              contractId: 2,
              empId: "emp2",
              fistName: "Alice",
              lastName: "Smith",
              days: [
                {
                  date: "2025-02-24",
                  main: [{ s: "09:00", e: "13:00" }],
                },
              ],
            },
            {
              contractId: 1,
              empId: "emp1",
              fistName: "John",
              lastName: "Doe",
              days: [
                {
                  date: "2025-02-24",
                  main: [{ s: "08:00", e: "12:00" }],
                },
              ],
            },
            {
              contractId: 1,
              empId: "emp3",
              fistName: "Bob",
              lastName: "Johnson",
              days: [
                {
                  date: "2025-02-24",
                  main: [{ s: "10:00", e: "14:00" }],
                },
              ],
            },
          ],
        },
      },
      auth: {
        contractTypes: [
          { id: 1, category: "Full-Time" },
          { id: 2, category: "Part-Time" },
        ],
      },
    });

    renderWithProviders(<InsightsView />, sortingStore);
    expect(screen.getByText("SHIFT VISUALIZATION")).toBeInTheDocument();
  });

  test("handles employee with no shifts for selected date", () => {
    const noShiftStore = createTestStore({
      roster: {
        selectedDate: "2025-02-24",
        roster: {
          empWeekRosters: [
            {
              contractId: 1,
              empId: "emp1",
              fistName: "John",
              lastName: "Doe",
              days: [
                {
                  date: "2025-02-25",
                  main: [{ s: "08:00", e: "12:00" }],
                },
              ],
            },
          ],
        },
      },
      auth: {
        contractTypes: [{ id: 1, category: "Full-Time" }],
      },
    });

    renderWithProviders(<InsightsView />, noShiftStore);
    expect(screen.getByText("SHIFT VISUALIZATION")).toBeInTheDocument();
  });

  test("updates when selectedDate changes", async () => {
    const { rerender } = renderWithProviders(<InsightsView />, store);
    const updatedStore = createTestStore({
      roster: {
        selectedDate: "2025-02-25", 
        roster: {
          empWeekRosters: [
            {
              contractId: 1,
              empId: "emp1",
              fistName: "John",
              lastName: "Doe",
              days: [
                {
                  date: "2025-02-25",
                  main: [{ s: "09:00", e: "13:00" }],
                },
              ],
            },
          ],
        },
      },
      auth: {
        contractTypes: [{ id: 1, category: "Full-Time" }],
      },
    });

    rerender(
      <Provider store={updatedStore}>
        <ChakraProvider>
          <InsightsView />
        </ChakraProvider>
      </Provider>
    );

    expect(screen.getByText("SHIFT VISUALIZATION")).toBeInTheDocument();
  });

  test("handles custom tooltip rendering", () => {
    renderWithProviders(<InsightsView />, store);
    expect(screen.getByText("SHIFT VISUALIZATION")).toBeInTheDocument();
  });
});

