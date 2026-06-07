import { useEffect, useState } from "react";
import {
  IApiResponse,
  ICalender,
  IHolidayResponse,
  IMyLeave,
  IMyLeaveResponse,
  IMyWeekOff,
  IPayrollConfig,
  IWeekOffResponse,
  IWeekResponse,
} from "../helper/Interface";
import moment from "moment";
import { useApi } from "./useApi";
import { ENDPOINT } from "../config/endpoint.config";
import { useAppSelector } from "../app/store/store";
import { useBoolean, useDisclosure } from "@chakra-ui/react";
import { useToasts } from "react-toast-notifications";
import { cloneDeep } from "lodash";
import {
  AUTO_APPROVED,
  GENERAL,
  LOP,
  MAX_WEEK_IN_MONTH,
  leaveTypes,
} from "../helper/Constant";
import { createDates, getDateFromString } from "../helper/Utils";
import { useService } from "./useService";

const ROSTER_LIST: {
  fromDate: string;
  toDate: string;
}[] = [
  // {
  //   fromDate: "2023-09-24",
  //   toDate: "2023-09-30",
  // },
  // {
  //   fromDate: "2023-09-10",
  //   toDate: "2023-09-16",
  // },
];

export const HOLIDAY_COLOR = "#F29727";
export const LEAVE_COLOR = "#C1E1C1";
export const WEEK_OFF_COLOR = "#82abd4";
export const ROSTER_PUBLISHED_COLOR = "#F4F4F4";
export const TODAY_COLOR = "#fff";
export const WEEK_OFF_BUTTON_COLOR = "#82abd41a";

const useCalender = (props: {
  empId: string;
  contractTypeId: number;
  stateId: number;
  applyBy: string;
}) => {
  const { empId, contractTypeId, stateId, applyBy } = props;
  const TABS = [
    {
      name: applyBy === "SELF" ? "My Weekly Offs" : "Weekly Offs",
      value: "my-weekly-offs",
      index: 0,
    },
    {
      name: applyBy === "SELF" ? "My Leaves" : "Leaves",
      value: "my-leaves",
      index: 1,
    },
  ];

  const today = new Date();
  const [tabValue, setTabValue] = useState(TABS[0].value);
  const { get, post } = useApi();
  const { addToast } = useToasts();
  const [leavesData, setLeavesData] = useState<IMyLeaveResponse>();
  const [leaves, setLeaves] = useState<IMyLeave[]>([]);
  const [weekOffs, setWeekOffs] = useState<IMyWeekOff[]>([]);
  const [calender, setCalender] = useState<ICalender[]>([]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [holidays, setHolidays] = useState<IHolidayResponse[]>([]);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    isOpen: isCancelOpen,
    onClose: onCancelClose,
    onOpen: onCancelOpen,
  } = useDisclosure();
  const {
    isOpen: isHolidayOpen,
    onClose: onHolidayClose,
    onOpen: onHolidayOpen,
  } = useDisclosure();
  const {
    isOpen: isLeaveHistoryOpen,
    onClose: onLeaveHistoryClose,
    onOpen: onLeaveHistoryOpen,
  } = useDisclosure();
  const [cancelLeaveId, setCancelLeaveId] = useState(0);
  const [isLoading, { on, off }] = useBoolean();
  const [type, setType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [comment, setComment] = useState("");
  const [messageObj, setMessageObj] = useState<IApiResponse["messages"]>([]);
  const [forceConfirmApplicable, setForceConfirmApplicable] = useState(false);
  const [weekOffMode, setWeekOffMode] = useState(false);
  const [appliedDates, setAppliedDates] = useState<string[]>([]);
  const [cancelledDates, setCancelledDates] = useState<string[]>([]);
  const [maxWeekOffs, setMaxWeekOffs] = useState<number>(0);
  const [leaveCancelledDates, setLeaveCancelledDates] = useState<string[]>([]);

  const [weeksInCurrentMonth, setWeeksInCurrentMonth] =
    useState(MAX_WEEK_IN_MONTH);

  const { getPayrollConfig, payrollConfig, weeks, getWeeks } = useService();
  useEffect(() => {
    getPayrollConfig();
    if (empId) {
      createCalender();
    }
  }, [currentMonth, currentYear, empId]);

  useEffect(() => {
    if (currentYear) {
      getWeeks(currentYear);
    }
  }, [currentYear]);
  useEffect(() => {
    if (contractTypeId) {
      getWeekOffs();
    }
  }, [contractTypeId]);
  const getWeekOffs = async () => {
    const res = await get<IWeekOffResponse[]>(ENDPOINT["/master"]["/week-off"]);
    if (res?.length) {
      const dates = res.filter((obj) => obj.contractTypeId === contractTypeId);
      if (dates?.length) {
        const allWeekOffs = dates
          .filter(
            ({ effectiveDate }) =>
              getDateFromString(effectiveDate).getTime() < new Date().getTime(),
          )
          .sort(
            (a, b) =>
              getDateFromString(b.effectiveDate).getTime() -
              getDateFromString(a.effectiveDate).getTime(),
          );
        if (allWeekOffs?.length) {
          setMaxWeekOffs(allWeekOffs[0].numWeekOff);
        }
      }
    }
  };

  const createCalender = () => {
    setAppliedDates([]);
    setCancelledDates([]);
    const { calender, weeksInCurrentMonth } = createDates(
      currentYear,
      currentMonth,
    );
    setWeeksInCurrentMonth(weeksInCurrentMonth);
    updateCalender(calender);
  };
  const getMyLeaves = async (): Promise<IMyLeave[]> => {
    const res = await get<IMyLeaveResponse>(
      ENDPOINT["/leave"]["/my-leaves"] + `/${empId}`,
      {
        params: {
          year: currentYear,
        },
      },
    );
    if (res?.stateId) {
      setLeavesData(res);
      if (res?.leaves?.length) {
        setLeaves(res.leaves);
        return res.leaves;
      } else {
        setLeaves([]);
        return [];
      }
    } else {
      return [];
    }
  };
  const getMyWeekOffs = async (fromDate: string, toDate: string) => {
    const res = await get<IMyWeekOff[]>(
      ENDPOINT["/week-off"]["/emp"] + `/${empId}`,
      {
        params: {
          fromDate,
          toDate,
        },
      },
    );
    if (res?.length) {
      setWeekOffs(res);
      return res;
    } else {
      setWeekOffs([]);
      return res;
    }
  };
  const getAllHoliday = async () => {
    const res = await get<IHolidayResponse[]>(
      ENDPOINT["/master"]["/holiday"] +
        `?stateId=${stateId}&year=${currentYear}`,
      undefined,
      true,
    );
    if (res?.length) {
      setHolidays(res);
      return res;
    } else {
      setHolidays([]);
      return [];
    }
  };
  const updateCalender = async (calender: ICalender[]) => {
    const leaves = await getMyLeaves();
    const weekOffs = await getMyWeekOffs(
      moment(calender[0].date).format("YYYY-MM-DD"),
      moment(calender[calender.length - 1].date).format("YYYY-MM-DD"),
    );
    const holidays = await getAllHoliday();
    setAppliedDates(weekOffs?.length ? weekOffs.map(({ date }) => date) : []);
    const calenderTemp: ICalender[] = calender.map(
      ({ column, date: calenderDate, row }) => ({
        column,
        date: calenderDate,
        row,
        today: areTwoDatesEqual(today, calenderDate) || undefined,
        holiday:
          holidays.find((holiday) => {
            const holidayDate = new Date(holiday.date);
            return areTwoDatesEqual(holidayDate, calenderDate);
          })?.name ?? undefined,
        leaveId: leaves?.length
          ? leaves
              .filter(({ status }) => status === "AUTO_APPROVED")
              .find(({ fromDate, toDate }) => {
                return dateExistInRange(
                  calenderDate,
                  getDateFromString(fromDate),
                  getDateFromString(toDate),
                );
              })?.id
          : undefined,
        weekOff: weekOffs?.length
          ? weekOffs.findIndex((weekOff) => {
              const weekOffDate = new Date(weekOff.date);
              return areTwoDatesEqual(weekOffDate, calenderDate);
            }) >= 0
          : undefined,
        roster: ROSTER_LIST
          ? ROSTER_LIST.findIndex(({ fromDate, toDate }) => {
              return dateExistInRange(
                calenderDate,
                getDateFromString(fromDate),
                getDateFromString(toDate),
              );
            }) >= 0
          : undefined,
      }),
    );
    setCalender(calenderTemp);
  };
  const areTwoDatesEqual = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  const dateExistInRange = (date: Date, fromDate: Date, toDate: Date) => {
    return (
      fromDate.getTime() <= date.getTime() && toDate.getTime() >= date.getTime()
    );
  };

  const onPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
      return;
    }
    setCurrentMonth(currentMonth - 1);
  };
  const onNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
      return;
    }
    setCurrentMonth(currentMonth + 1);
  };

  const onDateClick = ({ date, leaveId }: { date: Date; leaveId?: number }) => {
    if (leaveId) {
      setLeaveCancelledDates([]);
      onCancelOpen();
      setCancelLeaveId(leaveId);
      if (
        payrollConfig &&
        moment(date).startOf("day").unix() * 1000 >=
          moment(payrollConfig.currentPStartDateTime).startOf("day").unix() *
            1000
      ) {
        setLeaveCancelledDates([moment(date).format("YYYY-MM-DD")]);
      }
    } else {
      onApplyLeave(date);
    }
  };

  const onApplyLeave = (date?: Date) => {
    setType(leaveTypes[0].value);
    setFromDate(date ? moment(date).format("YYYY-MM-DD") : "");
    setToDate(date ? moment(date).format("YYYY-MM-DD") : "");
    setComment("");
    setMessageObj([]);
    setForceConfirmApplicable(false);
    onOpen();
  };
  const getLeaveCount = (leaveType: string) => {
    let count = 0;
    if (leavesData?.leaves?.length) {
      leavesData?.leaves.forEach(({ status, type, fromDate, toDate }) => {
        if (type === leaveType && status === AUTO_APPROVED) {
          count += moment(toDate).diff(moment(fromDate), "day");
          count += 1;
        }
      });
    }
    return count;
  };
  const onSaveLeave = (forceConfirm?: boolean) => {
    setMessageObj([]);
    on();
    post<IApiResponse>(ENDPOINT["/leave"]["/apply"], {
      data: {
        empId,
        type,
        fromDate,
        toDate: [GENERAL, LOP].includes(type) ? toDate : fromDate,
        comment,
        forceConfirm: forceConfirm ?? false,
        applyBy,
      },
    })
      .then((res) => {
        if (res.success) {
          onClose();
          addToast(res.message, {
            appearance: "success",
          });
          createCalender();
        } else if (res.warn && res.messages && res.messages.length) {
          setMessageObj(res.messages);
          setForceConfirmApplicable(true);
        } else {
          setMessageObj([
            {
              message: res.message,
              messageType: "WARN",
            },
          ]);
        }
      })
      .finally(() => {
        off();
      });
  };
  const onCancelLeave = ({ cancelAllLeave }: { cancelAllLeave?: boolean }) => {
    onCancelClose();
    let partialCancellation = false;
    let leaveCancelledDatesTemp = [...leaveCancelledDates];
    if (leavesData && payrollConfig) {
      const leave = leavesData.leaves.find(({ id }) => cancelLeaveId === id);
      if (leave) {
        let fromDate = leave.fromDate;
        let toDate = leave.toDate;
        const currentPStartDateTime = payrollConfig.currentPStartDateTime;
        if (cancelAllLeave) {
          if (
            moment(fromDate).startOf("day").unix() * 1000 <
            moment(currentPStartDateTime).startOf("day").unix() * 1000
          ) {
            fromDate = moment(currentPStartDateTime)
              .startOf("day")
              .format("YYYY-MM-DD");
          }
          leaveCancelledDatesTemp = getBWDates({
            fromDate,
            toDate,
          });
        }
        partialCancellation =
          getBWDates({
            fromDate,
            toDate,
          }).length !== leaveCancelledDatesTemp.length;
      }
    }
    post<IApiResponse>(ENDPOINT["/leave"]["/cancel"], {
      data: {
        leaveId: cancelLeaveId,
        cancelledDates: partialCancellation
          ? leaveCancelledDatesTemp
          : undefined,
        partialCancellation,
        empId,
        cancelBy: applyBy,
      },
    }).then((res) => {
      addToast(res.message, {
        appearance: res.success ? "success" : "error",
      });
      if (res.success) {
        createCalender();
      }
    });
  };
  const getDatesFromTo = (fromDate: string, toDate: string) => {
    const dates: number[] = [];
    while (
      moment(getDateFromString(fromDate)) <= moment(getDateFromString(toDate))
    ) {
      dates.push(getDateFromString(fromDate).getTime());
      fromDate = moment(fromDate).add({ days: 1 }).format("YYYY-MM-DD");
    }
    return dates;
  };
  const getDisabledDates = () => {
    const dates: number[] = [];
    if (leavesData?.leaves?.length) {
      leavesData.leaves
        .filter(({ status }) => status === AUTO_APPROVED)
        .forEach(({ fromDate, toDate }) => {
          dates.push(...getDatesFromTo(fromDate, toDate));
        });
    }
    if (holidays?.length) {
      holidays.forEach(({ date }) => {
        dates.push(getDateFromString(date).getTime());
      });
    }
    return new Set([...dates]);
  };

  const onWeekOffClick = (date: string) => {
    if (!maxWeekOffs) {
      return;
    }
    const week = moment(date).week();

    let appliedDatesTemp = cloneDeep(appliedDates || []);
    let cancelledDatesTemp = cloneDeep(cancelledDates || []);

    if (!appliedDatesTemp.includes(date)) {
      const weekOffsOfThisWeek = findWeekOffForWeek(week);
      let removeWeekOff = "";
      if (weekOffsOfThisWeek.length === maxWeekOffs) {
        removeWeekOff = weekOffsOfThisWeek.sort(
          (a, b) => moment(b).unix() - moment(a).unix(),
        )[0];
        if (
          payrollConfig &&
          moment(removeWeekOff).unix() >=
            moment(payrollConfig.currentPStartDateTime).startOf("day").unix()
        ) {
          appliedDatesTemp = appliedDatesTemp.filter(
            (value) => value !== removeWeekOff,
          );
        }
      }
      if (isWeekOffClickValid(date)) {
        appliedDatesTemp.push(date);
      }
      if (cancelledDatesTemp.includes(date)) {
        cancelledDatesTemp = cancelledDatesTemp.filter(
          (value) => value !== date,
        );
      }
      if (
        removeWeekOff &&
        weekOffs.findIndex(({ date }) => date === removeWeekOff) >= 0
      ) {
        cancelledDatesTemp.push(removeWeekOff);
      }
    } else {
      appliedDatesTemp = appliedDatesTemp.filter((value) => value !== date);
      if (weekOffs.find((weekOff) => weekOff.date === date)) {
        cancelledDatesTemp.push(date);
      }
    }
    setAppliedDates(appliedDatesTemp);
    setCancelledDates(cancelledDatesTemp);
  };

  const findWeekOffForWeek = (week: number) => {
    return appliedDates.filter((weekOff) => moment(weekOff).week() === week);
  };
  const isWeekOffClickValid = (date: string) => {
    const week = moment(date).week();

    const prevPayrollWeekOffLength = appliedDates.filter(
      (weekOff) =>
        payrollConfig &&
        moment(weekOff).week() === week &&
        moment(weekOff).unix() <
          moment(payrollConfig.currentPStartDateTime).startOf("day").unix(),
    ).length;

    return prevPayrollWeekOffLength < maxWeekOffs;
  };
  const onSaveWeekOff = () => {
    post<IApiResponse>(ENDPOINT["/week-off"]["/apply"], {
      data: {
        empId,
        appliedDates,
        cancelledDates,
        applyBy,
      },
    }).then((res) => {
      addToast(res.message, {
        appearance: res.success ? "success" : "error",
      });
      if (res.success) {
        createCalender();
      }
    });
  };
  const onDiscardChanges = () => {
    createCalender();
  };
  const getBWDates = ({
    fromDate,
    toDate,
  }: {
    fromDate?: string;
    toDate?: string;
  }) => {
    if (fromDate && toDate) {
      let dates: string[] = [moment(fromDate).format("YYYY-MM-DD")];
      let currDate = moment(fromDate).startOf("day");
      let lastDate = moment(toDate).startOf("day");
      while (currDate.add(1, "days").diff(lastDate) < 0) {
        dates.push(currDate.clone().format("YYYY-MM-DD"));
      }
      if (fromDate !== toDate) {
        dates.push(moment(toDate).format("YYYY-MM-DD"));
      }
      return dates;
    } else {
      return [];
    }
  };
  return {
    calender,
    weeksInCurrentMonth,
    currentMonth,
    currentYear,
    holidays,
    onNextMonth,
    onPrevMonth,
    setCurrentMonth,
    setCurrentYear,
    weeks,
    leavesData,
    leaves,
    onApplyLeave,
    ROSTER_PUBLISHED_COLOR,
    WEEK_OFF_BUTTON_COLOR,
    onDateClick,
    HOLIDAY_COLOR,
    LEAVE_COLOR,
    WEEK_OFF_COLOR,
    TODAY_COLOR,
    getLeaveCount,
    GENERAL,
    AUTO_APPROVED,
    isOpen,
    onClose,
    onOpen,
    messageObj,
    forceConfirmApplicable,
    type,
    setType,
    leaveTypes,
    comment,
    setComment,
    fromDate,
    toDate,
    setFromDate,
    setToDate,
    getDisabledDates,
    onSaveLeave,
    isLoading,
    isCancelOpen,
    onCancelClose,
    onCancelOpen,
    cancelLeaveId,
    onCancelLeave,
    weekOffMode,
    setWeekOffMode,
    TABS,
    tabValue,
    setTabValue,
    onWeekOffClick,
    appliedDates,
    onSaveWeekOff,
    maxWeekOffs,
    isHolidayOpen,
    onHolidayOpen,
    onHolidayClose,
    isLeaveHistoryOpen,
    onLeaveHistoryOpen,
    onLeaveHistoryClose,
    onDiscardChanges,
    payrollConfig,
    leaveCancelledDates,
    setLeaveCancelledDates,
    getBWDates,
  };
};
export { useCalender };
