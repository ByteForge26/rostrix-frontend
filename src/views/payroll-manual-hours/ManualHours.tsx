import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import AppHeader from "../../components/AppHeader";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tr,
  useBoolean,
  useDisclosure,
} from "@chakra-ui/react";
import { BsArrowDown, BsInfoCircle, BsPlusLg, BsSearch } from "react-icons/bs";
import { useApi } from "../../hooks/useApi";
import { useToasts } from "react-toast-notifications";
import { usePermission } from "../../hooks/usePermission";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import moment from "moment";
import { addMonths, subDays, subMonths, subYears } from "date-fns";
import {
  IApiResponse,
  IClusterResponse,
  IManualHours,
  IMiscWork,
  IPayrollConfig,
  IRosterDetails,
  IStoreSecondaryJob,
} from "../../helper/Interface";
import { ENDPOINT } from "../../config/endpoint.config";
import { useAppSelector } from "../../app/store/store";
import AppSelect from "../../components/AppSelect";
import {
  COLORS,
  DEFAULT_CLOSE_TIME,
  DEFAULT_OPEN_TIME,
  DEFAULT_START_TIME,
  LUNCH_INCLUDE,
  MAX_SHIFT_WITHOUT_LUNCH,
  MAX_SHIFT_WITH_LUNCH,
  MONTHS_SHORT,
  NAV_HEIGHT,
  SECONDARY_JOBS_CONFIG,
  TIME_GAP,
} from "../../helper/Constant";
import {
  calculateTotalShiftDuration,
  formatDate,
  generateMonthsListing,
  generateTimeSlots,
  getDuration,
  getFinalMonthListing,
  getIsLunchExist,
  getShiftStatus,
  getShiftStatusV2,
  timerUI,
} from "../../helper/Utils";
import { PERMISSION } from "../../config/permission.config";
import AppRightDrawer from "../../components/AppRightDrawer";
import { FiArrowDown, FiDelete, FiEdit, FiEdit2 } from "react-icons/fi";
import FormHelpText from "rsuite/esm/FormHelpText";
import AppDrawer from "../../components/AppDrawer";
import { cloneDeep, remove } from "lodash";
import { AiFillDelete } from "react-icons/ai";
import AppNoData from "../../components/AppNoData";
import { FaUser } from "react-icons/fa6";
import { useService } from "../../hooks/useService";

const statusMapping = [
  {
    label: "Leave",
    value: "LEAVE",
    color: "#DD4900",
  },
  {
    label: "Blank",
    value: "BLANK",
    color: "#8b8b8b",
  },
  {
    label: "Week Off",
    value: "WEEK_OFF",
    color: "#F29727",
  },
  {
    label: "Holiday",
    value: "HOLIDAY",
    color: "#359735",
  },
  {
    label: "Working Holiday",
    value: "WORKING_HOLIDAY",
    color: "#359735",
  },
  {
    label: "NA",
    value: "NA",
    color: "#8b8b8b",
  },
];

function ManualHours() {
  const { get, post } = useApi();
  const { addToast } = useToasts();
  const { checkForPermission } = usePermission();
  const { selectedCostCenterName } = useAppSelector((state) => state.auth);
  const [empId, setEmpId] = useState("");
  const [date, setDate] = useState("");
  const [clusters, setClusters] = useState<IClusterResponse[]>([]);
  const [storeSecondaryJobs, setStoreSecondaryJobs] = useState<
    IStoreSecondaryJob[]
  >([]);
  const [miscWorks, setMiscWorks] = useState<IMiscWork[]>([]);
  const [comment, setComment] = useState("");
  const [selectedShiftType, setSelectedShiftType] = useState("");
  const [shiftUniqueId, setShiftUniqueId] = useState("");
  const [globalStatus, setGlobalStatus] = useState<
    "NA" | "PAST" | "CURRENT" | "FUTURE"
  >("NA");
  const [showTimer, setShowTimer] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const {
    isOpen: isViewHistoryOpen,
    onOpen: onViewHistoryOpen,
    onClose: onViewHistoryClose,
  } = useDisclosure();
  const {
    isOpen: isShiftOpen,
    onOpen: onShiftOpen,
    onClose: onShiftClose,
  } = useDisclosure();
  const {
    isOpen: isShiftDeleteConfirmationOpen,
    onOpen: onShiftDeleteConfirmationOpen,
    onClose: onShiftDeleteConfirmationClose,
  } = useDisclosure();
  const [rosterDetails, setRosterDetails] = useState<IRosterDetails["data"]>();
  const [isLoading, { on, off }] = useBoolean();
  const [selectedYearMonth, setSelectedYearMonth] = useState("");
  const [yearMonthListing, setYearMonthListing] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState("");
  const [workId, setWorkId] = useState(0);
  const [plannedJob, setPlannedJob] = useState(false);
  const [secondaryJobType, setSecondaryJobType] = useState("");
  const [err, setErr] = useState("");
  const [manualHours, setManualHours] = useState<IManualHours[]>([]);
  const { getPayrollConfig, payrollConfig } = useService();
  const startTimeSlots = generateTimeSlots(
    DEFAULT_OPEN_TIME,
    DEFAULT_CLOSE_TIME,
  );
  const [endTimeSlots, setEndTimeSlots] =
    useState<{ label: string; value: string }[]>();
  const [isEdit, setIsEdit] = useState(false);
  const [mainDraft, setMainDraft] = useState<IRosterDetails["data"]["main"]>(
    [],
  );
  const [othersDraft, setOthersDraft] = useState<
    IRosterDetails["data"]["others"]
  >([]);
  const [miscDraft, setMiscDraft] = useState<IRosterDetails["data"]["misc"]>(
    [],
  );
  const [secondaryMiscDraft, setSecondaryMiscDraft] = useState<
    IRosterDetails["data"]["secondaryMisc"]
  >([]);
  const [isSaving, { on: onSaving, off: offSaving }] = useBoolean();
  const [draftTypes, setDraftTypes] = useState<Record<string, string>>({});

  useEffect(() => {
    getPayrollConfig();
  }, []);

  useEffect(() => {
    if (showTimer && payrollConfig) {
      const calculateTimeRemaining = () => {
        const now = new Date().getTime();
        const difference =
          new Date(payrollConfig.currentManualHourStartTime).getTime() - now;
        setTimeRemaining(difference);
      };

      calculateTimeRemaining();

      const timerId = setInterval(() => {
        calculateTimeRemaining();
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [showTimer, payrollConfig]);
  useEffect(() => {
    if (globalStatus) {
      resetForm();
    }
  }, [globalStatus]);

  useEffect(() => {
    if (payrollConfig) {
      if (validatePayrollConfig()) {
        // setEmpId("DSI000486");
        // setDate(moment().set("D", 16).format("YYYY-MM-DD"));
        getAllClusters();
        getStoreSecondaryJobs();
        getMiscWorks();
      }
    }
  }, [payrollConfig, timeRemaining]);

  useEffect(() => {
    if (payrollConfig) {
      getMonthListing();
    }
  }, [payrollConfig]);

  const validatePayrollConfig = () => {
    let status: "NA" | "PAST" | "CURRENT" | "FUTURE" = "NA";
    if (payrollConfig) {
      const today = moment();
      // today.set({ date: 20 });
      // today.set({ hours: 17 });

      const manualHourStartTime = moment(
        payrollConfig.currentManualHourStartTime,
      );
      const manualHourEndTime = moment(payrollConfig.currentManualHourEndTime);

      if (today.unix() >= manualHourStartTime.unix()) {
        if (today.unix() <= manualHourEndTime.unix()) {
          status = "CURRENT";
        } else {
          status = "PAST";
        }
      } else {
        if (today.get("D") === manualHourStartTime.get("D")) {
          setShowTimer(true);
        }
        status = "FUTURE";
      }
    }
    setGlobalStatus(status);
    return status === "CURRENT";
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
  const getStoreSecondaryJobs = async () => {
    const res = await get<IStoreSecondaryJob[]>(
      ENDPOINT["/secondary"]["/store-config"] + `/${selectedCostCenterName}`,
    );
    if (res?.length) {
      setStoreSecondaryJobs(res);
    } else {
      setStoreSecondaryJobs([]);
    }
  };
  const getMiscWorks = async () => {
    const res = await get<IMiscWork[]>(
      ENDPOINT["/roster"]["/primary"]["/miscWork"],
    );
    if (res?.length) {
      setMiscWorks(res);
    } else {
      setMiscWorks([]);
    }
  };

  const getMonthListing = () => {
    if (payrollConfig) {
      const { listing, selectedYearMonth } = getFinalMonthListing({
        sDate: payrollConfig.currentPStartDateTime,
        eDate: payrollConfig.currentPEndDateTime,
        disabledAfter: payrollConfig.currentPEndDateTime,
      });
      setYearMonthListing(listing);
      setSelectedYearMonth(selectedYearMonth);
    }
  };
  useEffect(() => {
    if (selectedYearMonth && isViewHistoryOpen) {
      getManualHours();
    }
  }, [selectedYearMonth, isViewHistoryOpen]);
  const getManualHours = async () => {
    const res = await get<IManualHours[]>(ENDPOINT["/hours"]["/manual"], {
      params: {
        costCentre: selectedCostCenterName,
        year: selectedYearMonth.split("_")[0],
        month: Number(selectedYearMonth.split("_")[1]),
      },
    });
    setManualHours(res);
  };

  const getRosterDetails = async () => {
    setRosterDetails(undefined);
    on();
    const res = await get<IRosterDetails>(
      ENDPOINT["/hours"]["/emp"] + `/${empId}/${date}`,
    );
    off();
    if (res && res.success && res.applicableForChange && res.data) {
      setRosterDetails(res.data);
      setDraftTypes({});
      setIsEdit(false);
      setMainDraft(cloneDeep(res.data?.main || []));
      setOthersDraft(cloneDeep(res.data?.others || []));
      setMiscDraft(cloneDeep(res.data?.misc || []));
      setSecondaryMiscDraft(cloneDeep(res.data?.secondaryMisc || []));
    } else {
      setRosterDetails(undefined);
      setMainDraft([]);
      setOthersDraft([]);
      setMiscDraft([]);
      setSecondaryMiscDraft([]);
      addToast(res.message || "User Not Found!", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };
  useEffect(() => {
    if (startTime) {
      if (startTime === DEFAULT_CLOSE_TIME) {
        setEndTimeSlots([]);
        return;
      }
      const newStartTime = moment(startTime, "HH:mm:ss")
        .add({ minutes: TIME_GAP })
        .format("HH:mm:ss");

      let newEndTime = moment(startTime, "HH:mm:ss")
        .add({
          hours: MAX_SHIFT_WITHOUT_LUNCH,
        })
        .format("HH:mm:ss");

      if (newEndTime < DEFAULT_CLOSE_TIME && newEndTime < startTime) {
        let newHours = getDuration(
          moment(startTime, "HH:mm:ss"),
          moment(DEFAULT_CLOSE_TIME, "HH:mm:ss"),
        ).durationHours;

        newEndTime = moment(startTime, "HH:mm:ss")
          .add({ hours: newHours })
          .format("HH:mm:ss");
      }
      setEndTimeSlots(generateTimeSlots(newStartTime, newEndTime, startTime));
    }
  }, [startTime]);
  const onAddShiftModalOpen = (type: string) => {
    setErr("");
    setStartTime("");
    setEndTime("");
    setType("");
    setWorkId(0);
    setPlannedJob(false);
    setSecondaryJobType("");
    setSelectedShiftType(type);
    setShiftUniqueId("");
    onShiftOpen();
  };
  const onEditShiftModalOpen = (
    shiftType: string,
    s: string,
    e: string,
    type: string,
    workId?: number,
    plannedJob?: boolean,
    secondaryJobType?: string,
  ) => {
    setErr("");
    setStartTime(s);
    setEndTime(e);
    setType(type);
    setWorkId(workId || 0);
    setPlannedJob(plannedJob || false);
    setSecondaryJobType(secondaryJobType || "");
    setSelectedShiftType(shiftType);
    setShiftUniqueId(
      s +
        "/" +
        e +
        "/" +
        type +
        "/" +
        (workId || "") +
        "/" +
        (plannedJob ? 1 : 0) +
        "/" +
        (secondaryJobType || ""),
    );
    onShiftOpen();
  };
  const onDeleteShiftModalOpen = (
    shiftType: string,
    s: string,
    e: string,
    type: string,
    workId?: number,
    plannedJob?: boolean,
    secondaryJobType?: string,
  ) => {
    setSelectedShiftType(shiftType);
    setShiftUniqueId(
      s +
        "/" +
        e +
        "/" +
        type +
        "/" +
        (workId || "") +
        "/" +
        (plannedJob ? 1 : 0) +
        "/" +
        (secondaryJobType || ""),
    );
    onShiftDeleteConfirmationOpen();
  };

  const onSaveShift = async () => {
    if (rosterDetails) {
      let main = mainDraft?.length ? cloneDeep(mainDraft) : [];
      let others = othersDraft?.length ? cloneDeep(othersDraft) : [];
      let misc = miscDraft?.length ? cloneDeep(miscDraft) : [];
      let secondaryMisc = secondaryMiscDraft?.length
        ? cloneDeep(secondaryMiscDraft)
        : [];
      if (shiftUniqueId) {
        const s = shiftUniqueId.split("/")[0];
        const e = shiftUniqueId.split("/")[1];
        const type = shiftUniqueId.split("/")[2];
        const workId = shiftUniqueId.split("/")[3];
        const plannedJob = shiftUniqueId.split("/")[4];
        const secondaryJobType = shiftUniqueId.split("/")[5];
        switch (selectedShiftType) {
          case "main":
            remove(main, { s, e });
            break;
          case "others":
            remove(others, { s, e, type });
            break;
          case "misc":
            const index = misc.findIndex((obj) => {
              let isValid = false;
              if (obj.s === s && obj.e === e) {
                if (plannedJob === "1" && obj.plannedJob === true) {
                  if (
                    Number(workId) > 0 &&
                    Number(workId) === Number(obj.workId)
                  )
                    isValid = true;
                  if (
                    secondaryJobType &&
                    secondaryJobType === obj.secondaryJobType
                  )
                    isValid = true;
                } else {
                  if (
                    Number(workId) > 0 &&
                    Number(workId) === Number(obj.workId)
                  )
                    isValid = true;
                }
              }
              return isValid;
            });
            misc.splice(index, 1);
            break;
          case "secondaryMisc":
            const index2 = secondaryMisc.findIndex((obj) => {
              let isValid = false;
              if (obj.s === s && obj.e === e) {
                if (plannedJob === "1" && obj.plannedJob === true) {
                  if (
                    Number(workId) > 0 &&
                    Number(workId) === Number(obj.workId)
                  )
                    isValid = true;
                  if (type && type === obj.type) isValid = true;
                } else {
                  if (
                    Number(workId) > 0 &&
                    Number(workId) === Number(obj.workId)
                  )
                    isValid = true;
                }
              }
              return isValid;
            });
            secondaryMisc.splice(index2, 1);
            break;
          default:
            break;
        }
      }
      const {
        isShiftMaxDurationExceed,
        isConflictWithPrimary,
        isConflictWithSecondary,
        isConflictWithMisc,
        error,
      } = getShiftStatusV2({
        currentShift: {
          startTime,
          endTime,
          type:
            selectedShiftType === "main"
              ? "primary"
              : selectedShiftType === "others"
                ? "secondary"
                : selectedShiftType === "misc"
                  ? "misc"
                  : "secondaryMisc",
        },
        main,
        others,
        misc: misc || [],
        secondaryMisc: secondaryMisc || [],
      });
      let validShift = true;
      if (isShiftMaxDurationExceed) {
        setErr(error);
        validShift = false;
      }
      if (isConflictWithPrimary) {
        setErr(error);
        validShift = false;
      }
      if (isConflictWithSecondary) {
        setErr(error);
        validShift = false;
      }
      if (isConflictWithMisc) {
        setErr(error);
        validShift = false;
      }
      if (!validShift) {
        return;
      }
      if (!isShiftDeleteConfirmationOpen) {
        switch (selectedShiftType) {
          case "main":
            main.push({
              s: startTime,
              e: endTime,
              c: "",
            });
            break;
          case "others":
            others.push({
              s: startTime,
              e: endTime,
              c: "",
              type,
            });
            break;
          case "misc":
            misc.push({
              s: startTime,
              e: endTime,
              c: "",
              workId: workId > 0 ? workId : undefined,
              plannedJob: plannedJob || false,
              secondaryJobType: secondaryJobType ? secondaryJobType : undefined,
            });
            break;
          case "secondaryMisc":
            secondaryMisc.push({
              s: startTime,
              e: endTime,
              c: "",
              workId: workId > 0 ? workId : undefined,
              plannedJob: plannedJob || false,
              type,
            });
            break;

          default:
            break;
        }
      }
      setMainDraft(main);
      setOthersDraft(others);
      setMiscDraft(misc);
      setSecondaryMiscDraft(secondaryMisc);
      onShiftClose();
      onShiftDeleteConfirmationClose();
      setDraftTypes((old) => ({
        ...old,
        [selectedShiftType]: selectedShiftType,
      }));
    }
  };
  const onFinalSave = async () => {
    if (rosterDetails) {
      onSaving();
      const res = await post<IApiResponse>(ENDPOINT["/hours"]["/manual"], {
        data: {
          costCentre: rosterDetails.costCentre,
          empId: rosterDetails.empId,
          date,
          action: "EDIT_WORK",
          main: mainDraft,
          others: othersDraft,
          misc: miscDraft,
          secondaryMisc: secondaryMiscDraft,
          comment,
        },
      });
      offSaving();

      if (res.message && res.message !== "Invalid Time to add manual Hours") {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
      }
      if (res.success) {
        setIsEdit(false);
        getRosterDetails();
      } else if (res.message === "Invalid Time to add manual Hours") {
        resetForm();
        validatePayrollConfig();
      }
    }
  };
  const getAction = () => {
    let actions: {
      label: string;
      value: string;
    }[] = [];
    if (rosterDetails) {
      if (rosterDetails.dayStatus === "LEAVE") {
        actions = [
          {
            label: "Remove Leave",
            value: "REMOVE_LEAVE",
          },
        ];
      } else if (rosterDetails.dayStatus === "WEEK_OFF") {
        actions = [
          {
            label: "Remove Week Off",
            value: "REMOVE_WEEK_OFF",
          },
        ];
      } else if (
        ["BLANK", "WORKING", "WORKING_HOLIDAY", "NA"].includes(
          rosterDetails.dayStatus,
        )
      ) {
        actions = [
          {
            label: "Assign Leave",
            value: "ASSIGN_LEAVE",
          },
          {
            label: "Assign Week Off",
            value: "ASSIGN_WEEK_OFF",
          },
        ];
      }
    }
    return actions;
  };
  const changeAction = async (action: string) => {
    if (rosterDetails) {
      const res = await post<IApiResponse>(ENDPOINT["/hours"]["/manual"], {
        data: {
          costCentre: rosterDetails.costCentre,
          empId: rosterDetails.empId,
          date,
          action,
          main: rosterDetails.main,
          others: rosterDetails.others,
          misc: rosterDetails.misc,
          comment,
        },
      });
      addToast(res.message, {
        appearance: res.success ? "success" : "error",
      });
      if (res.success) {
        getRosterDetails();
      }
    }
  };
  const resetForm = () => {
    setRosterDetails(undefined);
    setEmpId("");
    setDate("");
  };
  return (
    <AppContainer heading="Manual Hours" info="">
      <AppHeader justifyContentLeft>
        <Flex>
          <AppSelect
            value={selectedYearMonth}
            onChange={(value) => setSelectedYearMonth(value)}
            options={
              yearMonthListing?.length
                ? yearMonthListing
                    .sort((a, b) => b.value.localeCompare(a.value))
                    .map(({ label, value, isDisabled }) => ({
                      label,
                      value,
                      isDisabled,
                    }))
                : []
            }
          />
        </Flex>

        <Button
          variant={"outline"}
          ml={"4"}
          onClick={() => {
            onViewHistoryOpen();
          }}
        >
          View Entries
        </Button>
      </AppHeader>
      <Flex
        direction={"column"}
        overflow={"auto"}
        p={"1"}
        minHeight={
          checkForPermission(
            PERMISSION["Payroll & Manual Hours"]["Manual Hours"].Add,
          ) &&
          globalStatus === "CURRENT" &&
          payrollConfig
            ? "70vh"
            : "auto"
        }
      >
        {checkForPermission(
          PERMISSION["Payroll & Manual Hours"]["Manual Hours"].Add,
        ) &&
        globalStatus === "CURRENT" &&
        payrollConfig ? (
          <>
            <Flex alignItems={"flex-end"} width={"fit-content"} mb={"4"}>
              <FormControl mr={"4"} isRequired>
                <FormLabel>Employee ID</FormLabel>
                <Input
                  isDisabled={!!rosterDetails}
                  value={empId}
                  onChange={(e) =>
                    setEmpId(e.target.value.toUpperCase().trim())
                  }
                  placeholder="Enter Employee Id"
                  // width={"fit-content"}
                />
              </FormControl>
              <FormControl mr={"4"} isRequired>
                <FormLabel>Date</FormLabel>
                <SingleDatepicker
                  disabled={!!rosterDetails}
                  date={date ? new Date(date) : undefined}
                  onDateChange={(date) =>
                    setDate(moment(date).format("YYYY-MM-DD"))
                  }
                  minDate={subDays(
                    moment(subMonths(moment().toDate(), 1))
                      .set(
                        "D",
                        moment(payrollConfig.currentPStartDateTime).get("D"),
                      )
                      .toDate(),
                    1,
                  )}
                  maxDate={moment()
                    .set(
                      "D",
                      moment(payrollConfig.currentPEndDateTime).get("D"),
                    )
                    .toDate()}
                  configs={{
                    dateFormat: "dd-MM-yyyy",
                  }}
                />
              </FormControl>
              <Flex>
                <Button
                  isDisabled={!empId || !date || isLoading}
                  onClick={() => {
                    if (!rosterDetails) {
                      getRosterDetails();
                    } else {
                      resetForm();
                    }
                  }}
                >
                  {rosterDetails ? (
                    "Reset"
                  ) : isLoading ? (
                    <Spinner />
                  ) : (
                    "Get Details"
                  )}
                </Button>
              </Flex>
            </Flex>
            <Flex width={"full"}>
              <Text
                width={"full"}
                background={"#fff7d6"}
                color={"#907400"}
                fontSize={"xs"}
                px={"4"}
                py={"2"}
                rounded={"md"}
                textAlign={"center"}
                mb={"4"}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: `Manual Hours section will close as scheduled on <strong>${formatDate(
                      payrollConfig.currentManualHourEndTime,
                      {
                        time: true,
                      },
                    )}</strong>. Please ensure all necessary changes are completed before this time.`,
                  }}
                ></span>
              </Text>
            </Flex>
          </>
        ) : null}
        {rosterDetails ? (
          <>
            <Flex
              direction={"column"}
              style={{
                marginBottom: 16,
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 0 4px 0 lightgray",
              }}
            >
              <Flex
                style={{
                  padding: "6px 10px",
                  borderBottom: "1px solid #d3d3d361",
                  minHeight: 56,
                }}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Flex direction={"column"} p={"2"}>
                  <Flex alignItems={"center"}>
                    <FaUser />
                    <Text fontSize={"md"} fontWeight={"bold"} ml={"2"}>
                      {rosterDetails.firstName + " " + rosterDetails.lastName}
                    </Text>
                    <Text mx={"2"} fontSize={"xl"}>
                      |
                    </Text>
                    <Text>{rosterDetails.empId}</Text>
                  </Flex>
                  <Flex mt={"2"} alignItems={"center"} color={"gray.600"}>
                    <Text fontSize={"sm"} mr={"2"}>
                      {formatDate(date)}
                    </Text>
                    <Flex
                      background={`${
                        statusMapping.find(
                          ({ value }) => value === rosterDetails.dayStatus,
                        )?.color || "black"
                      }1e`}
                      justifyContent={"center"}
                      rounded={"sm"}
                      py={"0.5"}
                      px={"2"}
                      width={"fit-content"}
                      border={`1px solid ${
                        statusMapping.find(
                          ({ value }) => value === rosterDetails.dayStatus,
                        )?.color || "black"
                      }`}
                    >
                      <Text
                        fontSize={"xs"}
                        color={
                          statusMapping.find(
                            ({ value }) => value === rosterDetails.dayStatus,
                          )?.color || "black"
                        }
                      >
                        {statusMapping.find(
                          ({ value }) => value === rosterDetails.dayStatus,
                        )?.label || rosterDetails.dayStatus}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>

                {getAction().length ? (
                  <Menu>
                    <MenuButton mr={"4"}>
                      <Button>Mark Action</Button>
                    </MenuButton>
                    <MenuList>
                      {getAction().map(({ label, value }) => (
                        <MenuItemOption
                          key={value}
                          onClick={() => changeAction(value)}
                          fontSize={"sm"}
                        >
                          {label}
                        </MenuItemOption>
                      ))}
                    </MenuList>
                  </Menu>
                ) : null}
              </Flex>

              <Flex flexWrap={"wrap"} background={"white"} py={"2"}>
                {[
                  {
                    key: "Cluster",
                    value:
                      rosterDetails.assignedClusterId && clusters.length
                        ? clusters.find(
                            ({ id }) => id === rosterDetails.assignedClusterId,
                          )?.name
                        : "-",
                  },
                  {
                    key: "Secondary Jobs",
                    value:
                      rosterDetails.assignedSJTypes &&
                      rosterDetails.assignedSJTypes.length
                        ? rosterDetails.assignedSJTypes.join(", ")
                        : "-",
                  },
                  {
                    key: "Total Working Hours",
                    value: `${
                      calculateTotalShiftDuration([
                        ...(rosterDetails.main ?? []),
                        ...(rosterDetails.others ?? []),
                        ...(rosterDetails.misc ?? []),
                        ...(rosterDetails.secondaryMisc ?? []),
                      ]).totalDurationInHours -
                      (getIsLunchExist({
                        main: rosterDetails.main ?? [],
                        misc: [
                          ...(rosterDetails.misc || []),
                          ...(rosterDetails.secondaryMisc || []),
                        ],
                        others: rosterDetails.others ?? [],
                      })
                        ? 1
                        : 0)
                    }`,
                  },
                  {
                    key: "Lunch Hours",
                    value: `${
                      getIsLunchExist({
                        main: rosterDetails.main ?? [],
                        misc: [
                          ...(rosterDetails.misc || []),
                          ...(rosterDetails.secondaryMisc || []),
                        ],
                        others: rosterDetails.others ?? [],
                      })
                        ? "1"
                        : "-"
                    }`,
                  },
                ].map(({ key, value }, i) => {
                  return (
                    <Flex
                      minWidth={"50%"}
                      key={key + "_" + value}
                      px={"4"}
                      py={"1"}
                    >
                      <Text minWidth={"45%"} fontSize={"sm"}>
                        {key}:
                      </Text>

                      <Text fontWeight={"medium"} fontSize={"sm"}>
                        {value ?? "--"}
                      </Text>
                    </Flex>
                  );
                })}
              </Flex>
            </Flex>
            {["BLANK", "WORKING", "WORKING_HOLIDAY", "HOLIDAY"].includes(
              rosterDetails.dayStatus,
            ) ? (
              <Flex justifyContent={"flex-end"} mb={"4"}>
                {isEdit ? (
                  <>
                    <Button
                      variant={"outline"}
                      onClick={() => {
                        setIsEdit(false);
                        setDraftTypes({});
                        setMainDraft(cloneDeep(rosterDetails.main || []));
                        setOthersDraft(cloneDeep(rosterDetails.others || []));
                        setMiscDraft(cloneDeep(rosterDetails.misc || []));
                        setSecondaryMiscDraft(
                          cloneDeep(rosterDetails.secondaryMisc || []),
                        );
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      ml={"4"}
                      background={"#38A169"}
                      onClick={() => {
                        onFinalSave();
                      }}
                      isLoading={isSaving}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    leftIcon={<FiEdit />}
                    onClick={() => {
                      setIsEdit(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Flex>
            ) : null}

            <Grid gridTemplateColumns={"1fr 1fr 1fr 1fr"} gap={"4"}>
              <Flex
                direction={"column"}
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: "0 0 4px 0 lightgray",
                }}
              >
                <Flex
                  style={{
                    padding: "6px 10px",
                    borderBottom: "1px solid #d3d3d361",
                    minHeight: 56,
                  }}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Text
                    fontWeight={"medium"}
                    style={{
                      padding: "4px 12px",
                    }}
                    minWidth={"13%"}
                    display={"flex"}
                  >
                    Primary Shifts
                    {draftTypes["main"] ? (
                      <Flex
                        ml={"2"}
                        style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: "#027DBC",
                        }}
                      ></Flex>
                    ) : null}
                  </Text>
                  {rosterDetails.assignedClusterId ? (
                    <Button
                      size={"xs"}
                      fontSize={"xs"}
                      variant={"outline"}
                      onClick={() => onAddShiftModalOpen("main")}
                      mr={"1"}
                      isDisabled={!isEdit}
                    >
                      + Add Shift
                    </Button>
                  ) : null}
                </Flex>
                {mainDraft?.length ? (
                  <Flex
                    flexWrap={"wrap"}
                    background={"white"}
                    flex={1}
                    direction={"column"}
                    px={"2"}
                  >
                    {cloneDeep(mainDraft)
                      .sort((a, b) => a.s.localeCompare(b.s))
                      .map(({ s, e }, i) => {
                        return (
                          <Flex
                            key={i}
                            py={"2"}
                            px={"2"}
                            alignItems={"center"}
                            justifyContent={"space-between"}
                            borderTop={i === 0 ? "none" : "1px solid lightgray"}
                          >
                            <Flex>
                              <Text fontSize={"sm"}>
                                {s && e
                                  ? `${moment(s, "HH:mm:ss")
                                      .format("h:mm A")
                                      .replaceAll(":00", "")} - ${moment(
                                      e,
                                      "HH:mm:ss",
                                    )
                                      .format("h:mm A")
                                      .replaceAll(":00", "")}`
                                  : ""}
                              </Text>
                            </Flex>
                            <Flex>
                              <IconButton
                                aria-label="mainEdit"
                                size={"sm"}
                                variant={"ghost"}
                                onClick={() =>
                                  onEditShiftModalOpen("main", s, e, "", 0)
                                }
                                isDisabled={!isEdit}
                              >
                                <FiEdit />
                              </IconButton>
                              <IconButton
                                ml={"2"}
                                aria-label="mainDelete"
                                size={"sm"}
                                variant={"ghost"}
                                colorScheme="red"
                                onClick={() =>
                                  onDeleteShiftModalOpen("main", s, e, "", 0)
                                }
                                isDisabled={!isEdit}
                              >
                                <AiFillDelete />
                              </IconButton>
                            </Flex>
                          </Flex>
                        );
                      })}
                  </Flex>
                ) : (
                  <Flex background={"white"} flex={1} justifyContent={"center"}>
                    <Text
                      fontSize={"xs"}
                      color={"red.400"}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      py={"4"}
                    >
                      <BsInfoCircle
                        style={{
                          marginRight: 4,
                        }}
                      />
                      No Shift Assigned
                    </Text>
                  </Flex>
                )}
              </Flex>
              <Flex
                direction={"column"}
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: "0 0 4px 0 lightgray",
                }}
              >
                <Flex
                  style={{
                    padding: "6px 10px",
                    borderBottom: "1px solid #d3d3d361",
                    minHeight: 56,
                  }}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Text
                    fontWeight={"medium"}
                    style={{
                      padding: "4px 12px",
                    }}
                    minWidth={"13%"}
                    display={"flex"}
                  >
                    Miscellaneous (Primary)
                    {draftTypes["misc"] ? (
                      <Flex
                        ml={"2"}
                        style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: "#027DBC",
                        }}
                      ></Flex>
                    ) : null}
                  </Text>
                  {rosterDetails.assignedClusterId ? (
                    <Button
                      size={"xs"}
                      fontSize={"xs"}
                      variant={"outline"}
                      onClick={() => onAddShiftModalOpen("misc")}
                      mr={"1"}
                      isDisabled={!isEdit}
                    >
                      + Add Shift
                    </Button>
                  ) : null}
                </Flex>
                {miscDraft?.length ? (
                  <Flex
                    flexWrap={"wrap"}
                    background={"white"}
                    flex={1}
                    direction={"column"}
                    px={"2"}
                  >
                    {cloneDeep(miscDraft)
                      .sort((a, b) => a.s.localeCompare(b.s))
                      .map(
                        ({ s, e, workId, plannedJob, secondaryJobType }, i) => {
                          return (
                            <Flex
                              key={i}
                              py={"2"}
                              px={"2"}
                              alignItems={"center"}
                              justifyContent={"space-between"}
                              borderTop={
                                i === 0 ? "none" : "1px solid lightgray"
                              }
                            >
                              <Flex alignItems={"center"}>
                                <Text fontSize={"sm"}>
                                  {s && e
                                    ? `${moment(s, "HH:mm:ss")
                                        .format("h:mm A")
                                        .replaceAll(":00", "")} - ${moment(
                                        e,
                                        "HH:mm:ss",
                                      )
                                        .format("h:mm A")
                                        .replaceAll(":00", "")}`
                                    : ""}
                                </Text>
                                <Flex
                                  ml={"2"}
                                  background={
                                    COLORS[
                                      (workId
                                        ? workId
                                        : SECONDARY_JOBS_CONFIG.findIndex(
                                            ({ jobType }) =>
                                              jobType === secondaryJobType,
                                          )) % COLORS.length
                                    ]
                                  }
                                  justifyContent={"center"}
                                  rounded={"sm"}
                                  py={"0.5"}
                                  px={"2"}
                                  width={"fit-content"}
                                >
                                  <Text fontSize={"xs"} fontWeight={"medium"}>
                                    {workId
                                      ? miscWorks.find(
                                          ({ id }) => id === workId,
                                        )?.name
                                      : SECONDARY_JOBS_CONFIG.find(
                                          ({ jobType }) =>
                                            jobType === secondaryJobType,
                                        )?.label}
                                  </Text>
                                </Flex>
                              </Flex>
                              <Flex>
                                <IconButton
                                  aria-label="EditButton"
                                  size={"sm"}
                                  variant={"ghost"}
                                  onClick={() =>
                                    onEditShiftModalOpen(
                                      "misc",
                                      s,
                                      e,
                                      "",
                                      workId,
                                      plannedJob,
                                      secondaryJobType,
                                    )
                                  }
                                  isDisabled={!isEdit}
                                >
                                  <FiEdit />
                                </IconButton>
                                <IconButton
                                  ml={"2"}
                                  aria-label="DeleteButton"
                                  size={"sm"}
                                  variant={"ghost"}
                                  colorScheme="red"
                                  onClick={() =>
                                    onDeleteShiftModalOpen(
                                      "misc",
                                      s,
                                      e,
                                      "",
                                      workId,
                                      plannedJob,
                                      secondaryJobType,
                                    )
                                  }
                                  isDisabled={!isEdit}
                                >
                                  <AiFillDelete />
                                </IconButton>
                              </Flex>
                            </Flex>
                          );
                        },
                      )}
                  </Flex>
                ) : (
                  <Flex background={"white"} flex={1} justifyContent={"center"}>
                    <Text
                      fontSize={"xs"}
                      color={"red.400"}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      py={"4"}
                    >
                      <BsInfoCircle
                        style={{
                          marginRight: 4,
                        }}
                      />
                      No Shift Assigned
                    </Text>
                  </Flex>
                )}
              </Flex>
              <Flex
                direction={"column"}
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: "0 0 4px 0 lightgray",
                }}
              >
                <Flex
                  style={{
                    padding: "6px 10px",
                    borderBottom: "1px solid #d3d3d361",
                    minHeight: 56,
                  }}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Text
                    fontWeight={"medium"}
                    style={{
                      padding: "4px 12px",
                    }}
                    minWidth={"13%"}
                    display={"flex"}
                  >
                    Secondary Shifts
                    {draftTypes["others"] ? (
                      <Flex
                        ml={"2"}
                        style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: "#027DBC",
                        }}
                      ></Flex>
                    ) : null}
                  </Text>
                  {rosterDetails.assignedSJTypes &&
                  rosterDetails.assignedSJTypes.length ? (
                    <Button
                      size={"xs"}
                      fontSize={"xs"}
                      variant={"outline"}
                      onClick={() => onAddShiftModalOpen("others")}
                      mr={"1"}
                      isDisabled={!isEdit}
                    >
                      + Add Shift
                    </Button>
                  ) : null}
                </Flex>
                {othersDraft?.length ? (
                  <Flex
                    flexWrap={"wrap"}
                    background={"white"}
                    flex={1}
                    direction={"column"}
                    px={"2"}
                  >
                    {cloneDeep(othersDraft)
                      .sort((a, b) => a.s.localeCompare(b.s))
                      .map(({ s, e, type }, i) => {
                        return (
                          <Flex
                            key={i}
                            py={"2"}
                            px={"2"}
                            alignItems={"center"}
                            justifyContent={"space-between"}
                            borderTop={i === 0 ? "none" : "1px solid lightgray"}
                          >
                            <Flex alignItems={"center"}>
                              <Text fontSize={"sm"}>
                                {s && e
                                  ? `${moment(s, "HH:mm:ss")
                                      .format("h:mm A")
                                      .replaceAll(":00", "")} - ${moment(
                                      e,
                                      "HH:mm:ss",
                                    )
                                      .format("h:mm A")
                                      .replaceAll(":00", "")}`
                                  : ""}
                              </Text>
                              <Flex
                                ml={"2"}
                                background={
                                  COLORS[
                                    SECONDARY_JOBS_CONFIG.findIndex(
                                      ({ jobType }) => jobType === type,
                                    ) % COLORS.length
                                  ]
                                }
                                justifyContent={"center"}
                                rounded={"sm"}
                                py={"0.5"}
                                px={"2"}
                                width={"fit-content"}
                              >
                                <Text fontSize={"xs"} fontWeight={"medium"}>
                                  {type}
                                </Text>
                              </Flex>
                            </Flex>
                            <Flex>
                              <IconButton
                                aria-label="otherEdit"
                                size={"sm"}
                                variant={"ghost"}
                                onClick={() =>
                                  onEditShiftModalOpen("others", s, e, type, 0)
                                }
                                isDisabled={!isEdit}
                              >
                                <FiEdit />
                              </IconButton>
                              <IconButton
                                ml={"2"}
                                aria-label="deleteEdit"
                                size={"sm"}
                                variant={"ghost"}
                                colorScheme="red"
                                onClick={() =>
                                  onDeleteShiftModalOpen(
                                    "others",
                                    s,
                                    e,
                                    type,
                                    0,
                                  )
                                }
                                isDisabled={!isEdit}
                              >
                                <AiFillDelete />
                              </IconButton>
                            </Flex>
                          </Flex>
                        );
                      })}
                  </Flex>
                ) : (
                  <Flex background={"white"} flex={1} justifyContent={"center"}>
                    <Text
                      fontSize={"xs"}
                      color={"red.400"}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      py={"4"}
                    >
                      <BsInfoCircle
                        style={{
                          marginRight: 4,
                        }}
                      />
                      No Shift Assigned
                    </Text>
                  </Flex>
                )}
              </Flex>
              <Flex
                direction={"column"}
                style={{
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: "0 0 4px 0 lightgray",
                }}
              >
                <Flex
                  style={{
                    padding: "6px 10px",
                    borderBottom: "1px solid #d3d3d361",
                    minHeight: 56,
                  }}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <Text
                    fontWeight={"medium"}
                    style={{
                      padding: "4px 12px",
                    }}
                    minWidth={"13%"}
                    display={"flex"}
                  >
                    Miscellaneous (Secondary)
                    {draftTypes["secondaryMisc"] ? (
                      <Flex
                        ml={"2"}
                        style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: "#027DBC",
                        }}
                      ></Flex>
                    ) : null}
                  </Text>
                  {rosterDetails.assignedSJTypes?.length ? (
                    <Button
                      size={"xs"}
                      fontSize={"xs"}
                      variant={"outline"}
                      onClick={() => onAddShiftModalOpen("secondaryMisc")}
                      mr={"1"}
                      isDisabled={!isEdit}
                    >
                      + Add Shift
                    </Button>
                  ) : null}
                </Flex>
                {secondaryMiscDraft?.length ? (
                  <Flex
                    flexWrap={"wrap"}
                    background={"white"}
                    flex={1}
                    direction={"column"}
                    px={"2"}
                  >
                    {cloneDeep(secondaryMiscDraft)
                      .sort((a, b) => a.s.localeCompare(b.s))
                      .map(({ s, e, workId, plannedJob, type }, i) => {
                        return (
                          <Flex
                            key={i}
                            py={"2"}
                            px={"2"}
                            alignItems={"center"}
                            justifyContent={"space-between"}
                            borderTop={i === 0 ? "none" : "1px solid lightgray"}
                          >
                            <Flex alignItems={"center"}>
                              <Text fontSize={"sm"}>
                                {s && e
                                  ? `${moment(s, "HH:mm:ss")
                                      .format("h:mm A")
                                      .replaceAll(":00", "")} - ${moment(
                                      e,
                                      "HH:mm:ss",
                                    )
                                      .format("h:mm A")
                                      .replaceAll(":00", "")}`
                                  : ""}
                              </Text>
                              <Flex
                                ml={"2"}
                                background={
                                  COLORS[
                                    (workId
                                      ? workId
                                      : SECONDARY_JOBS_CONFIG.findIndex(
                                          ({ jobType }) =>
                                            jobType === secondaryJobType,
                                        )) % COLORS.length
                                  ]
                                }
                                justifyContent={"center"}
                                rounded={"sm"}
                                py={"0.5"}
                                px={"2"}
                                width={"fit-content"}
                              >
                                <Text fontSize={"xs"} fontWeight={"medium"}>
                                  {workId
                                    ? `${
                                        miscWorks.find(
                                          ({ id }) => id === workId,
                                        )?.name
                                      } (${
                                        SECONDARY_JOBS_CONFIG.find(
                                          ({ jobType }) => jobType === type,
                                        )?.label
                                      })`
                                    : SECONDARY_JOBS_CONFIG.find(
                                        ({ jobType }) =>
                                          jobType === secondaryJobType,
                                      )?.label}
                                </Text>
                              </Flex>
                            </Flex>
                            <Flex>
                              <IconButton
                                aria-label="EditButton"
                                size={"sm"}
                                variant={"ghost"}
                                onClick={() =>
                                  onEditShiftModalOpen(
                                    "secondaryMisc",
                                    s,
                                    e,
                                    type,
                                    workId,
                                    plannedJob,
                                    secondaryJobType,
                                  )
                                }
                                isDisabled={!isEdit}
                              >
                                <FiEdit />
                              </IconButton>
                              <IconButton
                                ml={"2"}
                                aria-label="DeleteButton"
                                size={"sm"}
                                variant={"ghost"}
                                colorScheme="red"
                                onClick={() =>
                                  onDeleteShiftModalOpen(
                                    "secondaryMisc",
                                    s,
                                    e,
                                    type,
                                    workId,
                                    plannedJob,
                                    secondaryJobType,
                                  )
                                }
                                isDisabled={!isEdit}
                              >
                                <AiFillDelete />
                              </IconButton>
                            </Flex>
                          </Flex>
                        );
                      })}
                  </Flex>
                ) : (
                  <Flex background={"white"} flex={1} justifyContent={"center"}>
                    <Text
                      fontSize={"xs"}
                      color={"red.400"}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      py={"4"}
                    >
                      <BsInfoCircle
                        style={{
                          marginRight: 4,
                        }}
                      />
                      No Shift Assigned
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Grid>
            <Flex width={"full"}>
              <Text
                width={"full"}
                background={"#f7f7f7"}
                color={"#013f5e"}
                fontSize={"xs"}
                px={"4"}
                py={"2"}
                rounded={"md"}
                textAlign={"center"}
                mt={"4"}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <BsInfoCircle
                  style={{
                    marginRight: 4,
                  }}
                />
                <span
                  dangerouslySetInnerHTML={{
                    __html: `Only published roster days are shown for update in manual hours module.`,
                  }}
                ></span>
              </Text>
            </Flex>
          </>
        ) : null}
      </Flex>

      {globalStatus === "FUTURE" && payrollConfig ? (
        <AppNoData
          hideImage={showTimer && timeRemaining > 0}
          msg={
            showTimer && timeRemaining > 0
              ? `Manual hours window will be open in </br>${timerUI(
                  timeRemaining,
                )}`
              : `Manual hours window will be open from </br><strong>${formatDate(
                  payrollConfig.currentManualHourStartTime,
                  { time: true },
                )}</strong> to <strong>${formatDate(
                  payrollConfig.currentManualHourEndTime,
                  {
                    time: true,
                  },
                )}</strong>.`
          }
        />
      ) : null}
      {globalStatus === "PAST" && payrollConfig ? (
        <AppNoData msg={`Manual hours window has now been closed.`} />
      ) : null}

      <Modal isOpen={isShiftOpen} onClose={onShiftClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {!shiftUniqueId ? "Add" : "Edit"}
            {` ${
              selectedShiftType === "main"
                ? "Primary"
                : selectedShiftType === "others"
                  ? "Secondary"
                  : "Miscellaneous"
            }`}
            {" Shift"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Start Time</FormLabel>
              <AppSelect
                options={startTimeSlots}
                onChange={(value) => {
                  setStartTime(value);
                  setEndTime("");
                }}
                value={startTime}
              />
            </FormControl>
            <FormControl mb={"4"} isRequired>
              <FormLabel>End Time</FormLabel>
              <AppSelect
                options={endTimeSlots}
                onChange={setEndTime}
                value={endTime}
              />
              {getDuration(
                moment(startTime, "HH:mm:ss"),
                moment(endTime, "HH:mm:ss"),
              ).durationHours >= LUNCH_INCLUDE ? (
                <FormHelpText>Lunch: 1hr</FormHelpText>
              ) : null}
            </FormControl>
            {(selectedShiftType === "others" ||
              selectedShiftType === "secondaryMisc") &&
            rosterDetails ? (
              <FormControl mb={"4"}>
                <FormLabel>Secondary Job</FormLabel>
                <AppSelect
                  placeholder="Select"
                  value={type}
                  onChange={(type) => setType(type)}
                  options={storeSecondaryJobs
                    .filter(({ jobType }) =>
                      rosterDetails.assignedSJTypes.includes(jobType),
                    )
                    .sort((a, b) => a.jobType.localeCompare(b.jobType))
                    .map(({ jobType }) => ({
                      label: SECONDARY_JOBS_CONFIG.find(
                        (obj) => jobType === obj.jobType,
                      )?.label,
                      value: jobType,
                    }))}
                />
              </FormControl>
            ) : null}
            {selectedShiftType === "misc" ||
            selectedShiftType === "secondaryMisc" ? (
              <FormControl mb={"4"}>
                <FormLabel>Miscellaneous Job</FormLabel>
                <AppSelect
                  disabled={plannedJob}
                  placeholder="Select"
                  value={!plannedJob ? workId : secondaryJobType}
                  onChange={(type) => setWorkId(type)}
                  options={
                    !plannedJob
                      ? miscWorks
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(({ id, name }) => ({
                            label: name,
                            value: id,
                          }))
                      : [
                          {
                            label: SECONDARY_JOBS_CONFIG.find(
                              (obj) => secondaryJobType === obj.jobType,
                            )?.label,
                            value: secondaryJobType,
                          },
                        ]
                  }
                />
                {plannedJob ? (
                  <FormHelpText>
                    Assigned Planned Job Type cannot be changed
                  </FormHelpText>
                ) : null}
              </FormControl>
            ) : null}

            <FormControl mb={"4"}>
              <FormLabel>Comment</FormLabel>
              <Textarea
                placeholder="Enter here"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter flexDirection={"column"}>
            <Flex width={"full"}>
              {err ? (
                <Flex width={"full"}>
                  <Text
                    width={"full"}
                    background={"#fff7d6"}
                    color={"#907400"}
                    fontSize={"xs"}
                    px={"4"}
                    py={"2"}
                    rounded={"md"}
                    textAlign={"center"}
                    mb={"4"}
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: err,
                      }}
                    ></span>
                  </Text>
                </Flex>
              ) : null}
            </Flex>
            <Flex width={"full"} justifyContent={"flex-end"}>
              <Button
                variant="outline"
                fontSize={"sm"}
                mr={3}
                onClick={onShiftClose}
              >
                Close
              </Button>
              <Button
                isDisabled={
                  !startTime ||
                  !endTime ||
                  ((selectedShiftType === "others" ||
                    selectedShiftType === "secondaryMisc") &&
                  !type
                    ? true
                    : false) ||
                  ((selectedShiftType === "misc" ||
                    selectedShiftType === "secondaryMisc") &&
                  (plannedJob ? false : !workId)
                    ? true
                    : false)
                }
                onClick={() => onSaveShift()}
              >
                {isLoading ? <Spinner /> : "Save"}
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isShiftDeleteConfirmationOpen}
        onClose={onShiftDeleteConfirmationClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Shift</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to Delete Shift?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onShiftDeleteConfirmationClose}
            >
              Close
            </Button>
            <Button
              aria-label="DeleteShift"
              colorScheme="red"
              variant={"solid"}
              onClick={onSaveShift}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Drawer
        placement={"bottom"}
        onClose={onViewHistoryClose}
        isOpen={isViewHistoryOpen}
        isFullHeight
      >
        <DrawerOverlay />
        <DrawerContent maxH={`calc(100vh - ${NAV_HEIGHT}px)`}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">{`Manual Hours Entries (${
            yearMonthListing.find(({ value }) => value === selectedYearMonth)
              ?.label || ""
          })`}</DrawerHeader>
          <DrawerBody p={0}>
            {manualHours && manualHours.length ? (
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
                        Name
                      </Th>
                      <Th background="#EBF3F8" color="#616161">
                        Employee Id
                      </Th>
                      <Th background="#EBF3F8" color="#616161">
                        Action Taken
                      </Th>
                      <Th background="#EBF3F8" color="#616161">
                        Date
                      </Th>
                      <Th background="#EBF3F8" color="#616161">
                        Comment
                      </Th>
                      <Th background="#EBF3F8" color="#616161">
                        Previous Hours
                      </Th>
                      <Th background="#EBF3F8" color="#616161">
                        Updated Hours
                      </Th>
                      <Th background="#EBF3F8" color="#616161">
                        Modified On
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody fontSize={"sm"}>
                    {manualHours
                      .sort(
                        (a, b) =>
                          new Date(b.modifiedDate).getTime() -
                          new Date(a.modifiedDate).getTime(),
                      )
                      .map(
                        (
                          {
                            action,
                            comment,
                            date,
                            empId,
                            fistName,
                            lastName,
                            modifiedDate,
                            prevHours,
                            updatedHours,
                          },
                          i,
                        ) => (
                          <Tr key={modifiedDate + empId}>
                            <Td py={"3"}>{fistName + " " + lastName}</Td>
                            <Td py={"3"}>{empId}</Td>
                            <Td py={"3"}>
                              <Badge>{action.replaceAll("_", " ")}</Badge>
                            </Td>
                            <Td py={"3"}>{formatDate(date)}</Td>
                            <Td py={"3"}>{comment}</Td>
                            <Td py={"3"} textAlign={"center"}>
                              {prevHours}
                            </Td>
                            <Td py={"3"} textAlign={"center"}>
                              {updatedHours}
                            </Td>
                            <Td py={"3"}>
                              {formatDate(modifiedDate, { time: true })}
                            </Td>
                          </Tr>
                        ),
                      )}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <AppNoData msg="" />
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </AppContainer>
  );
}

export default ManualHours;
