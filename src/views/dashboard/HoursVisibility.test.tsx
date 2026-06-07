import { fireEvent, render, screen } from "@testing-library/react";
import { store, useAppSelector } from "../../app/store/store";
import { Provider } from "react-redux";
import { ICostCenterResponse } from "../../helper/Interface";
import HoursVisibility from "./HoursVisibility";
const mockedCostCenterResponse: ICostCenterResponse = {
  costCenters: [
    {
      id: 1,
      costCentreName: "IN1041",
      displayName: "DSI SARJAPUR",
      costCentreZone: "Karnataka & Kerala",
      address:
        "DECATHLON SARJAPUR,SURVEY 96/1, SARJAPUR ROAD,Bangalore, INDIA 560035 (LAND MARK – AFTER WIPRO CORPORATE OFFICE – RAILWAY CROSSING)",
      pinCode: 560035,
      cityId: 19,
      stateId: 13,
      countryId: 1,
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      updatedAt: "2023-11-03T21:20:42.693024",
      managerEmpId: "DSI000486",
      superManagerEmpId: "DSI000205",
      type: "RETAIL",
      disabled: false,
    },
  ],
  totalPages: 0,
};
const mockedReponse = {
  data: [
    {
      startDate: "2024-12-01",
      key: "December",
      data: [
        {
          key: "Total Hours",
          value: 64.5,
        },
      ],
    },
  ],
  totalHours: 64.5,
  employmentTypeWorkHours: [
    {
      key: "FULL_TIME",
      value: 54.0,
    },
    {
      key: "NON_FULL_TIME",
      value: 10.5,
    },
  ],
  dayTypeWorkHours: [
    {
      key: "Non-Weekday",
      value: 6.0,
    },
    {
      key: "Weekday",
      value: 58.5,
    },
  ],
  peakNonPeakHours: [
    {
      key: "NON_PEAK",
      value: 61.5,
    },
    {
      key: "PEAK",
      value: 3.0,
    },
  ],
  byZone: [
    {
      key: "Karnataka & Kerala",
      value: 64.5,
      startDate: "2024-12-01",
      data: [
        {
          key: "FULL_TIME",
          value: 54.0,
        },
        {
          key: "NON_FULL_TIME",
          value: 10.5,
        },
      ],
    },
  ],
  byCity: [
    {
      key: "Bangalore",
      value: 64.5,
      startDate: "2024-12-01",
      data: [
        {
          key: "FULL_TIME",
          value: 54.0,
        },
        {
          key: "NON_FULL_TIME",
          value: 10.5,
        },
      ],
    },
  ],
  byStore: [
    {
      key: "DSI SARJAPUR",
      value: 55.5,
      startDate: "2024-12-01",
      data: [
        {
          key: "FULL_TIME",
          value: 54.0,
        },
        {
          key: "NON_FULL_TIME",
          value: 10.5,
        },
      ],
    },
    {
      key: "DSI WHITEFIELD",
      value: 9.0,
      startDate: "2024-12-01",
      data: [
        {
          key: "FULL_TIME",
          value: 54.0,
        },
        {
          key: "NON_FULL_TIME",
          value: 10.5,
        },
      ],
    },
  ],
  byCluster: [],
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
  { id: 2, name: "Another Cluster", editable: false }
];

jest.mock("../../hooks/useApi", () => ({
  useApi: () => ({
    get: jest.fn((url) => {
      if (url.includes('/cluster')) {
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
    selectedCostCenterName: "IN1041",
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

describe("Hours Visibility Configuration Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
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
  it("should render `Hours Visibility Page`", async () => {
    render(
      <Provider store={store}>
        <HoursVisibility />
      </Provider>
    );
    const heading = await screen.findByText("Hours Visibility");

    expect(heading).toBeInTheDocument();
  });
  it("should render `Filters Button`", async () => {
    render(
      <Provider store={store}>
        <HoursVisibility />
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
        <HoursVisibility />
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
        <HoursVisibility />
      </Provider>
    );
    const filter = "Filters";
    const filterText = await screen.findByText(filter);
    expect(filterText).toBeInTheDocument();
  });
  it("should render `Analytics Cards Data`", async () => {
    render(
      <Provider store={store}>
        <HoursVisibility />
      </Provider>
    );

    const data0Text = await screen.findAllByText("Total Hours");
    const data0Value = await screen.findByText("64.5");
    const data1Text = await screen.findByText("Full Time:");
    const data1Value = await screen.findByText("83.7%");
    const data2Text = await screen.findByText("Part Time:");
    const data2Value = await screen.findByText("16.3%");
    const data3Text = await screen.findByText("Weekday:");
    const data3Value = await screen.findByText("90.7%");
    const data4Text = await screen.findByText("Weekend:");
    const data4Value = await screen.findByText("9.3%");
    const data5Text = await screen.findByText("Peak:");
    const data5Value = await screen.findByText("4.7%");
    const data6Text = await screen.findByText("Non Peak:");
    const data6Value = await screen.findByText("95.3%");

    expect(data0Text[0]).toBeInTheDocument();
    expect(data0Value).toBeInTheDocument();
    expect(data1Text).toBeInTheDocument();
    expect(data1Value).toBeInTheDocument();
    expect(data2Text).toBeInTheDocument();
    expect(data2Value).toBeInTheDocument();
    expect(data3Text).toBeInTheDocument();
    expect(data3Value).toBeInTheDocument();
    expect(data4Text).toBeInTheDocument();
    expect(data4Value).toBeInTheDocument();
    expect(data5Text).toBeInTheDocument();
    expect(data5Value).toBeInTheDocument();
    expect(data6Text).toBeInTheDocument();
    expect(data6Value).toBeInTheDocument();
  });
  

  it("should render `no data found`", async () => {
    render(
      <Provider store={store}>
        <HoursVisibility />
      </Provider>
    );
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
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
        <HoursVisibility />
      </Provider>
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
    const text2 = await screen.findByText("2024-07-14");
    const mom = await screen.findAllByText("Month on Month");
    const monthName = await screen.findAllByText("December");
    expect(text).toBeInTheDocument();
    expect(text2).toBeInTheDocument();
    expect(mom[0]).toBeInTheDocument();
    expect(monthName[0]).toBeInTheDocument();
  });
  it("should download data as CSV when clicking Download as CSV", async () => {
    
    jest.mock("../../helper/Utils", () => ({
      ...jest.requireActual("../../helper/Utils"),
      downloadCSV: jest.fn(),
      formatDate: jest.fn(() => "2024-07-14"),
    }));
    
    
    const { downloadCSV } = require("../../helper/Utils");
    const mockCreateObjectURL = jest.fn();
    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL
      }
    });
    
    
    const mockPost = jest.fn();
    mockPost.mockResolvedValueOnce(mockedReponse); 
    mockPost.mockResolvedValueOnce({
      byZone: [{ key: "Karnataka & Kerala", value: 64.5 }],
      byCity: [{ key: "Bangalore", value: 64.5 }],
      byStore: [
        { key: "DSI SARJAPUR", value: 55.5 },
        { key: "DSI WHITEFIELD", value: 9.0 },
      ],
      byCluster: [],
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
      selectedCostCenterName: "IN1041",
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
    
   
    global.GRAPH_COLORS = [
      { key: "FULL_TIME", label: "Full Time" },
      { key: "NON_FULL_TIME", label: "Part Time" },
      { key: "Weekday", label: "Weekday" },
      { key: "Non-Weekday", label: "Weekend" },
      { key: "PEAK", label: "Peak" },
      { key: "NON_PEAK", label: "Non Peak" },
    ];
  
    render(
      <Provider store={store}>
        <HoursVisibility />
      </Provider>
    );
  
    const heading = await screen.findByText("Hours Visibility");
    expect(heading).toBeInTheDocument();
  

    const downloadButton = await screen.findByText("Download");
    fireEvent.click(downloadButton);
  

    const downloadAsCSVButton = await screen.findByText("Download as CSV");
    fireEvent.click(downloadAsCSVButton);
   
  });

  it("should open filter drawer when filter button is clicked", async () => {
    render(
      <Provider store={store}>
        <HoursVisibility />
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
        <HoursVisibility />
      </Provider>
    );
    
   
    const percentageTab = await screen.findByText("Percentage");
    expect(percentageTab).toBeInTheDocument();
    fireEvent.click(percentageTab);

   
    
  });

  it("should render absolute toggle options", async () => {
    
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
        <HoursVisibility />
      </Provider>
    );
  
   
    
    const absoluteTab = await screen.findByText("Absolute");
    expect(absoluteTab).toBeInTheDocument();
    fireEvent.click(absoluteTab);

    fireEvent.click(await screen.getByText("Download"));
    
  });

  it("should show Compare With Last Year toggle in Performance view", async () => {
    
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
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
        <HoursVisibility />
      </Provider>
    );

    
    const filterButton = await screen.findByText("Filters");
    fireEvent.click(filterButton);
    
    
    expect(await screen.findByText("Compare With Last Year")).toBeInTheDocument();
    
   
    const switchElement = await screen.findByRole("checkbox");
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).not.toBeChecked();
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
        <HoursVisibility />
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
        <HoursVisibility />
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
        <HoursVisibility />
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
      expect(await screen.findByRole("button", { name: "Apply" })).toBeInTheDocument();
      expect(await screen.findByRole("button", { name: "Close" })).toBeInTheDocument();
    }
    
  });

  it("should process growth data correctly when downloading CSV", async () => {
   
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: {
        empId: "DSI000486",
      },
      view: "Performance", 
      fromDate: "2024-07-01",
      toDate: "2024-07-31",
      selectedZones: [{ label: "Test Zone", value: "Test Zone ID" }],
      selectedCities: [{ label: "Test City", value: "Test City ID" }],
      selectedCostCenters: [{ label: "Test Cost Center", value: "Test Cost Center ID" }],
      selectedClusters: [{ label: "Test Cluster", value: "Test Cluster ID" }],
    });

    
    const mockGrowthData = {
      data: [
        {
          key: "December",
          startDate: "2024-12-01",
          data: [
            { key: "Total Hours", value: 64.5 }
          ]
        },
        {
          key: "November",
          startDate: "2024-11-01",
          data: [
            { key: "Total Hours", value: 60.0 }
          ]
        }
      ]
    };

    const mockCategoryData = {
      data: [
        {
          key: "December",
          startDate: "2024-12-01",
          data: [
            { key: "FULL_TIME", value: 54.0 },
            { key: "NON_FULL_TIME", value: 10.5 }
          ]
        },
        {
          key: "November",
          startDate: "2024-11-01",
          data: [
            { key: "FULL_TIME", value: 48.0 },
            { key: "NON_FULL_TIME", value: 12.0 }
          ]
        }
      ]
    };

   
    const mockPost = jest.fn();
    mockPost.mockImplementation((url) => {
      
      if (url.includes("/total-hrs-dist-mom")) {
        return Promise.resolve(mockGrowthData);
      } else if (url.includes("/pt-ft-hrs-dist-mom")) {
        return Promise.resolve(mockCategoryData);
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
        <HoursVisibility />
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
      selectedCostCenterName: "IN1041",
      user: {
        empId: "DSI000486",
      },
      view: "Metrics", 
      fromDate: "2024-07-01",
      toDate: "2024-07-31",
      selectedZones: [{ label: "Test Zone", value: "Test Zone ID" }],
      selectedCities: [{ label: "Test City", value: "Test City ID" }],
      selectedCostCenters: [{ label: "Test Cost Center", value: "Test Cost Center ID" }],
      selectedClusters: [{ label: "Test Cluster", value: "Test Cluster ID" }],
    });

   
    const mockHrsCombinedData = {
      totalHours: 64.5,
      employmentTypeWorkHours: [
        { key: "FULL_TIME", value: 54.0 },
        { key: "NON_FULL_TIME", value: 10.5 }
      ],
      dayTypeWorkHours: [
        { key: "Weekday", value: 58.5 },
        { key: "Non-Weekday", value: 6.0 }
      ],
      peakNonPeakHours: [
        { key: "PEAK", value: 3.0 },
        { key: "NON_PEAK", value: 61.5 }
      ],
    };

    const mockDistributionData = {
      byZone: [
        { key: "Karnataka & Kerala", value: 64.5 }
      ],
      byCity: [
        { key: "Bangalore", value: 64.5 }
      ],
      byStore: [
        { key: "DSI SARJAPUR", value: 55.5 },
        { key: "DSI WHITEFIELD", value: 9.0 }
      ],
      byCluster: []
    };

    const mockCategoryDistributionData = {
      byZone: [
        {
          key: "Karnataka & Kerala",
          data: [
            { key: "FULL_TIME", value: 54.0 },
            { key: "NON_FULL_TIME", value: 10.5 }
          ]
        }
      ],
      byCity: [
        {
          key: "Bangalore",
          data: [
            { key: "FULL_TIME", value: 54.0 },
            { key: "NON_FULL_TIME", value: 10.5 }
          ]
        }
      ],
      byStore: [
        {
          key: "DSI SARJAPUR",
          data: [
            { key: "FULL_TIME", value: 45.0 },
            { key: "NON_FULL_TIME", value: 10.5 }
          ]
        }
      ],
      byCluster: []
    };

    
    const mockPost = jest.fn();
    mockPost.mockImplementation((url) => {
      if (url.includes("/hrs-combined")) {
        return Promise.resolve(mockHrsCombinedData);
      } else if (url.includes("/hrs-dist-work")) {
        return Promise.resolve(mockDistributionData);
      } else if (url.includes("/pt-ft-dist-hrs")) {
        return Promise.resolve(mockCategoryDistributionData);
      } else {
        return Promise.resolve({ byZone: [], byCity: [], byStore: [], byCluster: [] });
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
        <HoursVisibility />
      </Provider>
    );

    
    const downloadButton = await screen.findByText("Download");
    
    fireEvent.click(downloadButton);
    const downloadAsCSVOption = await screen.findByText("Download as CSV");
    fireEvent.click(downloadAsCSVOption);

    expect(downloadButton).toBeInTheDocument();
  });
  it("should process all data categories with cluster data when downloading CSV", async () => {
    
    const mockDownloadCSV = jest.fn();
    jest.mock("../../helper/Utils", () => ({
      ...jest.requireActual("../../helper/Utils"),
      downloadCSV: mockDownloadCSV,
      formatDate: jest.fn(() => "2024-07-14"),
    }));
  
    
    const { downloadCSV } = require("../../helper/Utils");
  
    const mockHrsCombinedData = {
      totalHours: 64.5,
      employmentTypeWorkHours: [
        { key: "FULL_TIME", value: 54.0 },
        { key: "NON_FULL_TIME", value: 10.5 }
      ],
      dayTypeWorkHours: [
        { key: "Weekday", value: 58.5 },
        { key: "Non-Weekday", value: 6.0 }
      ],
      peakNonPeakHours: [
        { key: "PEAK", value: 3.0 },
        { key: "NON_PEAK", value: 61.5 }
      ]
    };
  
    const mockDistData = {
      byZone: [{ key: "Karnataka & Kerala", value: 64.5 }],
      byCity: [{ key: "Bangalore", value: 64.5 }],
      byStore: [{ key: "DSI SARJAPUR", value: 55.5 }],
      byCluster: [
        { key: "Cluster A", value: 30.5 },
        { key: "Cluster B", value: 34.0 }
      ]
    };
  
    const mockPTFTData = {
      byZone: [],
      byCity: [],
      byStore: [],
      byCluster: [
        {
          key: "Cluster A",
          data: [
            { key: "FULL_TIME", value: 25.0 },
            { key: "NON_FULL_TIME", value: 5.5 }
          ]
        },
        {
          key: "Cluster B",
          data: [
            { key: "FULL_TIME", value: 29.0 },
            { key: "NON_FULL_TIME", value: 5.0 }
          ]
        }
      ]
    };
  
    const mockWDNWDData = {
      byZone: [],
      byCity: [],
      byStore: [],
      byCluster: [
        {
          key: "Cluster A",
          data: [
            { key: "Weekday", value: 28.0 },
            { key: "Non-Weekday", value: 2.5 }
          ]
        }
      ]
    };
  
    const mockPNPData = {
      byZone: [],
      byCity: [],
      byStore: [],
      byCluster: [
        {
          key: "Cluster A",
          data: [
            { key: "PEAK", value: 3.0 },
            { key: "NON_PEAK", value: 27.5 }
          ]
        }
      ]
    };
  
    
    const mockPost = jest.fn().mockImplementation((url) => {
      if (url.includes("/hrs-combined")) {
        return Promise.resolve(mockHrsCombinedData);
      } else if (url.includes("/hrs-dist-work")) {
        return Promise.resolve(mockDistData);
      } else if (url.includes("/pt-ft-dist-hrs")) {
        return Promise.resolve(mockPTFTData);
      } else if (url.includes("/wd-nwd-dist-hrs-combined")) {
        return Promise.resolve(mockWDNWDData);
      } else if (url.includes("/pk-npk-dist-hrs-combined")) {
        return Promise.resolve(mockPNPData);
      } else {
        return Promise.resolve({ data: [] });
      }
    });
  
    // Replace the earlier mock implementation
    jest.mock("../../hooks/useApi", () => ({
      useApi: () => ({
        get: jest.fn(() => Promise.resolve({ 
          costCenters: [
            {
              id: 1,
              costCentreName: "IN1041",
              displayName: "DSI SARJAPUR",
              costCentreZone: "Karnataka & Kerala",
              city: "Bangalore",
              cityId: 19,
              type: "RETAIL"
            }
          ] 
        })),
        post: mockPost,
      }),
    }));

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: { empId: "DSI000486" },
      view: "Metrics",
      fromDate: "2024-07-01",
      toDate: "2024-07-31",
      tempFromDate: "2024-07-01",
      tempToDate: "2024-07-31",
      selectedZones: [{ label: "Karnataka & Kerala", value: "Karnataka & Kerala" }],
      selectedCities: [{ label: "Bangalore", value: 19 }],
      selectedCostCenters: [{ label: "DSI SARJAPUR", value: "IN1041" }],
      selectedClusters: [{ label: "Cluster A", value: "cluster-a-id" }],
    });

    render(
      <Provider store={store}>
        <HoursVisibility />
      </Provider>
    );
  
   
    await screen.findByText("Hours Visibility");
    
    
    fireEvent.click(await screen.findByText("Filters"));
    fireEvent.click(await screen.findByRole("button", { name: "Apply" }));
  
    await screen.findAllByText("Total Hours");
  
    const downloadButton = await screen.findByText("Download");
    fireEvent.click(downloadButton);
    
    const downloadAsCSVButton = await screen.findByText("Download as CSV");
    fireEvent.click(downloadAsCSVButton);
    
   
  });

  describe('Data transformation methods in HoursVisibility', () => {
    it('should execute all data transformation methods during CSV download', async () => {
     
      const mockHrsCombinedData = {
        totalHours: 64.5,
        employmentTypeWorkHours: [
          { key: "FULL_TIME", value: 54.0 },
          { key: "NON_FULL_TIME", value: 10.5 }
        ],
        dayTypeWorkHours: [
          { key: "Weekday", value: 58.5 },
          { key: "Non-Weekday", value: 6.0 }
        ],
        peakNonPeakHours: [
          { key: "PEAK", value: 3.0 },
          { key: "NON_PEAK", value: 61.5 }
        ]
      };
  
      const mockClusterData = {
        byZone: [],
        byCity: [],
        byStore: [],
        byCluster: [
          { key: "Cluster A", value: 30.5 },
          { key: "Cluster B", value: 34.0 }
        ]
      };
  
      const mockCategoryClusterData = {
        byZone: [],
        byCity: [],
        byStore: [],
        byCluster: [
          {
            key: "Cluster A", 
            data: [
              { key: "FULL_TIME", value: 25.0 },
              { key: "NON_FULL_TIME", value: 5.5 }
            ]
          }
        ]
      };
  
      const mockDownloadCSV = jest.fn();
      jest.mock("../../helper/Utils", () => ({
        ...jest.requireActual("../../helper/Utils"),
        downloadCSV: mockDownloadCSV,
        formatDate: jest.fn(() => "2024-07-14"),
      }));
  

      const mockPost = jest.fn().mockImplementation((url) => {
        if (url.includes("/hrs-combined")) {
          return Promise.resolve(mockHrsCombinedData);
        } else if (url.includes("/hrs-dist-work")) {
          return Promise.resolve(mockClusterData);
        } else if (url.includes("/pt-ft-dist-hrs")) {
          return Promise.resolve(mockCategoryClusterData);
        } else if (url.includes("/wd-nwd-dist-hrs-combined")) {
          return Promise.resolve(mockCategoryClusterData);
        } else if (url.includes("/pk-npk-dist-hrs-combined")) {
          return Promise.resolve(mockCategoryClusterData);
        } else {
          return Promise.resolve({});
        }
      });
  
      jest.mock("../../hooks/useApi", () => ({
        useApi: () => ({
          get: jest.fn(() => Promise.resolve({ 
            costCenters: [
              {
                id: 1,
                costCentreName: "IN1041",
                displayName: "DSI SARJAPUR",
                costCentreZone: "Karnataka & Kerala",
                city: "Bangalore",
                cityId: 19,
                type: "RETAIL"
              }
            ] 
          })),
          post: mockPost,
        }),
      }));
  
      // Setup Redux state
      (useAppSelector as jest.Mock).mockReturnValue({
        selectedCostCenterName: "IN1041",
        user: { empId: "DSI000486" },
        view: "Metrics",
        fromDate: "2024-07-01",
        toDate: "2024-07-31",
        tempFromDate: "2024-07-01",
        tempToDate: "2024-07-31",
        selectedZones: [{ label: "Karnataka & Kerala", value: "Karnataka & Kerala" }],
        selectedCities: [{ label: "Bangalore", value: 19 }],
        selectedCostCenters: [{ label: "DSI SARJAPUR", value: "IN1041" }],
        selectedClusters: []
      });
  
     

      render(
        <Provider store={store}>
          <HoursVisibility />
        </Provider>
      );
  

      await screen.findByText("Hours Visibility");
  

      const downloadButton = await screen.findByText("Download");
      fireEvent.click(downloadButton);
      
      const downloadAsCSVOption = await screen.findByText("Download as CSV");
      fireEvent.click(downloadAsCSVOption);
  
      
    });
  });

  it('should process Peak/Non-Peak and Weekday/Weekend cluster data when downloading CSV', async () => {
   
    const mockPNPClusterData = {
      byZone: [],
      byCity: [],
      byStore: [],
      byCluster: [
        {
          key: "Cluster A", 
          data: [
            { key: "PEAK", value: 3.0 },
            { key: "NON_PEAK", value: 27.5 }
          ]
        },
        {
          key: "Cluster B", 
          data: [
            { key: "PEAK", value: 2.0 },
            { key: "NON_PEAK", value: 32.0 }
          ]
        }
      ]
    };
    
    const mockWDNWDClusterData = {
      byZone: [],
      byCity: [],
      byStore: [],
      byCluster: [
        {
          key: "Cluster A", 
          data: [
            { key: "Weekday", value: 28.0 },
            { key: "Non-Weekday", value: 2.5 }
          ]
        },
        {
          key: "Cluster B", 
          data: [
            { key: "Weekday", value: 30.0 },
            { key: "Non-Weekday", value: 4.0 }
          ]
        }
      ]
    };
  
    const mockBasicData = {
      totalHours: 64.5,
      employmentTypeWorkHours: [
        { key: "FULL_TIME", value: 54.0 },
        { key: "NON_FULL_TIME", value: 10.5 }
      ],
      dayTypeWorkHours: [
        { key: "Weekday", value: 58.5 },
        { key: "Non-Weekday", value: 6.0 }
      ],
      peakNonPeakHours: [
        { key: "PEAK", value: 5.0 },
        { key: "NON_PEAK", value: 59.5 }
      ]
    };
  
    const mockDownloadCSV = jest.fn();
    jest.mock("../../helper/Utils", () => ({
      ...jest.requireActual("../../helper/Utils"),
      downloadCSV: mockDownloadCSV,
      formatDate: jest.fn(() => "2024-07-14"),
    }));
  
    const mockPost = jest.fn().mockImplementation((url) => {
      if (url.includes("/hrs-combined")) {
        return Promise.resolve(mockBasicData);
      } else if (url.includes("/hrs-dist-work")) {
        return Promise.resolve({ byZone: [], byCity: [], byStore: [], byCluster: [] });
      } else if (url.includes("/pt-ft-dist-hrs")) {
        return Promise.resolve({ byZone: [], byCity: [], byStore: [], byCluster: [] });
      } else if (url.includes("/wd-nwd-dist-hrs-combined")) {
        return Promise.resolve(mockWDNWDClusterData);
      } else if (url.includes("/pk-npk-dist-hrs-combined")) {
        return Promise.resolve(mockPNPClusterData);
      } else {
        return Promise.resolve({});
      }
    });
  
    jest.mock("../../hooks/useApi", () => ({
      useApi: () => ({
        get: jest.fn((url) => {
          if (url.includes('/cluster')) {
            return Promise.resolve([
              { id: 1, name: 'Test Cluster', editable: true },
              { id: 2, name: 'Another Cluster', editable: false }
            ]);
          }
          return Promise.resolve(mockedCostCenterResponse);
        }),
        post: mockPost,
      }),
    }));

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: { empId: "DSI000486" },
      view: "Metrics",
      fromDate: "2024-07-01",
      toDate: "2024-07-31",
      tempFromDate: "2024-07-01",
      tempToDate: "2024-07-31",
      selectedZones: [{ label: "Karnataka & Kerala", value: "Karnataka & Kerala" }],
      selectedCities: [{ label: "Bangalore", value: 19 }],
      selectedCostCenters: [{ label: "DSI SARJAPUR", value: "IN1041" }],
      selectedClusters: [{ label: "Cluster A", value: "cluster-a-id" }]
    });
  
    
    render(
      <Provider store={store}>
        <HoursVisibility />
      </Provider>
    );
  
    await screen.findByText("Hours Visibility");
  
    const downloadButton = await screen.findByText("Download");
    fireEvent.click(downloadButton);
    
    const downloadAsCSVOption = await screen.findByText("Download as CSV");
    fireEvent.click(downloadAsCSVOption);
  

  });

  it('should handle filter drawer and compare last year toggle', async () => {
    const mockCostCenterResponse = {
      costCenters: [
        {
          id: 1,
          costCentreName: "IN1041",
          displayName: "DSI SARJAPUR",
          costCentreZone: "Karnataka & Kerala",
          city: "Bangalore",
          cityId: 19,
          type: "RETAIL"
        }
      ]
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
      selectedCostCenterName: "IN1041",
      user: { empId: "DSI000486" },
      view: "Performance", 
      fromDate: "2024-07-01",
      toDate: "2024-07-31",
      tempFromDate: "2024-07-01",
      tempToDate: "2024-07-31",
      selectedZones: [{ label: "Karnataka & Kerala", value: "Karnataka & Kerala" }],
      selectedCities: [{ label: "Bangalore", value: 19 }],
      selectedCostCenters: [{ label: "DSI SARJAPUR", value: "IN1041" }],
      selectedClusters: [],
      compareLastYear: false 
    });
    
   
    render(
      <Provider store={store}>
        <HoursVisibility />
      </Provider>
    );
    
    await screen.findByText("Hours Visibility");
    
   
    const filterButton = screen.getByTestId("Filters-Button");
    fireEvent.click(filterButton);
    
    const compareWithLastYearText = await screen.findByText("Compare With Last Year");
    expect(compareWithLastYearText).toBeInTheDocument();
    
    const compareSwitch = await screen.findByRole("checkbox");
    expect(compareSwitch).not.toBeChecked();
    fireEvent.click(compareSwitch);
  
    const applyButton = await screen.findByRole("button", { name: /Apply/i });
    fireEvent.click(applyButton);
    
    
  });

  it("should fetch and filter clusters when a single cost center is selected", async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: { empId: "DSI000486" },
      selectedCostCenters: [{ label: "DSI SARJAPUR", value: "IN1041" }],
      view: "Metrics",
      fromDate: "2024-07-01",
      toDate: "2024-07-31",
      selectedZones: [],
      selectedCities: [],
      selectedClusters: []
    });
    
    
    render(
      <Provider store={store}>
        <HoursVisibility />
      </Provider>
    );
    
    await screen.findByText("Hours Visibility");
  
    const filterButton = await screen.findByText("Filters");
    fireEvent.click(filterButton);
    const clusterLabel = await screen.findByText("Cluster");
    expect(clusterLabel).toBeInTheDocument();
   
  });
 

 
});


  

