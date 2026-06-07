import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { useAppSelector, store } from "../../app/store/store";
import ManageClusters from "./ManageClusters";
import {
  IClusterResponse,
  IClusterUserResponse,
  IUserResponse,
} from "../../helper/Interface";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import { useDisclosure } from "@chakra-ui/react";
import React from "react";

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));

jest.mock("@chakra-ui/react", () => ({
  ...jest.requireActual("@chakra-ui/react"),
  useDisclosure: jest.fn(),
}));

jest.mock("../../app/store/store", () => ({
  ...jest.requireActual("../../app/store/store"),
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../../hooks/useApi", () => ({
  useApi: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  })),
}));

jest.mock("../../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

jest.mock("../../config/routes.config", () => ({
  ROUTES: [
    {
      label: "Dashboard",
      icon: "dashboard-icon",
      path: "/dashboard",
      children: [],
    },
    {
      label: "My Store",
      icon: "store-icon",
      path: "/my-store",
      children: [],
    },
  ],
}));

const mockClusters: IClusterResponse[] = [
  {
    id: 2754,
    name: "Fitness",
    sportIds: [1, 2, 3],
    costCentre: "Health and Wellness",
    leaderEmpId: "1234",
    leaderEmpName: "Dummy",
    editable: true,
  },
  {
    id: 2753,
    name: "Electronics",
    sportIds: [4, 5],
    costCentre: "Tech",
    leaderEmpId: "DP9176",
    leaderEmpName: "AJAY KUMAR",
    editable: true,
  },
  {
    id: 2760,
    name: "Cycling",
    sportIds: [1, 2, 3],
    costCentre: "Health and Wellness",
    leaderEmpId: "1234",
    leaderEmpName: "Dummy",
    editable: false,
  },
];

const mockGetUserData: IUserResponse[] = [
  {
    userId: "c04c64c4-3263-47f4-9c35-5d2421a8a8ad",
    firstName: "Aditya",
    lastName: "Chauhan",
    email: "aditya.chauhan@decathlon.com",
    empId: "DSI009473",
    managerId: "DSI003858",
    costCentreName: "IN1311",
    contractTypeId: 1,
    contractTypeName: "Full Time",
    userRolesDetails: [
      {
        roleType: "SYSTEM",
        costCentre: "IN1311",
        roleId: 7,
      },
      {
        roleType: "CUSTOM",
        costCentre: "IN1311",
        roleId: 32,
      },
      {
        roleType: "CUSTOM",
        costCentre: "IN1311",
        roleId: 9,
      },
    ],
    phone: "",
    fedId: "",
    lastLoginDate: "",
    stateId: 0,
    countryId: 0,
    userRoles: {},
    costCentreDisplayNameMap: {},
  },
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
];
const mockClusterEmployees: IClusterUserResponse[] = [
  {
    empId: "DP9176",
    firstName: "AJAY",
    lastName: "KUMAR",
    addedDate: "2023-01-01",
    contractTypeId: 1,
  },
  {
    empId: "DSI010175",
    firstName: "Diksha",
    lastName: "Pal",
    addedDate: "2023-02-01",
    contractTypeId: 2,
  },
  {
    empId: "DSI010176",
    firstName: "Unknown",
    lastName: "Unknown",
    addedDate: "2023-03-01",
    contractTypeId: 3,
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

const useApiMock = useApi as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;

describe("ManageClusters Component", () => {
  beforeEach(() => {
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/employees")) {
          return Promise.resolve(mockClusterEmployees);
        } else if (endpoint.includes("/cluster")) {
          return Promise.resolve(mockClusters);
        } else if (endpoint.includes("/user")) {
          return Promise.resolve(mockGetUserData);
        }
        return Promise.resolve([]);
      }),
      post: jest.fn(() =>
        Promise.resolve({
          success: true,
          message: "Employees updated successfully",
        })
      ),
      put: jest.fn(() =>
        Promise.resolve({
          success: true,
          message: "Cluster updated successfully",
        })
      ),
    });
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "Health and Wellness",
      user: {
        empId: "5678",
        userRoles: { "Health and Wellness": [1] },
      },
      roles: [{ id: 5, title: "LEADER" }],
    });

    (useDisclosure as jest.Mock).mockReturnValue({
      isOpen: false,
      onOpen: false,
      onClose: false,
      isClusterDetailsOpen: false,
    });

    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn((permissionKey) => {
        return true;
      }),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders clusters from API", async () => {
    render(
      <Provider store={store}>
        <ManageClusters />
      </Provider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Fitness")).toBeInTheDocument();
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("AJAY KUMAR")).toBeInTheDocument();
    });
  });

  test("displays clusters based on search input", async () => {
    render(
      <Provider store={store}>
        <ManageClusters />
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByText("Fitness")).toBeInTheDocument();
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search here");
    fireEvent.change(searchInput, { target: { value: "Fitness" } });

    await waitFor(() => {
      expect(screen.getByText("Fitness")).toBeInTheDocument();
      expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: "" } });
    await waitFor(() => {
      expect(screen.getByText("Fitness")).toBeInTheDocument();
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
  });

  test("opens right drawer when cluster name is clicked", async () => {
    const mockOnOpen = jest.fn();
    const mockOnClose = jest.fn();

    (useDisclosure as jest.Mock).mockReturnValue({
      isOpen: true,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
    });

    render(
      <Provider store={store}>
        <ManageClusters />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText("Fitness")).toBeInTheDocument();
    });

    const fitnessCluster = await screen.getByText("Fitness");
    fireEvent.click(fitnessCluster);

    await waitFor(() => {
      expect(screen.getByText(/AJAY/i)).toBeInTheDocument();
    });
  });

  test("renders non-leadership view when user is not a leader", async () => {
    (useAppSelector as jest.Mock).mockReturnValueOnce({
      selectedCostCenterName: "Tech",
      user: {
        userRoles: {
          Tech: ["5678"],
        },
      },
    });

    render(
      <Provider store={store}>
        <ManageClusters />
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByText("Fitness")).toBeInTheDocument();
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
    expect(screen.queryByText(/Leader Dashboard/i)).not.toBeInTheDocument();
  });

  test("renders different views based on user's leadership role", async () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "Health and Wellness",
      user: {
        empId: "1234",
        userRoles: { "Health and Wellness": [1] },
      },
      roles: [{ id: 1, title: "STORE_LEADER" }],
    });
    render(
      <Provider store={store}>
        <ManageClusters />
      </Provider>
    );

    render(
      <Provider store={store}>
        <ManageClusters />
      </Provider>
    );

    await waitFor(() => {
      const fitnessElements = screen.getAllByText("Fitness");
      const electronicsElements = screen.getAllByText("Electronics");

      // Ensure at least one instance exists for each
      expect(fitnessElements.length).toBeGreaterThan(0);
      expect(electronicsElements.length).toBeGreaterThan(0);

      // Optionally, verify the correct location of these elements
      expect(fitnessElements[0]).toBeInTheDocument();
      expect(electronicsElements[0]).toBeInTheDocument();
    });
  });

  it("should open modal when an  card is clicked", async () => {
    const mockOnOpen = jest.fn();
    const mockOnClose = jest.fn();
    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManageClusters />
        </Provider>
      );
    });

    (useDisclosure as jest.Mock).mockReturnValue({
      isOpen: true,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
    });

    await waitFor(() => {
      const fitnessElement = screen.getByText("Fitness");

      // Assert the element is in the document
      expect(fitnessElement).toBeInTheDocument();

      // Fire the click event
      fireEvent.click(fitnessElement);
    });

    const modalSubField = await screen.findByText("Members");
    expect(modalSubField).toBeInTheDocument();
  });

  it("should open modal when an  card is clicked and add  member", async () => {
    const mockOnOpen = jest.fn();
    const mockOnClose = jest.fn();

    (useDisclosure as jest.Mock).mockReturnValue({
      isOpen: true,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
    });

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/employees")) {
          return Promise.resolve([]);
        } else if (endpoint.includes("/cluster")) {
          return Promise.resolve(mockClusters);
        } else if (endpoint.includes("/user")) {
          return Promise.resolve(mockGetUserData);
        }
        return Promise.resolve([]);
      }),
      post: jest.fn(() =>
        Promise.resolve({
          success: true,
          message: "Employees updated successfully",
        })
      ),
      put: jest.fn(() =>
        Promise.resolve({
          success: true,
          message: "Cluster updated successfully",
        })
      ),
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManageClusters />
        </Provider>
      );
    });

    await waitFor(() => {
      const fitnessElement = screen.getByText("Fitness");
      expect(fitnessElement).toBeInTheDocument();
      fireEvent.click(fitnessElement);
    });

    const allAddIcons = screen.getAllByLabelText("addIcon");
    fireEvent.click(allAddIcons[0]);

    expect(await screen.findByText("Add Employees")).toBeInTheDocument();

    const AddemployeeNameInModal = await screen.findAllByText(/VISHNU/i);
    expect(AddemployeeNameInModal[0]).toBeInTheDocument();
    await waitFor(() => {
      const checkbox = screen.getByTestId("checkbox-DP6149");
      expect(checkbox).toBeInTheDocument();
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      const findConfirmButton = screen.getByText("Save");
      expect(findConfirmButton).not.toBeDisabled();
    });
    fireEvent.click(screen.getByText("Save"));
  });

  test("Remove Employees", async () => {
    const mockOnOpen = jest.fn();
    const mockOnClose = jest.fn();

    (useDisclosure as jest.Mock).mockReturnValue({
      isOpen: true,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
    });
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageClusters />
        </Provider>
      );
    });

    await waitFor(() => {
      const fitnessElement = screen.getByText("Fitness");
      expect(fitnessElement).toBeInTheDocument();
      fireEvent.click(fitnessElement);
    });

    const allremoveIcons = screen.getAllByLabelText("removeIcon")[0];
    fireEvent.click(allremoveIcons);

    expect(await screen.findByText("Remove Employees")).toBeInTheDocument();
  }, 60000);

  it("renders filtered checkboxes for employees based on selectedEmployeesAction and empType", async () => {
    const mockOnOpen = jest.fn();
    const mockOnClose = jest.fn();
    (useDisclosure as jest.Mock).mockReturnValue({
      isOpen: true,
      onOpen: mockOnOpen,
      onClose: mockOnClose,
    });

    const updatedMockUsers: IUserResponse[] = [
      ...mockGetUserData,
      {
        userId: "new-user-id",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "",
        fedId: "",
        empId: "EMP001",
        managerId: "manager-id",
        costCentreName: "Test Cost Centre",
        contractTypeId: 1,
        contractTypeName: "Full Time",
        lastLoginDate: "",
        stateId: 0,
        countryId: 0,
        userRoles: {},
        costCentreDisplayNameMap: {},
      },
    ];

    const updatedMockClusterEmployees: IClusterUserResponse[] = [
      ...mockClusterEmployees,
      {
        empId: "EMP002",
        firstName: "Jane",
        lastName: "Smith",
        addedDate: "2023-01-02",
        contractTypeId: 2,
      },
    ];

    const updatedMockClusters: IClusterResponse[] = [
      ...mockClusters,
      {
        id: 9999,
        name: "Test Cluster",
        sportIds: [99],
        costCentre: "Test Centre",
        leaderEmpId: "EMP002",
        leaderEmpName: "Jane Smith",
        editable: true,
      },
    ];

    // Override the mock implementation to use updated mock data
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/employees")) {
          return Promise.resolve(updatedMockClusterEmployees);
        } else if (endpoint.includes("/cluster")) {
          return Promise.resolve(updatedMockClusters);
        } else if (endpoint.includes("/user")) {
          return Promise.resolve(updatedMockUsers);
        }
        return Promise.resolve([]);
      }),
    });

    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManageClusters />
        </Provider>
      );
    });

    const clusterCard = await screen.findByText("Test Cluster");
    fireEvent.click(clusterCard);

    await waitFor(() => {
      const addEmployeeButton = screen.getAllByLabelText("addIcon")[0];
      fireEvent.click(addEmployeeButton);
    });

    await waitFor(() => {
      const johnCheckbox = screen.getByTestId("checkbox-EMP001");
      const janeCheckbox = screen.queryByTestId("checkbox-EMP002");

      expect(johnCheckbox).toBeInTheDocument();
      expect(johnCheckbox).not.toBeDisabled();
      expect(janeCheckbox).not.toBeInTheDocument();
    });

    const searchInput = screen.getByTestId("Search Employees");
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: "John" } });

    await waitFor(() => {
      const johnCheckbox = screen.getByTestId("checkbox-EMP001");
      expect(johnCheckbox).toBeInTheDocument();
      expect(johnCheckbox).not.toBeDisabled();
    });

    const johnCheckbox = screen.getByTestId("checkbox-EMP001");
    fireEvent.click(johnCheckbox);

    const saveButton = screen.getByText("Save");
    expect(saveButton).not.toBeDisabled();
  });

  test("Remove Employees", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageClusters />
        </Provider>
      );
    });
  });
});
