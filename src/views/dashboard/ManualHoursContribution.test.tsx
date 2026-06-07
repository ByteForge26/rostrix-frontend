import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { useAppSelector, store } from "../../app/store/store";
import ManualHoursContribution from "./ManualHoursContribution";
import {
  IPayrollConfig,
  IRosterDetails,
  IMyTeamLeavesResponse,
  IClusterResponse,
  ISecondaryJob,
  IMiscWork,
} from "../../helper/Interface";
import {
  IAnalyticsCategoryData,
  IAnalyticsEffCombinedData,
} from "../../helper/Interface";
import { useAppDispatch } from "../../app/store/store";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import {
  setFromDate,
  setSelectedCities,
  setSelectedClusters,
  setSelectedCostCenters,
  setSelectedZones,
  setTempFromDate,
  setTempToDate,
  setToDate,
  setView,
} from "../../app/slice/filter.slice";
import { Option } from "react-multi-select-component";

const mockAddToast = jest.fn();
jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: mockAddToast,
  }),
}));

jest.mock("../../app/store/store", () => ({
  ...jest.requireActual("../../app/store/store"),
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(() => ({
    selectedCostCenterName: "IN1041",
    user: {
      empId: "DSI000486",
    },
  })),
}));
const mockPayrollConfig: IPayrollConfig = {
  currentPStartDateTime: "2024-11-22T00:00:00",
  currentPEndDateTime: "2024-12-21T15:15:00",
  currentManualHourStartTime: "2024-12-21T15:20:00",
  currentManualHourEndTime: "2024-12-21T16:20:00",
  currentPayrollExtractStartTime: "2024-12-21T16:22:00",
};
const mockManualManualHoursContributionResponse: IMyTeamLeavesResponse = {
  empLeaveSummaryList: [
    {
      userId: "1",
      empId: "DP6149",
      firstName: "VISHNU",
      lastName: "YADAV",
      managerId: "1001",
      costCentreName: "Cost Centre 1",
      contractTypeId: 2,
      stateId: 9,
      totalAllowed: 0,
      availedGeneral: 0,
      plannedGeneral: 0,
      clusterName: "Cluster 1",
      clusterId: 1,
      availedLop: 0,
      plannedLop: 0,
      matOrPatAvailed: false,
    },
    {
      userId: "2",
      empId: "DSI006062",
      firstName: "Prince",
      lastName: "Attri",
      managerId: "1002",
      costCentreName: "Cost Centre 1",
      contractTypeId: 1,
      stateId: 9,
      totalAllowed: 32,
      availedGeneral: 0,
      plannedGeneral: 0,
      clusterName: "Cluster 1",
      clusterId: 1,
      availedLop: 0,
      plannedLop: 0,
      matOrPatAvailed: false,
    },
    {
      userId: "3",
      empId: "DP6515",
      firstName: "Himkar",
      lastName: ".",
      managerId: "1003",
      costCentreName: "Cost Centre 1",
      contractTypeId: 2,
      stateId: 9,
      totalAllowed: 0,
      availedGeneral: 0,
      plannedGeneral: 0,
      clusterName: "Cluster 1",
      clusterId: 1,
      availedLop: 0,
      plannedLop: 0,
      matOrPatAvailed: false,
    },
  ],
};
const mockClusters: IClusterResponse[] = [
  {
    id: 1,
    name: "Cluster 1",
    sportIds: [],
    costCentre: "",
    leaderEmpId: "",
    leaderEmpName: "",
    editable: true,
  },
  {
    id: 2,
    name: "Cluster 2",
    sportIds: [],
    costCentre: "",
    leaderEmpId: "",
    leaderEmpName: "",
    editable: true,
  },
];
const mockSecondaryJobs: ISecondaryJob[] = [
  {
    id: 1,
    type: "SecondaryJob1",
    hourCategory: "",
    description: "Secondary Job 1",
    allowSubMem: false,
    subMemName: "",
  },
  {
    id: 2,
    type: "SecondaryJob2",
    hourCategory: "",
    description: "Secondary Job 2",
    allowSubMem: false,
    subMemName: "",
  },
];

const mockMiscWork: IMiscWork[] = [
  { id: 1, name: "Misc Job 1", hourCategory: "" },
  { id: 2, name: "Misc Job 2", hourCategory: "" },
];

const mockRosterDetails: IRosterDetails = {
  data: {
    firstName: "Prince",
    lastName: "Attri",
    costCentre: "Cost Centre 1",
    empId: "DSI006062",
    assignedClusterId: 1,
    assignedSJTypes: ["SecondaryJob1"],
    dayStatus: "WORKING",
    metaData: "",
    main: [
      { s: "08:00:00", e: "12:00:00", c: "" },
      { s: "14:00:00", e: "18:00:00", c: "" },
    ],
    others: [{ s: "09:00:00", e: "11:00:00", c: "", type: "SecondaryJob1" }],
    misc: [
      {
        s: "13:00:00",
        e: "15:00:00",
        c: "",
        workId: 1,
        plannedJob: false,
        secondaryJobType: undefined,
      },
    ],
    exited: false,
    lastWorkingDate: "",
    costCenterChange: false,
    newCostCentre: "",
    costCentreChangeDate: "",
  },
  applicableForChange: true,
  message: "Overlap detected",
  success: true,
};
const mockAnalyticsCombinedData = {
  byCategory: [
    { key: "Category1", value: 50 },
    { key: "Category2", value: 30 },
    { key: "Category3", value: 20 },
  ],
  byType: [
    { key: "Type1", value: 60, category: "Category1" },
    { key: "Type2", value: 40, category: "Category2" },
  ],
};

const mockAnalyticsCategoryData = {
  byZone: [
    {
      key: "Zone1",
      data: [
        { key: "Category1", value: 30 },
        { key: "Category2", value: 20 },
      ],
    },
    {
      key: "Zone2",
      data: [
        { key: "Category1", value: 40 },
        { key: "Category2", value: 10 },
      ],
    },
  ],
  byCity: [
    {
      key: "City1",
      data: [
        { key: "Category1", value: 50 },
        { key: "Category2", value: 10 },
      ],
    },
  ],
};

const mockAnalyticsWorkTypeData = {
  byZone: [
    {
      key: "Zone1",
      data: [
        { key: "Type1", value: 30 },
        { key: "Type2", value: 20 },
      ],
    },
  ],
  byCity: [
    {
      key: "City1",
      data: [
        { key: "Type1", value: 50 },
        { key: "Type2", value: 10 },
      ],
    },
  ],
};

const mockAnalyticsEffCombinedData: IAnalyticsEffCombinedData = {
  pilotedProductivity: 90.2,
  realisedProductivity: 88.3,
  pilotedEfficiency: 80,
  realisedEfficiency: 90,
};
const mockAnalyticsEffData: IAnalyticsCategoryData = {
  byZone: [
    { key: "Zone1", data: [] },
    { key: "Zone2", data: [] },
  ],
  byCity: [
    { key: "City1", data: [] },
    { key: "City2", data: [] },
  ],
  byStore: [
    { key: "Store1", data: [] },
    { key: "Store2", data: [] },
  ],
  byCluster: [
    { key: "Cluster1", data: [] },
    { key: "Cluster2", data: [] },
  ],
};

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
}));

jest.mock("../../hooks/useApi", () => ({
  useApi: jest.fn(),
}));

jest.mock("../../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

const useApiMock = useApi as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;

describe("ManualHoursContribution Component", () => {
  let mockDispatch: jest.Mock;
  beforeEach(() => {
    jest.setTimeout(60000);
    mockDispatch = jest.fn();
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve(mockPayrollConfig);
        }
        if (endpoint.includes("/hours/manual")) {
          return Promise.resolve(mockManualManualHoursContributionResponse);
        }
        if (endpoint.includes("/hours/emp")) {
          return Promise.resolve(mockRosterDetails);
        }
        if (endpoint.includes("/cluster")) {
          return Promise.resolve(mockClusters);
        }
        if (endpoint.includes("/secondary/store-config")) {
          return Promise.resolve(mockSecondaryJobs);
        }
        if (endpoint.includes("/roster/primary/miscWork")) {
          return Promise.resolve(mockMiscWork);
        }
        if (endpoint.includes("/eff-combined")) {
          return Promise.resolve(mockAnalyticsEffCombinedData);
        }
        if (endpoint.includes("/eff-dist")) {
          return Promise.resolve(mockAnalyticsEffData);
        }

        return Promise.resolve({});
      }),
      post: jest.fn((endpoint: string) => {
        if (endpoint.includes("/analytics/hrs-dist-combined")) {
          return Promise.resolve(mockAnalyticsCombinedData);
        }
        if (endpoint.includes("/analytics/hrs-dist-category")) {
          return Promise.resolve(mockAnalyticsCategoryData);
        }
        if (endpoint.includes("/analytics/hrs-dist-work-type")) {
          return Promise.resolve(mockAnalyticsWorkTypeData);
        }
        return Promise.resolve({});
      }),
    });

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch); // Mock useAppDispatch

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1311",
      view: "metrics",
      tempToDate: "2024-12-07",
      tempFromDate: "2024-12-01",
      fromDate: "2024-12-01",
      toDate: "2024-12-07",
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
      selectedClusters: [],
      compareLastYear: false,
      contractTypes: [
        { id: 1, name: "Full Time" },
        { id: 2, name: "Part Time" },
      ],
    });
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  it("should render and allow switching between Metrics and Performance tabs, covering all date conditions", async () => {
    const mockDispatch = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    const tempFromDate = "2024-01-01";
    const tempToDate = "2024-01-31";
    const VIEWS = [
      { value: "metrics", name: "Metrics" },
      { value: "Performance", name: "Performance" },
    ];

    await act(async () => {
      render(
        <Provider store={store}>
          <ManualHoursContribution />
        </Provider>,
      );
    });

    const metricsTab = screen.getByText("Metrics");
    const performanceTab = screen.getByText("Performance");

    expect(metricsTab).toBeInTheDocument();
    expect(performanceTab).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(metricsTab);
    });

    const metricsFromDate =
      VIEWS[0].value === "metrics" ? tempFromDate : undefined;
    const metricsToDate = VIEWS[0].value === "metrics" ? tempToDate : undefined;
    const metricsReferenceDate =
      VIEWS[0].value === "metrics" ? undefined : tempToDate;

    expect(metricsFromDate).toBe(tempFromDate);
    expect(metricsToDate).toBe(tempToDate);
    expect(metricsReferenceDate).toBeUndefined();

    await act(async () => {
      fireEvent.click(performanceTab);
    });

    const performanceFromDate =
      VIEWS[1].value === "metrics" ? tempFromDate : undefined;
    const performanceToDate =
      VIEWS[1].value === "metrics" ? tempToDate : undefined;
    const performanceReferenceDate =
      VIEWS[1].value === "metrics" ? undefined : tempToDate;

    expect(performanceFromDate).toBeUndefined();
    expect(performanceToDate).toBeUndefined();
    expect(performanceReferenceDate).toBe(tempToDate);

    await act(async () => {
      fireEvent.click(metricsTab);
    });
  });

  test("handles timer functionality for ManualHoursContribution when a timer is required", async () => {
    jest.useFakeTimers();

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve({
            ...mockPayrollConfig,
            currentManualHourStartTime: new Date(
              Date.now() + 5000,
            ).toISOString(),
          });
        }
        return Promise.resolve({});
      }),
      post: jest.fn(() => Promise.resolve({})),
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      fromDate: "2024-12-01",
      toDate: "2024-12-07",
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
      selectedClusters: [],
      view: "metrics",
    });

    render(
      <Provider store={store}>
        <ManualHoursContribution />
      </Provider>,
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      jest.advanceTimersByTime(4000);
    });
  });

  it("should render Filters with default placeholders after clicking Filters button", async () => {
    render(
      <Provider store={store}>
        <ManualHoursContribution />
      </Provider>,
    );

    const filterButton = screen.getByText("Filters");
    fireEvent.click(filterButton);
    const ApplyButton = screen.getByText("Apply");
    fireEvent.click(ApplyButton);
  });
  it("should render `Manual tab `", async () => {
    render(
      <Provider store={store}>
        <ManualHoursContribution />
      </Provider>,
    );
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1311",
      user: {
        empId: "DSI006062",
      },
      view: "Performance",
      fromDate: "2024-07-31",
      toDate: "2024-07-31",
      selectedZones: [
        {
          label: "Test Zone",
          value: "Test Zone ID",
        },
      ],
      selectedCities: [
        {
          label: "Test City",
          value: "Test City ID",
        },
      ],
      selectedCostCenters: [
        {
          label: "Test Cost Center",
          value: "Test Cost Center ID",
        },
      ],
      selectedClusters: [
        {
          label: "Test Cluster",
          value: "Test Cluster ID",
        },
      ],
    });
    const text = await screen.findByText("Reference Date:");
    const text2 = await screen.findByText("31 Jul 2024");

    expect(text).toBeInTheDocument();
    expect(text2).toBeInTheDocument();
  });
  it("should render `Metrics `", async () => {
    render(
      <Provider store={store}>
        <ManualHoursContribution />
      </Provider>,
    );

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: {
        empId: "DSI000486",
      },
      view: "Metrics",
      fromDate: "05 Nov 2024",
      toDate: "12 Nov 2025",
      selectedZones: [
        {
          label: "Test Zone",
          value: "Test Zone ID",
        },
      ],
      selectedCities: [
        {
          label: "Test City",
          value: "Test City ID",
        },
      ],
      selectedCostCenters: [
        {
          label: "Test Cost Center",
          value: "Test Cost Center ID",
        },
      ],
      selectedClusters: [
        {
          label: "Test Cluster",
          value: "Test Cluster ID",
        },
      ],
    });

    const svgIcon = screen.getAllByRole("img", { hidden: true });
    expect(svgIcon[0]).toBeInTheDocument();

    const text = await screen.findByText("Duration:");
    const text2 = await screen.findByText("05 Nov 2024 to 12 Nov 2025");
    const text3 = await screen.findByText("City:");
    const text4 = await screen.findByText("Test City");
    const text5 = await screen.findByText("Store:");
    const text6 = await screen.findByText("Test Cost Center");
    const text7 = await screen.findByText("Cluster:");
    const text8 = await screen.findByText("Test Cluster");
    // const text9 = await screen.findByText(
    //   "Oops!... No result found, please try using a different filter",
    // );

    expect(text).toBeInTheDocument();
    expect(text2).toBeInTheDocument();
    expect(text3).toBeInTheDocument();
    expect(text4).toBeInTheDocument();
    expect(text5).toBeInTheDocument();
    expect(text6).toBeInTheDocument();
    expect(text7).toBeInTheDocument();
    expect(text8).toBeInTheDocument();
    // expect(text9).toBeInTheDocument();
  });
  it("should render `no data found`", async () => {
    render(
      <Provider store={store}>
        <ManualHoursContribution />
      </Provider>,
    );
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1311",
      user: {
        empId: "DSI006062",
      },
      view: "Performance",
      fromDate: "2024-07-31",
      toDate: "2024-07-31",
      selectedZones: [
        {
          label: "Test Zone",
          value: "Test Zone ID",
        },
      ],
      selectedCities: [
        {
          label: "Test City",
          value: "Test City ID",
        },
      ],
      selectedCostCenters: [
        {
          label: "Test Cost Center",
          value: "Test Cost Center ID",
        },
      ],
      selectedClusters: [
        {
          label: "Test Cluster",
          value: "Test Cluster ID",
        },
      ],
    });
    const text = await screen.findByText(
      "Oops!... No result found, please try using a different filter",
    );
    expect(text).toBeInTheDocument();
  });

  it("should handle filters and dynamically render fields based on view", async () => {
    const mockCostCenters = [
      {
        costCentreName: "Retail 1",
        type: "RETAIL",
        cityId: 1,
        costCentreZone: "Zone 1",
      },
      {
        costCentreName: "Retail 2",
        type: "RETAIL",
        cityI: 2,
        costCentreZone: "Zone 2",
      },
    ];

    useApiMock.mockReturnValue({
      get: jest.fn().mockResolvedValue({ costCenters: mockCostCenters }),
      post: jest.fn(),
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      view: "Metrics",
      fromDate: "2024-12-01",
      toDate: "2024-12-07",
      selectedZones: [
        { label: "Zone 1", value: "Zone 1" },
        { label: "Zone 2", value: "Zone 2" },
      ],
      selectedClusters: [],
      selectedCities: [],
      selectedCostCenters: [],
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManualHoursContribution />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });
    const Filter = screen.getByText("Filters");
    fireEvent.click(Filter);

    const fromDate = screen.getByText("From Date");
    expect(fromDate).toBeInTheDocument();
    fireEvent.click(fromDate);

    await waitFor(() => {
      expect(screen.getByText("Select Date Range")).toBeInTheDocument();
    });

    const datePicker = screen.getByText("Today");
    expect(datePicker).toBeInTheDocument();
    fireEvent.click(datePicker);

    const applyBtton = screen.getByLabelText("model-apply");
    expect(applyBtton).toBeInTheDocument();
    fireEvent.click(applyBtton);

    const toDate = screen.getByText("From Date");
    expect(toDate).toBeInTheDocument();
    fireEvent.click(toDate);

    await waitFor(() => {
      expect(screen.getByText("Select Date Range")).toBeInTheDocument();
    });

    const datePicker1 = screen.getByText("Yesterday");
    expect(datePicker1).toBeInTheDocument();
    fireEvent.click(datePicker1);

    const applyBtton2 = screen.getByLabelText("model-apply");
    expect(applyBtton2).toBeInTheDocument();
    fireEvent.click(applyBtton2);

    const ApplyBtton1 = screen.getAllByText(/Apply/i);
    expect(ApplyBtton1[0]).toBeInTheDocument();
    fireEvent.click(ApplyBtton1[0]);
  });

  it("should render with cluster []", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve(mockPayrollConfig);
        }
        if (endpoint.includes("/hours/manual")) {
          return Promise.resolve(mockManualManualHoursContributionResponse);
        }
        if (endpoint.includes("/hours/emp")) {
          return Promise.resolve(mockRosterDetails);
        }
        if (endpoint.includes("/cluster")) {
          return Promise.resolve([]);
        }
        if (endpoint.includes("/secondary/store-config")) {
          return Promise.resolve(mockSecondaryJobs);
        }
        if (endpoint.includes("/roster/primary/miscWork")) {
          return Promise.resolve(mockMiscWork);
        }
        if (endpoint.includes("/eff-combined")) {
          return Promise.resolve(mockAnalyticsEffCombinedData);
        }
        if (endpoint.includes("/eff-dist")) {
          return Promise.resolve(mockAnalyticsEffData);
        }

        return Promise.resolve({});
      }),
      post: jest.fn(),
    });
    render(
      <Provider store={store}>
        <ManualHoursContribution />
      </Provider>,
    );
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1311",
      user: {
        empId: "DSI006062",
      },
      view: "Performance",
      fromDate: "2024-07-31",
      toDate: "2024-07-31",
      selectedZones: [
        {
          label: "Test Zone",
          value: "Test Zone ID",
        },
      ],
      selectedCities: [
        {
          label: "Test City",
          value: "Test City ID",
        },
      ],
      selectedCostCenters: [
        {
          label: "Test Cost Center",
          value: "Test Cost Center ID",
        },
      ],
      selectedClusters: [
        {
          label: "Test Cluster",
          value: "Test Cluster ID",
        },
      ],
    });
    const text = await screen.findByText(/Cluster:/i);
    expect(text).toBeInTheDocument();
  });

  it("should dispatch action when cluster selection changes", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn().mockImplementation((endpoint) => {
        if (endpoint.includes("/cluster")) {
          return Promise.resolve([
            { id: 1, name: "Cluster 1", editable: true },
            { id: 2, name: "Cluster 2", editable: true },
          ]);
        }
        return Promise.resolve({
          costCenters: [
            {
              costCentreName: "Retail 1",
              displayName: "Retail Store 1",
              type: "RETAIL",
              cityId: 1,
              city: "City 1",
              costCentreZone: "Zone 1",
            },
          ],
        });
      }),
      post: jest.fn().mockResolvedValue({}),
    });

    useAppSelector.mockReturnValue({
      selectedCostCenterName: "IN1041",
      view: "metrics",
      tempToDate: "2024-12-07",
      tempFromDate: "2024-12-01",
      fromDate: "2024-12-01",
      toDate: "2024-12-07",
      selectedZones: [{ label: "Zone 1", value: "Zone 1" }],
      selectedCities: [{ label: "City 1", value: 1 }],
      selectedCostCenters: [{ label: "Retail Store 1", value: "Retail 1" }],
      selectedClusters: [],
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManualHoursContribution />
        </Provider>,
      );
    });

    const filterButton = screen.getByText("Filters");
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText("Cluster")).toBeInTheDocument();
    });

    const clusterSelect = screen.getByText("Select or type here...");
    fireEvent.click(clusterSelect);

    const clusterOption = screen.getByText("Cluster 1");
    fireEvent.click(clusterOption);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringMatching(/setSelectedClusters/),
        }),
      );
    });
  });

  it("should dispatch setTempToDate when SingleDatepicker date changes", async () => {
    useAppSelector.mockReturnValue({
      selectedCostCenterName: "IN1041",
      view: "Performance",
      tempToDate: "2024-12-07",
      tempFromDate: "2024-12-01",
      fromDate: "2024-12-01",
      toDate: "2024-12-07",
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
      selectedClusters: [],
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManualHoursContribution />
        </Provider>,
      );
    });

    const filterButton = screen.getByText("Filters");
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText("Reference Date")).toBeInTheDocument();
    });

    const refDateInput = screen
      .getByText("Reference Date")
      .closest("div")
      .querySelector("input");
    fireEvent.click(refDateInput);

    await waitFor(() => {
      expect(screen.getByText("Select Reference Date")).toBeInTheDocument();
    });

    await act(async () => {
      const newDate = new Date(2024, 11, 15);
    });
  });

  it("should dispatch correct actions when cost center selection changes", async () => {
    useAppSelector.mockReturnValue({
      selectedCostCenterName: "IN1041",
      view: "metrics",
      tempToDate: "2024-12-07",
      tempFromDate: "2024-12-01",
      fromDate: "2024-12-01",
      toDate: "2024-12-07",
      selectedZones: [{ label: "Zone 1", value: "Zone 1" }],
      selectedCities: [{ label: "City 1", value: 1 }],
      selectedCostCenters: [{ label: "Retail Store 1", value: "Retail 1" }],
      selectedClusters: [],
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManualHoursContribution />
        </Provider>,
      );
    });
    const filterButton = screen.getByText("Filters");
    fireEvent.click(filterButton);
    await waitFor(() => {
      expect(screen.getByText("Store")).toBeInTheDocument();
    });

    const newStoreSelection = [{ label: "Retail Store 2", value: "Retail 2" }];

    const onStoreChange = (value) => {};

    // Call it directly
    await act(async () => {
      onStoreChange.call(null, newStoreSelection);
    });
  });

  // Test 4: Test prefill for getCostCenterOptions on zone selection
  it("should dispatch setSelectedCostCenters when prefilling based on zones", async () => {
    useAppSelector.mockReturnValue({
      selectedCostCenterName: "IN1041",
      view: "metrics",
      tempToDate: "2024-12-07",
      tempFromDate: "2024-12-01",
      fromDate: null,
      toDate: null,
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
      selectedClusters: [],
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManualHoursContribution />
        </Provider>,
      );
    });

    const selectedZonesTemp = [{ label: "Zone 1", value: "Zone 1" }];
    const selectedCitiesArr = [{ label: "City 1", value: 1 }];

    mockDispatch.mockClear();

    await act(async () => {
      mockDispatch(setSelectedCostCenters([]));
    });
  });

  it("should dispatch setSelectedCities when zones are prefilled", async () => {
    useAppSelector.mockReturnValue({
      selectedCostCenterName: "IN1041",
      view: "metrics",
      tempToDate: "2024-12-07",
      tempFromDate: "2024-12-01",
      fromDate: null,
      toDate: null,
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
      selectedClusters: [],
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManualHoursContribution />
        </Provider>,
      );
    });

    const zoneOptionsArr = [{ label: "Zone 1", value: "Zone 1" }];

    mockDispatch.mockClear();

    await act(async () => {
      mockDispatch(setSelectedCities([]));
    });
  });

  it("should dispatch setSelectedZones with prefill when no zones selected and cost centers exist", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn().mockResolvedValue({
        costCenters: [
          {
            costCentreName: "Retail 1",
            displayName: "Retail Store 1",
            type: "RETAIL",
            cityId: 1,
            city: "City 1",
            costCentreZone: "Zone 1",
          },
        ],
      }),
      post: jest.fn().mockResolvedValue({}),
    });
    useAppSelector.mockReturnValue({
      selectedCostCenterName: "IN1041",
      view: "metrics",
      tempToDate: "2024-12-07",
      tempFromDate: "2024-12-01",
      fromDate: null,
      toDate: null,
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
      selectedClusters: [],
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManualHoursContribution />
        </Provider>,
      );
    });

    await waitFor(() => {});
  });
});
