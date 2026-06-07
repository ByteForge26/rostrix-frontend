import React from "react";
import { render, screen } from "@testing-library/react";
import PublishRoster from "./PublishRoster";
import { useRoster } from "../../../hooks/useRoster";
import { store, useAppSelector } from "../../../app/store/store";
import { Provider } from "react-redux";
import { useLocation } from "react-router-dom";

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));
jest.mock("../../../hooks/useRoster", () => ({
  useRoster: jest.fn(),
}));
jest.mock("../../../app/store/store", () => ({
  useAppSelector: jest.fn(),
}));
jest.mock("moment");

const useRosterMock = useRoster as jest.Mock;

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

jest.mock("../../../app/store/store", () => ({
  ...jest.requireActual("../../../app/store/store"),
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

const renderComponent = () => {
  return render(
    <Provider store={store}>
      <PublishRoster />
    </Provider>
  );
};

describe("PublishRoster Component", () => {
  let mockUseRoster = {
    goToRosterEdit: jest.fn(),
    selectedYear: 2024,
    selectedMonth: 11,
    onChangeYear: jest.fn(),
    onChangeMonth: jest.fn(),
    monthSummary: [],
    onChangeWeek: jest.fn(),
    onPublishRoster: jest.fn(),
    onCloneWeekModalOpen: jest.fn(),
    isPublishedRosterModalOpen: false,
    onPublishedRosterModalClose: jest.fn(),
    getAllClusters: jest.fn(() => {
      mockUseRoster.clusters = [
        { id: 1, name: "Cluster 1", editable: true },
        { id: 2, name: "Cluster 2", editable: true },
        { id: 3, name: "Cluster 3", editable: true },
        { id: 4, name: "Cluster 4", editable: true },
        { id: 5, name: "Cluster 5", editable: true },
        { id: 6, name: "Cluster 6", editable: true },
        { id: 8, name: "Cluster 7", editable: true },
      ];
    }),
    clusters: [
      { id: 1, name: "Cluster 1", editable: true },
      { id: 2, name: "Cluster 2", editable: true },
      { id: 3, name: "Cluster 3", editable: true },
      { id: 4, name: "Cluster 4", editable: true },
      { id: 5, name: "Cluster 5", editable: true },
      { id: 6, name: "Cluster 6", editable: true },
      { id: 7, name: "Cluster 7", editable: true },
    ],
    visibleClusters: [1, 2, 3, 4, 5, 6, 7],
    selectedClusterId: 1,
    onChangeSelectedClusterId: jest.fn(),
    userClustersInfo: { memberOfClusters: [1, 2, 3], leaderOfClusters: [3] },
    getEmployeeCluster: jest.fn(),
    getPayrollConfig: jest.fn(),
    payrollConfig: null,
    isEmpExceedingHoursListModalOpen: false,
    onEmpExceedingHoursListModalClose: jest.fn(),
    empExceedingHoursList: [],
    isForceConfirmModalOpen: false,
    onForceConfirmModalClose: jest.fn(),
    messageObj: {},
    isWeekUncoveredShiftsModalOpen: false,
    onWeekUncoveredShiftsModalClose: jest.fn(),
    weekUncoveredShifts: [],
    isPublishing: false,
    onChangeSelectedDay: jest.fn(),
  };
  beforeEach(() => {
    jest.setTimeout(60000);
    jest.clearAllMocks();
    (useRoster as jest.Mock).mockReturnValue(mockUseRoster);
    (useLocation as jest.Mock).mockReturnValue({
      pathname: "test",
    });

    (useAppSelector as jest.Mock).mockReturnValue({
      user: {
        userRoles: {
          TestCostCenter: [101],
        },
        name: "Test User",
      },
      selectedCostCenterName: "TestCostCenter",
      roles: [{ id: 101, title: "ADMIN" }],
    });
  });

  test("renders PublishRoster component", () => {
    render(<PublishRoster />);

    expect(screen.getByText("Layout | Publish Roster")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Publish roster to make them live & notify relevant employees about their assigned shifts."
      )
    ).toBeInTheDocument();
  });

  test("renders AppTabs when visibleClusters are available", () => {
    renderComponent();
    expect(screen.getByText("TestCostCenter")).toBeInTheDocument();
  });
  test("signout should be present", () => {
    renderComponent();
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });
  test("publish roster should be present", () => {
    renderComponent();
    expect(screen.getByText("Published")).toBeInTheDocument();
  });
  test("Cost center should be present", () => {
    renderComponent();
    expect(screen.getByText("Cluster 1")).toBeInTheDocument();
  });
  test("Not Applicable should be present", () => {
    renderComponent();
    expect(screen.getByText("Not Applicable")).toBeInTheDocument();
  });
  test("Yet to be Created should be present", () => {
    renderComponent();
    expect(screen.getByText("Yet to be Created")).toBeInTheDocument();
  });
});
