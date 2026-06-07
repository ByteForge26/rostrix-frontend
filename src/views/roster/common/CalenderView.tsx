import {
  Badge,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Stack,
  Text,
  Textarea,
  Tooltip,
  UnorderedList,
  useDisclosure,
} from "@chakra-ui/react";
import { FiCopy, FiInfo, FiMoreHorizontal } from "react-icons/fi";
import {
  COLORS,
  COMMENT_MAX_LENGTH,
  DAYS,
  DAYS_FULL,
  DEFAULT_CLOSE_TIME,
  DEFAULT_OPEN_TIME,
  DEFAULT_START_TIME,
  GRAPH_COLORS,
  LAYOUT,
  MAX_SHIFT_WITH_LUNCH,
  MONTHS_SHORT,
  ROSTER_CELL_HEIGHT,
  ROSTER_DAY_CARD_MIN_HEIGHT,
  ROSTER_EMPLOYEE_CELL_HEIGHT,
  SECONDARY_JOBS_CONFIG,
  TIME_GAP,
} from "../../../helper/Constant";

import { cloneDeep } from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { useAppSelector } from "../../../app/store/store";
import AppNoData from "../../../components/AppNoData";
import AppRightDrawer from "../../../components/AppRightDrawer";
import AppSelect from "../../../components/AppSelect";
import { ENDPOINT } from "../../../config/endpoint.config";
import {
  IApiResponse,
  IAssignedJobShift,
  IClusterResponse,
  IMiscWork,
  IRecommendedHours,
  IRoster,
  IRosterDay,
  IRosterHookProps,
  IShift,
} from "../../../helper/Interface";
import {
  convertTime,
  findRosterCell,
  formatDate,
  generateTimeSlots,
  getCellNewStatus,
  getDuration,
  getIsPartTime,
  getShiftStatusV2,
  similerShiftExist,
} from "../../../helper/Utils";
import { useApi } from "../../../hooks/useApi";
import { HOLIDAY_COLOR } from "../../../hooks/useCalender";

import { AiTwotoneSetting } from "react-icons/ai";
import { BsInfoCircle, BsPlus } from "react-icons/bs";
import BottomBar from "./BottomBar";
import EmployeeCell from "./EmployeeCell";

interface IProps {
  readonly editable?: boolean;
  readonly dayChangable?: boolean;
  readonly roster?: IRoster;
  readonly onChangeSelectedDay?: (dayId: string) => void;
  readonly onDuplicateClick?: (duplicateDates: string[]) => void;
  readonly isDuplicateModalOpen?: boolean;
  readonly onDuplicateModalClose?: () => void;
  readonly onDuplicateModalOpen?: () => void;
  readonly finalDuplicateDayIds?: string[];
  readonly shifts?: IShift[];
  readonly onShiftChange?: (
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
    }[]
  ) => void;
  readonly getShifts?: () => void;
  readonly rosterType: IRosterHookProps["rosterType"];
  readonly clusters?: IClusterResponse[];
  readonly miscWorks?: IMiscWork[];
  readonly onRemoveMiscShift?: (props: {
    empId: string;
    id: number;
    shift: {
      startTime: string;
      endTime: string;
      workId?: number;
      secondaryJobType?: string;
      comment?: string;
    };
  }) => void;
  readonly assignedJobShifts?: IAssignedJobShift[];
  readonly recommendedHours?: IRecommendedHours[];
  readonly isRecommendedHoursLoading?: boolean;
}

function CalenderView(props: IProps) {
  const { post } = useApi();
  const { addToast } = useToasts();
  const { user, contractTypes } = useAppSelector((state) => state.auth);
  const [err, setErr] = useState("");
  const {
    editable,
    dayChangable,
    finalDuplicateDayIds,
    isDuplicateModalOpen,
    onChangeSelectedDay,
    onDuplicateClick,
    onDuplicateModalClose,
    onDuplicateModalOpen,
    shifts,
    roster,
    onShiftChange,
    getShifts,
    rosterType,
    clusters,
    miscWorks,
    onRemoveMiscShift,
    assignedJobShifts,
    recommendedHours,
    isRecommendedHoursLoading,
  } = props;
  const {
    draft,
    selectedWeek,
    selectedDate,
    selectedJobType,
    selectedClusterId,
    empExceedingHoursList,
  } = useAppSelector((state) => state.roster);
  const { selectedCostCenterName } = useAppSelector((state) => state.auth);
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState("");
  const [contractTypeId, setContractTypeId] = useState(0);
  const [clusterId, setClusterId] = useState(0);
  const [empId, setEmpId] = useState<string>("");
  const [dayId, setDayId] = useState<number>(0);
  const [status, setStatus] = useState<string>("");
  const [duplicateDates, setDuplicateDates] = useState<string[]>([]);
  const [miscWork, setMiscWork] = useState<IMiscWork>();
  const [startTimeSlots, setStartTimeSlots] = useState(
    generateTimeSlots(DEFAULT_OPEN_TIME, DEFAULT_CLOSE_TIME)
  );
  const [endTimeSlots, setEndTimeSlots] =
    useState<{ label: string; value: string }[]>();

  const {
    isOpen: isAddShiftOpen,
    onOpen: onAddShiftOpen,
    onClose: onAddShiftClose,
  } = useDisclosure();

  const {
    isOpen: isAddCJPShiftOpen,
    onOpen: onAddCJPShiftOpen,
    onClose: onAddCJPShiftClose,
  } = useDisclosure();
  const [type, setType] = useState("");
  const [miscWorkId, setMiscWorkId] = useState(0);
  const [jobType, setJobType] = useState("");
  const [minStartTime, setMinStartTime] = useState("");
  const [maxEndTime, setMaxEndTime] = useState("");
  const [date, setDate] = useState("");
  const [comment, setComment] = useState("");
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<
    {
      empId: string;
      info: string;
    }[]
  >([]);

  const findDate = (days: IRosterDay[], date: string) => {
    if (!days || !date || days.length === 0) {
      return undefined;
    }
    const temp = days.find((obj) => obj.date === date) ?? undefined;
    if (temp?.main && temp.main[0]) {
      return temp.main;
    }
    return undefined;
  };

  const getImpactLabel = (key: string) => {
    return [
      "This is some dummy text for impacted.",
      "This is some dummy text for impacted.",
    ];
  };
  const onSaveShift = async () => {
    if (
      shifts?.length &&
      similerShiftExist({
        shifts,
        clusterId,
        contractTypeId,
        endTime,
        startTime,
      })
    ) {
      setErr("The shift you are trying to add already exists!");
      return;
    }
    if (roster) {
      const emp = roster.empWeekRosters.filter((obj) => obj.empId === empId)[0];
      const cell = emp.days.filter(({ id }) => id === dayId)[0];
      const {
        isShiftMaxDurationExceed,
        isConflictWithPrimary,
        isConflictWithSecondary,
        error,
      } = getShiftStatusV2({
        currentShift: {
          startTime,
          endTime,
          type: rosterType,
        },
        main: [...(cell?.main ?? [])],
        others: [...(cell?.others ?? [])],
        misc: [...(cell?.misc ?? [])],
        isPartTime: getIsPartTime({
          contractTypeId: emp.contractId,
          contractTypes,
        }),
      });
      if (isConflictWithPrimary) {
        setErr(error);
        return;
      }
      if (isConflictWithSecondary) {
        setErr(error);
        return;
      }
      if (isShiftMaxDurationExceed) {
        setErr(error);
        return;
      }
      setErr("");
      onAddShiftClose();
      const res = await post<IApiResponse>(ENDPOINT["/shift"][""], {
        data: {
          costCentre: selectedCostCenterName,
          jobType: rosterType === "primary" ? LAYOUT : selectedJobType,
          startTime,
          endTime,
          contractTypeId,
          clusterId: rosterType === "primary" ? clusterId : undefined,
        },
      });
      addToast(res.message, {
        appearance: res.success ? "success" : "error",
      });
      if (res.success && getShifts) {
        getShifts();
        if (onShiftChange && roster) {
          const cell = roster.empWeekRosters
            .filter((obj) => obj.empId === empId)[0]
            .days.filter(({ id }) => id === dayId)[0];
          onShiftChange([
            {
              empId,
              id: dayId,
              status,
              shifts: [{ endTime, startTime }],
            },
          ]);
          setEmpId("");
          setDayId(0);
          setStatus("");
          setStartTime(DEFAULT_START_TIME);
          setEndTime("");
        }
      }
    }
  };

  useEffect(() => {
    if (startTime) {
      setEndTime("");
      if (startTime === (maxEndTime || DEFAULT_CLOSE_TIME)) {
        setEndTimeSlots([]);
        return;
      }
      const newStartTime = moment(startTime, "HH:mm:ss")
        .add({ minutes: TIME_GAP })
        .format("HH:mm:ss");
      let newEndTime = moment(startTime, "HH:mm:ss")
        .add({ hours: MAX_SHIFT_WITH_LUNCH })
        .format("HH:mm:ss");

      if (newEndTime < DEFAULT_CLOSE_TIME && newEndTime < startTime) {
        let newHours = getDuration(
          moment(startTime, "HH:mm:ss"),
          moment(DEFAULT_CLOSE_TIME, "HH:mm:ss")
        ).durationHours;

        newEndTime = moment(startTime, "HH:mm:ss")
          .add({ hours: newHours })
          .format("HH:mm:ss");
      }
      setEndTimeSlots(
        generateTimeSlots(newStartTime, maxEndTime || newEndTime, startTime)
      );
    }
  }, [startTime, maxEndTime]);

  useEffect(() => {
    if (minStartTime && maxEndTime) {
      setStartTimeSlots(generateTimeSlots(minStartTime, maxEndTime));
    }
  }, [minStartTime, maxEndTime]);

  const isDateExist = (pstartDate: string, pendDate: string) => {
    if (!empExceedingHoursList || !empExceedingHoursList.length) {
      return false;
    }
    if (roster && roster.empWeekRosters && roster.empWeekRosters.length) {
      let isErrorExist = false;
      roster.empWeekRosters[0].days.forEach(({ date }) => {
        if (
          moment(date).unix() >= moment(pstartDate).unix() &&
          moment(date).unix() <= moment(pendDate).unix()
        ) {
          isErrorExist = true;
        }
      });
      return isErrorExist;
    } else {
      return false;
    }
  };
  const findCJPShifts = ({
    assignedJobShifts,
    date,
  }: {
    date: string;
    assignedJobShifts: IAssignedJobShift[];
  }) => {
    let jobs: {
      jobType: string;
      miscWorkId: number;
      type: string;
      endTime: string;
      id: number;
      startTime: string;
    }[] = [];
    const day = assignedJobShifts.find((shift) => shift.date === date);
    if (day) {
      day.jobs.forEach(({ jobType, miscWorkId, shifts, type }) => {
        shifts.forEach(({ endTime, id, startTime }) => {
          jobs.push({
            jobType,
            miscWorkId,
            type,
            endTime,
            id,
            startTime,
          });
        });
      });
    }
    return jobs;
  };
  const onSaveCJPShift = () => {
    const tempErrors: {
      empId: string;
      info: string;
    }[] = [];

    selectedEmpIds.forEach((empId) => {
      let isError = false;
      const empRoster = roster?.empWeekRosters.find(
        (obj) => obj.empId === empId
      );
      if (empRoster && date) {
        const rosterCellTemp = findRosterCell(empRoster.days, date);
        if (
          rosterCellTemp &&
          rosterCellTemp.edit &&
          !["NA", "LEAVE", "WEEK_OFF"].includes(rosterCellTemp.status)
        ) {
          const {
            isShiftMaxDurationExceed,
            isConflictWithSecondary,
            isConflictWithMisc,
            error,
          } = getShiftStatusV2({
            currentShift: {
              startTime,
              endTime,
              type: "misc",
            },
            main: rosterCellTemp.main ?? [],
            others: rosterCellTemp.others,
            misc: rosterCellTemp.misc ?? [],
            isPartTime: getIsPartTime({
              contractTypeId: empRoster.contractId,
              contractTypes,
            }),
          });
          if (isShiftMaxDurationExceed) {
            isError = true;
            tempErrors.push({
              empId,
              info: error,
            });
          }
          if (!isError && isConflictWithSecondary) {
            isError = true;
            tempErrors.push({
              empId,
              info: error,
            });
          }
          if (!isError && isConflictWithMisc) {
            isError = true;
            tempErrors.push({
              empId,
              info: error,
            });
          }
        }
      }
    });
    setErrors(tempErrors);
    if (tempErrors.length === 0) {
      setErr("");
      onAddCJPShiftClose();
      if (onShiftChange) {
        const rosterCells: IRosterDay[] = [];
        selectedEmpIds.forEach((empId) => {
          const empRoster = roster?.empWeekRosters.find(
            (obj) => obj.empId === empId
          );
          if (empRoster && date) {
            const rosterCellTemp = findRosterCell(empRoster.days, date);
            if (
              rosterCellTemp &&
              rosterCellTemp.edit &&
              !["NA", "LEAVE", "WEEK_OFF"].includes(rosterCellTemp.status)
            ) {
              rosterCells.push(rosterCellTemp);
            }
          }
        });

        if (rosterCells.length) {
          onShiftChange(
            rosterCells.map((rosterCell) => ({
              empId: rosterCell.empId,
              id: rosterCell.id,
              shifts: [
                {
                  endTime,
                  startTime,
                  comment: comment,
                  workId: type === "MISCELLANEOUS" ? miscWorkId : undefined,
                  plannedJob: true,
                  secondaryJobType:
                    type === "MISCELLANEOUS" ? undefined : jobType,
                },
              ],
              status: getCellNewStatus(rosterCell.status),
            }))
          );
          setComment("");
          setStartTime("");
          setEndTime("");
        }
      }
    } else {
      setErr(
        "Adding the new shift will increase working hours or overlap with current shifts for some employees. Please review their schedules and either remove them from the conflicting shift or assign them a different one that fits their availability."
      );
    }
  };
  const getTotalHours = (date: string, category: string) => {
    let rosteredHours = 0;
    let hours = 0;
    const recObj = recommendedHours?.find((obj) => obj.date === date);
    if (recObj?.recommendedHours.length) {
      const rec = recObj.recommendedHours.find(
        (obj) => obj.category === category
      );
      if (rec) {
        hours = rec.hours;
        rosteredHours = rec.rosteredHours;
      }
    }

    return { rosteredHours, hours };
  };
  const getRecArray = (date?: string) => {
    if (
      recommendedHours?.length &&
      recommendedHours[0].recommendedHours.length
    ) {
      return recommendedHours[0].recommendedHours
        .sort((a, b) => a.category.localeCompare(b.category))
        .map(({ category }) => {
          const { rosteredHours, hours } = getTotalHours(date || "", category);
          const { color, recommendedHoursInfo, recommendedHoursLabel } =
            GRAPH_COLORS.find(
              ({ recommendedHoursKey }) => recommendedHoursKey === category
            ) || GRAPH_COLORS[0];
          return {
            category,
            rosteredHours,
            hours,
            color,
            recommendedHoursInfo,
            recommendedHoursLabel,
          };
        });
    }
    return [];
  };
  return (
    <Flex width={"100%"} background={"white"}>
      {roster?.empWeekRosters?.length && contractTypes?.length ? (
        <>
          <Flex
            width={`${ROSTER_EMPLOYEE_CELL_HEIGHT}px`}
            borderRight={"1px solid #f1f1f1"}
            flexDirection={"column"}
          >
            <Flex
              borderBottom={"1px solid #d4d4d4"}
              height={`${ROSTER_DAY_CARD_MIN_HEIGHT}px`}
            ></Flex>
            {assignedJobShifts?.length ? (
              <Flex
                borderBottom={"1px solid #d4d4d4"}
                height={`${ROSTER_CELL_HEIGHT - 36}px`}
                alignItems={"center"}
                pl={"4"}
                background={"#F8F8F8"}
                fontSize={"xs"}
                color={"gray.600"}
              >
                <Tooltip
                  hasArrow
                  label="These jobs are assigned by the leader for the respective days and timings, click on them to assign them to employees."
                >
                  <Text>
                    <BsInfoCircle />
                  </Text>
                </Tooltip>

                <Text ml={"1"}>Assigned Planned Jobs</Text>
              </Flex>
            ) : null}
            {isRecommendedHoursLoading}
            {getRecArray().map(
              ({
                category,
                color,
                recommendedHoursInfo,
                recommendedHoursLabel,
              }) => {
                return (
                  <Flex
                    borderBottom={"1px solid #d4d4d4"}
                    height={`${28}px`}
                    alignItems={"center"}
                    px={"1"}
                    fontSize={"xs"}
                    justifyContent={"space-between"}
                    gap={"2"}
                    key={category}
                  >
                    {isRecommendedHoursLoading ? (
                      <Flex py={"1"} width={"full"} height={"full"}>
                        <Skeleton
                          height={"full"}
                          width={"full"}
                          startColor={`${color}80`}
                          endColor={`${color}40`}
                        />
                      </Flex>
                    ) : (
                      <>
                        <Badge
                          variant={"solid"}
                          color={color}
                          background={`${color}1a`}
                          textTransform={"capitalize"}
                        >
                          <Flex alignItems={"center"} gap={"1"}>
                            <AiTwotoneSetting />
                            <Text>{recommendedHoursLabel} Hours</Text>
                          </Flex>
                        </Badge>
                        <Tooltip
                          hasArrow
                          label={
                            <Stack
                              background={"white"}
                              color={"black"}
                              alignItems={"center"}
                              my={1}
                              p={"2"}
                            >
                              <Text fontWeight={"medium"}>
                                Recommended from MyGame
                              </Text>
                              <Divider />

                              <Flex
                                alignItems={"center"}
                                gap={3}
                                width={"full"}
                                justifyContent={"space-between"}
                                px={"6"}
                              >
                                <Stack
                                  fontSize={"xs"}
                                  color={"gray.700"}
                                  gap={"0.5"}
                                  alignItems={"center"}
                                >
                                  <Text>{"Planned hours"}</Text>
                                  <Text>{"(from roster)"}</Text>
                                </Stack>

                                <Text fontSize={"xl"}>/</Text>
                                <Stack
                                  fontSize={"xs"}
                                  fontWeight={"medium"}
                                  color={color}
                                  gap={"0.5"}
                                  alignItems={"center"}
                                >
                                  <Text>{"Recommended hours"}</Text>
                                  <Text>{"(from MyGame)"}</Text>
                                </Stack>
                              </Flex>
                              {recommendedHoursInfo?.length ? (
                                <>
                                  <Divider />
                                  <UnorderedList>
                                    {recommendedHoursInfo.map((info, k) => (
                                      <ListItem key={k}>
                                        <Text
                                          fontWeight={"normal"}
                                          fontSize={"xs"}
                                        >
                                          {info}
                                        </Text>
                                      </ListItem>
                                    ))}
                                  </UnorderedList>
                                </>
                              ) : null}
                            </Stack>
                          }
                        >
                          <Text color={"gray.500"}>
                            <BsInfoCircle />
                          </Text>
                        </Tooltip>
                      </>
                    )}
                  </Flex>
                );
              }
            )}
            {cloneDeep(roster.empWeekRosters)
              .sort(
                (a, b) =>
                  contractTypes
                    .filter(({ id }) => id === a.contractId)[0]
                    .category.localeCompare(
                      contractTypes.filter(({ id }) => id === b.contractId)[0]
                        .category
                    ) || a.fistName.localeCompare(b.fistName)
              )
              .map(
                (
                  {
                    fistName,
                    lastName,
                    contractId,
                    empId,
                    allowedHours,
                    empHours,
                  },
                  i
                ) => {
                  // const empExceedingHours = empExceedingHoursList?.filter(
                  //   (obj) => obj.empId === empId
                  // );
                  const contractType = contractTypes?.length
                    ? contractTypes.find(({ id }) => id === contractId)?.name
                    : "";

                  return (
                    <Flex
                      borderBottom={"1px solid #f1f1f1"}
                      height={`${ROSTER_CELL_HEIGHT}px`}
                      pl={2}
                      key={empId}
                      background={
                        // empExceedingHours &&
                        // empExceedingHours.length &&
                        // empExceedingHours.filter(({ pendDate, pstartDate }) =>
                        //   isDateExist(pstartDate, pendDate)
                        // ).length
                        //   ? "#e85f5f26" :
                        "unset"
                      }
                      id={empId}
                      minWidth={"184px"}
                    >
                      <Text
                        fontSize={"sm"}
                        fontStyle={"italic"}
                        mx={2}
                        mt={2}
                        color={"gray"}
                      >
                        {i + 1}
                      </Text>
                      <Flex direction={"column"} mt={2}>
                        <Flex alignItems={"center"}>
                          <Tooltip
                            hasArrow
                            label={`${fistName} ${lastName}`}
                            openDelay={500}
                          >
                            <Flex alignItems={"center"}>
                              <Text
                                fontSize={"sm"}
                                fontWeight={"medium"}
                                width={"fit-content"}
                                mr={"1"}
                              >
                                {`${fistName}`}
                              </Text>
                              {user && user.empId === empId ? (
                                <Badge
                                  fontSize={"10px"}
                                  ml={"1"}
                                  color={"#027DBC"}
                                >
                                  You
                                </Badge>
                              ) : null}
                            </Flex>
                          </Tooltip>
                          <Flex>
                            {/* {empExceedingHours &&
                          empExceedingHours.length &&
                          empExceedingHours.filter(({ pendDate, pstartDate }) =>
                            isDateExist(pstartDate, pendDate)
                          ).length ? (
                            <Tooltip
                              label={
                                <>
                                  {empExceedingHours
                                    .filter(({ pendDate, pstartDate }) =>
                                      isDateExist(pstartDate, pendDate)
                                    )
                                    .map(
                                      (
                                        {
                                          allowedHours,
                                          pstartDate,
                                          pendDate,
                                          totalHours,
                                        },
                                        i
                                      ) => (
                                        <Flex
                                          key={i}
                                          direction={"column"}
                                          p={"2"}
                                          borderTop={
                                            i === 0
                                              ? "unset"
                                              : "1px solid #f1f1f1"
                                          }
                                        >
                                          <Text mb={"1"}>
                                            {`Working Hours Limit (${allowedHours} Hours) Exceeded`}
                                          </Text>
                                          <Text mb={"1"}>
                                            {`Date Range: ${formatDate(
                                              pstartDate
                                            )} to ${formatDate(pendDate)}`}
                                          </Text>
                                          <Text>
                                            {`Rostered Hours: ${totalHours}`}
                                          </Text>
                                        </Flex>
                                      )
                                    )}
                                </>
                              }
                            >
                              <Text color={"#e85f5f"}>
                                <BsInfoCircle />
                              </Text>
                            </Tooltip>
                          ) : null} */}
                          </Flex>
                        </Flex>

                        <Flex alignItems={"center"} wrap={"wrap"}>
                          <Text fontSize={"xs"} color={"gray.600"}>
                            {empId}
                          </Text>
                          <Flex
                            width={"1"}
                            height={"1"}
                            background={"gray.600"}
                            rounded={"full"}
                            mx={"1"}
                          ></Flex>
                          <Text
                            fontSize={"xs"}
                            color={"gray.600"}
                          >{`${contractType}`}</Text>
                        </Flex>
                        <Flex>
                          {empHours && empHours.length ? (
                            <Flex
                              pt={"1"}
                              direction={"column"}
                              marginLeft={"-22px"}
                            >
                              {empHours
                                .sort(
                                  (a, b) =>
                                    moment(a.pstartDate).unix() -
                                    moment(b.pstartDate).unix()
                                )
                                .map(
                                  ({ pendDate, pstartDate, totalHours }, i) => (
                                    <Flex
                                      mb={"1"}
                                      alignItems={"center"}
                                      key={i}
                                      color={
                                        totalHours > allowedHours
                                          ? "#e85f5f"
                                          : "gray.600"
                                      }
                                      background={
                                        totalHours > allowedHours
                                          ? "#e85f5f26"
                                          : "#F8F8F8"
                                      }
                                      px={"1"}
                                    >
                                      <Tooltip
                                        hasArrow
                                        label={
                                          <Flex
                                            direction={"column"}
                                            p={"2"}
                                            borderTop={
                                              i === 0
                                                ? "unset"
                                                : "1px solid #f1f1f1"
                                            }
                                          >
                                            <Text mb={"1"}>
                                              {`Working Hours Limit (${allowedHours} Hours) ${
                                                totalHours > allowedHours
                                                  ? "Exceeded"
                                                  : ""
                                              }`}
                                            </Text>
                                            <Text mb={"1"}>
                                              {`Date Range: ${formatDate(
                                                pstartDate
                                              )} to ${formatDate(pendDate)}`}
                                            </Text>
                                            <Text>
                                              {`Rostered Hours: ${totalHours}`}
                                            </Text>
                                          </Flex>
                                        }
                                      >
                                        <Text
                                          display={"flex"}
                                          alignItems={"center"}
                                          fontSize={"xs"}
                                          fontWeight={"medium"}
                                        >
                                          <BsInfoCircle />
                                        </Text>
                                      </Tooltip>
                                      <Text
                                        fontSize={"xs"}
                                        fontWeight={"medium"}
                                        ml={"1.5"}
                                      >
                                        {`${moment(pstartDate).format(
                                          "DD MMM"
                                        )} - ${moment(pendDate).format(
                                          "DD MMM"
                                        )}: ${totalHours}/${allowedHours}`}
                                      </Text>
                                    </Flex>
                                  )
                                )}
                            </Flex>
                          ) : null}
                        </Flex>
                      </Flex>
                    </Flex>
                  );
                }
              )}
          </Flex>
          <Grid
            width={`calc(100%)`}
            gridTemplateColumns={`repeat(${
              roster?.empWeekRosters &&
              roster.empWeekRosters[0] &&
              roster.empWeekRosters[0].days &&
              roster.empWeekRosters[0].days.length
                ? roster.empWeekRosters[0].days.length
                : 0
            }, 1fr)`}
            overflow={"auto"}
          >
            {cloneDeep(roster.empWeekRosters[0].days)
              .sort((a, b) => moment(a.date).unix() - moment(b.date).unix())
              // .sort((a, b) => a.id - b.id)
              .map(({ date, id, metaData, status, edit }, i) => {
                return (
                  <Flex
                    borderRight={"1px solid #f1f1f1"}
                    flexDirection={"column"}
                    key={date}
                    style={{
                      transition: "0.3s",
                      position: "relative",
                      // overflow: "hidden",
                    }}
                    background={
                      (editable || dayChangable) &&
                      selectedDate &&
                      date &&
                      selectedDate === date
                        ? "#dceaf44d"
                        : "transparent"
                    }
                    onClick={() =>
                      (editable || dayChangable) && onChangeSelectedDay
                        ? onChangeSelectedDay(date)
                        : null
                    }
                  >
                    <Flex
                      style={{
                        position: "absolute",
                        display:
                          editable &&
                          selectedDate &&
                          selectedWeek &&
                          date &&
                          finalDuplicateDayIds &&
                          finalDuplicateDayIds.includes(date)
                            ? "flex"
                            : "none",
                        left: 0,
                        right: 0,
                        top: -400,
                        height: 400,
                        zIndex: 0,
                        animationName:
                          editable &&
                          selectedDate &&
                          selectedWeek &&
                          date &&
                          finalDuplicateDayIds &&
                          finalDuplicateDayIds.includes(date)
                            ? "topToBottom"
                            : "",
                        animationDuration: "3s",
                        background:
                          editable &&
                          selectedDate &&
                          selectedWeek &&
                          date &&
                          finalDuplicateDayIds &&
                          finalDuplicateDayIds.includes(date)
                            ? "linear-gradient(0deg,#DAF6E31a 0%,#DAF6E3 45%,#DAF6E3 55%,#DAF6E31a 100%)"
                            : "transparent",
                      }}
                    ></Flex>
                    <Flex
                      borderBottom={"1px solid #d4d4d4"}
                      height={`${ROSTER_DAY_CARD_MIN_HEIGHT}px`}
                      // alignItems={"center"}
                      justifyContent={"space-between"}
                      // zIndex={1}
                      id={moment(date).format("DD-MM-yyyy")}
                      minWidth={"130px"}
                    >
                      <Flex direction={"column"} ml={2} flex={1} pt={"2"}>
                        <Flex alignItems={"center"} gap={"2"}>
                          <Text
                            fontSize={"md"}
                            fontWeight={"bold"}
                            display={"flex"}
                            alignItems={"center"}
                          >
                            {DAYS[moment(date).get("day")]}
                          </Text>
                          {moment(Date.now()).startOf("day").unix() ===
                          moment(date).startOf("day").unix() ? (
                            <Badge fontSize={"10px"} color={"#027DBC"}>
                              Today
                            </Badge>
                          ) : null}
                        </Flex>

                        <Flex alignItems={"center"} gap={"1"}>
                          <Text
                            fontSize={"xs"}
                            color={
                              metaData &&
                              ["HOLIDAY", "WORKING_HOLIDAY"].includes(status)
                                ? HOLIDAY_COLOR
                                : "gray.600"
                            }
                          >
                            {`${moment(date).get("D")} ${
                              MONTHS_SHORT[moment(date).get("M")]
                            }`}
                          </Text>
                          {metaData &&
                          ["HOLIDAY", "WORKING_HOLIDAY"].includes(status) ? (
                            <Tooltip
                              hasArrow
                              label={
                                <Text
                                  fontSize={"xs"}
                                  color={HOLIDAY_COLOR}
                                  fontWeight={"medium"}
                                >
                                  {metaData}
                                </Text>
                              }
                            >
                              <Text
                                color={HOLIDAY_COLOR}
                                cursor={"pointer"}
                                data-testid={`HOLIDAY_${metaData}`}
                              >
                                <FiInfo />
                              </Text>
                            </Tooltip>
                          ) : null}
                        </Flex>
                      </Flex>

                      {editable &&
                      onDuplicateModalOpen &&
                      edit &&
                      status !== "NA" ? (
                        <Flex>
                          <Menu computePositionOnMount>
                            <MenuButton
                              as={IconButton}
                              icon={<FiMoreHorizontal />}
                              size={"sm"}
                              variant={"link"}
                            />

                            <MenuList>
                              <MenuItem
                                cursor={"pointer"}
                                fontSize={"xs"}
                                onClick={() => {
                                  onDuplicateModalOpen();
                                  setDuplicateDates([]);
                                }}
                              >
                                <FiCopy
                                  style={{
                                    marginRight: 8,
                                  }}
                                />
                                Duplicate
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Flex>
                      ) : null}
                    </Flex>
                    {assignedJobShifts?.length && miscWorks?.length ? (
                      <Flex
                        borderBottom={"1px solid #d4d4d4"}
                        height={`${ROSTER_CELL_HEIGHT - 36}px`}
                        alignItems={"start"}
                        p={"1"}
                        overflow={"auto"}
                        background={"#F8F8F8"}
                        direction={"column"}
                      >
                        {assignedJobShifts.filter((obj) => obj.date === date)
                          .length ? (
                          <>
                            {findCJPShifts({
                              date,
                              assignedJobShifts: cloneDeep(assignedJobShifts),
                            })
                              .sort(
                                (a, b) =>
                                  moment(a.startTime, "HH:mm:ss").unix() -
                                  moment(b.startTime, "HH:mm:ss").unix()
                              )
                              .map(
                                (
                                  {
                                    jobType,
                                    miscWorkId,
                                    type,
                                    endTime,
                                    id,
                                    startTime,
                                  },
                                  j
                                ) => {
                                  const text =
                                    type === "MISCELLANEOUS"
                                      ? miscWorks.find(
                                          ({ id }) => id === miscWorkId
                                        )?.name || ""
                                      : SECONDARY_JOBS_CONFIG.find(
                                          (obj) => obj.jobType === jobType
                                        )?.label || "";
                                  const bg =
                                    COLORS[
                                      (type === "MISCELLANEOUS"
                                        ? miscWorkId
                                        : SECONDARY_JOBS_CONFIG.findIndex(
                                            (obj) => obj.jobType === jobType
                                          ) || 0) % COLORS.length
                                    ];
                                  return (
                                    <Flex
                                      key={id}
                                      alignItems={"center"}
                                      background={bg}
                                      mb={"1"}
                                      p={"0.5"}
                                      border={`1px solid ${bg}`}
                                      rounded={"sm"}
                                      cursor={"pointer"}
                                      onClick={() => {
                                        setErr("");
                                        setErrors([]);
                                        setType(type);
                                        setMiscWorkId(miscWorkId);
                                        setJobType(jobType);
                                        setMinStartTime(startTime);
                                        setMaxEndTime(endTime);
                                        setStartTime(startTime);
                                        setEndTime("");
                                        setDate(date);
                                        setSelectedEmpIds(
                                          cloneDeep(roster.empWeekRosters).map(
                                            ({ empId }) => empId
                                          )
                                        );

                                        onAddCJPShiftOpen();
                                      }}
                                      width={"full"}
                                      // direction={"column"}
                                    >
                                      <BsPlus fontWeight={"medium"} />
                                      <Tooltip key={j} label={text} hasArrow>
                                        <Text
                                          whiteSpace={"nowrap"}
                                          overflow={"hidden"}
                                          textOverflow={"ellipsis"}
                                          flex={1}
                                          maxWidth={"fit-content"}
                                          fontSize={"11px"}
                                          fontWeight={"medium"}
                                          ml={"0.5"}
                                          mr={"1"}
                                        >
                                          {text}
                                        </Text>
                                      </Tooltip>

                                      <Text
                                        style={{
                                          fontSize: 10,
                                        }}
                                        ml={"auto"}
                                        pr={"1"}
                                      >{`${convertTime(
                                        startTime
                                      )} - ${convertTime(endTime)}`}</Text>
                                    </Flex>
                                  );
                                }
                              )}
                          </>
                        ) : null}
                      </Flex>
                    ) : null}
                    {recommendedHours?.length &&
                    recommendedHours[0].recommendedHours?.length
                      ? getRecArray(date).map(
                          ({ category, color, hours, rosteredHours }) => {
                            return (
                              <Flex
                                borderBottom={"1px solid #d4d4d4"}
                                height={`${28}px`}
                                alignItems={"start"}
                                px={"1"}
                                overflow={"hidden"}
                                direction={"column"}
                                justifyContent={"center"}
                                color={"black"}
                                key={category}
                                position={"relative"}
                              >
                                {isRecommendedHoursLoading ? (
                                  <Flex py={"1"} width={"full"} height={"full"}>
                                    <Skeleton
                                      height={"full"}
                                      width={"full"}
                                      startColor={`${color}1a`}
                                      endColor={`${color}0d`}
                                    />
                                  </Flex>
                                ) : (
                                  <>
                                    <Grid
                                      gap={1}
                                      textTransform={"lowercase"}
                                      width={"full"}
                                      justifyContent={"space-between"}
                                      gridTemplateColumns={"1fr 1fr"}
                                      textAlign={"center"}
                                    >
                                      <Text
                                        fontSize={"xs"}
                                        // fontWeight={"medium"}
                                        color={"gray.700"}
                                        fontStyle={"italic"}
                                      >
                                        {roster.rosterStatus == "DRAFT"
                                          ? "-"
                                          : `${rosteredHours || 0}h`}
                                      </Text>
                                      <Text
                                        fontSize={"xs"}
                                        fontWeight={"medium"}
                                        color={color}
                                        fontStyle={"italic"}
                                      >
                                        {`${hours || 0}h`}
                                      </Text>
                                    </Grid>
                                    <Flex
                                      position={"absolute"}
                                      right={"-20%"}
                                      top={"-21px"}
                                      height={"84px"}
                                      minHeight={"10vw"}
                                      width={"72%"}
                                      background={`${color}0d`}
                                      transform={"rotate(28deg)"}
                                      border={"1px solid"}
                                      borderColor={`${color}1a`}
                                    ></Flex>
                                  </>
                                )}
                              </Flex>
                            );
                          }
                        )
                      : null}
                    {cloneDeep(roster.empWeekRosters)
                      .sort(
                        (a, b) =>
                          contractTypes
                            .filter(({ id }) => id === a.contractId)[0]
                            .category.localeCompare(
                              contractTypes.filter(
                                ({ id }) => id === b.contractId
                              )[0].category
                            ) || a.fistName.localeCompare(b.fistName)
                      )
                      .map(
                        (
                          { empId, days, contractId, fistName, lastName },
                          j
                        ) => {
                          const rosterCell = findRosterCell(days, date);
                          return (
                            <Flex
                              key={empId}
                              id={`${empId}_${moment(date).format(
                                "DD-MM-yyyy"
                              )}`}
                            >
                              {rosterCell ? (
                                <EmployeeCell
                                  rosterCell={rosterCell}
                                  rosterShifts={findDate(days, date)}
                                  editable={editable}
                                  dayChangable={dayChangable}
                                  onShiftChange={onShiftChange}
                                  draft={draft}
                                  shifts={shifts}
                                  contractId={contractId}
                                  empId={empId}
                                  fistName={fistName}
                                  lastName={lastName}
                                  setContractTypeId={setContractTypeId}
                                  setClusterId={setClusterId}
                                  setEmpId={setEmpId}
                                  setDayId={setDayId}
                                  setStatus={setStatus}
                                  onAddShiftOpen={() => {
                                    setErr("");
                                    setStartTimeSlots(
                                      generateTimeSlots(
                                        DEFAULT_OPEN_TIME,
                                        DEFAULT_CLOSE_TIME
                                      )
                                    );
                                    setStartTime(DEFAULT_START_TIME);
                                    setEndTime("");
                                    setType("");
                                    setMiscWorkId(0);
                                    setJobType("");
                                    setMinStartTime("");
                                    setMaxEndTime("");
                                    setDate("");
                                    setSelectedEmpIds([]);

                                    onAddShiftOpen();
                                  }}
                                  rosterType={rosterType}
                                  selectedClusterId={selectedClusterId}
                                  miscWorks={miscWorks}
                                  setMiscWork={setMiscWork}
                                  miscWork={miscWork}
                                  onRemoveMiscShift={onRemoveMiscShift}
                                  empWeekRosters={cloneDeep(
                                    roster.empWeekRosters
                                  )}
                                  contractTypes={contractTypes}
                                  assignedJobShifts={assignedJobShifts}
                                />
                              ) : null}
                            </Flex>
                          );
                        }
                      )}
                  </Flex>
                );
              })}
          </Grid>
        </>
      ) : (
        <AppNoData msg="Looks like there is no employees data for this job, start adding on your own or ask your leader." />
      )}
      {editable && miscWorks?.length ? (
        <BottomBar miscWorks={miscWorks} />
      ) : null}

      {isDuplicateModalOpen &&
      onDuplicateModalClose &&
      onDuplicateClick &&
      selectedDate ? (
        <Modal isOpen={isDuplicateModalOpen} onClose={onDuplicateModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Duplicate</ModalHeader>

            <ModalCloseButton />
            <ModalBody>
              <Text fontSize={"sm"} mb={"4"}>
                Select the days you want to duplicate{" "}
                {DAYS_FULL[moment(selectedDate).day()]}'s shift to -
              </Text>
              {selectedDate &&
              selectedWeek &&
              roster &&
              roster.empWeekRosters &&
              roster.empWeekRosters[0] &&
              roster.empWeekRosters[0].days &&
              roster.empWeekRosters[0].days.length ? (
                <Flex>
                  {roster.empWeekRosters[0].days
                    .filter(({ date }) => selectedDate !== date)
                    .filter(({ status }) => status !== "NA")
                    .sort(
                      (a, b) => moment(a.date).unix() - moment(b.date).unix()
                    )
                    .map(({ date }, i) => (
                      <Flex
                        key={date}
                        onClick={() => {
                          if (duplicateDates.includes(date)) {
                            //
                            setDuplicateDates(
                              duplicateDates.filter((el) => el !== date)
                            );
                          } else {
                            setDuplicateDates((old) => [...old, date]);
                          }
                        }}
                        px={1}
                      >
                        <Button
                          size={"sm"}
                          variant={
                            duplicateDates.includes(date) ? undefined : "solid"
                          }
                          borderRadius={"2xl"}
                        >
                          {DAYS[moment(date).get("day")]}
                        </Button>
                      </Flex>
                    ))}
                </Flex>
              ) : null}
            </ModalBody>
            <ModalFooter>
              <Button
                variant={"outline"}
                mr={3}
                onClick={onDuplicateModalClose}
              >
                Cancel
              </Button>
              {selectedDate && selectedWeek ? (
                <Button
                  isDisabled={!duplicateDates.length}
                  onClick={() => {
                    onDuplicateClick(duplicateDates);
                    onDuplicateModalClose();
                  }}
                >
                  Duplicate
                </Button>
              ) : null}
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : null}
      <AppRightDrawer
        isOpen={isAddShiftOpen}
        onClose={onAddShiftClose}
        heading={`Add Shift (${
          rosterType === "primary" && clusters && clusters.length
            ? clusters.find(({ id }) => id === selectedClusterId)?.name
            : selectedJobType ?? "--"
        })`}
      >
        <Flex direction={"column"}>
          {rosterType === "primary" ? (
            <FormControl mb={"4"} isRequired>
              <FormLabel>Cluster</FormLabel>
              <AppSelect
                disabled
                onChange={(value) => setClusterId(value)}
                value={clusterId}
                options={
                  clusters?.length
                    ? clusters.map(({ id, name }) => ({
                        label: name,
                        value: id,
                      }))
                    : []
                }
              />
            </FormControl>
          ) : null}
          <FormControl mb={"4"} isRequired>
            <FormLabel>Contract Type</FormLabel>
            <AppSelect
              disabled
              onChange={(value) => setContractTypeId(value)}
              value={contractTypeId}
              options={
                contractTypes?.length
                  ? contractTypes.map(({ id, name }) => ({
                      label: name,
                      value: id,
                    }))
                  : []
              }
            />
          </FormControl>
          <FormControl mb={"4"} isRequired>
            <FormLabel>Start Time</FormLabel>
            <AppSelect
              options={startTimeSlots}
              onChange={setStartTime}
              value={startTime}
              // menuPlacement="top"
            />
          </FormControl>
          <FormControl mb={"4"} isRequired>
            <FormLabel>End Time</FormLabel>
            <AppSelect
              options={endTimeSlots}
              onChange={setEndTime}
              value={endTime}
              // menuPlacement="top"
            />
          </FormControl>
        </Flex>
        <Flex direction={"column"}>
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
          <Button
            width={"full"}
            mb={"4"}
            isDisabled={!contractTypeId || !startTime || !endTime}
            onClick={onSaveShift}
          >
            Save
          </Button>
        </Flex>
      </AppRightDrawer>
      <AppRightDrawer
        isOpen={isAddCJPShiftOpen}
        onClose={onAddCJPShiftClose}
        heading={`Add Shift`}
      >
        {miscWorks?.length &&
        contractTypes?.length &&
        roster?.empWeekRosters?.length ? (
          <Flex direction={"column"}>
            <Flex
              direction={"column"}
              borderBottom={"1px solid #f1f1f1"}
              mb={"2"}
              mt={"2"}
              pb={"4"}
              rounded={"md"}
            >
              <Text fontWeight={"medium"}>{`Job: ${
                type === "MISCELLANEOUS" && miscWorks
                  ? miscWorks.find(({ id }) => id === miscWorkId)?.name || ""
                  : SECONDARY_JOBS_CONFIG.find((obj) => obj.jobType === jobType)
                      ?.label || ""
              }`}</Text>
              <Text fontWeight={"medium"}>{`Duration: ${convertTime(
                minStartTime
              )} - ${convertTime(maxEndTime)}`}</Text>
              <Text fontWeight={"medium"}>{`Date: ${formatDate(date)}`}</Text>
            </Flex>
            {cloneDeep(roster.empWeekRosters).length ? (
              <Flex alignItems={"center"}>
                <Checkbox
                  onChange={(event) => {
                    if (event.target.checked) {
                      setSelectedEmpIds(
                        cloneDeep(roster.empWeekRosters).map(
                          ({ empId }) => empId
                        )
                      );
                    } else {
                      setSelectedEmpIds([]);
                    }
                  }}
                  isChecked={
                    cloneDeep(roster.empWeekRosters).length ===
                    selectedEmpIds.length
                  }
                  size={"sm"}
                >
                  <Text
                    fontWeight={"medium"}
                    color={"black"}
                  >{`Select All`}</Text>
                </Checkbox>
              </Flex>
            ) : null}

            <CheckboxGroup
              value={selectedEmpIds}
              onChange={(value) => setSelectedEmpIds(value as string[])}
            >
              <Stack
                mt={"2"}
                pb={"4"}
                mb={"4"}
                borderBottom={"1px solid #f1f1f1"}
              >
                {cloneDeep(roster.empWeekRosters)
                  .sort(
                    (a, b) =>
                      contractTypes
                        .filter(({ id }) => id === a.contractId)[0]
                        .category.localeCompare(
                          contractTypes.filter(
                            ({ id }) => id === b.contractId
                          )[0].category
                        ) || a.fistName.localeCompare(b.fistName)
                  )
                  .map(({ fistName, lastName, empId }, i) => {
                    const error = errors.find((obj) => obj.empId === empId);
                    return (
                      <Flex key={empId} alignItems={"center"}>
                        <Checkbox value={empId} size={"sm"}>
                          <Text
                            // fontWeight={"medium"}
                            color={error ? "#e85f5f" : "black"}
                          >{`${fistName + ` ${lastName}`} | ${empId}`}</Text>
                        </Checkbox>
                        {error ? (
                          <Tooltip label={error.info} hasArrow>
                            <Text color={"#e85f5f"} ml={"2"}>
                              <BsInfoCircle />
                            </Text>
                          </Tooltip>
                        ) : null}
                      </Flex>
                    );
                  })}
              </Stack>
            </CheckboxGroup>
            <FormControl mb={"4"}>
              <FormLabel>Comment</FormLabel>
              <Textarea
                maxLength={COMMENT_MAX_LENGTH}
                onChange={(e) => setComment(e.target.value)}
                value={comment}
              />
              <FormHelperText
                fontSize={"xs"}
                textAlign={"right"}
                color={
                  comment.length === COMMENT_MAX_LENGTH ? "red" : "gray.500"
                }
              >
                {comment.length}/{COMMENT_MAX_LENGTH}
              </FormHelperText>
            </FormControl>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Start Time</FormLabel>
              <AppSelect
                options={startTimeSlots}
                onChange={setStartTime}
                value={startTime}
                // menuPlacement="top"
              />
            </FormControl>
            <FormControl mb={"4"} isRequired>
              <FormLabel>End Time</FormLabel>
              <AppSelect
                options={endTimeSlots}
                onChange={setEndTime}
                value={endTime}
                // menuPlacement="top"
              />
            </FormControl>
          </Flex>
        ) : null}
        <Flex direction={"column"}>
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
          <Button
            width={"full"}
            mb={"4"}
            onClick={() => onSaveCJPShift()}
            isDisabled={!endTime || selectedEmpIds.length === 0}
          >
            Save
          </Button>
        </Flex>
      </AppRightDrawer>
    </Flex>
  );
}

export default CalenderView;
