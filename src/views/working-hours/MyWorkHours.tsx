import { Badge, Flex, Grid, Text, Tooltip, useBoolean } from "@chakra-ui/react";
import moment from "moment";
import { useEffect, useState } from "react";
import { BsCalendar2Event, BsInfoCircle, BsTable } from "react-icons/bs";
import { useAppSelector } from "../../app/store/store";
import AppContainer from "../../components/AppContainer";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import AppQuickFilterChips from "../../components/AppQuickFilterChips";
import AppTabs from "../../components/AppTabs";
import { ENDPOINT } from "../../config/endpoint.config";
import { DAYS, FILTERS } from "../../helper/Constant";
import { ICalenderHour, IMyWorkHours } from "../../helper/Interface";
import {
  createDates,
  getDateFromString,
  getDates,
  getWorkSummary,
} from "../../helper/Utils";
import { useApi } from "../../hooks/useApi";
import CustomCircle from "../leave/CustomCircle";
import {
  HOLIDAY_COLOR,
  LEAVE_COLOR,
  WEEK_OFF_COLOR,
} from "../../hooks/useCalender";
import { useService } from "../../hooks/useService";

import CalenderRow from "../roster/common/CalenderRow";
import DateSelection from "../roster/common/DateSelection";
import MonthSwitcher from "../roster/common/MonthSwitcher";
import Badges from "./Badges";
//
import MyHoursInfo from "./MyHoursInfo";

const TABSMyWork = [
  {
    name: "Summarized View",
    value: "Tabular_View",
    icon: <BsTable />,
    index: 0,
  },
  {
    name: "Calendar View",
    value: "Calendar_View",
    icon: <BsCalendar2Event />,
    index: 1,
  },
];
function MyWorkHours() {
  const [view, setView] = useState(TABSMyWork[0].value);

  const { get } = useApi();
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const { user, selectedCostCenterName } = useAppSelector(
    (state) => state.auth,
  );
  const {
    payrollConfig,

    setCurrentYear,

    weeks,
    customFromDate,
    currentYear,
    getMonthListing,
    selectedYearMonth: selectedYearMonthMW,

    customToDate,
    getPayrollConfig: getPayrollConfigMW,
    weeksInCurrentMonth,
    setWeeksInCurrentMonth,
    setCalender,
    onPrevMonth,
    onNextMonth,
    calender,
    getWeeks,
    selectedFilter,
    setCurrentMonth,
    setCustomFromDate,
    setCustomToDate,
    setSelectedYearMonth,
    setSelectedFilter: setSelectedFilterMW,
    currentMonth: currentMonthMW,

    yearMonthListing: yearMonthListingMW,
  } = useService();
  const [myWorkHours, setMyWorkHours] = useState<IMyWorkHours>();

  const [calenderHours, setCalenderHours] = useState<ICalenderHour[]>([]);
  const [workSummary, setWorkSummaryMW] = useState<{
    totalHours: number;
    relHours: number;
    planHours: number;
    wHolidays: number;
    weekOffs: number;
    leaves: number;
  }>();

  useEffect(() => {
    getPayrollConfigMW();
  }, []);
  useEffect(() => {
    if (currentYear) {
      getWeeks(currentYear);
    }
  }, [currentYear]);

  useEffect(() => {
    if (payrollConfig) {
      getMonthListing();
    }
  }, [payrollConfig]);

  useEffect(() => {
    if (
      selectedYearMonthMW &&
      view &&
      view === TABSMyWork[0].value &&
      (selectedFilter === FILTERS[2].value
        ? customFromDate && customToDate
        : true)
    ) {
      getMyHours();
    }
  }, [
    selectedYearMonthMW,
    view,
    selectedFilter,
    currentMonthMW,
    currentYear,
    customFromDate,
    customToDate,
  ]);
  const getMyHours = async () => {
    if (!payrollConfig) return;
    setMyWorkHours(undefined);
    onLoading();
    const { fromDate, toDate } = getDates({
      currentMonth: currentMonthMW,
      currentYear,
      customFromDate,
      customToDate,
      payrollConfig,
      selectedFilter,
      //
      selectedYearMonth: selectedYearMonthMW,
    });
    const res = await get<IMyWorkHours>(
      ENDPOINT["/hours"]["/my-work-hours"] + `/${user?.empId}`,
      {
        params: {
          costCentre: selectedCostCenterName,
          fromDate: fromDate?.format("YYYY-MM-DD"),
          toDate: toDate?.format("YYYY-MM-DD"),
          type: selectedFilter,
        },
      },
    );
    offLoading();
    setMyWorkHours(res);
  };
  useEffect(() => {
    if (view && view === TABSMyWork[1].value) {
      createCalenderMW();
    }
  }, [currentMonthMW, currentYear, view]);

  const createCalenderMW = () => {
    if (user?.empId) {
      const { calender, weeksInCurrentMonth, startDate, endDate } = createDates(
        currentYear,
        currentMonthMW,
      );
      setWeeksInCurrentMonth(weeksInCurrentMonth);
      setCalender(calender);
      getEmpCalenderHours({
        empId: user?.empId,
        fromDate: startDate,
        toDate: endDate,
      });
    }
  };
  const getEmpCalenderHours = async ({
    fromDate,
    toDate,
    empId,
  }: {
    fromDate: string;
    toDate: string;
    empId: string;
  }) => {
    setCalenderHours([]);
    const res = await get<ICalenderHour[]>(
      ENDPOINT["/hours"]["/emp-calender-hours"] + `/${empId}`,
      {
        params: {
          startDate: fromDate,
          endDate: toDate,
        },
      },
    );

    if (res && res.length) {
      setCalenderHours(res);
    } else {
      setCalenderHours([]);
    }
  };
  useEffect(() => {
    if (calenderHours && calender?.length) {
      setWorkSummaryMW(
        getWorkSummary({
          calenderHours,
          fromDate: moment(calender[14].date)
            .startOf("month")
            .format("YYYY-MM-DD"),
          toDate: moment(calender[14].date).endOf("month").format("YYYY-MM-DD"),
        }),
      );
    }
  }, [calenderHours]);

  return (
    <AppContainer
      heading="My Work Hours"
      info="This page showcases your Published Working Hours, number of Working Holidays and Number of Leave Without Pay (LOP) days. You can view this information in an summarized manner in Summarized View or explore it day-by-day in the Calendar View."
    >
      <AppTabs setValue={setView} value={view} tabs={TABSMyWork} />
      {view === TABSMyWork[0].value ? (
        <>
          <AppQuickFilterChips
            filters={FILTERS}
            setSelectedFilters={() => {}}
            onClick={(filter) => setSelectedFilterMW(filter)}
            selectedFilters={[selectedFilter]}
          >
            <Flex alignItems={"center"}>
              <DateSelection
                currentMonth={currentMonthMW}
                currentYear={currentYear}
                customFromDate={customFromDate}
                customToDate={customToDate}
                selectedFilter={selectedFilter}
                selectedYearMonth={selectedYearMonthMW}
                setCurrentMonth={setCurrentMonth}
                setCurrentYear={setCurrentYear}
                setCustomFromDate={setCustomFromDate}
                setCustomToDate={setCustomToDate}
                setSelectedYearMonth={setSelectedYearMonth}
                yearMonthListing={yearMonthListingMW}
              />
            </Flex>
          </AppQuickFilterChips>
          {myWorkHours ? (
            <>
              {myWorkHours.status !== "NOT_PRESENT" ? (
                <Flex
                  mt={"4"}
                  direction={"column"}
                  style={{
                    marginBottom: 16,
                    overflow: "hidden",
                  }}
                >
                  {myWorkHours.status === "FINALISED" ? (
                    <Flex
                      justifyContent={"space-between"}
                      alignItems={"center"}
                    >
                      <Text fontWeight={"bold"}>
                        {`WORK HOURS:`}
                        <Badge ml={"2"} variant={"subtle"} color={"#359735"}>
                          FINALISED
                        </Badge>
                      </Text>
                    </Flex>
                  ) : null}

                  {!myWorkHours.finalized && myWorkHours.tempCalculation ? (
                    <Grid
                      gridTemplateColumns={"1fr 1fr"}
                      width={"full"}
                      gap={"8"}
                      p={"2"}
                    >
                      <Flex direction={"column"}>
                        <Text
                          fontSize={"xs"}
                          fontWeight={"medium"}
                          mb={"2"}
                          fontStyle={"italic"}
                        >
                          WORKING HOURS
                        </Text>
                        <Flex>
                          <Flex
                            width={"50%"}
                            p={"4"}
                            mr={"4"}
                            rounded={"md"}
                            border={"1px solid"}
                            borderColor={"#e7e7e7"}
                            boxShadow={"md"}
                            direction={"column"}
                            textAlign={"center"}
                            justifyContent={"center"}
                            background={
                              "radial-gradient(circle at 10% 50%, #027dbc0d 0%, #027dbc33 90%)"
                            }
                          >
                            <Text
                              fontSize={"md"}
                              fontWeight={"medium"}
                              color={"gray.600"}
                              mb={"1"}
                              display={"flex"}
                              justifyContent={"center"}
                              alignItems={"center"}
                            >
                              Total Working Hours
                              <Tooltip
                                hasArrow
                                label={
                                  "Total number of published working hours in the selected date range"
                                }
                              >
                                <Text ml={"2"}>
                                  <BsInfoCircle fontSize={"14px"} />
                                </Text>
                              </Tooltip>
                            </Text>
                            <Text fontSize={"2xl"} fontWeight={"medium"}>
                              {myWorkHours.tempCalculation.totalHours}
                            </Text>
                          </Flex>
                          <Flex direction={"column"} width={"50%"}>
                            <Flex
                              p={"4"}
                              mb={"4"}
                              rounded={"md"}
                              border={"1px solid"}
                              borderColor={"#e7e7e7"}
                              direction={"column"}
                              alignItems={"center"}
                              justifyContent={"space-between"}
                              boxShadow={"md"}
                            >
                              <Text
                                fontSize={"xs"}
                                fontWeight={"medium"}
                                color={"gray.500"}
                                display={"flex"}
                                justifyContent={"center"}
                                alignItems={"center"}
                              >
                                Realised Working Hours
                                <Tooltip
                                  hasArrow
                                  label={
                                    "Total number of published working hours realized from start of selected date range upto yesterday"
                                  }
                                >
                                  <Text ml={"2"}>
                                    <BsInfoCircle fontSize={"14px"} />
                                  </Text>
                                </Tooltip>
                              </Text>
                              <Text fontSize={"lg"} fontWeight={"medium"}>
                                {myWorkHours.tempCalculation.realisedHours}
                              </Text>
                            </Flex>
                            <Flex
                              p={"4"}
                              rounded={"md"}
                              border={"1px solid"}
                              borderColor={"#e7e7e7"}
                              direction={"column"}
                              alignItems={"center"}
                              justifyContent={"space-between"}
                              boxShadow={"md"}
                            >
                              <Text
                                fontSize={"xs"}
                                fontWeight={"medium"}
                                color={"gray.500"}
                                display={"flex"}
                                justifyContent={"center"}
                                alignItems={"center"}
                              >
                                Planned Working Hours
                                <Tooltip
                                  hasArrow
                                  label={
                                    "Total number of published working hours planned from today until the end of the selected date range"
                                  }
                                >
                                  <Text ml={"2"}>
                                    <BsInfoCircle fontSize={"14px"} />
                                  </Text>
                                </Tooltip>
                              </Text>
                              <Text fontSize={"lg"} fontWeight={"medium"}>
                                {myWorkHours.tempCalculation.plannedHours}
                              </Text>
                            </Flex>
                          </Flex>
                        </Flex>
                      </Flex>
                      <Flex direction={"column"}>
                        <Text
                          fontSize={"xs"}
                          fontWeight={"medium"}
                          mb={"2"}
                          fontStyle={"italic"}
                        >
                          WORKING HOLIDAYS
                        </Text>
                        <Flex>
                          <Flex
                            width={"50%"}
                            p={"4"}
                            mr={"4"}
                            rounded={"md"}
                            border={"1px solid"}
                            borderColor={"#e7e7e7"}
                            boxShadow={"md"}
                            background={
                              "radial-gradient(circle at 10% 50%, #f297270d 0%, #f2972733 90%)"
                            }
                            textAlign={"center"}
                            justifyContent={"center"}
                            direction={"column"}
                          >
                            <Text
                              fontSize={"md"}
                              fontWeight={"medium"}
                              color={"gray.600"}
                              mb={"1"}
                              display={"flex"}
                              justifyContent={"center"}
                              alignItems={"center"}
                            >
                              Total Working Holidays
                              <Tooltip
                                hasArrow
                                label={
                                  "Total number of working holidays (holidays on which work was done) in the selected date range"
                                }
                              >
                                <Text ml={"2"}>
                                  <BsInfoCircle fontSize={"14px"} />
                                </Text>
                              </Tooltip>
                            </Text>
                            <Text fontSize={"2xl"} fontWeight={"medium"}>
                              {Number(
                                myWorkHours.tempCalculation.realisedWh || 0,
                              ) +
                                Number(
                                  myWorkHours.tempCalculation.plannedWh || 0,
                                )}
                            </Text>
                          </Flex>
                          <Flex direction={"column"} width={"50%"}>
                            <Flex
                              p={"4"}
                              mb={"4"}
                              rounded={"md"}
                              border={"1px solid"}
                              borderColor={"#e7e7e7"}
                              boxShadow={"md"}
                              direction={"column"}
                              alignItems={"center"}
                              justifyContent={"space-between"}
                            >
                              <Text
                                fontSize={"xs"}
                                fontWeight={"medium"}
                                color={"gray.500"}
                                display={"flex"}
                                justifyContent={"center"}
                                alignItems={"center"}
                              >
                                Realised Working Holidays
                                <Tooltip
                                  hasArrow
                                  label={
                                    "Total number of working holidays realized from start of selected date range upto yesterday"
                                  }
                                >
                                  <Text ml={"2"}>
                                    <BsInfoCircle fontSize={"14px"} />
                                  </Text>
                                </Tooltip>
                              </Text>
                              <Text fontSize={"lg"} fontWeight={"medium"}>
                                {myWorkHours.tempCalculation.realisedWh}
                              </Text>
                            </Flex>
                            <Flex
                              p={"4"}
                              rounded={"md"}
                              border={"1px solid"}
                              borderColor={"#e7e7e7"}
                              boxShadow={"md"}
                              direction={"column"}
                              alignItems={"center"}
                              justifyContent={"space-between"}
                            >
                              <Text
                                fontSize={"xs"}
                                fontWeight={"medium"}
                                color={"gray.500"}
                                display={"flex"}
                                justifyContent={"center"}
                                alignItems={"center"}
                              >
                                Planned Working Holidays
                                <Tooltip
                                  hasArrow
                                  label={
                                    "Total number of working holidays planned from today until the end of the selected date range"
                                  }
                                >
                                  <Text ml={"2"}>
                                    <BsInfoCircle fontSize={"14px"} />
                                  </Text>
                                </Tooltip>
                              </Text>
                              <Text fontSize={"lg"} fontWeight={"medium"}>
                                {myWorkHours.tempCalculation.plannedWh}
                              </Text>
                            </Flex>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Grid>
                  ) : (
                    <Grid
                      gridTemplateColumns={"1fr 1fr 1fr 1fr 1fr"}
                      width={"full"}
                      gap={"8"}
                      mt={"4"}
                      p={"2"}
                      textAlign={"center"}
                    >
                      <Flex
                        p={"4"}
                        rounded={"md"}
                        border={"1px solid"}
                        borderColor={"#e7e7e7"}
                        boxShadow={"md"}
                        direction={"column"}
                      >
                        <Text
                          fontSize={"md"}
                          fontWeight={"medium"}
                          color={"gray.600"}
                          display={"flex"}
                          justifyContent={"center"}
                          alignItems={"center"}
                        >
                          Working Hours
                          <Tooltip
                            hasArrow
                            label={
                              "The total working hours finalized in the selected payroll cycle according to the created roster"
                            }
                          >
                            <Text ml={"2"}>
                              <BsInfoCircle fontSize={"14px"} />
                            </Text>
                          </Tooltip>
                        </Text>
                        <Text fontSize={"2xl"} fontWeight={"medium"}>
                          {myWorkHours.fnumHours}
                        </Text>
                      </Flex>
                      <Flex
                        p={"4"}
                        rounded={"md"}
                        border={"1px solid"}
                        borderColor={"#e7e7e7"}
                        boxShadow={"md"}
                        direction={"column"}
                        background={
                          "radial-gradient(circle at 10% 50%, #fbe1e1 0%, #e6d3d3 90%)"
                        }
                      >
                        <Text
                          fontSize={"md"}
                          fontWeight={"medium"}
                          color={"gray.600"}
                          display={"flex"}
                          justifyContent={"center"}
                          alignItems={"center"}
                        >
                          Manual Hours
                          <Tooltip
                            hasArrow
                            label={
                              "The total hours manually added by the store leader after payroll cycle freezing in the selected payroll cycle"
                            }
                          >
                            <Text ml={"2"}>
                              <BsInfoCircle fontSize={"14px"} />
                            </Text>
                          </Tooltip>
                        </Text>
                        <Text fontSize={"2xl"} fontWeight={"medium"}>
                          {myWorkHours.fmanualHours}
                        </Text>
                      </Flex>
                      <Flex
                        p={"4"}
                        rounded={"md"}
                        border={"1px solid"}
                        borderColor={"#e7e7e7"}
                        boxShadow={"md"}
                        direction={"column"}
                        background={
                          "radial-gradient(circle at 10% 50%, #027dbc0d 0%, #027dbc1a 90%)"
                        }
                      >
                        <Text
                          fontSize={"md"}
                          fontWeight={"medium"}
                          color={"gray.600"}
                          display={"flex"}
                          justifyContent={"center"}
                          alignItems={"center"}
                        >
                          Total Hours
                          <Tooltip
                            hasArrow
                            label={
                              "The total number of hours obtained by combining rostered and manual hours in the selected payroll cycle"
                            }
                          >
                            <Text ml={"2"}>
                              <BsInfoCircle fontSize={"14px"} />
                            </Text>
                          </Tooltip>
                        </Text>
                        <Text fontSize={"2xl"} fontWeight={"medium"}>
                          {(myWorkHours.fnumHours || 0) +
                            (myWorkHours.fmanualHours || 0)}
                        </Text>
                      </Flex>
                      <Flex
                        p={"4"}
                        rounded={"md"}
                        border={"1px solid"}
                        borderColor={"#e7e7e7"}
                        boxShadow={"md"}
                        direction={"column"}
                        background={
                          "radial-gradient(circle at 10% 50%, #f297270d 0%, #f297271a 90%)"
                        }
                      >
                        <Text
                          fontSize={"md"}
                          fontWeight={"medium"}
                          color={"gray.600"}
                          display={"flex"}
                          justifyContent={"center"}
                          alignItems={"center"}
                        >
                          Working Holidays
                          <Tooltip
                            hasArrow
                            label={
                              "The number of working holidays in the selected payroll cycle"
                            }
                          >
                            <Text ml={"2"}>
                              <BsInfoCircle fontSize={"14px"} />
                            </Text>
                          </Tooltip>
                        </Text>
                        <Text fontSize={"2xl"} fontWeight={"medium"}>
                          {myWorkHours.fnumWorkingHolidays}
                        </Text>
                      </Flex>
                      <Flex
                        p={"4"}
                        rounded={"md"}
                        border={"1px solid"}
                        borderColor={"#e7e7e7"}
                        boxShadow={"md"}
                        direction={"column"}
                        background={
                          "radial-gradient(circle at 10% 50%, #c1e1c20d 0%, #c1e1c21a 90%)"
                        }
                      >
                        <Text
                          fontSize={"md"}
                          fontWeight={"medium"}
                          color={"gray.600"}
                          display={"flex"}
                          justifyContent={"center"}
                          alignItems={"center"}
                        >
                          LOP's
                          <Tooltip
                            hasArrow
                            label={
                              "The number of LOP days in the selected payroll cycle"
                            }
                          >
                            <Text ml={"2"}>
                              <BsInfoCircle fontSize={"14px"} />
                            </Text>
                          </Tooltip>
                        </Text>
                        <Text fontSize={"2xl"} fontWeight={"medium"}>
                          {myWorkHours.fnumLop}
                        </Text>
                      </Flex>
                    </Grid>
                  )}
                </Flex>
              ) : (
                <AppNoData msg={myWorkHours?.message || ""} />
              )}
            </>
          ) : isLoading ? (
            <AppLoader />
          ) : (
            <AppNoData />
          )}
        </>
      ) : (
        <Flex>
          <Flex
            border={"1px solid #eaeaea"}
            width={"fit-content"}
            rounded={"md"}
            direction={"column"}
            background={"#F8F8F8"}
            p={"2"}
            height={"fit-content"}
          >
            <MonthSwitcher
              currentMonth={currentMonthMW}
              currentYear={currentYear}
              setCurrentMonth={setCurrentMonth}
              setCurrentYear={setCurrentYear}
              onPrevMonth={onPrevMonth}
              onNextMonth={onNextMonth}
            />
            <Flex direction={"column"} mb={"2"} rounded={"md"}>
              <CalenderRow />
              {calender?.length && weeks?.length ? (
                <Flex direction={"column"}>
                  {new Array(weeksInCurrentMonth).fill(1).map((key, i) => {
                    const firstDayMW = calender.find(
                      ({ row, column }) => row === i && column === 0,
                    );
                    if (firstDayMW) {
                      const { date } = firstDayMW;

                      const weekMW = weeks.find(
                        ({ startDate }) =>
                          getDateFromString(startDate).getTime() ===
                          date.getTime(),
                      );

                      return (
                        <Flex key={weekMW?.id}>
                          <Flex
                            width={"70px"}
                            m={"0.5px"}
                            background={"white"}
                            boxShadow={"sm"}
                            mr={"2"}
                            p={"0.5"}
                          >
                            <Text
                              fontSize={"xs"}
                              fontWeight={"medium"}
                              color={"gray.500"}
                            >
                              {weekMW ? weekMW.number : "--"}
                            </Text>
                          </Flex>
                          {DAYS.map((_, j) => {
                            const currentDayMW = calender.find(
                              ({ row, column }) => row === i && column === j,
                            );
                            if (currentDayMW) {
                              const {
                                date,
                                holiday,
                                today,
                                roster,
                                leaveId,
                                weekOff,
                              } = currentDayMW;
                              const calenderHourMW = calenderHours.find(
                                (obj) =>
                                  moment(date).format("YYYY-MM-DD") ===
                                  obj.date,
                              );

                              return (
                                <Tooltip
                                  isDisabled={
                                    !holiday && !leaveId && !roster && !weekOff
                                  }
                                  hasArrow
                                  key={date.toString()}
                                  // label={
                                  //   holiday
                                  //     ? holiday
                                  //     : leaveId
                                  //     ? "On Leave"
                                  //     : appliedDates.includes(
                                  //         moment(date).format("YYYY-MM-DD")
                                  //       ) && !weekOffMode
                                  //     ? "Week Off"
                                  //     : roster && !weekOffMode
                                  //     ? "Roster Published"
                                  //     : ""
                                  // }
                                  bg="gray.300"
                                  color="black"
                                  openDelay={500}
                                  id={moment(date).format("DD-MM-yyyy")}
                                >
                                  <Flex
                                    id={moment(date).format("DD-MM-yyyy")}
                                    width={"114px"}
                                    height={"90px"}
                                    m={"0.5px"}
                                    boxShadow={"sm"}
                                    transition={"0.3s"}
                                    position={"relative"}
                                    background={
                                      calenderHourMW?.status === "WEEK_OFF"
                                        ? `${WEEK_OFF_COLOR}66`
                                        : calenderHourMW?.status === "LEAVE"
                                          ? `${LEAVE_COLOR}66`
                                          : calenderHourMW?.status &&
                                              [
                                                "WORKING_HOLIDAY",
                                                "HOLIDAY",
                                              ].includes(calenderHourMW?.status)
                                            ? `${HOLIDAY_COLOR}66`
                                            : calenderHourMW?.status === "NA"
                                              ? "#d3d3d31a"
                                              : "white"
                                    }
                                    opacity={1}
                                    p={"0.5"}
                                  >
                                    <Flex
                                      width={"full"}
                                      transition={"0.3s"}
                                      direction={"column"}
                                    >
                                      <Text
                                        color={
                                          // calender
                                          calender[14].date.getMonth() ===
                                          date.getMonth()
                                            ? "gray.500"
                                            : "gray.300"
                                        }
                                        fontWeight={"normal"}
                                        fontSize={"xs"}
                                      >
                                        {today ? "s" : ""}
                                        {date.getDate()}
                                      </Text>
                                      <Flex
                                        // border={"1px solid"}
                                        borderColor={
                                          calenderHourMW?.status === "WEEK_OFF"
                                            ? WEEK_OFF_COLOR
                                            : calenderHourMW?.status === "LEAVE"
                                              ? LEAVE_COLOR
                                              : calenderHourMW?.status ===
                                                  "WORKING_HOLIDAY"
                                                ? "transparent"
                                                : "white"
                                        }
                                        rounded={"sm"}
                                        mt={"2"}
                                        p={"1"}
                                        justifyContent={"center"}
                                      >
                                        {calenderHourMW?.status &&
                                        ["WEEK_OFF", "LEAVE", "NA"].includes(
                                          calenderHourMW?.status,
                                        ) ? (
                                          <Flex
                                            direction={"column"}
                                            justifyContent={"center"}
                                            alignItems={"center"}
                                            fontWeight={"medium"}
                                            color={"gray.600"}
                                            fontSize={"xs"}
                                          >
                                            <Text>
                                              {calenderHourMW?.status ===
                                              "WEEK_OFF"
                                                ? "Week Off"
                                                : calenderHourMW?.status ===
                                                    "LEAVE"
                                                  ? "Leave"
                                                  : calenderHourMW?.status ===
                                                      "NA"
                                                    ? "NA"
                                                    : ""}
                                            </Text>
                                            {calenderHourMW?.status ===
                                            "LEAVE" ? (
                                              <Text fontSize={"10px"}>
                                                {calenderHourMW.type !==
                                                "GENERAL"
                                                  ? `(${calenderHourMW.type})`
                                                  : ""}
                                              </Text>
                                            ) : null}
                                          </Flex>
                                        ) : null}
                                        {calenderHourMW?.status &&
                                        [
                                          "WORKING",
                                          "WORKING_HOLIDAY",
                                          // WORKING.  HOLIDAY
                                          "BLANK",
                                          "HOLIDAY",
                                        ].includes(calenderHourMW?.status) ? (
                                          <Text
                                            fontWeight={"bold"}
                                            // fontStyle={"italic"}
                                            fontSize={"lg"}
                                            borderBottom={"1px solid lightgray"}
                                            // borderRadius={"50%"}
                                            color={
                                              [
                                                "HOLIDAY",
                                                "WORKING_HOLIDAY",
                                              ].includes(calenderHourMW?.status)
                                                ? HOLIDAY_COLOR
                                                : "#027dbc"
                                            }
                                          >{`${calenderHourMW.hours || 0}`}</Text>
                                        ) : null}
                                      </Flex>

                                      {leaveId ? (
                                        <CustomCircle color={LEAVE_COLOR} />
                                      ) : null}
                                      {holiday ? (
                                        <CustomCircle color={HOLIDAY_COLOR} />
                                      ) : null}
                                      {weekOff ? (
                                        <CustomCircle color={WEEK_OFF_COLOR} />
                                      ) : null}
                                    </Flex>
                                  </Flex>
                                </Tooltip>
                              );
                            } else {
                              // dd
                              return <></>;
                            }
                          })}
                        </Flex>
                      );
                    }
                    return <></>;
                  })}
                </Flex>
              ) : null}
            </Flex>
            <Badges
            // Badgesss
            />
          </Flex>
          {calender?.length && workSummary ? (
            <MyHoursInfo
              // workSummary
              workSummary={workSummary}
            />
          ) : null}
        </Flex>
      )}
    </AppContainer>
  );
}

export default MyWorkHours;
