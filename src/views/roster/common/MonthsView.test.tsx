import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import MonthsView from "./MonthsView";
import { ChakraProvider } from "@chakra-ui/react";
import { rosterReducer } from "../../../app/slice/roster.slice";
import { authReducer } from "../../../app/slice/auth.slice";

const mockAddToast = jest.fn();
jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: mockAddToast,
  }),
}));
jest.mock("../../../helper/Constant", () => ({
  ROSTER_STATUS: [
    {
      status: "approved",
      background: "green",
      color: "white",
      name: "Approved",
    },
    {
      status: "pending",
      background: "yellow",
      color: "black",
      name: "Pending",
    },
  ],
  MONTHS_SHORT: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
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

describe("MonthsView Component", () => {
  let store: any;

  beforeEach(() => {
    store = createTestStore({
      roster: {
        selectedYear: 2023,
        selectedMonth: 5,
      },
      auth: {},
    });
  });

  const mockMonthSummary: IMonthSummary[] = [
    {
      month: 5,
      weekList: [
        {
          status: "approved",
          startDate: "2023-05-01",
          endDate: "2023-05-07",
          week: 1,
        },
        {
          status: "pending",
          startDate: "2023-05-08",
          endDate: "2023-05-14",
          week: 2,
        },
      ],
    },
    {
      month: 6, // June
      weekList: [
        {
          status: "approved",
          startDate: "2023-06-01",
          endDate: "2023-06-07",
          week: 1,
        },
      ],
    },
  ];

  const mockProps: IProps = {
    onChangeYear: jest.fn(),
    onChangeMonth: jest.fn(),
    monthSummary: mockMonthSummary,
  };

  test("renders MonthsView without crashing", () => {
    renderWithProviders(<MonthsView {...mockProps} />, store);
    expect(screen.getByText("2023")).toBeInTheDocument();
    expect(screen.getByText("Jun")).toBeInTheDocument();
  });

  test("calls onChangeYear when a year is selected from the dropdown", () => {
    renderWithProviders(<MonthsView {...mockProps} />, store);
    const yearDropdown = screen.getByText("2023");
    yearDropdown.click();
    const yearOption = screen.getByText("2026");
    yearOption.click();
    expect(mockProps.onChangeYear).toHaveBeenCalledWith(2026);
  });
});
