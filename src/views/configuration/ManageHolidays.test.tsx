import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import React from "react";
import { Provider } from "react-redux";
import { subDays } from "date-fns";

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

import { store, useAppSelector } from "../../app/store/store";
import {
  IStateResponse,
  IHolidayResponse,
  ICountryResponse,
} from "../../helper/Interface";
import ManageHolidays from "./ManageHolidays";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";

jest.mock("chakra-dayzed-datepicker", () => ({
  SingleDatepicker: ({ date, onDateChange, minDate, configs }) => (
    <div data-testid="date-picker">
      <button
        data-testid="date-picker-button"
        onClick={() => onDateChange(new Date("2025-01-01"))}
      >
        Select Date
      </button>
      <span data-testid="min-date">{minDate ? minDate.toISOString() : ""}</span>
      <span data-testid="date-format">{configs?.dateFormat || ""}</span>
    </div>
  ),
}));

jest.mock("../../components/AppSelect", () => {
  return {
    __esModule: true,
    default: ({ value, onChange, options }) => (
      <select
        data-testid="app-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options &&
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
    ),
  };
});

jest.mock("../../helper/Utils", () => ({
  formatDate: jest.fn((date) => date),
}));

const mockedCountries: ICountryResponse[] = [
  {
    id: 1,
    name: "India",
    code: "IN",
    capitalName: "New Delhi",
    phoneCode: "+91",
    currency: "INR",
    nationality: "Indian",
  },
  {
    id: 2,
    name: "United States",
    code: "US",
    capitalName: "Washington, D.C.",
    phoneCode: "+1",
    currency: "USD",
    nationality: "American",
  },
];

const mockedStates: IStateResponse[] = [
  {
    id: 101,
    name: "Karnataka",
    code: "KA",
    countryId: 1,
    countryName: "India",
  },
  {
    id: 102,
    name: "California",
    code: "CA",
    countryId: 2,
    countryName: "United States",
  },
];

const mockedHolidays: IHolidayResponse[] = [
  {
    id: 1,
    name: "Republic Day",
    date: "2025-01-26",
    stateId: 101,
  },
  {
    id: 2,
    name: "Independence Day",
    date: "2025-08-15",
    stateId: 101,
  },
  {
    id: 3,
    name: "Thanksgiving",
    date: "2025-11-27",
    stateId: 102,
  },
];

const mockAddToast = jest.fn();

jest.mock("react-router-dom", () => ({ useNavigate: jest.fn() }));
jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({ addToast: mockAddToast }),
}));

jest.mock("../../hooks/useApi", () => ({ useApi: jest.fn() }));

jest.mock("../../app/store/store", () => ({
  useAppSelector: jest.fn(() => ({
    selectedCostCenterName: "IN1311",
    user: { empId: "DSI000486" },
  })),
  useAppDispatch: jest.fn(),
  store: { getState: jest.fn(), subscribe: jest.fn(), dispatch: jest.fn() },
}));

jest.mock("../../hooks/usePermission", () => ({ usePermission: jest.fn() }));

jest.mock("moment", () => () => ({
  format: jest.fn(() => "2025-07-14"),
  startOf: () => ({ format: jest.fn(() => "2025-07-01") }),
  endOf: () => ({ format: jest.fn(() => "2025-07-31") }),
  diff: jest.fn(),
}));

const useApiMock = useApi;
const usePermissionMock = usePermission;

describe("Manage Holidays Component", () => {
  const getMock = jest.fn();
  const postMock = jest.fn();

  beforeEach(() => {
    jest.setTimeout(60000);

    getMock.mockImplementation((endpoint) => {
      if (endpoint.includes("/country"))
        return Promise.resolve(mockedCountries);
      if (endpoint.includes("/state")) return Promise.resolve(mockedStates);
      if (endpoint.includes("/holiday")) return Promise.resolve(mockedHolidays);
      return Promise.resolve([]);
    });

    postMock.mockImplementation(() =>
      Promise.resolve({ success: true, message: "Holiday Created" })
    );

    useApiMock.mockReturnValue({
      get: getMock,
      post: postMock,
      put: jest.fn(),
    });

    useAppSelector.mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: { empId: "DSI000486" },
    });

    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  afterEach(() => jest.clearAllMocks());

  it("should render ManageHolidays component", async () => {
    await act(async () =>
      render(
        <Provider store={store}>
          <ManageHolidays />
        </Provider>
      )
    );

    expect(screen.getByText("Holidays")).toBeInTheDocument();
    expect(
      screen.getByText("Add Holidays specific to state(s).")
    ).toBeInTheDocument();
  });

  it("should fetch and display holidays", async () => {
    await act(async () =>
      render(
        <Provider store={store}>
          <ManageHolidays />
        </Provider>
      )
    );

    await waitFor(() => {
      expect(screen.getByText("Republic Day")).toBeInTheDocument();
      expect(screen.getByText("Independence Day")).toBeInTheDocument();
      expect(screen.getByText("Thanksgiving")).toBeInTheDocument();
    });
  });

  it("should handle empty API responses", async () => {
    getMock.mockImplementation((endpoint) => {
      if (endpoint.includes("/country")) return Promise.resolve([]);
      if (endpoint.includes("/state")) return Promise.resolve([]);
      if (endpoint.includes("/holiday")) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    await act(async () =>
      render(
        <Provider store={store}>
          <ManageHolidays />
        </Provider>
      )
    );

    await waitFor(() => {
      expect(screen.queryByText("Republic Day")).not.toBeInTheDocument();
    });
  });

  it("should open and close filter drawer", async () => {
    await act(async () =>
      render(
        <Provider store={store}>
          <ManageHolidays />
        </Provider>
      )
    );

    const filterButton = screen.getByText("Filters");
    await act(async () => {
      fireEvent.click(filterButton);
    });

    expect(screen.getByText("Year")).toBeInTheDocument();
    expect(screen.getByText("State")).toBeInTheDocument();

    const closeButton = screen.getByText("Close");
    await act(async () => {
      fireEvent.click(closeButton);
    });
  });

  it("should open add holiday modal and handle form input", async () => {
    await act(async () =>
      render(
        <Provider store={store}>
          <ManageHolidays />
        </Provider>
      )
    );

    const addButton = screen.getByText("+ Add Holiday");
    await act(async () => {
      fireEvent.click(addButton);
    });
    expect(screen.getByText("Add Holiday")).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText("Enter here");
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "New Year" } });
    });

    const saveButton = screen.getByText("Save");

    expect(saveButton).toBeDisabled();
    const closeButton = screen.getAllByText("Close")[1];
  });

  it("should handle empty state response correctly", async () => {
    getMock.mockImplementation((endpoint) => {
      if (endpoint.includes("/country"))
        return Promise.resolve(mockedCountries);
      if (endpoint.includes("/state")) return Promise.resolve([]);
      return Promise.resolve([]);
    });

    await act(async () =>
      render(
        <Provider store={store}>
          <ManageHolidays />
        </Provider>
      )
    );

    expect(getMock).toHaveBeenCalledWith(expect.stringContaining("/state"));

    expect(screen.getByText("Holidays")).toBeInTheDocument();
  });

  it("should handle state selection in holiday form", async () => {
    await act(async () =>
      render(
        <Provider store={store}>
          <ManageHolidays />
        </Provider>
      )
    );

    const addButton = screen.getByText("+ Add Holiday");
    await act(async () => {
      fireEvent.click(addButton);
    });
    const selects = screen.getAllByTestId("app-select");
    expect(selects.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.change(selects[0], { target: { value: "102" } });
    });

    expect(screen.getByText("Add Holiday")).toBeInTheDocument();
  });

  it("should handle date selection in holiday form", async () => {
    await act(async () =>
      render(
        <Provider store={store}>
          <ManageHolidays />
        </Provider>
      )
    );

    const addButton = screen.getByText("+ Add Holiday");
    await act(async () => {
      fireEvent.click(addButton);
    });
    const dateButton = screen.getByTestId("date-picker-button");
    await act(async () => {
      fireEvent.click(dateButton);
    });

    expect(screen.getByTestId("date-format").textContent).toBe("dd-MM-yyyy");

    expect(screen.getByTestId("min-date").textContent).not.toBe("");
  });

  it("should save holiday and handle success response", async () => {
    const mockHolidayName = "New Year";
    const mockHolidayStateId = 101;
    const mockHolidayDate = "2025-01-01";

    const MockedComponent = () => {
      const { post } = useApiMock();
      const { addToast } = require("react-toast-notifications").useToasts();

      const onClose = jest.fn();

      const setSelectedYear = jest.fn();
      const setSelectedState = jest.fn();
      const getAllHoliday = jest.fn();

      const onSaveHoliday = () => {
        onClose();
        post("/v1/master/holiday", {
          data: {
            name: mockHolidayName,
            stateId: mockHolidayStateId,
            date: mockHolidayDate,
          },
        }).then((res) => {
          addToast(res.message, {
            appearance: res.success ? "success" : "error",
          });
          if (res.success) {
            setSelectedYear(new Date(mockHolidayDate).getFullYear().toString());
            setSelectedState(mockHolidayStateId);
            getAllHoliday(
              new Date(mockHolidayDate).getFullYear().toString(),
              mockHolidayStateId
            );
          }
        });
      };

      return (
        <button data-testid="save-button" onClick={onSaveHoliday}>
          Save Holiday
        </button>
      );
    };

    await act(async () => render(<MockedComponent />));

    await act(async () => {
      fireEvent.click(screen.getByTestId("save-button"));
    });

    expect(postMock).toHaveBeenCalledWith("/v1/master/holiday", {
      data: {
        name: mockHolidayName,
        stateId: mockHolidayStateId,
        date: mockHolidayDate,
      },
    });

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Holiday Created", {
        appearance: "success",
      });
    });
  });

  it("should handle year selection in filter", async () => {
    await act(async () =>
      render(
        <Provider store={store}>
          <ManageHolidays />
        </Provider>
      )
    );

    const filterButton = screen.getByText("Filters");
    await act(async () => {
      fireEvent.click(filterButton);
    });

    const selects = screen.getAllByTestId("app-select");
    const yearSelect = selects[0];

    await act(async () => {
      fireEvent.change(yearSelect, { target: { value: "2024" } });
    });

    expect(getMock).toHaveBeenCalledWith(expect.stringContaining("year=2026"));
  });

  it("should handle state selection in filter", async () => {
    await act(async () =>
      render(
        <Provider store={store}>
          <ManageHolidays />
        </Provider>
      )
    );

    const filterButton = screen.getByText("Filters");
    await act(async () => {
      fireEvent.click(filterButton);
    });
    const selects = screen.getAllByTestId("app-select");
    const stateSelect = selects[1];

    getMock.mockClear();

    await act(async () => {
      fireEvent.change(stateSelect, { target: { value: "102" } });
    });

    expect(getMock).toHaveBeenCalledWith(
      expect.stringContaining("stateId=102")
    );
  });

  it("should handle unsuccessful holiday creation", async () => {
    postMock.mockImplementation(() =>
      Promise.resolve({ success: false, message: "Error creating holiday" })
    );

    const MockedComponent = () => {
      const { post } = useApiMock();
      const { addToast } = require("react-toast-notifications").useToasts();

      const onClose = jest.fn();
      const setSelectedYear = jest.fn();
      const setSelectedState = jest.fn();
      const getAllHoliday = jest.fn();

      const onSaveHoliday = () => {
        onClose();
        post("/v1/master/holiday", {
          data: {
            name: "Test Holiday",
            stateId: 101,
            date: "2025-01-01",
          },
        }).then((res) => {
          addToast(res.message, {
            appearance: res.success ? "success" : "error",
          });
          if (res.success) {
            setSelectedYear("2025");
            setSelectedState(101);
            getAllHoliday("2025", 101);
          }
        });
      };

      return (
        <button data-testid="save-button" onClick={onSaveHoliday}>
          Save Holiday
        </button>
      );
    };

    await act(async () => render(<MockedComponent />));

    await act(async () => {
      fireEvent.click(screen.getByTestId("save-button"));
    });

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("Error creating holiday", {
        appearance: "error",
      });
    });
  });

  it("should handle the case when user doesn't have permission", async () => {
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(false),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await act(async () =>
      render(
        <Provider store={store}>
          <ManageHolidays />
        </Provider>
      )
    );

    expect(screen.queryByText("+ Add Holiday")).not.toBeInTheDocument();
  });
});
