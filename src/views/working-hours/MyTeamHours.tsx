import {
  Badge,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
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
import moment from "moment";
import { useEffect, useState } from "react";
import { BsCalendar2Event, BsSearch, BsTable } from "react-icons/bs";
import { useAppSelector } from "../../app/store/store";
import AppContainer from "../../components/AppContainer";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import AppQuickFilterChips from "../../components/AppQuickFilterChips";
import AppTableHeading from "../../components/AppTableHeading";
import AppTableHeadingWithSort from "../../components/AppTableHeadingWithSort";
import AppTabs from "../../components/AppTabs";
import { ENDPOINT } from "../../config/endpoint.config";
import { DAYS, FILTERS } from "../../helper/Constant";
import {
  ICalenderHour,
  IMyTeamHours,
  IMyTeamInfo,
} from "../../helper/Interface";
import {
  createDates,
  getDateFromString,
  getDates,
  getWorkSummary,
  sortByFunc,
} from "../../helper/Utils";
import { useApi } from "../../hooks/useApi";
import {
  HOLIDAY_COLOR,
  LEAVE_COLOR,
  WEEK_OFF_COLOR,
} from "../../hooks/useCalender";
import { useService } from "../../hooks/useService";
import CustomCircle from "../leave/CustomCircle";
import CalenderRow from "../roster/common/CalenderRow";
import DateSelection from "../roster/common/DateSelection";
import MonthSwitcher from "../roster/common/MonthSwitcher";
import MyTeamEmployees from "../roster/common/MyTeamEmployees";
import Badges from "./Badges";
import MyHoursInfo from "./MyHoursInfo";

const TABS = [
  {
    name: "Tabular View",
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
function MyTeamHours() {
  const [view, setView] = useState(TABS[0].value);

  const { get } = useApi();
  const [searchKey, setSearchKey] = useState("");
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const { user, selectedCostCenterName, contractTypes } = useAppSelector(
    (state) => state.auth,
  );

  const {
    getPayrollConfig,

    getWeeks,
    setCustomToDate,
    setSelectedYearMonth,
    yearMonthListing,
    weeksInCurrentMonth,
    selectedFilter,
    setSelectedFilter,
    currentMonth,
    currentYear,
    getMonthListing,
    calender,
    setCurrentMonth,
    setCurrentYear,
    selectedYearMonth,
    customFromDate,
    customToDate,
    setWeeksInCurrentMonth,
    setCalender,
    onPrevMonth,
    payrollConfig,
    weeks,
    onNextMonth,

    setCustomFromDate,
  } = useService();
  const [teamWorkHours, setTeamWorkHours] = useState<IMyTeamHours>();
  const [sortBy, setSortBy] = useState("name");
  const [sortMethodAsc, setSortMethodAsc] = useState<boolean>(true);

  const [myTeamEmp, setMyTeamEmp] = useState<
    IMyTeamInfo["userBasicInfoDTOList"]
  >([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const [calenderHours, setCalenderHours] = useState<ICalenderHour[]>([]);
  const [workSummary, setWorkSummary] = useState<{
    totalHours: number;
    relHours: number;
    planHours: number;
    wHolidays: number;
    weekOffs: number;
    leaves: number;
  }>();

  useEffect(() => {
    getPayrollConfig();
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
      selectedYearMonth &&
      view &&
      view === TABS[0].value &&
      (selectedFilter === FILTERS[2].value
        ? customFromDate && customToDate
        : true)
    ) {
      getTeamHours();
    }
  }, [
    selectedYearMonth,
    view,
    selectedFilter,
    currentMonth,
    currentYear,
    customFromDate,
    customToDate,
  ]);

  const getTeamHours = async () => {
    if (!payrollConfig) return;
    setTeamWorkHours(undefined);
    setSearchKey("");
    onLoading();
    const {
      fromDate,
      toDate,
      //
    } = getDates({
      currentMonth,
      currentYear,
      customFromDate,
      customToDate,
      payrollConfig,
      selectedFilter,
      selectedYearMonth,
    });
    const res = await get<IMyTeamHours>(
      ENDPOINT["/hours"]["/my-team-hours"] + `/${user?.empId}`,
      {
        params: {
          costCentre: selectedCostCenterName,
          fromDate: fromDate?.format("YYYY-MM-DD"),
          toDate: toDate?.format("YYYY-MM-DD"),
          empId: user?.empId,
          type: selectedFilter,
        },
      },
    );
    offLoading();
    if (res.success) {
      setTeamWorkHours(res);
    } else {
      setTeamWorkHours(undefined);
    }
  };

  useEffect(() => {
    if (view && view === TABS[1].value) {
      createCalender();
    }
  }, [currentMonth, currentYear, view]);

  useEffect(() => {
    if (view) {
      setSearchKey("");
    }
  }, [view]);

  const createCalender = () => {
    const { calender, weeksInCurrentMonth, startDate, endDate } = createDates(
      currentYear,
      currentMonth,
    );
    setWeeksInCurrentMonth(weeksInCurrentMonth);
    setCalender(calender);
    getMyTeamInfo({
      fromDate: startDate,
      toDate: endDate,
    });
  };

  const getMyTeamInfo = async ({
    fromDate,
    toDate,
  }: {
    fromDate: string;
    toDate: string;
  }) => {
    onLoading();
    const res = await get<IMyTeamInfo>(
      ENDPOINT["/hours"]["/my-team-info"] + `/${user?.empId}`,
      {
        params: {
          fromDate,
          toDate,
        },
      },
    );
    offLoading();
    if (res?.success && res.userBasicInfoDTOList?.length) {
      setMyTeamEmp(res.userBasicInfoDTOList);
      let empId = res.userBasicInfoDTOList.sort((a, b) =>
        a.firstName.localeCompare(b.firstName),
      )[0].empId;
      if (
        selectedEmpId &&
        res.userBasicInfoDTOList.findIndex(
          ({ empId }) => empId === selectedEmpId,
        ) >= 0
      ) {
        empId = selectedEmpId;
      }
      setSelectedEmpId(empId);
      getEmpCalenderHours({
        fromDate,
        toDate,
        empId,
      });
    } else {
      setMyTeamEmp([]);
      setSelectedEmpId("");
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
    if (calenderHours && calender.length) {
      setWorkSummary(
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

  const onChangeSelectedEmpId = (empId: string) => {
    setCalenderHours([]);
    setSelectedEmpId(empId);
    const fromDate = moment(calender[0].date).format("YYYY-MM-DD");
    const toDate = moment(calender[calender.length - 1].date).format(
      "YYYY-MM-DD",
    );
    getEmpCalenderHours({
      fromDate,
      toDate,
      empId,
    });
  };
  const getFilteredIntermediateWorkHoursList = () => {
    if (teamWorkHours?.intermediateWorkHoursList?.length) {
      return teamWorkHours.intermediateWorkHoursList.filter(
        ({ name, empId, contractTypeName }) =>
          name.trim().toLowerCase().includes(searchKey.trim().toLowerCase()) ||
          empId.trim().toLowerCase().includes(searchKey.trim().toLowerCase()) ||
          contractTypeName
            .trim()
            .toLowerCase()
            .includes(searchKey.trim().toLowerCase()),
      );
    }
    return [];
  };
  const getFilteredFinalisedWorkHoursList = () => {
    if (teamWorkHours?.finalisedWorkHoursList?.length) {
      return teamWorkHours.finalisedWorkHoursList.filter(
        ({ name, empId, contractTypeName, clusterName }) =>
          name.trim().toLowerCase().includes(searchKey.trim().toLowerCase()) ||
          empId.trim().toLowerCase().includes(searchKey.trim().toLowerCase()) ||
          contractTypeName
            .trim()
            .toLowerCase()
            .includes(searchKey.trim().toLowerCase()) ||
          (clusterName || "")
            .trim()
            .toLowerCase()
            .includes(searchKey.trim().toLowerCase()),
      );
    }
    return [];
  };
  const getTotalOfIntermediateWorkHoursList = (key: string) => {
    let total = 0;
    if (teamWorkHours?.intermediateWorkHoursList?.length) {
      getFilteredIntermediateWorkHoursList().forEach((obj: any) => {
        total += obj[key] ? Number(obj[key] || 0) : 0;
      });
    }

    return total;
  };
  const getTotalOfFinalisedWorkHoursList = (key: string) => {
    let total = 0;
    if (teamWorkHours?.finalisedWorkHoursList?.length) {
      getFilteredFinalisedWorkHoursList().forEach((obj: any) => {
        total += obj[key] ? Number(obj[key] || 0) : 0;
      });
    }

    return total;
  };

  return (
    <AppContainer
      heading="My Team Hours"
      info="This page showcases your teammates Published Working Hours, Working Holidays, and Number of Leave Without Pay (LOP) days. You can view this information in an aggregated manner in Tabular View or explore it day-by-day in the Calendar View."
    >
      <AppTabs setValue={setView} value={view} tabs={TABS} />
      {view === TABS[0].value ? (
        <>
          <AppQuickFilterChips
            filters={FILTERS}
            setSelectedFilters={() => {}}
            onClick={(filter) => setSelectedFilter(filter)}
            selectedFilters={[selectedFilter]}
          >
            <Flex alignItems={"center"}>
              <DateSelection
                currentMonth={currentMonth}
                currentYear={currentYear}
                customFromDate={customFromDate}
                customToDate={customToDate}
                selectedFilter={selectedFilter}
                selectedYearMonth={selectedYearMonth}
                setCurrentMonth={setCurrentMonth}
                setCurrentYear={setCurrentYear}
                setCustomFromDate={setCustomFromDate}
                setCustomToDate={setCustomToDate}
                setSelectedYearMonth={setSelectedYearMonth}
                yearMonthListing={yearMonthListing}
              />

              <InputGroup width={"fit-content"} ml={"4"}>
                <InputLeftElement pointerEvents="none">
                  <BsSearch color="gray.300" />
                </InputLeftElement>
                <Input
                  background={"white"}
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  placeholder="Search here"
                  width={"fit-content"}
                />
              </InputGroup>
            </Flex>
          </AppQuickFilterChips>
          <Flex overflow={"auto"} mt={"4"}>
            {teamWorkHours?.status !== "NOT_PRESENT" ? (
              <>
                {teamWorkHours?.intermediateWorkHoursList?.length ? (
                  <TableContainer
                    background="white"
                    width={"full"}
                    border={"1px solid #F2F2F2"}
                    borderRadius={"md"}
                  >
                    <Table variant="simple">
                      <Thead height={"48px"}>
                        <Tr>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeading label="Sr. no." info="" />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeadingWithSort
                              value="name"
                              label="Employee"
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              sortMethodAsc={sortMethodAsc}
                              setSortMethodAsc={setSortMethodAsc}
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeadingWithSort
                              value="empId"
                              label="Employee Id"
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              sortMethodAsc={sortMethodAsc}
                              setSortMethodAsc={setSortMethodAsc}
                              info=""
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeadingWithSort
                              value="contractTypeName"
                              label="Contract Type"
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              sortMethodAsc={sortMethodAsc}
                              setSortMethodAsc={setSortMethodAsc}
                              info=""
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeadingWithSort
                              value="totalWorkHours"
                              label="Total Working Hours"
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              sortMethodAsc={sortMethodAsc}
                              setSortMethodAsc={setSortMethodAsc}
                              number
                              info="Total number of published working hours for teammates in the selected duration"
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeading
                              label="Realised Hours"
                              info="Shows the number of realized hours from the total published working hours from the start of the selected date range up to yesterday"
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeading
                              label="Planned Hours"
                              info="Shows the number of planned hours from the total published working hours from today until the end of the selected date range"
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeadingWithSort
                              value="numWorkingHolidays"
                              label="Total Working Holidays"
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              sortMethodAsc={sortMethodAsc}
                              setSortMethodAsc={setSortMethodAsc}
                              number
                              info="Total number of working holidays for teammates in the selected duration"
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeading
                              label="Realised Working Holidays"
                              info="Shows the number of realized working holidays from the total working holidays from the start of the selected date range up to yesterday"
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeading
                              label="Planned Working Holidays"
                              info="Shows the number of planned working holidays from the total working working hours from today until the end of the selected date range"
                            />
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody fontSize={"sm"}>
                        {getFilteredIntermediateWorkHoursList()
                          .sort((a, b) =>
                            sortByFunc(a, b, sortBy, sortMethodAsc),
                          )
                          .map(
                            (
                              {
                                contractTypeName,
                                empId,
                                name,
                                numWorkingHolidays,
                                plannedHours,
                                plannedWh,
                                realisedHours,
                                realisedWh,
                                totalWorkHours,
                              },
                              i,
                            ) => (
                              <Tr key={empId}>
                                <Td py={"3"}>{i + 1}</Td>
                                <Td py={"3"}>{name}</Td>
                                <Td py={"3"}>{empId}</Td>
                                <Td py={"3"}>
                                  <Badge
                                    colorScheme={
                                      contractTypeName.toLowerCase() ===
                                      "full time"
                                        ? "green"
                                        : "gray"
                                    }
                                    variant={"outline"}
                                  >
                                    {contractTypeName}
                                  </Badge>
                                </Td>
                                <Td py={"3"} textAlign={"center"}>
                                  <Text fontWeight={"medium"}>
                                    {totalWorkHours}
                                  </Text>
                                </Td>
                                <Td py={"3"} textAlign={"center"}>
                                  {realisedHours}
                                </Td>
                                <Td py={"3"} textAlign={"center"}>
                                  {plannedHours}
                                </Td>
                                <Td py={"3"} textAlign={"center"}>
                                  {numWorkingHolidays}
                                </Td>
                                <Td py={"3"} textAlign={"center"}>
                                  {realisedWh}
                                </Td>
                                <Td py={"3"} textAlign={"center"}>
                                  {plannedWh}
                                </Td>
                              </Tr>
                            ),
                          )}
                      </Tbody>
                      {getFilteredIntermediateWorkHoursList().length ? (
                        <Thead>
                          <Tr>
                            <Th background={"#eaf3f880"}>TOTAL</Th>
                            <Th background={"#eaf3f880"}></Th>
                            <Th background={"#eaf3f880"}></Th>
                            <Th background={"#eaf3f880"}></Th>
                            <Th
                              background={"#eaf3f880"}
                              textAlign={"center"}
                              fontWeight={"bold"}
                            >
                              {getTotalOfIntermediateWorkHoursList(
                                "totalWorkHours",
                              )}
                            </Th>
                            <Th background={"#eaf3f880"} textAlign={"center"}>
                              {getTotalOfIntermediateWorkHoursList(
                                "realisedHours",
                              )}
                            </Th>
                            <Th background={"#eaf3f880"} textAlign={"center"}>
                              {getTotalOfIntermediateWorkHoursList(
                                "plannedHours",
                              )}
                            </Th>
                            <Th background={"#eaf3f880"} textAlign={"center"}>
                              {getTotalOfIntermediateWorkHoursList(
                                "numWorkingHolidays",
                              )}
                            </Th>
                            <Th background={"#eaf3f880"} textAlign={"center"}>
                              {getTotalOfIntermediateWorkHoursList(
                                "realisedWh",
                              )}
                            </Th>
                            <Th background={"#eaf3f880"} textAlign={"center"}>
                              {getTotalOfIntermediateWorkHoursList("plannedWh")}
                            </Th>
                          </Tr>
                        </Thead>
                      ) : null}
                    </Table>
                  </TableContainer>
                ) : null}
                {teamWorkHours?.finalisedWorkHoursList?.length ? (
                  <TableContainer
                    background="white"
                    width={"full"}
                    border={"1px solid #F2F2F2"}
                    borderRadius={"md"}
                  >
                    <Table variant="simple">
                      <Thead height={"48px"}>
                        <Tr>
                          <Th background="#EBF3F8" color="#616161">
                            Sr. no.
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeadingWithSort
                              value="name"
                              label="Employee"
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              sortMethodAsc={sortMethodAsc}
                              setSortMethodAsc={setSortMethodAsc}
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeadingWithSort
                              value="empId"
                              label="Employee Id"
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              sortMethodAsc={sortMethodAsc}
                              setSortMethodAsc={setSortMethodAsc}
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeadingWithSort
                              value="contractTypeName"
                              label="Contract Type"
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              sortMethodAsc={sortMethodAsc}
                              setSortMethodAsc={setSortMethodAsc}
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeadingWithSort
                              value="clusterName"
                              label="Cluster"
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              sortMethodAsc={sortMethodAsc}
                              setSortMethodAsc={setSortMethodAsc}
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            Approval Status
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeadingWithSort
                              value="numWorkingHours"
                              label="Working Hours"
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              sortMethodAsc={sortMethodAsc}
                              setSortMethodAsc={setSortMethodAsc}
                              number
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeadingWithSort
                              value="manualHours"
                              label="Manual Hours"
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              sortMethodAsc={sortMethodAsc}
                              setSortMethodAsc={setSortMethodAsc}
                              number
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeadingWithSort
                              value="totalHours"
                              label="Total Hours"
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              sortMethodAsc={sortMethodAsc}
                              setSortMethodAsc={setSortMethodAsc}
                              number
                            />
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            LOP's
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            <AppTableHeadingWithSort
                              value="numWorkingHolidays"
                              label="Working Holidays"
                              sortBy={sortBy}
                              setSortBy={setSortBy}
                              sortMethodAsc={sortMethodAsc}
                              setSortMethodAsc={setSortMethodAsc}
                              number
                            />
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody fontSize={"sm"}>
                        {getFilteredFinalisedWorkHoursList()
                          .sort((a, b) =>
                            sortByFunc(a, b, sortBy, sortMethodAsc),
                          )
                          .map(
                            (
                              {
                                contractTypeName,
                                empId,
                                name,
                                numWorkingHolidays,
                                approvalStatus,
                                manualHours,
                                numLop,
                                numWorkingHours,
                                totalHours,
                                clusterName,
                              },
                              i,
                            ) => (
                              <Tr key={empId}>
                                <Td py={"3"}>{i + 1}</Td>
                                <Td py={"3"}>{name}</Td>
                                <Td py={"3"}>{empId}</Td>
                                <Td py={"3"}>
                                  <Badge
                                    colorScheme={
                                      contractTypeName.toLowerCase() ===
                                      "full time"
                                        ? "green"
                                        : "gray"
                                    }
                                    variant={"outline"}
                                  >
                                    {contractTypeName}
                                  </Badge>
                                </Td>
                                <Td py={"3"}>{clusterName}</Td>
                                <Td py={"3"}>
                                  <Flex
                                    background={
                                      approvalStatus === "PENDING"
                                        ? "#FFEFE7"
                                        : "#DAF6E3"
                                    }
                                    py={"0.5"}
                                    px={"2"}
                                    width={"fit-content"}
                                    rounded={"sm"}
                                  >
                                    <Text
                                      fontSize={"xs"}
                                      color={
                                        approvalStatus === "PENDING"
                                          ? "#DD4900"
                                          : "#009660"
                                      }
                                      fontWeight={"medium"}
                                    >
                                      {approvalStatus}
                                    </Text>
                                  </Flex>
                                </Td>
                                <Td py={"3"} textAlign={"center"}>
                                  {numWorkingHours}
                                </Td>
                                <Td py={"3"} textAlign={"center"}>
                                  {manualHours}
                                </Td>
                                <Td py={"3"} textAlign={"center"}>
                                  <Text fontWeight={"medium"}>
                                    {totalHours}
                                  </Text>
                                </Td>
                                <Td py={"3"} textAlign={"center"}>
                                  {numLop}
                                </Td>
                                <Td py={"3"} textAlign={"center"}>
                                  {numWorkingHolidays}
                                </Td>
                              </Tr>
                            ),
                          )}
                      </Tbody>
                      {getFilteredFinalisedWorkHoursList().length ? (
                        <Thead>
                          <Tr>
                            <Th background={"#eaf3f880"}>TOTAL</Th>
                            <Th background={"#eaf3f880"}></Th>
                            <Th background={"#eaf3f880"}></Th>
                            <Th background={"#eaf3f880"}></Th>
                            <Th background={"#eaf3f880"}></Th>
                            <Th background={"#eaf3f880"}></Th>
                            <Th background={"#eaf3f880"} textAlign={"center"}>
                              {getTotalOfFinalisedWorkHoursList(
                                "numWorkingHours",
                              )}
                            </Th>
                            <Th background={"#eaf3f880"} textAlign={"center"}>
                              {getTotalOfFinalisedWorkHoursList("manualHours")}
                            </Th>
                            <Th background={"#eaf3f880"} textAlign={"center"}>
                              {getTotalOfFinalisedWorkHoursList("totalHours")}
                            </Th>
                            <Th background={"#eaf3f880"} textAlign={"center"}>
                              {getTotalOfFinalisedWorkHoursList("numLop")}
                            </Th>
                            <Th background={"#eaf3f880"} textAlign={"center"}>
                              {getTotalOfFinalisedWorkHoursList(
                                "numWorkingHolidays",
                              )}
                            </Th>
                          </Tr>
                        </Thead>
                      ) : null}
                    </Table>
                  </TableContainer>
                ) : null}
              </>
            ) : isLoading ? (
              <AppLoader />
            ) : (
              <AppNoData msg={teamWorkHours?.message || ""} />
            )}
          </Flex>
        </>
      ) : (
        <Flex>
          <Flex flexDirection={"column"} minWidth={"240px"}>
            <MyTeamEmployees
              myTeamEmp={myTeamEmp}
              onChangeSelectedEmpId={onChangeSelectedEmpId}
              searchKey={searchKey}
              selectedEmpId={selectedEmpId}
              setSearchKey={setSearchKey}
              contractTypes={contractTypes}
              user={user}
            />
          </Flex>
          <Flex
            border={"1px solid #eaeaea"}
            width={"fit-content"}
            rounded={"md"}
            direction={"column"}
            background={"#F8F8F8"}
            p={"2"}
            ml={"4"}
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
              <CalenderRow />
              {calender?.length && weeks?.length ? (
                <Flex direction={"column"}>
                  {new Array(weeksInCurrentMonth).fill(1).map((key, i) => {
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
                              {week ? week.number : "--"}
                            </Text>
                          </Flex>
                          {DAYS.map((_, j) => {
                            const currentDay = calender.find(
                              ({ row, column }) => row === i && column === j,
                            );
                            if (currentDay) {
                              const {
                                date,
                                holiday,
                                today,
                                roster,
                                leaveId,
                                weekOff,
                              } = currentDay;
                              const calenderHour = calenderHours.find(
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
                                      calenderHour?.status === "WEEK_OFF"
                                        ? `${WEEK_OFF_COLOR}66`
                                        : calenderHour?.status === "LEAVE"
                                          ? `${LEAVE_COLOR}66`
                                          : calenderHour?.status &&
                                              [
                                                "WORKING_HOLIDAY",
                                                "HOLIDAY",
                                              ].includes(calenderHour?.status)
                                            ? `${HOLIDAY_COLOR}66`
                                            : calenderHour?.status === "NA"
                                              ? "#d3d3d31a"
                                              : "white"
                                    }
                                    opacity={
                                      calender[14].date.getMonth() ===
                                      date.getMonth()
                                        ? 1
                                        : 0.5
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
                                        color={"gray.500"}
                                      >
                                        {date.getDate()}
                                      </Text>
                                      <Flex
                                        // border={"1px solid"}
                                        borderColor={
                                          calenderHour?.status === "WEEK_OFF"
                                            ? WEEK_OFF_COLOR
                                            : calenderHour?.status === "LEAVE"
                                              ? LEAVE_COLOR
                                              : calenderHour?.status ===
                                                  "WORKING_HOLIDAY"
                                                ? "transparent"
                                                : "white"
                                        }
                                        rounded={"sm"}
                                        mt={"2"}
                                        p={"1"}
                                        justifyContent={"center"}
                                      >
                                        {calenderHour?.status &&
                                        ["WEEK_OFF", "LEAVE", "NA"].includes(
                                          calenderHour?.status,
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
                                              {calenderHour?.status ===
                                              "WEEK_OFF"
                                                ? "Week Off"
                                                : calenderHour?.status ===
                                                    "LEAVE"
                                                  ? "Leave"
                                                  : calenderHour?.status ===
                                                      "NA"
                                                    ? "NA"
                                                    : ""}
                                            </Text>
                                            {calenderHour?.status ===
                                            "LEAVE" ? (
                                              <Text fontSize={"10px"}>
                                                {calenderHour.type !== "GENERAL"
                                                  ? `(${calenderHour.type})`
                                                  : ""}
                                              </Text>
                                            ) : null}
                                          </Flex>
                                        ) : null}
                                        {calenderHour?.status &&
                                        [
                                          "WORKING",
                                          "WORKING_HOLIDAY",
                                          "BLANK",
                                          "HOLIDAY",
                                        ].includes(calenderHour?.status) ? (
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
                                              ].includes(calenderHour?.status)
                                                ? HOLIDAY_COLOR
                                                : "#027dbc"
                                            }
                                          >{`${calenderHour.hours || 0}`}</Text>
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
            <Badges />
          </Flex>
          {calender?.length && workSummary ? (
            <MyHoursInfo workSummary={workSummary} />
          ) : null}
        </Flex>
      )}
    </AppContainer>
  );
}

export default MyTeamHours;
