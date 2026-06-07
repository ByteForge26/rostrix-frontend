import {
  Badge,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  Modal as ModalEco,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
  useDisclosure,
} from "@chakra-ui/react";
import moment, { Moment } from "moment";
import { useEffect, useState } from "react";
import { BsCalendar2Event, BsTable } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { useToasts } from "react-toast-notifications";
import { updateEcoMobilitySubmission } from "../../app/slice/auth.slice";
import { useAppDispatch, useAppSelector } from "../../app/store/store";
import AppContainer from "../../components/AppContainer";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import AppQuickFilterChips from "../../components/AppQuickFilterChips";
import AppSelect from "../../components/AppSelect";
import AppTabs from "../../components/AppTabs";
import { ENDPOINT } from "../../config/endpoint.config";
import { PERMISSION } from "../../config/permission.config";
import {
  COMMUTE_CATEGORIES,
  DAYS as DAYSME,
  FILTERS,
  MODE_OF_COMMUTE,
} from "../../helper/Constant";
import { IEcoMobility, IMyTeamInfo } from "../../helper/Interface";
import {
  createDates,
  formatDate,
  getDateFromString,
  getDates,
} from "../../helper/Utils";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import { useService } from "../../hooks/useService";
import CalenderRow from "../roster/common/CalenderRow";
import CustomBox from "../roster/common/CustomBox";
import DateSelection from "../roster/common/DateSelection";
import MonthSwitcher from "../roster/common/MonthSwitcher";
import MyTeamEmployees from "../roster/common/MyTeamEmployees";

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
function ManageEcoMobility() {
  const [view, setView] = useState(TABS[0].value);

  const { addToast } = useToasts();
  const { get, post, put } = useApi();
  const { checkForPermission } = usePermission();
  const dispatch = useAppDispatch();
  const [searchKey, setSearchKey] = useState("");
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [
    isEcoSubmitLoading,
    { on: onEcoSubmitLoading, off: offEcoSubmitLoading },
  ] = useBoolean();
  const {
    user,
    selectedCostCenterName,
    contractTypes,
    ecoMobility: ecoMobilityAuth,
  } = useAppSelector((state) => state.auth);

  const {
    getPayrollConfig,
    payrollConfig,
    weeks,
    getWeeks,
    selectedFilter,
    setSelectedFilter,
    currentMonth,
    currentYear,
    getMonthListing,
    selectedYearMonth,
    customFromDate,
    customToDate,
    setWeeksInCurrentMonth,
    setCalender,
    onPrevMonth,
    onNextMonth,
    calender: calenderEco,
    setCurrentMonth,
    setCurrentYear,
    setCustomFromDate,
    setCustomToDate,
    setSelectedYearMonth,
    yearMonthListing,
    weeksInCurrentMonth,
  } = useService();
  const [ecoMobility, setEcoMobility] = useState<IEcoMobility[]>();

  const [myTeamEmp, setMyTeamEmp] = useState<
    IMyTeamInfo["userBasicInfoDTOList"]
  >([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const [finalDates, setFinalDates] = useState({
    fromDate: "",
    toDate: "",
  });
  const {
    isOpen: isEcoMobilityOpen,
    onClose: onEcoMobilityClose,
    onOpen: onEcoMobilityOpen,
  } = useDisclosure();
  const [modeOfCommute, setModeOfCommute] = useState("");
  const [roundTripDistance, setRoundTripDistance] = useState("");
  const [date, setDate] = useState("");
  const [
    isSubmissionStatusLoading,
    { on: onSubmissionStatusLoading, off: offSubmissionStatusLoading },
  ] = useBoolean(false);

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
    getFinalFromToDate();
  }, [
    view,
    selectedFilter,
    selectedYearMonth,
    currentMonth,
    currentYear,
    customFromDate,
    customToDate,
  ]);
  const getFinalFromToDate = () => {
    if (!payrollConfig) return;
    let fromDate: Moment | undefined;
    let toDate: Moment | undefined;
    if (view === TABS[0].value) {
      const { fromDate: f, toDate: t } = getDates({
        currentMonth,
        currentYear,
        customFromDate,
        customToDate,
        payrollConfig,
        selectedFilter,
        selectedYearMonth,
      });
      if (f && t) {
        fromDate = f;
        toDate = t;
      }
    }
    if (view === TABS[1].value) {
      const {
        calender: calenderEco,
        weeksInCurrentMonth,
        startDate,
        endDate,
      } = createDates(currentYear, currentMonth);
      setWeeksInCurrentMonth(weeksInCurrentMonth);
      setCalender(calenderEco);
      fromDate = moment(startDate);
      toDate = moment(endDate);
    }
    if (fromDate && toDate) {
      setFinalDates({
        fromDate: fromDate.format("YYYY-MM-DD"),
        toDate: toDate.format("YYYY-MM-DD"),
      });
    }
  };
  useEffect(() => {
    if (user) {
      const { fromDate, toDate } = finalDates;
      if (fromDate && toDate) {
        if (
          checkForPermission(
            PERMISSION["Eco Mobility"]["My Team Eco Mobility"].View,
          )
        ) {
          getMyTeamInfo({ fromDate, toDate });
        } else {
          const empId = user?.empId;
          setSelectedEmpId(empId);
          getEcoMobility({ fromDate, toDate, empId });
        }
      }
    }
  }, [finalDates]);

  const getEcoMobility = async (props: {
    fromDate: string;
    toDate: string;
    empId: string;
  }) => {
    const { empId, fromDate, toDate } = props;
    if (!payrollConfig) return;
    setEcoMobility([]);
    setSearchKey("");
    onLoading();
    const res = await getEcoMobilityData({ fromDate, empId, toDate });
    offLoading();
    if (res.length) {
      setEcoMobility(res);
    } else {
      setEcoMobility(undefined);
    }
  };
  const getEcoMobilityData = async (props: {
    fromDate: string;
    toDate: string;
    empId: string;
  }) => {
    const { empId, fromDate, toDate } = props;
    return get<IEcoMobility[]>(ENDPOINT["/eco-mobility"][""] + `/${empId}`, {
      params: {
        fromDate,
        toDate,
      },
    });
  };

  useEffect(() => {
    if (view) {
      setSearchKey("");
    }
  }, [view]);

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
      const userBasicInfoDTOList = res.userBasicInfoDTOList.sort((a, b) => {
        if (user && a.empId === user.empId && b.empId !== user.empId) return -1;
        if (user && a.empId !== user.empId && b.empId === user.empId) return 1;

        return a.firstName.localeCompare(b.firstName);
      });
      setMyTeamEmp(userBasicInfoDTOList);
      let empId = userBasicInfoDTOList[0].empId;
      if (
        selectedEmpId &&
        res.userBasicInfoDTOList.findIndex(
          ({ empId }) => empId === selectedEmpId,
        ) >= 0
      ) {
        empId = selectedEmpId;
      }
      setSelectedEmpId(empId);
      getEcoMobility({ fromDate, toDate, empId });
    } else {
      setMyTeamEmp([]);
      setSelectedEmpId("");
    }
  };

  const onChangeSelectedEmpId = (empId: string) => {
    setEcoMobility([]);
    setSelectedEmpId(empId);
    const { fromDate, toDate } = finalDates;
    getEcoMobility({ fromDate, toDate, empId });
  };
  const onAddEcoMobility = async () => {
    onSubmissionStatusLoading();
    const res = await getEcoMobilityData({
      empId: user?.empId || "",
      fromDate: moment(payrollConfig?.currentPStartDateTime).format(
        "YYYY-MM-DD",
      ),
      toDate: moment(payrollConfig?.currentPStartDateTime).format("YYYY-MM-DD"),
    });
    offSubmissionStatusLoading();

    if (res.length) {
      addToast(
        "You’ve already submitted Eco Mobility for this payroll month.",
        { appearance: "info" },
      );
      if (
        ecoMobilityAuth &&
        payrollConfig &&
        user &&
        ecoMobilityAuth.empId === user.empId &&
        ecoMobilityAuth.currentPStartDate ===
          moment(payrollConfig.currentPStartDateTime).format("YYYY-MM-DD") &&
        !ecoMobilityAuth.submitted
      ) {
        updateEcoStatus();
      }
    } else {
      setModeOfCommute("");
      setRoundTripDistance("");
      setDate("");
      onEcoMobilityOpen();
    }
  };

  const onSaveEcoMobility = async () => {
    onEcoSubmitLoading();
    const res = await post<IEcoMobility[]>(ENDPOINT["/eco-mobility"][""], {
      data: {
        modeOfCommute,
        roundTripDistance: Number(roundTripDistance || 0),
        empId: selectedEmpId,
        applyBy: "SELF",
      },
    });
    offEcoSubmitLoading();
    if (res?.length) {
      onEcoMobilityClose();
      const { fromDate, toDate } = finalDates;
      getEcoMobility({ fromDate, toDate, empId: selectedEmpId });
      updateEcoStatus();
    }
  };
  const updateEcoStatus = () => {
    if (payrollConfig && user && user.empId === selectedEmpId) {
      dispatch(
        updateEcoMobilitySubmission({
          currentDate: moment().format("YYYY-MM-DD"),
          currentPStartDate: moment(payrollConfig.currentPStartDateTime).format(
            "YYYY-MM-DD",
          ),
          currentPEndDate: moment(payrollConfig.currentPEndDateTime).format(
            "YYYY-MM-DD",
          ),
          submitted: true,
          empId: user.empId,
        }),
      );
    }
  };
  const onEditEco = (
    modeOfCommute: string,
    roundTripDistance: number,
    date: string,
  ) => {
    setModeOfCommute(modeOfCommute);
    setRoundTripDistance(Number(roundTripDistance || 0).toString());
    setDate(date);
    onEcoMobilityOpen();
  };
  const onUpdateEco = async () => {
    onEcoSubmitLoading();
    const res = await put<IEcoMobility[]>(ENDPOINT["/eco-mobility"][""], {
      data: {
        empId: selectedEmpId,
        costCentre: selectedCostCenterName,
        applyBy: selectedEmpId === user?.empId ? "SELF" : "LEADER",
        commuteDetails: [
          {
            date,
            modeOfCommute,
            roundTripDistance: Number(roundTripDistance),
          },
        ],
      },
    });
    offEcoSubmitLoading();
    if (res?.length) {
      onEcoMobilityClose();
      const { fromDate, toDate } = finalDates;
      getEcoMobility({ fromDate, toDate, empId: selectedEmpId });
    }
  };
  const isEditEnable = (props: { editable: boolean; status: string }) => {
    const { editable, status } = props;
    return ((user &&
      selectedEmpId === user.empId &&
      checkForPermission(PERMISSION["Eco Mobility"]["My Eco Mobility"].Add)) ||
      checkForPermission(
        PERMISSION["Eco Mobility"]["My Team Eco Mobility"].Edit,
      )) &&
      editable &&
      status &&
      ["HOLIDAY", "FILLED"].includes(status)
      ? true
      : false;
  };

  return (
    <AppContainer heading="Manage Eco Mobility" info="">
      <AppTabs setValue={setView} value={view} tabs={TABS}>
        {checkForPermission(
          PERMISSION["Eco Mobility"]["My Eco Mobility"].Add,
        ) ? (
          <Button
            onClick={() => onAddEcoMobility()}
            variant={"outline"}
            size={"sm"}
            isLoading={isSubmissionStatusLoading}
          >
            + Add My Eco Mobility
          </Button>
        ) : (
          <></>
        )}
      </AppTabs>

      <Flex>
        {checkForPermission(
          PERMISSION["Eco Mobility"]["My Team Eco Mobility"].View,
        ) ? (
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
        ) : null}

        <Flex
          border={"1px solid #eaeaea"}
          width={"fit-content"}
          rounded={"md"}
          direction={"column"}
          background={"#F8F8F8"}
          p={"2"}
          ml={
            checkForPermission(
              PERMISSION["Eco Mobility"]["My Team Eco Mobility"].View,
            )
              ? "4"
              : ""
          }
          height={"fit-content"}
          flex={1}
        >
          {view === TABS[0].value ? (
            <>
              <Flex
                background={"white"}
                px={"2"}
                justifyContent={"space-between"}
                width={"full"}
                alignItems={"center"}
                roundedTopLeft={"md"}
                roundedTopRight={"md"}
                boxShadow={"sm"}
                mb={"2"}
                minHeight={"48px"}
              >
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
                  </Flex>
                </AppQuickFilterChips>
              </Flex>

              <Flex
                overflow={"auto"}
                p={"1"}
                background={"white"}
                boxShadow={"sm"}
                roundedBottomLeft={"md"}
                roundedBottomRight={"md"}
                height={"597px"}
              >
                {ecoMobility?.length ? (
                  <TableContainer
                    background="white"
                    width={"full"}
                    border={"1px solid #F2F2F2"}
                    borderRadius={"md"}
                    style={{
                      overflow: "auto",
                    }}
                  >
                    <Table variant="simple">
                      <Thead height={"48px"}>
                        <Tr>
                          <Th background="#EBF3F8" color="#616161">
                            Date
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            Mode Of Commute
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            Round Trip Distance
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            Status
                          </Th>
                          <Th background="#EBF3F8" color="#616161">
                            Action
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody fontSize={"sm"}>
                        {ecoMobility
                          .sort(
                            (a, b) =>
                              moment(a.date).unix() - moment(b.date).unix(),
                          )
                          .map(
                            ({
                              date,
                              modeOfCommute,
                              roundTripDistance,
                              status,
                              editable,
                            }) => (
                              <Tr key={date}>
                                <Td py={"3"}>{formatDate(date)}</Td>
                                <Td py={"3"}>
                                  <Text
                                    color={
                                      COMMUTE_CATEGORIES.find(
                                        ({ includes }) =>
                                          includes.indexOf(modeOfCommute) >= 0,
                                      )?.color || "#027dbc"
                                    }
                                  >
                                    {modeOfCommute
                                      ? MODE_OF_COMMUTE.find(
                                          ({ value }) =>
                                            value === modeOfCommute,
                                        )?.label || modeOfCommute
                                      : "-"}
                                  </Text>
                                </Td>
                                <Td py={"3"}>
                                  {["FILLED"].includes(status)
                                    ? `${roundTripDistance} km`
                                    : "-"}
                                </Td>
                                <Td py={"3"}>
                                  <Badge
                                    variant={
                                      status === "FILLED" ? "subtle" : "outline"
                                    }
                                    ml={"2"}
                                    color={
                                      status === "FILLED"
                                        ? "green"
                                        : status === "LEAVE"
                                          ? "#c1e1c1"
                                          : status === "WEEK-OFF"
                                            ? "#82abd4"
                                            : status === "HOLIDAY"
                                              ? "#F29727"
                                              : "green"
                                    }
                                  >
                                    {status.replaceAll("-", " ")}
                                  </Badge>
                                </Td>
                                <Td py={"3"}>
                                  {isEditEnable({ editable, status }) ? (
                                    <IconButton
                                      size={"sm"}
                                      variant={"ghost"}
                                      aria-label="edit-eco-day"
                                      data-testid="edit-eco-day"
                                      onClick={() =>
                                        onEditEco(
                                          modeOfCommute,
                                          roundTripDistance,
                                          date,
                                        )
                                      }
                                    >
                                      <FiEdit />
                                    </IconButton>
                                  ) : null}
                                </Td>
                              </Tr>
                            ),
                          )}
                      </Tbody>
                    </Table>
                  </TableContainer>
                ) : isLoading ? (
                  <AppLoader />
                ) : (
                  <AppNoData msg={""} />
                )}
              </Flex>
            </>
          ) : (
            <>
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

                {calenderEco?.length && weeks?.length ? (
                  <Flex direction={"column"}>
                    {new Array(weeksInCurrentMonth).fill(1).map((key, i) => {
                      const firstDay = calenderEco.find(
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
                                data-testid={`week-cell-${
                                  week ? week.number : "--"
                                }`}
                              >
                                {week ? week.number : "--"}
                              </Text>
                            </Flex>
                            {DAYSME.map((_, j) => {
                              const currentDay = calenderEco.find(
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
                                const EcoCell = (ecoMobility || []).find(
                                  (obj) =>
                                    moment(date).format("YYYY-MM-DD") ===
                                    obj.date,
                                );

                                return (
                                  <Tooltip
                                    isDisabled={
                                      !holiday &&
                                      !leaveId &&
                                      !roster &&
                                      !weekOff
                                    }
                                    hasArrow
                                    key={date.toString()}
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
                                        EcoCell
                                          ? EcoCell.status === "LEAVE"
                                            ? "#c1e1c133"
                                            : EcoCell.status === "WEEK-OFF"
                                              ? "#82abd433"
                                              : EcoCell.status === "HOLIDAY"
                                                ? "#F2972733"
                                                : "white"
                                          : "white"
                                      }
                                      p={"0.5"}
                                    >
                                      <Flex
                                        width={"full"}
                                        transition={"0.3s"}
                                        direction={"column"}
                                      >
                                        <Text
                                          fontWeight={
                                            calenderEco[14].date.getMonth() ===
                                            date.getMonth()
                                              ? "normal"
                                              : "light"
                                          }
                                          fontSize={"xs"}
                                          color={"gray.500"}
                                        >
                                          {date.getDate()}
                                        </Text>
                                        <Flex
                                          borderColor={"white"}
                                          rounded={"sm"}
                                          mt={"1"}
                                          p={"1"}
                                          justifyContent={"center"}
                                        >
                                          {EcoCell ? (
                                            <>
                                              <Flex
                                                direction={"column"}
                                                alignItems={"center"}
                                              >
                                                <Text
                                                  fontWeight={"medium"}
                                                  fontSize={"sm"}
                                                  borderBottom={
                                                    EcoCell?.roundTripDistance
                                                      ? "1px solid lightgray"
                                                      : "unset"
                                                  }
                                                  color={"gray.500"}
                                                >
                                                  {["FILLED"].includes(
                                                    EcoCell.status,
                                                  )
                                                    ? `${
                                                        EcoCell?.roundTripDistance ||
                                                        0
                                                      } km`
                                                    : EcoCell.status === "LEAVE"
                                                      ? "LEAVE"
                                                      : EcoCell.status ===
                                                          "WEEK-OFF"
                                                        ? "WEEK OFF"
                                                        : EcoCell?.status}
                                                </Text>

                                                <Text
                                                  fontSize={"x-small"}
                                                  color={
                                                    COMMUTE_CATEGORIES.find(
                                                      ({ includes }) =>
                                                        includes.indexOf(
                                                          EcoCell.modeOfCommute,
                                                        ) >= 0,
                                                    )?.color || "#027dbc"
                                                  }
                                                >{`${
                                                  MODE_OF_COMMUTE.find(
                                                    ({ value }) =>
                                                      value ===
                                                      EcoCell.modeOfCommute,
                                                  )?.label || "-"
                                                }`}</Text>
                                              </Flex>
                                            </>
                                          ) : null}
                                        </Flex>
                                        {EcoCell &&
                                        isEditEnable({
                                          editable: EcoCell.editable,
                                          status: EcoCell.status,
                                        }) ? (
                                          <Text
                                            position={"absolute"}
                                            cursor={"pointer"}
                                            top={"1.5"}
                                            right={"1.5"}
                                            color={"gray"}
                                            aria-label=""
                                            size={"sm"}
                                            variant={"ghost"}
                                            fontSize={"xs"}
                                            onClick={() => {
                                              onEditEco(
                                                EcoCell.modeOfCommute,
                                                EcoCell.roundTripDistance,
                                                EcoCell.date,
                                              );
                                            }}
                                          >
                                            <FiEdit />
                                          </Text>
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
              <Flex
                p={"1"}
                background={"white"}
                boxShadow={"sm"}
                roundedBottomLeft={"md"}
                roundedBottomRight={"md"}
                justifyContent={"center"}
              >
                {COMMUTE_CATEGORIES.map(({ color, label }) => {
                  return (
                    <Flex my={"2"} mx={"4"} alignItems={"center"} key={label}>
                      <CustomBox color={color} background={color} />
                      <Text ml={"2"} fontWeight={"medium"} fontSize={"sm"}>
                        {label}
                      </Text>
                    </Flex>
                  );
                })}
              </Flex>
            </>
          )}
        </Flex>
      </Flex>
      <ModalEco isOpen={isEcoMobilityOpen} onClose={onEcoMobilityClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex direction={"column"} alignItems={"center"}>
              {`${date ? "Update" : "Add"} Eco Mobility`}
              {date ? null : (
                <Text fontSize={"sm"}>(Monthly Commute Setup)</Text>
              )}
            </Flex>
          </ModalHeader>
          {date ? null : (
            <Text p={"2"} fontSize={"xs"} textAlign={"center"} mt={"-4"}>
              Set up your usual commute details to calculate eco-mobility. You
              only need to submit this once for the selected payroll period.
            </Text>
          )}

          {payrollConfig ? (
            <Text
              background={"#fff7d6"}
              color={"#907400"}
              fontSize={"sm"}
              p={"2"}
              rounded={"md"}
              textAlign={"center"}
              mb={"2"}
              fontWeight={"medium"}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: date
                    ? `Selected Date: ${moment(date).format(
                        "DD MMM YYYY",
                      )}</br><small>**Applicable to the selected date only.</small>`
                    : `Applies to payroll period: ${moment(
                        payrollConfig.currentPStartDateTime,
                      ).format("DD MMM YYYY")} - ${moment(
                        payrollConfig.currentPEndDateTime,
                      ).format(
                        "DD MMM YYYY",
                      )}.</br><small>**This will apply to all working days in this period</small>`,
                }}
              ></span>
            </Text>
          ) : null}

          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Mode Of Commute</FormLabel>
              <AppSelect
                options={MODE_OF_COMMUTE}
                onChange={setModeOfCommute}
                value={modeOfCommute}
              />
              <FormHelperText fontSize={"xs"} color={"gray.500"}>
                Select the primary mode you usually use for commuting.
              </FormHelperText>
            </FormControl>
            <FormControl mb={"4"}>
              <FormLabel>Daily Round Trip Distance (in km)</FormLabel>
              <Input
                placeholder="Enter here"
                value={roundTripDistance}
                type="number"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setRoundTripDistance("");
                    return;
                  }
                  const num = Number(value);
                  if (
                    !Number.isNaN(num) &&
                    num >= 0 &&
                    !value.toLowerCase().includes("e")
                  ) {
                    setRoundTripDistance(value);
                  }
                }}
              />
              <FormHelperText fontSize={"xs"} color={"gray.500"}>
                Enter the total distance you travel in a day (Home → Store →
                Home).
              </FormHelperText>
            </FormControl>
          </ModalBody>
          {!date ? (
            <Text
              background={"#027DBC1a"}
              color={"#027DBC"}
              fontSize={"xs"}
              p={"2"}
              rounded={"md"}
              textAlign={"center"}
              mb={"2"}
              fontWeight={"medium"}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    "You can update or adjust this later for individual days if required.",
                }}
              ></span>
            </Text>
          ) : null}
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onEcoMobilityClose}
            >
              Cancel
            </Button>
            <Button
              isDisabled={!modeOfCommute || !roundTripDistance}
              isLoading={isEcoSubmitLoading}
              onClick={() => {
                date ? onUpdateEco() : onSaveEcoMobility();
              }}
            >
              {date ? "Update" : "Save"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalEco>
    </AppContainer>
  );
}

export default ManageEcoMobility;
