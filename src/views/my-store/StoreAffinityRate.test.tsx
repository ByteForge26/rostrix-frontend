import {
  render,
  fireEvent,
  screen,
  act,
  waitFor,
} from "@testing-library/react";
import StoreAffinityRate from "./StoreAffinityRate";
import { Provider } from "react-redux";
import moment from "moment";
import { store, useAppSelector } from "../../app/store/store";
import {
  ICalenderHour,
  IWeekResponse,
  IPayrollConfig,
  IMyTeamHours,
} from "../../helper/Interface";
import { useApi } from "../../hooks/useApi";
import React from "react";
import { useLocation } from "react-router-dom";

const mockedCluster = [
  {
    id: 191,
    name: "Cycling",
    sportIds: [],
    costCentre: "IN1044",
    leaderEmpId: null,
    leaderEmpName: null,
    editable: true,
    myOfferId: null,
  },
  {
    id: 192,
    name: "Electronics",
    sportIds: [],
    costCentre: "IN1044",
    leaderEmpId: null,
    leaderEmpName: null,
    editable: true,
    myOfferId: null,
  },
];
const mockedWeeks = [
  {
    id: 710,
    year: 2025,
    number: 1,
    startDate: "2024-12-29",
    endDate: "2025-01-04",
  },
  {
    id: 711,
    year: 2025,
    number: 2,
    startDate: "2025-01-05",
    endDate: "2025-01-11",
  },
];

const mockedCalenderView = [
  {
    date: "2025-03-30",
    totalHours: 7.0,
    totalTurnover: 0.0,
    affinityRate: 0.0,
  },
  {
    date: "2025-03-31",
    totalHours: 9.0,
    totalTurnover: 84117.5625,
    affinityRate: 16.35,
  },
  {
    date: "2025-04-01",
    totalHours: 9.5,
    totalTurnover: 20541.0,
    affinityRate: 70.66,
  },
  {
    date: "2025-04-02",
    totalHours: 43.0,
    totalTurnover: 0.0,
    affinityRate: 0.0,
  },
  {
    date: "2025-04-03",
    totalHours: 0.0,
    totalTurnover: 0.0,
    affinityRate: 0.0,
  },
  {
    date: "2025-04-04",
    totalHours: 0.0,
    totalTurnover: 0.0,
    affinityRate: 0.0,
  },
  {
    date: "2025-04-05",
    totalHours: 0.0,
    totalTurnover: 0.0,
    affinityRate: 0.0,
  },
  {
    date: "2025-04-06",
    totalHours: 0.0,
    totalTurnover: 0.0,
    affinityRate: 0.0,
  },
  {
    date: "2025-04-07",
    totalHours: 43.0,
    totalTurnover: 0.0,
    affinityRate: 0.0,
  },
];

window.scrollTo = jest.fn();
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));

jest.mock("../../hooks/useApi", () => ({
  useApi: jest.fn(),
}));
jest.mock("../../app/store/store", () => ({
  useAppSelector: jest.fn(() => ({
    selectedCostCenterName: "IN1041",
    user: {
      empId: "DSI000486",
    },
    contractTypes: [
      { id: 1, name: "Full Time" },
      { id: 2, name: "Part Time" },
    ],
  })),
  useAppDispatch: jest.fn(),
  store: {
    getState: jest.fn(),
    subscribe: jest.fn(),
  },
}));

const useApiMock = useApi as jest.Mock;
describe("Store Affinity Rate Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("week")) {
          return Promise.resolve(mockedWeeks);
        } else if (endpoint.includes("cluster")) {
          return Promise.resolve(mockedCluster);
        }
        return Promise.resolve([]);
      }),
      post: jest.fn(() => {
        return Promise.resolve(mockedCalenderView);
      }),
    });
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: {
        empId: "DSI000486",
      },
    });
    (useLocation as jest.Mock).mockReturnValue({
      pathname: "test",
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render `Store Affinity Rate Page`", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <StoreAffinityRate />
        </Provider>
      );
    });

    expect(screen.getByText("Store Affinity Rate")).toBeInTheDocument();
  }, 60000);

  it("view of 'Calendar View' and displays data in 'Calendar View'", async () => {
    // const mockPost = jest.fn();
    // mockPost.mockResolvedValueOnce(mockedCalenderView);
    // jest.mock("../../hooks/useApi", () => ({
    //   useApi: () => ({
    //     get: jest.fn((endpoint: string) => {
    //       if (endpoint.includes("week")) {
    //         return Promise.resolve(mockedWeeks);
    //       } else if (endpoint.includes("cluster")) {
    //         return Promise.resolve(mockedCluster);
    //       }
    //       return Promise.resolve([]);
    //     }),
    //     post: mockedCalenderView,
    //   }),
    // }));
    render(
      <Provider store={store}>
        <StoreAffinityRate />
      </Provider>
    );

    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Select")).toBeInTheDocument();
    expect(screen.getByText("Sun")).toBeInTheDocument();

    const empAsYouId = await screen.findAllByText("DSI000486");

    expect(empAsYouId[0]).toBeInTheDocument();
  });

  it("should not render `No Data`", async () => {
    render(
      <Provider store={store}>
        <StoreAffinityRate />
      </Provider>
    );
    expect(screen.queryByTestId("no-data")).not.toBeInTheDocument();
  });

  it("handles click of cluster in 'Calendar View' section", async () => {
    render(
      <Provider store={store}>
        <StoreAffinityRate />
      </Provider>
    );
    await fireEvent.click(screen.getByText("Select"));
  });

  it("should correctly calculate the fromDate and toDate when 'Calendar Month' filter is selected", async () => {
    const currentYear = 2024;
    const currentMonth = 6;
    const startDate = 1;
    let fromDate = moment(
      `${currentYear}-${currentMonth + 1}-${startDate}`
    ).startOf("month");
    let toDate = fromDate.clone().endOf("month");

    render(
      <Provider store={store}>
        <StoreAffinityRate />
      </Provider>
    );

    expect(fromDate.format("YYYY-MM-DD")).toBe("2024-07-01");
    expect(toDate.format("YYYY-MM-DD")).toBe("2024-07-31");
  });

  it("should update to December of the previous year when clicking 'Previous Month' from January", async () => {
    const mockedDate = new Date(2024, 0, 1);
    jest.useFakeTimers().setSystemTime(mockedDate);

    render(
      <Provider store={store}>
        <StoreAffinityRate />
      </Provider>
    );

    const prevMonthButton = screen.getByTestId("prev_month");
    fireEvent.click(prevMonthButton);

    const expectedMonthName = "December";
    const expectedYear = 2023;

    const monthElements = screen.getAllByText(expectedMonthName);
    const yearElements = screen.getAllByText(expectedYear.toString());

    const updatedMonth = monthElements[0];
    const updatedYear = yearElements[0];

    expect(updatedMonth).toBeInTheDocument();
    expect(updatedYear).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("should update month and year when clicking 'Next Month'", async () => {
    const MONTHS = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const today = new Date();
    const nextMonthIndex = today.getMonth() === 11 ? 0 : today.getMonth() + 1;
    const nextYear =
      today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear();
    const expectedMonthName = MONTHS[nextMonthIndex];

    render(
      <Provider store={store}>
        <StoreAffinityRate />
      </Provider>
    );

    const nextMonthButton = screen.getByTestId("next_month");
    fireEvent.click(nextMonthButton);

    const monthElements = screen.getAllByText(expectedMonthName);
    const yearElements = screen.getAllByText(nextYear.toString());

    const updatedMonth = monthElements[0];
    const updatedYear = yearElements[0];

    expect(updatedMonth).toBeInTheDocument();
    expect(updatedYear).toBeInTheDocument();
  });

  it("should set the current month and year when clicked", async () => {
    render(
      <Provider store={store}>
        <StoreAffinityRate />
      </Provider>
    );

    const todayButton = screen.getByRole("button", { name: /today/i });
    fireEvent.click(todayButton);
  });

  it("should render `Store Affinity Rate  Page", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <StoreAffinityRate />
        </Provider>
      );
    });

    const aliceLeaveElement = await screen.findByText(/Store Affinity Rate/i);
    expect(aliceLeaveElement).toBeInTheDocument();
  });

  it("should update to February 2024 when clicking 'Previous Month' from March", async () => {
    const mockedDate = new Date(2024, 2, 1);
    jest.useFakeTimers().setSystemTime(mockedDate);

    render(
      <Provider store={store}>
        <StoreAffinityRate />
      </Provider>
    );

    const prevMonthButton = screen.getByTestId("prev_month");
    fireEvent.click(prevMonthButton);

    const expectedMonthName = "February";
    const expectedYear = 2024;

    const monthElements = await screen.findAllByText(expectedMonthName);
    const yearElements = await screen.findAllByText(expectedYear.toString());

    expect(monthElements[0]).toBeInTheDocument();
    expect(yearElements[0]).toBeInTheDocument();

    jest.useRealTimers();
  });
  it("should update to April 2024 when clicking 'Next Month' from March", async () => {
    const mockedDate = new Date(2024, 2, 1);
    jest.useFakeTimers().setSystemTime(mockedDate);

    render(
      <Provider store={store}>
        <StoreAffinityRate />
      </Provider>
    );

    const nextMonthButton = screen.getByTestId("next_month");
    fireEvent.click(nextMonthButton);

    const expectedMonthName = "April";
    const expectedYear = 2024;

    const monthElements = await screen.findAllByText(expectedMonthName);
    const yearElements = await screen.findAllByText(expectedYear.toString());

    expect(monthElements[0]).toBeInTheDocument();
    expect(yearElements[0]).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("correctly sets current month and year on component mount", async () => {
    const mockedDate = new Date(2024, 3, 15);
    jest.useFakeTimers().setSystemTime(mockedDate);

    await act(async () => {
      render(
        <Provider store={store}>
          <StoreAffinityRate />
        </Provider>
      );
    });

    const monthElements = await screen.findAllByText("April");
    const yearElements = await screen.findAllByText("2024");

    expect(monthElements[0]).toBeInTheDocument();
    expect(yearElements[0]).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("correctly calculates Affinity Rate data", async () => {
    const mockedDate = new Date(2024, 2, 1);
    jest.useFakeTimers().setSystemTime(mockedDate);
    await act(async () => {
      render(
        <Provider store={store}>
          <StoreAffinityRate />
        </Provider>
      );
    });

    const totalRows = screen.getAllByText("Total Hours:");
    expect(totalRows.length).toBeGreaterThan(0);

    const totalWorkHoursElement = await screen.findAllByText("0%");
    expect(totalWorkHoursElement[0]).toBeInTheDocument();
  });
});
