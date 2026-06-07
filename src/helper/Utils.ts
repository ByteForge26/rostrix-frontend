import { addMonths, subMonths } from "date-fns";
import moment, { Moment } from "moment";
import { Option } from "react-multi-select-component";
import * as XLSX from "xlsx";
import {
  DAYS,
  DEFAULT_CLOSE_TIME,
  DEFAULT_OPEN_TIME,
  FILTERS,
  LUNCH_INCLUDE,
  MAX_SHIFT_WITHOUT_LUNCH,
  MAX_SHIFT_WITHOUT_LUNCH_PART_TIMER,
  MAX_SHIFT_WITH_LUNCH,
  MAX_SHIFT_WITH_LUNCH_PART_TIMER,
  MAX_WEEK_IN_MONTH,
  MONTHS_SHORT,
  TIME_GAP,
} from "./Constant";
import {
  ICalender,
  ICalenderHour,
  IContractTypeResponse,
  IPayrollConfig,
  IRoster,
  IRosterDay,
  IRosterDetails,
  IRosterHookProps,
  IShift,
  IWeekResponse,
} from "./Interface";

export const daysInMonth = (currentYear: number, currentMonth: number) => {
  return 32 - new Date(currentYear, currentMonth, 32).getDate();
};
export const createDates = (currentYear: number, currentMonth: number) => {
  let firstDay = new Date(currentYear, currentMonth).getDay();
  let dateCounter = 1;
  let weeksInCurrentMonth = 0;
  const calender: ICalender[] = [];
  for (let i = 0; i < MAX_WEEK_IN_MONTH; i++) {
    let calenderDate: Date;
    let isWeekClose = false;
    for (let j = 0; j < DAYS.length; j++) {
      if (i === 0 && j < firstDay) {
        calenderDate = new Date(currentYear, currentMonth, j + 1 - firstDay);
      } else {
        calenderDate = new Date(currentYear, currentMonth, dateCounter);
        dateCounter++;
      }
      calender.push({
        row: i,
        column: j,
        date: calenderDate,
      });

      if (dateCounter > daysInMonth(currentYear, currentMonth)) {
        isWeekClose = true;
        weeksInCurrentMonth = i + 1;
      }
    }
    if (isWeekClose) {
      break;
    }
  }
  let startDate = "";
  let endDate = "";
  if (calender.length) {
    startDate = moment(calender[0].date).format("YYYY-MM-DD");
    endDate = moment(calender[calender.length - 1].date).format("YYYY-MM-DD");
  }
  return { calender, weeksInCurrentMonth, startDate, endDate };
};
export const modifyTimeValue = (value: moment.Moment) => {
  if (!value) {
    return "";
  }
  return moment(`${value.hours()}:${value.minutes()}:00`, "HH:mm:ss").format(
    "HH:mm:ss",
  );
};
export const convertTime = (time?: string) => {
  if (!time) {
    return "-";
  }
  return moment(time, "HH:mm:ss").format("h:mm A").replaceAll(":00", "");
};
export const getDateFromString = (date: string) => {
  return new Date(moment(new Date(date)).format("YYYY/MM/DD"));
};
export const formatDate = (date: string, options?: { time: boolean }) => {
  if (options) {
    const { time } = options;
    if (time) {
      return moment(new Date(date)).format("DD MMM YYYY, hh:mm A");
    }
  }
  return moment(new Date(date)).format("DD MMM YYYY");
};
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};
export const similerShiftExist = (props: {
  shifts: IShift[];
  clusterId: number;
  contractTypeId: number;
  startTime: string;
  endTime: string;
}) => {
  const { shifts, clusterId, contractTypeId, endTime, startTime } = props;
  return (
    shifts
      .filter((obj) => {
        if (clusterId && clusterId >= 0) {
          return obj.clusterId === clusterId;
        }
        return true;
      })
      .findIndex(
        (obj) =>
          obj.startTime === startTime &&
          obj.endTime === endTime &&
          obj.contractTypeId === contractTypeId,
      ) >= 0
  );
};
export const getShiftStatus = (props: {
  startTime: string;
  endTime: string;
  main: IRosterDay["main"];
  others: IRosterDay["others"];
  misc: IRosterDay["misc"];
  maxShiftDuration: number;
}) => {
  const { endTime, startTime, main, others, misc, maxShiftDuration } = props;
  let isConflictWithMain = false;
  let isConflictWithOthers = false;
  let isConflictWithMisc = false;
  let isShiftMaxDurationExceed = false;
  let isSameShift = false;
  let message = "";
  if (main?.length) {
    main.forEach(({ s, e }) => {
      if (startTime < e && endTime > s) {
        isConflictWithMain = true;
        message =
          "This shift you are trying to add overlaps with one or more primary shifts";
      }
      if (startTime === s && endTime === e) {
        isSameShift = true;
        message = "";
      }
    });
  }
  if (others?.length) {
    others.forEach(({ s, e }) => {
      if (
        (startTime < e && endTime > s) ||
        (startTime === s && endTime === e)
      ) {
        isConflictWithOthers = true;
        message =
          "This shift you are trying to add overlaps with one or more pre-existing secondary shifts";
      }
    });
  }
  if (misc?.length) {
    misc.forEach(({ s, e }) => {
      if (
        (startTime < e && endTime > s) ||
        (startTime === s && endTime === e)
      ) {
        isConflictWithMisc = true;
      }
    });
  }
  const { totalDurationInHours: prevDurationInHours } =
    calculateTotalShiftDuration([
      ...(main ?? []),
      ...(others ?? []),
      ...(misc ?? []),
    ]);
  const { totalDurationInHours } = calculateTotalShiftDuration([
    ...(main ?? []),
    ...(others ?? []),
    ...(misc ?? []),
    { c: "", e: endTime, s: startTime },
  ]);
  let maxLimit = maxShiftDuration;
  if (totalDurationInHours > maxShiftDuration && !isConflictWithMisc) {
    isShiftMaxDurationExceed = true;
  }
  if (
    totalDurationInHours > MAX_SHIFT_WITHOUT_LUNCH &&
    !getIsLunchExist({
      main: main ?? [],
      misc: misc ?? [],
      others: others ?? [],
    }) &&
    prevDurationInHours !== 0
  ) {
    maxLimit = MAX_SHIFT_WITHOUT_LUNCH;
    isShiftMaxDurationExceed = true;
  }

  if (isShiftMaxDurationExceed) {
    if (message) {
      message = message + " & ";
    }
    message += `Adding this shift will exceed the daily work hour limit of ${maxLimit}hr.`;
  }
  return {
    isConflictWithMain,
    isConflictWithOthers,
    isConflictWithMisc,
    message,
    isSameShift,
    isShiftMaxDurationExceed,
    totalDurationInHours,
  };
};
export const getDuration = (
  startTime: moment.Moment,
  endTime: moment.Moment,
) => {
  const duration = moment.duration(endTime.diff(startTime));
  const durationHours = duration.asHours();
  let text = `${durationHours} hr`;
  if (durationHours < 1) {
    text = `${(durationHours * 60).toString().padStart(2, "0")} min`;
  }
  return {
    duration,
    durationHours,
    text,
  };
};
export const getTimeDiff = (
  startTime: moment.Moment,
  endTime: moment.Moment,
) => {
  const { duration } = getDuration(startTime, endTime);
  const hours = parseInt(duration.asHours().toString());
  const minutes =
    parseInt(duration.asMinutes().toString().padStart(2, "0")) - hours * 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} hrs`;
};

export const generateTimeSlots = (
  startTime: string,
  endTime: string,
  from?: string,
  timeGap?: number,
) => {
  const startDate = new Date(`2023-01-01 ${startTime}`);

  const endDate = new Date(`2023-01-01 ${endTime}`);

  const timeSlots: { label: string; value: string }[] = [];

  while (startDate <= endDate) {
    const label = from
      ? `${moment(startDate).format("hh:mm A")}  (${
          getDuration(
            moment(moment(from, "HH:mm:ss").format("HH:mm:ss"), "HH:mm:ss"),
            moment(
              moment(startDate, "HH:mm:ss").format("HH:mm:ss"),
              "HH:mm:ss",
            ),
          ).text
        })`
      : moment(startDate).format("hh:mm A");
    const value = moment(startDate).format("HH:mm:ss");
    timeSlots.push({
      label,
      value,
    });
    startDate.setTime(startDate.getTime() + (timeGap || TIME_GAP) * 60 * 1000); // Add 15 minutes
  }

  return timeSlots;
};
interface TimeShift {
  startTime: Date;
  endTime: Date;
}
export const calculateTotalShiftDuration = (shiftsTemp: IRosterDay["main"]) => {
  let shifts: TimeShift[] = [];
  shiftsTemp.forEach(({ e, s }) => {
    shifts.push({
      startTime: new Date(`2023-01-01T${s}`),
      endTime: new Date(`2023-01-01T${e}`),
    });
  });
  const sortedShifts = [...shifts].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );

  let totalDuration = 0;
  let currentShift: TimeShift | null = null;

  for (const shift of sortedShifts) {
    if (currentShift === null) {
      currentShift = { ...shift };
    } else if (shift.startTime <= currentShift.endTime) {
      currentShift.endTime = new Date(
        Math.max(shift.endTime.getTime(), currentShift.endTime.getTime()),
      );
    } else {
      totalDuration +=
        currentShift.endTime.getTime() - currentShift.startTime.getTime();
      currentShift = { ...shift };
    }
  }
  if (currentShift !== null) {
    totalDuration +=
      currentShift.endTime.getTime() - currentShift.startTime.getTime();
  }

  const totalDurationInHours = totalDuration / (1000 * 60 * 60);

  return { totalDurationInHours };
};
export const getIsLunchExist = (props: {
  main: IRosterDay["main"];
  others: IRosterDay["others"];
  misc: IRosterDay["misc"];
}) => {
  const { main, misc, others } = props;
  let lunch = false;
  const shifts = [...(main ?? []), ...(misc ?? []), ...(others ?? [])];
  shifts.forEach(({ e, s }) => {
    const { durationHours } = getDuration(
      moment(moment(s, "HH:mm:ss").format("HH:mm:ss"), "HH:mm:ss"),
      moment(moment(e, "HH:mm:ss").format("HH:mm:ss"), "HH:mm:ss"),
    );
    if (durationHours >= LUNCH_INCLUDE && !lunch) {
      lunch = true;
    }
  });
  return lunch;
};
export const getIsPartTime = (props: {
  contractTypes?: IContractTypeResponse[];
  contractTypeId: number;
}) => {
  const { contractTypeId, contractTypes } = props;
  if (contractTypes?.length) {
    const contractType = contractTypes.find(({ id }) => id === contractTypeId);
    if (contractType && contractType.category === "NON_FULL_TIME") {
      return true;
    }
    return false;
  }

  return false;
};
export const generateMonthsListing = (props: {
  startDate: number;
  endDate: number;
  count: number;
  disabledAfter?: string;
  minDate?: string;
  maxDate?: string;
}) => {
  const { count, endDate, startDate, disabledAfter, minDate, maxDate } = props;
  let selectedYearMonth = "";
  let listing: { label: string; value: string; isDisabled: boolean }[] = [];
  const today = moment();
  const startingDateOfList = subMonths(
    today.set("D", startDate).toDate(),
    count - 4,
  );
  for (let index = 0; index < count; index++) {
    const currentDate = addMonths(startingDateOfList, index);
    const prevDate = subMonths(currentDate, 1);
    const label = `${startDate} ${
      MONTHS_SHORT[prevDate.getMonth()]
    } ${prevDate.getFullYear()} - ${endDate} ${
      MONTHS_SHORT[currentDate.getMonth()]
    } ${currentDate.getFullYear()}`;
    const value = `${currentDate.getFullYear()}_${currentDate
      .getMonth()
      .toString()
      .padStart(2, "0")}`;

    const isDisabled = disabledAfter
      ? moment(currentDate).set({ D: endDate, h: 0, m: 0, s: 0 }).unix() >
        moment(disabledAfter).set({ h: 0, m: 0, s: 0 }).unix()
      : false;
    listing.push({
      label,
      value,
      isDisabled,
    });
  }
  if (moment().get("date") >= startDate) {
    let nextMonth = addMonths(today.toDate(), 1);
    selectedYearMonth = `${nextMonth.getFullYear()}_${nextMonth
      .getMonth()
      .toString()
      .padStart(2, "0")}`;
  } else {
    selectedYearMonth = `${today.year()}_${today
      .month()
      .toString()
      .padStart(2, "0")}`;
  }
  if (minDate && maxDate) {
    let minDateValue = `${moment(minDate).get("year")}_${(
      moment(minDate).get("month") + 1
    )
      .toString()
      .padStart(2, "0")}`;
    let maxDateValue = `${moment(maxDate).get("year")}_${(
      moment(maxDate).get("month") + 1
    )
      .toString()
      .padStart(2, "0")}`;
    listing = listing.filter(({ value, isDisabled }) => {
      return minDateValue <= value && value <= maxDateValue && !isDisabled;
    });
    if (listing.length)
      selectedYearMonth = listing.sort((a, b) =>
        b.value.localeCompare(a.value),
      )[0].value;
  }
  return { listing, selectedYearMonth };
};
export const downloadCSV = (props: { res: any; name: string }) => {
  const { res, name } = props;
  const url = window.URL.createObjectURL(new Blob([res]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${name}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
export const timerUI = (time: number): string => {
  const seconds = Math.floor((time / 1000) % 60);
  const minutes = Math.floor((time / (1000 * 60)) % 60);
  const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
  const days = Math.floor(time / (1000 * 60 * 60 * 24));
  const html = `
  <div style="display: flex; justify-content: center; margin-top: 8px;">
    ${
      days
        ? `
      <div style="
            margin: 4px;
        ">
        <p style="font-size: 10px; color: #027DBC">
          Days
        </p>
        <div style="
              box-shadow: 1px 1px 6px 1px lightgray;
              padding: 4px 8px;
              margin-top: 4px;
          ">
          <h3>
            ${days.toString().padStart(2, "0")}
          </h3>
        </div>
      </div>
      <div style="
            margin-top: 34px;
        ">
      :
      </div>
      `
        : ""
    }
      <div style="
            margin: 4px;
        ">
        <p style="font-size: 10px; color: #027DBC">
          Hours
        </p>
        <div style="
              box-shadow: 1px 1px 6px 1px lightgray;
              padding: 4px 8px;
              margin-top: 4px;
          ">
          <h3>
            ${hours.toString().padStart(2, "0")}
          </h3>
        </div>
      </div>
      <div style="
            margin-top: 34px;
        ">
      :
      </div>
      <div style="
            margin: 4px;
        ">
        <p style="font-size: 10px; color: #027DBC">
          Minutes
        </p>
        <div style="
              box-shadow: 1px 1px 6px 1px lightgray;
              padding: 4px 8px;
              margin-top: 4px;
          ">
          <h3>
            ${minutes.toString().padStart(2, "0")}
          </h3>
        </div>
      </div>
      <div style="
            margin-top: 34px;
        ">
      :
      </div>
      <div style="
            margin: 4px;
        ">
        <p style="font-size: 10px; color: #027DBC">
          Seconds
        </p>
        <div style="
              box-shadow: 1px 1px 6px 1px lightgray;
              padding: 4px 8px;
              margin-top: 4px;
          ">
          <h3>
            ${seconds.toString().padStart(2, "0")}
          </h3>
        </div>
      </div>
  </div>
  `;
  return html;
};
export const getPeakHoursDistribution = ({
  empWeekRosters,
  selectedDate,
}: {
  empWeekRosters: IRoster["empWeekRosters"];
  selectedDate: string;
}) => {
  const timeSlots = generateTimeSlots(
    DEFAULT_OPEN_TIME,
    DEFAULT_CLOSE_TIME,
    "",
    30,
  );
  timeSlots.pop();
  let totalHours = 0;
  const timeDistribution = timeSlots.map(({ value }) => {
    let startTime = value;
    let endTime = moment(value, "HH:mm:ss")
      .add({
        minutes: 30,
      })
      .format("HH:mm:ss");
    let x = 0;
    empWeekRosters.forEach(({ days }) => {
      const day = days.find(({ date }) => date === selectedDate);
      if (day) {
        const main = day.main ? day.main : [];
        const others = day.others ? day.others : [];
        if (main?.length) {
          main.forEach(({ s, e }) => {
            if (s <= startTime && endTime <= e) {
              x += 1;
              totalHours += 30;
            }
          });
        }
      }
    });
    return {
      startTime,
      endTime,
      x,
    };
  });
};
export const sortByFunc = (
  a: any,
  b: any,
  sortBy: string,
  sortMethodAsc: boolean,
) => {
  if (sortBy) {
    if (typeof a[sortBy] == "number" || typeof b[sortBy] == "number") {
      let first = a[sortBy] ? Number(a[sortBy]) : 0;
      let second = b[sortBy] ? Number(b[sortBy]) : 0;
      if (sortMethodAsc) {
        return first - second;
      }
      return second - first;
    } else {
      let first = a[sortBy] ? String(a[sortBy]) : "";
      let second = b[sortBy] ? String(b[sortBy]) : "";
      if (sortMethodAsc) {
        return first.localeCompare(second);
      }
      return second.localeCompare(first);
    }
  } else {
    return 0;
  }
};
export const getWorkSummary = (props: {
  fromDate: string;
  toDate: string;
  calenderHours: ICalenderHour[];
}) => {
  const { calenderHours, fromDate, toDate } = props;
  let totalHours = 0;
  let relHours = 0;
  let planHours = 0;
  let wHolidays = 0;
  let weekOffs = 0;
  let leaves = 0;
  if (calenderHours?.length) {
    const today = moment().startOf("day");

    calenderHours
      .filter(
        ({ date }) =>
          moment(date).unix() >= moment(fromDate).unix() &&
          moment(date).unix() <= moment(toDate).unix(),
      )
      .forEach(({ date, hours, status }) => {
        if (
          ["WORKING", "WORKING_HOLIDAY", "BLANK", "HOLIDAY"].includes(status)
        ) {
          totalHours += hours || 0;
          if (status === "WORKING_HOLIDAY") {
            wHolidays += 1;
          }

          if (moment(date).unix() < today.unix()) {
            relHours += hours || 0;
          } else {
            planHours += hours || 0;
          }
        }
        if (["LEAVE"].includes(status)) {
          leaves += 1;
        }
        if (["WEEK_OFF"].includes(status)) {
          weekOffs += 1;
        }
      });
  }
  return { totalHours, relHours, planHours, wHolidays, weekOffs, leaves };
};
export const findRosterCell = (days: IRosterDay[], date: string) => {
  if (!days || !date || days.length === 0) {
    return undefined;
  }

  const temp = days.find((obj) => obj.date === date) ?? undefined;
  if (temp) {
    return temp;
  }
  return undefined;
};
export const isShiftOverlap = (props: {
  startTime: string;
  endTime: string;
  clusterId: number;
  id?: number;
  deleted?: boolean;
  shifts: {
    startTime: string;
    endTime: string;
    clusterId: number;
    id: null | number;
  }[];
}) => {
  const { startTime, endTime, clusterId, id, deleted, shifts } = props;
  let isConflicting = false;
  let message = "";
  if (shifts?.length) {
    shifts
      .filter((shift) => shift.clusterId === clusterId)
      .filter((shift) => (id && shift.id ? shift.id !== id : true))
      .forEach((shift) => {
        if (
          startTime < shift.endTime &&
          endTime > shift.startTime &&
          !deleted
        ) {
          isConflicting = true;
          message =
            "The shift you are trying to add overlaps with one or more existing shifts within the same cluster. Please adjust the timing to avoid conflicts.";
        }
      });
  }
  return { isConflicting, message };
};
export const getCellNewStatus = (status: string) => {
  if (status === "HOLIDAY") {
    return "WORKING_HOLIDAY";
  }
  if (status === "BLANK") {
    return "WORKING";
  }
  return status;
};

export const getShiftStatusV2 = (props: {
  currentShift: {
    startTime: string;
    endTime: string;
    type: IRosterHookProps["rosterType"];
  };
  main: IRosterDay["main"];
  others: IRosterDay["others"];
  misc: IRosterDay["misc"];
  secondaryMisc?: IRosterDetails["data"]["secondaryMisc"];
  isPartTime?: boolean;
}) => {
  const { currentShift, main, misc, others, secondaryMisc, isPartTime } = props;
  //
  let isShiftDisabled = false;
  //
  let isShiftMaxDurationExceed = false;
  //
  let isConflictWithPrimary = false;
  let isConflictWithSecondary = false;
  let isConflictWithMisc = false;

  let disabledReason = "";
  let error = "";
  let duration = 0;
  let durationWithoutCurrentShift = 0;
  // console.log(
  //   `currentShift => ${convertTime(currentShift.startTime)} - ${convertTime(
  //     currentShift.endTime
  //   )}`
  // );
  //
  const allShifts = [
    ...(main || []),
    ...(others || []),
    ...(misc || []),
    ...(secondaryMisc || []),
  ];
  //
  const isLunchExist = getIsLunchExist({
    main: main || [],
    misc: [...(misc || []), ...(secondaryMisc || [])],
    others: others || [],
  });
  duration = calculateTotalShiftDuration([
    ...allShifts,
    {
      s: currentShift.startTime,
      e: currentShift.endTime,
      c: "",
    },
  ]).totalDurationInHours;
  durationWithoutCurrentShift = calculateTotalShiftDuration([
    ...allShifts,
  ]).totalDurationInHours;
  const maxDurationLimit = isLunchExist
    ? isPartTime
      ? MAX_SHIFT_WITH_LUNCH_PART_TIMER
      : MAX_SHIFT_WITH_LUNCH
    : durationWithoutCurrentShift > MAX_SHIFT_WITH_LUNCH - LUNCH_INCLUDE
      ? isPartTime
        ? MAX_SHIFT_WITHOUT_LUNCH_PART_TIMER
        : MAX_SHIFT_WITHOUT_LUNCH
      : isPartTime
        ? MAX_SHIFT_WITH_LUNCH_PART_TIMER
        : MAX_SHIFT_WITH_LUNCH;

  // console.log(isLunchExist);

  // Max Duration check

  if (duration > maxDurationLimit) {
    isShiftDisabled = true;
    isShiftMaxDurationExceed = true;
    disabledReason = `Adding this shift will exceed the daily work hour limit of ${maxDurationLimit}hr.`;
    error = `Adding this new shift, will increase the maximum daily work hour limit of ${maxDurationLimit}hr. Please choose a different shift interval timing.`;
  }

  if (
    currentShift.type === "primary" ||
    currentShift.type === "secondary" ||
    currentShift.type === "secondaryMisc"
  ) {
    //
    if (main?.length) {
      //
      main.forEach(({ s, e }) => {
        // Conflicting check
        if (currentShift.startTime < e && currentShift.endTime > s) {
          isShiftDisabled = true;
          isConflictWithPrimary = true;
          disabledReason =
            "This shift you are trying to add overlaps with one or more shifts";
          error =
            "This shift you are trying to add overlaps with an existing shift. Please choose a different shift interval timing.";
        }
        // Checked shift should enable by default
        if (currentShift.startTime === s && currentShift.endTime === e) {
          isShiftDisabled = false;
          isConflictWithPrimary = false;
          disabledReason = "";
        }
      });
    }
    if (others?.length && currentShift.type !== "secondaryMisc") {
      others.forEach(({ s, e }) => {
        if (currentShift.startTime < e && currentShift.endTime > s) {
          isShiftDisabled = true;
          isConflictWithSecondary = true;
          disabledReason =
            "This shift you are trying to add overlaps with one or more pre-existing secondary shifts";
          error =
            "This shift you are trying to add overlaps with a pre-existing secondary shift. Please choose a different shift interval timing.";
        }
      });
    }
    if (currentShift.type === "secondaryMisc") {
      if (secondaryMisc?.length) {
        secondaryMisc.forEach(({ s, e }) => {
          if (currentShift.startTime < e && currentShift.endTime > s) {
            isConflictWithMisc = true;
            error =
              "This shift you are trying to add overlaps with a pre-existing miscellaneous shift. Please choose a different shift interval timing.";
          }
        });
      }
    }
  }
  if (currentShift.type === "misc") {
    if (others?.length) {
      others.forEach(({ s, e }) => {
        if (currentShift.startTime < e && currentShift.endTime > s) {
          isConflictWithSecondary = true;
          error =
            "This shift you are trying to add overlaps with a pre-existing secondary shift. Please choose a different shift interval timing.";
        }
      });
    }
    if (misc?.length) {
      misc.forEach(({ s, e }) => {
        if (currentShift.startTime < e && currentShift.endTime > s) {
          isConflictWithMisc = true;
          error =
            "This shift you are trying to add overlaps with a pre-existing miscellaneous shift. Please choose a different shift interval timing.";
        }
      });
    }
  }

  if (currentShift.type === "secondary" && isShiftDisabled) {
    isShiftDisabled = false;
    disabledReason = "";
  }

  return {
    isShiftDisabled,
    disabledReason,
    error,
    isShiftMaxDurationExceed,
    isConflictWithPrimary,
    isConflictWithSecondary,
    isConflictWithMisc,
  };
};
export const isRosterAboutToFreeze = (props: {
  payrollConfig: IPayrollConfig;
}) => {
  const { payrollConfig } = props;
  let visible = false;
  if (payrollConfig) {
    const today = moment();
    const currentPEndDateTime = moment(payrollConfig.currentPEndDateTime);
    if (
      currentPEndDateTime.year() === today.year() &&
      currentPEndDateTime.month() === today.month() &&
      currentPEndDateTime.date() === today.date() &&
      currentPEndDateTime.diff(today, "hour") <= 3
    ) {
      visible = true;
    }
  }
  return visible;
};
export const isFutureDate = (effectiveDate: Date) => {
  effectiveDate.setHours(0, 0, 0, 0);
  let today = new Date();
  let todayMorningDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  if (effectiveDate.getTime() >= todayMorningDate.getTime()) {
    return true;
  }
  return false;
};
export const isFutureWeek = (props: {
  selectedWeek: number;
  selectedYear: number;
  currentPStartDateTime: string;
}) => {
  const { selectedWeek, selectedYear, currentPStartDateTime } = props;
  const selectedWeekLastDate = moment()
    .set({
      year: selectedYear,
      week: selectedWeek,
    })
    .endOf("week")
    .set({ h: 0, m: 0, s: 0 });
  const currentPStartDate = moment(currentPStartDateTime);
  return selectedWeekLastDate >= currentPStartDate;
};
export const currencyConverter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export const removeDSI = (key: string) => {
  return key.replaceAll("DSI ", "");
};
export const downloadExcelFromJSON = (data: any[], name: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  XLSX.writeFile(workbook, `${name}.xlsx`);
};
export const formatChartLabel = (props: {
  absolute?: boolean;
  attached?: string;
  value: any;
  currency?: boolean;
  disabled?: boolean;
}) => {
  const { absolute, attached, value = 0, currency, disabled } = props;
  const newValue = Number(Number(value || 0).toFixed(2));
  return disabled && !currency
    ? `${newValue}`
    : currency
      ? `${currencyConverter.format(newValue)}`
      : absolute
        ? `${newValue}${attached ? `${attached}` : ""}`
        : `${newValue}%`;
};
export const getFinalMonthListing = (props: {
  sDate: string;
  eDate: string;
  disabledAfter?: string;
  minDate?: string;
  maxDate?: string;
}) => {
  const { sDate, eDate, disabledAfter, maxDate, minDate } = props;
  const startDate = moment(sDate).get("D");
  const endDate = moment(eDate).get("D");
  const { listing, selectedYearMonth } = generateMonthsListing({
    count: 16,
    endDate,
    startDate,
    disabledAfter,
    maxDate,
    minDate,
  });
  return { listing, selectedYearMonth };
};
export const renderPlaceholder = (selected: Option[]) => {
  if (selected?.length) {
    if (selected.length === 1) {
      return `${selected[0].label}`;
    }
    return `${selected[0].label} + ${selected.length - 1} more`;
  }
  return "";
};

export const getDates = (props: {
  payrollConfig: IPayrollConfig;
  selectedYearMonth: string;
  selectedFilter: string;
  currentYear: number;
  currentMonth: number;
  customFromDate: string;
  customToDate: string;
}) => {
  const {
    currentMonth,
    currentYear,
    payrollConfig,
    selectedFilter,
    selectedYearMonth,
    customFromDate,
    customToDate,
  } = props;
  let fromDate: Moment | undefined;
  let toDate: Moment | undefined;
  switch (selectedFilter) {
    case FILTERS[0].value:
      if (selectedYearMonth && payrollConfig) {
        const startDate = moment(payrollConfig.currentPStartDateTime).get("D");
        const endDate = moment(payrollConfig.currentPEndDateTime).get("D");
        fromDate = moment(
          `${
            selectedYearMonth.split("_")[1] === "00"
              ? Number(selectedYearMonth.split("_")[0]) - 1
              : selectedYearMonth.split("_")[0]
          }-${
            selectedYearMonth.split("_")[1] === "00"
              ? "12"
              : selectedYearMonth.split("_")[1]
          }-${startDate.toString().padStart(2, "0")}`,
        );
        toDate = moment(
          `${
            selectedYearMonth.split("_")[1] === "00"
              ? Number(selectedYearMonth.split("_")[0]) - 1
              : selectedYearMonth.split("_")[0]
          }-${
            selectedYearMonth.split("_")[1] === "00"
              ? "12"
              : selectedYearMonth.split("_")[1]
          }-${endDate.toString().padStart(2, "0")}`,
        ).add({
          month: 1,
        });
      }

      break;
    case FILTERS[1].value:
      fromDate = moment(`${currentYear}-${currentMonth + 1}-${1}`);

      fromDate = fromDate.startOf("month");
      toDate = fromDate.clone().endOf("month");
      break;
    case FILTERS[2].value:
      if (customFromDate && customToDate) {
        fromDate = moment(customFromDate);
        toDate = moment(customToDate);
      }
      break;

    default:
      break;
  }
  return { fromDate, toDate };
};
