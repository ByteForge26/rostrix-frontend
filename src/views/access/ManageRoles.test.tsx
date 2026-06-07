import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import { useToasts } from "react-toast-notifications";
import ManageRoles from "./ManageRoles";

const mockAddToast = jest.fn();
jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: mockAddToast,
  }),
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
  useApi: jest.fn(),
}));

jest.mock("../../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

const useApiMock = useApi as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;
jest.mock("../../components/AppContainer", () => ({ children, heading }) => (
  <div data-testid="app-container">
    <h1>{heading}</h1>
    {children}
  </div>
));
jest.mock("../../components/AppHeader", () => ({ children }) => (
  <div data-testid="app-header">{children}</div>
));
jest.mock("../../components/AppLoader", () => () => (
  <div data-testid="app-loader">Loading...</div>
));
jest.mock("../../components/AppNoData", () => () => (
  <div data-testid="app-no-data">No data</div>
));
jest.mock("react-beautiful-dnd", () => ({
  DragDropContext: ({ children }) => <div>{children}</div>,
  Droppable: ({ children }) =>
    children(
      {
        innerRef: () => {},
        droppableProps: {},
        placeholder: null,
      },
      { isDraggingOver: false }
    ),
  Draggable: ({ children }) =>
    children(
      {
        innerRef: () => {},
        draggableProps: {},
        dragHandleProps: {},
      },
      { isDragging: false },
      { isDragging: false }
    ),
}));

const mockRoles = [
  {
    id: 1,
    name: "Admin",
    description: "Administrator role",
    basic: true,
    editable: true,
    deletable: false,
    type: "SYSTEM",
    title: "System Admin",
    level: 1,
    lvlPrimary: true,
  },
  {
    id: 2,
    name: "Manager",
    description: "Manager role",
    basic: false,
    editable: true,
    deletable: true,
    type: "USER",
    title: "User Manager",
    level: 2,
    lvlPrimary: true,
  },
  {
    id: 3,
    name: "Basic User",
    description: "Basic role",
    basic: true,
    editable: false,
    deletable: false,
    type: "USER",
    title: "Basic User",
    level: 3,
    lvlPrimary: false,
  },
];

describe("ManageRoles Component", () => {
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockPut = jest.fn();
  const mockAddToast = jest.fn();
  const mockCheckPermission = jest.fn();
  const setRoleLevel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useApiMock.mockReturnValue({
      get: mockGet,
      post: mockPost,
      put: mockPut,
    });

    usePermissionMock.mockReturnValue({
      checkForPermission: mockCheckPermission,
    });

    mockCheckPermission.mockReturnValue(true);
  });

  test("renders loading state initially", async () => {
    mockGet.mockResolvedValueOnce([]);

    render(<ManageRoles />);

    expect(screen.getByTestId("app-loader")).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByTestId("app-no-data")).toBeInTheDocument();
    });
  });

  test("opens delete confirmation modal when delete button is clicked", async () => {
    mockGet.mockResolvedValueOnce(mockRoles);

    render(<ManageRoles />);

    await waitFor(() => {
      const deleteButton = screen.getByTestId("delete");
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }
    });

    expect(screen.getByText("Delete Role")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to Delete Role?")
    ).toBeInTheDocument();
  });

  test("filters roles based on search input", async () => {
    mockGet.mockResolvedValueOnce(mockRoles);

    render(<ManageRoles />);

    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("Manager")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText("Search Roles");
    fireEvent.change(searchInput, { target: { value: "Admin" } });

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.queryByText("Manager")).not.toBeInTheDocument();
  });

  test("creates a new role successfully", async () => {
    mockGet.mockResolvedValueOnce(mockRoles);
    mockPost.mockResolvedValueOnce({
      success: true,
      message: "Role created successfully",
    });

    render(<ManageRoles />);

    await waitFor(() => {
      const addButton = screen.getByText("+ Add Role");
      fireEvent.click(addButton);
    });

    const nameInput = screen.getByTestId("input-name");
    const descInput = screen.getByTestId("input-description");

    fireEvent.change(nameInput, { target: { value: "New Role" } });
    fireEvent.change(descInput, {
      target: { value: "Description for new role" },
    });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(expect.any(String), {
        data: expect.objectContaining({
          name: "New Role",
          description: "Description for new role",
        }),
      });
    });
  });

  test("updates an existing role successfully", async () => {
    mockGet.mockResolvedValueOnce(mockRoles);
    mockPut.mockResolvedValueOnce({
      success: true,
      message: "Role updated successfully",
    });

    render(<ManageRoles />);

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText("");
      fireEvent.click(editButtons[0]);
    });

    const nameInput = screen.getByTestId("input-name");
    const descInput = screen.getByTestId("input-description");

    fireEvent.change(nameInput, { target: { value: "Updated Admin" } });
    fireEvent.change(descInput, { target: { value: "Updated description" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith(expect.any(String), {
        data: expect.objectContaining({
          name: "Updated Admin",
          description: "Updated description",
        }),
      });
    });
  });

  test("handles API error when creating a role", async () => {
    mockGet.mockResolvedValueOnce(mockRoles);
    mockPost.mockResolvedValueOnce({
      success: false,
      message: "Failed to create role",
    });

    render(<ManageRoles />);

    await waitFor(() => {
      const addButton = screen.getByText("+ Add Role");
      fireEvent.click(addButton);
    });

    const nameInput = screen.getByTestId("input-name");
    fireEvent.change(nameInput, { target: { value: "New Role" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalled();
      expect(mockGet).toHaveBeenCalledTimes(1);
    });
  });

  test("handles API error when updating a role", async () => {
    mockGet.mockResolvedValueOnce(mockRoles);
    mockPut.mockResolvedValueOnce({
      success: false,
      message: "Failed to update role",
    });

    render(<ManageRoles />);

    await waitFor(() => {
      const editButtons = screen.getAllByLabelText("");
      fireEvent.click(editButtons[0]);
    });

    const nameInput = screen.getByTestId("input-name");
    fireEvent.change(nameInput, { target: { value: "Updated Admin" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalled();
      expect(mockGet).toHaveBeenCalledTimes(1);
    });
  });
});
