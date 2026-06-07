import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ManageUsersRoles from "./ManageUsersRoles";
import { useApi } from "../../hooks/useApi";
import { useToasts } from "react-toast-notifications";
import { usePermission } from "../../hooks/usePermission";

const mockAddToast = jest.fn();
jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: mockAddToast,
  }),
}));

jest.mock("../../hooks/useApi", () => ({
  useApi: jest.fn(),
}));

jest.mock("../../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

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

jest.mock("../profile/BasicDetails", () => ({ userDetails }) => (
  <div data-testid="basic-details">Basic Details: {userDetails.empId}</div>
));

jest.mock(
  "../profile/RolesDetails",
  () =>
    ({ userRolesDetails, userId, getEmployeeDetails, viewOnly }) =>
      (
        <div data-testid="roles-details">
          Roles Details: User {userId} (View Only: {viewOnly.toString()})
        </div>
      )
);

const useApiMock = useApi as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;

const mockUser = {
  empId: "12345",
  userId: "user1",
  name: "John Doe",
  userRolesDetails: [],
};

describe("ManageUsersRoles Component", () => {
  const mockGet = jest.fn();
  const mockCheckPermission = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useApiMock.mockReturnValue({
      get: mockGet,
    });
    usePermissionMock.mockReturnValue({
      checkForPermission: mockCheckPermission,
    });
    mockCheckPermission.mockReturnValue(true);
  });

  test("renders initial state correctly", async () => {
    render(<ManageUsersRoles />);
    expect(
      screen.getByText("On your mark, get set, search!")
    ).toBeInTheDocument();
  });

  test("fetches and displays user details on successful search", async () => {
    mockGet.mockResolvedValueOnce(mockUser);

    render(<ManageUsersRoles />);

    const input = screen.getByPlaceholderText("Enter Employee Id");
    fireEvent.change(input, { target: { value: "12345" } });

    const searchButton = screen.getByRole("button", { name: "SEARCH" });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("/12345"));
      expect(screen.getByTestId("basic-details")).toBeInTheDocument();
      expect(screen.getByTestId("roles-details")).toBeInTheDocument();
    });
  });

  test("displays loading spinner during API call", async () => {
    mockGet.mockResolvedValueOnce(mockUser);
    render(<ManageUsersRoles />);

    const input = screen.getByPlaceholderText("Enter Employee Id");
    fireEvent.change(input, { target: { value: "12345" } });
    const searchButton = screen.getByRole("button", { name: "SEARCH" });
    fireEvent.click(searchButton);
    await waitFor(() => {
      expect(screen.getByTestId("app-loader")).toBeInTheDocument();
    });
  });

  test("displays user not found toast on failed search", async () => {
    mockGet.mockResolvedValueOnce({});

    render(<ManageUsersRoles />);

    const input = screen.getByPlaceholderText("Enter Employee Id");
    fireEvent.change(input, { target: { value: "invalid" } });

    const searchButton = screen.getByRole("button", { name: "SEARCH" });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith("User Not Found!", {
        appearance: "error",
        autoDismiss: true,
      });
    });
  });

  test("displays basic details and roles details when data is present", async () => {
    mockGet.mockResolvedValueOnce(mockUser);

    render(<ManageUsersRoles />);

    const input = screen.getByPlaceholderText("Enter Employee Id");
    fireEvent.change(input, { target: { value: "12345" } });

    const searchButton = screen.getByRole("button", { name: "SEARCH" });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId("basic-details")).toHaveTextContent(
        "Basic Details: 12345"
      );
      expect(screen.getByTestId("roles-details")).toHaveTextContent(
        "Roles Details: User user1 (View Only: false)"
      );
    });
  });

  test("check if the search input work correctly", async () => {
    mockGet.mockResolvedValueOnce(mockUser);
    render(<ManageUsersRoles />);

    const input = screen.getByPlaceholderText("Enter Employee Id");
    fireEvent.change(input, { target: { value: "12345" } });
    expect(input).toHaveValue("12345");
  });

  test("displays roles details in view only mode when user does not have permission", async () => {
    mockGet.mockResolvedValueOnce(mockUser);
    mockCheckPermission.mockReturnValue(false);

    render(<ManageUsersRoles />);

    const input = screen.getByPlaceholderText("Enter Employee Id");
    fireEvent.change(input, { target: { value: "12345" } });

    const searchButton = screen.getByRole("button", { name: "SEARCH" });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByTestId("roles-details")).toHaveTextContent(
        "Roles Details: User user1 (View Only: true)"
      );
    });
  });

  test("does not make API call when empId is empty", async () => {
    render(<ManageUsersRoles />);

    const searchButton = screen.getByRole("button", { name: "SEARCH" });
    expect(searchButton).toBeDisabled();

    fireEvent.click(searchButton);
    expect(mockGet).not.toHaveBeenCalled();
  });
});
