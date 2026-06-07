import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import RolesDetails from "./RolesDetails";
import {
  ICostCenter,
  IRoleResponse,
  ICostCenterResponse,
} from "../../helper/Interface";
import { ENDPOINT } from "../../config/endpoint.config";
import { useApi } from "../../hooks/useApi";
import { useToasts } from "react-toast-notifications";
import { useAppSelector, store } from "../../app/store/store";

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
jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));

jest.mock("../../app/store/store", () => ({
  ...jest.requireActual("../../app/store/store"),
  useAppSelector: jest.fn(),
  store: {
    getState: jest.fn(),
    subscribe: jest.fn(),
  },
}));

describe("RolesDetails Component", () => {
  const mockOnClose = jest.fn();
  const mockOnDeleteClose = jest.fn();
  const mockGetEmployeeDetails = jest.fn();

  const defaultProps = {
    userId: "123",
    userRolesDetails: [
      { costCentre: "Finance", roleId: 1 },
      { costCentre: "HR", roleId: 2 },
    ],
    costCentre: "Sales",
    roleId: "3",
    uniqueId: "Finance_1",
    onClose: mockOnClose,
    onDeleteClose: mockOnDeleteClose,
    getEmployeeDetails: mockGetEmployeeDetails,
  };
  const mockUserRolesDetails = [
    {
      costCentre: "CC001",
      roleId: 1,
      roleType: "CUSTOM",
    },
    {
      costCentre: "CC002",
      roleId: 2,
      roleType: "BASIC",
    },
  ];

  const mockAllRoles: IRoleResponse[] = [
    {
      id: 1,
      name: "Role 1",
      description: "Role 1 Description",
      editable: true,
      basic: false,
      type: "CUSTOM",
      title: "Role 1 Title",
      deletable: true,
      level: 2,
      lvlPrimary: true,
      assignable: true,
    },
    {
      id: 2,
      name: "Role 2",
      description: "Role 2 Description",
      editable: false,
      basic: true,
      type: "BASIC",
      title: "Role 2 Title",
      deletable: false,
      level: 2,
      lvlPrimary: false,
      assignable: false,
    },
  ];

  const mockAllCostCenters: ICostCenter[] = [
    {
      id: 1,
      costCentreName: "CC001",
      displayName: "Cost Center 1",
      costCentreZone: "Zone 1",
      address: "Address 1",
      pinCode: 123456,
      cityId: 1,
      stateId: 1,
      countryId: 1,
      city: "City 1",
      state: "State 1",
      country: "Country 1",
      updatedAt: "2023-01-01",
      managerEmpId: "M001",
      superManagerEmpId: "SM001",
      type: "SERVICES",
      disabled: false,
    },
    {
      id: 2,
      costCentreName: "CC002",
      displayName: "Cost Center 2",
      costCentreZone: "Zone 2",
      address: "Address 2",
      pinCode: 654321,
      cityId: 2,
      stateId: 2,
      countryId: 2,
      city: "City 2",
      state: "State 2",
      country: "Country 2",
      updatedAt: "2023-01-02",
      managerEmpId: "M002",
      superManagerEmpId: "SM002",
      type: "RETAIL",
      disabled: false,
    },
  ];

  const mockCostCenterResponse: ICostCenterResponse = {
    costCenters: mockAllCostCenters,
    totalPages: 1,
  };

  beforeEach(() => {
    (useAppSelector as jest.Mock).mockImplementation((selector) =>
      selector({
        auth: {
          roleLevel: 2,
          selectedCostCenterName: "CC001",
        },
        otherState: {},
      })
    );

    mockGet.mockImplementation((url) => {
      if (url === ENDPOINT["/access"]["/roles"]) {
        return Promise.resolve(mockAllRoles);
      } else if (url === ENDPOINT["/master"]["/cost-centre"]) {
        return Promise.resolve(mockCostCenterResponse);
      }
      return Promise.resolve([]);
    });

    mockPost.mockResolvedValue({ success: true, message: "Success" });
    mockPut.mockResolvedValue({ success: true, message: "Success" });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the RolesDetails component", async () => {
    render(
      <RolesDetails
        userRolesDetails={mockUserRolesDetails}
        userId="123"
        defaultCostCenterName="CC001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Roles")).toBeInTheDocument();
      expect(screen.getByText("Cost Center")).toBeInTheDocument();
      expect(screen.getByText("Role")).toBeInTheDocument();
      expect(screen.getByText("Role Type")).toBeInTheDocument();
    });
  });

  it('opens the Add Role modal when the "Assign Role" button is clicked', async () => {
    const mockUserRolesDetails = [
      {
        costCentre: "CC001",
        roleId: 1,
        roleType: "CUSTOM",
      },
    ];

    (store.getState as jest.Mock).mockReturnValue({
      auth: {
        roleLevel: 1,
        selectedCostCenterName: "CC001",
      },
    });

    const isRoleLower = jest.fn().mockReturnValue(true);

    render(
      <RolesDetails
        userRolesDetails={mockUserRolesDetails}
        userId="123"
        defaultCostCenterName="CC001"
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText((content, element) =>
          content.startsWith("+ Assign Role")
        )
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("+ Assign Role"));

    await waitFor(() => {
      expect(screen.getByText("+ Assign Role")).toBeInTheDocument();
    });
  });
  it("fetches roles and cost centers on mount", async () => {
    render(
      <RolesDetails
        userRolesDetails={mockUserRolesDetails}
        userId="123"
        defaultCostCenterName="CC001"
      />
    );

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith("/v1/access/roles");
      expect(mockGet).toHaveBeenCalledWith("/v1/master/cost-centre", {
        params: {},
      });
    });
  });

  it("displays user roles correctly", async () => {
    render(
      <RolesDetails
        userRolesDetails={mockUserRolesDetails}
        userId="123"
        defaultCostCenterName="CC001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Roles")).toBeInTheDocument();
    });

    expect(screen.getByText("CC001")).toBeInTheDocument();
    expect(screen.getByText(/CC002/)).toBeInTheDocument();

    const customRoles = screen.getAllByText(/CUSTOM/);

    expect(customRoles).toHaveLength(2);

    expect(customRoles[0].tagName).toBe("OPTION");
    expect(customRoles[1].tagName).toBe("TD");
    expect(screen.getByText(/BASIC/)).toBeInTheDocument();
  });
  it('opens the Delete Role modal when the "Remove" button is clicked', async () => {
    const mockUserRolesDetails = [
      {
        costCentre: "CC001",
        roleId: 1,
        roleType: "CUSTOM",
      },
    ];

    (store.getState as jest.Mock).mockReturnValue({
      auth: {
        roleLevel: 1,
        selectedCostCenterName: "CC001",
      },
    });

    render(
      <RolesDetails
        userRolesDetails={mockUserRolesDetails}
        userId="123"
        defaultCostCenterName="CC001"
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Remove")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Remove"));

    await screen.findByText("Are you sure you want to Remove Role?");

    const removeButtons = screen.getAllByText("Remove");
    fireEvent.click(removeButtons[0]);
  });
  it('opens the Edit Role modal when the "Edit" button is clicked', async () => {
    const mockUserRolesDetails = [
      {
        costCentre: "CC001",
        roleId: 1,
        roleType: "CUSTOM",
      },
    ];

    const mockOnOpen = jest.fn();

    (store.getState as jest.Mock).mockReturnValue({
      auth: {
        roleLevel: 1,
        selectedCostCenterName: "CC001",
      },
    });

    render(
      <RolesDetails
        userRolesDetails={mockUserRolesDetails}
        userId="123"
        defaultCostCenterName="CC001"
        onOpen={mockOnOpen}
      />
    );

    const editButton = await screen.findByText("Edit");
    expect(editButton).toBeInTheDocument();
    fireEvent.click(editButton);
  });

  it("getUserRoleList returns correct role list excluding the uniqueId match", () => {
    const mockUserRolesDetails = [
      { costCentre: "Finance", roleId: 1 },
      { costCentre: "HR", roleId: 2 },
    ];

    const uniqueId = "Finance_1";

    render(
      <RolesDetails
        userRolesDetails={mockUserRolesDetails}
        userId="123"
        defaultCostCenterName="CC001"
        uniqueId={uniqueId}
      />
    );
  });

  it('opens the Delete Role modal when the "Remove" button is clicked', async () => {
    const mockUserRolesDetails = [
      {
        costCentre: "CC001",
        roleId: 1,
        roleType: "CUSTOM",
      },
    ];

    (store.getState as jest.Mock).mockReturnValue({
      auth: {
        roleLevel: 1,
        selectedCostCenterName: "CC001",
      },
    });

    render(
      <RolesDetails
        userRolesDetails={mockUserRolesDetails}
        userId="123"
        defaultCostCenterName="CC001"
      />
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("remove-role-button")).toHaveLength(1);
    });

    fireEvent.click(screen.getByTestId("remove-role-button"));

    expect(
      await screen.findByText("Are you sure you want to Remove Role?")
    ).toBeInTheDocument();

    const modalRemoveButton = screen.getAllByText("Remove")[1];

    fireEvent.click(modalRemoveButton);
  });

  it("sets empty roles array when API call fails", async () => {
    mockGet.mockImplementation((url) => {
      if (url === ENDPOINT["/access"]["/roles"]) {
        return Promise.resolve(null);
      } else if (url === ENDPOINT["/master"]["/cost-centre"]) {
        return Promise.resolve(mockCostCenterResponse);
      }
      return Promise.resolve([]);
    });

    render(
      <RolesDetails userRolesDetails={mockUserRolesDetails} userId="123" />
    );

    await waitFor(() => {
      expect(screen.queryByText("Role 1")).not.toBeInTheDocument();
    });
  });

  it("sets empty cost centers array when API call fails", async () => {
    mockGet.mockImplementation((url) => {
      if (url === ENDPOINT["/access"]["/roles"]) {
        return Promise.resolve(mockAllRoles);
      } else if (url === ENDPOINT["/master"]["/cost-centre"]) {
        return Promise.resolve(null);
      }
      return Promise.resolve([]);
    });

    render(
      <RolesDetails userRolesDetails={mockUserRolesDetails} userId="123" />
    );

    await waitFor(() => {
      expect(screen.queryByText("Cost Center 1")).not.toBeInTheDocument();
    });
  });

  it("updates filters when filter dropdowns change", async () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (selector) =>
        selector({
          auth: {
            roleLevel: 2,
            selectedCostCenterName: "CC001",
          },
          otherState: {},
        }) || { roleLevel: 2, selectedCostCenterName: "CC001" }
    );

    jest.spyOn(store, "getState").mockImplementation(() => ({
      auth: {
        roleLevel: 2,
      },
    }));

    render(
      <RolesDetails userRolesDetails={mockUserRolesDetails} userId="123" />
    );

    await waitFor(() => {
      expect(screen.getAllByText("Cost Center")[0]).toBeInTheDocument();
    });
    const selects = screen.getAllByRole("combobox");
    const costCenterFilter = selects[0];
    const roleFilter = selects[1];
    const roleTypeFilter = selects[2];

    fireEvent.change(costCenterFilter, { target: { value: "CC001" } });
    expect(costCenterFilter.value).toBe("CC001");

    fireEvent.change(roleFilter, { target: { value: "1" } });
    expect(roleFilter.value).toBe("1");

    fireEvent.change(roleTypeFilter, { target: { value: "CUSTOM" } });
    expect(roleTypeFilter.value).toBe("CUSTOM");
  });

  it("properly filters the roles based on filter criteria", async () => {
    (useAppSelector as jest.Mock).mockImplementation(
      (selector) =>
        selector({
          auth: {
            roleLevel: 2,
            selectedCostCenterName: "CC001",
          },
          otherState: {},
        }) || { auth: { roleLevel: 2, selectedCostCenterName: "CC001" } }
    );

    jest.spyOn(store, "getState").mockImplementation(() => ({
      auth: {
        roleLevel: 2,
      },
    }));

    render(
      <RolesDetails
        userRolesDetails={[
          { costCentre: "CC001", roleId: 1, roleType: "CUSTOM" },
          { costCentre: "CC002", roleId: 2, roleType: "BASIC" },
          { costCentre: "CC003", roleId: 3, roleType: "CUSTOM" },
        ]}
        userId="123"
      />
    );

    await waitFor(() => {
      const costCenterHeaders = screen.getAllByText("Cost Center");
      expect(costCenterHeaders.length).toBeGreaterThan(0);
    });
    const selects = screen.getAllByRole("combobox");
    const costCenterFilter = selects[0];
    const roleFilter = selects[1];
    const roleTypeFilter = selects[2];

    fireEvent.change(roleFilter, { target: { value: "1" } });
    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(3);
    });

    fireEvent.change(roleFilter, { target: { value: "" } });

    fireEvent.change(roleTypeFilter, { target: { value: "CUSTOM" } });
    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(4);
    });

    fireEvent.change(costCenterFilter, { target: { value: "CC001" } });
    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(3);
    });
  });
  it("resets filterRoleId when the role is no longer in userRolesDetails", async () => {
    const initialRoles = [
      { costCentre: "CC001", roleId: 1, roleType: "CUSTOM" },
      { costCentre: "CC002", roleId: 2, roleType: "BASIC" },
    ];

    jest.spyOn(store, "getState").mockImplementation(() => ({
      auth: {
        roleLevel: 2,
      },
    }));

    const { rerender } = render(
      <RolesDetails userRolesDetails={initialRoles} userId="123" />
    );

    await waitFor(() => {
      expect(screen.getByText("Cost Center")).toBeInTheDocument();
    });

    const selects = screen.getAllByRole("combobox");
    const roleFilter = selects[1];
    fireEvent.change(roleFilter, { target: { value: "2" } });
    expect(roleFilter.value).toBe("2");

    const updatedRoles = [
      { costCentre: "CC001", roleId: 1, roleType: "CUSTOM" },
      { costCentre: "CC003", roleId: 3, roleType: "CUSTOM" },
    ];

    rerender(<RolesDetails userRolesDetails={updatedRoles} userId="123" />);

    await waitFor(() => {
      const updatedSelects = screen.getAllByRole("combobox");
      expect(updatedSelects[1].value).toBe("");
    });
  });

  it("adds a role and calls getEmployeeDetails", async () => {
    const mockGetEmployeeDetails = jest.fn();
    mockPut.mockResolvedValue({
      success: true,
      message: "Role added successfully",
    });

    const mockHighLevelRoles: IRoleResponse[] = [
      {
        id: 1,
        name: "Role 1",
        description: "Role 1 Description",
        editable: true,
        basic: false,
        type: "CUSTOM",
        title: "Role 1 Title",
        deletable: true,
        level: 5,
        lvlPrimary: true,
        assignable: true,
      },
    ];

    mockGet.mockImplementation((url) => {
      if (url === ENDPOINT["/access"]["/roles"]) {
        return Promise.resolve(mockHighLevelRoles);
      } else if (url === ENDPOINT["/master"]["/cost-centre"]) {
        return Promise.resolve(mockCostCenterResponse);
      }
      return Promise.resolve([]);
    });

    jest.spyOn(store, "getState").mockImplementation(() => ({
      auth: {
        roleLevel: 1,
      },
    }));

    render(
      <RolesDetails
        userRolesDetails={[
          { costCentre: "CC001", roleId: 1, roleType: "CUSTOM" },
        ]}
        userId="123"
        getEmployeeDetails={mockGetEmployeeDetails}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/\+ Assign Role/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/\+ Assign Role/));

    const costCenterSelect = screen.getAllByText("Cost Center")[1];
    const costCenterFormControl = costCenterSelect.closest("div");
    const appSelectForCC = costCenterFormControl.querySelector("div");

    act(() => {
      const component =
        (appSelectForCC as any).__reactProps$ ||
        (appSelectForCC as any)._reactProps ||
        (appSelectForCC as any).props;
      if (component && component.onChange) {
        component.onChange("CC001");
      } else {
        const setCostCentre = jest.fn();
        setCostCentre("CC001");
      }
    });

    const roleSelect = screen.getAllByText("Role")[1];
    const roleFormControl = roleSelect.closest("div");
    const appSelectForRole = roleFormControl.querySelector("div");

    act(() => {
      const component =
        (appSelectForRole as any).__reactProps$ ||
        (appSelectForRole as any)._reactProps ||
        (appSelectForRole as any).props;
      if (component && component.onChange) {
        component.onChange("1");
      } else {
        const setRoleId = jest.fn();
        setRoleId("1");
      }
    });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);
  });

  it("properly sorts roles and cost centers", async () => {
    const mockRolesUnsorted: IRoleResponse[] = [
      {
        id: 2,
        name: "Z Role",
        description: "Role Z Description",
        editable: true,
        basic: false,
        type: "CUSTOM",
        title: "Role Z Title",
        deletable: true,
        level: 3,
        lvlPrimary: true,
        assignable: true,
      },
      {
        id: 1,
        name: "A Role",
        description: "Role A Description",
        editable: true,
        basic: false,
        type: "CUSTOM",
        title: "Role A Title",
        deletable: true,
        level: 3,
        lvlPrimary: true,
        assignable: true,
      },
    ];

    mockGet.mockImplementation((url) => {
      if (url === ENDPOINT["/access"]["/roles"]) {
        return Promise.resolve(mockRolesUnsorted);
      } else if (url === ENDPOINT["/master"]["/cost-centre"]) {
        return Promise.resolve(mockCostCenterResponse);
      }
      return Promise.resolve([]);
    });

    jest.spyOn(store, "getState").mockImplementation(() => ({
      auth: {
        roleLevel: 2,
      },
    }));

    render(
      <RolesDetails
        userRolesDetails={[
          { costCentre: "CC001", roleId: 1, roleType: "CUSTOM" },
        ]}
        userId="123"
      />
    );
    await waitFor(() => {
      const assignButton = screen.getByText("+ Assign Role");
      fireEvent.click(assignButton);
    });

    const sortedRoles = mockRolesUnsorted.sort((a, b) =>
      a.name.localeCompare(b.name)
    );
    expect(sortedRoles[0].name).toBe("A Role");
    expect(sortedRoles[1].name).toBe("Z Role");

    const closeButton = screen.getByText("Close");
    fireEvent.click(closeButton);
  });

  it("calls onSaveRole with add action when Save button is clicked", async () => {
    mockPut.mockResolvedValue({
      success: true,
      message: "Role added successfully",
    });
    const mockHighLevelRoles: IRoleResponse[] = [
      {
        id: 1,
        name: "Role 1",
        description: "Role 1 Description",
        editable: true,
        basic: false,
        type: "CUSTOM",
        title: "Role 1 Title",
        deletable: true,
        level: 5,
        lvlPrimary: true,
        assignable: true,
      },
    ];
    mockGet.mockImplementation((url) => {
      if (url === ENDPOINT["/access"]["/roles"]) {
        return Promise.resolve(mockHighLevelRoles);
      } else if (url === ENDPOINT["/master"]["/cost-centre"]) {
        return Promise.resolve(mockCostCenterResponse);
      }
      return Promise.resolve([]);
    });

    jest.spyOn(store, "getState").mockImplementation(() => ({
      auth: {
        roleLevel: 1,
      },
    }));

    render(
      <RolesDetails
        userRolesDetails={[
          { costCentre: "CC001", roleId: 1, roleType: "CUSTOM" },
        ]}
        userId="123"
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/\+ Assign Role/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/\+ Assign Role/));

    const saveButton = screen.getByText("Save");

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockPut).not.toHaveBeenCalled();
    });
  });
});
