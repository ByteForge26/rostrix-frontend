import {
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Menu,
  MenuButton,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { cloneDeep } from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDrop } from "react-dnd";
import { BsInfoCircle, BsXCircle } from "react-icons/bs";
import { FaBurger } from "react-icons/fa6";
import AppRightDrawer from "../../../components/AppRightDrawer";
import AppSelect from "../../../components/AppSelect";
import {
  COLORS,
  COMMENT_MAX_LENGTH,
  DEFAULT_CLOSE_TIME,
  DEFAULT_MISC_START_TIME,
  DEFAULT_OPEN_TIME,
  DRAG_TYPE,
  MAX_SHIFT_WITHOUT_LUNCH_PART_TIMER,
  MAX_SHIFT_WITH_LUNCH,
  ROSTER_CELL_HEIGHT,
  SECONDARY_JOBS_CONFIG,
  TIME_GAP,
} from "../../../helper/Constant";
import {
  IAssignedJobShift,
  IContractTypeResponse,
  IMiscWork,
  IRoster,
  IRosterDay,
  IRosterHookProps,
  IShift,
} from "../../../helper/Interface";
import {
  calculateTotalShiftDuration,
  convertTime,
  findRosterCell,
  formatDate,
  generateTimeSlots,
  getCellNewStatus,
  getDuration,
  getIsLunchExist,
  getIsPartTime,
  getShiftStatusV2,
} from "../../../helper/Utils";
import OtherShiftTag from "./OtherShiftTag";

function EmployeeCell(props: {
  readonly rosterCell: IRoster["empWeekRosters"][0]["days"][0];
  readonly rosterShifts?: IRoster["empWeekRosters"][0]["days"][0]["main"];
  readonly editable?: boolean;
  readonly dayChangable?: boolean;
  readonly onShiftChange?: (
    props: {
      empId: string;
      id: number;
      status: string;
      shifts: {
        startTime: string;
        endTime: string;
        workId?: number;
        comment?: string;
      }[];
    }[]
  ) => void;
  readonly draft: IRosterDay[];
  readonly shifts?: IShift[];
  readonly contractId: number;
  readonly empId: string;
  readonly setContractTypeId: React.Dispatch<React.SetStateAction<number>>;
  readonly setClusterId: React.Dispatch<React.SetStateAction<number>>;
  readonly setEmpId: (value: string) => void;
  readonly setDayId: (value: number) => void;
  readonly setStatus: (value: string) => void;
  readonly onAddShiftOpen: () => void;
  readonly rosterType: IRosterHookProps["rosterType"];
  readonly selectedClusterId?: number;
  readonly miscWorks?: IMiscWork[];
  readonly miscWork?: IMiscWork;
  readonly setMiscWork?: (miscWork?: IMiscWork) => void;
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
  readonly fistName?: string;
  readonly lastName?: string;
  readonly empWeekRosters: IRoster["empWeekRosters"];
  readonly contractTypes: IContractTypeResponse[];
  readonly assignedJobShifts?: IAssignedJobShift[];
}) {
  const [err, setErr] = useState("");
  const [miscWorkComment, setMiscWorkComment] = useState<string>("");
  const [miscWorkStartTime, setMiscWorkStartTime] = useState<string>(
    DEFAULT_MISC_START_TIME
  );
  const [miscWorkEndTime, setMiscWorkEndTime] = useState<string>("");
  const {
    isOpen: isMiscShiftOpen,
    onOpen: onMiscShiftOpen,
    onClose: onMiscShiftClose,
  } = useDisclosure();
  const [warning, setWarning] = useState("");
  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    rosterCell,
    rosterShifts,
    editable,
    dayChangable,
    onShiftChange,
    draft,
    shifts,
    contractId,
    empId,
    onAddShiftOpen,
    rosterType,
    setClusterId,
    setContractTypeId,
    setDayId,
    setEmpId,
    setStatus,
    selectedClusterId,
    miscWorks,
    miscWork,
    setMiscWork,
    onRemoveMiscShift,
    fistName,
    lastName,
    empWeekRosters,
    contractTypes,
    assignedJobShifts,
  } = props;
  const startTimeSlots = generateTimeSlots(
    DEFAULT_OPEN_TIME,
    DEFAULT_CLOSE_TIME
  );
  const [miscWorkId, setMiscWorkId] = useState(0);
  const [endTimeSlots, setEndTimeSlots] =
    useState<{ label: string; value: string }[]>();
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<
    {
      empId: string;
      info: string;
    }[]
  >([]);
  const canItemDropHere = (droppingItem: any) => {
    return droppingItem.type === DRAG_TYPE;
  };
  const handleDrop = (props: { type: string; miscWork: IMiscWork }) => {
    if (!rosterCell.edit) {
      return;
    }
    const { miscWork } = props;
    let message = "";
    if (assignedJobShifts?.length) {
      const day = assignedJobShifts.find(
        ({ date }) => date === rosterCell.date
      );

      if (day?.jobs?.length) {
        const job = day.jobs
          .filter(({ miscWorkId }) => miscWorkId)
          .find(({ miscWorkId }) => miscWorkId === miscWork.id);
        if (job?.shifts?.length) {
          message = `For planned days for the ${miscWork.name} job click the "+" button next to the shift for that specific day.`;
        }
      }
    }
    if (message) {
      setWarning(message);
    }
    if (onMiscShiftOpen && setMiscWork && !message) {
      setMiscWork(miscWork);
      setMiscWorkId(miscWork.id);
      setMiscWorkComment("");
      setMiscWorkStartTime(DEFAULT_MISC_START_TIME);
      setMiscWorkEndTime("");
      setErr("");
      setErrors([]);
      setSelectedEmpIds([empId]);
      onMiscShiftOpen();
      onClose();
    }
  };
  const [{ isOver }, drop] = useDrop({
    accept:
      rosterCell && ["NA", "LEAVE", "WEEK_OFF"].includes(rosterCell.status)
        ? ""
        : DRAG_TYPE,
    canDrop: canItemDropHere,
    drop: handleDrop,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });
  const isLunchExist = getIsLunchExist({
    main: rosterCell.main,
    misc: rosterCell.misc,
    others: rosterCell.others,
  });

  const onSaveMiscShift = (forceConfirm: boolean) => {
    const tempErrors: {
      empId: string;
      info: string;
    }[] = [];
    selectedEmpIds.forEach((empId) => {
      let isError = false;
      const empRoster = empWeekRosters.find((obj) => obj.empId === empId);
      if (empRoster && rosterCell) {
        const rosterCellTemp = findRosterCell(empRoster.days, rosterCell.date);
        if (
          rosterCellTemp &&
          rosterCellTemp.edit &&
          !["NA", "LEAVE", "WEEK_OFF"].includes(rosterCellTemp.status)
        ) {
          const {
            error,
            isConflictWithMisc,
            isConflictWithSecondary,
            isShiftMaxDurationExceed,
          } = getShiftStatusV2({
            currentShift: {
              startTime: miscWorkStartTime,
              endTime: miscWorkEndTime,
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
      onMiscShiftClose();
      if (onShiftChange && miscWork) {
        const rosterCells: IRosterDay[] = [];
        selectedEmpIds.forEach((empId) => {
          const empRoster = empWeekRosters.find((obj) => obj.empId === empId);
          if (empRoster && rosterCell) {
            const rosterCellTemp = findRosterCell(
              empRoster.days,
              rosterCell.date
            );
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
                  endTime: miscWorkEndTime,
                  startTime: miscWorkStartTime,
                  comment: miscWorkComment,
                  workId: miscWork.id,
                },
              ],
              status: getCellNewStatus(rosterCell.status),
            }))
          );
          setMiscWorkComment("");
          setMiscWorkStartTime(DEFAULT_MISC_START_TIME);
          setMiscWorkEndTime("");
        }
      }
    } else {
      setErr(
        "Adding the new shift will increase working hours or overlap with current shifts for some employees. Please review their schedules and either remove them from the conflicting shift or assign them a different one that fits their availability."
      );
    }
  };

  useEffect(() => {
    if (miscWorkStartTime) {
      setMiscWorkEndTime("");
      if (miscWorkStartTime === DEFAULT_CLOSE_TIME) {
        setEndTimeSlots([]);
        return;
      }
      const newStartTime = moment(miscWorkStartTime, "HH:mm:ss")
        .add({ minutes: TIME_GAP })
        .format("HH:mm:ss");

      let newEndTime = moment(miscWorkStartTime, "HH:mm:ss")
        .add({ hours: MAX_SHIFT_WITH_LUNCH })
        .format("HH:mm:ss");

      if (newEndTime < DEFAULT_CLOSE_TIME && newEndTime < miscWorkStartTime) {
        let newHours = getDuration(
          moment(miscWorkStartTime, "HH:mm:ss"),
          moment(DEFAULT_CLOSE_TIME, "HH:mm:ss")
        ).durationHours;

        newEndTime = moment(miscWorkStartTime, "HH:mm:ss")
          .add({ hours: newHours })
          .format("HH:mm:ss");
      }

      setEndTimeSlots(
        generateTimeSlots(newStartTime, newEndTime, miscWorkStartTime)
      );
    }
  }, [miscWorkStartTime]);
  useEffect(() => {
    if (miscWorkId && miscWorks && miscWorks.length && setMiscWork) {
      setMiscWork(miscWorks.filter((obj) => obj.id === miscWorkId)[0]);
    }
  }, [miscWorkId]);

  const shiftIsChecked = (startTime: string, endTime: string) => {
    if (rosterShifts?.length) {
      return (
        rosterShifts.findIndex(
          ({ s, e }) =>
            convertTime(s) === convertTime(startTime) &&
            convertTime(e) === convertTime(endTime)
        ) >= 0
      );
    }
    return false;
  };
  const getShifts = () => {
    let arr: {
      shiftType: "main" | "others" | "misc";
      shift: {
        s: string;
        e: string;
        c: string;
        type?: string;
        workId?: number;
        secondaryJobType?: string;
      };
    }[] = [];
    if (rosterCell) {
      if (rosterCell.main && rosterCell.main.length) {
        rosterCell.main.forEach((shift) => {
          arr.push({
            shiftType: "main",
            shift,
          });
        });
      }
      if (rosterCell.others && rosterCell.others.length) {
        rosterCell.others.forEach((shift) => {
          arr.push({
            shiftType: "others",
            shift,
          });
        });
      }
      if (rosterCell.misc && rosterCell.misc.length) {
        rosterCell.misc.forEach((shift) => {
          arr.push({
            shiftType: "misc",
            shift,
          });
        });
      }
    }
    return arr;
  };
  const getAllShifts = () => {
    let allShifts: IShift[] = [];
    if (shifts?.length) {
      allShifts = [
        ...shifts.filter((obj) => obj.contractTypeId === contractId),
      ];
    }
    if (rosterCell?.main?.length) {
      rosterCell.main.forEach(({ s, e }) => {
        const index = shifts
          ?.filter((obj) => obj.contractTypeId === contractId)
          .findIndex(({ startTime, endTime }) => {
            if (startTime === s && endTime === e) {
              return true;
            }
            return false;
          });
        if (index === -1) {
          allShifts.push({
            clusterId: 0,
            contractTypeId: contractId,
            costCentre: "",
            endTime: e,
            id: 0,
            jobType: "",
            lunchHours: 0,
            startTime: s,
          });
        }
      });
    }
    return allShifts;
  };

  return (
    <Flex
      ref={drop}
      borderBottom={"1px solid #f1f1f1"}
      height={`${ROSTER_CELL_HEIGHT}px`}
      background={
        rosterCell.status === "LEAVE"
          ? "#c1e1c133"
          : rosterCell.status === "WEEK_OFF"
          ? "#82abd433"
          : isOver
          ? "#d6d6d64d"
          : rosterCell.status === "NA"
          ? "repeating-linear-gradient(-45deg, rgb(175 175 175 / 50%), #ffffff 2px, #ffffff 2px, #e0e0e000 4px)"
          : ["LEAVE", "WEEK_OFF"].includes(rosterCell.status)
          ? "#d3d3d31a"
          : "transparent"
      }
      // transition={"0.1s"}
      flex={1}
      opacity={
        ["NA", "LEAVE", "WEEK_OFF"].includes(rosterCell.status) ? 0.5 : 1
      }
      cursor={
        dayChangable
          ? "unset"
          : ["NA", "LEAVE", "WEEK_OFF"].includes(rosterCell.status) && editable
          ? "not-allowed"
          : "unset"
      }
      boxShadow={isOpen ? "0 0 8px 2px lightgray" : "none"}
      position={"relative"}
    >
      {draft.findIndex((obj) => obj.id === rosterCell.id || 0) >= 0 && (
        <Flex
          background={"linear-gradient(262.2deg, #166AFF 3%, #2948FF 100%)"}
          width={1}
          height={1}
          rounded={"full"}
          position={"absolute"}
          right={"2"}
          top={"2"}
          zIndex={11}
        ></Flex>
      )}
      <Menu isOpen={isOpen} onClose={onClose}>
        <MenuButton
          onClick={() => {
            if (
              editable &&
              onShiftChange &&
              rosterCell &&
              rosterCell.edit &&
              !["LEAVE", "WEEK_OFF"].includes(rosterCell.status || "")
            ) {
              onOpen();
            }
          }}
          as={Button}
          variant={"unstyled"}
          color={"black"}
          size={"xs"}
          // p={2}
          cursor={
            editable &&
            onShiftChange &&
            rosterCell &&
            rosterCell.edit &&
            !["LEAVE", "WEEK_OFF"].includes(rosterCell.status || "")
              ? "pointer"
              : dayChangable
              ? "unset"
              : "not-allowed"
          }
          overflow={"auto"}
          height={"100%"}
          width={"100%"}
          display={"flex"}
          alignItems={"flex-start"}
          // height={"28px"}
          // opacity={isEditIconShow ? "0.8" : "0"}
        >
          {getShifts().length === 0 ? (
            <Flex alignItems={"center"}>
              {/* {false ? (
                 <Tooltip
                   hasArrow
                   rounded={"sm"}
                   py={"2"}
                   label={<UnorderedList></UnorderedList>}
                 >
                   <Flex px={"2"} position={"relative"}>
                     <Flex
                       style={{
                         background: "#000000a6",
                         borderRadius: "50%",
                         animationName: "blink",
                         animationDuration: "1.2s",
                         animationTimingFunction: "ease",
                         animationIterationCount: "infinite",
                         cursor: "pointer",
                         border: "1px solid transparent",
                       }}
                     >
                       <BsInfoCircleFill fontSize={"14px"} color="#FECE3B" />
                     </Flex>
                   </Flex>
                 </Tooltip>
               ) : null} */}
              <Flex width={"full"} justifyContent={"space-between"}>
                <Flex
                  pl={"1"}
                  pt={"1.5"}
                  pr={"1"}
                  fontSize={"xs"}
                  color={
                    rosterShifts && rosterShifts.length
                      ? "black"
                      : rosterCell.status === "LEAVE"
                      ? "#fffff"
                      : rosterCell.status === "WEEK_OFF"
                      ? "#fffff"
                      : "gray"
                  }
                  fontWeight={
                    ["LEAVE", "WEEK_OFF"].includes(rosterCell.status)
                      ? "medium"
                      : "normal"
                  }
                  minHeight={"28px"}
                  flexDirection={"column"}
                  textAlign={"left"}
                >
                  {rosterCell.status === "LEAVE" ? (
                    <>{`${rosterCell.metaData === "LOP" ? "LOP" : "LEAVE"}`}</>
                  ) : rosterCell.status === "WEEK_OFF" ? (
                    "WEEK OFF"
                  ) : (
                    "-"
                  )}
                </Flex>
              </Flex>
            </Flex>
          ) : null}

          <Flex direction={"column"}>
            {getShifts().length ? (
              <Flex direction={"column"} width={"full"} padding={"1px"}>
                {getShifts()
                  .sort((a, b) => a.shift.s.localeCompare(b.shift.s))
                  .map(({ shiftType, shift }, i) => {
                    const { c, s, e, type, workId, secondaryJobType } = shift;
                    return (
                      <React.Fragment
                        key={`${c || ""}_${s || ""}_${e || ""}_${type || ""}_${
                          workId || ""
                        }_${secondaryJobType || ""}`}
                      >
                        {shiftType === "main" && s && e ? (
                          <Text
                            key={s + "_" + e + "_" + i}
                            mt={"0.5"}
                            mb={"0.5"}
                            fontSize={"xs"}
                            fontWeight={"normal"}
                            pl={"1"}
                            textAlign={"left"}
                          >
                            {`${convertTime(s)} - ${convertTime(e)}`}
                          </Text>
                        ) : null}
                        {shiftType === "others" && s && e && type ? (
                          <OtherShiftTag
                            key={e + "_" + s}
                            comment={c}
                            empId={empId}
                            endTime={e}
                            id={rosterCell.id}
                            type={type}
                            name={
                              type
                                ? type && workId && miscWorks?.length
                                  ? `${
                                      miscWorks.find(({ id }) => id === workId)
                                        ?.name || ""
                                    } (${type})`
                                  : SECONDARY_JOBS_CONFIG.find(
                                      ({ jobType }) => jobType === type
                                    )?.label || type
                                : ""
                            }
                            startTime={s}
                            color={COLORS[
                              workId
                                ? workId
                                : SECONDARY_JOBS_CONFIG.findIndex(
                                    ({ jobType }) => jobType === type
                                  ) % COLORS.length
                            ].slice(0, -2)}
                            background={
                              COLORS[
                                workId
                                  ? workId
                                  : SECONDARY_JOBS_CONFIG.findIndex(
                                      ({ jobType }) => jobType === type
                                    ) % COLORS.length
                              ]
                            }
                            viewOnly
                          />
                        ) : null}
                        {shiftType === "misc" &&
                        s &&
                        e &&
                        miscWorks &&
                        miscWorks.length &&
                        (workId || secondaryJobType) ? (
                          <OtherShiftTag
                            key={e + "_" + s}
                            comment={c}
                            empId={empId}
                            endTime={e}
                            id={rosterCell.id}
                            name={
                              workId
                                ? miscWorks.find(({ id }) => id === workId)
                                    ?.name || ""
                                : SECONDARY_JOBS_CONFIG.find(
                                    ({ jobType }) =>
                                      jobType === secondaryJobType
                                  )?.label || ""
                            }
                            startTime={s}
                            workId={workId}
                            secondaryJobType={secondaryJobType}
                            color={COLORS[
                              (workId
                                ? workId
                                : SECONDARY_JOBS_CONFIG.findIndex(
                                    ({ jobType }) =>
                                      jobType === secondaryJobType
                                  )) % COLORS.length
                            ].slice(0, -2)}
                            background={
                              COLORS[
                                (workId
                                  ? workId
                                  : SECONDARY_JOBS_CONFIG.findIndex(
                                      ({ jobType }) =>
                                        jobType === secondaryJobType
                                    )) % COLORS.length
                              ]
                            }
                            viewOnly
                          />
                        ) : null}
                      </React.Fragment>
                    );
                  })}
              </Flex>
            ) : null}
            {/* {rosterCell?.others?.length ? (
              <Flex direction={"column"}>
                {rosterCell.others
                  .sort((a, b) => a.s.localeCompare(b.s))
                  .map(({ e, s, type, c }, i) => {
                    return (
                      <OtherShiftTag
                        key={e + "_" + s}
                        comment={c}
                        empId={empId}
                        endTime={e}
                        id={rosterCell.id}
                        name={type || ""}
                        startTime={s}
                        color={COLORS[
                          SECONDARY_JOBS_CONFIG.findIndex(
                            ({ jobType }) => jobType === type
                          ) % COLORS.length
                        ].slice(0, -2)}
                        background={
                          COLORS[
                            SECONDARY_JOBS_CONFIG.findIndex(
                              ({ jobType }) => jobType === type
                            ) % COLORS.length
                          ]
                        }
                        viewOnly
                      />
                    );
                  })}
              </Flex>
            ) : null}
            {rosterCell?.misc?.length && miscWorks?.length ? (
              <Flex direction={"column"}>
                {rosterCell.misc
                  .sort((a, b) => a.s.localeCompare(b.s))
                  .map(({ e, s, workId, c }, i) => {
                    return (
                      <OtherShiftTag
                        key={e + "_" + s}
                        comment={c}
                        empId={empId}
                        endTime={e}
                        id={rosterCell.id}
                        name={
                          miscWorks.find(({ id }) => id === workId)?.name ?? ""
                        }
                        startTime={s}
                        workId={workId}
                        color={COLORS[workId % COLORS.length].slice(0, -2)}
                        background={COLORS[workId % COLORS.length]}
                        viewOnly
                      />
                    );
                  })}
              </Flex>
            ) : null} */}
            {rosterCell.subRole && getShifts().length ? (
              <Text
                color={"#027dbc"}
                pl={"1"}
                pt={"0.5"}
                textAlign={"left"}
                fontWeight={"medium"}
              >{`#${rosterCell.subRole}`}</Text>
            ) : null}
          </Flex>
        </MenuButton>
        {isOpen ? (
          <MenuList minWidth={"400px"}>
            <Flex
              direction={"column"}
              // borderBottom={"1px solid #f1f1f1"}
              // mb={"4"}
            >
              <Flex
                alignItems={"center"}
                justifyContent={"space-between"}
                // background={"#f4f9fb"}
                pl={"3"}
                py={"1"}
              >
                <Text fontSize={"sm"} fontWeight={"medium"}>
                  {rosterType === "primary"
                    ? "Primary Shifts"
                    : "Select Shifts"}
                </Text>
                <Flex pr={"4"}>
                  <BsXCircle onClick={onClose} cursor={"pointer"} />
                </Flex>
              </Flex>

              {getAllShifts().length && onShiftChange ? (
                <Grid
                  px={"4"}
                  py={"2"}
                  gap={"2"}
                  gridTemplateColumns={"1fr 1fr"}
                >
                  {getAllShifts()
                    .filter((obj) => obj.contractTypeId === contractId)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(({ startTime, endTime }, k) => {
                      const { isShiftDisabled, disabledReason } =
                        getShiftStatusV2({
                          currentShift: {
                            endTime,
                            startTime,
                            type: rosterType,
                          },
                          main: rosterCell.main || [],
                          others: rosterCell.others || [],
                          misc: rosterCell.misc ?? [],
                          isPartTime: getIsPartTime({
                            contractTypeId: contractId,
                            contractTypes,
                          }),
                        });
                      return (
                        <Flex
                          key={`${startTime}_${endTime}`}
                          alignItems={"center"}
                        >
                          <Checkbox
                            size={"sm"}
                            onChange={(e) => {
                              onShiftChange([
                                {
                                  empId,
                                  id: rosterCell.id || 0,
                                  status: e.target.checked
                                    ? ["HOLIDAY", "WORKING_HOLIDAY"].includes(
                                        rosterCell.status || ""
                                      )
                                      ? "WORKING_HOLIDAY"
                                      : "WORKING"
                                    : "BLANK",
                                  shifts: [{ startTime, endTime }],
                                },
                              ]);
                            }}
                            isDisabled={isShiftDisabled}
                            isChecked={shiftIsChecked(startTime, endTime)}
                          >
                            <Text fontSize={"xs"}>
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: `${convertTime(
                                    startTime
                                  )} - ${convertTime(endTime)} <i>(${
                                    getDuration(
                                      moment(startTime, "HH:mm:ss"),
                                      moment(endTime, "HH:mm:ss")
                                    ).text
                                  })</i>`,
                                }}
                              ></span>
                            </Text>
                          </Checkbox>
                          {disabledReason ? (
                            <Tooltip label={disabledReason} hasArrow>
                              <Text color={"red.300"} ml={"1"} fontSize={"xs"}>
                                <BsInfoCircle />
                              </Text>
                            </Tooltip>
                          ) : null}
                        </Flex>
                      );
                    })}
                </Grid>
              ) : null}
              <Button
                pb={"2"}
                size={"xs"}
                variant={"link"}
                onClick={() => {
                  onClose();
                  setContractTypeId(contractId);
                  if (rosterType === "primary" && selectedClusterId) {
                    setClusterId(selectedClusterId);
                  }
                  setEmpId(empId);
                  setDayId(rosterCell.id || 0);
                  setStatus(
                    ["HOLIDAY", "WORKING_HOLIDAY"].includes(
                      rosterCell.status || ""
                    )
                      ? "WORKING_HOLIDAY"
                      : "WORKING"
                  );

                  onAddShiftOpen();
                }}
                color={"#027dbc"}
              >
                + Add Shift
              </Button>
            </Flex>
            {rosterCell?.others?.filter(({ workId }) => !workId).length ? (
              <Flex
                direction={"column"}
                borderTop={"1px solid #f1f1f1"}
                // mb={"4"}
              >
                <Flex
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  // background={"#f4f9fb"}
                  pl={"3"}
                  py={"1"}
                >
                  <Text fontSize={"sm"} fontWeight={"medium"}>
                    Secondary Jobs
                  </Text>
                </Flex>

                <Flex direction={"column"} py={"1"} px={"3"}>
                  {rosterCell.others
                    .filter(({ workId }) => !workId)
                    .map(({ e, s, type, c }, i) => {
                      return (
                        <OtherShiftTag
                          key={e + "_" + s}
                          comment={c}
                          empId={empId}
                          endTime={e}
                          id={rosterCell.id}
                          type={type}
                          name={
                            type
                              ? SECONDARY_JOBS_CONFIG.find(
                                  ({ jobType }) => jobType === type
                                )?.label || type
                              : ""
                          }
                          startTime={s}
                          color={COLORS[
                            SECONDARY_JOBS_CONFIG.findIndex(
                              ({ jobType }) => jobType === type
                            ) % COLORS.length
                          ].slice(0, -2)}
                          background={
                            COLORS[
                              SECONDARY_JOBS_CONFIG.findIndex(
                                ({ jobType }) => jobType === type
                              ) % COLORS.length
                            ]
                          }
                        />
                      );
                    })}
                </Flex>
              </Flex>
            ) : null}
            {(rosterCell?.misc?.length ||
              rosterCell?.others?.filter(({ workId }) => workId)?.length) &&
            miscWorks?.length ? (
              <Flex
                direction={"column"}
                borderTop={"1px solid #f1f1f1"}
                // mb={"4"}
              >
                <Flex
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  // background={"#f4f9fb"}
                  pl={"3"}
                  py={"1"}
                >
                  <Text fontSize={"sm"} fontWeight={"medium"}>
                    Miscellaneous Jobs
                  </Text>
                </Flex>

                <Flex direction={"column"} py={"1"} px={"3"}>
                  {[
                    ...(rosterCell?.misc || []),
                    ...(rosterCell?.others?.filter(({ workId }) => workId) ||
                      []),
                  ]
                    .sort((a, b) => a.s.localeCompare(b.s))
                    .map(({ e, s, workId, c, secondaryJobType, type }, i) => {
                      return (
                        <OtherShiftTag
                          key={workId}
                          comment={c}
                          empId={empId}
                          endTime={e}
                          id={rosterCell.id}
                          type={type}
                          name={
                            workId
                              ? `${
                                  miscWorks.find(({ id }) => id === workId)
                                    ?.name
                                }${
                                  type
                                    ? ` (${
                                        SECONDARY_JOBS_CONFIG.find(
                                          ({ jobType }) => jobType === type
                                        )?.label || type
                                      })`
                                    : ""
                                }` || ""
                              : SECONDARY_JOBS_CONFIG.find(
                                  ({ jobType }) => jobType === secondaryJobType
                                )?.label || ""
                          }
                          onRemoveShift={type ? undefined : onRemoveMiscShift}
                          startTime={s}
                          workId={workId}
                          secondaryJobType={secondaryJobType}
                          color={COLORS[
                            (workId
                              ? workId
                              : SECONDARY_JOBS_CONFIG.findIndex(
                                  ({ jobType }) => jobType === secondaryJobType
                                )) % COLORS.length
                          ].slice(0, -2)}
                          background={
                            COLORS[
                              (workId
                                ? workId
                                : SECONDARY_JOBS_CONFIG.findIndex(
                                    ({ jobType }) =>
                                      jobType === secondaryJobType
                                  )) % COLORS.length
                            ]
                          }
                        />
                      );
                    })}
                </Flex>
              </Flex>
            ) : null}
            {getIsPartTime({
              contractTypeId: contractId,
              contractTypes,
            }) &&
            calculateTotalShiftDuration([
              ...(rosterCell.main ?? []),
              ...(rosterCell.others ?? []),
              ...(rosterCell.misc ?? []),
            ]).totalDurationInHours -
              (isLunchExist ? 1 : 0) >
              5 &&
            calculateTotalShiftDuration([
              ...(rosterCell.main ?? []),
              ...(rosterCell.others ?? []),
              ...(rosterCell.misc ?? []),
            ]).totalDurationInHours -
              (isLunchExist ? 1 : 0) !==
              MAX_SHIFT_WITHOUT_LUNCH_PART_TIMER ? (
              <Flex
                alignItems={"center"}
                mt={"4"}
                color={"#e85f5f"}
                justifyContent={"space-between"}
                maxWidth={"398px"}
                textAlign={"center"}
              >
                <Flex
                  background={"#e85f5f1a"}
                  border={"1px solid #e85f5f"}
                  rounded={"sm"}
                  width={"full"}
                  p={"2"}
                  direction={"column"}
                >
                  <Text fontSize={"xs"} fontWeight={"medium"}>
                    {`For part-time employees, the allowed working hours per day are either less than or equal to 5 or exactly ${MAX_SHIFT_WITHOUT_LUNCH_PART_TIMER}.`}
                  </Text>
                </Flex>
              </Flex>
            ) : null}
            <Flex
              alignItems={"center"}
              px={"3"}
              py={"2"}
              mt={"4"}
              background={"#027dbc"}
              color={"white"}
              justifyContent={"space-between"}
            >
              <Flex>
                <Text fontSize={"xs"} fontWeight={"medium"}>
                  {`Total Working Hours: ${
                    calculateTotalShiftDuration([
                      ...(rosterCell.main ?? []),
                      ...(rosterCell.others ?? []),
                      ...(rosterCell.misc ?? []),
                    ]).totalDurationInHours - (isLunchExist ? 1 : 0)
                  }`}
                </Text>
              </Flex>
              {isLunchExist ? (
                <Flex
                  alignItems={"center"}
                  padding={"2px 6px"}
                  rounded={"sm"}
                  background={"white"}
                  color={"#027dbc"}
                >
                  <FaBurger />
                  <Text fontSize={"xs"} ml={"2"}>
                    Lunch Included: <strong>1hr</strong>
                  </Text>
                </Flex>
              ) : null}
            </Flex>
          </MenuList>
        ) : null}
      </Menu>

      <AppRightDrawer
        isOpen={isMiscShiftOpen}
        onClose={onMiscShiftClose}
        heading={`Add Miscellaneous`}
      >
        {miscWork &&
        miscWorks?.length &&
        setMiscWork &&
        contractTypes?.length ? (
          <Flex direction={"column"}>
            <Flex
              direction={"column"}
              borderBottom={"1px solid #f1f1f1"}
              mb={"2"}
              mt={"2"}
              pb={"4"}
              rounded={"md"}
            >
              <Text fontWeight={"medium"}>{`Date: ${formatDate(
                rosterCell.date
              )}`}</Text>
            </Flex>
            {cloneDeep(empWeekRosters).length ? (
              <Flex alignItems={"center"}>
                <Checkbox
                  onChange={(event) => {
                    if (event.target.checked) {
                      setSelectedEmpIds(
                        cloneDeep(empWeekRosters).map(({ empId }) => empId)
                      );
                    } else {
                      setSelectedEmpIds([]);
                    }
                  }}
                  isChecked={
                    cloneDeep(empWeekRosters).length === selectedEmpIds.length
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
                {cloneDeep(empWeekRosters)
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

            <FormControl mb={"4"} isRequired>
              <FormLabel>Name</FormLabel>
              <AppSelect
                onChange={(value) => setMiscWorkId(value)}
                options={miscWorks.map((work) => ({
                  label: work.name,
                  value: work.id,
                }))}
                value={miscWorkId}
              />
            </FormControl>
            <FormControl mb={"4"}>
              <FormLabel>Comment</FormLabel>
              <Textarea
                maxLength={COMMENT_MAX_LENGTH}
                onChange={(e) => setMiscWorkComment(e.target.value)}
                value={miscWorkComment}
              />
              <FormHelperText
                fontSize={"xs"}
                textAlign={"right"}
                color={
                  miscWorkComment.length === COMMENT_MAX_LENGTH
                    ? "red"
                    : "gray.500"
                }
              >
                {miscWorkComment.length}/{COMMENT_MAX_LENGTH}
              </FormHelperText>
            </FormControl>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Start Time</FormLabel>
              <AppSelect
                options={startTimeSlots}
                onChange={setMiscWorkStartTime}
                value={miscWorkStartTime}
                // menuPlacement="top"
              />
            </FormControl>
            <FormControl mb={"4"} isRequired>
              <FormLabel>End Time</FormLabel>
              <AppSelect
                options={endTimeSlots}
                onChange={setMiscWorkEndTime}
                value={miscWorkEndTime}
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
            onClick={() => onSaveMiscShift(false)}
            isDisabled={!miscWorkEndTime || selectedEmpIds.length === 0}
          >
            Save
          </Button>
        </Flex>
      </AppRightDrawer>
      <Modal isOpen={!!warning} onClose={() => setWarning("")}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Warning</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex>
              <Text
                mt={"2"}
                background={"#fff7d6"}
                color={"#907400"}
                fontSize={"xs"}
                p={"2"}
                rounded={"md"}
                textAlign={"center"}
                mb={"2"}
              >
                <span dangerouslySetInnerHTML={{ __html: warning }}></span>
              </Text>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              onClick={() => setWarning("")}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default EmployeeCell;
