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
import {
  IPayrollConfig,
  IRosterDetails,
  IMyTeamLeavesResponse,
  IClusterResponse,
  ISecondaryJob,
  IMiscWork,
  IAnalyticsEcoCombinedData,
  IAnalyticsEcoCategoryData,
  IAnalyticsEcoExtraction,
} from "../../helper/Interface";
import { useAppDispatch } from "../../app/store/store";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import EcoMobilityContribution from "./EcoMobilityContribution";

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
const mockAnalyticsCombinedData: IAnalyticsEcoCombinedData = {
  kmEcoDistribution: {
    totalKm: 3359.099999999997,
    ecoFriendlyKm: 2566.9999999999973,
    nonEcoFriendlyKm: 792.1,
  },
  ecoModeKmWiseDistribution: [
    {
      key: "BUS",
      value: 620.0,
    },
    {
      key: "TRAIN_METRO",
      value: 588.0000000000005,
    },
    {
      key: "CARPOOLING",
      value: 465.0,
    },
    {
      key: "BICYCLE",
      value: 331.0,
    },
    {
      key: "ELECTRIC_CAR",
      value: 310.0,
    },
    {
      key: "WALKING",
      value: 153.0,
    },
    {
      key: "ELECTRIC_MOTORCYCLE",
      value: 100.0,
    },
  ],
  nonEcoModeKmWiseDistribution: [
    {
      key: "AUTO_RICKSHAW",
      value: 372.0,
    },
    {
      key: "CAR",
      value: 252.1,
    },
    {
      key: "MOTORCYCLE",
      value: 155.0,
    },
    {
      key: "ELECTRIC_MOTORCYCLE",
      value: 4.0,
    },
    {
      key: "TRAIN_METRO",
      value: 3.0,
    },
    {
      key: "WALKING",
      value: 3.0,
    },
    {
      key: "BICYCLE",
      value: 3.0,
    },
  ],
  avgCommuteKmPerEmpPerDay: 7.53,
  numEmpEcoDistribution: {
    empHavingAtLeastOneEcoTrip: 11,
    empHavingNoEcoTrips: 4,
  },
};

const mockAnalyticsDataExtraction: IAnalyticsEcoExtraction = {
  data: [
    {
      year: "2025",
      month: "DECEMBER",
      costCentre: "IN1470 - DSI WAKAD",
      modeOfCommute: "CARPOOLING",
      unit: "KM",
      value: "99.0",
    },
    {
      year: "2026",
      month: "JANUARY",
      costCentre: "IN1058 - DSI ANUBHAVA",
      modeOfCommute: "CAR",
      unit: "KM",
      value: "330.6",
    },
    {
      year: "2025",
      month: "DECEMBER",
      costCentre: "IN1050 - DSI KALAMASSERY",
      modeOfCommute: "WALKING",
      unit: "KM",
      value: "33.0",
    },
    {
      year: "2025",
      month: "DECEMBER",
      costCentre: "IN1470 - DSI WAKAD",
      modeOfCommute: "MOTORCYCLE",
      unit: "KM",
      value: "55.0",
    },
    {
      year: "2026",
      month: "JANUARY",
      costCentre: "IN1470 - DSI WAKAD",
      modeOfCommute: "ELECTRIC_CAR",
      unit: "KM",
      value: "200.0",
    },
    {
      year: "2025",
      month: "DECEMBER",
      costCentre: "IN1058 - DSI ANUBHAVA",
      modeOfCommute: "TRAIN_METRO",
      unit: "KM",
      value: "215.59999999999994",
    },
    {
      year: "2025",
      month: "DECEMBER",
      costCentre: "IN1321 - DSI RAIPUR",
      modeOfCommute: "BUS",
      unit: "KM",
      value: "220.0",
    },
    {
      year: "2026",
      month: "JANUARY",
      costCentre: "IN1470 - DSI WAKAD",
      modeOfCommute: "MOTORCYCLE",
      unit: "KM",
      value: "100.0",
    },
    {
      year: "2025",
      month: "DECEMBER",
      costCentre: "IN1058 - DSI ANUBHAVA",
      modeOfCommute: "ELECTRIC_MOTORCYCLE",
      unit: "KM",
      value: "44.0",
    },
    {
      year: "2025",
      month: "DECEMBER",
      costCentre: "IN1058 - DSI ANUBHAVA",
      modeOfCommute: "BICYCLE",
      unit: "KM",
      value: "44.0",
    },
    {
      year: "2025",
      month: "DECEMBER",
      costCentre: "IN1058 - DSI ANUBHAVA",
      modeOfCommute: "BUS",
      unit: "KM",
      value: "253.0",
    },
    {
      year: "2026",
      month: "JANUARY",
      costCentre: "IN1058 - DSI ANUBHAVA",
      modeOfCommute: "BICYCLE",
      unit: "KM",
      value: "80.0",
    },
    {
      year: "2025",
      month: "DECEMBER",
      costCentre: "IN1058 - DSI ANUBHAVA",
      modeOfCommute: "CAR",
      unit: "KM",
      value: "88.0",
    },
    {
      year: "2026",
      month: "JANUARY",
      costCentre: "IN1058 - DSI ANUBHAVA",
      modeOfCommute: "TRAIN_METRO",
      unit: "KM",
      value: "373.4000000000001",
    },
    {
      year: "2026",
      month: "JANUARY",
      costCentre: "IN1050 - DSI KALAMASSERY",
      modeOfCommute: "WALKING",
      unit: "KM",
      value: "60.0",
    },
    {
      year: "2026",
      month: "JANUARY",
      costCentre: "IN1316 - DSI HUBLI",
      modeOfCommute: "BICYCLE",
      unit: "KM",
      value: "133.0",
    },
    {
      year: "2025",
      month: "DECEMBER",
      costCentre: "IN1316 - DSI HUBLI",
      modeOfCommute: "WALKING",
      unit: "KM",
      value: "22.0",
    },
    {
      year: "2026",
      month: "JANUARY",
      costCentre: "IN1470 - DSI WAKAD",
      modeOfCommute: "CARPOOLING",
      unit: "KM",
      value: "180.0",
    },
    {
      year: "2026",
      month: "JANUARY",
      costCentre: "IN1058 - DSI ANUBHAVA",
      modeOfCommute: "ELECTRIC_MOTORCYCLE",
      unit: "KM",
      value: "60.0",
    },
  ],
};

const mockAnalyticsCategoryData: IAnalyticsEcoCategoryData = {
  byZone: [
    {
      key: "East",
      value: {
        totalKm: 992.0,
        ecoFriendlyKm: 620.0,
        nonEcoFriendlyKm: 372.0,
      },
    },
    {
      key: "West",
      value: {
        totalKm: 744.0,
        ecoFriendlyKm: 589.0,
        nonEcoFriendlyKm: 155.0,
      },
    },
    {
      key: "Karnataka & Kerala",
      value: {
        totalKm: 1623.0999999999972,
        ecoFriendlyKm: 1357.9999999999982,
        nonEcoFriendlyKm: 265.1,
      },
    },
  ],
  byCity: [
    {
      key: "Bangalore",
      value: {
        totalKm: 1344.0999999999988,
        ecoFriendlyKm: 1079.0000000000002,
        nonEcoFriendlyKm: 265.1,
      },
    },
    {
      key: "Pune",
      value: {
        totalKm: 744.0,
        ecoFriendlyKm: 589.0,
        nonEcoFriendlyKm: 155.0,
      },
    },
    {
      key: "Raipur",
      value: {
        totalKm: 992.0,
        ecoFriendlyKm: 620.0,
        nonEcoFriendlyKm: 372.0,
      },
    },
    {
      key: "Cochin",
      value: {
        totalKm: 279.0,
        ecoFriendlyKm: 279.0,
        nonEcoFriendlyKm: 0.0,
      },
    },
  ],
  byStore: [
    {
      key: "DSI WAKAD",
      value: {
        totalKm: 744.0,
        ecoFriendlyKm: 589.0,
        nonEcoFriendlyKm: 155.0,
      },
    },
    {
      key: "DSI RAIPUR",
      value: {
        totalKm: 992.0,
        ecoFriendlyKm: 620.0,
        nonEcoFriendlyKm: 372.0,
      },
    },
    {
      key: "DSI KALAMASSERY",
      value: {
        totalKm: 279.0,
        ecoFriendlyKm: 279.0,
        nonEcoFriendlyKm: 0.0,
      },
    },
    {
      key: "DSI ANUBHAVA",
      value: {
        totalKm: 1003.6000000000007,
        ecoFriendlyKm: 809.0000000000007,
        nonEcoFriendlyKm: 194.6,
      },
    },
    {
      key: "DSI HUBLI",
      value: {
        totalKm: 270.0,
        ecoFriendlyKm: 270.0,
        nonEcoFriendlyKm: 0.0,
      },
    },
    {
      key: "DSI WHITEFIELD",
      value: {
        totalKm: 70.5,
        ecoFriendlyKm: 0.0,
        nonEcoFriendlyKm: 70.5,
      },
    },
  ],
  byCluster: [],
};

const mockAnalyticsGrowthMOMData = {
  data: [
    {
      startDate: "2026-01-01",
      key: "January",
      data: [
        {
          key: "ECO_KM",
          value: 1636.3999999999983,
        },
        {
          key: "NON_ECO_KM",
          value: 497.1,
        },
      ],
    },
  ],
};

const mockAnalyticsGrowthQOQData = {
  data: [
    {
      startDate: "2026-01-01",
      key: "Q1 2026",
      data: [
        {
          key: "ECO_KM",
          value: 1636.3999999999983,
        },
        {
          key: "NON_ECO_KM",
          value: 497.1,
        },
      ],
    },
    {
      startDate: "2025-10-01",
      key: "Q4 2025",
      data: [
        {
          key: "ECO_KM",
          value: 930.6000000000003,
        },
        {
          key: "NON_ECO_KM",
          value: 295.0,
        },
      ],
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

describe("EcoMobilityContribution Component", () => {
  let mockDispatch: jest.Mock;
  beforeEach(() => {
    jest.setTimeout(60000);
    mockDispatch = jest.fn();
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve(mockPayrollConfig);
        }
        if (endpoint.includes("/cluster")) {
          return Promise.resolve(mockClusters);
        }
        return Promise.resolve({});
      }),
      post: jest.fn((endpoint: string) => {
        if (endpoint.includes("/eco-mobility/combined")) {
          return Promise.resolve(mockAnalyticsCombinedData);
        }
        if (
          endpoint.includes("/eco-mobility/distributed/eco-non-eco-distance")
        ) {
          return Promise.resolve(mockAnalyticsCategoryData);
        }

        if (endpoint.includes("/eco-share-mom")) {
          return Promise.resolve(mockAnalyticsGrowthMOMData);
        }
        if (endpoint.includes("/eco-share-qoq")) {
          return Promise.resolve(mockAnalyticsGrowthQOQData);
        }
        if (endpoint.includes("/cost-centre-wise-data-extraction")) {
          return Promise.resolve(mockAnalyticsDataExtraction);
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

  it("should render `Eco Mobility Contribution Page", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <EcoMobilityContribution />
        </Provider>,
      );
    });

    const aliceLeaveElement = await screen.findByText(
      /Eco Mobility Contribution/i,
    );
    expect(aliceLeaveElement).toBeInTheDocument();
  });

  it("should render the loader initially", async () => {
    render(
      <Provider store={store}>
        <EcoMobilityContribution />
      </Provider>,
    );

    expect(screen.getAllByText(/No Data Found!/i)[0]).toBeInTheDocument();
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
          <EcoMobilityContribution />
        </Provider>,
      );
    });

    expect(screen.getByText("Eco Mobility Contribution")).toBeInTheDocument();
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
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      fromDate: "2024-12-01",
      toDate: "2024-12-07",
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <EcoMobilityContribution />
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
          <EcoMobilityContribution />
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
          <EcoMobilityContribution />
        </Provider>,
      );
    });

    const metricsTab = screen.getByText("Metrics");
    const performanceTab = screen.getByText("Performance");
    const dataExtractionTab = screen.getByText("Data Extraction");

    expect(metricsTab).toBeInTheDocument();
    expect(performanceTab).toBeInTheDocument();
    expect(dataExtractionTab).toBeInTheDocument();

    fireEvent.click(performanceTab);

    fireEvent.click(metricsTab);

    fireEvent.click(dataExtractionTab);
  });

  test("handles timer functionality for EcoMobilityContribution when a timer is required", async () => {
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
        <EcoMobilityContribution />
      </Provider>,
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    act(() => {
      jest.advanceTimersByTime(4000);
    });
  });

  it("should calculate total value and generate 2 data array with percentages correctly okay for EcoMobilityContribution", () => {
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
        <EcoMobilityContribution />
      </Provider>,
    );

    const filterButton = screen.getByText("Filters");
    fireEvent.click(filterButton);

    await waitFor(() => {
      expect(screen.getByText("Zone")).toBeInTheDocument();
      expect(screen.getByText("City")).toBeInTheDocument();
      expect(screen.getByText("Store")).toBeInTheDocument();
    });
    const closeButton = screen.getByRole("button", { name: /close/i }); // Assuming close button has 'Close' or a similar name
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton);
  });

  it("should render Filters with default placeholders after clicking Filters button", async () => {
    render(
      <Provider store={store}>
        <EcoMobilityContribution />
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
        <EcoMobilityContribution />
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
        <EcoMobilityContribution />
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
  it("should render `Data Extraction Tab `", async () => {
    render(
      <Provider store={store}>
        <EcoMobilityContribution />
      </Provider>,
    );
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: {
        empId: "DSI000486",
      },
      view: "Data Extraction",
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
    const text = await screen.findByText("Duration:");
    const text2 = await screen.findByText("31 Jul 2024 to 31 Jul 2024");
    expect(text).toBeInTheDocument();
    expect(text2).toBeInTheDocument();
  });
  it("should apply filters for zones, cities, and cost centers", async () => {
    // const mockCostCenters = [
    //   {
    //     costCentreName: "Retail 1",
    //     type: "RETAIL",
    //     cityId: 1,
    //     costCentreZone: "Zone 1",
    //   },
    //   {
    //     costCentreName: "Retail 2",
    //     type: "RETAIL",
    //     cityId: 2,
    //     costCentreZone: "Zone 2",
    //   },
    // ];

    // useApiMock.mockReturnValue({
    //   get: jest.fn().mockResolvedValue({
    //     data: { costCenters: mockCostCenters },
    //   }),
    // });

    (useAppSelector as jest.Mock).mockReturnValue({
      fromDate: "2024-12-01",
      toDate: "2024-12-07",
      selectedZones: [],
      selectedCities: [],
      selectedCostCenters: [],
      view: "Data Extraction",
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <EcoMobilityContribution />
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

    // const findSelect = await screen.findAllByText(/Select all/i);
    // expect(findSelect[0]).toBeInTheDocument();
    // fireEvent.click(findSelect[0]);

    const group1 = screen.getAllByText("Select or type here...");
    expect(group[1]).toBeInTheDocument();
    fireEvent.click(group[1]);

    // const findSelectCity = screen.getByText("Select All");
    // expect(findSelectCity).toBeInTheDocument();
    // fireEvent.click(findSelectCity);

    const group2 = screen.getAllByText("Select or type here...");
    expect(group[2]).toBeInTheDocument();
    fireEvent.click(group[2]);

    // const findSelectStore = screen.getByText("Select All");
    // expect(findSelectStore).toBeInTheDocument();
    // fireEvent.click(findSelectStore);

    const ReferenceDate = screen.getByText("From Date");
    expect(ReferenceDate).toBeInTheDocument();
    fireEvent.click(ReferenceDate);

    await waitFor(() => {
      expect(screen.getByText("Select Date Range")).toBeInTheDocument();
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
          <EcoMobilityContribution
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

  it("should render percentage toggle options", async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: {
        empId: "DSI000486",
      },
      view: "Metrics",
      fromDate: "2024-07-01",
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

    render(
      <Provider store={store}>
        <EcoMobilityContribution />
      </Provider>,
    );

    const percentageTab = await screen.findByText("Percentage");
    expect(percentageTab).toBeInTheDocument();
    fireEvent.click(percentageTab);

    const absoluteTab = await screen.findByText("Absolute");
    expect(absoluteTab).toBeInTheDocument();
    fireEvent.click(absoluteTab);
  });

  it("should render `Manual tab`", async () => {
    render(
      <Provider store={store}>
        <EcoMobilityContribution />
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
        <EcoMobilityContribution />
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

  it("should always handle empty or null data gracefully for analytics combined data", () => {
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
  it("should always handle extra GRAPH_COLORS keys gracefully", () => {
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
        <EcoMobilityContribution />
      </Provider>,
    );

    useAppSelector.mockReturnValue({
      analyticsCombinedData: null,
      analyticsWOWData: null,
      view: "metrics",
    });

    const noDataText = await screen.findByText(
      "Kickstart the analytics engine with some filters! Choose your flavor and make data dance to your tune!",
    );
    expect(noDataText).toBeInTheDocument();
  });
  it("should always handle filters and dynamically render fields based on view", async () => {
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
          <EcoMobilityContribution />
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
          <EcoMobilityContribution />
        </Provider>,
      );
    });
  });
  it("should render `Tabs`", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <EcoMobilityContribution />
        </Provider>,
      );
    });

    const Tabs = ["Metrics", "Performance", "Data Extraction"];
    Tabs.forEach((tab) => expect(screen.getByText(tab)).toBeInTheDocument());
  });

  it("should not generate 2 a CSV report if there is no analyticsCombinedData", async () => {
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
          <EcoMobilityContribution />
        </Provider>,
      );
    });

    const downloadButtonRight = screen.getByText("Download");
    fireEvent.click(downloadButtonRight);

    const downloadAsCSV = screen.getByText("Download as CSV");
    fireEvent.click(downloadAsCSV);

    expect(mockDownloadCSV).not.toHaveBeenCalled();
  });

  test("should always handle null WoW data 2 but process valid MoM and QoQ data", async () => {
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
        return Promise.resolve(mockAnalyticsMOMData);
      }
      if (endpoint.includes("/hrs-dist-qoq")) {
        return Promise.resolve(mockAnalyticsQOQData);
      }
      return Promise.resolve({});
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <EcoMobilityContribution />
        </Provider>,
      );
    });

    const downloadButtonRight = screen.getByText("Download");
    fireEvent.click(downloadButtonRight);

    const downloadAsCSVButtonBottom = screen.getByText("Download as CSV");
    fireEvent.click(downloadAsCSVButtonBottom);
  });

  test("should always handle WoW data 2 with no data array property", async () => {
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
        return Promise.resolve(mockAnalyticsMOMData);
      }
      if (endpoint.includes("/hrs-dist-qoq")) {
        return Promise.resolve(mockAnalyticsQOQData);
      }
      return Promise.resolve({});
    });

    // Render the component
    await act(async () => {
      render(
        <Provider store={store}>
          <EcoMobilityContribution />
        </Provider>,
      );
    });

    const downloadButtonRight = screen.getByText("Download");
    fireEvent.click(downloadButtonRight);

    const downloadAsCSVButtonBottom = screen.getByText("Download as CSV");
    fireEvent.click(downloadAsCSVButtonBottom);
  });

  test("should process Performance data with mixed category distributions correctly okay", async () => {
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
            { key: "COMMERCIAL", value: 72 },
            { key: "NON_COMMERCIAL", value: 32 },
          ],
          startDate: "2024-12-01",
        },
        {
          key: "Week2",
          data: [
            { key: "COMMERCIAL", value: 42 },
            { key: "NON_COMMERCIAL", value: 32 },
            { key: "ECOMMERCE", value: 22 },
            { key: "CASHIERING", value: 12 },
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
          <EcoMobilityContribution />
        </Provider>,
      );
    });

    const downloadButtonRight = screen.getByText("Download");
    fireEvent.click(downloadButtonRight);

    const downloadAsCSVButtonBottom = screen.getByText("Download as CSV");
    fireEvent.click(downloadAsCSVButtonBottom);
  });

  test("should always handle concurrent processing of WoW, MoM, and QoQ data", async () => {
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
            { key: "COMMERCIAL", value: 82 },
            { key: "NON_COMMERCIAL", value: 22 },
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
            { key: "COMMERCIAL", value: 62 },
            { key: "NON_COMMERCIAL", value: 42 },
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
            { key: "COMMERCIAL", value: 42 },
            { key: "NON_COMMERCIAL", value: 62 },
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
          <EcoMobilityContribution />
        </Provider>,
      );
    });

    const downloadButtonRight = screen.getByText("Download");
    fireEvent.click(downloadButtonRight);

    const downloadAsCSVButtonBottom = screen.getByText("Download as CSV");
    fireEvent.click(downloadAsCSVButtonBottom);
  });

  test("should always handle missing data properties in Performance metrics gracefully", async () => {
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
      otherProperty: "some value 22",
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
          <EcoMobilityContribution />
        </Provider>,
      );
    });

    const downloadButtonRight = screen.getByText("Download");
    fireEvent.click(downloadButtonRight);

    const downloadAsCSVButtonBottom = screen.getByText("Download as CSV");
    fireEvent.click(downloadAsCSVButtonBottom);
  });
  test("should always handle", async () => {
    require("../../app/store/store").useAppSelector.mockReturnValue({
      view: "Data Extraction",
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

    await act(async () => {
      render(
        <Provider store={store}>
          <EcoMobilityContribution />
        </Provider>,
      );
    });

    const downloadButtonRight = screen.getByText("Download");
    fireEvent.click(downloadButtonRight);

    const downloadAsCSVButtonBottom = screen.getByText("Download as EXCEL");
    fireEvent.click(downloadAsCSVButtonBottom);
  });

  test("should render Eco Mobility Contribution with only cluster data", async () => {
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

    const mockMHContributionData3 = {
      totalHours: 3000,
      manualHours: 600,
      manualHourContribPercentage: 20,
    };

    const mockMHContributionDistData3 = {
      byStore: [],
      byCluster: [
        { key: "Cluster1", manualHourContribPercentage: 30 },
        { key: "Cluster2", manualHourContribPercentage: 10 },
      ],
    };

    mockPost.mockImplementation((endpoint) => {
      if (endpoint.includes("/analytics/manual-hours-contribution")) {
        return Promise.resolve(mockMHContributionData3);
      }
      if (endpoint.includes("/analytics/manual-hours-contribution-dist")) {
        return Promise.resolve(mockMHContributionDistData3);
      }
      return Promise.resolve({});
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <EcoMobilityContribution />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("No Data Found!")).toBeInTheDocument();
    });

    expect(screen.queryByText("By Store :")).not.toBeInTheDocument();
  });

  test("should render Eco Mobility Contribution Month-on-Month data correctly okay", async () => {
    require("../../app/store/store").useAppSelector.mockReturnValue({
      view: "Data Extraction",
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

    const mockMHContributionMOMData3 = [
      {
        key: "January",
        pmonth: "2024-01-01",
        manualHourContribPercentage: 12,
      },
      {
        key: "February",
        pmonth: "2024-02-01",
        manualHourContribPercentage: 22,
      },
      {
        key: "March",
        pmonth: "2024-03-01",
        manualHourContribPercentage: 12,
      },
    ];

    mockPost.mockImplementation((endpoint) => {
      if (endpoint.includes("/analytics/manual-hours-contribution-mom")) {
        return Promise.resolve(mockMHContributionMOMData3);
      }
      return Promise.resolve({});
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <EcoMobilityContribution />
        </Provider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Duration:")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("No Data Found!")).toBeInTheDocument();
    });
  });

  test("should transform Eco Mobility distribution data correctly okay for charts", () => {
    const mockStoreData2 = [
      { key: "Store11", manualHourContribPercentage: 22 },
      { key: "Store22", manualHourContribPercentage: 12 },
    ];

    const transformedData2 = mockStoreData2.map(
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

    expect(transformedData2).toEqual([
      {
        key: "Store11",
        data: [
          {
            key: "manualHourContribPercentage",
            value: 22,
          },
        ],
      },
      {
        key: "Store22",
        data: [
          {
            key: "manualHourContribPercentage",
            value: 12,
          },
        ],
      },
    ]);

    const legendData2 = [
      {
        color: "#FDB833",
        key: "manualHourContribPercentage",
        label: "Manual Hours Percentage",
      },
    ];

    expect(legendData2).toEqual([
      {
        color: "#FDB833",
        key: "manualHourContribPercentage",
        label: "Manual Hours Percentage",
      },
    ]);
  });
});
//
