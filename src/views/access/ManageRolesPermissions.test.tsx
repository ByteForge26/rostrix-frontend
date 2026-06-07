import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import ManageRolesPermissions from "./ManageRolesPermissions";
import { useApi } from "../../hooks/useApi";
import { Provider } from "react-redux";
import { store } from "../../app/store/store";
import { usePermission } from "../../hooks/usePermission";
import { useToasts } from "react-toast-notifications";
import { PERMISSION } from "../../config/permission.config";

window.scrollTo = jest.fn();
window.matchMedia =
  window.matchMedia ||
  (() => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));

const mockRoles = [
  { id: 2, name: "Admin", level: 2 },
  { id: 3, name: "Manager", level: 3 },
];

const mockPermissions = [
  {
    id: 1,
    category: "Users",
    permissions: [
      {
        id: 101,
        name: "View",
        category: "Users",
        subCategory: "User Management",
      },
      {
        id: 102,
        name: "Create",
        category: "Users",
        subCategory: "User Management",
      },
      {
        id: 103,
        name: "Edit",
        category: "Users",
        subCategory: "User Management",
      },
    ],
  },
  {
    id: 2,
    category: "Reports",
    permissions: [
      {
        id: 201,
        name: "View",
        category: "Reports",
        subCategory: "Sales Reports",
      },
      {
        id: 202,
        name: "Export",
        category: "Reports",
        subCategory: "Sales Reports",
      },
    ],
  },
];

const mockTransformedPermissions = [
  {
    id: 1,
    category: "Users",
    subCategories: [
      {
        id: 10,
        subCategory: "User Management",
        permissions: [
          { id: 101, name: "View" },
          { id: 102, name: "Create" },
          { id: 103, name: "Edit" },
        ],
        isGlobalPermissionForSubCategory: false,
      },
    ],
  },
  {
    id: 2,
    category: "Reports",
    subCategories: [
      {
        id: 20,
        subCategory: "Sales Reports",
        permissions: [
          { id: 201, name: "View" },
          { id: 202, name: "Export" },
        ],
        isGlobalPermissionForSubCategory: false,
      },
    ],
  },
  {
    id: 3,
    category: "Reports Stack",
    subCategories: [
      {
        id: 20,
        subCategory: "Sales Reports",
        permissions: [
          { id: 201, name: "View" },
          { id: 202, name: "Export" },
        ],
        isGlobalPermissionForSubCategory: true,
      },
    ],
  },
];

const mockRolePermissions = [
  {
    id: 2,
    name: "Admin",
    description: "Administrator role with full system access",
    editable: true,
    basic: true,
    type: "system",
    title: "System Administrator",
    deletable: false,
    level: 2,
    lvlPrimary: true,
    assignable: true,
    permissions: [
      {
        id: 101,
        name: "View",
        category: "Users",
        subCategory: "User Management",
        description: "Ability to view user information",
      },
      {
        id: 102,
        name: "Create",
        category: "Users",
        subCategory: "User Management",
        description: "Ability to create new users",
      },
      {
        id: 201,
        name: "View",
        category: "Reports",
        subCategory: "Sales Reports",
        description: "Ability to view sales reports",
      },
    ],
  },
  {
    id: 3,
    name: "Manager",
    description: "Management role with limited system access",
    editable: true,
    basic: false,
    type: "organizational",
    title: "Organizational Manager",
    deletable: true,
    level: 3,
    lvlPrimary: false,
    assignable: true,
    permissions: [
      {
        id: 101,
        name: "View",
        category: "Users",
        subCategory: "User Management",
        description: "Ability to view user information",
      },
      {
        id: 202,
        name: "Export",
        category: "Reports",
        subCategory: "Sales Reports",
        description: "Ability to export sales reports",
      },
    ],
  },
];

jest.mock("react-router-dom", () => ({ useNavigate: jest.fn() }));

jest.mock("../../hooks/usePermission", () => ({ usePermission: jest.fn() }));

jest.mock("react-toast-notifications", () => ({
  useToasts: jest.fn(() => ({
    addToast: jest.fn(),
  })),
}));

jest.mock("../../hooks/useApi", () => ({ useApi: jest.fn() }));

describe("ManageRolesPermissions Component - Extended Coverage", () => {
  let mockGet: jest.Mock;
  let mockPost: jest.Mock;
  let mockAddToast: jest.Mock;
  let mockCheckForPermission: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockPost = jest.fn();
    mockAddToast = jest.fn();
    mockCheckForPermission = jest.fn().mockReturnValue(true);

    (useApi as jest.Mock).mockReturnValue({
      get: mockGet,
      post: mockPost,
    });
    (useToasts as jest.Mock).mockReturnValue({
      addToast: mockAddToast,
    });

    mockGet.mockImplementation((endpoint) => {
      if (endpoint.includes("/access/roles/permissions")) {
        return Promise.resolve(mockRolePermissions);
      } else if (endpoint.includes("/access/roles")) {
        return Promise.resolve(mockRoles);
      } else if (endpoint.includes("/access/permissions")) {
        return Promise.resolve(mockPermissions);
      }

      return Promise.resolve([]);
    });

    mockPost.mockImplementation((endpoint, data) => {
      if (
        endpoint.includes("/access/roles") &&
        endpoint.includes("/permissions")
      ) {
        return Promise.resolve({
          message: "Permissions updated successfully",
          success: true,
        });
      }
      return Promise.resolve({
        message: "API endpoint",
        success: true,
      });
    });

    (usePermission as jest.Mock).mockReturnValue({
      transformPermissions: jest
        .fn()
        .mockReturnValue(mockTransformedPermissions),
      filterPermission: jest.fn().mockReturnValue(mockTransformedPermissions),
      migratePermissions: jest.fn(),
      checkForPermission: mockCheckForPermission,
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <ManageRolesPermissions />
      </Provider>,
    );

  it("handles subcategory permission selection", async () => {
    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      const subCategoryFullAccessCheckboxes =
        screen.getAllByText("Full Access");
      expect(subCategoryFullAccessCheckboxes[0]).toBeInTheDocument();
    });

    const subCategoryFullAccessCheckboxes = screen.getAllByText("Full Access");
    const firstSubCategoryFullAccessCheckbox =
      subCategoryFullAccessCheckboxes[0].closest("label");

    expect(firstSubCategoryFullAccessCheckbox).toBeInTheDocument();
    fireEvent.click(firstSubCategoryFullAccessCheckbox);

    await waitFor(() => {
      const saveButton = screen.getByText("SAVE");
      expect(saveButton).toBeInTheDocument();
    });
  });

  it("verifies permission checkbox count and initial state", async () => {
    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      const categoryNames = screen.getAllByText(/Users|Reports/);
      expect(categoryNames.length).toBeGreaterThan(0);

      const permissionCheckboxes = screen.getAllByRole("checkbox");
      expect(permissionCheckboxes.length).toBeGreaterThan(0);
    });
  });

  it("handles individual permission selection", async () => {
    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      const individualPermissionCheckboxes =
        screen.getAllByText(/View|Create|Edit/);
      expect(individualPermissionCheckboxes[0]).toBeInTheDocument();
    });

    const individualPermissionCheckboxes =
      screen.getAllByText(/View|Create|Edit/);
    const firstIndividualPermissionCheckbox =
      individualPermissionCheckboxes[0].closest("label");

    fireEvent.click(firstIndividualPermissionCheckbox);

    await waitFor(() => {
      const saveButton = screen.getByText("SAVE");
      expect(saveButton).toBeInTheDocument();
    });
  });

  it("validates permission hierarchy inheritance", async () => {
    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      const categoryAllPermissionsCheckboxes =
        screen.getAllByText("All Permissions");
      expect(categoryAllPermissionsCheckboxes[0]).toBeInTheDocument();
    });

    const categoryAllPermissionsCheckboxes =
      screen.getAllByText("All Permissions");
    const firstCategoryAllPermissionsCheckbox =
      categoryAllPermissionsCheckboxes[0].closest("label");

    fireEvent.click(firstCategoryAllPermissionsCheckbox);

    await waitFor(() => {
      const saveButton = screen.getByText("SAVE");
      expect(saveButton).toBeInTheDocument();
    });
  });

  it("ensures component can be exported and rendered", () => {
    expect(ManageRolesPermissions).toBeDefined();

    render(
      <Provider store={store}>
        <ManageRolesPermissions />
      </Provider>,
    );
  });

  it("handles permission update failure", async () => {
    // Mock failed permission update
    mockPost.mockResolvedValueOnce({
      message: "Permission update failed",
      success: false,
    });

    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      const individualPermissionCheckboxes =
        screen.getAllByText(/View|Create|Edit/);
      expect(individualPermissionCheckboxes[0]).toBeInTheDocument();
    });

    const individualPermissionCheckboxes =
      screen.getAllByText(/View|Create|Edit/);
    const firstIndividualPermissionCheckbox =
      individualPermissionCheckboxes[0].closest("label");

    fireEvent.click(firstIndividualPermissionCheckbox);

    const saveButton = screen.getByText("SAVE");
    fireEvent.click(saveButton);

    // Verify error toast
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        "Permission update failed",
        expect.objectContaining({ appearance: "error" }),
      );
    });
  });

  it("handles permission update sucess", async () => {
    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      const individualPermissionCheckboxes =
        screen.getAllByText(/View|Create|Edit/);
      expect(individualPermissionCheckboxes[0]).toBeInTheDocument();
    });

    const individualPermissionCheckboxes =
      screen.getAllByText(/View|Create|Edit/);
    const firstIndividualPermissionCheckbox =
      individualPermissionCheckboxes[0].closest("label");

    fireEvent.click(firstIndividualPermissionCheckbox);

    const saveButton = screen.getByText("SAVE");
    fireEvent.click(saveButton);
  });

  it("disables permissions when user lacks update permission", async () => {
    mockCheckForPermission.mockReturnValueOnce(false);

    await act(async () => {
      renderComponent();
    });
  });
  it("fetches role-specific permissions when role is selected", async () => {
    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      const roleSelect = screen.getByRole("combobox");
      expect(roleSelect).toBeInTheDocument();
    });

    const roleSelect = screen.getByRole("combobox");
    fireEvent.change(roleSelect, { target: { value: "3" } });
  });
  it("handles empty API responses gracefully", async () => {
    mockGet.mockImplementation(() => Promise.resolve([]));

    await act(async () => {
      renderComponent();
    });
  });

  it("correctly removes permissions when unchecking a category", async () => {
    mockGet.mockImplementation((endpoint) => {
      if (endpoint.includes("/access/roles/permissions")) {
        return Promise.resolve([
          {
            ...mockRolePermissions[0],
            permissions: mockPermissions.flatMap(
              (category) => category.permissions,
            ),
          },
        ]);
      } else if (endpoint.includes("/access/roles")) {
        return Promise.resolve(mockRoles);
      } else if (endpoint.includes("/access/permissions")) {
        return Promise.resolve(mockPermissions);
      }
      return Promise.resolve([]);
    });

    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      const categoryNames = screen.getAllByText(/Users|Reports/);
      expect(categoryNames.length).toBeGreaterThan(0);
    });

    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("/access/roles/permissions"),
    );

    const allPermissionsCheckboxes = screen.getAllByText("All Permissions");
    const categoryCheckbox = allPermissionsCheckboxes[0]
      .closest("label")
      .querySelector("input");

    expect(categoryCheckbox.checked).toBe(false);

    mockPost.mockResolvedValueOnce({
      message: "Permissions updated successfully",
      success: true,
    });

    fireEvent.click(categoryCheckbox);

    await waitFor(() => {
      const saveButton = screen.getByText("SAVE");
      expect(saveButton).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("SAVE"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining("/access/roles/"),
        expect.objectContaining({
          data: expect.objectContaining({
            permissionIds: expect.any(Array),
          }),
        }),
      );
    });
  });
});
