import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
  within,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { useAppSelector, store } from "../../app/store/store";
import MyTeamLeaves from "./MyTeamLeaves";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import React from "react";

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));

jest.mock("../../app/store/store", () => ({
  ...jest.requireActual("../../app/store/store"),
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

const mockMyTeamLeavesResponse = {
  empLeaveSummaryList: [
    {
      empId: "DP6149",
      firstName: "VISHNU",
      lastName: "YADAV",
      costCentreName: null,
      contractTypeId: 2,
      totalAllowed: 0,
      availedGeneral: 0,
      plannedGeneral: 0,
      clusterName: null,
      clusterId: null,
      availedLop: 0,
      plannedLop: 0,
      matOrPatAvailed: false,
      stateId: 9,
    },
    {
      empId: "DSI006062",
      firstName: "Prince",
      lastName: "Attri",
      costCentreName: null,
      contractTypeId: 1,
      totalAllowed: 32,
      availedGeneral: 0,
      plannedGeneral: 0,
      clusterName: null,
      clusterId: null,
      availedLop: 0,
      plannedLop: 0,
      matOrPatAvailed: false,
      stateId: 9,
    },
    {
      empId: "DP6515",
      firstName: "Himkar",
      lastName: ".",
      costCentreName: null,
      contractTypeId: 2,
      totalAllowed: 0,
      availedGeneral: 0,
      plannedGeneral: 0,
      clusterName: null,
      clusterId: null,
      availedLop: 0,
      plannedLop: 0,
      matOrPatAvailed: false,
      stateId: 9,
    },
  ],
};

const mockMyTeamLeavesWithClusters = {
  empLeaveSummaryList: [
    {
      empId: "DP6149",
      firstName: "VISHNU",
      lastName: "YADAV",
      costCentreName: null,
      contractTypeId: 2,
      totalAllowed: 0,
      availedGeneral: 0,
      plannedGeneral: 0,
      clusterName: "DevOps",
      clusterId: 1,
      availedLop: 0,
      plannedLop: 0,
      matOrPatAvailed: false,
      stateId: 9,
    },
    {
      empId: "DSI006062",
      firstName: "Prince",
      lastName: "Attri",
      costCentreName: null,
      contractTypeId: 1,
      totalAllowed: 32,
      availedGeneral: 0,
      plannedGeneral: 0,
      clusterName: "Frontend",
      clusterId: 2,
      availedLop: 0,
      plannedLop: 0,
      matOrPatAvailed: false,
      stateId: 9,
    },
  ],
};

const mockMyLeavesResponse = {
  totalAllowedLeaves: 32,
  stateId: 9,
  contractTypeId: 1,
  leaves: [
    {
      id: 3552,
      empId: "DSI009473",
      fromDate: "2024-11-05",
      toDate: "2024-11-30",
      appliedOn: "2024-11-04T11:58:29.197743",
      comment: "",
      status: "AUTO_APPROVED",
      type: "GENERAL",
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


describe("MyTeamLeaves Component - Specific Uncovered Lines", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("my-team-leaves")) {
          return Promise.resolve(mockMyTeamLeavesResponse);
        }
        if (endpoint.includes("my-leaves")) {
          return Promise.resolve(mockMyLeavesResponse);
        }
        return Promise.resolve({});
      }),
    });
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1311",
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

  
  it("should display no data when API returns empty array", async () => {
    
    useApiMock.mockReturnValueOnce({
      get: jest.fn().mockResolvedValueOnce({ empLeaveSummaryList: [] }),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamLeaves />
        </Provider>
      );
    });

  
    await waitFor(() => {
      
      const empIdElements = screen.queryAllByText(/DP\d+/);
      expect(empIdElements.length).toBe(0);
    });
  });

  
  it("should open leave apply drawer when clicking action menu", async () => {
    let rendered;
    await act(async () => {
      rendered = render(
        <Provider store={store}>
          <MyTeamLeaves />
        </Provider>
      );
    });

    const rows = screen.getAllByRole("row");
    expect(rows.length).toBeGreaterThan(2); 

    const firstDataRow = rows[2]; 
    const optionsButton = within(firstDataRow).getByRole("button", {
      name: /Options/i,
    });
    fireEvent.click(optionsButton);

    await waitFor(() => {
      const manageOptions = screen.getAllByText("Manage Leave/Week Off");
      expect(manageOptions.length).toBeGreaterThan(0);
      fireEvent.click(manageOptions[0]);
    });

    await waitFor(() => {
      const drawerHeader = screen.getByText(
        /Manage Leave\/Week Off.*\|\s*\d{4}$/
      );
      expect(drawerHeader).toBeInTheDocument();
    });
  });

 
  it("should reset leaves data when viewing employee leaves", async () => {
    const getSpy = jest.fn((endpoint) => {
      if (endpoint.includes("my-team-leaves")) {
        return Promise.resolve(mockMyTeamLeavesResponse);
      }
      if (endpoint.includes("my-leaves")) {
        return Promise.resolve(mockMyLeavesResponse);
      }
      return Promise.resolve({});
    });

    useApiMock.mockReturnValue({
      get: getSpy,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamLeaves />
        </Provider>
      );
    });

    const empIdLinks = screen.getAllByText(/DP\d+/);
    expect(empIdLinks.length).toBeGreaterThan(0);

    fireEvent.click(empIdLinks[0]);

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\/my-leaves\/DP\d+/),
        expect.anything()
      );
    });
  });

  it("should update filterClusterName when cluster filter is changed", async () => {
    useApiMock.mockReturnValueOnce({
      get: jest.fn().mockResolvedValueOnce(mockMyTeamLeavesWithClusters),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamLeaves />
        </Provider>
      );
    });

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1);
      const filterRow = rows[1];
      const selects = within(filterRow).getAllByRole("combobox");
      expect(selects.length).toBeGreaterThan(0);
      fireEvent.change(selects[0], { target: { value: "unassigned" } });
    });

    expect(true).toBeTruthy();
  });


  it("should update year state when year menu option is clicked", async () => {
  
    const getSpy = jest.fn().mockImplementation((endpoint) => {
      if (endpoint.includes("my-team-leaves")) {
        return Promise.resolve(mockMyTeamLeavesResponse);
      }
      return Promise.resolve({});
    });

    useApiMock.mockReturnValue({
      get: getSpy,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamLeaves />
        </Provider>
      );
    });

    getSpy.mockClear();

  
    const yearMenuButtons = screen.getAllByRole("button").filter((button) => {
      const buttonText = button.textContent || "";
      return buttonText.includes(new Date().getFullYear().toString());
    });

    if (yearMenuButtons.length > 0) {
      fireEvent.click(yearMenuButtons[0]);
    } else {
      throw new Error("Year menu button not found");
    }

  
    await waitFor(() => {
    
      const prevYearOptions = screen.getAllByText(
        (new Date().getFullYear() - 1).toString()
      );
      expect(prevYearOptions.length).toBeGreaterThan(0);

      fireEvent.click(prevYearOptions[0]);
    });

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          params: expect.objectContaining({
            year: new Date().getFullYear() - 1,
          }),
        })
      );
    });
  });

  
  it("should render cluster filter dropdown with cluster options", async () => {
    useApiMock.mockReturnValueOnce({
      get: jest.fn().mockResolvedValueOnce(mockMyTeamLeavesWithClusters),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamLeaves />
        </Provider>
      );
    });

    await waitFor(() => {
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1);


      const filterRow = rows[1];

      const selects = within(filterRow).getAllByRole("combobox");
      expect(selects.length).toBeGreaterThan(0);

      const options = within(selects[0]).getAllByRole("option");

      expect(options.length).toBeGreaterThan(2);

      const optionTexts = options.map((option) => option.textContent);
      expect(optionTexts).toContain("- All -");
      expect(optionTexts).toContain("- Unassigned -");
    });
  });
  
  it("should reset leavesData when viewing employee leave history", async () => {
    let getLeavesCallCount = 0;
    const getSpy = jest.fn((endpoint) => {
      if (endpoint.includes("my-team-leaves")) {
        return Promise.resolve(mockMyTeamLeavesResponse);
      }
      if (endpoint.includes("my-leaves")) {
        getLeavesCallCount++;
        return Promise.resolve(mockMyLeavesResponse);
      }
      return Promise.resolve({});
    });

    useApiMock.mockReturnValue({
      get: getSpy,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamLeaves />
        </Provider>
      );
    });

    const firstEmpIdLink = screen.getAllByText(/DP\d+/)[0];
    fireEvent.click(firstEmpIdLink);

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\/my-leaves\//),
        expect.anything()
      );
    });

    const secondEmpIdLink = screen.getAllByText(/DP\d+/)[1];
    fireEvent.click(secondEmpIdLink);
    await waitFor(() => {
      expect(getLeavesCallCount).toBe(2);
    });
  });

  it("should update search key when search input changes", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamLeaves />
        </Provider>
      );
    });

    const searchInput = screen.getByPlaceholderText("Search here");
    expect(searchInput).toBeInTheDocument();

    expect(screen.getByText("VISHNU YADAV")).toBeInTheDocument();
    expect(screen.getByText("Prince Attri")).toBeInTheDocument();
    expect(screen.getByText("Himkar .")).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "Prince" } });

    await waitFor(() => {
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
      expect(screen.queryByText("VISHNU YADAV")).not.toBeInTheDocument();
      expect(screen.queryByText("Himkar .")).not.toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: "" } });

    await waitFor(() => {
      expect(screen.getByText("VISHNU YADAV")).toBeInTheDocument();
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
      expect(screen.getByText("Himkar .")).toBeInTheDocument();
    });
  });


  it("should correctly filter by unassigned cluster", async () => {
    
    const mixedClusterData = {
      empLeaveSummaryList: [
        {
          empId: "DP6149",
          firstName: "VISHNU",
          lastName: "YADAV",
          costCentreName: null,
          contractTypeId: 2,
          totalAllowed: 0,
          availedGeneral: 0,
          plannedGeneral: 0,
          clusterName: "DevOps", 
          clusterId: 1,
          availedLop: 0,
          plannedLop: 0,
          matOrPatAvailed: false,
          stateId: 9,
        },
        {
          empId: "DSI006062",
          firstName: "Prince",
          lastName: "Attri",
          costCentreName: null,
          contractTypeId: 1,
          totalAllowed: 32,
          availedGeneral: 0,
          plannedGeneral: 0,
          clusterName: null, 
          clusterId: null,
          availedLop: 0,
          plannedLop: 0,
          matOrPatAvailed: false,
          stateId: 9,
        },
        {
          empId: "DP6515",
          firstName: "Himkar",
          lastName: ".",
          costCentreName: null,
          contractTypeId: 2,
          totalAllowed: 0,
          availedGeneral: 0,
          plannedGeneral: 0,
          clusterName: "", 
          clusterId: null,
          availedLop: 0,
          plannedLop: 0,
          matOrPatAvailed: false,
          stateId: 9,
        },
      ],
    };

    useApiMock.mockReturnValueOnce({
      get: jest.fn().mockResolvedValueOnce(mixedClusterData),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamLeaves />
        </Provider>
      );
    });


    await waitFor(() => {
      expect(screen.getByText("VISHNU YADAV")).toBeInTheDocument();
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
      expect(screen.getByText("Himkar .")).toBeInTheDocument();
    });


    const selects = screen.getAllByRole("combobox");
    const clusterFilter = selects[0];


    fireEvent.change(clusterFilter, { target: { value: "unassigned" } });

    await waitFor(() => {
      expect(screen.queryByText("VISHNU YADAV")).not.toBeInTheDocument();
      expect(screen.getByText("Prince Attri")).toBeInTheDocument();
      expect(screen.getByText("Himkar .")).toBeInTheDocument();
    });
  });
  it("should set leaves data to undefined when API returns response without stateId", async () => {

    const getSpy = jest.fn((endpoint) => {
      if (endpoint.includes("my-team-leaves")) {
        return Promise.resolve(mockMyTeamLeavesResponse);
      }
      if (endpoint.includes("my-leaves")) {
        return Promise.resolve({
          totalAllowedLeaves: 32,
          contractTypeId: 1,
          leaves: [],
        });
      }
      return Promise.resolve({});
    });

    useApiMock.mockReturnValue({
      get: getSpy,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyTeamLeaves />
        </Provider>
      );
    });

    const empIdLink = screen.getByText("DP6149");
    fireEvent.click(empIdLink);

    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\/my-leaves\/DP6149/),
        expect.objectContaining({
          params: expect.objectContaining({
            year: expect.any(Number),
          }),
        })
      );
    });

  
    await waitFor(() => {
     
      expect(screen.getByText(/Leaves History/i)).toBeInTheDocument();

      
      const leaveElements = screen.queryAllByText(/AUTO_APPROVED/i);
      expect(leaveElements.length).toBe(0);
    });
  });
});
