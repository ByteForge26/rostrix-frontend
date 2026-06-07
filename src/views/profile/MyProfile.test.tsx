import React from "react";
import { render, screen, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../app/store/store";
import MyProfile from "./MyProfile";
import { useApi } from "../../hooks/useApi";
import { useAppSelector } from "../../app/store/store";
import { IUserResponse } from "../../helper/Interface";
import { usePermission } from "../../hooks/usePermission";

jest.mock("../../app/store/store", () => ({
  ...jest.requireActual("../../app/store/store"),
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

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
const usePermissionMock = usePermission as jest.Mock;

const mockAddToast = jest.fn();
jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: mockAddToast,
  }),
}));
const useApiMock = useApi as jest.Mock;
const useAppSelectorMock = useAppSelector as jest.Mock;

const mockUserDetails: IUserResponse = {
  empId: "DSI000486",
  userId: "123",
  userRolesDetails: [{ roleId: 1, roleName: "Admin" }],
};

describe("MyProfile Component", () => {
  beforeEach(() => {
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/user")) {
          return Promise.resolve(mockUserDetails);
        }
        return Promise.resolve(null);
      }),
    });

    useAppSelectorMock.mockReturnValue({
      user: { empId: "DSI000486" },
    });
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render My Profile heading", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MyProfile />
        </Provider>
      );
    });
  });

  it("should display loader while fetching data", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MyProfile />
        </Provider>
      );
    });
  });

  it("should render BasicDetails and RolesDetails components with user data", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <MyProfile />
        </Provider>
      );
    });

    expect(screen.getByText("Basic Details")).toBeInTheDocument();
  });

  it("should display no data message if user details are not found", async () => {
    useApiMock.mockReturnValue({
      get: jest.fn(() => Promise.resolve(null)),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <MyProfile />
        </Provider>
      );
    });
  });
});
