import React from "react";
import axios from "axios";
import { fireEvent, render, screen, waitFor ,act} from "@testing-library/react";
import { store, useAppSelector } from "../../app/store/store";
import { Provider } from "react-redux";
import { IPeakHoursConfig } from "../../helper/Interface";
import StoreConfiguration from "./StoreConfiguration";
import { setImmediate } from 'timers';
import { useApi } from "../../hooks/useApi";

import CustomBox from "../roster/common/CustomBox";
const flushPromises = () => new Promise(setImmediate);


jest.mock("../../hooks/useApi", () => ({
  useApi: jest.fn(),
}));


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
  useAppDispatch: jest.fn(),
  store: {
    getState: jest.fn(),
    subscribe: jest.fn(),
  },
}));




const useApiMock = useApi as jest.Mock;
describe("Store Configuration Component", () => {
  beforeEach(() => {

const mockedPeakHoursConfig: IPeakHoursConfig[] = [
  {
    id: 102,
    configType: "STORE",
    costCentre: "IN1041",
    effectiveDate: "2024-11-24",
    peakHourIntervals: [
      {
        startTime: "12:00:00",
        endTime: "14:00:00",
      },
      {
        startTime: "18:00:00",
        endTime: "20:00:00",
      },
    ],
  },
  {
    id: 303,
    configType: "STORE",
    costCentre: "IN1041",
    effectiveDate: "2025-01-05",
    peakHourIntervals: [
      {
        startTime: "01:00:00",
        endTime: "02:00:00",
      },
      {
        startTime: "18:00:00",
        endTime: "20:00:00",
      },
    ],
  },
  {
    id: 304,
    configType: "STORE",
    costCentre: "IN1041",
    effectiveDate: "2024-12-08",
    peakHourIntervals: [
      {
        startTime: "00:30:00",
        endTime: "02:00:00",
      },
      {
        startTime: "18:00:00",
        endTime: "20:00:00",
      },
    ],
  },
  {
    id: 305,
    configType: "STORE",
    costCentre: "IN1041",
    effectiveDate: "2025-02-16",
    peakHourIntervals: [
      {
        startTime: "01:30:00",
        endTime: "04:30:00",
      },
      {
        startTime: "18:00:00",
        endTime: "20:00:00",
      },
    ],
  },
  {
    id: 2,
    configType: "DEFAULT",
    costCentre: "",
    effectiveDate: "2024-11-20",
    peakHourIntervals: [
      {
        startTime: "08:00:00",
        endTime: "10:00:00",
      },
      {
        startTime: "12:00:00",
        endTime: "14:00:00",
      },
    ],
  },
];




const mockedWeeksResponse = [
  { id: 1, year: 2024, number: 1, startDate: "2025-01-01", endDate: "2025-01-07" },
  { id: 2, year: 2024, number: 2, startDate: "2025-01-08", endDate: "2025-01-14" },
];
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: {
        empId: "DSI000486",
      },
    });
    useApiMock.mockReturnValue({
      get: jest.fn((url) => {
        if (url.includes("/peak-hours")) {
          return Promise.resolve(mockedPeakHoursConfig);
        } else if (url.includes("/week")) {
          return Promise.resolve(mockedWeeksResponse);
        }
        return Promise.resolve([]);
      }),
      put: jest.fn(() => Promise.resolve({ message: "API Called Successfully",success : true,})), 
      post: jest.fn(() => Promise.resolve({ message: "API Called Successfully" , success:true })),
      Delete: jest.fn(() => Promise.resolve({ message: "Deleted API Successfully" ,success : true})),
    });
  });
    
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
  it("should render `Store Configuration Page`", async () => {
    render(
      <Provider store={store}>
        <StoreConfiguration />
      </Provider>
    );

    expect(screen.getByText("Store Configuration")).toBeInTheDocument();
  });
  it("should render `Peak Hours`", async () => {
    render(
      <Provider store={store}>
        <StoreConfiguration />
      </Provider>
    );
    const Cards = ["Peak Hours"];
    Cards.forEach(async (card) => {
      const cardText = await screen.findByText(card);
      expect(cardText).toBeInTheDocument();
    });
  });
  it("should render `Peak Hours Data`", async () => {
    render(
      <Provider store={store}>
        <StoreConfiguration />
      </Provider>
    );
    const headings = await screen.findAllByText("Peak Hour Intervals");
    expect(headings[0]).toBeInTheDocument();
    const live = await screen.findByText("ACTIVE");
    expect(live).toBeInTheDocument();
    const defaultText = await screen.findByText("DEFAULT");
    expect(defaultText).toBeInTheDocument();
  });

  it("should render `+ Add Peak Hours`", async () => {
    render(
      <Provider store={store}>
        <StoreConfiguration />
      </Provider>
    );
    const button = await screen.findByText("Add Peak Hours");
    expect(button).toBeInTheDocument();
  });
  it("should render `Add Configuration Modal`", async () => {
    render(
      <Provider store={store}>
        <StoreConfiguration />
      </Provider>
    );
    const button = await screen.findByText("Add Peak Hours");
    await fireEvent.click(button);
    const heading = screen.queryByText("Add Configuration");
    expect(heading).toBeInTheDocument();
    const year = screen.queryByText("Select Year");
    expect(year).toBeInTheDocument();
    const effectiveWeek = screen.queryByText("Effective Week");
    expect(effectiveWeek).toBeInTheDocument();
    const saveButton = await screen.findByText("Save");
    expect(saveButton).toBeInTheDocument();
  });


  it("should Delete configuration", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-07-14"));

const mockedPeakHoursConfigNew: IPeakHoursConfig[] = [
  {
    id: 102,
    configType: "STORE",
    costCentre: "IN1041",
    effectiveDate: "2024-07-16",
    peakHourIntervals: [
      {
        startTime: "12:00:00",
        endTime: "14:00:00",
      },
      {
        startTime: "18:00:00",
        endTime: "20:00:00",
      },
    ],
  },
  {
    id: 303,
    configType: "STORE",
    costCentre: "IN1041",
    effectiveDate: "2025-01-05",
    peakHourIntervals: [
      {
        startTime: "01:00:00",
        endTime: "02:00:00",
      },
      {
        startTime: "18:00:00",
        endTime: "20:00:00",
      },
    ],
  },
  {
    id: 304,
    configType: "STORE",
    costCentre: "IN1041",
    effectiveDate: "2024-12-08",
    peakHourIntervals: [
      {
        startTime: "00:30:00",
        endTime: "02:00:00",
      },
      {
        startTime: "18:00:00",
        endTime: "20:00:00",
      },
    ],
  },
  {
    id: 305,
    configType: "STORE",
    costCentre: "IN1041",
    effectiveDate: "2025-02-16",
    peakHourIntervals: [
      {
        startTime: "01:30:00",
        endTime: "04:30:00",
      },
      {
        startTime: "18:00:00",
        endTime: "20:00:00",
      },
    ],
  },
  {
    id: 2,
    configType: "DEFAULT",
    costCentre: "",
    effectiveDate: "2024-11-20",
    peakHourIntervals: [
      {
        startTime: "08:00:00",
        endTime: "10:00:00",
      },
      {
        startTime: "12:00:00",
        endTime: "14:00:00",
      },
    ],
  },
];




// Mock week response data
const mockedWeeksResponseNew = [
  { id: 1, year: 2024, number: 1, startDate: "2025-01-01", endDate: "2025-01-07" },
  { id: 2, year: 2024, number: 2, startDate: "2025-01-08", endDate: "2025-01-14" },
];
    const deleteMock = jest.fn(() =>
      Promise.resolve({ message: "Deleted API Successfully", success: true })
    );
    useApiMock.mockImplementation(() => ({
      get: jest.fn((url) => {
        if (url.includes("/peak-hours")) {
          return Promise.resolve(mockedPeakHoursConfigNew);
        } else if (url.includes("/week")) {
          return Promise.resolve(mockedWeeksResponseNew);
        }
        return Promise.resolve([]);
      }),
      put: jest.fn(() => Promise.resolve({ message: "API Called Successfully", success: true })),
      post: jest.fn(() => Promise.resolve({ message: "API Called Successfully", success: true })),
      Delete: deleteMock,
    }));
  
    await act(async () => {
      render(
        <Provider store={store}>
          <StoreConfiguration />
        </Provider>
      );
    });
    
    await waitFor(() => {
      const configCards = screen.getAllByText("Peak Hour Intervals");
      expect(configCards.length).toBeGreaterThan(0);
    });
  
    const deleteButton = (await screen.getAllByText("Delete"))[0];
    fireEvent.click(deleteButton);
    await screen.getByText("Delete Configuration");
    const finalDeleteButton = await screen.getByLabelText("delete-dialog-box");
    fireEvent.click(finalDeleteButton);
  
  
  });


  

  it("should edit configuration and retain effective date", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-07-14"));

    const mockedPeakHoursConfig: IPeakHoursConfig[] = [
      {
        id: 102,
        configType: "STORE",
        costCentre: "IN1041",
        effectiveDate: "2024-11-17",
        peakHourIntervals: [
          {
            startTime: "12:00:00",
            endTime: "14:00:00",
          },
          {
            startTime: "18:00:00",
            endTime: "20:00:00",
          },
        ],
      },
      {
        id: 303,
        configType: "STORE",
        costCentre: "IN1041",
        effectiveDate: "2025-01-05",
        peakHourIntervals: [
          {
            startTime: "01:00:00",
            endTime: "02:00:00",
          },
          {
            startTime: "18:00:00",
            endTime: "20:00:00",
          },
        ],
      },
      {
        id: 304,
        configType: "STORE",
        costCentre: "IN1041",
        effectiveDate: "2024-12-08",
        peakHourIntervals: [
          {
            startTime: "00:30:00",
            endTime: "02:00:00",
          },
          {
            startTime: "18:00:00",
            endTime: "20:00:00",
          },
        ],
      },
      {
        id: 305,
        configType: "STORE",
        costCentre: "IN1041",
        effectiveDate: "2025-02-16",
        peakHourIntervals: [
          {
            startTime: "01:30:00",
            endTime: "04:30:00",
          },
          {
            startTime: "18:00:00",
            endTime: "20:00:00",
          },
        ],
      },
      {
        id: 2,
        configType: "DEFAULT",
        costCentre: "",
        effectiveDate: "2024-11-20",
        peakHourIntervals: [
          {
            startTime: "08:00:00",
            endTime: "10:00:00",
          },
          {
            startTime: "12:00:00",
            endTime: "14:00:00",
          },
        ],
      },
    ];
  
    // Mock weeks response with correct week data
    const mockedWeeksResponseNew = [
      { id: 1, year: 2024, number: 1, startDate: "2024-07-15", endDate: "2024-07-21" },
      { id: 2, year: 2024, number: 2, startDate: "2024-07-21", endDate: "2024-07-28" },
    ];
    useApiMock.mockImplementation(() => ({
      get: jest.fn((url) => {
        if (url.includes("/peak-hours")) {
          return Promise.resolve(mockedPeakHoursConfig);
        } else if (url.includes("/week")) {
          return Promise.resolve(mockedWeeksResponseNew);
        }
        return Promise.resolve([]);
      }),
      put: jest.fn(),
      post: jest.fn(() => Promise.resolve({ message: "API Called Successfully", success: true })),
      Delete: jest.fn(() => Promise.resolve({ message: "Deleted API Successfully", success: true })),
    }));
  
    await act(async () => {
      render(
        <Provider store={store}>
          <StoreConfiguration />
        </Provider>
      );
    });
  
    await waitFor(() => {
      const configCards = screen.getAllByText("Peak Hour Intervals");
      expect(configCards.length).toBeGreaterThan(0);
    });
  
    const editButton = screen.getAllByLabelText("Edit")[0];
    act(() => fireEvent.click(editButton));
  
    await act(async () => {
      await flushPromises();
    });
  
    await waitFor(() => expect(screen.getByText("Edit Interval")).toBeInTheDocument());
  
    await waitFor(() => {
      expect(screen.getByText("Effective Week")).toBeInTheDocument();
    });
  
    const comboboxes = await screen.findAllByRole("combobox");
    const selectedEndTime = comboboxes[1];

     fireEvent.change(selectedEndTime , {
       target : {value: "14:00"}
    })
    fireEvent.click((await screen.findByText("02:00 PM (2 hr)")));

    const saveButton = await screen.findByText("Save");
    act(() => fireEvent.click(saveButton));
  
    jest.useRealTimers();
    
  });
  
  
  
  it("should open Add Configuration modal with reset fields", async () => {
    
    jest.useFakeTimers().setSystemTime(new Date("2024-07-14"));

    render(
        <Provider store={store}>
            <StoreConfiguration />
        </Provider>
    );

    // Click "Add Peak Hours" to open modal
    fireEvent.click(screen.getByText("Add Peak Hours"));

    // Verify modal heading
    expect(screen.getByText("Add Configuration")).toBeInTheDocument();

    // Get all comboboxes
    const comboboxes = screen.getAllByRole("combobox");
    const selectedYearCombobox = comboboxes[0];

    // Ensure "Select Year" is visible
    expect(screen.queryByText("Select Year")).toBeInTheDocument();

    // Change year to 2025
    fireEvent.change(selectedYearCombobox, { target: { value: "2025" } });

    // Wait for "2025" option to be available and click it
    const yearOption = await screen.findByText("2025");
    fireEvent.click(yearOption);

  

    await waitFor(() => expect(screen.getByText("Effective Week")).toBeInTheDocument());


    // Select Effective Week dropdown
    const selectedEffectiveWeek = comboboxes[1];

    fireEvent.change(selectedEffectiveWeek , {
      target : {value: "Week 1"}
    })

    const week1Option = await screen.findByText(/Week 1/i); 
    fireEvent.click(week1Option); 


    const selectedStartTime = comboboxes[2];
    fireEvent.change(selectedStartTime , {
      target : {value : "12:00"}
    })
    fireEvent.click((await screen.findByText("12:00 PM")));

    await waitFor(() => {
      expect(screen.getByText("12:00 PM")).toBeInTheDocument();
    });
    const selectedEndTime = comboboxes[3];
    fireEvent.change(selectedEndTime, { target: { value: "14:00" } });

    fireEvent.click((await screen.findByText("02:00 PM (2 hr)")));
    
    await waitFor(() => expect(screen.getByText("Save")).toBeInTheDocument());

    fireEvent.click((await screen.findByText("Save")));

    jest.useRealTimers();
});



it("should Add Interval", async () => {
  jest.useFakeTimers().setSystemTime(new Date("2024-07-14"));
  await act(async () => {
    render(
      <Provider store={store}>
        <StoreConfiguration />
      </Provider>
    );
  });
  
  await waitFor(() => {
    const configCards = screen.getAllByText("Peak Hour Intervals");
    expect(configCards.length).toBeGreaterThan(0);
  });

  const addIntervalButton = (await screen.findAllByText(/Add interval/i))[0];
  fireEvent.click(addIntervalButton);


 
});








});
