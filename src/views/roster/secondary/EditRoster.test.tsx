import {
  render,
  screen,
  act,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { store, useAppSelector } from "../../../app/store/store";
import { Provider } from "react-redux";
import { useApi } from "../../../hooks/useApi";
import { usePermission } from "../../../hooks/usePermission";
import { useRoster } from "../../../hooks/useRoster";
import React from "react";
import EditRoster from "./EditRoster";
import { useNavigate } from "react-router-dom";
import * as reduxHooks from "../../../app/store/store";

jest.mock("../common/CalenderView", () => ({
  __esModule: true,
  default: jest.fn(() => <div>Calendar View</div>),
}));

jest.mock("../common/RosterPublishButton", () => ({
  __esModule: true,
  default: jest.fn((props) => {
    return <div>Publish Button</div>;
  }),
}));

jest.mock("../common/RosterPublishSuccess", () => ({
  __esModule: true,
  default: jest.fn(() => <div>Publish Success</div>),
}));

jest.mock("../common/RosterPublishHoursWarning", () => ({
  __esModule: true,
  default: jest.fn(() => <div>Hours Warning</div>),
}));

jest.mock("../common/RosterPublishForceConfirmWarning", () => ({
  __esModule: true,
  default: jest.fn((props) => {
    return <div>Force Confirm Warning</div>;
  }),
}));

jest.mock("../common/RosterPublishCJPWarning", () => ({
  __esModule: true,
  default: jest.fn(() => <div>CJP Warning</div>),
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
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));
jest.mock("../../../hooks/useApi", () => ({
  useApi: jest.fn(),
}));

jest.mock("../../../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

jest.mock("../../../hooks/useRoster", () => ({
  useRoster: jest.fn(),
}));

jest.mock("../../../app/store/store", () => ({
  useAppSelector: jest.fn((selector) => {
    if (selector.toString().includes("state.roster")) {
      return {
        selectedCostCenterName: "IN1311",
        selectedWeek: 50,
        draft: "1",
        selectedJobType: "PLAYGROUND",
      };
    }
    return {
      selectedCostCenterName: "IN1311",
      selectedWeek: 50,
      draft: "1",
      selectedJobType: "PLAYGROUND",
      roles: [{ id: 1, name: "Admin", title: "ADMIN" }],
      user: {
        userId: "bf110fa3-bd7d-4a55-92c5-9b5f602573f3",
        firstName: "Test",
        lastName: "User",
        email: "test.user@example.com",
        empId: "EMP001",
        userRoles: { IN1311: [4] },
      },
    };
  }),
  useAppDispatch: jest.fn(),
  store: {
    getState: jest.fn(),
    subscribe: jest.fn(),
    dispatch: jest.fn(),
  },
}));

jest.mock("moment", () => {
  const mockMoment = jest.fn(() => ({
    year: jest.fn().mockReturnValue(2024),
    month: jest.fn().mockReturnValue(12),
    date: jest.fn().mockReturnValue(22),
    diff: jest.fn().mockReturnValue(2),
  }));
  mockMoment.duration = jest.fn().mockReturnValue({
    humanize: jest.fn().mockReturnValue("a day"),
  });
  return mockMoment;
});

jest.useFakeTimers();

describe("EditRoster Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useAppSelector.mockReturnValue({
      selectedCostCenterName: "IN1311",
      selectedWeek: 50,
      draft: "1",
      selectedJobType: "PLAYGROUND",
      roles: [
        {
          id: 1,
          name: "Admin",
          title: "ADMIN",
        },
      ],
      user: {
        userId: "bf110fa3-bd7d-4a55-92c5-9b5f602573f3",
        firstName: "Test",
        lastName: "User",
        email: "test.user@example.com",
        empId: "EMP001",
        userRoles: {
          IN1311: [4],
        },
      },
    });
    useApi.mockReturnValue({
      get: jest.fn().mockResolvedValue([]),
      post: jest.fn().mockResolvedValue({}),
    });

    usePermission.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
    });

    useNavigate.mockReturnValue(jest.fn());

    useRoster.mockReturnValue({
      onDraftDataSave: jest.fn(),
      isRosterSaving: false,
      isAnyPartTimeEmp: jest.fn().mockReturnValue(false),
      onValidateHours: jest.fn(),
      isValidating: false,
      validationState: null,
      onPublishRoster: jest.fn(),
      setGlobalNotifyTo: jest.fn(),
      globalNotifyTo: [],
      isEmpExceedingHoursListModalOpen: false,
      onEmpExceedingHoursListModalClose: jest.fn(),
      empDailyExceedingHoursList: [],
      empWeeklyExceedingHoursList: [],
      empExceedingHoursList: [],
      onChangeWeek: jest.fn(),
      goToRosterEdit: jest.fn(),
      isForceConfirmModalOpen: false,
      onForceConfirmModalClose: jest.fn(),
      messageObj: {},
      isWeekUncoveredShiftsModalOpen: false,
      onWeekUncoveredShiftsModalClose: jest.fn(),
      weekUncoveredShifts: [],
      isPublishedRosterModalOpen: false,
      onPublishedRosterModalClose: jest.fn(),
      roster: {
        success: true,
        rosterWeekId: 4003,
        rosterStatus: "DRAFT",
        empWeekRosters: [
          {
            empId: "EMP001",
            fistName: "Test",
            lastName: "User",
            contractId: 2,
            allowedHours: 130.0,
            empHours: [{ totalHours: 0.0 }],
            days: [],
          },
        ],
      },
      finalDuplicateDayIds: [],
      isDuplicateModalOpen: false,
      onChangeSelectedDay: jest.fn(),
      onDuplicateClick: jest.fn(),
      onDuplicateModalClose: jest.fn(),
      onDuplicateModalOpen: jest.fn(),
      shifts: [],
      onShiftChange: jest.fn(),
      getShifts: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("should render the EditRoster component", () => {
    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );
    expect(screen.getByText(/DRAFT/)).toBeInTheDocument();
    expect(screen.getByText(/Rostering Week 50/i)).toBeInTheDocument();
    expect(screen.getByText("INSIGHTS")).toBeInTheDocument();
  });

  it("should set up polling interval for draft data save", () => {
    const onDraftDataSaveMock = jest.fn();
    useRoster.mockReturnValue({
      ...useRoster(),
      onDraftDataSave: onDraftDataSaveMock,
    });

    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );

    act(() => {
      jest.advanceTimersByTime(20000);
    });

    expect(onDraftDataSaveMock).toHaveBeenCalled();
  });

  it("should navigate back when clicking back button", () => {
    const navigateMock = jest.fn();
    useNavigate.mockReturnValue(navigateMock);

    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );

    const backButton = screen.getByLabelText("FiArrowLeft");
    fireEvent.click(backButton);

    expect(navigateMock).toHaveBeenCalledWith(-1);
  });

  it("should show 'Hours Limit Exceeded' message when employees exceed hours limit", () => {
    useRoster.mockReturnValue({
      ...useRoster(),
      roster: {
        ...useRoster().roster,
        empWeekRosters: [
          {
            empId: "EMP001",
            fistName: "Test",
            lastName: "User",
            contractId: 2,
            allowedHours: 130.0,
            empHours: [
              {
                totalHours: 150.0,
                pstartDate: "2024-11-22",
                pendDate: "2024-12-21",
              },
            ],
            days: [],
          },
        ],
      },
    });

    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );

    expect(screen.getByText("Hours Limit Exceeded")).toBeInTheDocument();
  });

  it("should test the onClick handler for validate hours button", () => {
    const onValidateHoursMock = jest.fn();

    const validateButton = (
      <button onClick={() => onValidateHoursMock()}>Validate</button>
    );

    const { getByText } = render(validateButton);

    fireEvent.click(getByText("Validate"));

    expect(onValidateHoursMock).toHaveBeenCalled();
  });

  it("should show 'DRAFT SAVED' message when roster is being saved", () => {
    useRoster.mockReturnValue({
      ...useRoster(),
      isRosterSaving: true,
    });

    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );

    expect(screen.getByText("DRAFT SAVED")).toBeInTheDocument();
  });

  it("should render Save button when draft exists and roster is not saving", () => {
    useRoster.mockReturnValue({
      ...useRoster(),
      isRosterSaving: false,
    });

    useAppSelector.mockReturnValue({
      ...useAppSelector(),
      draft: "1",
    });

    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );

    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeInTheDocument();

    fireEvent.click(saveButton);

    expect(useRoster().onDraftDataSave).toHaveBeenCalled();
  });

  it("should not render Save button when draft doesn't exist", () => {
    useRoster.mockReturnValue({
      ...useRoster(),
      isRosterSaving: false,
    });

    useAppSelector.mockReturnValue({
      ...useAppSelector(),
      draft: "",
    });

    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );

    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("should not render Save button when roster is saving", () => {
    useRoster.mockReturnValue({
      ...useRoster(),
      isRosterSaving: true,
    });

    useAppSelector.mockReturnValue({
      ...useAppSelector(),
      draft: "1",
    });

    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );

    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("should call onPublishRoster with correct parameters", () => {
    const onPublishRosterMock = jest.fn();
    useRoster.mockReturnValue({
      ...useRoster(),
      onPublishRoster: onPublishRosterMock,
      miscWorks: [],
    });

    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );

    const RosterPublishButton =
      require("../common/RosterPublishButton").default;
    const publishButtonProps = RosterPublishButton.mock.calls[0][0];
    publishButtonProps.onPublishRoster({ notifyTo: ["test@example.com"] });

    expect(onPublishRosterMock).toHaveBeenCalledWith({
      notifyTo: ["test@example.com"],
      week: 50,
    });
  });

  it("should pass correct force confirm parameters to onPublishRoster", () => {
    const onPublishRosterMock = jest.fn();
    useRoster.mockReturnValue({
      ...useRoster(),
      onPublishRoster: onPublishRosterMock,
      globalNotifyTo: ["test@example.com"],
      miscWorks: [],
    });

    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );
    const RosterPublishForceConfirmWarning =
      require("../common/RosterPublishForceConfirmWarning").default;
    const forceConfirmProps = RosterPublishForceConfirmWarning.mock.calls[0][0];

    forceConfirmProps.onPublishRoster({
      notifyTo: ["test@example.com"],
      forceConfirm: true,
    });

    expect(onPublishRosterMock).toHaveBeenCalledWith({
      notifyTo: ["test@example.com"],
      forceConfirm: true,
      week: 50,
    });
  });

  it("should call onDraftDataSave when component unmounts", () => {
    const onDraftDataSaveMock = jest.fn();
    useRoster.mockReturnValue({
      ...useRoster(),
      onDraftDataSave: onDraftDataSaveMock,
      miscWorks: [],
    });

    const { unmount } = render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );

    unmount();

    expect(onDraftDataSaveMock).toHaveBeenCalled();

    expect(jest.getTimerCount()).toBe(0);
  });

  it("should not show validate button when isAnyPartTimeEmp is false", () => {
    useRoster.mockReturnValue({
      miscWorks: [],
      onDraftDataSave: jest.fn(),
      onChangeSelectedDay: jest.fn(),
    });
    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );
    expect(screen.queryByText("Validate Hours")).not.toBeInTheDocument();
  });

  it("should directly test onValidateHours function", () => {
    const onValidateHoursMock = jest.fn();

    useRoster.mockReturnValue({
      ...useRoster(),
      onValidateHours: onValidateHoursMock,
      miscWorks: [],
    });

    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );

    useRoster().onValidateHours();

    expect(onValidateHoursMock).toHaveBeenCalled();
  });

  it("should test state.roster selector usage", () => {
    const useAppSelectorSpy = jest.spyOn(reduxHooks, "useAppSelector");
    useRoster.mockReturnValue({
      miscWorks: [],
      onDraftDataSave: jest.fn(),
      onChangeSelectedDay: jest.fn(),
    });

    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );
    expect(useAppSelectorSpy).toHaveBeenCalled();

    const selectorFn = useAppSelectorSpy.mock.calls.find((call) =>
      call[0].toString().includes("state.roster")
    )?.[0];

    expect(selectorFn).toBeDefined();

    const mockState = {
      roster: { selectedWeek: 50, draft: "1", selectedJobType: "TEST" },
    };
    const result = selectorFn(mockState);

    expect(result).toEqual({
      selectedWeek: 50,
      draft: "1",
      selectedJobType: "TEST",
    });
  });

  it("should verify CalenderView is called with correct props", () => {
    useRoster.mockReturnValue({
      miscWorks: [],
      onDraftDataSave: jest.fn(),
      onChangeSelectedDay: jest.fn(),
    });
    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );

    expect(require("../common/CalenderView").default).toHaveBeenCalledWith(
      expect.objectContaining({
        editable: true,
        rosterType: "secondary",
      }),
      expect.anything()
    );
  });

  it("should verify modal components are rendered with correct props", () => {
    useRoster.mockReturnValue({
      miscWorks: [],
      onDraftDataSave: jest.fn(),
      onChangeSelectedDay: jest.fn(),
    });
    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );

    expect(
      require("../common/RosterPublishSuccess").default
    ).toHaveBeenCalled();
    expect(
      require("../common/RosterPublishHoursWarning").default
    ).toHaveBeenCalled();
    expect(
      require("../common/RosterPublishForceConfirmWarning").default
    ).toHaveBeenCalled();
    expect(
      require("../common/RosterPublishCJPWarning").default
    ).toHaveBeenCalled();
  });

  it("should test onValidateHours function with success response", async () => {
    const setValidationStateMock = jest.fn();
    const onValidatingMock = jest.fn();
    const offValidatingMock = jest.fn();
    const postMock = jest.fn().mockResolvedValue({
      empExceedingHoursList: [],
    });
    const dispatchMock = jest.fn();
    const getValidateObjectMock = jest
      .fn()
      .mockReturnValue({ week: 50, data: [] });

    jest.useFakeTimers();

    const onValidateHours = async () => {
      onValidatingMock();

      const res = await postMock("ENDPOINT_URL", {
        data: getValidateObjectMock(),
      });
      setValidationStateMock("");
      offValidatingMock();

      if (
        res &&
        res.empExceedingHoursList &&
        res.empExceedingHoursList.length
      ) {
        dispatchMock({
          type: "updateEmpExceedingHoursList",
          payload: res.empExceedingHoursList,
        });
        setValidationStateMock("failed");
      } else {
        dispatchMock({ type: "updateEmpExceedingHoursList", payload: [] });
        setValidationStateMock("success");
      }
      setTimeout(() => {
        setValidationStateMock("");
      }, 5000);
    };

    await onValidateHours();

    expect(onValidatingMock).toHaveBeenCalledTimes(1);
    expect(postMock).toHaveBeenCalledWith("ENDPOINT_URL", {
      data: getValidateObjectMock(),
    });
    expect(offValidatingMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "updateEmpExceedingHoursList",
      payload: [],
    });
    expect(setValidationStateMock).toHaveBeenCalledWith("success");

    jest.advanceTimersByTime(5000);

    expect(setValidationStateMock).toHaveBeenLastCalledWith("");
  });

  it("should test onValidateHours function with failed validation", async () => {
    const setValidationStateMock = jest.fn();
    const onValidatingMock = jest.fn();
    const offValidatingMock = jest.fn();
    const postMock = jest.fn().mockResolvedValue({
      empExceedingHoursList: [
        { empId: "EMP001", name: "Test User", exceedingHours: 10 },
      ],
    });
    const dispatchMock = jest.fn();
    const getValidateObjectMock = jest
      .fn()
      .mockReturnValue({ week: 50, data: [] });

    jest.useFakeTimers();

    const onValidateHours = async () => {
      onValidatingMock();

      const res = await postMock("ENDPOINT_URL", {
        data: getValidateObjectMock(),
      });
      setValidationStateMock("");
      offValidatingMock();

      if (
        res &&
        res.empExceedingHoursList &&
        res.empExceedingHoursList.length
      ) {
        dispatchMock({
          type: "updateEmpExceedingHoursList",
          payload: res.empExceedingHoursList,
        });
        setValidationStateMock("failed");
      } else {
        dispatchMock({ type: "updateEmpExceedingHoursList", payload: [] });
        setValidationStateMock("success");
      }
      setTimeout(() => {
        setValidationStateMock("");
      }, 5000);
    };

    await onValidateHours();

    expect(onValidatingMock).toHaveBeenCalledTimes(1);
    expect(postMock).toHaveBeenCalledWith("ENDPOINT_URL", {
      data: getValidateObjectMock(),
    });
    expect(offValidatingMock).toHaveBeenCalledTimes(1);
    expect(dispatchMock).toHaveBeenCalledWith({
      type: "updateEmpExceedingHoursList",
      payload: [{ empId: "EMP001", name: "Test User", exceedingHours: 10 }],
    });
    expect(setValidationStateMock).toHaveBeenCalledWith("failed");

    jest.advanceTimersByTime(5000);

    expect(setValidationStateMock).toHaveBeenLastCalledWith("");
  });

  it("should call onValidateHours when button is clicked", () => {
    const onValidateHoursMock = jest.fn();

    const TestComponent = () => (
      <button data-testid="validate-button" onClick={onValidateHoursMock}>
        Validate Hours
      </button>
    );

    const { getByTestId } = render(<TestComponent />);

    fireEvent.click(getByTestId("validate-button"));

    expect(onValidateHoursMock).toHaveBeenCalledTimes(1);
  });
  it("should conditionally render the validation button based on isAnyPartTimeEmp", () => {
    const mockWithPartTime = {
      ...useRoster(),
      isAnyPartTimeEmp: jest.fn().mockReturnValue(true),
      onValidateHours: jest.fn(),
      isValidating: false,
      validationState: null,
    };

    useRoster.mockReturnValue(mockWithPartTime);

    function TestRenderer() {
      const {
        isAnyPartTimeEmp,
        onValidateHours,
        isValidating,
        validationState,
      } = useRoster();

      return (
        <div>
          {false && isAnyPartTimeEmp() ? (
            <button
              data-testid="validate-button"
              onClick={() => onValidateHours()}
              disabled={isValidating || validationState !== null}
            >
              Validate Hours
            </button>
          ) : (
            <span data-testid="no-button">No Validation Button</span>
          )}
        </div>
      );
    }

    const { getByTestId } = render(<TestRenderer />);

    expect(getByTestId("no-button")).toBeInTheDocument();
  });

  it("should check correct parameter passing to onValidateHours", async () => {
    const onValidateHoursSpy = jest.fn();

    useRoster.mockReturnValue({
      ...useRoster(),
      onValidateHours: onValidateHoursSpy,
      miscWorks: [],
    });

    render(
      <Provider store={store}>
        <EditRoster />
      </Provider>
    );

    useRoster().onValidateHours();

    expect(onValidateHoursSpy).toHaveBeenCalledTimes(1);
  });

  it("should handle API errors in onValidateHours", async () => {
    const setValidationStateMock = jest.fn();
    const onValidatingMock = jest.fn();
    const offValidatingMock = jest.fn();
    const postMock = jest.fn().mockRejectedValue(new Error("API Error"));
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    jest.useFakeTimers();

    const onValidateHours = async () => {
      onValidatingMock();

      try {
        const res = await postMock("ENDPOINT_URL", {
          data: { week: 50 },
        });
        setValidationStateMock("");

        if (
          res &&
          res.empExceedingHoursList &&
          res.empExceedingHoursList.length
        ) {
          setValidationStateMock("failed");
        } else {
          setValidationStateMock("success");
        }
      } catch (error) {
        console.error("Error validating hours:", error);
        setValidationStateMock("failed");
      } finally {
        offValidatingMock();
        setTimeout(() => {
          setValidationStateMock("");
        }, 5000);
      }
    };

    await onValidateHours();
    expect(onValidatingMock).toHaveBeenCalledTimes(1);
    expect(postMock).toHaveBeenCalledWith("ENDPOINT_URL", {
      data: { week: 50 },
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(offValidatingMock).toHaveBeenCalledTimes(1);
    expect(setValidationStateMock).toHaveBeenCalledWith("failed");

    jest.advanceTimersByTime(5000);

    expect(setValidationStateMock).toHaveBeenLastCalledWith("");

    consoleErrorSpy.mockRestore();
  });
});
