import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import ManageRoster from "./ManageRoster";
import { useRoster } from "../../../hooks/useRoster";
import { store, useAppSelector } from "../../../app/store/store";
import { Provider } from "react-redux";
import moment from "moment";
import { useLocation } from "react-router-dom";

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(() => ({
    pathname: "test",
  })),
}));

jest.mock("../../../hooks/useRoster", () => ({
  useRoster: jest.fn(),
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
      <ManageRoster />
    </Provider>
  );
};

describe("ManageRoster Component", () => {
  let mockUseRoster;

  beforeEach(() => {
    jest.setTimeout(60000);
    jest.clearAllMocks();

    mockUseRoster = {
      goToRosterEdit: jest.fn(),
      onCreateRosterClick: jest.fn(),
      selectedYear: moment().year(),
      onChangeYear: jest.fn(),
      years: [moment().year()],
      weeks: [{ number: 1 }, { number: 2 }, { number: 3 }],
      onChangeWeek: jest.fn(),
      roster: null,
      shifts: [],
      onCloneWeekModalClose: jest.fn(),
      cloneWeekId: null,
      setCloneWeekId: jest.fn(),
      onStartFreshRoster: jest.fn(),
      onCloneWeek: jest.fn(),
      getEmployeeCluster: jest.fn(),
      getAllClusters: jest.fn(),
      clusters: [
        { id: 1, name: "Cluster 1", editable: true },
        { id: 2, name: "Cluster 2", editable: true },
      ],
      userClustersInfo: {
        memberOfClusters: [1, 2],
        leaderOfClusters: [1],
      },
      selectedClusterId: 1,
      onChangeSelectedClusterId: jest.fn(),
      miscWorks: [],
      getPayrollConfig: jest.fn(),
      payrollConfig: {
        currentPStartDateTime: moment().startOf("week").toISOString(),
        currentPEndDateTime: moment().endOf("week").toISOString(),
      },
    };

    (useRoster as jest.Mock).mockReturnValue(mockUseRoster);
    (useLocation as jest.Mock).mockReturnValue({
      pathname: "test",
    });
    (useAppSelector as jest.Mock).mockReturnValue({
      user: {
        userRoles: {
          TestCostCenter: [101],
          name: "Test User",
        },
      },
      selectedCostCenterName: "TestCostCenter",
      selectedWeek: moment().week(),
      isCloneWeekModalOpen: false,
      roles: [{ id: 101, title: "ADMIN" }],
    });
  });

  test("renders component with clusters", () => {
    renderComponent();

    expect(screen.getByText("Cluster 1")).toBeInTheDocument();
    expect(screen.getByText("Cluster 2")).toBeInTheDocument();
  });

  test("handles clone week modal interactions", () => {
    (useAppSelector as jest.Mock).mockReturnValue({
      user: {
        userRoles: {
          TestCostCenter: [101],
          name: "Test User",
        },
      },
      selectedCostCenterName: "TestCostCenter",
      selectedWeek: moment().week(),
      isCloneWeekModalOpen: true,
      roles: [{ id: 101, title: "ADMIN" }],
    });

    renderComponent();

    expect(screen.getByText("Autofill Roster")).toBeInTheDocument();

    const weekSelect = screen.getByRole("combobox");

    act(() => {
      fireEvent.change(weekSelect, { target: { value: "1" } });
    });

    const autofillButton = screen.getByText("Autofill");

    act(() => {
      fireEvent.click(autofillButton);
    });

    expect(mockUseRoster.onCloneWeek).not.toHaveBeenCalled();
  });

  test("handles create roster for future weeks", () => {
    mockUseRoster.selectedYear = moment().year() + 1;

    renderComponent();

    const createRosterButton = screen.getByText("+ Create Roster");
    expect(createRosterButton).toBeInTheDocument();

    act(() => {
      fireEvent.click(createRosterButton);
    });

    expect(mockUseRoster.onCreateRosterClick).toHaveBeenCalled();
  });

  test("handles cluster selection", () => {
    renderComponent();

    const cluster2Tab = screen.getByText("Cluster 2");

    act(() => {
      fireEvent.click(cluster2Tab);
    });

    expect(mockUseRoster.onChangeSelectedClusterId).toHaveBeenCalledWith(2);
  });

  test("displays no data message when no clusters are available", () => {
    mockUseRoster.clusters = [];
    mockUseRoster.userClustersInfo = {
      memberOfClusters: [],
      leaderOfClusters: [],
    };

    renderComponent();

    expect(
      screen.getByText(
        /Sorry, but it seems you are not the leader of any cluster/
      )
    ).toBeInTheDocument();
  });
});
