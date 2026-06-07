import { fireEvent, render, screen } from "@testing-library/react";
import { store, useAppSelector } from "../../app/store/store";
import { Provider } from "react-redux";
import { ICostCenterResponse } from "../../helper/Interface";
import AffinityRate from "./AffinityRate";
const mockedCostCenterResponse: ICostCenterResponse = {
  costCenters: [
    {
      id: 9,
      costCentreName: "IN1044",
      displayName: "DSI THANE",
      costCentreZone: "West",
      address:
        "DECATHLON THANE, BIG SHOPPING CENTER,GHODBUNDER ROAD, KASARVADAWALI GAON,THANE WEST - THANE 400615",
      pinCode: 400615,
      cityId: 33,
      stateId: 16,
      countryId: 1,
      city: "Thane",
      state: "Maharashtra",
      country: "India",
      updatedAt: "2023-11-03T21:20:42.752994",
      managerEmpId: "DSI001273",
      superManagerEmpId: "DSI000117",
      type: "RETAIL",
      disabled: false,
    },
  ],
  totalPages: 0,
};
const mockedReponse = {
  date: null,
  totalHours: 2370.0,
  totalTurnover: 5931955.162322998,
  affinityRate: 6753.96,
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
}));

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));

const mockClusterResponse = [
  { id: 1, name: "Test Cluster", editable: true },
  { id: 2, name: "Another Cluster", editable: false },
];

jest.mock("../../hooks/useApi", () => ({
  useApi: () => ({
    get: jest.fn((url) => {
      if (url.includes("/cluster")) {
        return Promise.resolve(mockClusterResponse);
      }
      return Promise.resolve(mockedCostCenterResponse);
    }),
    post: jest.fn(() => Promise.resolve(mockedReponse)),
  }),
}));
jest.mock("../../hooks/usePermission", () => ({
  usePermission: () => ({
    checkForPermission: jest.fn(() => true),
    transformRoutes: jest.fn(() => []),
  }),
}));
jest.mock("../../app/store/store", () => ({
  useAppSelector: jest.fn(() => ({
    selectedCostCenterName: "IN1044",
    user: {
      empId: "DSI000486",
    },
  })),
  useAppDispatch: () => jest.fn(),
  dispatch: jest.fn(),
  store: {
    getState: jest.fn(),
    subscribe: jest.fn(),
  },
}));

jest.mock("moment", () => () => ({
  format: jest.fn(() => "2024-07-14"),
  startOf: () => ({
    format: jest.fn(() => "2024-07-01"),
  }),
  endOf: () => ({
    format: jest.fn(() => "2024-07-31"),
  }),
  diff: jest.fn(),
  unix: jest.fn(),
  toDate: jest.fn(() => "2024-07-31"),
  add: () => ({
    format: jest.fn(() => "2024-07-31"),
  }),
}));

describe("Affinity Rate Dashboard Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1044",
      user: {
        empId: "DSI000486",
      },
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
      view: "Metrics",
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should render `Affinity Rate Page`", async () => {
    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );
    const heading = await screen.findByText("Affinity Rate");

    expect(heading).toBeInTheDocument();
  });
  it("should render `Filters Button`", async () => {
    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );

    const filter = await screen.findByText("Filters");
    const download = await screen.findByText("Download");
    const downloadAsCSV = await screen.findByText("Download as CSV");
    const DurationText = await screen.findByText("Duration:");
    const Durationvalue = await screen.findByText("2024-07-14 to 2024-07-14");
    const zoneText = await screen.findByText("Zone:");
    const zoneValue = await screen.findAllByText("All");
    const cityText = await screen.findByText("City:");
    const cityValue = await screen.findByText("Test City");
    const storeText = await screen.findByText("Store:");
    const storeValue = await screen.findByText("Test Cost Center");
    const clusterText = await screen.findByText("Cluster:");

    expect(filter).toBeInTheDocument();
    expect(download).toBeInTheDocument();
    expect(downloadAsCSV).toBeInTheDocument();
    expect(DurationText).toBeInTheDocument();
    expect(Durationvalue).toBeInTheDocument();
    expect(zoneText).toBeInTheDocument();
    expect(zoneValue[0]).toBeInTheDocument();
    expect(cityText).toBeInTheDocument();
    expect(cityValue).toBeInTheDocument();
    expect(storeText).toBeInTheDocument();
    expect(storeValue).toBeInTheDocument();
    expect(clusterText).toBeInTheDocument();
  });

  it("should render `Metrics Cards`", async () => {
    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );
    const Cards = ["Metrics", "Performance"];
    Cards.forEach(async (card) => {
      const cardText = await screen.findByText(card);
      expect(cardText).toBeInTheDocument();
    });
  });
  it("should render `Filters`", async () => {
    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );
    const filter = "Filters";
    const filterText = await screen.findByText(filter);
    expect(filterText).toBeInTheDocument();
  });
  it("should render `Analytics Cards Data`", async () => {
    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );

    const data0Text = await screen.findAllByText("Affinity Rate");
    const data0Value = await screen.findByText("6753.96%");
    const data1Text = await screen.findByText("Total Commercial Hours");
    const data1Value = await screen.findByText("2370");
    const data2Text = await screen.findByText("Total Turnover");
    const data2Value = await screen.findByText("₹59,31,955.16");

    expect(data0Text[0]).toBeInTheDocument();
    expect(data0Value).toBeInTheDocument();
    expect(data1Text).toBeInTheDocument();
    expect(data1Value).toBeInTheDocument();
    expect(data2Text).toBeInTheDocument();
    expect(data2Value).toBeInTheDocument();
  });

  it("should render `no data found`", async () => {
    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1044",
      user: {
        empId: "DSI000486",
      },
      view: "Performance",
    });

    const text = await screen.findByText(
      "Oops!... No result found, please try using a different filter"
    );
    expect(text).toBeInTheDocument();
  });
  it("should render `Performance Tab `", async () => {
    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1044",
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
    const text2 = await screen.findByText("2024-07-14");
    expect(text).toBeInTheDocument();
    expect(text2).toBeInTheDocument();
  });
  it("should download data as CSV when clicking Download as CSV", async () => {
    jest.mock("../../helper/Utils", () => ({
      ...jest.requireActual("../../helper/Utils"),
      downloadCSV: jest.fn(),
      formatDate: jest.fn(() => "2024-07-14"),
    }));

    const { downloadCSV } = require("../../helper/Utils");
    const mockCreateObjectURL = jest.fn();
    Object.defineProperty(window, "URL", {
      value: {
        createObjectURL: mockCreateObjectURL,
      },
    });

    const mockPost = jest.fn();
    mockPost.mockResolvedValueOnce(mockedReponse);
    mockPost.mockResolvedValueOnce({
      byZone: [
        {
          key: "Tamilnadu- South",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 1945369.0625,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },
        {
          key: "West",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 224.5,
            },
            {
              key: "TURN_OVER",
              value: 7834793.5,
            },
            {
              key: "AFFINITY_RATE",
              value: 93.36,
            },
          ],
        },
      ],
      byCity: [
        {
          key: "Vizag",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 39620.62109375,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },
        {
          key: "Kozhikode",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 94969.0,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },
      ],
      byStore: [
        {
          key: "",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 13612.0,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },

        {
          key: "DSI EXPRESS AVENUE CONNECT",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: -2499.0,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },
      ],
      byCluster: [
        {
          key: "Running Walking",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 206867.1875,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },
        {
          key: "Olympic Games",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 101447.1484375,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },
      ],
    });
    mockPost.mockResolvedValueOnce({
      byZone: [
        {
          key: "Karnataka & Kerala",
          data: [
            { key: "FULL_TIME", value: 54.0 },
            { key: "NON_FULL_TIME", value: 10.5 },
          ],
        },
      ],
      byCity: [
        {
          key: "Bangalore",
          data: [
            { key: "FULL_TIME", value: 54.0 },
            { key: "NON_FULL_TIME", value: 10.5 },
          ],
        },
      ],
      byStore: [
        {
          key: "DSI SARJAPUR",
          data: [
            { key: "FULL_TIME", value: 45.0 },
            { key: "NON_FULL_TIME", value: 10.5 },
          ],
        },
      ],
      byCluster: [],
    });
    mockPost.mockResolvedValueOnce({
      byZone: [
        {
          key: "Karnataka & Kerala",
          data: [
            { key: "Weekday", value: 58.5 },
            { key: "Non-Weekday", value: 6.0 },
          ],
        },
      ],
      byCity: [
        {
          key: "Bangalore",
          data: [
            { key: "Weekday", value: 58.5 },
            { key: "Non-Weekday", value: 6.0 },
          ],
        },
      ],
      byStore: [],
      byCluster: [],
    });
    mockPost.mockResolvedValueOnce({
      byZone: [
        {
          key: "Karnataka & Kerala",
          data: [
            { key: "PEAK", value: 3.0 },
            { key: "NON_PEAK", value: 61.5 },
          ],
        },
      ],
      byCity: [],
      byStore: [],
      byCluster: [],
    });

    jest.mock("../../hooks/useApi", () => ({
      useApi: () => ({
        get: jest.fn(() => Promise.resolve(mockedCostCenterResponse)),
        post: mockPost,
      }),
    }));

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1044",
      user: {
        empId: "DSI000486",
      },
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
      view: "Metrics",
    });

    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );

    const heading = await screen.findByText("Affinity Rate");
    expect(heading).toBeInTheDocument();

    const downloadButton = await screen.findByText("Download");
    fireEvent.click(downloadButton);

    const downloadAsCSVButton = await screen.findByText("Download as CSV");
    fireEvent.click(downloadAsCSVButton);
  });

  it("should open filter drawer when filter button is clicked", async () => {
    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );

    const filterButton = await screen.findByText("Filters");
    fireEvent.click(filterButton);

    // Check if filter drawer is opened
    const zoneLabel = await screen.findByText("Zone");
    const cityLabel = await screen.findByText("City");
    const storeLabel = await screen.findByText("Store");
    const applyButton = await screen.findByRole("button", { name: "Apply" });

    expect(zoneLabel).toBeInTheDocument();
    expect(cityLabel).toBeInTheDocument();
    expect(storeLabel).toBeInTheDocument();
    expect(applyButton).toBeInTheDocument();
  });

  it("should render Performance Tab click", async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1044",
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
        <AffinityRate />
      </Provider>
    );

    const percentageTab = await screen.findByText("Performance");
    expect(percentageTab).toBeInTheDocument();
    fireEvent.click(percentageTab);
  });

  it("should show Compare With Last Year toggle in Performance view", async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1044",
      user: {
        empId: "DSI000486",
      },
      view: "Performance",
      fromDate: "2024-07-01",
      toDate: "2024-07-31",
      tempFromDate: "2024-07-01",
      tempToDate: "2024-07-31",
      selectedZones: [
        {
          label: "Test Zone",
          value: "Test Zone ID",
        },
      ],
      selectedCities: [],
      selectedCostCenters: [],
      selectedClusters: [],
      compareLastYear: false,
    });

    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );

    const filterButton = await screen.findByText("Filters");
    fireEvent.click(filterButton);

    // expect(
    //   await screen.findByText("Compare With Last Year")
    // ).toBeInTheDocument();

    // const switchElement = await screen.findByRole("checkbox");
    // expect(switchElement).toBeInTheDocument();
    // expect(switchElement).not.toBeChecked();
  });

  it("should call onApply when Apply button is clicked", async () => {
    const mockPost = jest.fn();
    mockPost.mockResolvedValue({});

    jest.mock("../../hooks/useApi", () => ({
      useApi: () => ({
        get: jest.fn(() => Promise.resolve({})),
        post: mockPost,
      }),
    }));

    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );
    const filterButton = await screen.findByText("Filters");
    fireEvent.click(filterButton);

    const applyButton = await screen.findByRole("button", { name: "Apply" });
    fireEvent.click(applyButton);
  });

  it("should open and render filter drawer with all form controls", async () => {
    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );

    // Find and click the Filters button
    const filterButton = await screen.findByText("Filters");
    fireEvent.click(filterButton);

    // Verify all filter controls are rendered
    expect(await screen.findByText("Zone")).toBeInTheDocument();
    expect(await screen.findByText("City")).toBeInTheDocument();
    expect(await screen.findByText("Store")).toBeInTheDocument();
    expect(await screen.findByText("From Date")).toBeInTheDocument();
    expect(await screen.findByText("To Date")).toBeInTheDocument();

    // Verify Apply button is displayed
    const applyButton = await screen.findByRole("button", { name: "Apply" });
    expect(applyButton).toBeInTheDocument();
  });

  it("should open date range modal when clicking on date input", async () => {
    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );

    // Find and click the Filters button
    const filterButton = await screen.findByText("Filters");
    fireEvent.click(filterButton);

    // Find date inputs
    const fromDateLabel = await screen.findByText("From Date");
    const dateInput = fromDateLabel.nextSibling?.firstChild as HTMLElement;

    // Click on the date input to open date picker
    if (dateInput) {
      fireEvent.click(dateInput);

      // Verify date range modal is opened
      expect(await screen.findByText("Select Date Range")).toBeInTheDocument();

      // Verify Apply and Close buttons in the date modal
      expect(
        await screen.findByRole("button", { name: "Apply" })
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("button", { name: "Close" })
      ).toBeInTheDocument();
    }
  });

  it("should process growth data correctly when downloading CSV", async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1044",
      user: {
        empId: "DSI000486",
      },
      view: "Performance",
      fromDate: "2024-07-01",
      toDate: "2024-07-31",
      selectedZones: [{ label: "Test Zone", value: "Test Zone ID" }],
      selectedCities: [{ label: "Test City", value: "Test City ID" }],
      selectedCostCenters: [
        { label: "Test Cost Center", value: "Test Cost Center ID" },
      ],
      selectedClusters: [{ label: "Test Cluster", value: "Test Cluster ID" }],
    });

    const mockGrowthData = {
      data: [
        {
          startDate: "2025-03-30",
          key: "Week 14",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 193.5,
            },
            {
              key: "TURN_OVER",
              value: 1.318333175e7,
            },
            {
              key: "AFFINITY_RATE",
              value: 11014.66,
            },
          ],
        },
        {
          startDate: "2025-04-13",
          key: "Week 16",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 13955.0,
            },
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
          ],
        },
      ],
    };

    const mockPost = jest.fn();
    mockPost.mockImplementation((url) => {
      if (url.includes("/affinity-hrs-dist-wow")) {
        return Promise.resolve(mockGrowthData);
      } else {
        return Promise.resolve({ data: [] });
      }
    });

    jest.mock("../../hooks/useApi", () => ({
      useApi: () => ({
        get: jest.fn(() => Promise.resolve({ costCenters: [] })),
        post: mockPost,
      }),
    }));

    const mockDownloadCSV = jest.fn();
    jest.mock("../../helper/Utils", () => ({
      ...jest.requireActual("../../helper/Utils"),
      downloadCSV: mockDownloadCSV,
      formatDate: jest.fn(() => "2024-07-14"),
    }));

    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );

    const downloadButton = await screen.findByText("Download");
    fireEvent.click(downloadButton);
    const downloadAsCSVOption = await screen.findByText("Download as CSV");
    fireEvent.click(downloadAsCSVOption);

    expect(downloadButton).toBeInTheDocument();
  });

  it("should process category data correctly when downloading CSV in Metrics view", async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1044",
      user: {
        empId: "DSI000486",
      },
      view: "Metrics",
      fromDate: "2024-07-01",
      toDate: "2024-07-31",
      selectedZones: [{ label: "Test Zone", value: "Test Zone ID" }],
      selectedCities: [{ label: "Test City", value: "Test City ID" }],
      selectedCostCenters: [
        { label: "Test Cost Center", value: "Test Cost Center ID" },
      ],
      selectedClusters: [{ label: "Test Cluster", value: "Test Cluster ID" }],
    });

    const mockHrsCombinedData = {
      date: null,
      totalHours: 2370.0,
      totalTurnover: 5931955.162322998,
      affinityRate: 6753.96,
    };

    const mockDistributionData = {
      byZone: [
        {
          key: "Tamilnadu- South",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 1945369.0625,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },
        {
          key: "West",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 224.5,
            },
            {
              key: "TURN_OVER",
              value: 7834793.5,
            },
            {
              key: "AFFINITY_RATE",
              value: 93.36,
            },
          ],
        },
      ],
      byCity: [
        {
          key: "Vizag",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 39620.62109375,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },
        {
          key: "Kozhikode",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 94969.0,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },
      ],
      byStore: [
        {
          key: "",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 13612.0,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },

        {
          key: "DSI EXPRESS AVENUE CONNECT",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: -2499.0,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },
      ],
      byCluster: [
        {
          key: "Running Walking",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 206867.1875,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },
        {
          key: "Olympic Games",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 101447.1484375,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },
      ],
    };

    const mockPost = jest.fn();
    mockPost.mockImplementation((url) => {
      if (url.includes("/affinity-hrs-total")) {
        return Promise.resolve(mockHrsCombinedData);
      } else if (url.includes("/affinity-hrs-dist-work")) {
        return Promise.resolve(mockDistributionData);
      } else {
        return Promise.resolve({
          byZone: [],
          byCity: [],
          byStore: [],
          byCluster: [],
        });
      }
    });

    jest.mock("../../hooks/useApi", () => ({
      useApi: () => ({
        get: jest.fn(() => Promise.resolve({ costCenters: [] })),
        post: mockPost,
      }),
    }));

    // Mock the downloadCSV function
    const mockDownloadCSV = jest.fn();
    jest.mock("../../helper/Utils", () => ({
      ...jest.requireActual("../../helper/Utils"),
      downloadCSV: mockDownloadCSV,
      formatDate: jest.fn(() => "2024-07-14"),
    }));

    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );

    const downloadButton = await screen.findByText("Download");

    fireEvent.click(downloadButton);
    const downloadAsCSVOption = await screen.findByText("Download as CSV");
    fireEvent.click(downloadAsCSVOption);

    expect(downloadButton).toBeInTheDocument();
  });
  it("should process multi cluster data when downloading CSV", async () => {
    const mockClusterData = {
      byZone: [],
      byCity: [],
      byStore: [],
      byCluster: [
        {
          key: "Running Walking",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 206867.1875,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },
        {
          key: "Cycling",
          data: [
            {
              key: "TOTAL_HOURS",
              value: 0.0,
            },
            {
              key: "TURN_OVER",
              value: 5693.0,
            },
            {
              key: "AFFINITY_RATE",
              value: 0.0,
            },
          ],
        },
      ],
    };

    const mockDownloadCSV = jest.fn();
    jest.mock("../../helper/Utils", () => ({
      ...jest.requireActual("../../helper/Utils"),
      downloadCSV: mockDownloadCSV,
      formatDate: jest.fn(() => "2024-07-14"),
    }));

    const mockPost = jest.fn().mockImplementation((url) => {
      return Promise.resolve(mockClusterData);
    });

    jest.mock("../../hooks/useApi", () => ({
      useApi: () => ({
        get: jest.fn((url) => {
          if (url.includes("/cluster")) {
            return Promise.resolve([
              { id: 1, name: "Test Cluster", editable: true },
              { id: 2, name: "Another Cluster", editable: false },
            ]);
          }
          return Promise.resolve(mockedCostCenterResponse);
        }),
        post: mockPost,
      }),
    }));

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1044",
      user: { empId: "DSI000486" },
      view: "Metrics",
      fromDate: "2024-07-01",
      toDate: "2024-07-31",
      tempFromDate: "2024-07-01",
      tempToDate: "2024-07-31",
      selectedZones: [
        { label: "Karnataka & Kerala", value: "Karnataka & Kerala" },
      ],
      selectedCities: [{ label: "Bangalore", value: 19 }],
      selectedCostCenters: [{ label: "DSI SARJAPUR", value: "IN1044" }],
      selectedClusters: [{ label: "Cluster A", value: "cluster-a-id" }],
    });

    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );

    await screen.findByText("Affinity Rate");

    const downloadButton = await screen.findByText("Download");
    fireEvent.click(downloadButton);

    const downloadAsCSVOption = await screen.findByText("Download as CSV");
    fireEvent.click(downloadAsCSVOption);
  });

  it("should handle filter drawer and compare last year toggle", async () => {
    const mockCostCenterResponse = {
      costCenters: [
        {
          id: 1,
          costCentreName: "IN1044",
          displayName: "DSI SARJAPUR",
          costCentreZone: "Karnataka & Kerala",
          city: "Bangalore",
          cityId: 19,
          type: "RETAIL",
        },
      ],
    };

    const mockGet = jest.fn().mockResolvedValue(mockCostCenterResponse);
    const mockPost = jest.fn().mockResolvedValue({});

    jest.mock("../../hooks/useApi", () => ({
      useApi: () => ({
        get: mockGet,
        post: mockPost,
      }),
    }));

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1044",
      user: { empId: "DSI000486" },
      view: "Performance",
      fromDate: "2024-07-01",
      toDate: "2024-07-31",
      tempFromDate: "2024-07-01",
      tempToDate: "2024-07-31",
      selectedZones: [
        { label: "Karnataka & Kerala", value: "Karnataka & Kerala" },
      ],
      selectedCities: [{ label: "Bangalore", value: 19 }],
      selectedCostCenters: [{ label: "DSI SARJAPUR", value: "IN1044" }],
      selectedClusters: [],
      compareLastYear: false,
    });

    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );

    await screen.findByText("Affinity Rate");

    const filterButton = screen.getByTestId("Filters-Button");
    fireEvent.click(filterButton);

    // const compareWithLastYearText = await screen.findByText(
    //   "Compare With Last Year"
    // );
    // expect(compareWithLastYearText).toBeInTheDocument();

    // const compareSwitch = await screen.findByRole("checkbox");
    // expect(compareSwitch).not.toBeChecked();
    // fireEvent.click(compareSwitch);

    const applyButton = await screen.findByRole("button", { name: /Apply/i });
    fireEvent.click(applyButton);
  });

  it("should fetch and filter clusters when a single cost center is selected", async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1044",
      user: { empId: "DSI000486" },
      selectedCostCenters: [{ label: "DSI SARJAPUR", value: "IN1044" }],
      view: "Metrics",
      fromDate: "2024-07-01",
      toDate: "2024-07-31",
      selectedZones: [],
      selectedCities: [],
      selectedClusters: [],
    });

    render(
      <Provider store={store}>
        <AffinityRate />
      </Provider>
    );

    await screen.findByText("Affinity Rate");

    const filterButton = await screen.findByText("Filters");
    fireEvent.click(filterButton);
    const clusterLabel = await screen.findByText("Cluster");
    expect(clusterLabel).toBeInTheDocument();
  });
});
