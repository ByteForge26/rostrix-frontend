import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import AppHeader from "../../components/AppHeader";
import AppSelect from "../../components/AppSelect";
import moment from "moment";
import { DAYS, MAX_WEEK_IN_MONTH, MONTHS } from "../../helper/Constant";
import { addMonths, subDays } from "date-fns";
import { useApi } from "../../hooks/useApi";
import {
  Badge,
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useBoolean,
} from "@chakra-ui/react";
import { useAppSelector } from "../../app/store/store";
import { ENDPOINT } from "../../config/endpoint.config";
import {
  IAffinityRateCell,
  ICalender,
  ICalenderHour,
  IClusterResponse,
  IMyTeamInfo,
  IPayrollConfig,
  IWeekResponse,
} from "../../helper/Interface";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import {
  BsCalendar2Event,
  BsCheck2Square,
  BsChevronDown,
  BsSearch,
  BsTable,
} from "react-icons/bs";
import {
  createDates,
  currencyConverter,
  generateMonthsListing,
  getDateFromString,
  getWorkSummary,
  sortByFunc,
} from "../../helper/Utils";
import AppTabs from "../../components/AppTabs";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import {
  HOLIDAY_COLOR,
  LEAVE_COLOR,
  WEEK_OFF_COLOR,
} from "../../hooks/useCalender";
import CustomCircle from "../leave/CustomCircle";
import CustomBox from "../roster/common/CustomBox";
import AppTableHeadingWithSort from "../../components/AppTableHeadingWithSort";
import AppTableHeading from "../../components/AppTableHeading";
import AppQuickFilterChips from "../../components/AppQuickFilterChips";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { cloneDeep } from "lodash";
import { useService } from "../../hooks/useService";
import MonthSwitcher from "../roster/common/MonthSwitcher";

function StoreAffinityRate() {
  const { post, get } = useApi();
  const { weeks, getWeeks } = useService();
  const [searchKey, setSearchKey] = useState("");
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const { selectedCostCenterName } = useAppSelector((state) => state.auth);
  const [clusters, setClusters] = useState<IClusterResponse[]>([]);
  const [affinityRate, setAffinityRate] = useState<IAffinityRateCell[]>([]);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [calender, setCalender] = useState<ICalender[]>([]);
  const [weeksInCurrentMonth, setWeeksInCurrentMonth] =
    useState(MAX_WEEK_IN_MONTH);
  const [selectedClusterId, setSelectedClusterId] = useState<number>(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [totalAffinityRate, setTotalAffinityRate] = useState(0);

  useEffect(() => {
    if (currentYear) {
      getWeeks(currentYear);
    }
  }, [currentYear]);
  useEffect(() => {
    getAllClusters();
  }, []);

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

  useEffect(() => {
    if (currentYear) {
      createCalender();
    }
  }, [currentMonth, currentYear]);

  const createCalender = () => {
    const { calender, weeksInCurrentMonth, startDate, endDate } = createDates(
      currentYear,
      currentMonth,
    );
    setWeeksInCurrentMonth(weeksInCurrentMonth);
    setCalender(calender);
    setFromDate(startDate);
    setToDate(endDate);
  };

  useEffect(() => {
    if (fromDate && toDate) {
      getAffinityRate();
    }
  }, [fromDate, toDate, selectedClusterId]);

  const getAffinityRate = async () => {
    setAffinityRate([]);
    onLoading();
    const res = await post<IAffinityRateCell[]>(
      ENDPOINT["/analytics"]["/affinity-calender-view"],
      {
        data: {
          costCenters: [selectedCostCenterName],
          fromDate,
          toDate,
          clusterIds: selectedClusterId ? [selectedClusterId] : undefined,
        },
      },
    );
    offLoading();
    if (res.length) {
      setAffinityRate(res);
    } else {
      setAffinityRate([]);
    }
  };
  useEffect(() => {
    if (affinityRate) {
      setTotalAffinityRate(
        Number(
          Number(
            affinityRate.filter(
              ({ date, affinityRate }) =>
                moment(date).month() === currentMonth && affinityRate > 0,
            ).length
              ? affinityRate
                  .filter(({ date }) => moment(date).month() === currentMonth)
                  .reduce((a, b) => a + b.affinityRate, 0) /
                  affinityRate.filter(
                    ({ date, affinityRate }) =>
                      moment(date).month() === currentMonth && affinityRate > 0,
                  ).length
              : 0,
          ).toFixed(2),
        ),
      );
    }
  }, [affinityRate]);

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

  return (
    <AppContainer heading="Store Affinity Rate" info="">
      <AppHeader justifyContentLeft>
        <AppSelect
          value={selectedClusterId}
          onChange={(value) => setSelectedClusterId(value)}
          options={
            clusters?.length
              ? [
                  {
                    id: 0,
                    name: "All Clusters",
                  },
                  ...clusters
                    .filter(({ id }) => id)
                    .sort((a, b) => a.name.localeCompare(b.name)),
                ].map(({ name, id }) => ({
                  label: name,
                  value: id,
                }))
              : []
          }
          placeholder="Select"
        />
      </AppHeader>

      <Flex overflow={"auto"}>
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
            currentMonth={currentMonth}
            currentYear={currentYear}
            setCurrentMonth={setCurrentMonth}
            setCurrentYear={setCurrentYear}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
          />
          <Flex direction={"column"} mb={"2"} rounded={"md"}>
            <Flex>
              {DAYS.map((day) => (
                <Flex
                  key={day}
                  m={"0.5px"}
                  width={"114px"}
                  height={"90px"}
                  background={"white"}
                  boxShadow={"sm"}
                  p={"0.5"}
                >
                  <Text fontSize={"sm"}>{day}</Text>
                </Flex>
              ))}
              <Flex
                width={"180px"}
                height={"90px"}
                background={"gray.50"}
                boxShadow={"sm"}
                m={"0.5px"}
                p={"0.5"}
              >
                <Flex
                  display={"flex"}
                  width={"180px"}
                  justifyContent={"center"}
                  // alignItems={"center"}
                  fontSize={"md"}
                  p={"1"}
                  direction={"column"}
                >
                  <Flex
                    width={"100%"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                  >
                    <Text mr={"1"}>{`Affinity Rate:`}</Text>
                    {isLoading ? (
                      <Spinner />
                    ) : (
                      <Text
                        fontWeight={"bold"}
                        color={
                          totalAffinityRate
                            ? totalAffinityRate >= 90
                              ? `#359735`
                              : totalAffinityRate > 70
                                ? `#FDB833`
                                : "#FF4B3F"
                            : "black"
                        }
                      >{`${totalAffinityRate}%`}</Text>
                    )}
                  </Flex>

                  <Text fontSize={"xs"}>
                    {`( ${moment()
                      .set({
                        year: currentYear,
                        month: currentMonth,
                        date: 1,
                      })
                      .startOf("month")
                      .format("DD MMM")} - ${moment()
                      .set({
                        year: currentYear,
                        month: currentMonth,
                        date: 1,
                      })
                      .endOf("month")
                      .format("DD MMM")} )`}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
            {calender?.length && weeks?.length ? (
              <Flex direction={"column"}>
                {new Array(weeksInCurrentMonth).fill(1).map((key, i) => {
                  let totalObj = {
                    affinityRate: 0,
                    totalHours: 0,
                    totalTurnover: 0,
                    count: 0,
                  };
                  calender
                    .filter(({ row }) => row === i)
                    .forEach(({ date }) => {
                      const obj = affinityRate.find(
                        (obj) => moment(date).format("YYYY-MM-DD") === obj.date,
                      );
                      if (obj && obj.affinityRate > 0) {
                        const { affinityRate, totalHours, totalTurnover } = obj;
                        totalObj.affinityRate += affinityRate;
                        totalObj.totalHours += totalHours;
                        totalObj.totalTurnover += totalTurnover;
                        totalObj.count += 1;
                      }
                    });
                  totalObj.affinityRate = totalObj.count
                    ? (totalObj.affinityRate || 0) / totalObj.count
                    : 0;
                  const firstDay = calender.find(
                    ({ row, column }) => row === i && column === 0,
                  );
                  if (firstDay) {
                    const { date } = firstDay;

                    const week = weeks.find(
                      ({ startDate }) =>
                        getDateFromString(startDate).getTime() ===
                        date.getTime(),
                    );

                    return (
                      <Flex key={week?.id}>
                        {DAYS.map((_, j) => {
                          const currentDay = calender.find(
                            ({ row, column }) => row === i && column === j,
                          );
                          if (currentDay) {
                            const { date } = currentDay;
                            const calenderHour = affinityRate.find(
                              (obj) =>
                                moment(date).format("YYYY-MM-DD") === obj.date,
                            );

                            return (
                              <Tooltip
                                hasArrow
                                key={date.toString()}
                                label={
                                  <Flex
                                    width={"180px"}
                                    p={"0.5"}
                                    direction={"column"}
                                  >
                                    <Text
                                      mt={"0.5"}
                                      textAlign={"center"}
                                      color={"#027DBC"}
                                      fontSize={"xs"}
                                      fontWeight={"medium"}
                                    >{`${moment(date).format(
                                      "DD MMM YYYY",
                                    )}`}</Text>
                                    <Flex
                                      direction={"column"}
                                      p={"1"}
                                      flex={1}
                                      justifyContent={"space-evenly"}
                                    >
                                      {[
                                        {
                                          label: "Affinity Rate:",
                                          value: `${Number(
                                            (calenderHour?.affinityRate || 0)
                                              .toFixed(2)
                                              .toString(),
                                          )}%`,
                                          color: calenderHour?.affinityRate
                                            ? calenderHour.affinityRate >= 90
                                              ? `#359735`
                                              : calenderHour.affinityRate > 70
                                                ? `#FDB833`
                                                : "#FF4B3F"
                                            : "black",
                                        },
                                        {
                                          label: "Total Hours:",
                                          value: Number(
                                            (calenderHour?.totalHours || 0)
                                              .toFixed(2)
                                              .toString(),
                                          ),
                                        },
                                        {
                                          label: "Total TO:",
                                          value: `${currencyConverter.format(
                                            Number(
                                              (calenderHour?.totalTurnover || 0)
                                                .toFixed(2)
                                                .toString(),
                                            ),
                                          )}`,
                                        },
                                      ].map(({ label, value, color }) => {
                                        return (
                                          <Flex
                                            justifyContent={"space-between"}
                                            key={label}
                                            alignItems={"center"}
                                          >
                                            <Text
                                              fontSize={"xs"}
                                              color={"gray.600"}
                                            >
                                              {label}
                                            </Text>
                                            <Text
                                              fontSize={"xs"}
                                              ml={"1"}
                                              fontWeight={"bold"}
                                              color={color}
                                            >
                                              {value}
                                            </Text>
                                          </Flex>
                                        );
                                      })}
                                    </Flex>
                                  </Flex>
                                }
                                bg="gray.100"
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
                                  background={"white"}
                                  opacity={
                                    calender[14].date.getMonth() ===
                                    date.getMonth()
                                      ? 1
                                      : 0.75
                                  }
                                  p={"0.5"}
                                >
                                  <Flex
                                    width={"full"}
                                    transition={"0.3s"}
                                    direction={"column"}
                                  >
                                    <Text
                                      fontWeight={"normal"}
                                      fontSize={"xs"}
                                      color={
                                        moment(date).format("YYYY-MM-DD") ===
                                        moment().format("YYYY-MM-DD")
                                          ? "#027DBC"
                                          : "gray.600"
                                      }
                                      display={"flex"}
                                    >
                                      {date.getDate()}
                                      {moment(date).format("YYYY-MM-DD") ===
                                      moment().format("YYYY-MM-DD") ? (
                                        <Flex
                                          ml={"0.5"}
                                          mt={"1"}
                                          width={"1"}
                                          height={"1"}
                                          background={"#027DBC"}
                                          borderRadius={"full"}
                                        ></Flex>
                                      ) : null}
                                    </Text>

                                    <Flex
                                      // border={"1px solid"}
                                      borderColor={
                                        calenderHour
                                          ? calenderHour.affinityRate
                                            ? calenderHour.affinityRate >= 90
                                              ? `#359735`
                                              : calenderHour.affinityRate > 70
                                                ? `#FDB833`
                                                : "#FF4B3F"
                                            : "#d3d3d3"
                                          : "white"
                                      }
                                      rounded={"sm"}
                                      mt={"2"}
                                      p={"1"}
                                      justifyContent={"center"}
                                    >
                                      {isLoading ? (
                                        <Spinner color="lightgray" />
                                      ) : (
                                        <Text
                                          fontWeight={"bold"}
                                          fontSize={"lg"}
                                          borderBottom={"1px solid lightgray"}
                                          color={
                                            calenderHour?.affinityRate
                                              ? calenderHour.affinityRate >= 90
                                                ? `#359735`
                                                : calenderHour.affinityRate > 70
                                                  ? `#FDB833`
                                                  : "#FF4B3F"
                                              : "#d3d3d3"
                                          }
                                        >{`${Number(
                                          (
                                            calenderHour?.affinityRate || 0
                                          ).toFixed(2),
                                        ).toString()}%`}</Text>
                                      )}
                                    </Flex>
                                  </Flex>
                                </Flex>
                              </Tooltip>
                            );
                          } else {
                            return <></>;
                          }
                        })}
                        <Flex
                          width={"180px"}
                          m={"0.5px"}
                          background={"gray.50"}
                          boxShadow={"sm"}
                          p={"0.5"}
                          direction={"column"}
                        >
                          <Text
                            mt={"0.5"}
                            textAlign={"center"}
                            color={"#027DBC"}
                            fontSize={"xs"}
                            fontWeight={"medium"}
                          >{`Week: ${week ? week.number : "--"}`}</Text>
                          <Flex
                            direction={"column"}
                            px={"1"}
                            flex={1}
                            justifyContent={"space-evenly"}
                          >
                            {[
                              {
                                label: "Avg. Affinity Rate:",
                                value: `${Number(
                                  (totalObj.affinityRate || 0)
                                    .toFixed(2)
                                    .toString(),
                                )}%`,
                                color: totalObj?.affinityRate
                                  ? totalObj.affinityRate >= 90
                                    ? `#359735`
                                    : totalObj.affinityRate > 70
                                      ? `#FDB833`
                                      : "#FF4B3F"
                                  : "black",
                              },
                              {
                                label: "Total Hours:",
                                value: Number(
                                  (totalObj.totalHours || 0)
                                    .toFixed(2)
                                    .toString(),
                                ),
                              },
                              {
                                label: "Total TO:",
                                value: `${currencyConverter.format(
                                  Number(
                                    Number(
                                      (totalObj?.totalTurnover || 0).toFixed(2),
                                    ),
                                  ),
                                )}`,
                              },
                            ].map(({ label, value, color }) => {
                              return (
                                <Flex
                                  justifyContent={"space-between"}
                                  key={label}
                                  alignItems={"center"}
                                >
                                  <Text fontSize={"xs"} color={"gray.600"}>
                                    {label}
                                  </Text>
                                  <Text
                                    fontSize={"xs"}
                                    ml={"1"}
                                    fontWeight={"bold"}
                                    color={color}
                                  >
                                    {value}
                                  </Text>
                                </Flex>
                              );
                            })}
                          </Flex>
                        </Flex>
                      </Flex>
                    );
                  }
                  return <></>;
                })}
              </Flex>
            ) : null}
          </Flex>
          <Flex
            p={"1"}
            background={"white"}
            boxShadow={"sm"}
            roundedBottomLeft={"md"}
            roundedBottomRight={"md"}
            justifyContent={"center"}
          >
            <Flex my={"2"} mx={"4"} alignItems={"center"}>
              <CustomBox color={"#d3d3d3"} background={"#d3d3d3"} />
              <Text ml={"2"} fontWeight={"medium"} fontSize={"sm"}>
                0%
              </Text>
            </Flex>
            <Flex my={"2"} mx={"4"} alignItems={"center"}>
              <CustomBox color={"#FF4B3F"} background={"#FF4B3F"} />
              <Text ml={"2"} fontWeight={"medium"} fontSize={"sm"}>
                1% - 70%
              </Text>
            </Flex>
            <Flex my={"2"} mx={"4"} alignItems={"center"}>
              <CustomBox color={"#FDB833"} background={"#FDB833"} />
              <Text ml={"2"} fontWeight={"medium"} fontSize={"sm"}>
                71% - 89%
              </Text>
            </Flex>
            <Flex my={"2"} mx={"4"} alignItems={"center"}>
              <CustomBox color={"#359735"} background={"#359735"} />
              <Text ml={"2"} fontWeight={"medium"} fontSize={"sm"}>
                90% +
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </AppContainer>
  );
}

export default StoreAffinityRate;
