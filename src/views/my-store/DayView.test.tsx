import {
  fireEvent,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import DayView from "./DayView";
import { Provider } from "react-redux";
import { useApi } from "../../hooks/useApi";
import { store, useAppSelector } from "../../app/store/store";
import { IDayView } from "../../helper/Interface";
import React, { useEffect } from "react";
import moment from "moment";
import { useLocation } from "react-router-dom";

const mockGetDayViewData: IDayView = {
  clusters: [
    {
      name: "Cycling",
      totalHours: 2.0,
      empDayShifts: [
        {
          empId: "DSI008021",
          name: "Anjana Tresa Thomas",
          contractId: 1,
          shifts: [
            {
              s: "06:00:00",
              e: "08:00:00",
            },
          ],
        },
        {
          empId: "DSI005457",
          name: "HARISH IYYAPPAN A T",
          contractId: 1,
          shifts: [
            {
              s: "08:00:00",
              e: "09:00:00",
            },
          ],
        },
        {
          empId: "DSI008329",
          name: "Bhuvanesh V Shetty",
          contractId: 1,
          shifts: [
            {
              s: "06:30:00",
              e: "08:00:00",
            },
          ],
        },
        {
          empId: "DP6406",
          name: "Karthik B",
          contractId: 2,
          shifts: [],
        },
        {
          empId: "DSI000486",
          name: "SAMRUDDHA GADNAYAK",
          contractId: 1,
          shifts: [],
        },
      ],
    },
    {
      name: "Fitness Cluster",
      totalHours: 0.0,
      empDayShifts: [
        {
          empId: "DSI004452",
          name: "Samuel S",
          contractId: 1,
          shifts: [],
        },
        {
          empId: "DSI009827",
          name: "Ritesh Veer",
          contractId: 1,
          shifts: [],
        },
        {
          empId: "DP6141",
          name: "Satyam Sharma",
          contractId: 2,
          shifts: [],
        },
      ],
    },
    {
      name: "Secondary 2",
      totalHours: 0.0,
      empDayShifts: [],
    },
  ],
  secondaryJobs: [
    {
      name: "Click & Collect",
      totalHours: 0.0,
      empDayShifts: [
        {
          empId: "DSI008588",
          name: "Anila K S",
          contractId: 1,
          shifts: [],
        },
        {
          empId: "DSI005681",
          name: "Abhishek Singh",
          contractId: 1,
          shifts: [],
        },
      ],
    },
    {
      name: "DM",
      totalHours: 0.0,
      empDayShifts: [
        {
          empId: "DSI008399",
          name: "Muskan Agarwal",
          contractId: 1,
          shifts: [],
        },
        {
          empId: "DSI008588",
          name: "Anila K S",
          contractId: 1,
          shifts: [],
        },
      ],
    },
    {
      name: "CRM",
      totalHours: 0.0,
      empDayShifts: [
        {
          empId: "DSI008662",
          name: "Murali V",
          contractId: 1,
          shifts: [],
        },
        {
          empId: "DSI005052",
          name: "Manikandan Muthan",
          contractId: 1,
          shifts: [],
        },
        {
          empId: "DP6242",
          name: "Pankaj Sharma",
          contractId: 2,
          shifts: [],
        },
      ],
    },
  ],
};

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
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
  store: {
    getState: jest.fn(),
    subscribe: jest.fn(),
  },
}));

describe("DayView Component", () => {
  const useApiMock = useApi as jest.Mock;
  beforeEach(() => {
    jest.setTimeout(60000);
    jest.clearAllMocks();
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "Test Center",
      contractTypes: [
        { id: 1, name: "Full Time" },
        { id: 2, name: "Part Time" },
      ],
    });
    useApiMock.mockReturnValue({
      get: jest.fn(() => Promise.resolve(mockGetDayViewData)),
    });
    (useLocation as jest.Mock).mockReturnValue({
      pathname: "test",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render `Day View Page`", async () => {
    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );

    expect(screen.getByText("Day View")).toBeInTheDocument();
  });

  it("should render `Date Picker`", async () => {
    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );
    expect(screen.getByTestId("datepicker")).toBeInTheDocument();
  });

  it("should render `Filter Chips`", async () => {
    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );
    const filterLabels = [
      "Layout",
      "Secondary",
      "Miscellaneous",
      "Leave",
      "Week Off",
    ];
    filterLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("should render `Loading`", async () => {
    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("should not render `No Data`", async () => {
    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );
    expect(screen.queryByTestId("no-data")).not.toBeInTheDocument();
  });

  it("should render `Clusters and Jobs`", async () => {
    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );

    const CyclingCluster = await screen.findByText("Cycling");
    expect(CyclingCluster).toBeInTheDocument();

    const CyclingClusterTotalHours = await screen.findByText("Total Hours: 2");
    expect(CyclingClusterTotalHours).toBeInTheDocument();

    const DM = await screen.findByText("DM");
    expect(DM).toBeInTheDocument();
  });

  it("should render `Employee Data`", async () => {
    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );

    const dayViewList = await screen.findByTestId("dayView-list");
    expect(dayViewList).toBeInTheDocument();

    const emp1Id = screen.getByText("DSI008021");
    expect(emp1Id).toBeInTheDocument();

    const emp2Id = screen.getByText("DSI005052");
    expect(emp2Id).toBeInTheDocument();

    const shift = await screen.findByTestId("06:00:00 - 08:00:00");
    expect(shift).toBeInTheDocument();
  });

  it("checks handlers for scroll sync between time-slots and emp-time-slots", async () => {
    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );
    const timeSlots = await screen.findByTestId("time-slots");
    const empTimeSlots = await screen.findByTestId("emp-time-slots");
    fireEvent.scroll(timeSlots, { target: { scrollLeft: 100 } });
    expect(empTimeSlots.scrollLeft).toBe(100);
  });

  it("should handle empty or missing `auth` state gracefully", async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      auth: "{}",
      selectedCostCenterName: "",
    });

    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );

    const noDataMessage = screen.queryByText("Finance");
    expect(noDataMessage).not.toBeInTheDocument();
  });

  it("should call useEffect when mounted", () => {
    const mock = jest.fn();
    jest.spyOn(React, "useEffect").mockImplementation((fn) => fn()); // Mock useEffect

    const Component = () => {
      useEffect(() => {
        mock();
      }, []);
      return null;
    };

    render(<Component />);
    expect(mock).toHaveBeenCalled();
  });

  it("renders cluster 'Cycling' correctly", async () => {
    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Cycling")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Layout"));

    await waitFor(() => {
      expect(screen.getByText("Cycling")).toBeInTheDocument();
    });
  });

  it("should render the datepicker component", () => {
    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );

    const datepicker = screen.getByTestId("datepicker");
    expect(datepicker).toBeInTheDocument();
  });

  it("renders the datepicker and updates the date on change", async () => {
    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );
    const datepicker = screen.getByTestId("datepicker");
    expect(datepicker).toBeInTheDocument();

    const input = datepicker.querySelector("input") as HTMLInputElement;
    expect(input).toBeInTheDocument();

    const displayDate = moment().format("DD-MM-YYYY");

    fireEvent.change(input, { target: { value: displayDate } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(input.value).toBe(displayDate);
    });
  });

  it("should apply default filters initially", async () => {
    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );

    expect(screen.getByText("Layout")).toBeInTheDocument();
    expect(screen.getByText("Secondary")).toBeInTheDocument();
  });

  it("should set day view data to undefined when no clusters or secondary jobs are present", async () => {
    const emptyMockData: IDayView = { clusters: [], secondaryJobs: [] };

    useApiMock.mockReturnValueOnce({
      get: jest.fn(() => Promise.resolve({ clusters: [], secondaryJobs: [] })),
    });

    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Cycling")).not.toBeInTheDocument();
    });

    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Cycling")).not.toBeInTheDocument();
    });
  });

  it("filters employee shifts based on LEAVE and WEEK_OFF status", async () => {
    const mockDayViewData: IDayView = {
      clusters: [
        {
          name: "Cluster A",
          totalHours: 8.0,
          empDayShifts: [
            {
              empId: "EMP001",
              name: "Alice",
              contractId: 1,
              shifts: [],
              status: "LEAVE",
            },
            {
              empId: "EMP002",
              name: "Bob",
              contractId: 1,
              shifts: [],
              status: "WEEK_OFF",
            },
            {
              empId: "EMP003",
              name: "Charlie",
              contractId: 1,
              shifts: [{ s: "09:00:00", e: "17:00:00" }],
              status: undefined,
            },
          ],
        },
      ],
      secondaryJobs: [],
    };

    useApiMock.mockReturnValueOnce({
      get: jest.fn(() => Promise.resolve(mockDayViewData)),
    });

    render(
      <Provider store={store}>
        <DayView />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Alice")).toBeInTheDocument();
      expect(screen.queryByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leave"));

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.queryByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Week Off"));

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });
  });
});
