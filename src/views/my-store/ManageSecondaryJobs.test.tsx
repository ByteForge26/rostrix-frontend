import {
  render,
  screen,
  act,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { store, useAppSelector } from "../../app/store/store";
import {
  ISecondaryJob,
  IUserResponse,
  IStoreSecondaryJob,
  IStoreSecondaryJobEmployee,
} from "../../helper/Interface";
import ManageSecondaryJobs from "./ManageSecondaryJobs";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import React from "react";

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
  {
    userId: "9a2fa188-fdb2-40f4-ba81-d05b29a3eb55",
    firstName: "Prince",
    lastName: "Attri",
    email: "prince.attri@decathlon.com",
    empId: "DSI006062",
    managerId: "DSI006227",
    costCentreName: "IN1311",
    contractTypeId: 2,
    contractTypeName: "Full Time",
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

const mockGetSecondaryJobConfigData: ISecondaryJob[] = [
  {
    id: 2,
    type: "CRM",
    hourCategory: "COMMERCIAL",
    description: "",
    allowSubMem: false,
    subMemName: "",
  },
  {
    id: 3,
    type: "CASHIERING",
    hourCategory: "CASHIERING",
    description: "",
    allowSubMem: false,
    subMemName: "",
  },
];

const mockGetSecondaryJobData: IStoreSecondaryJob[] = [
  {
    id: 952,
    jobType: "PLAYGROUND",
    costCentre: "IN1311",
    coachEmpId: "DSI009473",
    firstName: "Aditya",
    lastName: "Chauhan",
  },
];

const mockPostApiResponse = {
  success: true,
  message: "Configuration Removed",
  messages: null,
  warn: false,
};

const mockPostSaveApiResponse = {
  success: true,
  message: "Configuration Added",
};

const mockPostUpdateApiResponse = {
  success: true,
  message: "Members(s) Removed",
  messages: null,
  warn: false,
};

const sleep = (ms: number | undefined) =>
  new Promise((resolve) => setTimeout(resolve, ms));
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

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));

jest.mock("../../hooks/useApi", () => ({
  useApi: jest.fn(),
}));

jest.mock("../../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

jest.mock("../../app/store/store", () => ({
  useAppSelector: jest.fn(() => ({ selectedCostCenterName: "cost-centre" })),
  useAppDispatch: jest.fn(),
  store: {
    getState: jest.fn(),
    subscribe: jest.fn(),
  },
}));

const useApiMock = useApi as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;

describe("SecondaryJobs Component", () => {
  beforeEach(() => {
    jest.setTimeout(60000);
    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("cost-centre")) {
          return Promise.resolve(mockGetUserData);
        } else if (endpoint.includes("store-config")) {
          return Promise.resolve(mockGetSecondaryJobData);
        } else if (endpoint.includes("master-config")) {
          return Promise.resolve(mockGetSecondaryJobConfigData);
        }

        return Promise.resolve([]);
      }),
      post: jest.fn((endpoint: string, payload: any) => {
        if (endpoint.includes("/remove-store-config")) {
          return Promise.resolve(mockPostApiResponse);
        } else if (endpoint.includes("/add-store-config")) {
          return Promise.resolve(mockPostSaveApiResponse);
        } else if (endpoint.includes("/update-members")) {
          return Promise.resolve(mockPostUpdateApiResponse);
        }
        return Promise.reject({
          success: false,
          message: "Unknown API endpoint",
        });
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

  it("should render `SecondaryJobs  Page`", async () => {
    render(
      <Provider store={store}>
        <ManageSecondaryJobs />
      </Provider>
    );

    expect(screen.getByText("Secondary Jobs")).toBeInTheDocument();
  });

  it("renders button in header when permission is granted", async () => {
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageSecondaryJobs />
        </Provider>
      );
    });

    const actionColumnHeader = screen.getByText(/Add Secondary Jobs/i);
    expect(actionColumnHeader).toBeInTheDocument();
  });

  it("should not display add button when permission is denied", async () => {
    usePermissionMock.mockReturnValueOnce({
      checkForPermission: jest.fn().mockReturnValue(false),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageSecondaryJobs />
        </Provider>
      );
    });

    expect(screen.findByText(/Add Secondary Jobs/i)).not.toBeInTheDocument;
  });

  it("should fetch and display secondary jobs", async () => {
    usePermissionMock.mockReturnValueOnce({
      checkForPermission: jest.fn().mockReturnValue(false),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageSecondaryJobs />
        </Provider>
      );
    });

    expect(screen.findByText(/Playground/i)).toBeInTheDocument;
    expect(screen.findByText(/Aditya/i)).toBeInTheDocument;
  });

  it("should handle delete icon  button click", async () => {
    usePermissionMock.mockReturnValueOnce({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageSecondaryJobs />
        </Provider>
      );
    });

    const deleteIcon = screen.getByLabelText("delete", { name: /delete/i });
    fireEvent.click(deleteIcon);

    expect(screen.getByText("Delete Secondary Job")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to Delete Secondary Job?")
    ).toBeInTheDocument();

    const CloseButton = screen.getByLabelText("Close", { name: /Close/i });
    fireEvent.click(CloseButton);
  });

  it("should delete job", async () => {
    usePermissionMock.mockReturnValueOnce({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageSecondaryJobs />
        </Provider>
      );
    });

    const cardElement = await screen.findByText("Playground");
    expect(cardElement).toBeInTheDocument();

    const deleteIcon = screen.getByLabelText("delete", { name: /delete/i });
    fireEvent.click(deleteIcon);

    expect(screen.getByText("Delete Secondary Job")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to Delete Secondary Job?")
    ).toBeInTheDocument();

    const deleteButton = screen.getByLabelText("Delete", { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(useApiMock().post).toHaveBeenCalledWith(
        "/v1/secondary/remove-store-config",
        {
          data: {
            configId: 952,
            forceConfirm: false,
          },
        }
      );
    });
  });

  it("click add sendory job button in header when permission is granted", async () => {
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageSecondaryJobs />
        </Provider>
      );
    });

    const actionColumnHeader = screen.getByText(/Add Secondary Jobs/i);
    expect(actionColumnHeader).toBeInTheDocument();
    fireEvent.click(actionColumnHeader);

    const modalTitle = await screen.findByText("Add Secondary Jobs");
    expect(modalTitle).toBeInTheDocument();
  });

  it("should open modal when an  card is clicked", async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManageSecondaryJobs />
        </Provider>
      );
    });

    const cardElement = await screen.findByText("Playground");
    expect(cardElement).toBeInTheDocument();

    fireEvent.click(cardElement);
    const modalField = await screen.findByText("Playground Coach");
    expect(modalField).toBeInTheDocument();

    const modalSubField = await screen.findByText("Playground Members");
    expect(modalSubField).toBeInTheDocument();

    const employeeNameInModal = await screen.findAllByText(/Aditya Chauhan/i);

    expect(employeeNameInModal[0]).toBeInTheDocument();
  });

  it("should open modal when an  card is clicked and add  member", async () => {
    await waitFor(() => {
      render(
        <Provider store={store}>
          <ManageSecondaryJobs />
        </Provider>
      );
    });

    const cardElement = await screen.findByText("Playground");
    expect(cardElement).toBeInTheDocument();

    fireEvent.click(cardElement);
    const modalField = await screen.findByText("Playground Coach");
    expect(modalField).toBeInTheDocument();

    const modalSubField = await screen.findByText("Playground Members");
    expect(modalSubField).toBeInTheDocument();

    const employeeNameInModal = await screen.findAllByText(/Aditya Chauhan/i);

    expect(employeeNameInModal[0]).toBeInTheDocument();

    const allAddIcons = screen.getAllByLabelText("addIcon");
    fireEvent.click(allAddIcons[0]); // Click the first one

    expect(await screen.findByText("Add Employees")).toBeInTheDocument();

    const SearchInput = screen.getByPlaceholderText(/Search here/i);
    fireEvent.change(SearchInput, {
      target: { value: "Aditya Chauhan" },
    });

    const AddemployeeNameInModal = await screen.findAllByText(
      /Aditya Chauhan/i
    );
    expect(AddemployeeNameInModal[0]).toBeInTheDocument();
    fireEvent.click(AddemployeeNameInModal[0]);

    const findConfirmButton = await screen.findByRole("button", {
      name: /Confirm/i,
    });

    fireEvent.click(findConfirmButton);
  });

  it("should open modal when a card is clicked and remove a member", async () => {
    const mockStoreSecondaryJobData: IStoreSecondaryJobEmployee[] = [
      {
        empId: "DSI009473",
        firstName: "Aditya",
        lastName: "Chauhan",
        contractTypeId: 1,
        configId: 952,
        type: "COACH",
      },
    ];

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("cost-centre")) {
          return Promise.resolve(mockGetUserData);
        } else if (endpoint.includes("store-config")) {
          return Promise.resolve(mockGetSecondaryJobData);
        } else if (endpoint.includes("master-config")) {
          return Promise.resolve(mockGetSecondaryJobConfigData);
        } else if (endpoint.includes("952")) {
          return Promise.resolve(mockStoreSecondaryJobData);
        }

        return Promise.resolve([]);
      }),
      post: jest.fn((endpoint: string, payload: any) => {
        if (endpoint.includes("/remove-store-config")) {
          return Promise.resolve(mockPostApiResponse);
        } else if (endpoint.includes("/update-members")) {
          return Promise.resolve(mockPostUpdateApiResponse);
        }
        return Promise.reject({
          success: false,
          message: "Unknown API endpoint",
        });
      }),
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageSecondaryJobs />
        </Provider>
      );
    });

    const cardElement = await screen.findByText("Playground");
    expect(cardElement).toBeInTheDocument();

    // Open the modal by clicking the card
    fireEvent.click(cardElement);

    const modalField = await screen.findByText("Playground Coach");
    expect(modalField).toBeInTheDocument();

    const employeeNameInModal = await screen.findAllByText(/Aditya Chauhan/i);
    expect(employeeNameInModal[0]).toBeInTheDocument();

    await sleep(500);
    // Click the delete icon for the member
    const allDeleteIcons = screen.getAllByLabelText("deleteIcon");
    fireEvent.click(allDeleteIcons[0]);

    expect(await screen.findByText("Remove Employees")).toBeInTheDocument();

    const AddemployeeNameInModal = await screen.findAllByText(
      /Aditya Chauhan/i
    );
    expect(AddemployeeNameInModal[1]).toBeInTheDocument();

    const checkbox = screen.getByTestId("checkbox-DSI009473");

    expect(checkbox).toBeInTheDocument();
    fireEvent.click(checkbox);

    await sleep(500);

    const findConfirmButton = screen.getByText("Confirm");
    expect(findConfirmButton).not.toBeDisabled();
    fireEvent.click(findConfirmButton);

    await waitFor(() => {
      expect(useApiMock().post).toHaveBeenCalled();

      expect(useApiMock().post).toHaveBeenCalledWith(
        "/v1/secondary/update-members",
        {
          data: {
            action: "REMOVE",
            configId: 952,
            empIds: ["DSI009473"],
            empType: "COACH",
            forceConfirm: false,
          },
        }
      );
    });
  });

  it("should render and filter options for Secondary  Job dropdown and add new job", async () => {
    usePermissionMock.mockReturnValueOnce({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    render(
      <Provider store={store}>
        <ManageSecondaryJobs />
      </Provider>
    );
    const actionColumnHeader = screen.getByText(/Add Secondary Jobs/i);
    expect(actionColumnHeader).not.toBeDisabled();
    fireEvent.click(actionColumnHeader);
    expect(await screen.findByText("Add Secondary Jobs")).toBeInTheDocument();
    const dropdown = screen.getByRole("combobox");

    expect(dropdown).toBeInTheDocument();
    fireEvent.change(dropdown, {
      target: { value: "crm" },
    });

    const actionClick = screen.getByText(/CRM/i);

    fireEvent.click(actionClick);

    const SaveButton = screen.getByText("Save", { name: /Save/i });
    expect(SaveButton).not.toBeDisabled();

    fireEvent.click(SaveButton);

    await sleep(1000);

    await waitFor(() => {

      expect(useApiMock().post).toHaveBeenCalledWith(
        "/v1/secondary/add-store-config",
        expect.objectContaining({
          data: {
            costCentre: "IN1311",
            secondaryJobIds: [2],
          },
        })
      );
    });

    expect(screen.findByText(/CRM/i)).toBeInTheDocument;
  });
});
