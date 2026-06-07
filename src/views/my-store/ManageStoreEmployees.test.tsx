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
import ManageStoreEmployees from "./ManageStoreEmployees";
import { IUserResponse, IRoleResponse } from "../../helper/Interface";
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

const mockGetUserData: IUserResponse[] = [
  {
    userId: "75603762-30fc-4340-a469-5a1566c0c149",
    firstName: "VISHNU",
    lastName: "YADAV",
    email: "vishnu.yadav@decathlon.com",
    empId: "DP6149",
    managerId: "DSI003858",
    costCentreName: "IN1311",
    contractTypeId: 2,
    contractTypeName: "Part Time",
    clusterName: "Cycling",
    userRolesDetails: [
      {
        roleType: "SYSTEM",
        costCentre: "IN1311",
        roleId: 7,
      },
    ],
    phone: "",
    fedId: "",
    lastLoginDate: "",
    stateId: 0,
    countryId: 0,
    userRoles: {
      SYSTEM: [7],
    },
    costCentreDisplayNameMap: {
      IN1311: "IN - Decathlon India",
    },
  },
  {
    userId: "9a2fa188-fdb2-40f4-ba81-d05b29a3eb55",
    firstName: "Prince",
    lastName: "Attri",
    email: "prince.attri@decathlon.com",
    empId: "DSI006062",
    managerId: "DSI006227",
    costCentreName: "IN1311",
    contractTypeId: 1,
    contractTypeName: "Full Time",
    clusterName: "Electronics",
    userRolesDetails: [
      {
        roleType: "SYSTEM",
        costCentre: "IN1311",
        roleId: 7,
      },
    ],
    phone: "",
    fedId: "",
    lastLoginDate: "",
    stateId: 0,
    countryId: 0,
    userRoles: {
      SYSTEM: [7],
    },
    costCentreDisplayNameMap: {
      IN1311: "IN - Decathlon India",
    },
  },
  {
    userId: "9a2fa188-fdb2-40f4-ba81-d05b29a3eb55",
    firstName: "Qwerty",
    lastName: "ok",
    email: "prince.attri@decathlon.com",
    empId: "DSI006063",
    managerId: "DSI006228",
    costCentreName: "IN1311",
    contractTypeId: 1,
    contractTypeName: "Full Time",
    clusterName: "",
    userRolesDetails: [],
    phone: "",
    fedId: "",
    lastLoginDate: "",
    stateId: 0,
    countryId: 0,
    userRoles: {
      SYSTEM: [7],
    },
    costCentreDisplayNameMap: {
      IN1311: "IN - Decathlon India",
    },
  },
  {
    userId: "9a2fa188-fdb2-40f4-ba81-d05b29a3ebji",
    firstName: "Temp2",
    lastName: "ok2",
    email: "samle.attri@decathlon.com",
    empId: "DSI0060634",
    managerId: "DSI006228",
    costCentreName: "IN1311",
    clusterName: "Unassigned",
    contractTypeId: 1,
    contractTypeName: "Full Time",
    userRolesDetails: [],
    phone: "",
    fedId: "",
    lastLoginDate: "",
    stateId: 0,
    countryId: 0,
    userRoles: {
      SYSTEM: [7],
    },
    costCentreDisplayNameMap: {
      IN1311: "IN - Decathlon India",
    },
  },
];

const mockGetRoleData: IRoleResponse[] = [
  {
    id: 1,
    name: "Admin",
    description: "",
    editable: false,
    basic: false,
    type: "SYSTEM",
    title: "ADMIN",
    deletable: false,
    level: 1,
    lvlPrimary: true,
    assignable: false,
  },
  {
    id: 5,
    name: "Store Operations Manager",
    description: "",
    editable: true,
    basic: false,
    type: "CUSTOM",
    title: "STORE_OPS",
    deletable: false,
    level: 5,
    lvlPrimary: false,
    assignable: true,
  },
];

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

describe("ManageStoreEmployees Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("cost-centre")) {
          return Promise.resolve(mockGetUserData);
        } else if (endpoint.includes("roles")) {
          return Promise.resolve(mockGetRoleData);
        }
        return Promise.resolve([]);
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
  it("displays users after data is fetched", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageStoreEmployees />
        </Provider>
      );
    });
  });

  it("should handle an empty response and set empty users", async () => {
    const mockGet = jest
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    useApiMock.mockReturnValue({
      get: mockGet,
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageStoreEmployees />
        </Provider>
      );
    });

    expect(mockGet).toHaveBeenNthCalledWith(1, "/v1/access/roles");

    expect(mockGet).toHaveBeenNthCalledWith(
      2,
      "/v1/user/cost-centre/IN1311?detailed=true"
    );

    await waitFor(() => {
      // Ensure no data is displayed if response is empty
      const noDataElement = screen.getByTestId("no-data");
      expect(noDataElement).toBeInTheDocument();
    });
  });
  it("should not display edit button when permission is denied", async () => {
    usePermissionMock.mockReturnValueOnce({
      checkForPermission: jest.fn().mockReturnValue(false),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageStoreEmployees />
        </Provider>
      );
    });

    expect(screen.findByText(/Action/i)).not.toBeInTheDocument;
  });
  it("should open modal with the correct employee details when an employee is clicked", async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManageStoreEmployees />
        </Provider>
      );
    });

    const employeeElement = await screen.findByText("DP6149");
    expect(employeeElement).toBeInTheDocument();

    fireEvent.click(employeeElement);
    const modalTitle = await screen.findByText(/View Employee Details/i);
    expect(modalTitle).toBeInTheDocument();

    const employeeNameInModal = await screen.findAllByText(/VISHNU YADAV/i);

    expect(employeeNameInModal[0]).toBeInTheDocument();
  });

  it("filters users by search key", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageStoreEmployees />
        </Provider>
      );
    });

    const searchInput = screen.getByPlaceholderText("Search here");
    fireEvent.change(searchInput, { target: { value: "Prince" } });

    await waitFor(() => {
      const matchedUser = screen.getByText(/Prince Attri/i);
      expect(matchedUser).toBeInTheDocument();

      const unmatchedUser = screen.queryByText(/VISHNU YADAV/i);
      expect(unmatchedUser).not.toBeInTheDocument();
    });
    fireEvent.change(searchInput, { target: { value: "Cycling" } });

    await waitFor(() => {
      const matchedClusterUser = screen.getByText(/VISHNU YADAV/i);
      expect(matchedClusterUser).toBeInTheDocument();

      const unmatchedClusterUser = screen.queryByText(/Prince Attri/i);
      expect(unmatchedClusterUser).not.toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: "Part Time" } });

    await waitFor(() => {
      const matchedContractUser = screen.getByText(/VISHNU YADAV/i);
      expect(matchedContractUser).toBeInTheDocument();

      const unmatchedContractUser = screen.queryByText(/Prince Attri/i);
      expect(unmatchedContractUser).not.toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: "unassigned" } });

    await waitFor(() => {
      const unmatchedUser1 = screen.queryByText(/VISHNU YADAV/i);
      const unmatchedUser2 = screen.queryByText(/Prince Attri/i);
      const matchedUser = screen.getByText(/Unassigned /i);
      expect(matchedUser).toBeInTheDocument();
      expect(unmatchedUser1).not.toBeInTheDocument();
      expect(unmatchedUser2).not.toBeInTheDocument();
    });
  });
  it("sorts users by cluster name in ascending and descending order", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageStoreEmployees />
        </Provider>
      );
    });

    const clusterSortButton = screen.getByText(/Cluster/i);

    expect(clusterSortButton).toBeInTheDocument();
    fireEvent.click(clusterSortButton);

    await waitFor(() => {
      const rows = screen.getAllByRole("row").slice(2);
      expect(rows[0]).toHaveTextContent(/Qwerty/i);
      expect(rows[1]).toHaveTextContent(/Vishnu/i);
      expect(rows[2]).toHaveTextContent(/Prince/i);
    });

    fireEvent.click(clusterSortButton);

    await waitFor(() => {
      const rows = screen.getAllByRole("row").slice(2);
      expect(rows[0]).toHaveTextContent("Unassigned");
      expect(rows[1]).toHaveTextContent("Electronics");
      expect(rows[2]).toHaveTextContent("Cycling");
    });
  });
  it("renders Action column header when permission is granted", async () => {
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageStoreEmployees />
        </Provider>
      );
    });

    const actionColumnHeader = screen.getByText(/Action/i);
    expect(actionColumnHeader).toBeInTheDocument();
  });

  it("does not render BasicDetails and RolesDetails when userDetails or selectedCostCenterName are missing", async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: null, // Missing cost center
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageStoreEmployees />
        </Provider>
      );
    });

    const basicDetails = screen.queryByText(/BasicDetails/i);
    const rolesDetails = screen.queryByText(/RolesDetails/i);

    expect(basicDetails).not.toBeInTheDocument();
    expect(rolesDetails).not.toBeInTheDocument();
  });

  it("closes the modal when the close button is clicked", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageStoreEmployees />
        </Provider>
      );
    });

    const employeeElement = await screen.findByText("DP6149");
    fireEvent.click(employeeElement);

    const modal = await screen.findByRole("dialog");
    expect(modal).toBeInTheDocument();

    const closeButton = within(modal).getByLabelText("Close");
    expect(closeButton).toBeInTheDocument();

    fireEvent.click(closeButton);
  });

  it("should filter employees by contract type", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageStoreEmployees />
        </Provider>
      );
    });

    const contractFilter = screen.getByTestId("filter-contract-type");

    fireEvent.change(contractFilter, { target: { value: "Full Time" } });

    expect(screen.queryByText(/Prince/i)).toBeInTheDocument();

    expect(screen.queryByText("VISHNU")).not.toBeInTheDocument();
  });
});
