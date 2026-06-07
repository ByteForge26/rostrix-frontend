import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { store, useAppSelector } from "../../app/store/store";
import { setImmediate } from "timers";
import ManageContractTypes from "./ManageContractTypes";
import { Provider } from "react-redux";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import { act } from "react-dom/test-utils";
import React from "react";

const flushPromises = () => new Promise(setImmediate);

const mockedStorePlannedJobs = [
  {
    id: 102,
    costCentre: "IN1311",
    type: "SECONDARY",
    secondaryJobType: "CASHIERING",
    miscWorkId: null,
    miscWorkJobName: "",
    disabled: false,
  },
  {
    id: 103,
    costCentre: "IN1311",
    type: "MISCELLANEOUS",
    secondaryJobType: "",
    miscWorkId: 6,
    miscWorkJobName: "Trial Room",
    disabled: true,
  },
];

const mockedPlannedJobs = [
  {
    id: 1,
    type: "SECONDARY",
    jobType: "CASHIERING",
    miscWorkId: 0,
    miscWorkJobName: "",
  },
  {
    id: 2,
    type: "MISCELLANEOUS",
    jobType: "",
    miscWorkId: 5,
    miscWorkJobName: "Welcomer",
  },
  {
    id: 3,
    type: "MISCELLANEOUS",
    jobType: "",
    miscWorkId: 6,
    miscWorkJobName: "Trial Room",
  },
];

const mockPutApiResponse = [
  { success: true, message: "Configuration Disabled" },
];
const mockPostApiResponse = [
  { success: true, message: "Configuration Created" },
];

window.scrollTo = jest.fn();
window.matchMedia =
  window.matchMedia ||
  (() => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));

jest.mock("react-router-dom", () => ({ useNavigate: jest.fn() }));

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({ addToast: jest.fn() }),
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();

jest.mock("../../hooks/useApi", () => ({
  useApi: () => ({
    get: mockGet,
    post: mockPost,
    put: mockPut,
  }),
}));

jest.mock("../../hooks/useApi", () => ({ useApi: jest.fn() }));

jest.mock("../../app/store/store", () => ({
  useAppSelector: jest.fn(() => ({
    selectedCostCenterName: "IN1311",
    user: { empId: "DSI000486" },
  })),
  useAppDispatch: jest.fn(),
  store: { getState: jest.fn(), subscribe: jest.fn() },
}));

jest.mock("../../hooks/usePermission", () => ({ usePermission: jest.fn() }));


const mockContractTypes = [
  { id: 1, name: "Full Time", category: "FULL_TIME", deletable: false },
  { id: 2, name: "Part Time", category: "NON_FULL_TIME", deletable: true },
];

const mockWeekOffs = [
  { id: 101, contractTypeId: 1, numWeekOff: 2, effectiveDate: "2024-07-02" },
  { id: 102, contractTypeId: 2, numWeekOff: 1, effectiveDate: "2024-07-09" },
];

const mockWorkHours = [
  {
    id: 201,
    contractTypeId: 1,
    week: 40,
    day: 8,
    month: 160,
    effectiveDate: "2024-07-02",
  },
  {
    id: 202,
    contractTypeId: 2,
    week: 20,
    day: 4,
    month: 80,
    effectiveDate: "2024-07-08",
  },
];

const mockLeavePolicies = [
  {
    id: 301,
    contractTypeId: 1,
    leavePolicy: "STATE_POLICY",
    effectiveDate: "2024-07-02",
  },
  {
    id: 302,
    contractTypeId: 2,
    leavePolicy: "ONLY_LOP",
    effectiveDate: "2024-07-08",
  },
];

const mockWeeks = [
  { startDate: "2024-07-02", number: 1 },
  { startDate: "2024-07-09", number: 2 },
  { startDate: "2024-07-16", number: 3 },
];

const useApiMock = useApi as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;
const useAppSelectorMock = useAppSelector as jest.Mock;

describe("Manage Store Configuration Component", () => {
  beforeEach(() => {
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/master/contract-type")) {
          return Promise.resolve(mockContractTypes);
        }
        if (endpoint.includes("/master/week-off")) {
          return Promise.resolve(mockWeekOffs);
        }
        if (endpoint.includes("/master/work-hours")) {
          return Promise.resolve(mockWorkHours);
        }
        if (endpoint.includes("/master/leave-policy")) {
          return Promise.resolve(mockLeavePolicies);
        }
        if (endpoint.includes("/master/week")) {
          return Promise.resolve(mockWeeks);
        }
        return Promise.resolve([]);
      }),
      post: jest.fn((endpoint, payload) => {
        return Promise.resolve({
          success: true,
          message: "Created successfully",
        });
      }),
      put: jest.fn((endpoint, payload) => {
        return Promise.resolve({
          success: true,
          message: "Updated successfully",
        });
      }),
    });

    useAppSelectorMock.mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: { empId: "DSI000486" },
    });
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  afterEach(() => jest.clearAllMocks());


  it("should show no jobs when none are available", async () => {
    useApiMock.mockReturnValue({ get: jest.fn(() => Promise.resolve([])) });
    render(
      <Provider store={store}>
        <ManageContractTypes />
      </Provider>
    );
    expect(screen.queryByText("Cashiering")).not.toBeInTheDocument();
  });

  it("should render `Disable Config Modal`", async () => {
    await act(async () =>
      render(
        <Provider store={store}>
          <ManageContractTypes />
        </Provider>
      )
    );
  });
  it("opens 'Add Contract Type' modal and submits form", async () => {
    mockPost.mockResolvedValueOnce({
      success: true,
      message: "Saved successfully",
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManageContractTypes />
        </Provider>
      );
    });

    fireEvent.click(screen.getByText("+ Add Contract Type"));

    expect(screen.getByText("Add Contract Type")).toBeInTheDocument();

    const Name = screen.getByPlaceholderText("Enter here");

    fireEvent.change(Name, { target: { value: "Test Contract" } });

    const comboboxes = await screen.getAllByRole("combobox");

    fireEvent.change(comboboxes[0], { target: { value: "Non Part Time" } });

    fireEvent.click(screen.getByText("Non Part Time"));

    await flushPromises();

    await waitFor(() => {
      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);
    });
  });

  it("navigates between tabs", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-07-01"));
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageContractTypes />
        </Provider>
      );
    });

    const createWeekOffs = await screen.getAllByText("+ Create Week Offs");

    expect(createWeekOffs[0]).toBeInTheDocument();

    fireEvent.click(createWeekOffs[0]);

    const comboboxes = screen.getAllByRole("combobox");

    const numOfWeeks = screen.getByPlaceholderText("Enter here");

    fireEvent.change(numOfWeeks, { target: { value: "1" } });

    const yearSelector = comboboxes[0];
    fireEvent.mouseDown(yearSelector);

    await waitFor(() => {
      const yearOption = screen.getByText("2024", { exact: true });
      fireEvent.click(yearOption);
    });
    fireEvent.change(comboboxes[1], { target: { value: "wee" } });

    await waitFor(() => {
      screen.getByText(/Week 1/);
    });

    fireEvent.click(screen.getByText(/Week 1/i));

    fireEvent.click(screen.getByText("Save"));

    jest.useRealTimers();
  });

  it("creates and submits a Leave Policy", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-07-01"));

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageContractTypes />
        </Provider>
      );
    });

    const leavePolicyTabs = screen.getAllByText("Leave Policy");
    expect(leavePolicyTabs.length).toBeGreaterThan(0);
    fireEvent.click(leavePolicyTabs[0]); 

    await waitFor(() => {
      const createButtons = screen.getAllByText("+ Create Leave Policy");
      expect(createButtons.length).toBeGreaterThan(0);

      fireEvent.click(createButtons[0]);
    });


    expect(screen.getByText("Add Leave Policy")).toBeInTheDocument();

    const comboboxes = screen.getAllByRole("combobox");

    fireEvent.change(comboboxes[0], {
      target: {
        value: "No",
      },
    });

    const texts = await screen.getAllByText("No Leaves (Only LOP)"); 
    fireEvent.click(texts[6]);

    fireEvent.click(screen.getByText("Save"));
    jest.useRealTimers();
  });

  it("handles delete confirmations for different configurations", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-07-01"));
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageContractTypes />
        </Provider>
      );
    });

    const weeokOffDeleteButton = screen.getAllByLabelText("delete-weekoff")[1];

    if (weeokOffDeleteButton) {
      fireEvent.click(weeokOffDeleteButton);

      await waitFor(() => {
        const confirmDeleteButton = screen.getByText("Delete");
        fireEvent.click(confirmDeleteButton);
      });

      await waitFor(() => {
        expect(useApiMock().put).toHaveBeenCalledWith(
          expect.stringContaining("/master/week-off"),
          expect.objectContaining({
            data: expect.objectContaining({ delete: true }),
          })
        );
      });
      jest.useRealTimers();
    }
  });

  it("handles delete confirmations for Leave Policy", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-07-01"));
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageContractTypes />
        </Provider>
      );
    });

    const leavePolicyTab = screen.getAllByText("Leave Policy")[0];
    fireEvent.click(leavePolicyTab);

    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText("delete-leavepolicy");
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const leavePolicyDeleteButton =
      screen.getAllByLabelText("delete-leavepolicy")[0];

    if (leavePolicyDeleteButton) {
      fireEvent.click(leavePolicyDeleteButton);

      await waitFor(() => {
        const confirmDeleteButton = screen.getByText("Delete");
        fireEvent.click(confirmDeleteButton);
      });

      await waitFor(() => {
        expect(useApiMock().put).toHaveBeenCalledWith(
          expect.stringContaining("/master/leave-policy"),
          expect.objectContaining({
            data: expect.objectContaining({ delete: true }),
          })
        );
      });

      jest.useRealTimers();
    }
  });

  it("edits Week Offs configuration", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-07-01"));

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageContractTypes />
        </Provider>
      );
    });

    const editButtons = await screen.findAllByLabelText("edit-weekoff");

    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Edit Week Offs")).toBeInTheDocument();
      });

      const weekOffsInput = screen.getByPlaceholderText("Enter here");
      fireEvent.change(weekOffsInput, { target: { value: "3" } });

      const comboboxes = screen.getAllByRole("combobox");
      fireEvent.mouseDown(comboboxes[0]);
      await waitFor(() => {
        const yearOption = screen.getByText("2024", { exact: true });
        fireEvent.click(yearOption);
      });

      fireEvent.mouseDown(comboboxes[1]);
      await waitFor(() => {
        const weekOption = screen.getByText(/Week 2/i);
        fireEvent.click(weekOption);
      });
      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect((useApi as jest.Mock)().put).toHaveBeenCalledWith(
          expect.stringContaining("/master/week-off"),
          expect.objectContaining({
            data: expect.objectContaining({
              numWeekOff: 3,
            }),
          })
        );
      });
      jest.useRealTimers();
    }
  });

  it("edits Leave Policy configuration", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-07-01"));

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageContractTypes />
        </Provider>
      );
    });

    const leavePolicyTab = screen.getAllByText("Leave Policy")[0];
    fireEvent.click(leavePolicyTab);

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText("edit-leavepolicy");
      expect(editButtons.length).toBeGreaterThan(0);
    });

    const editButtons = screen.getAllByLabelText("edit-leavepolicy");

    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText("Edit Leave Policy")).toBeInTheDocument();
      });

      const comboboxes = screen.getAllByRole("combobox");
      fireEvent.change(comboboxes[0], { target: { value: "No" } });

      const policyOptions = screen.getAllByText("No Leaves (Only LOP)");
      fireEvent.click(policyOptions[0]);

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);

      jest.useRealTimers();

    }
  });

  it("edits Work Hours configuration", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-06-30"));

    const mockContractTypesNew = [
      {
        id: 1,
        name: "Full Time",
        category: "FULL_TIME",
        deletable: false,
        weekOffs: [
          {
            id: 101,
            contractTypeId: 1,
            numWeekOff: 2,
            effectiveDate: "2024-07-02",
          },
        ],
        workHours: [
          {
            id: 201,
            contractTypeId: 1,
            week: 40,
            day: 8,
            month: 160,
            effectiveDate: "2024-07-02",
          },
        ],
        leavePolicies: [
          {
            id: 301,
            contractTypeId: 1,
            leavePolicy: "STATE_POLICY",
            effectiveDate: "2024-07-02",
          },
        ],
      },
      {
        id: 2,
        name: "Part Time",
        category: "NON_FULL_TIME",
        deletable: true,
        weekOffs: [
          {
            id: 102,
            contractTypeId: 2,
            numWeekOff: 1,
            effectiveDate: "2024-07-09",
          },
        ],
        workHours: [
          {
            id: 202,
            contractTypeId: 2,
            week: 20,
            day: 4,
            month: 80,
            effectiveDate: "2024-07-08",
          },
        ],
        leavePolicies: [
          {
            id: 302,
            contractTypeId: 2,
            leavePolicy: "ONLY_LOP",
            effectiveDate: "2024-07-08",
          },
        ],
      },
    ];

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/master/contract-type")) {
          return Promise.resolve(mockContractTypesNew);
        }
        if (endpoint.includes("/master/week-off")) {
          return Promise.resolve(mockWeekOffs);
        }
        if (endpoint.includes("/master/work-hours")) {
          return Promise.resolve(mockWorkHours);
        }
        if (endpoint.includes("/master/leave-policy")) {
          return Promise.resolve(mockLeavePolicies);
        }
        if (endpoint.includes("/master/week")) {
          return Promise.resolve(mockWeeks);
        }
        return Promise.resolve([]);
      }),
      post: jest.fn((endpoint, payload) => {
        return Promise.resolve({
          success: true,
          message: "Created successfully",
        });
      }),
      put: jest.fn((endpoint, payload) => {
        return Promise.resolve({
          success: true,
          message: "Updated successfully",
        });
      }),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageContractTypes />
        </Provider>
      );
    });

    const workHoursTab = screen.getAllByText("Work Hours")[0];
    fireEvent.click(workHoursTab);

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText("edit-workhours");
      expect(editButtons.length).toBeGreaterThan(0);
    });

    const editButtons = screen.getAllByLabelText("edit-workhours");

    if (editButtons.length > 0) {
      fireEvent.click(editButtons[0]);

      const dayHoursInput = screen.getAllByPlaceholderText("Enter here")[0];
      fireEvent.change(dayHoursInput, { target: { value: "10" } });

      const weekHoursInput = screen.getAllByPlaceholderText("Enter here")[1];
      fireEvent.change(weekHoursInput, { target: { value: "50" } });

      const comboboxes = screen.getAllByRole("combobox");
      fireEvent.mouseDown(comboboxes[0]);
      await waitFor(() => {
        const yearOption = screen.getByText("2024", { exact: true });
        fireEvent.click(yearOption);
      });

      fireEvent.mouseDown(comboboxes[1]);
      await waitFor(() => {
        const weekOption = screen.getByText(/Week 2/i);
        fireEvent.click(weekOption);
      });

      const saveButton = screen.getByText("Save");
      fireEvent.click(saveButton);
    }
    jest.useRealTimers();
  });
  it("deletes Work Hours configuration", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2024-06-30"));

    const mockContractTypesNew = [
      {
        id: 1,
        name: "Full Time",
        category: "FULL_TIME",
        deletable: false,
        weekOffs: [
          {
            id: 101,
            contractTypeId: 1,
            numWeekOff: 2,
            effectiveDate: "2024-07-02",
          },
        ],
        workHours: [
          {
            id: 201,
            contractTypeId: 1,
            week: 40,
            day: 8,
            month: 160,
            effectiveDate: "2024-07-02",
          },
        ],
        leavePolicies: [
          {
            id: 301,
            contractTypeId: 1,
            leavePolicy: "STATE_POLICY",
            effectiveDate: "2024-07-02",
          },
        ],
      },
      {
        id: 2,
        name: "Part Time",
        category: "NON_FULL_TIME",
        deletable: true,
        weekOffs: [
          {
            id: 102,
            contractTypeId: 2,
            numWeekOff: 1,
            effectiveDate: "2024-07-09",
          },
        ],
        workHours: [
          {
            id: 202,
            contractTypeId: 2,
            week: 20,
            day: 4,
            month: 80,
            effectiveDate: "2024-07-08",
          },
        ],
        leavePolicies: [
          {
            id: 302,
            contractTypeId: 2,
            leavePolicy: "ONLY_LOP",
            effectiveDate: "2024-07-08",
          },
        ],
      },
    ];
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/master/contract-type")) {
          return Promise.resolve(mockContractTypesNew);
        }
        if (endpoint.includes("/master/week-off")) {
          return Promise.resolve(mockWeekOffs);
        }
        if (endpoint.includes("/master/work-hours")) {
          return Promise.resolve(mockWorkHours);
        }
        if (endpoint.includes("/master/leave-policy")) {
          return Promise.resolve(mockLeavePolicies);
        }
        if (endpoint.includes("/master/week")) {
          return Promise.resolve(mockWeeks);
        }
        return Promise.resolve([]);
      }),
      post: jest.fn((endpoint, payload) => {
        return Promise.resolve({
          success: true,
          message: "Created successfully",
        });
      }),
      put: jest.fn((endpoint, payload) => {
        return Promise.resolve({
          success: true,
          message: "Deleted successfully",
        });
      }),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageContractTypes />
        </Provider>
      );
    });

    const workHoursTab = screen.getAllByText("Work Hours")[0];
    fireEvent.click(workHoursTab);

    await waitFor(() => {
      const deleteButtons = screen.getAllByLabelText("delete-workhours");
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    const deleteButtons = screen.getAllByLabelText("delete-workhours");

    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        const confirmDeleteModal = screen.getByText("Delete Work Hours's");
        expect(confirmDeleteModal).toBeInTheDocument();
      });

      const confirmDeleteButton = screen.getByText("Delete");
      fireEvent.click(confirmDeleteButton);

      await waitFor(() => {
        expect(useApiMock().put).toHaveBeenCalledWith(
          expect.stringContaining("/master/work-hours"),
          expect.objectContaining({
            data: expect.objectContaining({
              delete: true,
            }),
          })
        );
      });
    }
    jest.useRealTimers();
  });
});
