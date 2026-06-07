import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../app/store/store";
import ClusterJobPlanningEdit from "./ClusterJobPlanningEdit";
import { useRoster } from "../../hooks/useRoster";
import { useNavigate } from "react-router-dom";
import { SECONDARY_JOBS_CONFIG } from "../../helper/Constant";
import * as storeModule from "../../app/store/store";
import { isFutureWeek } from "../../helper/Utils";

// Mock the modules
jest.mock("../../hooks/useRoster", () => ({
  useRoster: jest.fn(),
}));

jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    ...originalModule,
    useNavigate: jest.fn(),
  };
});

jest.mock("../../helper/Utils", () => ({
  isFutureWeek: jest.fn(),
}));

jest.mock("../../helper/Constant", () => ({
  NAV_HEIGHT: 60,
  SECONDARY_JOBS_CONFIG: [
    { jobType: "TYPE_A", label: "Type A Job" },
    { jobType: "TYPE_B", label: "Type B Job" },
  ],
}));

// Mock the store selector
const mockUseAppSelector = jest.fn();

describe("ClusterJobPlanningEdit Component", () => {
  let mockNavigate;
  let mockOnCjpDraftDataSave;
  let mockOnCjpPublish;

  beforeEach(() => {
    mockUseAppSelector.mockImplementation((selector) => ({
      selectedWeek: 10,
      selectedPlannedJobId: 1,
      cjpDraft: [],
      selectedYear: 2024,
    }));
    jest
      .spyOn(storeModule, "useAppSelector")
      .mockImplementation(mockUseAppSelector);
    isFutureWeek.mockReturnValue(true);

    mockNavigate = jest.fn();
    mockOnCjpDraftDataSave = jest.fn();
    mockOnCjpPublish = jest.fn();

    useNavigate.mockReturnValue(mockNavigate);

    useRoster.mockReturnValue({
      getPlannedJobs: jest.fn(),
      plannedJobs: [
        {
          id: 1,
          miscWorkJobName: "Test Job",
          secondaryJobType: "TEST",
        },
      ],
      plannedJobTimes: [],
      cjpRoster: { status: "DRAFT", days: [] },
      getAllClusters: jest.fn(),
      clusters: [],
      onSaveShift: jest.fn(),
      onCjpDraftDataSave: mockOnCjpDraftDataSave,
      isRosterSaving: false,
      onCjpPublish: mockOnCjpPublish,
      payrollConfig: { currentPStartDateTime: "2024-11-22T00:00:00" },
      getPayrollConfig: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <ClusterJobPlanningEdit />
      </Provider>
    );

  test("renders component and displays job name and week", () => {
    renderComponent();
    expect(screen.getByText(/Test Job \| Week 10/i)).toBeInTheDocument();
  });

  test("navigates back on back button click", () => {
    renderComponent();
    fireEvent.click(screen.getByLabelText("FiArrowLeft"));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("saves draft every 10 seconds", async () => {
    jest.useFakeTimers();
    renderComponent();
    jest.advanceTimersByTime(10000);
    await waitFor(() =>
      expect(mockOnCjpDraftDataSave).toHaveBeenCalledWith({})
    );
    await waitFor(() =>
      expect(mockOnCjpDraftDataSave).toHaveBeenCalledWith({})
    );
    jest.useRealTimers();
  });

  test("handles case where cjpRoster is null", () => {
    useRoster.mockReturnValue({
      getPlannedJobs: jest.fn(),
      plannedJobs: [{ id: 1, miscWorkJobName: "Test Job" }],
      plannedJobTimes: [],
      cjpRoster: null,
      getAllClusters: jest.fn(),
      clusters: [],
      onSaveShift: jest.fn(),
      onCjpDraftDataSave: mockOnCjpDraftDataSave,
      isRosterSaving: false,
      onCjpPublish: mockOnCjpPublish,
      payrollConfig: { currentPStartDateTime: "2024-11-22T00:00:00" },
      getPayrollConfig: jest.fn(),
    });

    expect(() => renderComponent()).not.toThrow();
  });

  test("displays DRAFT SAVED text when isRosterSaving is true", () => {
    useRoster.mockReturnValue({
      getPlannedJobs: jest.fn(),
      plannedJobs: [{ id: 1, miscWorkJobName: "Test Job" }],
      plannedJobTimes: [],
      cjpRoster: { status: "DRAFT", days: [] },
      getAllClusters: jest.fn(),
      clusters: [],
      onSaveShift: jest.fn(),
      onCjpDraftDataSave: mockOnCjpDraftDataSave,
      isRosterSaving: true,
      onCjpPublish: mockOnCjpPublish,
      payrollConfig: { currentPStartDateTime: "2024-11-22T00:00:00" },
      getPayrollConfig: jest.fn(),
    });

    renderComponent();
    expect(screen.getByText("DRAFT SAVED")).toBeInTheDocument();
  });

  test("displays job name from SECONDARY_JOBS_CONFIG when job has secondaryJobType but no miscWorkJobName", () => {
    useRoster.mockReturnValue({
      getPlannedJobs: jest.fn(),
      plannedJobs: [
        {
          id: 1,
          miscWorkJobName: null,
          secondaryJobType: "TYPE_A",
        },
      ],
      plannedJobTimes: [],
      cjpRoster: { status: "DRAFT", days: [] },
      getAllClusters: jest.fn(),
      clusters: [],
      onSaveShift: jest.fn(),
      onCjpDraftDataSave: mockOnCjpDraftDataSave,
      isRosterSaving: false,
      onCjpPublish: mockOnCjpPublish,
      payrollConfig: { currentPStartDateTime: "2024-11-22T00:00:00" },
      getPayrollConfig: jest.fn(),
    });

    renderComponent();
    expect(screen.getByText(/Type A Job \| Week 10/i)).toBeInTheDocument();
  });


  test("displays raw secondaryJobType when not found in SECONDARY_JOBS_CONFIG", () => {
    useRoster.mockReturnValue({
      getPlannedJobs: jest.fn(),
      plannedJobs: [
        {
          id: 1,
          miscWorkJobName: null,
          secondaryJobType: "UNKNOWN_TYPE",
        },
      ],
      plannedJobTimes: [],
      cjpRoster: { status: "DRAFT", days: [] },
      getAllClusters: jest.fn(),
      clusters: [],
      onSaveShift: jest.fn(),
      onCjpDraftDataSave: mockOnCjpDraftDataSave,
      isRosterSaving: false,
      onCjpPublish: mockOnCjpPublish,
      payrollConfig: { currentPStartDateTime: "2024-11-22T00:00:00" },
      getPayrollConfig: jest.fn(),
    });

    renderComponent();
    expect(screen.getByText(/UNKNOWN_TYPE \| Week 10/i)).toBeInTheDocument();
  });


  test("handles case where plannedJobs is empty", () => {
    useRoster.mockReturnValue({
      getPlannedJobs: jest.fn(),
      plannedJobs: [], 
      plannedJobTimes: [],
      cjpRoster: { status: "DRAFT", days: [] },
      getAllClusters: jest.fn(),
      clusters: [],
      onSaveShift: jest.fn(),
      onCjpDraftDataSave: mockOnCjpDraftDataSave,
      isRosterSaving: false,
      onCjpPublish: mockOnCjpPublish,
      payrollConfig: { currentPStartDateTime: "2024-11-22T00:00:00" },
      getPayrollConfig: jest.fn(),
    });

    renderComponent();
    expect(screen.getByText(/\| Week 10/i)).toBeInTheDocument();
  });


  test("handles case where plannedJobs is null", () => {
    useRoster.mockReturnValue({
      getPlannedJobs: jest.fn(),
      plannedJobs: null,
      plannedJobTimes: [],
      cjpRoster: { status: "DRAFT", days: [] },
      getAllClusters: jest.fn(),
      clusters: [],
      onSaveShift: jest.fn(),
      onCjpDraftDataSave: mockOnCjpDraftDataSave,
      isRosterSaving: false,
      onCjpPublish: mockOnCjpPublish,
      payrollConfig: { currentPStartDateTime: "2024-11-22T00:00:00" },
      getPayrollConfig: jest.fn(),
    });

    renderComponent();
    expect(screen.getByText(/\| Week 10/i)).toBeInTheDocument();
  });


  test("handles case where job is not found by ID", () => {
    mockUseAppSelector.mockImplementation((selector) => ({
      selectedWeek: 10,
      selectedPlannedJobId: 999, 
      cjpDraft: [],
      selectedYear: 2024,
    }));

    useRoster.mockReturnValue({
      getPlannedJobs: jest.fn(),
      plannedJobs: [
        { id: 1, miscWorkJobName: "Test Job" },
        { id: 2, miscWorkJobName: "Another Job" },
      ],
      plannedJobTimes: [],
      cjpRoster: { status: "DRAFT", days: [] },
      getAllClusters: jest.fn(),
      clusters: [],
      onSaveShift: jest.fn(),
      onCjpDraftDataSave: mockOnCjpDraftDataSave,
      isRosterSaving: false,
      onCjpPublish: mockOnCjpPublish,
      payrollConfig: { currentPStartDateTime: "2024-11-22T00:00:00" },
      getPayrollConfig: jest.fn(),
    });

    renderComponent();
    expect(screen.getByText(/\| Week 10/i)).toBeInTheDocument();
  });

  test("clicking on Publish menu items calls onCjpPublish with correct parameters", async () => {
    renderComponent();

    const publishButton = screen.getByText("Publish");
    fireEvent.click(publishButton);
    await waitFor(() => {
      expect(screen.getByText("Just Publish")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Just Publish"));
    expect(mockOnCjpPublish).toHaveBeenCalledWith({
      final: false,
      notifyTo: "NONE",
    });
    mockOnCjpPublish.mockClear();
    fireEvent.click(publishButton);
    await waitFor(() => {
      expect(screen.getByText("Publish & Notify All")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Publish & Notify All"));
    expect(mockOnCjpPublish).toHaveBeenCalledWith({
      final: false,
      notifyTo: "ALL",
    });
    mockOnCjpPublish.mockClear();
    fireEvent.click(publishButton);
    await waitFor(() => {
      expect(
        screen.getByText("Publish & Notify Concerned")
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Publish & Notify Concerned"));
    expect(mockOnCjpPublish).toHaveBeenCalledWith({
      final: false,
      notifyTo: "CONCERNED",
    });
  });

  test("does not display publish button when not a future week", () => {
    isFutureWeek.mockReturnValue(false);

    renderComponent();
    expect(screen.queryByText("Publish")).not.toBeInTheDocument();
  });
});
//    95.65 |      100 |   91.66 |     100

