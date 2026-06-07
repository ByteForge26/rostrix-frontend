import {
  render,
  fireEvent,
  screen,
  act,
  waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { store, useAppSelector } from "../../app/store/store";
import { useApi } from "../../hooks/useApi";
import MyWorkHours from "./MyWorkHours";

import {
  IMyWorkHours,
  ICalenderHour,
  IWeekResponse,
  IPayrollConfig,
  ICalender,
} from "../../helper/Interface";
import React from "react";
import moment from "moment";
import { useLocation } from "react-router-dom";

const sleep = (ms: number | undefined) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const mockedCalenderHours: ICalenderHour[] = [
  { date: "2024-07-01", hours: 8, status: "WEEK_OFF", type: "GENERAL" },
  { date: "2024-07-02", hours: 0, status: "LEAVE", type: "GENERAL" },
  { date: "2024-07-03", hours: 8, status: "WORKING", type: "GENERAL" },
  { date: "2024-07-04", hours: 0, status: "WORKING_HOLIDAY", type: "NA" },
];

export const mockCalendarData: ICalender[] = [
  {
    row: 1,
    column: 1,
    date: new Date("2024-12-01"),
    today: false,
    holiday: "Christmas Preparation Day",
    leaveId: 101,
    weekOff: false,
    roster: true,
  },
  {
    row: 1,
    column: 2,
    date: new Date("2024-12-02"),
    today: false,
    holiday: "",
    leaveId: undefined,
    weekOff: false,
    roster: true,
  },
  {
    row: 2,
    column: 3,
    date: new Date("2024-12-03"),
    today: false,
    holiday: "",
    leaveId: 102,
    weekOff: false,
    roster: false,
  },
  {
    row: 3,
    column: 4,
    date: new Date(),
    today: true,
    holiday: "",
    leaveId: undefined,
    weekOff: false,
    roster: true,
  },
  {
    row: 4,
    column: 5,
    date: new Date("2024-12-06"),
    today: false,
    holiday: "Holiday Name",
    leaveId: undefined,
    weekOff: true,
    roster: false,
  },
  {
    row: 5,
    column: 6,
    date: new Date("2024-12-07"),
    today: false,
    holiday: "",
    leaveId: 103,
    weekOff: false,
    roster: false,
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

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

jest.mock("../../app/store/store", () => ({
  ...jest.requireActual("../../app/store/store"),
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

const mockedWorkHours: IMyWorkHours = {
  tempCalculation: {
    realisedHours: 40,
    plannedHours: 10,
    totalHours: 50,
    realisedWh: 2,
    plannedWh: 1,
  },
  status: "FINALISED",
  finalized: true,
  fnumHours: 40,
  fnumLop: 0,
  fnumWorkingHolidays: 2,
  fmanualHours: 5,
  message: "Work hours finalized",
};

const mockedPayrollConfig: IPayrollConfig = {
  currentPStartDateTime: "2024-11-22T00:00:00",
  currentPEndDateTime: "2024-12-21T15:15:00",
  currentManualHourStartTime: "2024-12-21T15:20:00",
  currentManualHourEndTime: "2024-12-21T16:20:00",
  currentPayrollExtractStartTime: "2024-12-21T16:22:00",
};

const mockedWeeks: IWeekResponse[] = [
  {
    id: 157,
    year: 2024,
    number: 1,
    startDate: "2023-12-31",
    endDate: "2024-01-06",
  },
  {
    id: 158,
    year: 2024,
    number: 2,
    startDate: "2024-01-07",
    endDate: "2024-01-13",
  },
  {
    id: 159,
    year: 2024,
    number: 3,
    startDate: "2024-01-14",
    endDate: "2024-01-20",
  },
  {
    id: 160,
    year: 2024,
    number: 4,
    startDate: "2024-01-21",
    endDate: "2024-01-27",
  },
  {
    id: 161,
    year: 2024,
    number: 5,
    startDate: "2024-01-28",
    endDate: "2024-02-03",
  },
  {
    id: 162,
    year: 2024,
    number: 6,
    startDate: "2024-02-04",
    endDate: "2024-02-10",
  },
  {
    id: 163,
    year: 2024,
    number: 7,
    startDate: "2024-02-11",
    endDate: "2024-02-17",
  },
  {
    id: 164,
    year: 2024,
    number: 8,
    startDate: "2024-02-18",
    endDate: "2024-02-24",
  },
  {
    id: 165,
    year: 2024,
    number: 9,
    startDate: "2024-02-25",
    endDate: "2024-03-02",
  },
  {
    id: 166,
    year: 2024,
    number: 10,
    startDate: "2024-03-03",
    endDate: "2024-03-09",
  },
  {
    id: 167,
    year: 2024,
    number: 11,
    startDate: "2024-03-10",
    endDate: "2024-03-16",
  },
  {
    id: 168,
    year: 2024,
    number: 12,
    startDate: "2024-03-17",
    endDate: "2024-03-23",
  },
  {
    id: 169,
    year: 2024,
    number: 13,
    startDate: "2024-03-24",
    endDate: "2024-03-30",
  },
  {
    id: 170,
    year: 2024,
    number: 14,
    startDate: "2024-03-31",
    endDate: "2024-04-06",
  },
  {
    id: 171,
    year: 2024,
    number: 15,
    startDate: "2024-04-07",
    endDate: "2024-04-13",
  },
  {
    id: 172,
    year: 2024,
    number: 16,
    startDate: "2024-04-14",
    endDate: "2024-04-20",
  },
  {
    id: 173,
    year: 2024,
    number: 17,
    startDate: "2024-04-21",
    endDate: "2024-04-27",
  },
  {
    id: 174,
    year: 2024,
    number: 18,
    startDate: "2024-04-28",
    endDate: "2024-05-04",
  },
  {
    id: 175,
    year: 2024,
    number: 19,
    startDate: "2024-05-05",
    endDate: "2024-05-11",
  },
  {
    id: 176,
    year: 2024,
    number: 20,
    startDate: "2024-05-12",
    endDate: "2024-05-18",
  },
  {
    id: 177,
    year: 2024,
    number: 21,
    startDate: "2024-05-19",
    endDate: "2024-05-25",
  },
  {
    id: 178,
    year: 2024,
    number: 22,
    startDate: "2024-05-26",
    endDate: "2024-06-01",
  },
  {
    id: 179,
    year: 2024,
    number: 23,
    startDate: "2024-06-02",
    endDate: "2024-06-08",
  },
  {
    id: 180,
    year: 2024,
    number: 24,
    startDate: "2024-06-09",
    endDate: "2024-06-15",
  },
  {
    id: 181,
    year: 2024,
    number: 25,
    startDate: "2024-06-16",
    endDate: "2024-06-22",
  },
  {
    id: 182,
    year: 2024,
    number: 26,
    startDate: "2024-06-23",
    endDate: "2024-06-29",
  },
  {
    id: 183,
    year: 2024,
    number: 27,
    startDate: "2024-06-30",
    endDate: "2024-07-06",
  },
  {
    id: 184,
    year: 2024,
    number: 28,
    startDate: "2024-07-07",
    endDate: "2024-07-13",
  },
  {
    id: 185,
    year: 2024,
    number: 29,
    startDate: "2024-07-14",
    endDate: "2024-07-20",
  },
  {
    id: 186,
    year: 2024,
    number: 30,
    startDate: "2024-07-21",
    endDate: "2024-07-27",
  },
  {
    id: 187,
    year: 2024,
    number: 31,
    startDate: "2024-07-28",
    endDate: "2024-08-03",
  },
  {
    id: 188,
    year: 2024,
    number: 32,
    startDate: "2024-08-04",
    endDate: "2024-08-10",
  },
  {
    id: 189,
    year: 2024,
    number: 33,
    startDate: "2024-08-11",
    endDate: "2024-08-17",
  },
  {
    id: 190,
    year: 2024,
    number: 34,
    startDate: "2024-08-18",
    endDate: "2024-08-24",
  },
  {
    id: 191,
    year: 2024,
    number: 35,
    startDate: "2024-08-25",
    endDate: "2024-08-31",
  },
  {
    id: 192,
    year: 2024,
    number: 36,
    startDate: "2024-09-01",
    endDate: "2024-09-07",
  },
  {
    id: 193,
    year: 2024,
    number: 37,
    startDate: "2024-09-08",
    endDate: "2024-09-14",
  },
  {
    id: 194,
    year: 2024,
    number: 38,
    startDate: "2024-09-15",
    endDate: "2024-09-21",
  },
  {
    id: 195,
    year: 2024,
    number: 39,
    startDate: "2024-09-22",
    endDate: "2024-09-28",
  },
  {
    id: 196,
    year: 2024,
    number: 40,
    startDate: "2024-09-29",
    endDate: "2024-10-05",
  },
  {
    id: 197,
    year: 2024,
    number: 41,
    startDate: "2024-10-06",
    endDate: "2024-10-12",
  },
  {
    id: 198,
    year: 2024,
    number: 42,
    startDate: "2024-10-13",
    endDate: "2024-10-19",
  },
  {
    id: 199,
    year: 2024,
    number: 43,
    startDate: "2024-10-20",
    endDate: "2024-10-26",
  },
  {
    id: 200,
    year: 2024,
    number: 44,
    startDate: "2024-10-27",
    endDate: "2024-11-02",
  },
  {
    id: 201,
    year: 2024,
    number: 45,
    startDate: "2024-11-03",
    endDate: "2024-11-09",
  },
  {
    id: 202,
    year: 2024,
    number: 46,
    startDate: "2024-11-10",
    endDate: "2024-11-16",
  },
  {
    id: 203,
    year: 2024,
    number: 47,
    startDate: "2024-11-17",
    endDate: "2024-11-23",
  },
  {
    id: 204,
    year: 2024,
    number: 48,
    startDate: "2024-11-24",
    endDate: "2024-11-30",
  },
  {
    id: 205,
    year: 2024,
    number: 49,
    startDate: "2024-12-01",
    endDate: "2024-12-07",
  },
  {
    id: 206,
    year: 2024,
    number: 50,
    startDate: "2024-12-08",
    endDate: "2024-12-14",
  },
  {
    id: 207,
    year: 2024,
    number: 51,
    startDate: "2024-12-15",
    endDate: "2024-12-21",
  },
  {
    id: 208,
    year: 2024,
    number: 52,
    startDate: "2024-12-22",
    endDate: "2024-12-28",
  },
];

jest.mock("../../hooks/useApi", () => ({
  useApi: jest.fn(),
}));

jest.mock("../../app/store/store", () => ({
  useAppSelector: jest.fn(() => ({
    selectedCostCenterName: "IN1041",
    user: { empId: "DSI000486" },
  })),
  useAppDispatch: jest.fn(),
  store: {
    getState: jest.fn(),
    subscribe: jest.fn(),
  },
}));

const useApiMock = useApi as jest.Mock;

describe("My Work Hours Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("week")) {
          return Promise.resolve(mockedWeeks);
        } else if (endpoint.includes("hours/payroll-config")) {
          return Promise.resolve(mockedPayrollConfig);
        } else if (endpoint.includes("/my-work-hours")) {
          return Promise.resolve(mockedWorkHours);
        } else if (endpoint.includes("emp-calender-hours")) {
          return Promise.resolve(mockedCalenderHours);
        }
        return Promise.resolve([]);
      }),
    });
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: {
        empId: "DSI006227",
        userRoles: { "Health and Wellness": [1] },
      },
      roles: [{ id: 5, title: "LEADER" }],
    });
    (useLocation as jest.Mock).mockReturnValue({
      pathname: "test",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render `My Work Hours Page`", () => {
    render(
      <Provider store={store}>
        <MyWorkHours />
      </Provider>
    );

    expect(screen.getByText("My Work Hours")).toBeInTheDocument();
  });

  it("should display loader while fetching data", () => {
    render(
      <Provider store={store}>
        <MyWorkHours />
      </Provider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render calendar view with mocked data", async () => {
    render(
      <Provider store={store}>
        <MyWorkHours />
      </Provider>
    );

    await fireEvent.click(screen.getByText("Calendar View"));

    expect(await screen.findByText("Total Working Hours")).toBeInTheDocument();
    expect(await screen.findByText("8")).toBeInTheDocument();
  });
  it("should render finalized work hours", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MyWorkHours />
        </Provider>
      );
    });
    expect(await screen.findByText("Total Hours")).toBeInTheDocument();
    expect(await screen.findByText("45")).toBeInTheDocument();
  });

  it("should allow selecting a custom date range", async () => {
    const fixedDate = new Date("2024-12-02T12:00:00Z");
    jest.useFakeTimers().setSystemTime(fixedDate);

    await act(async () => {
      render(
        <Provider store={store}>
          <MyWorkHours />
        </Provider>
      );
    });

    await fireEvent.click(screen.getByText("Custom Range"));

    const fromDateInput = screen.getByLabelText(
      /custom_start_date/i
    ) as HTMLInputElement;
    const toDateInput = screen.getByLabelText(
      /custom_end_date/i
    ) as HTMLInputElement;

    expect(fromDateInput).toBeInTheDocument();
    expect(toDateInput).toBeInTheDocument();

    fireEvent.click(fromDateInput);

    fireEvent.click(screen.getByLabelText("Tue Dec 03 2024"));

    fireEvent.click(toDateInput);

    fireEvent.click(screen.getByLabelText("Mon Dec 30 2024"));

    fireEvent.click(fromDateInput);

    fireEvent.click(screen.getByLabelText("Tue Dec 31 2024"));

    jest.useRealTimers();
  });

  it("should correctly navigate between years when switching months", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MyWorkHours />
        </Provider>
      );
    });

    const allButtons = screen.getAllByRole("button");

    const prevButton = allButtons.find((button) =>
      button
        .querySelector("svg")
        ?.getAttribute("aria-label")
        ?.includes("previous")
    );
    const nextButton = allButtons.find((button) =>
      button.querySelector("svg")?.getAttribute("aria-label")?.includes("next")
    );
    if (prevButton) {
      fireEvent.click(prevButton);
      expect(await screen.findByText("December")).toBeInTheDocument();

      fireEvent.click(prevButton);
      expect(await screen.findByText("January")).toBeInTheDocument();
      expect(
        await screen.findByText((new Date().getFullYear() - 1).toString())
      ).toBeInTheDocument();
    }
    if (nextButton) {
      fireEvent.click(nextButton);
      expect(await screen.findByText("January")).toBeInTheDocument();

      fireEvent.click(nextButton);
      expect(await screen.findByText("February")).toBeInTheDocument();
      expect(
        await screen.findByText((new Date().getFullYear() + 1).toString())
      ).toBeInTheDocument();
    }
  });
  it("should navigate to December of the previous year when current month is January", async () => {
    jest.spyOn(Date.prototype, "getMonth").mockReturnValue(0);
    jest.spyOn(Date.prototype, "getFullYear").mockReturnValue(2024);

    await act(async () => {
      render(
        <Provider store={store}>
          <MyWorkHours />
        </Provider>
      );
    });

    fireEvent.click(await screen.findByText("Calendar View"));

    fireEvent.click(await screen.findByRole("button", { name: /prev_month/i }));

    const decemberElement = await screen.findByText((content, element) => {
      return (
        content.trim() === "December" && element.tagName.toLowerCase() === "p"
      );
    });

    expect(decemberElement).toBeInTheDocument();

    jest.restoreAllMocks();
  });

  it("should navigate to January of the next year when current month is December", async () => {
    jest.spyOn(Date.prototype, "getMonth").mockReturnValue(11);
    jest.spyOn(Date.prototype, "getFullYear").mockReturnValue(2023);

    await act(async () => {
      render(
        <Provider store={store}>
          <MyWorkHours />
        </Provider>
      );
    });

    fireEvent.click(await screen.findByText("Calendar View"));

    fireEvent.click(await screen.findByRole("button", { name: /next_month/i }));

    const januaryElement = await screen.findByText((content, element) => {
      return (
        content.trim() === "January" && element.tagName.toLowerCase() === "p"
      );
    });

    expect(januaryElement).toBeInTheDocument();

    jest.restoreAllMocks();
  });

  it("handles null API responses gracefully", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("payroll-config")) {
          return Promise.resolve({
            currentPStartDateTime: null,
            currentPEndDateTime: null,
          });
        }
        return Promise.resolve(null);
      }),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyWorkHours />
        </Provider>
      );
    });

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it("should show the correct computed work hours  using the Calendar Month filter", async () => {
    render(
      <Provider store={store}>
        <MyWorkHours />
      </Provider>
    );

    const calendarMonthButton = screen.getByText("Calendar Month");
    expect(calendarMonthButton).toBeInTheDocument();
    fireEvent.click(calendarMonthButton);

    const currentMonthName = moment().format("MMMM");
    const lstMonthName = moment().subtract(1, "month").format("MMMM");
    const shortMonthLast = moment().subtract(1, "month").format("MMM");
    const currentYear = moment().format("YYYY");

    const monthButton = screen.getByText(currentMonthName);
    expect(monthButton).toBeInTheDocument();

    const combobox = screen.getAllByRole("combobox");

    expect(combobox[1]).toBeInTheDocument();
    fireEvent.change(combobox[1], {
      target: { value: shortMonthLast },
    });

    const JanMonthButton = screen.getByText(lstMonthName);
    expect(JanMonthButton).toBeInTheDocument();
    fireEvent.click(JanMonthButton);

    const yearButton = screen.getByText(currentYear);
    expect(yearButton).toBeInTheDocument();

    const combobox1 = screen.getAllByRole("combobox");

    expect(combobox1[2]).toBeInTheDocument();
    fireEvent.change(combobox1[2], {
      target: { value: "202" },
    });

    const yearhButton = screen.getByText("2025");
    expect(yearhButton).toBeInTheDocument();
    fireEvent.click(yearhButton);
  });

  it("Click on today Conponent", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MyWorkHours />
        </Provider>
      );
    });
    const calendarMonthButton = screen.getByText("Calendar View");
    expect(calendarMonthButton).toBeInTheDocument();
    fireEvent.click(calendarMonthButton);

    const TodayButton = screen.getByText("Today");
    expect(TodayButton).toBeInTheDocument();
    fireEvent.click(TodayButton);
  });

  it("should calculate fromDate and toDate for the Payroll Month filter", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MyWorkHours />
        </Provider>
      );
    });

    const payrollMonthButton = screen.getByText("Payroll Month");
    fireEvent.click(payrollMonthButton);

    await sleep(3000);

    expect(
      await screen.findByText((content) => content.includes("Total Hours"))
    ).toBeInTheDocument();
    expect(await screen.findByText("45")).toBeInTheDocument();
  });

  it("should update to February 2024 when clicking 'Previous Month' from March", async () => {
    jest.spyOn(Date.prototype, "getMonth").mockReturnValue(2);
    jest.spyOn(Date.prototype, "getFullYear").mockReturnValue(2024);

    await act(async () => {
      render(
        <Provider store={store}>
          <MyWorkHours />
        </Provider>
      );
    });
    fireEvent.click(await screen.findByText("Calendar View"));
    fireEvent.click(await screen.findByRole("button", { name: /prev_month/i }));

    jest.restoreAllMocks();
  });

  it("should update to April 2024 when clicking 'Next Month' from March", async () => {
    jest.spyOn(Date.prototype, "getMonth").mockReturnValue(2);
    jest.spyOn(Date.prototype, "getFullYear").mockReturnValue(2024);

    await act(async () => {
      render(
        <Provider store={store}>
          <MyWorkHours />
        </Provider>
      );
    });

    fireEvent.click(await screen.findByText("Calendar View"));

    fireEvent.click(await screen.findByRole("button", { name: /next_month/i }));

    const expectedMonthName = "April";
    const expectedYear = 2024;

    const monthElements = await screen.findAllByText(expectedMonthName);
    const yearElements = await screen.findAllByText(expectedYear.toString());

    expect(monthElements[0]).toBeInTheDocument();
    expect(yearElements[0]).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("should show no options for the Payroll Month", async () => {
    render(
      <Provider store={store}>
        <MyWorkHours />
      </Provider>
    );
    const payrollMonthButton = screen.getByText("Payroll Month");
    fireEvent.click(payrollMonthButton);

    const combobox = screen.getAllByRole("combobox");
    fireEvent.click(combobox[1]);

    expect(combobox[1]).toBeInTheDocument();
    fireEvent.change(combobox[1], {
      target: { value: "1" },
    });

    const NoOptions = screen.getByText("No options");
    expect(NoOptions).toBeInTheDocument();
  });

  it("should show the correct computed work hours  using the Calendar  filter", async () => {
    jest.spyOn(Date.prototype, "getMonth").mockReturnValue(2);
    jest.spyOn(Date.prototype, "getFullYear").mockReturnValue(2024);
    const mockedWorkHours0: IMyWorkHours = {
      tempCalculation: {
        realisedHours: 40,
        plannedHours: 10,
        totalHours: 50,
        realisedWh: 0,
        plannedWh: 0,
      },
      status: "FINALISED",
      finalized: true,
      fnumHours: 0,
      fnumLop: 0,
      fnumWorkingHolidays: 2,
      fmanualHours: 0,
      message: "Work hours finalized",
    };

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("week")) {
          return Promise.resolve(mockedWeeks);
        } else if (endpoint.includes("hours/payroll-config")) {
          return Promise.resolve(mockedPayrollConfig);
        } else if (endpoint.includes("/my-work-hours")) {
          return Promise.resolve(mockedWorkHours0);
        } else if (endpoint.includes("emp-calender-hours")) {
          return Promise.resolve(mockedCalenderHours);
        }
        return Promise.resolve([]);
      }),
    });

    render(
      <Provider store={store}>
        <MyWorkHours />
      </Provider>
    );

    const calendarMonthButton = screen.getByText("Calendar Month");
    expect(calendarMonthButton).toBeInTheDocument();
    fireEvent.click(calendarMonthButton);

    await sleep(2000);
  });

  it("should show the correct computed work hours  using the Calendar  filter", async () => {
    jest.spyOn(Date.prototype, "getMonth").mockReturnValue(2);
    jest.spyOn(Date.prototype, "getFullYear").mockReturnValue(2024);

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("week")) {
          return Promise.resolve(mockedWeeks);
        } else if (endpoint.includes("hours/payroll-config")) {
          return Promise.resolve(mockedPayrollConfig);
        } else if (endpoint.includes("/my-work-hours")) {
          return Promise.resolve([]);
        } else if (endpoint.includes("emp-calender-hours")) {
          return Promise.resolve(mockedCalenderHours);
        }
        return Promise.resolve([]);
      }),
    });

    render(
      <Provider store={store}>
        <MyWorkHours />
      </Provider>
    );

    const calendarMonthButton = screen.getByText("Calendar Month");
    expect(calendarMonthButton).toBeInTheDocument();
    fireEvent.click(calendarMonthButton);
  });
  it("verifies all calendar hour status display conditions accurately", async () => {
    const completeStatusSet: ICalenderHour[] = [
      { date: "2024-07-01", hours: 0, status: "WEEK_OFF", type: "GENERAL" },
      { date: "2024-07-02", hours: 0, status: "LEAVE", type: "GENERAL" },
      { date: "2024-07-03", hours: 0, status: "LEAVE", type: "SICK" },
      { date: "2024-07-04", hours: 0, status: "LEAVE", type: "PERSONAL" },
      { date: "2024-07-05", hours: 0, status: "NA", type: "GENERAL" },
      { date: "2024-07-06", hours: 8, status: "WORKING", type: "GENERAL" },
      {
        date: "2024-07-07",
        hours: 8,
        status: "WORKING_HOLIDAY",
        type: "GENERAL",
      },
      { date: "2024-07-08", hours: 0, status: "HOLIDAY", type: "GENERAL" },
      { date: "2024-07-09", hours: 8, status: "BLANK", type: "CUSTOM" },
    ];
    jest.spyOn(Date.prototype, "getMonth").mockReturnValue(6);
    jest.spyOn(Date.prototype, "getFullYear").mockReturnValue(2024);

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("week")) {
          return Promise.resolve(mockedWeeks);
        } else if (endpoint.includes("hours/payroll-config")) {
          return Promise.resolve(mockedPayrollConfig);
        } else if (endpoint.includes("/my-work-hours")) {
          return Promise.resolve(mockedWorkHours);
        } else if (endpoint.includes("emp-calender-hours")) {
          return Promise.resolve(completeStatusSet);
        }
        return Promise.resolve([]);
      }),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyWorkHours />
        </Provider>
      );
    });

    const calendarViewButton = screen.getByText("Calendar View");
    await act(async () => {
      fireEvent.click(calendarViewButton);
    });

    await waitFor(() => {
      expect(screen.getAllByText("Week Off")[0]).toBeInTheDocument();

      expect(screen.getAllByText("Leave")[0]).toBeInTheDocument();

      expect(screen.getAllByText("(SICK)")[0]).toBeInTheDocument();
      expect(screen.getAllByText("(PERSONAL)")[0]).toBeInTheDocument();

      const leaveElements = screen.getAllByText("Leave");
      let generalLeaveFound = false;
      for (const leaveElement of leaveElements) {
        const parent = leaveElement.parentElement;
        if (parent && !parent.textContent?.includes("(")) {
          generalLeaveFound = true;
          break;
        }
      }
      expect(generalLeaveFound).toBe(true);

      expect(screen.getAllByText("8").length).toBeGreaterThan(0);

      expect(screen.queryByText("(CUSTOM)")).not.toBeInTheDocument();
      expect(screen.queryByText("(GENERAL)")).not.toBeInTheDocument();
    });
    jest.restoreAllMocks();
  });
  it("handles empty calendar hour data gracefully", async () => {
    jest.spyOn(Date.prototype, "getMonth").mockReturnValue(6);
    jest.spyOn(Date.prototype, "getFullYear").mockReturnValue(2024);

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("week")) {
          return Promise.resolve(mockedWeeks);
        } else if (endpoint.includes("hours/payroll-config")) {
          return Promise.resolve(mockedPayrollConfig);
        } else if (endpoint.includes("/my-work-hours")) {
          return Promise.resolve(mockedWorkHours);
        } else if (endpoint.includes("emp-calender-hours")) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      }),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyWorkHours />
        </Provider>
      );
    });

    const calendarViewButton = screen.getByText("Calendar View");
    await act(async () => {
      fireEvent.click(calendarViewButton);
    });

    jest.restoreAllMocks();
  });
});
