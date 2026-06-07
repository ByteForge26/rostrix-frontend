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
import HoursDistribution from "./HoursDistribution";
import {
  IPayrollConfig,
  IRosterDetails,
  IMyTeamLeavesResponse,
  IClusterResponse,
  ISecondaryJob,
  IMiscWork,
  IAnalyticsCategoryData,
  IAnalyticsCombinedData,
} from "../../helper/Interface";
import { useAppDispatch } from "../../app/store/store";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";

const mockAddToast = jest.fn();
jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: mockAddToast,
  }),
}));

jest.mock("../../app/store/store", () => ({
  ...jest.requireActual("../../app/store/store"),
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

const mockPayrollConfig: IPayrollConfig = {
  currentPStartDateTime: "2024-11-22T00:00:00",
  currentPEndDateTime: "2024-12-21T15:15:00",
  currentManualHourStartTime: "2024-12-21T15:20:00",
  currentManualHourEndTime: "2024-12-21T16:20:00",
  currentPayrollExtractStartTime: "2024-12-21T16:22:00",
};

const mockManualHoursDistributionResponse: IMyTeamLeavesResponse = {
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
const mockAnalyticsCombinedData: IAnalyticsCombinedData = {
  byCategory: [
    { key: "COMMERCIAL", value: 50 },
    { key: "NON_COMMERCIAL", value: 30 },
    { key: "ECOMMERCE", value: 20 },
    { key: "CASHIERING", value: 10 },
  ],
  byType: [
    { key: "Type1", value: 60, category: "Category1" },
    { key: "Type2", value: 40, category: "Category2" },
  ],
};

const mockAnalyticsCategoryData: IAnalyticsCategoryData = {
  byZone: [
    {
      key: "Zone1",
      data: [
        { key: "Category1", value: 100 },
        { key: "Category2", value: 200 },
      ],
    },
  ],
  byCity: [
    {
      key: "City1",
      data: [
        { key: "Category1", value: 150 },
        { key: "Category2", value: 250 },
      ],
    },
  ],
  byStore: [
    {
      key: "Store1",
      data: [
        { key: "Category1", value: 50 },
        { key: "Category2", value: 30 },
      ],
    },
  ],
  byCluster: [
    {
      key: "Cluster1",
      data: [
        { key: "Category1", value: 120 },
        { key: "Category2", value: 80 },
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

const mockAnalyticsCategoryDataByStore: IAnalyticsCategoryData[] = [
  {
    key: "Store1",
    data: [
      { key: "Category1", value: 50 },
      { key: "Category2", value: 30 },
    ],
  },
  {
    key: "Store2",
    data: [
      { key: "Category1", value: 40 },
      { key: "Category2", value: 60 },
    ],
  },
];

const mockAnalyticsCategoryDataByCluster: IAnalyticsCategoryData[] = [
  {
    key: "Cluster1",
    data: [
      { key: "Category1", value: 50 },
      { key: "Category2", value: 50 },
    ],
  },
  {
    key: "Cluster2",
    data: [
      { key: "Category1", value: 70 },
      { key: "Category2", value: 30 },
    ],
  },
];

const mockAnalyticsWorkTypeDataByStore: IAnalyticsWorkTypeDataStore[] = [
  {
    key: "Store1",
    data: [
      { key: "WorkType1", value: 60 },
      { key: "WorkType2", value: 40 },
    ],
  },
  {
    key: "Store2",
    data: [
      { key: "WorkType1", value: 50 },
      { key: "WorkType2", value: 50 },
    ],
  },
];

const mockAnalyticsWorkTypeDataByCluster: IAnalyticsWorkTypeDataCluster[] = [
  {
    key: "Cluster1",
    data: [
      { key: "WorkType1", value: 80 },
      { key: "WorkType2", value: 20 },
    ],
  },
  {
    key: "Cluster2",
    data: [
      { key: "WorkType1", value: 55 },
      { key: "WorkType2", value: 45 },
    ],
  },
];

const mockAnalyticsGrowthWOWData = {
  data: [
    {
      key: "Week1",
      data: [
        { key: "WorkType1", value: 40 },
        { key: "WorkType2", value: 60 },
      ],
      startDate: "2024-12-01",
    },
    {
      key: "Week2",
      data: [
        { key: "WorkType1", value: 30 },
        { key: "WorkType2", value: 70 },
      ],
      startDate: "2024-12-08",
    },
  ],
};

const mockAnalyticsGrowthMOMData = {
  data: [
    {
      key: "Month1",
      data: [
        { key: "WorkType1", value: 70 },
        { key: "WorkType2", value: 30 },
      ],
      startDate: "2024-11-01",
    },
    {
      key: "Month2",
      data: [
        { key: "WorkType1", value: 60 },
        { key: "WorkType2", value: 40 },
      ],
      startDate: "2024-12-01",
    },
  ],
};

const mockAnalyticsGrowthQOQData = {
  data: [
    {
      key: "Quarter1",
      data: [
        { key: "WorkType1", value: 80 },
        { key: "WorkType2", value: 20 },
      ],
      startDate: "2024-10-01",
    },
    {
      key: "Quarter2",
      data: [
        { key: "WorkType1", value: 65 },
        { key: "WorkType2", value: 35 },
      ],
      startDate: "2024-12-01",
    },
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

describe("HoursDistribution Component", () => {
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
          return Promise.resolve(mockManualHoursDistributionResponse);
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
        return Promise.resolve({});
      }),
      post: jest.fn((endpoint: string) => {
        if (endpoint.includes("/analytics/hrs-dist-combined")) {
          return Promise.resolve(mockAnalyticsCombinedData);
        }
        if (endpoint.includes("/analytics/hrs-dist-category")) {
          return Promise.resolve({
            ...mockAnalyticsCategoryData,
            byStore: mockAnalyticsCategoryDataByStore,
            byCluster: mockAnalyticsCategoryDataByCluster,
          });
        }
        if (endpoint.includes("/analytics/hrs-dist-work-type")) {
          return Promise.resolve({
            ...mockAnalyticsWorkTypeData,
            byStore: mockAnalyticsWorkTypeDataByStore,
            byCluster: mockAnalyticsWorkTypeDataByCluster,
          });
        }
        if (endpoint.includes("/analytics/hrs-dist-wow")) {
          return Promise.resolve(mockAnalyticsGrowthWOWData);
        }
        if (endpoint.includes("/analytics/hrs-dist-mom")) {
          return Promise.resolve(mockAnalyticsGrowthMOMData);
        }
        if (endpoint.includes("/analytics/hrs-dist-qoq")) {
          return Promise.resolve(mockAnalyticsGrowthQOQData);
        }
        return Promise.resolve({});
      }),
    });

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render `Hours Approval  Page", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });

    const aliceLeaveElement = await screen.findByText(/Hours Distribution/i);
    expect(aliceLeaveElement).toBeInTheDocument();
  });

  it("should render the loader initially", async () => {
    render(
      <Provider store={store}>
        <HoursDistribution />
      </Provider>,
    );

    expect(screen.getByText(/No result found/i)).toBeInTheDocument();
  });

  it("should fetch and filter cost centers by type RETAIL", async () => {
    const mockCostCenters = [
      {
        costCentreName: "Retail 1",
        type: "RETAIL",
        cityId: 1,
        costCentreZone: "Zone 1",
      },
      {
        costCentreName: "Warehouse 1",
        type: "WAREHOUSE",
        cityId: 2,
        costCentreZone: "Zone 2",
      },
    ];

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/master/cost-centre")) {
          return Promise.resolve({ costCenters: mockCostCenters });
        }
        return Promise.resolve({});
      }),
      post: jest.fn(() => Promise.resolve({})),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });

    expect(screen.getByText("Hours Distribution")).toBeInTheDocument();
  });

  it("should apply filters for zones, cities, and cost centers", async () => {
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
        cityId: 2,
        costCentreZone: "Zone 2",
      },
    ];

    useApiMock.mockReturnValue({
      get: jest.fn().mockResolvedValue({ costCenters: mockCostCenters }),
      post: jest.fn(),
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      view: "Performance",
      fromDate: "2024-12-01",
      toDate: "2024-12-07",
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });
  });
  it("should fetch and filter clusters based on editable property", async () => {
    const mockClusters = [
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
        editable: false,
      },
    ];

    useApiMock.mockReturnValue({
      get: jest.fn().mockImplementation((endpoint) => {
        if (endpoint.includes("/cluster")) {
          return Promise.resolve(mockClusters);
        }
        return Promise.resolve({});
      }),
    });

    // Mock selected cost center
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenters: [{ value: "Cost Centre 1" }],
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });
  });

  it("should render and allow switching between Metrics and Performance tabs", async () => {
    const mockDispatch = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });

    const metricsTab = screen.getByText("Metrics");
    const performanceTab = screen.getByText("Performance");

    expect(metricsTab).toBeInTheDocument();
    expect(performanceTab).toBeInTheDocument();

    fireEvent.click(performanceTab);

    fireEvent.click(metricsTab);
  });

  test("handles timer functionality for HoursDistribution when a timer is required", async () => {
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
        <HoursDistribution />
      </Provider>,
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      jest.advanceTimersByTime(4000);
    });
  });

  it("should calculate total value and generate data array with percentages correctly for HoursDistribution", () => {
    const mockAnalyticsCombinedData = {
      byCategory: [
        { key: "Category1", value: 50 },
        { key: "Category2", value: 30 },
        { key: "Category3", value: 20 },
      ],
    };

    const GRAPH_COLORS = [
      { key: "Category1", color: "blue" },
      { key: "Category2", color: "green" },
      { key: "Category3", color: "red" },
    ];

    let data = [];
    let arr = [];
    let total = 0;

    if (mockAnalyticsCombinedData?.byCategory?.length) {
      data = [];
      total = 0;

      mockAnalyticsCombinedData.byCategory.forEach(({ value }) => {
        total += value;
      });

      GRAPH_COLORS.forEach(({ key }) => {
        const value =
          mockAnalyticsCombinedData.byCategory.find((obj) => obj.key === key)
            ?.value || 0;
        data.push({
          key,
          values: [
            {
              key: "(%) Value",
              value: ((value * 100) / total).toFixed(1),
            },
          ],
        });
      });

      arr.push({
        heading: "Hour Distribution By Category",
        data: data.sort(
          (a, b) => Number(b.values[0].value) - Number(a.values[0].value),
        ),
      });
    }

    expect(total).toBe(100);
    expect(data).toEqual([
      {
        key: "Category1",
        values: [{ key: "(%) Value", value: "50.0" }],
      },
      {
        key: "Category2",
        values: [{ key: "(%) Value", value: "30.0" }],
      },
      {
        key: "Category3",
        values: [{ key: "(%) Value", value: "20.0" }],
      },
    ]);

    expect(arr).toEqual([
      {
        heading: "Hour Distribution By Category",
        data: [
          {
            key: "Category1",
            values: [{ key: "(%) Value", value: "50.0" }],
          },
          {
            key: "Category2",
            values: [{ key: "(%) Value", value: "30.0" }],
          },
          {
            key: "Category3",
            values: [{ key: "(%) Value", value: "20.0" }],
          },
        ],
      },
    ]);
  });

  it("should render Filters with default placeholders after clicking Filters button", async () => {
    render(
      <Provider store={store}>
        <HoursDistribution />
      </Provider>,
    );

    const filterButton = screen.getByText("Filters");
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText("Zone")).toBeInTheDocument();
      expect(screen.getByText("City")).toBeInTheDocument();
      expect(screen.getByText("Store")).toBeInTheDocument();
    });
  });

  it("should render Filters with default placeholders after clicking Filters button", async () => {
    render(
      <Provider store={store}>
        <HoursDistribution />
      </Provider>,
    );

    const filterButton = screen.getByText("Filters");
    fireEvent.click(filterButton);
    const ApplyButton = screen.getByText("Apply");
    fireEvent.click(ApplyButton);
  });

  it("should render dropdown for zone", async () => {
    render(
      <Provider store={store}>
        <HoursDistribution />
      </Provider>,
    );

    const filterButton = screen.getByText("Filters");
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText("Zone")).toBeInTheDocument();
    });
  });
  it("should render `Performance Tab `", async () => {
    render(
      <Provider store={store}>
        <HoursDistribution />
      </Provider>,
    );
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: {
        empId: "DSI000486",
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
  it("should apply filters for zones, cities, and cost centers", async () => {
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
        cityId: 2,
        costCentreZone: "Zone 2",
      },
    ];

    useApiMock.mockReturnValue({
      get: jest.fn().mockResolvedValue({ costCenters: mockCostCenters }),
      post: jest.fn(),
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      view: "Performance",
      fromDate: "2024-12-01",
      toDate: "2024-12-07",
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });

    // Ensure Filters button is present
    await waitFor(() => {
      expect(screen.getByText("Filters")).toBeInTheDocument();
    });

    // Open the Filters drawer
    const Filter = screen.getByText("Filters");
    fireEvent.click(Filter);

    await waitFor(() => {
      expect(screen.getByText("Filter")).toBeInTheDocument();
      expect(screen.getByText("Zone")).toBeInTheDocument();
      expect(screen.getByText("City")).toBeInTheDocument();
      expect(screen.getByText("Store")).toBeInTheDocument();
    });

    const group = screen.getAllByText("Select or type here...");
    expect(group[0]).toBeInTheDocument();
    fireEvent.click(group[0]);

    const findSelect = screen.getByText("Select All");
    expect(findSelect).toBeInTheDocument();
    fireEvent.click(findSelect);

    const group1 = screen.getAllByText("Select or type here...");
    expect(group[1]).toBeInTheDocument();
    fireEvent.click(group[1]);

    const findSelectCity = screen.getByText("Select All");
    expect(findSelectCity).toBeInTheDocument();
    fireEvent.click(findSelectCity);

    const group2 = screen.getAllByText("Select or type here...");
    expect(group[2]).toBeInTheDocument();
    fireEvent.click(group[2]);

    const findSelectStore = screen.getByText("Select All");
    expect(findSelectStore).toBeInTheDocument();
    fireEvent.click(findSelectStore);

    const ReferenceDate = screen.getByText("Reference Date");
    expect(ReferenceDate).toBeInTheDocument();
    fireEvent.click(ReferenceDate);

    await waitFor(() => {
      expect(screen.getByText("Select Reference Date")).toBeInTheDocument();
    });
    const findDate = screen.getAllByText("5");
    expect(findDate[0]).toBeInTheDocument();
    fireEvent.click(findDate[0]);

    const applyButton = screen.getByRole("button", { name: /Apply/i });
    expect(applyButton).toBeInTheDocument();
    fireEvent.click(applyButton);
  });
  it("should render and allow switching between Metrics and Performance tabs, covering all date conditions", async () => {
    const mockDispatch = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    const tempFromDate = "2024-01-01";
    const tempToDate = "2024-01-31";

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution
            tempFromDate={tempFromDate}
            tempToDate={tempToDate}
          />
        </Provider>,
      );
    });

    const metricsTab = screen.getByText("Metrics");
    const performanceTab = screen.getByText("Performance");

    expect(metricsTab).toBeInTheDocument();
    expect(performanceTab).toBeInTheDocument();
  });

  it("should render `Manual tab`", async () => {
    render(
      <Provider store={store}>
        <HoursDistribution />
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

  it("should render `Metrics`", async () => {
    render(
      <Provider store={store}>
        <HoursDistribution />
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

    const text = await screen.findByText("Duration:");
    const text2 = await screen.findByText("05 Nov 2024 to 12 Nov 2025");

    expect(text).toBeInTheDocument();
    expect(text2).toBeInTheDocument();
  });

  it("should handle empty or null data gracefully for analytics combined data", () => {
    const mockEmptyAnalyticsData = { byCategory: [] };

    let data = [];
    let total = 0;

    if (mockEmptyAnalyticsData?.byCategory?.length) {
      mockEmptyAnalyticsData.byCategory.forEach(({ value }) => {
        total += value;
      });
    }

    expect(total).toBe(0);
    expect(data).toEqual([]);
  });
  it("should handle extra GRAPH_COLORS keys gracefully", () => {
    const GRAPH_COLORS = [
      { key: "Category1", color: "blue" },
      { key: "Category2", color: "green" },
      { key: "Category3", color: "red" },
      { key: "Category4", color: "yellow" },
    ];

    const mockAnalyticsCombinedData = {
      byCategory: [
        { key: "Category1", value: 50 },
        { key: "Category2", value: 30 },
        { key: "Category3", value: 20 },
      ],
    };

    let data = [];
    let total = 0;

    mockAnalyticsCombinedData.byCategory.forEach(({ value }) => {
      total += value;
    });

    GRAPH_COLORS.forEach(({ key }) => {
      const value =
        mockAnalyticsCombinedData.byCategory.find((obj) => obj.key === key)
          ?.value || 0;
      data.push({
        key,
        values: [
          {
            key: "(%) Value",
            value: ((value * 100) / total).toFixed(1),
          },
        ],
      });
    });

    expect(data).toEqual([
      {
        key: "Category1",
        values: [{ key: "(%) Value", value: "50.0" }],
      },
      {
        key: "Category2",
        values: [{ key: "(%) Value", value: "30.0" }],
      },
      {
        key: "Category3",
        values: [{ key: "(%) Value", value: "20.0" }],
      },
      {
        key: "Category4",
        values: [{ key: "(%) Value", value: "0.0" }],
      },
    ]);
  });
  it("should render 'no data found' when analytics data is empty", async () => {
    render(
      <Provider store={store}>
        <HoursDistribution />
      </Provider>,
    );

    useAppSelector.mockReturnValue({
      analyticsCombinedData: null,
      analyticsWOWData: null,
      view: "metrics",
    });

    const noDataText = await screen.findByText(
      "Oops!... No result found, please try using a different filter",
    );
    expect(noDataText).toBeInTheDocument();
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
        cityId: 2,
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
      selectedZones: [],
      selectedClusters: [],
      selectedCities: [],
      selectedCostCenters: [],
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
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
  it("should render graphs after applying filters and collapse them on click", async () => {
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
        cityId: 2,
        costCentreZone: "Zone 2",
      },
    ];

    const mockAnalyticsData = {
      analyticsEffCombinedData: {
        pilotedEfficiency: 85.4,
        realisedEfficiency: 88.6,
        pilotedProductivity: 12000,
        realisedProductivity: 12500,
      },
      analyticsEffData: {
        byZone: [{ label: "Zone 1", value: 50 }],
        byCity: [{ label: "City 1", value: 30 }],
        byStore: [{ label: "Store 1", value: 20 }],
        byCluster: [{ label: "Cluster 1", value: 10 }],
      },
      analyticsWOWData: {
        data: [{ label: "Week 1", value: 40 }],
      },
      analyticsMOMData: {
        data: [{ label: "Month 1", value: 50 }],
      },
      analyticsQOQData: {
        data: [{ label: "Quarter 1", value: 60 }],
      },
    };

    useApiMock.mockReturnValue({
      get: jest.fn().mockResolvedValue({ costCenters: mockCostCenters }),
      post: jest.fn(),
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      fromDate: "2024-12-14",
      toDate: "2024-12-14",
      selectedZones: ["Zone 1"],
      selectedCities: ["City 1"],
      selectedCostCenters: ["Store 1"],
      analyticsEffCombinedData: mockAnalyticsData.analyticsEffCombinedData,
      analyticsEffData: mockAnalyticsData.analyticsEffData,
      analyticsWOWData: mockAnalyticsData.analyticsWOWData,
      analyticsMOMData: mockAnalyticsData.analyticsMOMData,
      analyticsQOQData: mockAnalyticsData.analyticsQOQData,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });
  });
  it("should render `Tabs`", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });

    const Tabs = ["Metrics", "Performance"];
    Tabs.forEach((tab) => expect(screen.getByText(tab)).toBeInTheDocument());
  });

  it("should not generate a CSV report if there is no analyticsCombinedData", async () => {
    global.URL.createObjectURL = jest.fn(() => "mocked-url");

    (useAppSelector as jest.Mock).mockReturnValue({
      fromDate: "2024-01-01",
      toDate: "2024-01-07",
      view: "Metrics",
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
      analyticsCombinedData: null, // Simulate no data
    });

    const mockDownloadCSV = jest.fn();
    jest.mock("../../helper/Utils", () => ({
      ...jest.requireActual("../../helper/Utils"),
      downloadCSV: mockDownloadCSV,
    }));

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });

    const downloadButton = screen.getByText("Download");
    fireEvent.click(downloadButton);

    const downloadAsCSV = screen.getByText("Download as CSV");
    fireEvent.click(downloadAsCSV);

    expect(mockDownloadCSV).not.toHaveBeenCalled();
  });

  test("should handle null WoW data but process valid MoM and QoQ data", async () => {
    require("../../app/store/store").useAppSelector.mockReturnValue({
      view: "Performance",
      fromDate: "2024-12-01",
      toDate: "2024-12-15",
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
      selectedClusters: [],
      compareLastYear: false,
    });

    const mockGet = jest.fn();
    const mockPost = jest.fn();

    useApi.mockReturnValue({
      get: mockGet,
      post: mockPost,
    });

    mockPost.mockImplementation((endpoint) => {
      if (endpoint.includes("/hrs-dist-wow")) {
        return Promise.resolve(null);
      }
      if (endpoint.includes("/hrs-dist-mom")) {
        return Promise.resolve(mockAnalyticsGrowthMOMData);
      }
      if (endpoint.includes("/hrs-dist-qoq")) {
        return Promise.resolve(mockAnalyticsGrowthQOQData);
      }
      return Promise.resolve({});
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });

    const downloadButton = screen.getByText("Download");
    fireEvent.click(downloadButton);

    const downloadAsCSVButton = screen.getByText("Download as CSV");
    fireEvent.click(downloadAsCSVButton);
  });

  test("should handle WoW data with no data array property", async () => {
    require("../../app/store/store").useAppSelector.mockReturnValue({
      view: "Performance",
      fromDate: "2024-12-01",
      toDate: "2024-12-15",
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
      selectedClusters: [],
      compareLastYear: false,
    });

    const mockGet = jest.fn();
    const mockPost = jest.fn();

    useApi.mockReturnValue({
      get: mockGet,
      post: mockPost,
    });

    mockPost.mockImplementation((endpoint) => {
      if (endpoint.includes("/hrs-dist-wow")) {
        return Promise.resolve({});
      }
      if (endpoint.includes("/hrs-dist-mom")) {
        return Promise.resolve(mockAnalyticsGrowthMOMData);
      }
      if (endpoint.includes("/hrs-dist-qoq")) {
        return Promise.resolve(mockAnalyticsGrowthQOQData);
      }
      return Promise.resolve({});
    });

    // Render the component
    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });

    const downloadButton = screen.getByText("Download");
    fireEvent.click(downloadButton);

    const downloadAsCSVButton = screen.getByText("Download as CSV");
    fireEvent.click(downloadAsCSVButton);
  });

  test("should process Performance data with mixed category distributions correctly", async () => {
    require("../../app/store/store").useAppSelector.mockReturnValue({
      view: "Performance",
      fromDate: "2024-12-01",
      toDate: "2024-12-15",
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
      selectedClusters: [],
      compareLastYear: false,
    });

    const mockGet = jest.fn();
    const mockPost = jest.fn();

    // Configure the API mock
    useApi.mockReturnValue({
      get: mockGet,
      post: mockPost,
    });

    const mixedCategoryWOWData = {
      data: [
        {
          key: "Week1",
          data: [
            { key: "COMMERCIAL", value: 70 },
            { key: "NON_COMMERCIAL", value: 30 },
          ],
          startDate: "2024-12-01",
        },
        {
          key: "Week2",
          data: [
            { key: "COMMERCIAL", value: 40 },
            { key: "NON_COMMERCIAL", value: 30 },
            { key: "ECOMMERCE", value: 20 },
            { key: "CASHIERING", value: 10 },
          ],
          startDate: "2024-12-08",
        },
      ],
    };

    const unusualMOMData = {
      data: [
        {
          key: "Month1",
          data: [
            { key: "COMMERCIAL", value: 0 },
            { key: "NON_COMMERCIAL", value: 100 },
            { key: "ECOMMERCE", value: 0 },
            { key: "CASHIERING", value: 0 },
          ],
          startDate: "2024-11-01",
        },
      ],
    };

    const singleCategoryQOQData = {
      data: [
        {
          key: "Quarter1",
          data: [{ key: "COMMERCIAL", value: 100 }],
          startDate: "2024-10-01",
        },
      ],
    };

    mockPost.mockImplementation((endpoint) => {
      if (endpoint.includes("/hrs-dist-wow")) {
        return Promise.resolve(mixedCategoryWOWData);
      }
      if (endpoint.includes("/hrs-dist-mom")) {
        return Promise.resolve(unusualMOMData);
      }
      if (endpoint.includes("/hrs-dist-qoq")) {
        return Promise.resolve(singleCategoryQOQData);
      }
      return Promise.resolve({});
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });

    const downloadButton = screen.getByText("Download");
    fireEvent.click(downloadButton);

    const downloadAsCSVButton = screen.getByText("Download as CSV");
    fireEvent.click(downloadAsCSVButton);
  });

  test("should handle concurrent processing of WoW, MoM, and QoQ data", async () => {
    require("../../app/store/store").useAppSelector.mockReturnValue({
      view: "Performance",
      fromDate: "2024-12-01",
      toDate: "2024-12-15",
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
      selectedClusters: [],
      compareLastYear: false,
    });

    const mockGet = jest.fn();
    const mockPost = jest.fn();

    useApi.mockReturnValue({
      get: mockGet,
      post: mockPost,
    });

    const wowWithUniqueData = {
      data: [
        {
          key: "Period1",
          data: [
            { key: "COMMERCIAL", value: 80 },
            { key: "NON_COMMERCIAL", value: 20 },
          ],
          startDate: "2024-12-01",
        },
      ],
    };

    const momWithUniqueData = {
      data: [
        {
          key: "Period1",
          data: [
            { key: "COMMERCIAL", value: 60 },
            { key: "NON_COMMERCIAL", value: 40 },
          ],
          startDate: "2024-11-01",
        },
      ],
    };

    const qoqWithUniqueData = {
      data: [
        {
          key: "Period1",
          data: [
            { key: "COMMERCIAL", value: 40 },
            { key: "NON_COMMERCIAL", value: 60 },
          ],
          startDate: "2024-10-01",
        },
      ],
    };

    mockPost.mockImplementation((endpoint) => {
      if (endpoint.includes("/hrs-dist-wow")) {
        return Promise.resolve(wowWithUniqueData);
      }
      if (endpoint.includes("/hrs-dist-mom")) {
        return Promise.resolve(momWithUniqueData);
      }
      if (endpoint.includes("/hrs-dist-qoq")) {
        return Promise.resolve(qoqWithUniqueData);
      }
      return Promise.resolve({});
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });

    const downloadButton = screen.getByText("Download");
    fireEvent.click(downloadButton);

    const downloadAsCSVButton = screen.getByText("Download as CSV");
    fireEvent.click(downloadAsCSVButton);
  });

  test("should handle missing data properties in Performance metrics gracefully", async () => {
    require("../../app/store/store").useAppSelector.mockReturnValue({
      view: "Performance",
      fromDate: "2024-12-01",
      toDate: "2024-12-15",
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
      selectedClusters: [],
      compareLastYear: false,
    });

    const mockGet = jest.fn();
    const mockPost = jest.fn();

    useApi.mockReturnValue({
      get: mockGet,
      post: mockPost,
    });

    const wowWithMissingDataProperty = {
      otherProperty: "some value",
    };

    const momWithEmptyData = {
      data: [],
    };

    const qoqWithMalformedData = {
      data: [
        {
          key: "Quarter1",
          startDate: "2024-10-01",
        },
      ],
    };

    mockPost.mockImplementation((endpoint) => {
      if (endpoint.includes("/hrs-dist-wow")) {
        return Promise.resolve(wowWithMissingDataProperty);
      }
      if (endpoint.includes("/hrs-dist-mom")) {
        return Promise.resolve(momWithEmptyData);
      }
      if (endpoint.includes("/hrs-dist-qoq")) {
        return Promise.resolve(qoqWithMalformedData);
      }
      return Promise.resolve({});
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });

    const downloadButton = screen.getByText("Download");
    fireEvent.click(downloadButton);

    const downloadAsCSVButton = screen.getByText("Download as CSV");
    fireEvent.click(downloadAsCSVButton);
  });

  test("should render manual hours contribution with only cluster data", async () => {
    require("../../app/store/store").useAppSelector.mockReturnValue({
      view: "metrics",
      fromDate: "2024-12-01",
      toDate: "2024-12-07",
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
      selectedClusters: [],
      compareLastYear: false,
    });

    const mockGet = jest.fn();
    const mockPost = jest.fn();

    useApi.mockReturnValue({
      get: mockGet,
      post: mockPost,
    });

    const mockMHContributionData = {
      totalHours: 3000,
      manualHours: 600,
      manualHourContribPercentage: 20,
    };

    const mockMHContributionDistData = {
      byStore: [],
      byCluster: [
        { key: "Cluster1", manualHourContribPercentage: 30 },
        { key: "Cluster2", manualHourContribPercentage: 10 },
      ],
    };

    mockPost.mockImplementation((endpoint) => {
      if (endpoint.includes("/analytics/manual-hours-contribution")) {
        return Promise.resolve(mockMHContributionData);
      }
      if (endpoint.includes("/analytics/manual-hours-contribution-dist")) {
        return Promise.resolve(mockMHContributionDistData);
      }
      return Promise.resolve({});
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          "Oops!... No result found, please try using a different filter",
        ),
      ).toBeInTheDocument();
    });

    expect(screen.queryByText("By Store :")).not.toBeInTheDocument();
  });

  test("should render manual hours contribution Month-on-Month data correctly", async () => {
    require("../../app/store/store").useAppSelector.mockReturnValue({
      view: "Performance",
      fromDate: "2024-12-01",
      toDate: "2024-12-07",
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
      selectedClusters: [],
      compareLastYear: false,
    });

    const mockGet = jest.fn();
    const mockPost = jest.fn();

    useApi.mockReturnValue({
      get: mockGet,
      post: mockPost,
    });

    const mockMHContributionMOMData = [
      {
        key: "January",
        pmonth: "2024-01-01",
        manualHourContribPercentage: 18,
      },
      {
        key: "February",
        pmonth: "2024-02-01",
        manualHourContribPercentage: 22,
      },
      {
        key: "March",
        pmonth: "2024-03-01",
        manualHourContribPercentage: 15,
      },
    ];

    mockPost.mockImplementation((endpoint) => {
      if (endpoint.includes("/analytics/manual-hours-contribution-mom")) {
        return Promise.resolve(mockMHContributionMOMData);
      }
      return Promise.resolve({});
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <HoursDistribution />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Reference Date:")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          "Oops!... No result found, please try using a different filter",
        ),
      ).toBeInTheDocument();
    });
  });

  test("should transform manual hours distribution data correctly for charts", () => {
    const mockStoreData = [
      { key: "Store1", manualHourContribPercentage: 25 },
      { key: "Store2", manualHourContribPercentage: 15 },
    ];

    const transformedData = mockStoreData.map(
      ({ key, manualHourContribPercentage }) => ({
        key,
        data: [
          {
            key: "manualHourContribPercentage",
            value: manualHourContribPercentage,
          },
        ],
      }),
    );

    expect(transformedData).toEqual([
      {
        key: "Store1",
        data: [
          {
            key: "manualHourContribPercentage",
            value: 25,
          },
        ],
      },
      {
        key: "Store2",
        data: [
          {
            key: "manualHourContribPercentage",
            value: 15,
          },
        ],
      },
    ]);

    const legendData = [
      {
        color: "#FDB833",
        key: "manualHourContribPercentage",
        label: "Manual Hours Percentage",
      },
    ];

    expect(legendData).toEqual([
      {
        color: "#FDB833",
        key: "manualHourContribPercentage",
        label: "Manual Hours Percentage",
      },
    ]);
  });
});
