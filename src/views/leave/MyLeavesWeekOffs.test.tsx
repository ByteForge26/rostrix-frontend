import { render, screen, waitFor, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { useAppSelector, store } from "../../app/store/store";
import MyLeavesWeekOffs from "./MyLeavesWeekOffs";
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

// Mock API data
const mockApiData = {
  totalAllowedLeaves: 32,
  stateId: 9,
  contractTypeId: 1,
  leaves: [],
};

const mockUser = {
  empId: 123,
  firstName: "John",
  lastName: "Doe",
  contractTypeId: 1,
  stateId: 9,
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

describe("MyLeavesWeekOffs Component", () => {
  beforeEach(() => {
   
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/my-leaves")) {
          return Promise.resolve(mockApiData);
        }
        return Promise.resolve([]);
      }),
    });

    // Mocking Redux selector
    (useAppSelector as jest.Mock).mockReturnValue({
      user: mockUser
    });

    // Mocking Permissions
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with user data and API data correctly", async () => {
    render(
      <Provider store={store}>
        <MyLeavesWeekOffs />
      </Provider>
    );
    expect(screen.getByText(/My Leaves & Weekly Offs/i)).toBeInTheDocument();
  });

  it("renders fallback content if user data is missing", async () => {
    // Mock useAppSelector to simulate missing user data
    (useAppSelector as jest.Mock).mockReturnValue({
      auth: { user: null },
    });

    render(
      <Provider store={store}>
        <MyLeavesWeekOffs />
      </Provider>
    );

    // Assert that no child component renders
    expect(screen.queryByText(/John Doe/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/totalAllowedLeaves/i)).not.toBeInTheDocument();
  });

  it("renders <LeavesWeekOffs /> when user.empId is present", async () => {

    
    (useAppSelector as jest.Mock).mockReturnValue({
      user: mockUser
    });
    await act(async () => {
      render(
        <Provider store={store}>
          <MyLeavesWeekOffs />
        </Provider>
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Apply for leaves\/week offs/i)
      ).toBeInTheDocument();
    });
  });
  it("user Last Name not present", async () => {

    const mockUser = {
      empId: 123,
      firstName: "John",
      lastName: "",
      contractTypeId: 1,
      stateId: 9,
    };

    (useAppSelector as jest.Mock).mockReturnValue({
      user: mockUser
    });
    
    await act(async () => {
      render(
        <Provider store={store}>
          <MyLeavesWeekOffs />
        </Provider>
      );
    });

  });
});
