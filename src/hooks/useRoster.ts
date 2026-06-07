import { useBoolean, useDisclosure } from "@chakra-ui/react";
import { cloneDeep } from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import {
  updateCJPRoster,
  updateCJPRosterWeekId,
  updateCjpDraft,
  updateCloneWeekModal,
  updateDraft,
  updateEmpExceedingHoursList,
  updateRoster,
  updateRosterWeekId,
  updateSelectedClusterId,
  updateSelectedDate,
  updateSelectedJobType,
  updateSelectedMonth,
  updateSelectedPlannedJobId,
  updateSelectedPlannedJobType,
  updateSelectedPlannedMiscWorkId,
  updateSelectedPlannedSecondaryJobType,
  updateSelectedWeek,
  updateSelectedYear,
} from "../app/slice/roster.slice";
import { store, useAppDispatch, useAppSelector } from "../app/store/store";
import { ENDPOINT } from "../config/endpoint.config";
import {
  DEFAULT_CLOSE_TIME,
  DEFAULT_OPEN_TIME,
  LAYOUT,
} from "../helper/Constant";
import {
  IApiResponse,
  ICJPRoster,
  IClusterResponse,
  IEmpDailyExceedingHours,
  IEmpExceedingHours,
  IEmpHours,
  IEmpWeeklyExceedingHours,
  IHoursValidate,
  IMiscWork,
  IMonthSummary,
  IPayrollConfig,
  IPlannedJobWeekResponse,
  IRecommendedHours,
  IRoster,
  IRosterDay,
  IRosterHookProps,
  IShift,
  IStorePlannedJob,
  IStoreSecondaryJob,
  IUserClusterInfoResponse,
  IWeekResponse,
  IWeekUncoveredShift,
} from "../helper/Interface";
import { generateTimeSlots, getIsPartTime } from "../helper/Utils";
import { useApi } from "./useApi";
import { useService } from "./useService";

const useRoster = (props: IRosterHookProps) => {
  const { viewMode, mode, rosterType } = props;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { get, post } = useApi();
  const { addToast } = useToasts();
  const {
    isOpen: isPublishedRosterModalOpen,
    onOpen: onPublishedRosterModalOpen,
    onClose: onPublishedRosterModalClose,
  } = useDisclosure();
  const [messageObj, setMessageObj] = useState<IApiResponse["messages"]>([]);

  const [isRosterSaving, { on: onRosterSaving, off: rosterSaved }] =
    useBoolean();
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [isValidating, { on: onValidating, off: offValidating }] =
    useBoolean(false);
  const [isPublishing, { on: onPublishing, off: offPublishing }] =
    useBoolean(false);
  const [validationState, setValidationState] = useState<
    "" | "success" | "failed"
  >("");
  const [years, setYears] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<IWeekResponse[]>([]);
  const [plannedJobWeeks, setPlannedJobWeeks] = useState<
    IPlannedJobWeekResponse[]
  >([]);
  const [monthSummary, setMonthSummary] = useState<IMonthSummary[]>([]);
  const [clusters, setClusters] = useState<IClusterResponse[]>([]);
  const [userClustersInfo, setUserClustersInfo] =
    useState<IUserClusterInfoResponse>();
  const [shifts, setShifts] = useState<IShift[]>([]);
  const [miscWorks, setMiscWorks] = useState<IMiscWork[]>([]);
  const { getPayrollConfig, payrollConfig } = useService();
  const [cloneWeekId, setCloneWeekId] = useState(0);
  const [recommendedHours, setRecommendedHours] =
    useState<IRecommendedHours[]>();
  const {
    isOpen: isDuplicateModalOpen,
    onOpen: onDuplicateModalOpen,
    onClose: onDuplicateModalClose,
  } = useDisclosure();
  const {
    isOpen: isEmpExceedingHoursListModalOpen,
    onOpen: onEmpExceedingHoursListModalOpen,
    onClose: onEmpExceedingHoursListModalClose,
  } = useDisclosure();
  const {
    isOpen: isWeekUncoveredShiftsModalOpen,
    onOpen: onWeekUncoveredShiftsModalOpen,
    onClose: onWeekUncoveredShiftsModalClose,
  } = useDisclosure();
  const {
    isOpen: isForceConfirmModalOpen,
    onOpen: onForceConfirmModalOpen,
    onClose: onForceConfirmModalClose,
  } = useDisclosure();
  const [empExceedingHoursList, setEmpExceedingHoursList] = useState<
    IEmpExceedingHours[]
  >([]);
  const [empWeeklyExceedingHoursList, setEmpWeeklyExceedingHoursList] =
    useState<IEmpWeeklyExceedingHours[]>([]);
  const [empDailyExceedingHoursList, setEmpDailyExceedingHoursList] = useState<
    IEmpDailyExceedingHours[]
  >([]);
  const [weekUncoveredShifts, setWeekUncoveredShifts] = useState<
    IWeekUncoveredShift[]
  >([]);
  const [globalNotifyTo, setGlobalNotifyTo] = useState("");
  const [isRecommendedHoursLoading, setIsRecommendedHoursLoading] =
    useState(false);

  const {
    selectedWeek,
    selectedYear,
    selectedMonth,
    draft,
    selectedDate,
    selectedJobType,
    roster,
    selectedClusterId,
    selectedPlannedJobType,
    selectedPlannedJobId,
    selectedPlannedMiscWorkId,
    selectedPlannedSecondaryJobType,
    cjpRoster,
    cjpRosterWeekId,
    cjpDraft,
  } = useAppSelector((state) => state.roster);
  const { selectedCostCenterName, user, contractTypes } = useAppSelector(
    (state) => state.auth,
  );
  const [storeSecondaryJobs, setStoreSecondaryJobs] = useState<
    IStoreSecondaryJob[]
  >([]);
  const [finalDuplicateDayIds, setFinalDuplicateDayIds] = useState<string[]>(
    [],
  );
  const [plannedJobs, setPlannedJobs] = useState<IStorePlannedJob[]>([]);
  // const [plannedJobDays, setPlannedJobDays] = useState<string[]>([]);
  const [plannedJobTimes, setPlannedJobTimes] = useState<
    { label: string; value: string }[]
  >([]);
  const onCloneWeekModalOpen = () => {
    dispatch(updateCloneWeekModal(true));
  };
  const onCloneWeekModalClose = () => {
    dispatch(updateCloneWeekModal(false));
  };
  useEffect(() => {
    getYears();
  }, []);
  const getYears = () => {
    const date = new Date();
    setYears([
      (date.getFullYear() - 1).toString(),
      date.getFullYear().toString(),
      (date.getFullYear() + 1).toString(),
    ]);
    if (selectedYear === undefined) {
      dispatch(updateSelectedYear(date.getFullYear()));
    }
    if (selectedMonth === undefined) {
      dispatch(updateSelectedMonth(date.getMonth()));
    }
  };
  const getAllClusters = async () => {
    const res = await get<IClusterResponse[]>(
      ENDPOINT["/cluster"][""] + `?costCentre=${selectedCostCenterName}`,
    );
    if (res?.length) {
      setClusters(res);
    } else {
      setClusters([]);
    }
  };
  const getPlannedJobs = async () => {
    const res = await get<IStorePlannedJob[]>(
      ENDPOINT["/cluster-planned-jobs"]["/store"],
    );
    if (res?.length) {
      setPlannedJobs(res);
    } else {
      setPlannedJobs([]);
    }
  };
  const getEmployeeCluster = async () => {
    const res = await get<IUserClusterInfoResponse>(
      ENDPOINT["/cluster"]["/info"] + `/${user?.empId}`,
    );
    setUserClustersInfo(res);
  };

  const getShifts = async () => {
    const res = await get<IShift[]>(
      ENDPOINT["/shift"][""] +
        `/${selectedCostCenterName}?jobType=${
          rosterType === "primary" ? LAYOUT : selectedJobType
        }${rosterType === "primary" ? `&clusterId=${selectedClusterId}` : ""}`,
    );
    if (res?.length) {
      setShifts(res);
    } else {
      setShifts([]);
    }
  };
  useEffect(() => {
    if (selectedYear && mode === "view") {
      getAllWeeks();
    }
  }, [selectedYear]);
  const getAllWeeks = async () => {
    onLoading();
    const res = await get<IWeekResponse[]>(
      ENDPOINT["/master"]["/week"] + `/${selectedYear}`,
    );
    offLoading();
    if (res?.length) {
      setWeeks(res);
    } else {
      setWeeks([]);
    }
  };

  useEffect(() => {
    if (storeSecondaryJobs?.length && !selectedJobType) {
      onChangeSelectedJobType(storeSecondaryJobs[0].jobType);
    }

    if (!selectedWeek) {
      const week = moment().week();
      dispatch(updateSelectedWeek(week));
    }
  }, [selectedJobType, storeSecondaryJobs]);
  useEffect(() => {
    if (
      clusters?.length &&
      userClustersInfo?.leaderOfClusters?.length &&
      !selectedClusterId
    ) {
      let selectedClusterId = 0;
      userClustersInfo.leaderOfClusters.forEach((clusterId) => {
        if (
          !selectedClusterId &&
          clusters.findIndex(
            ({ id, editable }) => editable && id === clusterId,
          ) >= 0
        ) {
          selectedClusterId = clusterId;
        }
      });
      if (selectedClusterId) {
        onChangeSelectedClusterId(selectedClusterId);
      }
    }
  }, [clusters, userClustersInfo]);

  const onChangeSelectedJobType = (jobType: string) => {
    dispatch(updateSelectedJobType(jobType));
  };
  const onChangeSelectedClusterId = (clusterId: number) => {
    dispatch(updateSelectedClusterId(clusterId));
  };
  const onChangeSelectedPlannedJobId = (plannedJobId: number) => {
    dispatch(updateSelectedPlannedJobId(plannedJobId));
  };
  const onChangeSelectedPlannedJobType = (plannedJobType: string) => {
    dispatch(updateSelectedPlannedJobType(plannedJobType));
  };
  const onChangeSelectedPlannedSecondaryJobType = (
    plannedSecondaryJobType: string,
  ) => {
    dispatch(updateSelectedPlannedSecondaryJobType(plannedSecondaryJobType));
  };
  const onChangeSelectedPlannedMiscWorkId = (plannedMiscWorkId: number) => {
    dispatch(updateSelectedPlannedMiscWorkId(plannedMiscWorkId));
  };
  const getStoreSecondaryJobs = async () => {
    onLoading();
    const res = await get<IStoreSecondaryJob[]>(
      ENDPOINT["/secondary"]["/store-config"] + `/${selectedCostCenterName}`,
    );
    offLoading();
    if (res?.length) {
      setStoreSecondaryJobs(res);
    } else {
      setStoreSecondaryJobs([]);
    }
  };
  const getMiscWorks = async () => {
    onLoading();
    const res = await get<IMiscWork[]>(
      ENDPOINT["/roster"]["/primary"]["/miscWork"],
    );
    offLoading();
    if (res?.length) {
      setMiscWorks(res);
    } else {
      setMiscWorks([]);
    }
  };

  useEffect(() => {
    if (selectedWeek && selectedYear) {
      if (
        rosterType === "primary" &&
        selectedClusterId &&
        (mode === "view" || mode === "edit")
      ) {
        getPrimaryRoster();
        getMiscWorks();
      }
      if (
        rosterType === "secondary" &&
        selectedJobType &&
        (mode === "view" || mode === "edit")
      ) {
        getSecondaryRoster();
        getMiscWorks();
      }
      if (rosterType === "primary" || rosterType === "secondary") {
        getRecommendedHours();
      }
      if (
        mode === "edit" &&
        (rosterType === "primary" || rosterType === "secondary")
      ) {
        getShifts();
      }
      if (rosterType === "cjp") {
        // createWeekDays();
        createDayTimes();
        if (
          selectedPlannedJobType &&
          (selectedPlannedSecondaryJobType || selectedPlannedMiscWorkId)
        ) {
          getCJPRoster();
        }
      }
    }
  }, [
    selectedWeek,
    selectedYear,
    selectedJobType,
    selectedClusterId,
    selectedPlannedJobType,
    selectedPlannedSecondaryJobType,
    selectedPlannedMiscWorkId,
    viewMode,
  ]);

  useEffect(() => {
    if (selectedYear && mode === "summary") {
      if (rosterType === "primary" && selectedClusterId) {
        getMonthSummary();
      }
      if (rosterType === "secondary" && selectedJobType) {
        getMonthSummary();
      }
    }
  }, [selectedYear, selectedJobType, selectedClusterId]);

  const getMonthSummary = async () => {
    const res = await get<IMonthSummary[]>(
      ENDPOINT["/roster"][rosterType === "primary" ? "/primary" : "/secondary"][
        "/monthSummary"
      ] + `/${rosterType === "primary" ? LAYOUT : selectedJobType}`,
      {
        params: {
          year: selectedYear,
          costCentre: selectedCostCenterName,
          clusterId:
            rosterType === "primary" && selectedClusterId
              ? selectedClusterId
              : undefined,
        },
      },
    );
    if (res?.length) {
      setMonthSummary(res);
    } else {
      setMonthSummary([]);
    }
  };
  const getSecondaryRoster = async () => {
    onLoading();
    const res = await get<IRoster>(
      ENDPOINT["/roster"]["/secondary"][""] + `/${selectedJobType}`,
      {
        params: {
          week: selectedWeek,
          year: selectedYear,
          costCentre: selectedCostCenterName,
          viewMode,
        },
      },
    );
    offLoading();
    if (res?.rosterWeekId) {
      dispatch(updateRoster(res));
      dispatch(updateRosterWeekId(res.rosterWeekId));
    } else {
      dispatch(updateRoster(undefined));
      dispatch(updateRosterWeekId(0));
    }
  };
  const getPrimaryRoster = async () => {
    onLoading();
    const res = await get<IRoster>(
      ENDPOINT["/roster"]["/primary"][""] + `/${LAYOUT}`,
      {
        params: {
          week: selectedWeek,
          year: selectedYear,
          costCentre: selectedCostCenterName,
          viewMode,
          clusterId: selectedClusterId,
        },
      },
    );
    offLoading();
    if (res?.rosterWeekId) {
      dispatch(updateRoster(res));
      dispatch(updateRosterWeekId(res.rosterWeekId));
    } else {
      dispatch(updateRoster(undefined));
      dispatch(updateRosterWeekId(0));
    }
  };
  const getRecommendedHours = async () => {
    onLoading();
    const date = moment().set({
      week: selectedWeek,
      year: selectedYear,
    });
    const dateRange = {
      from: date.startOf("week").format("YYYY-MM-DD"),
      to: date.endOf("week").format("YYYY-MM-DD"),
    };
    const res = await post<IRecommendedHours[]>(
      ENDPOINT["/recommended-hours"][""],
      {
        data: {
          dateRange,
          costCentre: selectedCostCenterName,
          clusterId: rosterType === "primary" ? selectedClusterId : undefined,
          jobType: rosterType === "secondary" ? selectedJobType : undefined,
        },
      },
    );
    setIsRecommendedHoursLoading(false);
    offLoading();
    if (res?.length) {
      setRecommendedHours(res);
    } else {
      setRecommendedHours([]);
    }
  };
  const onChangeWeek = (week: number) => {
    dispatch(updateSelectedWeek(week));
  };
  const onChangeYear = (year: number) => {
    dispatch(updateSelectedYear(year));
  };
  const onChangeMonth = (month: number) => {
    dispatch(updateSelectedMonth(month));
  };
  const onNextWeekClick = () => {
    if (selectedWeek) {
      dispatch(updateSelectedWeek(selectedWeek + 1));
    }
  };
  const onPrevWeekClick = () => {
    if (selectedWeek) {
      dispatch(updateSelectedWeek(selectedWeek - 1));
    }
  };
  const onCreateRosterClick = async () => {
    setCloneWeekId(0);
    onCloneWeekModalOpen();
  };
  const onStartFreshRoster = () => {
    onCreateRoster("FRESH", 0);
  };
  const onCloneWeek = () => {
    onCreateRoster("AUTOFILL", cloneWeekId);
  };
  const onCreateRoster = async (mode: string, autoFillWeek: number) => {
    onCloneWeekModalClose();
    if (selectedWeek) {
      const endpoint =
        ENDPOINT["/roster"][
          rosterType === "primary" ? "/primary" : "/secondary"
        ]["/init"];
      const res = await post<IRoster>(endpoint, {
        data: {
          week: selectedWeek,
          year: selectedYear,
          costCentre: selectedCostCenterName,
          mode,
          type: rosterType === "primary" ? LAYOUT : selectedJobType,
          autoFillWeek,
          clusterId:
            rosterType === "primary" && selectedClusterId
              ? selectedClusterId
              : undefined,
        },
      });
      if (res?.rosterWeekId) {
        dispatch(updateRoster(res));
        goToRosterEdit(selectedWeek);
      } else {
        let message = "";
        if (res.message) {
          message = res.message;
        } else {
          message = "Something went wrong!";
        }
        addToast(message, { appearance: "error", autoDismiss: true });
      }
    }
  };
  const goToRosterEdit = (week: number) => {
    const path = `/${
      rosterType === "primary" ? "layout" : "secondary"
    }/roster/${week}`;
    navigate(path);
  };
  const goToPlannedJobEdit = (week: number) => {
    const path = `/my-store/cluster-job-planning/${week}`;
    navigate(path);
  };
  const onBack = () => {
    navigate(-1);
  };
  const onShareRoster = () => {
    //
  };
  const onShiftChange = (
    props: {
      empId: string;
      id: number;
      status: string;
      shifts: {
        startTime: string;
        endTime: string;
        workId?: number;
        plannedJob?: boolean;
        secondaryJobType?: string;
        comment?: string;
      }[];
      replaceShifts?: boolean;
    }[],
  ) => {
    let draftTemp: IRosterDay[] = cloneDeep(draft ?? []);
    const roster = store.getState().roster.roster;

    if (selectedWeek) {
      props.forEach((obj) => {
        const { empId, shifts, status, id, replaceShifts } = obj;
        const employee = roster?.empWeekRosters.find(
          (obj) => obj.empId === empId,
        );
        if (employee) {
          const day = employee.days.find((obj) => obj.id === id);
          if (day) {
            const dayTemp = cloneDeep(day);
            if (status === "BLANK" && !replaceShifts) {
              if (shifts?.length && shifts[0].workId) {
                if (dayTemp?.misc?.length) {
                  dayTemp.misc.push({
                    s: shifts[0].startTime
                      ? moment(shifts[0].startTime, "HH:mm:ss").format(
                          "HH:mm:ss",
                        )
                      : "",
                    e: shifts[0].endTime
                      ? moment(shifts[0].endTime, "HH:mm:ss").format("HH:mm:ss")
                      : "",
                    c: shifts[0].comment ?? "",
                    workId: shifts[0].workId,
                    plannedJob: shifts[0].plannedJob,
                    secondaryJobType: shifts[0].secondaryJobType,
                  });
                } else {
                  dayTemp.misc = [
                    {
                      s: shifts[0].startTime
                        ? moment(shifts[0].startTime, "HH:mm:ss").format(
                            "HH:mm:ss",
                          )
                        : "",
                      e: shifts[0].endTime
                        ? moment(shifts[0].endTime, "HH:mm:ss").format(
                            "HH:mm:ss",
                          )
                        : "",
                      c: shifts[0].comment ?? "",
                      workId: shifts[0].workId,
                      plannedJob: shifts[0].plannedJob,
                      secondaryJobType: shifts[0].secondaryJobType,
                    },
                  ];
                }
              }
              if (dayTemp?.main?.length && shifts?.length) {
                dayTemp.main = dayTemp.main.filter(({ s, e }) => {
                  if (s === shifts[0].startTime && e === shifts[0].endTime) {
                    return false;
                  }
                  return true;
                });
              }
            } else {
              if (
                !dayTemp.main ||
                dayTemp.main.length === 0 ||
                (rosterType === "secondary" && !shifts[0].workId) ||
                replaceShifts
              ) {
                dayTemp.main = [];
              }
              shifts.forEach(
                ({
                  endTime,
                  startTime,
                  workId,
                  comment,
                  plannedJob,
                  secondaryJobType,
                }) => {
                  if (workId || secondaryJobType) {
                    if (dayTemp?.misc?.length) {
                      dayTemp.misc.push({
                        s: startTime
                          ? moment(startTime, "HH:mm:ss").format("HH:mm:ss")
                          : "",
                        e: endTime
                          ? moment(endTime, "HH:mm:ss").format("HH:mm:ss")
                          : "",
                        c: comment ?? "",
                        workId,
                        plannedJob,
                        secondaryJobType,
                      });
                    } else {
                      dayTemp.misc = [
                        {
                          s: startTime
                            ? moment(startTime, "HH:mm:ss").format("HH:mm:ss")
                            : "",
                          e: endTime
                            ? moment(endTime, "HH:mm:ss").format("HH:mm:ss")
                            : "",
                          c: comment ?? "",
                          workId,
                          plannedJob,
                          secondaryJobType,
                        },
                      ];
                    }
                  } else {
                    dayTemp.main.push({
                      s: startTime
                        ? moment(startTime, "HH:mm:ss").format("HH:mm:ss")
                        : "",
                      e: endTime
                        ? moment(endTime, "HH:mm:ss").format("HH:mm:ss")
                        : "",
                      c: "",
                    });
                  }
                },
              );
            }

            if (status === "BLANK") {
              if (
                (!dayTemp.main || dayTemp.main.length === 0) &&
                (!dayTemp.misc || dayTemp.misc.length === 0)
              ) {
                dayTemp.status = "BLANK";
              } else {
                dayTemp.status = ["HOLIDAY", "WORKING_HOLIDAY"].includes(
                  day.status,
                )
                  ? "WORKING_HOLIDAY"
                  : "WORKING";
              }
            } else {
              dayTemp.status = status;
            }
            const draftIndex = draft.findIndex((obj) => obj.id === id);

            if (draftIndex >= 0) {
              draftTemp[draftIndex] = dayTemp;
            } else {
              draftTemp.push(dayTemp);
            }
          }
        }
      });
    }

    dispatch(updateDraft(draftTemp));
    updateRosterDays({ updatedDays: draftTemp });
  };
  const onRemoveMiscShift = (props: {
    empId: string;
    id: number;
    shift: {
      startTime: string;
      endTime: string;
      workId?: number;
      secondaryJobType?: string;
      comment?: string;
    };
  }) => {
    let draftTemp: IRosterDay[] = cloneDeep(draft || []);
    const roster = store.getState().roster.roster;
    if (selectedWeek && roster) {
      const { empId, shift, id } = props;
      const employee = roster.empWeekRosters.find((obj) => obj.empId === empId);
      if (employee) {
        const day = employee.days.find((obj) => obj.id === id);
        if (day) {
          const dayTemp = cloneDeep(day);
          if (dayTemp?.misc?.length) {
            dayTemp.misc = dayTemp.misc.filter(
              ({ c, e, s, workId, secondaryJobType }) => {
                if (
                  c === shift.comment &&
                  e === shift.endTime &&
                  s === shift.startTime &&
                  (shift.workId
                    ? workId === shift.workId
                    : secondaryJobType === shift.secondaryJobType)
                ) {
                  return false;
                }
                return true;
              },
            );
          }
          if (
            (!dayTemp.misc || dayTemp.misc.length === 0) &&
            (!dayTemp.main || dayTemp.main.length === 0)
          ) {
            dayTemp.status = "BLANK";
          }
          const draftIndex = draft.findIndex((obj) => obj.id === id);
          if (draftIndex >= 0) {
            draftTemp[draftIndex] = dayTemp;
          } else {
            draftTemp.push(dayTemp);
          }
        }
      }
    }
    dispatch(updateDraft(draftTemp));
    updateRosterDays({ updatedDays: draftTemp });
  };

  const onDraftDataSave = async (props?: {
    publish?: boolean;
    notifyTo: string;
    forceConfirm?: boolean;
    week?: number;
  }) => {
    const currentDraft = store.getState().roster.draft;
    const rosterWeekId = store.getState().roster.rosterWeekId;
    if (!currentDraft || !currentDraft.length || !rosterWeekId) {
      return;
    }
    onRosterSaving();
    const endpoint =
      ENDPOINT["/roster"][rosterType === "primary" ? "/primary" : "/secondary"][
        "/save"
      ];
    const res = await post<{
      rosterWeekId: number;
      updatedDays: IRosterDay[];
      impacted: boolean;
      empHours: IEmpHours[];
      rosterStatus: string;
    }>(endpoint, {
      data: {
        rosterWeekId,
        days: currentDraft,
        partTimerEmpIds: getValidateObject().partTimeEmpIds,
      },
    });
    dispatch(updateDraft([]));
    if (props?.publish) {
      const { notifyTo, forceConfirm, week } = props;
      onFinalPublishRoster({
        notifyTo,
        forceConfirm,
        week,
      });
    }
    setTimeout(() => {
      rosterSaved();
    }, 4000);

    if (res.rosterWeekId) {
      updateRosterDays({
        updatedDays:
          res.updatedDays && res.updatedDays.length ? res.updatedDays : [],
        empHours: res.empHours && res.empHours.length ? res.empHours : [],
        rosterStatus: res.rosterStatus,
      });
    }
  };
  const updateRosterDays = ({
    updatedDays,
    empHours,
    rosterStatus,
  }: {
    updatedDays: IRosterDay[];
    empHours?: IEmpHours[];
    rosterStatus?: string;
  }) => {
    const rosterWeekId = store.getState().roster.rosterWeekId;
    const roster = store.getState().roster.roster;
    if (roster && rosterWeekId) {
      const empWeekRosters: IRoster["empWeekRosters"] =
        roster.empWeekRosters.map((emp) => {
          let empTemp = cloneDeep(emp);
          const days = empTemp.days.map((day) => {
            let dayTemp = cloneDeep(day);
            const updatedDay =
              updatedDays && updatedDays.length
                ? updatedDays.find(
                    ({ date, empId }) =>
                      date === dayTemp.date && empId === dayTemp.empId,
                  )
                : undefined;

            if (updatedDay) {
              dayTemp = cloneDeep(updatedDay);
            }

            return dayTemp;
          });
          const empHoursTemp = cloneDeep(empTemp.empHours || []);
          const updatedEmpHours =
            empHours && empHours.length
              ? empHours.filter(({ empId }) => empId === empTemp.empId)
              : [];
          if (updatedEmpHours.length) {
            empTemp.allowedHours = updatedEmpHours[0].allowedHours;
            updatedEmpHours.forEach((updatedEmpHour) => {
              let index = -1;
              if (empHoursTemp && empHoursTemp.length) {
                index = empHoursTemp.findIndex(
                  ({ pendDate, pstartDate }) =>
                    updatedEmpHour.pstartDate === pstartDate &&
                    updatedEmpHour.pendDate === pendDate,
                );
              }
              if (index === -1) {
                empHoursTemp.push({
                  pstartDate: updatedEmpHour.pstartDate,
                  pendDate: updatedEmpHour.pendDate,
                  totalHours: updatedEmpHour.totalHours,
                });
              } else {
                empHoursTemp[index].pstartDate = updatedEmpHour.pstartDate;
                empHoursTemp[index].pendDate = updatedEmpHour.pendDate;
                empHoursTemp[index].totalHours = updatedEmpHour.totalHours;
              }
            });
          }
          empTemp.empHours = cloneDeep(empHoursTemp);
          empTemp.days = cloneDeep(days);
          return empTemp;
        });
      const newRoster: IRoster = {
        ...roster,
        rosterWeekId,
        empWeekRosters,
        rosterStatus: rosterStatus || roster.rosterStatus,
      };
      dispatch(updateRoster(newRoster));
    }
  };
  const onChangeSelectedDay = (dayId: string) => {
    dispatch(updateSelectedDate(dayId));
  };
  const onDuplicateClick = (duplicateDates: string[]) => {
    const tempDraft: IRosterDay[] = [];
    duplicateDates.forEach((duplicateDate) => {
      const roster = store.getState().roster.roster;
      if (roster?.empWeekRosters?.length) {
        roster.empWeekRosters.forEach(({ days, empId }) => {
          const selectedDay = days.find(({ date }) => date === selectedDate);
          if (selectedDay) {
            if (
              ["WORKING_HOLIDAY", "WORKING", "BLANK"].includes(
                selectedDay.status,
              )
            ) {
              const duplicateEmp = roster.empWeekRosters.find(
                (obj) => obj.empId === empId,
              );
              if (duplicateEmp?.days?.length) {
                const duplicateDay = duplicateEmp.days.find(
                  (obj) => obj.date === duplicateDate,
                );
                if (
                  duplicateDay &&
                  !["LEAVE", "WEEK_OFF", "NA"].includes(duplicateDay.status) &&
                  duplicateDay.edit
                ) {
                  const status = getNewShiftStatus({
                    mainExist:
                      selectedDay.main && selectedDay.main.length
                        ? true
                        : false,
                    nextDayStatus: duplicateDay.status,
                    prevDayStatus: selectedDay.status,
                  });
                  tempDraft.push({
                    ...duplicateDay,
                    main:
                      selectedDay.status === "BLANK" ? [] : selectedDay.main,
                    status,
                  });
                }
              }
            }
          }
        });
      }
    });

    onShiftChange(
      tempDraft.map(({ empId, id, status, main }) => ({
        empId,
        shifts: main?.length
          ? main.map(({ s, e }) => ({ startTime: s, endTime: e }))
          : [],
        status,
        id,
        replaceShifts: true,
      })),
    );
    setFinalDuplicateDayIds(duplicateDates);
    setTimeout(() => {
      setFinalDuplicateDayIds([]);
    }, 3000);
  };
  const getNewShiftStatus = (props: {
    prevDayStatus: string;
    nextDayStatus: string;
    mainExist: boolean;
  }) => {
    const { mainExist, nextDayStatus, prevDayStatus } = props;
    let newShiftStatus = "";
    switch (prevDayStatus) {
      case "BLANK":
        if (["BLANK", "WORKING"].includes(nextDayStatus)) {
          newShiftStatus = "BLANK";
        }
        if (["HOLIDAY", "WORKING_HOLIDAY"].includes(nextDayStatus)) {
          newShiftStatus = "HOLIDAY";
        }
        break;
      case "WORKING":
        if (mainExist) {
          if (["BLANK", "WORKING"].includes(nextDayStatus)) {
            newShiftStatus = "WORKING";
          }
          if (["HOLIDAY", "WORKING_HOLIDAY"].includes(nextDayStatus)) {
            newShiftStatus = "WORKING_HOLIDAY";
          }
        } else {
          newShiftStatus = nextDayStatus;
        }
        break;
      case "WORKING_HOLIDAY":
        if (["BLANK", "WORKING"].includes(nextDayStatus)) {
          newShiftStatus = "WORKING";
        }
        if (["HOLIDAY", "WORKING_HOLIDAY"].includes(nextDayStatus)) {
          newShiftStatus = "WORKING_HOLIDAY";
        }
        break;
      default:
        break;
    }
    if (!newShiftStatus) {
      newShiftStatus = prevDayStatus;
    }
    return newShiftStatus;
  };
  const onPublishRoster = async (props: {
    notifyTo: string;
    forceConfirm?: boolean;
    week?: number;
  }) => {
    const { notifyTo, forceConfirm, week } = props;
    if (week) {
      if (!draft || draft.length === 0) {
        onFinalPublishRoster({
          notifyTo,
          forceConfirm,
          week,
        });
      } else {
        onDraftDataSave({
          publish: true,
          notifyTo,
          forceConfirm,
          week,
        });
      }
    } else {
      onFinalPublishRoster({
        notifyTo,
        forceConfirm,
      });
    }
  };
  const onFinalPublishRoster = async (props: {
    notifyTo: string;
    forceConfirm?: boolean;
    week?: number;
  }) => {
    const { notifyTo, forceConfirm, week } = props;
    setMessageObj([]);
    const endpoint =
      ENDPOINT["/roster"][rosterType === "primary" ? "/primary" : "/secondary"][
        "/publish"
      ];
    onPublishing();
    const res = await post<IApiResponse>(endpoint, {
      data: {
        month: selectedMonth,
        jobType: rosterType === "secondary" ? selectedJobType : LAYOUT,
        clusterId:
          rosterType === "primary" && selectedClusterId
            ? selectedClusterId
            : undefined,
        year: selectedYear,
        costCentre: selectedCostCenterName,
        notifyTo,
        forceConfirm,
        week,
      },
    });
    offPublishing();

    if (res.success) {
      if (week) {
        rosterType === "primary" ? getPrimaryRoster() : getSecondaryRoster();

        setIsRecommendedHoursLoading(true);
        setTimeout(() => {
          getRecommendedHours();
        }, 2000);
      } else {
        getMonthSummary();
      }

      onPublishedRosterModalOpen();
    } else if (res?.weekUncoveredShifts?.length) {
      setWeekUncoveredShifts(res.weekUncoveredShifts);
      onWeekUncoveredShiftsModalOpen();
    } else if (
      res?.empExceedingHoursList?.length ||
      res?.empWeeklyExceedingHoursList?.length ||
      res?.empDailyExceedingHoursList?.length
    ) {
      setEmpExceedingHoursList(res.empExceedingHoursList || []);
      setEmpWeeklyExceedingHoursList(res.empWeeklyExceedingHoursList || []);
      setEmpDailyExceedingHoursList(res.empDailyExceedingHoursList || []);
      onEmpExceedingHoursListModalOpen();
      dispatch(updateEmpExceedingHoursList(res.empExceedingHoursList || []));
    } else if (res.warn && res?.messages?.length) {
      onForceConfirmModalOpen();
      setMessageObj(res.messages);
    } else if (res.message) {
      addToast(res.message, {
        appearance: "error",
      });
    }
  };
  const goToMyTeamRoster = () => {
    navigate(
      `/${rosterType === "primary" ? "layout" : "secondary"}/my-team-roster`,
    );
  };
  const isAnyPartTimeEmp = () => {
    let isAnyPartTimeEmp = false;
    if (roster && roster.empWeekRosters && roster.empWeekRosters.length) {
      roster.empWeekRosters.forEach(({ contractId }) => {
        if (
          !isAnyPartTimeEmp &&
          getIsPartTime({
            contractTypeId: contractId,
            contractTypes,
          })
        ) {
          isAnyPartTimeEmp = true;
        }
      });
    }
    return isAnyPartTimeEmp;
  };
  const getValidateObject = () => {
    const dates: number[] = [];
    const partTimeEmpIds: string[] = [];
    if (roster && roster.empWeekRosters && roster.empWeekRosters.length) {
      roster.empWeekRosters.forEach(({ contractId, empId }) => {
        if (
          getIsPartTime({
            contractTypeId: contractId,
            contractTypes,
          })
        ) {
          partTimeEmpIds.push(empId);
        }
      });
      if (
        roster.empWeekRosters[0].days &&
        roster.empWeekRosters[0].days.length
      ) {
        roster.empWeekRosters[0].days.forEach(({ date }) => {
          dates.push(moment(date).unix() * 1000);
        });
      }
    }

    let endRefDate = new Date();
    let startRefDate = new Date();
    if (dates.length) {
      endRefDate = new Date(Math.max.apply(null, dates));
      startRefDate = new Date(Math.min.apply(null, dates));
    }

    return {
      startRefDate: moment(startRefDate).format("YYYY-MM-DD"),
      endRefDate: moment(endRefDate).format("YYYY-MM-DD"),
      partTimeEmpIds,
    };
  };
  const onValidateHours = async () => {
    onValidating();

    const res = await post<IHoursValidate>(ENDPOINT["/hours"]["/validate"], {
      data: getValidateObject(),
    });
    setValidationState("");
    offValidating();

    if (res && res.empExceedingHoursList && res.empExceedingHoursList.length) {
      dispatch(updateEmpExceedingHoursList(res.empExceedingHoursList));
      setValidationState("failed");
    } else {
      dispatch(updateEmpExceedingHoursList([]));
      setValidationState("success");
    }
    setTimeout(() => {
      setValidationState("");
    }, 5000);
  };
  // const createWeekDays = () => {
  //   const days: string[] = [];
  //   const date = moment().set({
  //     week: selectedWeek,
  //     year: selectedYear,
  //   });
  //   const startDate = date.startOf("week").toDate();
  //   const endDate = date.endOf("week").toDate();
  //   const currentDate = new Date(startDate);
  //   while (currentDate <= endDate) {
  //     days.push(moment(currentDate).format("YYYY-MM-DD"));
  //     currentDate.setDate(currentDate.getDate() + 1);
  //   }
  //   setPlannedJobDays(days);
  // };
  const createDayTimes = () => {
    setPlannedJobTimes(
      generateTimeSlots(DEFAULT_OPEN_TIME, DEFAULT_CLOSE_TIME, undefined, 60),
    );
  };
  const getPlannedJobWeeks = async () => {
    const res = await get<IPlannedJobWeekResponse[]>(
      ENDPOINT["/planned-job-week"]["/week-status"],
      {
        params: {
          cc: selectedCostCenterName,
          year: selectedYear,
          [selectedPlannedJobType === "MISCELLANEOUS"
            ? "miscWorkId"
            : "secondaryJobType"]:
            selectedPlannedJobType === "MISCELLANEOUS"
              ? selectedPlannedMiscWorkId
              : selectedPlannedSecondaryJobType,
        },
      },
    );
    if (res?.length) {
      setPlannedJobWeeks(res);
    } else {
      setPlannedJobWeeks([]);
    }
  };
  const getCJPRoster = async () => {
    onLoading();
    const res = await get<ICJPRoster>(
      ENDPOINT["/planned-job-week"]["/roster"],
      {
        params: {
          week: selectedWeek,
          year: selectedYear,
          costCentre: selectedCostCenterName,
          viewMode,
          [selectedPlannedJobType === "MISCELLANEOUS"
            ? "miscWorkId"
            : "secondaryJobType"]:
            selectedPlannedJobType === "MISCELLANEOUS"
              ? selectedPlannedMiscWorkId
              : selectedPlannedSecondaryJobType,
        },
      },
    );
    offLoading();
    if (res?.pweekId) {
      dispatch(updateCJPRoster(res));
      dispatch(updateCJPRosterWeekId(res.pweekId));
    } else {
      dispatch(updateCJPRoster(undefined));
      dispatch(updateCJPRosterWeekId(0));
    }
  };
  const onCreateCJPRosterClick = async () => {
    if (selectedWeek) {
      const res = await post<ICJPRoster>(
        ENDPOINT["/planned-job-week"]["/init"],
        {
          data: {
            week: selectedWeek,
            year: selectedYear,
            costCenter: selectedCostCenterName,
            type: selectedPlannedJobType,
            [selectedPlannedJobType === "MISCELLANEOUS"
              ? "miscWorkId"
              : "secondaryJobType"]:
              selectedPlannedJobType === "MISCELLANEOUS"
                ? selectedPlannedMiscWorkId
                : selectedPlannedSecondaryJobType,
          },
        },
      );
      if (res?.pweekId) {
        dispatch(updateCJPRoster(res));
        goToPlannedJobEdit(selectedWeek);
      } else {
        let message = "Something went wrong!";
        if (res.message) {
          message = res.message;
        }

        addToast(message, { appearance: "error", autoDismiss: true });
      }
    }
  };
  const onSaveShift = (props: {
    startTime: string;
    endTime: string;
    clusterId: number;
    id?: number;
    deleted?: boolean;
    date: string;
  }) => {
    let draftTemp: ICJPRoster["days"] = cloneDeep(cjpDraft ?? []);

    const { clusterId, endTime, startTime, deleted, id, date } = props;
    if (cjpRosterWeekId) {
      const dateObjIndex = draftTemp.findIndex((obj) => obj.date === date);
      if (dateObjIndex === -1) {
        const day = cjpRoster?.days.find((day) => day.date === date);
        draftTemp.push({
          date,
          edit: true,
          status: day?.status || "WORKING",
          metadata: day?.metadata || "",
          shifts: [
            {
              clusterId,
              deleted: deleted ? true : false,
              endTime,
              id: id ?? null,
              startTime,
            },
          ],
        });
      } else {
        if (id) {
          const shiftObjIndex = draftTemp[dateObjIndex].shifts.findIndex(
            (obj) => obj.id === id,
          );
          if (shiftObjIndex === -1) {
            draftTemp[dateObjIndex].shifts.push({
              clusterId,
              deleted: deleted ? true : false,
              endTime,
              id,
              startTime,
            });
          } else {
            draftTemp[dateObjIndex].shifts[shiftObjIndex] = {
              clusterId,
              deleted: deleted ? true : false,
              endTime,
              startTime,
              id,
            };
          }
        } else {
          draftTemp[dateObjIndex].shifts.push({
            clusterId,
            deleted: deleted ? true : false,
            endTime,
            id: null,
            startTime,
          });
        }
      }
    }

    dispatch(updateCjpDraft(draftTemp));
    updateCJPRosterDays(draftTemp);
  };
  const onCjpDraftDataSave = async ({
    notifyTo,
    publish,
  }: {
    publish?: boolean;
    notifyTo?: string;
  }) => {
    const currentDraft = store.getState().roster.cjpDraft;
    const rosterWeekId = store.getState().roster.cjpRosterWeekId;
    if (!currentDraft || !currentDraft.length || !rosterWeekId) {
      return;
    }
    onRosterSaving();

    const res = await post<{
      pweekId: number;
      days: ICJPRoster["days"];
      success: boolean;
      status: string;
    }>(ENDPOINT["/planned-job-shift"]["/save"], {
      data: {
        weekId: rosterWeekId,
        days: currentDraft,
      },
    });
    dispatch(updateCjpDraft([]));
    setTimeout(() => {
      rosterSaved();
    }, 4000);

    if (res.pweekId) {
      getCJPRoster();
    }
    if (publish && notifyTo) {
      onCjpPublish({ final: true, notifyTo });
    }
  };
  const updateCJPRosterDays = (days: ICJPRoster["days"]) => {
    const roster = cloneDeep(store.getState().roster.cjpRoster);
    if (days?.length && roster) {
      days.forEach(({ date, shifts }) => {
        const dayIndex = roster.days.findIndex((obj) => obj.date === date);
        if (dayIndex >= 0) {
          shifts.forEach(({ id, clusterId, deleted, endTime, startTime }) => {
            const shiftIndex = id
              ? roster.days[dayIndex].shifts.findIndex((obj) => obj.id === id)
              : roster.days[dayIndex].shifts.findIndex(
                  (obj) =>
                    `${obj.startTime}_${obj.endTime}_${obj.clusterId}` ===
                    `${startTime}_${endTime}_${clusterId}`,
                );

            if (shiftIndex === -1) {
              if (!deleted) {
                roster.days[dayIndex].shifts.push({
                  id,
                  clusterId,
                  deleted,
                  endTime,
                  startTime,
                });
              }
            } else {
              if (deleted) {
                roster.days[dayIndex].shifts.splice(shiftIndex, 1);
              } else {
                roster.days[dayIndex].shifts[shiftIndex] = {
                  id,
                  clusterId,
                  deleted,
                  endTime,
                  startTime,
                };
              }
            }
          });
        }
      });
    }

    dispatch(updateCJPRoster(roster));
  };
  const onCjpPublish = async ({
    final,
    notifyTo,
  }: {
    final: boolean;
    notifyTo: string;
  }) => {
    if (final || !cjpDraft || cjpDraft.length === 0) {
      const res = await post<{
        success: boolean;
        message: string;
      }>(
        ENDPOINT["/planned-job-week"]["/publish"] +
          `?weekId=${cjpRosterWeekId}&notifyTo=${notifyTo}`,
      );
      if (res.success) {
        getCJPRoster();
        addToast(res.message || "Success", {
          appearance: "success",
          autoDismiss: true,
        });
      } else {
        addToast(res.message || "Something went wrong!", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    } else {
      onCjpDraftDataSave({ publish: true, notifyTo });
    }
  };

  return {
    goToRosterEdit,
    onNextWeekClick,
    onPrevWeekClick,
    onCreateRosterClick,
    onBack,
    onShareRoster,
    onShiftChange,
    onChangeSelectedDay,
    onDuplicateClick,
    isDuplicateModalOpen,
    onDuplicateModalOpen,
    onDuplicateModalClose,
    onCloneWeekModalOpen,
    onCloneWeekModalClose,
    onCloneWeek,
    finalDuplicateDayIds,
    setFinalDuplicateDayIds,
    getStoreSecondaryJobs,
    selectedYear,
    selectedMonth,
    onChangeYear,
    years,
    weeks,
    storeSecondaryJobs,
    onChangeWeek,
    roster,
    shifts,
    onDraftDataSave,
    isRosterSaving,
    cloneWeekId,
    setCloneWeekId,
    onStartFreshRoster,
    onPublishRoster,
    isLoading,
    isPublishedRosterModalOpen,
    onPublishedRosterModalClose,
    goToMyTeamRoster,
    onChangeSelectedJobType,
    onChangeSelectedClusterId,
    selectedClusterId,
    selectedJobType,
    onChangeMonth,
    getEmployeeCluster,
    getAllClusters,
    clusters,
    userClustersInfo,
    getShifts,
    monthSummary,
    getMonthSummary,
    miscWorks,
    onRemoveMiscShift,
    getPayrollConfig,
    payrollConfig,
    onValidateHours,
    isAnyPartTimeEmp,
    isValidating,
    validationState,
    isEmpExceedingHoursListModalOpen,
    onEmpExceedingHoursListModalClose,
    empExceedingHoursList,
    empWeeklyExceedingHoursList,
    empDailyExceedingHoursList,
    getPlannedJobs,
    plannedJobs,
    onChangeSelectedPlannedJobId,
    onChangeSelectedPlannedJobType,
    onChangeSelectedPlannedSecondaryJobType,
    onChangeSelectedPlannedMiscWorkId,
    goToPlannedJobEdit,
    // plannedJobDays,
    plannedJobTimes,
    getPlannedJobWeeks,
    plannedJobWeeks,
    cjpRoster,
    cjpRosterWeekId,
    onCreateCJPRosterClick,
    onSaveShift,
    onCjpDraftDataSave,
    cjpDraft,
    onCjpPublish,
    isForceConfirmModalOpen,
    onForceConfirmModalClose,
    messageObj,
    isWeekUncoveredShiftsModalOpen,
    onWeekUncoveredShiftsModalClose,
    weekUncoveredShifts,
    isPublishing,
    globalNotifyTo,
    setGlobalNotifyTo,
    recommendedHours,
    isRecommendedHoursLoading,
  };
};

export { useRoster };
