import {
  render,
  fireEvent,
  screen,
  act,
  waitFor,
} from "@testing-library/react";
import MyTeamHours from "./MyTeamHours";
import { Provider } from "react-redux";
import moment from "moment";
import { store, useAppSelector } from "../../app/store/store";
import {
  IMyTeamInfo,
  ICalenderHour,
  IWeekResponse,
  IPayrollConfig,
  IMyTeamHours,
} from "../../helper/Interface";
import { useApi } from "../../hooks/useApi";
import React from "react";
import { useLocation } from "react-router-dom";

const mockedMyTeamInfo: IMyTeamInfo = {
  success: true,
  message: "",
  userBasicInfoDTOList: [
    {
      userId: "fb425613-2db8-4767-b8d8-d05680d4b3a7",
      firstName: "Snehal",
      lastName: "Prakash",
      empId: "DSI008047",
      email: "snehal.prakash@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2020-10-05",
    },
    {
      userId: "ec44900a-b92c-43b3-ae5d-c55ea84e461e",
      firstName: "Bhuvanesh V",
      lastName: "Shetty",
      empId: "DSI008329",
      email: "shetty.bhuvanesh@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2021-03-05",
    },
    {
      userId: "f09a5449-58d7-415b-96c4-ec42b16c3a0f",
      firstName: "Vikram",
      lastName: "Kumar",
      empId: "DP6030",
      email: "vikram.vikram@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 2,
      joiningDate: "2021-03-21",
    },
    {
      userId: "d0d25118-4e7f-4b7f-acb3-1f650a6c4a92",
      firstName: "Muskan",
      lastName: "Agarwal",
      empId: "DSI008399",
      email: "muskan.agarwal@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2021-04-04",
    },
    {
      userId: "23dd0aa6-0374-4f73-88a0-c55434955c39",
      firstName: "Vishnupriya",
      lastName: "Poddar",
      empId: "DSI008407",
      email: "vishnupriya.poddar@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2021-04-14",
    },
    {
      userId: "e0e2be82-73d3-4b42-92b4-59ad7bcfa773",
      firstName: "Satyam",
      lastName: "Sharma",
      empId: "DP6141",
      email: "satyam.sharma@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 2,
      joiningDate: "2021-04-15",
    },
    {
      userId: "01a81f4f-9ea6-457f-9745-2ce9a736713b",
      firstName: "Pankaj",
      lastName: "Sharma",
      empId: "DP6242",
      email: "pankajsharma.pankaj@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 2,
      joiningDate: "2021-06-30",
    },
    {
      userId: "879a876c-6000-4b18-b083-4643df019831",
      firstName: "Karthik",
      lastName: "B",
      empId: "DP6406",
      email: "karthik.b@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 2,
      joiningDate: "2021-08-04",
    },
    {
      userId: "7d7a773c-828d-4966-a94d-b58f061125c9",
      firstName: "Murali",
      lastName: "V",
      empId: "DSI008662",
      email: "muraliv.murali@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2021-09-02",
    },
    {
      userId: "5c8d065b-325c-4f53-bf10-91028901589e",
      firstName: "SAMRUDDHA",
      lastName: "GADNAYAK",
      empId: "DSI000486",
      email: "samruddha.gadnayak@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2013-04-30",
    },
    {
      userId: "ffc314e9-bab8-40cb-9f50-a4854c200fe3",
      firstName: "Preethi",
      lastName: ".",
      empId: "DP6310",
      email: "preethi.preethi@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 2,
      joiningDate: "2021-07-22",
    },
    {
      userId: "e0f3a072-f10c-47db-9104-d9058ccfb365",
      firstName: "Abhishek",
      lastName: "Singh",
      empId: "DSI005681",
      email: "abhishek.singh2@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2018-06-05",
    },
    {
      userId: "5d6f8181-a31e-4d01-bba7-7e94baa33f3d",
      firstName: "Ritesh",
      lastName: "Veer",
      empId: "DSI009827",
      email: "ritesh.veer@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2021-09-12",
    },
    {
      userId: "4ba9b8a6-1539-4aa9-a8ca-9c6f1553c4d4",
      firstName: "Anjana Tresa",
      lastName: "Thomas",
      empId: "DSI008021",
      email: "anjana.tresa@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2020-09-30",
    },
    {
      userId: "f5f83fd9-c068-400f-8820-a596e016791c",
      firstName: "Kumari",
      lastName: "Nikita",
      empId: "DSI008638",
      email: "kumari.nikita@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2021-08-31",
    },
    {
      userId: "899a28dd-5bc0-42d8-a113-aa3468932375",
      firstName: "Anila",
      lastName: "K S",
      empId: "DSI008588",
      email: "anila.ks@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2021-08-09",
    },
    {
      userId: "15ec2b2d-faf1-4072-bcce-6e7479445181",
      firstName: "RAM CHANDRA",
      lastName: "KV",
      empId: "DSI000108",
      email: "ramchandra.venkateshappa@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2010-04-23",
    },
    {
      userId: "d2f57cdf-8796-4f80-b7be-8547705c1c14",
      firstName: "HARISH",
      lastName: "IYYAPPAN A T",
      empId: "DSI005457",
      email: "harish.iyyappan@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2018-03-30",
    },
    {
      userId: "dfec0fb0-4750-46d1-ac02-7db35b86b86c",
      firstName: "Samuel",
      lastName: "S",
      empId: "DSI004452",
      email: "samuel.s@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2017-06-11",
    },
    {
      userId: "38855894-2588-4dd8-a046-9c548e0cc08e",
      firstName: "Uday Kiran",
      lastName: "M",
      empId: "DSI008557",
      email: "uday.kiran@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2021-07-31",
    },
    {
      userId: "76783eea-5947-43a5-8776-79b5aea37ae7",
      firstName: "Manikandan",
      lastName: "Muthan",
      empId: "DSI005052",
      email: "manikandan.muthan@decathlon.com",
      costCentreName: "IN1041",
      contractTypeId: 1,
      joiningDate: "2017-12-10",
    },
  ],
};
const mockedWeeks: IWeekResponse[] = [
  {
    id: 1,
    year: 2024,
    number: 1,
    startDate: "2024-01-01",
    endDate: "2024-01-07",
  },
  {
    id: 2,
    year: 2024,
    number: 2,
    startDate: "2024-01-08",
    endDate: "2024-01-14",
  },
];
const mockedPayrollConfig: IPayrollConfig = {
  currentPStartDateTime: "2024-07-01T00:00:00",
  currentPEndDateTime: "2024-07-31T23:59:59",
  currentManualHourStartTime: "2024-07-01T09:00:00",
  currentManualHourEndTime: "2024-07-31T17:00:00",
  currentPayrollExtractStartTime: "2024-06-25T00:00:00",
};
const mockedTeamHours: IMyTeamHours = {
  status: "FINALISED",
  message: "Work hours have been finalized.",
  success: true,
  intermediateWorkHoursList: [
    {
      contractTypeName: "Full Time",
      empId: "EMP001",
      name: "John Doe",
      numWorkingHolidays: 2,
      plannedHours: 160,
      plannedWh: 8,
      realisedHours: 150,
      realisedWh: 7,
      totalWorkHours: 160,
    },
    {
      contractTypeName: "Contract",
      empId: "EMP002",
      name: "Jane Smith",
      numWorkingHolidays: 1,
      plannedHours: 140,
      plannedWh: 7,
      realisedHours: 130,
      realisedWh: 6,
      totalWorkHours: 140,
    },
    {
      contractTypeName: "Full Time",
      empId: "EMP003",
      name: "Alice Johnson",
      numWorkingHolidays: 3,
      plannedHours: 150,
      plannedWh: 7,
      realisedHours: 145,
      realisedWh: 5,
      totalWorkHours: 150,
    },
  ],
  finalisedWorkHoursList: [
    {
      id: 1,
      name: "John Doe",
      empId: "EMP001",
      contractTypeName: "Full Time",
      clusterName: "Cluster A",
      numWorkingHours: 120,
      numWorkingHolidays: 5,
      manualHours: 10,
      totalHours: 130,
      numLop: 0,
      approvalStatus: "APPROVED",
    },
    {
      id: 2,
      name: "Jane Smith",
      empId: "EMP002",
      contractTypeName: "Contract",
      numWorkingHours: 140,
      numWorkingHolidays: 1,
      manualHours: 5,
      totalHours: 145,
      numLop: 1,
      approvalStatus: "PENDING",
      clusterName: "Cluster B",
    },
    {
      id: 3,
      name: "Alice Johnson",
      empId: "EMP003",
      contractTypeName: "Part Time",
      numWorkingHours: 120,
      numWorkingHolidays: 3,
      manualHours: 15,
      totalHours: 135,
      numLop: 2,
      approvalStatus: "REJECTED",
      clusterName: "Cluster C",
    },
    {
      id: 4,
      name: "Rajesh Kumar",
      empId: "EMP004",
      contractTypeName: "Full Time",
      numWorkingHours: 180,
      numWorkingHolidays: 4,
      manualHours: 20,
      totalHours: 200,
      numLop: 0,
      approvalStatus: "APPROVED",
      clusterName: "Cluster D",
    },
  ],
};

const mockedCalenderHours: ICalenderHour[] = [
  { date: "2024-07-01", hours: 8, status: "WORKING", type: "GENERAL" },
  { date: "2024-07-02", hours: 0, status: "WEEK_OFF", type: "NA" },
  { date: "2024-07-01", hours: 8, status: "LEAVE", type: "GENERAL" },
  { date: "2024-07-02", hours: 0, status: "WORKING_HOLIDAY", type: "NA" },
  { date: "2024-07-02", hours: 0, status: "", type: "NA" },
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
describe("My Team Hours Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("week")) {
          return Promise.resolve(mockedWeeks);
        } else if (endpoint.includes("payroll-config")) {
          return Promise.resolve(mockedPayrollConfig);
        } else if (endpoint.includes("my-team-hours")) {
          return Promise.resolve(mockedTeamHours);
        } else if (endpoint.includes("my-team-info")) {
          return Promise.resolve(mockedMyTeamInfo);
        } else if (endpoint.includes("emp-calender-hours")) {
          return Promise.resolve(mockedCalenderHours);
        }
        return Promise.resolve([]);
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

  it("should render `My Team Hours Page`", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamHours />
        </Provider>
      );
    });

    expect(screen.getByText("My Team Hours")).toBeInTheDocument();
  });

  it("should render `Tabs`", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamHours />
        </Provider>
      );
    });

    const Tabs = ["Tabular View", "Calendar View"];
    Tabs.forEach((tab) => expect(screen.getByText(tab)).toBeInTheDocument());
  });

  it("handles click for 'Calendar View' and displays data in 'Calendar View'", async () => {
    render(
      <Provider store={store}>
        <MyTeamHours />
      </Provider>
    );

    const calendarViewButton = await screen.findByText("Calendar View");
    fireEvent.click(calendarViewButton);

    expect(await screen.findByText("Calendar View")).toBeInTheDocument();
    expect(screen.getByText("Employees")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Week")).toBeInTheDocument();
    const emp1Id = await screen.findByText("DSI008021");
    expect(emp1Id).toBeInTheDocument();

    const empAsYouId = await screen.findAllByText("DSI000486");
    const empAsYouText = await screen.findByText("You");
    const empAsYouFirstName = await screen.findByText("SAMRUDDHA");

    expect(empAsYouId[0]).toBeInTheDocument();
    expect(empAsYouText).toBeInTheDocument();
    expect(empAsYouFirstName).toBeInTheDocument();
  });

  it("handles click for 'Tabular View' and displays data in 'Tabular View'", async () => {
    render(
      <Provider store={store}>
        <MyTeamHours />
      </Provider>
    );

    const TabularViewButton = await screen.findByText("Tabular View");
    fireEvent.click(TabularViewButton);
  });

  it("should not render `No Data`", async () => {
    render(
      <Provider store={store}>
        <MyTeamHours />
      </Provider>
    );
    expect(screen.queryByTestId("no-data")).not.toBeInTheDocument();
  });

  it("handles search in employee in 'Calendar View' section", async () => {
    render(
      <Provider store={store}>
        <MyTeamHours />
      </Provider>
    );
    await fireEvent.click(screen.getByText("Calendar View"));
    fireEvent.change(screen.getByPlaceholderText("Search here"), {
      target: { value: "Anila" },
    });
    const empName = screen.queryByText("DSI008021");
    expect(empName).toBeNull();
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
        <MyTeamHours />
      </Provider>
    );

    const calendarMonthButton = screen.getByText("Calendar Month");

    fireEvent.click(calendarMonthButton);

    await screen.findByText("Calendar Month");

    expect(fromDate.format("YYYY-MM-DD")).toBe("2024-07-01");
    expect(toDate.format("YYYY-MM-DD")).toBe("2024-07-31");
  });

  it("should correctly calculate the fromDate and toDate when 'Custom Range' filter is selected", async () => {
    const customFromDate = "2024-06-15";
    const customToDate = "2024-07-15";

    let fromDate = moment(customFromDate);
    let toDate = moment(customToDate);

    render(
      <Provider store={store}>
        <MyTeamHours />
      </Provider>
    );

    const customRangeButton = screen.getByText("Custom Range");

    fireEvent.click(customRangeButton);

    await screen.findByText("Custom Range");

    expect(fromDate.format("YYYY-MM-DD")).toBe("2024-06-15");
    expect(toDate.format("YYYY-MM-DD")).toBe("2024-07-15");
  });

  it("should update to December of the previous year when clicking 'Previous Month' from January", async () => {
    const mockedDate = new Date(2024, 0, 1);
    jest.useFakeTimers().setSystemTime(mockedDate);

    render(
      <Provider store={store}>
        <MyTeamHours />
      </Provider>
    );
    fireEvent.click(screen.getByText("Calendar View"));

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
        <MyTeamHours />
      </Provider>
    );

    const tabularViewTab = screen.getByText("Calendar View");
    fireEvent.click(tabularViewTab);

    const nextMonthButton = screen.getByTestId("next_month");
    fireEvent.click(nextMonthButton);

    const monthElements = screen.getAllByText(expectedMonthName);
    const yearElements = screen.getAllByText(nextYear.toString());

    const updatedMonth = monthElements[0];
    const updatedYear = yearElements[0];

    expect(updatedMonth).toBeInTheDocument();
    expect(updatedYear).toBeInTheDocument();
  });

  it("should correctly apply 'Payroll Month' filter in Tabular View", async () => {
    render(
      <Provider store={store}>
        <MyTeamHours />
      </Provider>
    );

    const tabularViewTab = screen.getByText("Tabular View");
    fireEvent.click(tabularViewTab);

    const payrollMonthFilter = screen.getByText("Payroll Month");
    fireEvent.click(payrollMonthFilter);
  });

  it("should correctly apply 'Calender Month' filter in Tabular View", async () => {
    render(
      <Provider store={store}>
        <MyTeamHours />
      </Provider>
    );

    const tabularViewTab = screen.getByText("Tabular View");
    fireEvent.click(tabularViewTab);

    const calendarMonthFilter = await waitFor(() =>
      screen.getByText(/Calendar Month/i)
    );
  });

  it("should correctly apply 'Custom Range' filter in Tabular View", async () => {
    render(
      <Provider store={store}>
        <MyTeamHours />
      </Provider>
    );

    const tabularViewTab = screen.getByText("Tabular View");
    fireEvent.click(tabularViewTab);

    const customRangeFilter = await waitFor(() =>
      screen.getByText(/Custom Range/i)
    );
    fireEvent.click(customRangeFilter);
  });
  it("should set the current month and year when clicked", async () => {
    render(
      <Provider store={store}>
        <MyTeamHours />
      </Provider>
    );

    const calendarViewTab = screen.getByText("Calendar View");
    fireEvent.click(calendarViewTab);

    const todayButton = screen.getByRole("button", { name: /today/i });
    fireEvent.click(todayButton);
  });

  it("should update selected employee ID, reset calendar hours, and call getEmpCalenderHours when an employee is selected", async () => {
    render(
      <Provider store={store}>
        <MyTeamHours />
      </Provider>
    );
    const calendarViewButton = await screen.findByText("Calendar View");
    fireEvent.click(calendarViewButton);

    const employeeRow = await screen.findByText("SAMRUDDHA");
    fireEvent.click(employeeRow);

    expect(screen.getByText("SAMRUDDHA")).toBeInTheDocument();
  });
  it("filters users by search key", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamHours />
        </Provider>
      );
    });

    const searchInput = screen.getByPlaceholderText("Search here");
    fireEvent.change(searchInput, { target: { value: "Snehal" } });

    await waitFor(() => {
      const unmatchedUser = screen.queryByText(/Vikram Kumar/i);
      expect(unmatchedUser).not.toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: "Muskan" } });
  });

  it("should render `MyTeamLeaves  Page", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamHours />
        </Provider>
      );
    });

    const aliceLeaveElement = await screen.findByText(/My Team Hours/i);
    expect(aliceLeaveElement).toBeInTheDocument();
  });

  it("does not render BasicDetails and RolesDetails when userDetails or selectedCostCenterName are missing", async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: null,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamHours />
        </Provider>
      );
    });

    const basicDetails = screen.queryByText(/BasicDetails/i);
    const rolesDetails = screen.queryByText(/RolesDetails/i);

    expect(basicDetails).not.toBeInTheDocument();
    expect(rolesDetails).not.toBeInTheDocument();
  });

  it("handles setting selectedEmpId correctly based on userBasicInfoDTOList", async () => {
    useApiMock.mockReturnValueOnce({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("my-team-info")) {
          return Promise.resolve({
            success: true,
            userBasicInfoDTOList: [
              { empId: "DSI000486", firstName: "SAMRUDDHA" },
              { empId: "DSI008047", firstName: "Snehal" },
            ],
          });
        }
        return Promise.resolve([]);
      }),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamHours />
        </Provider>
      );
    });

    const calendarViewButton = await screen.findByText("Calendar View");
    fireEvent.click(calendarViewButton);

    const employeeRow = await screen.findByText("SAMRUDDHA");
    fireEvent.click(employeeRow);

    expect(screen.getByText("SAMRUDDHA")).toBeInTheDocument();

    useApiMock.mockReturnValueOnce({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("my-team-info")) {
          return Promise.resolve({
            success: true,
            userBasicInfoDTOList: [],
          });
        }
        return Promise.resolve([]);
      }),
    });
    fireEvent.click(calendarViewButton);
  });

  it("sets empId to selectedEmpId when selectedEmpId exists in userBasicInfoDTOList", async () => {
    const selectedEmpId = "DSI000486";
    useApiMock.mockReturnValueOnce({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("my-team-info")) {
          return Promise.resolve({
            success: true,
            userBasicInfoDTOList: [
              { empId: "DSI000486", firstName: "SAMRUDDHA" },
              { empId: "DSI008047", firstName: "Snehal" },
            ],
          });
        }
        return Promise.resolve([]);
      }),
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: {
        empId: selectedEmpId,
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamHours />
        </Provider>
      );
    });

    const calendarViewButton = await screen.findByText("Calendar View");
    fireEvent.click(calendarViewButton);

    await waitFor(() => {
      expect(screen.getByText("SAMRUDDHA")).toBeInTheDocument();
    });
  });

  it("does not set empId to selectedEmpId when selectedEmpId is not in userBasicInfoDTOList", async () => {
    const selectedEmpId = "DSI999999";
    useApiMock.mockReturnValueOnce({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("my-team-info")) {
          return Promise.resolve({
            success: true,
            userBasicInfoDTOList: [
              { empId: "DSI000486", firstName: "SAMRUDDHA" },
              { empId: "DSI008047", firstName: "Snehal" },
            ],
          });
        }
        return Promise.resolve([]);
      }),
    });
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: {
        empId: selectedEmpId,
      },
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamHours />
        </Provider>
      );
    });

    const calendarViewButton = await screen.findByText("Calendar View");
    fireEvent.click(calendarViewButton);
    expect(screen.queryByText("SAMRUDDHA")).not.toBeInTheDocument();
  });

  it("should update to February 2024 when clicking 'Previous Month' from March", async () => {
    const mockedDate = new Date(2024, 2, 1);
    jest.useFakeTimers().setSystemTime(mockedDate);

    render(
      <Provider store={store}>
        <MyTeamHours />
      </Provider>
    );

    fireEvent.click(screen.getByText("Calendar View"));

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
        <MyTeamHours />
      </Provider>
    );

    fireEvent.click(screen.getByText("Calendar View"));

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

  it("should correctly calculate the fromDate and toDate when 'Calendar Month' filter is selected", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamHours />
        </Provider>
      );
    });

    const Calendar_Button = screen.getByText("Calendar Month");

    fireEvent.click(Calendar_Button);
  });

  it("Team hours Empty has been mocked", async () => {
    const mockedTeamHoursEmpty: IMyTeamHours = {
      status: "FINALISED",
      message: "Work hours have been finalized.",
      success: true,
      intermediateWorkHoursList: [],
      finalisedWorkHoursList: [],
    };
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("week")) {
          return Promise.resolve(mockedWeeks);
        } else if (endpoint.includes("payroll-config")) {
          return Promise.resolve(mockedPayrollConfig);
        } else if (endpoint.includes("my-team-hours")) {
          return Promise.resolve(mockedTeamHoursEmpty);
        } else if (endpoint.includes("my-team-info")) {
          return Promise.resolve(mockedMyTeamInfo);
        } else if (endpoint.includes("emp-calender-hours")) {
          return Promise.resolve(mockedCalenderHours);
        }
        return Promise.resolve([]);
      }),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamHours />
        </Provider>
      );
    });
  });

  describe("Component logic tests for MyTeamHours", () => {
    it("correctly generates month listing based on payroll config", async () => {
      const testPayrollConfig = {
        currentPStartDateTime: "2024-01-20T00:00:00",
        currentPEndDateTime: "2024-02-19T23:59:59",
        currentManualHourStartTime: "2024-02-15T00:00:00",
        currentManualHourEndTime: "2024-02-19T23:59:59",
        currentPayrollExtractStartTime: "2024-02-20T00:00:00",
      };

      useApiMock.mockReturnValue({
        get: jest.fn((endpoint) => {
          if (endpoint.includes("payroll-config")) {
            return Promise.resolve(testPayrollConfig);
          } else if (endpoint.includes("week")) {
            return Promise.resolve(mockedWeeks);
          }
          return Promise.resolve([]);
        }),
      });

      await act(async () => {
        render(
          <Provider store={store}>
            <MyTeamHours />
          </Provider>
        );
      });

      expect(screen.getByText("My Team Hours")).toBeInTheDocument();

      const dropdown = screen.getByRole("combobox");
      expect(dropdown).toBeInTheDocument();
    });

    it("correctly sets current month and year on component mount", async () => {
      const mockedDate = new Date(2024, 3, 15);
      jest.useFakeTimers().setSystemTime(mockedDate);

      await act(async () => {
        render(
          <Provider store={store}>
            <MyTeamHours />
          </Provider>
        );
      });

      const calendarViewButton = screen.getByText("Calendar View");
      fireEvent.click(calendarViewButton);

      const monthElements = await screen.findAllByText("April");
      const yearElements = await screen.findAllByText("2024");

      expect(monthElements[0]).toBeInTheDocument();
      expect(yearElements[0]).toBeInTheDocument();

      jest.useRealTimers();
    });

    it("correctly calculates totals for work hours lists", async () => {
      const testTeamHours = {
        status: "FINALISED",
        message: "Work hours have been finalized.",
        success: true,
        intermediateWorkHoursList: [
          {
            contractTypeName: "Full Time",
            empId: "EMP001",
            name: "John Doe",
            numWorkingHolidays: 2,
            plannedHours: 100,
            plannedWh: 10,
            realisedHours: 50,
            realisedWh: 5,
            totalWorkHours: 150,
          },
          {
            contractTypeName: "Contract",
            empId: "EMP002",
            name: "Jane Smith",
            numWorkingHolidays: 3,
            plannedHours: 100,
            plannedWh: 10,
            realisedHours: 50,
            realisedWh: 5,
            totalWorkHours: 150,
          },
        ],
        finalisedWorkHoursList: [
          {
            id: 2,
            name: "Jane Smith",
            empId: "EMP002",
            contractTypeName: "Contract",
            numWorkingHours: 120,
            numWorkingHolidays: 5,
            manualHours: 10,
            totalHours: 130,
            numLop: 3,
            approvalStatus: "PENDING",
            clusterName: "Cluster B",
          },
        ],
      };

      useApiMock.mockReturnValue({
        get: jest.fn((endpoint) => {
          if (endpoint.includes("payroll-config")) {
            return Promise.resolve(mockedPayrollConfig);
          } else if (endpoint.includes("my-team-hours")) {
            return Promise.resolve(testTeamHours);
          } else if (endpoint.includes("week")) {
            return Promise.resolve(mockedWeeks);
          }
          return Promise.resolve([]);
        }),
      });

      await act(async () => {
        render(
          <Provider store={store}>
            <MyTeamHours />
          </Provider>
        );
      });

      const totalRows = screen.getAllByText("TOTAL");
      expect(totalRows.length).toBeGreaterThan(0);

      const totalWorkHoursElement = await screen.findByText("300");
      expect(totalWorkHoursElement).toBeInTheDocument();
    });

    it("creates calendar correctly for the selected month", async () => {
      const mockedDate = new Date(2024, 5, 15);
      jest.useFakeTimers().setSystemTime(mockedDate);

      await act(async () => {
        render(
          <Provider store={store}>
            <MyTeamHours />
          </Provider>
        );
      });

      const calendarViewButton = screen.getByText("Calendar View");
      fireEvent.click(calendarViewButton);

      const monthElements = await screen.findAllByText("June");
      expect(monthElements.length).toBeGreaterThan(0);
      expect(monthElements[0]).toBeInTheDocument();

      const yearElements = await screen.findAllByText("2024");
      expect(yearElements.length).toBeGreaterThan(0);
      expect(yearElements[0]).toBeInTheDocument();

      expect(screen.getByText("Week")).toBeInTheDocument();

      jest.useRealTimers();
    });

    it("filters team members in calendar view based on search key", async () => {
      useApiMock.mockReturnValue({
        get: jest.fn((endpoint) => {
          if (endpoint.includes("payroll-config")) {
            return Promise.resolve(mockedPayrollConfig);
          } else if (endpoint.includes("my-team-info")) {
            return Promise.resolve(mockedMyTeamInfo);
          } else if (endpoint.includes("week")) {
            return Promise.resolve(mockedWeeks);
          } else if (endpoint.includes("emp-calender-hours")) {
            return Promise.resolve(mockedCalenderHours);
          }
          return Promise.resolve([]);
        }),
      });

      await act(async () => {
        render(
          <Provider store={store}>
            <MyTeamHours />
          </Provider>
        );
      });

      const calendarViewButton = screen.getByText("Calendar View");
      fireEvent.click(calendarViewButton);

      await waitFor(() => {
        expect(screen.getByText("SAMRUDDHA")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText("Search here");
      fireEvent.change(searchInput, { target: { value: "SAMRUDDHA" } });

      expect(screen.getByText("SAMRUDDHA")).toBeInTheDocument();
      expect(screen.queryByText("Snehal")).not.toBeInTheDocument();
    });
  });
});
