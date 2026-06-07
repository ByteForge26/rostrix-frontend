import React from "react";
import { useCalender } from "../../hooks/useCalender";
import { usePermission } from "../../hooks/usePermission";
import { useAppSelector } from "../../app/store/store";
import AppTabs from "../../components/AppTabs";
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import { PERMISSION } from "../../config/permission.config";
import { DAYS, LOP, MONTHS } from "../../helper/Constant";
import { BsChevronDown } from "react-icons/bs";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import moment from "moment";
import { formatDate, getDateFromString } from "../../helper/Utils";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { subDays } from "date-fns";
import LeaveHistory from "./LeaveHistory";
import CustomCircle from "./CustomCircle";
import CustomBox from "../roster/common/CustomBox";
import MonthSwitcher from "../roster/common/MonthSwitcher";
import CalenderRow from "../roster/common/CalenderRow";

function LeavesWeekOffs(props: {
  empId: string;
  empName: string;
  contractTypeId: number;
  stateId: number;
  applyBy: string;
}) {
  const { empId, empName, contractTypeId, stateId, applyBy } = props;

  const {
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
    GENERAL,
    cancelLeaveId,
    comment,
    forceConfirmApplicable,
    fromDate,
    getDisabledDates,
    getLeaveCount,
    HOLIDAY_COLOR,
    isCancelOpen,
    isLoading,
    isOpen,
    leaveTypes,
    ROSTER_PUBLISHED_COLOR,
    WEEK_OFF_BUTTON_COLOR,
    messageObj,
    onApplyLeave,
    onCancelClose,
    onClose,
    onDateClick,
    onSaveLeave,
    LEAVE_COLOR,
    setComment,
    setFromDate,
    setToDate,
    setType,
    toDate,
    type,
    WEEK_OFF_COLOR,
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
    onHolidayClose,
    isLeaveHistoryOpen,
    onLeaveHistoryOpen,
    onLeaveHistoryClose,
    onDiscardChanges,
    payrollConfig,
    leaveCancelledDates,
    setLeaveCancelledDates,
    getBWDates,
  } = useCalender({ empId, contractTypeId, stateId, applyBy });
  const { checkForPermission } = usePermission();
  const COMMENT_MAX_LENGTH = 200;
  return (
    <>
      {payrollConfig ? (
        <>
          <AppTabs
            setValue={(value) => {
              setTabValue(value);
              setWeekOffMode(false);
            }}
            value={tabValue}
            tabs={TABS}
          >
            {tabValue === TABS[1].value ? (
              <>
                <Button variant={"outline"} onClick={onLeaveHistoryOpen}>
                  View Leaves History
                </Button>
                {checkForPermission(
                  PERMISSION.Leave["My Leaves & Week Off's"].Apply,
                ) && (
                  <Button ml={"4"} onClick={() => onApplyLeave()}>
                    Apply Leave
                  </Button>
                )}
              </>
            ) : (
              <>
                {checkForPermission(
                  PERMISSION.Leave["My Leaves & Week Off's"].Apply,
                ) && (
                  <>
                    {weekOffMode ? (
                      <Flex>
                        <Button
                          variant={"outline"}
                          fontSize={"sm"}
                          onClick={() => {
                            onDiscardChanges();
                            setWeekOffMode(false);
                          }}
                          mr={"2"}
                        >
                          Discard
                        </Button>
                        <Button
                          fontSize={"sm"}
                          onClick={() => {
                            onSaveWeekOff();
                            setWeekOffMode(false);
                          }}
                        >
                          Save
                        </Button>
                      </Flex>
                    ) : (
                      <Button
                        onClick={() => {
                          setWeekOffMode(true);
                        }}
                      >
                        Apply
                      </Button>
                    )}
                  </>
                )}
              </>
            )}
          </AppTabs>
          {tabValue === TABS[0].value ? (
            <Flex pb={"4"}>
              <Text fontSize={"sm"}>
                You can plan your upcoming week offs by selecting or deselecting
                the date. You can apply max {maxWeekOffs} week offs in a week.
              </Text>
            </Flex>
          ) : null}

          <Flex>
            <Flex
              border={"1px solid #eaeaea"}
              width={"fit-content"}
              rounded={"md"}
              direction={"column"}
              background={"#F8F8F8"}
              p={"2"}
            >
              <MonthSwitcher
                currentMonth={currentMonth}
                currentYear={currentYear}
                setCurrentMonth={setCurrentMonth}
                setCurrentYear={setCurrentYear}
                onPrevMonth={onPrevMonth}
                onNextMonth={onNextMonth}
                disabled={weekOffMode}
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
                                fontSize={"sm"}
                                fontWeight={"medium"}
                                color={"gray.400"}
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
                                    label={
                                      holiday
                                        ? holiday
                                        : leaveId
                                          ? "On Leave"
                                          : appliedDates.includes(
                                                moment(date).format(
                                                  "YYYY-MM-DD",
                                                ),
                                              ) && !weekOffMode
                                            ? "Week Off"
                                            : roster && !weekOffMode
                                              ? "Roster Published"
                                              : ""
                                    }
                                    bg="gray.300"
                                    color="black"
                                    openDelay={500}
                                    id={moment(date).format("DD-MM-yyyy")}
                                  >
                                    <Flex
                                      id={moment(date).format("DD-MM-yyyy")}
                                      px={"7"}
                                      m={"0.5px"}
                                      py={"5"}
                                      height={"90px"}
                                      boxShadow={"sm"}
                                      transition={"0.3s"}
                                      alignItems={"center"}
                                      justifyContent={"center"}
                                      position={"relative"}
                                      width={"114px"}
                                      background={
                                        roster
                                          ? ROSTER_PUBLISHED_COLOR
                                          : "white"
                                      }
                                      opacity={
                                        weekOffMode
                                          ? date.getTime() >=
                                            moment(
                                              payrollConfig.currentPStartDateTime,
                                            )
                                              .startOf("day")
                                              .unix() *
                                              1000
                                            ? 1
                                            : 0.6
                                          : 1
                                      }
                                      onClick={() => {
                                        if (
                                          checkForPermission(
                                            PERMISSION.Leave[
                                              "My Leaves & Week Off's"
                                            ].Apply,
                                          )
                                        ) {
                                          if (
                                            weekOffMode &&
                                            tabValue === TABS[0].value &&
                                            !holiday &&
                                            !leaveId &&
                                            date.getTime() >=
                                              moment(
                                                payrollConfig.currentPStartDateTime,
                                              )
                                                .startOf("day")
                                                .unix() *
                                                1000
                                          ) {
                                            onWeekOffClick(
                                              moment(date).format("YYYY-MM-DD"),
                                            );
                                            return;
                                          }
                                          if (
                                            tabValue === TABS[0].value &&
                                            !weekOffMode
                                          )
                                            return;
                                          if (holiday) {
                                            return;
                                          }
                                          if (
                                            leaveId &&
                                            leaves &&
                                            leaves.length
                                          ) {
                                            const currentLeave = leaves.find(
                                              ({ id }) => id === leaveId,
                                            );
                                            if (
                                              currentLeave &&
                                              !weekOffMode &&
                                              !weekOff
                                            ) {
                                              if (
                                                getDateFromString(
                                                  currentLeave.toDate,
                                                ).getTime() >=
                                                moment(
                                                  payrollConfig.currentPStartDateTime,
                                                )
                                                  .startOf("day")
                                                  .unix() *
                                                  1000
                                              ) {
                                                onDateClick({
                                                  date,
                                                  leaveId,
                                                });
                                              }
                                            }

                                            return;
                                          }
                                          if (
                                            date.getTime() >=
                                              moment(
                                                payrollConfig.currentPStartDateTime,
                                              )
                                                .startOf("day")
                                                .unix() *
                                                1000 &&
                                            !weekOff &&
                                            !holiday
                                          ) {
                                            onDateClick({ date });
                                            return;
                                          }
                                        }
                                      }}
                                    >
                                      <Flex
                                        width={"full"}
                                        height={"full"}
                                        justifyContent={"center"}
                                        alignItems={"center"}
                                        rounded={"xl"}
                                        transition={"0.3s"}
                                        style={{
                                          background:
                                            leaveId &&
                                            !weekOffMode &&
                                            tabValue === TABS[1].value
                                              ? LEAVE_COLOR
                                              : weekOff &&
                                                  tabValue === TABS[0].value &&
                                                  !weekOffMode
                                                ? WEEK_OFF_COLOR
                                                : weekOffMode &&
                                                    !holiday &&
                                                    !leaveId
                                                  ? appliedDates.includes(
                                                      moment(date).format(
                                                        "YYYY-MM-DD",
                                                      ),
                                                    )
                                                    ? WEEK_OFF_COLOR
                                                    : WEEK_OFF_BUTTON_COLOR
                                                  : "white",
                                        }}
                                        cursor={
                                          !weekOffMode &&
                                          tabValue === TABS[1].value &&
                                          !holiday &&
                                          !weekOff &&
                                          date.getTime() >=
                                            moment(
                                              payrollConfig.currentPStartDateTime,
                                            )
                                              .startOf("day")
                                              .unix() *
                                              1000
                                            ? "pointer"
                                            : weekOffMode &&
                                                tabValue === TABS[0].value &&
                                                !holiday &&
                                                !leaveId &&
                                                date.getTime() >=
                                                  moment(
                                                    payrollConfig.currentPStartDateTime,
                                                  )
                                                    .startOf("day")
                                                    .unix() *
                                                    1000
                                              ? "pointer"
                                              : "unset"
                                        }
                                      >
                                        <Text
                                          textAlign={"center"}
                                          color={"black"}
                                          fontWeight={
                                            date.getTime() >=
                                              moment(
                                                payrollConfig.currentPStartDateTime,
                                              )
                                                .startOf("day")
                                                .unix() *
                                                1000 || today
                                              ? "medium"
                                              : "normal"
                                          }
                                          opacity={
                                            date.getTime() >=
                                              moment(
                                                payrollConfig.currentPStartDateTime,
                                              )
                                                .startOf("day")
                                                .unix() *
                                                1000 || today
                                              ? calender[14].date.getMonth() ===
                                                date.getMonth()
                                                ? 1
                                                : 0.4
                                              : 0.5
                                          }
                                        >
                                          {date.getDate()}
                                        </Text>

                                        {leaveId &&
                                        tabValue === TABS[0].value ? (
                                          <CustomCircle color={LEAVE_COLOR} />
                                        ) : null}
                                        {holiday ? (
                                          <CustomCircle color={HOLIDAY_COLOR} />
                                        ) : null}
                                        {weekOff &&
                                        date.getTime() < Date.now() &&
                                        tabValue === TABS[1].value ? (
                                          <CustomCircle
                                            color={WEEK_OFF_COLOR}
                                          />
                                        ) : null}
                                        {weekOff &&
                                        date.getTime() >=
                                          moment(
                                            payrollConfig.currentPStartDateTime,
                                          )
                                            .startOf("day")
                                            .unix() *
                                            1000 &&
                                        tabValue === TABS[1].value ? (
                                          <CustomCircle
                                            color={WEEK_OFF_COLOR}
                                          />
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
                <Flex my={"2"} mx={"4"} alignItems={"center"}>
                  <CustomBox color={HOLIDAY_COLOR} background={HOLIDAY_COLOR} />
                  <Text ml={"2"} fontWeight={"medium"} fontSize={"sm"}>
                    Holiday
                  </Text>
                </Flex>
                <Flex my={"2"} mx={"4"} alignItems={"center"}>
                  <CustomBox color={LEAVE_COLOR} background={LEAVE_COLOR} />
                  <Text ml={"2"} fontWeight={"medium"} fontSize={"sm"}>
                    On Leave
                  </Text>
                </Flex>
                <Flex my={"2"} mx={"4"} alignItems={"center"}>
                  <CustomBox
                    color={WEEK_OFF_COLOR}
                    background={WEEK_OFF_COLOR}
                  />
                  <Text ml={"2"} fontWeight={"medium"} fontSize={"sm"}>
                    Week Off
                  </Text>
                </Flex>
                {/* <Flex my={"2"} mx={"4"} alignItems={"center"}>
              <CustomBox color={TODAY_COLOR} background={TODAY_COLOR} />
              <Text ml={"2"} fontWeight={"medium"} fontSize={"sm"}>
                Today
              </Text>
            </Flex> */}
                {/* <Flex my={"2"} mx={"4"} alignItems={"center"}>
              <CustomBox
                color={ROSTER_PUBLISHED_COLOR}
                background={ROSTER_PUBLISHED_COLOR}
              />
              <Text ml={"2"} fontWeight={"medium"} fontSize={"sm"}>
                Roster
              </Text>
            </Flex> */}
              </Flex>
            </Flex>
            {/* {tabValue == TABS[1].value ? ( */}
            {true ? (
              <Flex flexDirection={"column"} ml={"4"} minWidth={"240px"}>
                {leavesData && tabValue === TABS[1].value ? (
                  <Flex width={"full"} direction={"column"} mb={"4"}>
                    {[
                      {
                        key: "Leaves Balance",
                        value: `${
                          leavesData.totalAllowedLeaves - getLeaveCount(GENERAL)
                        }`,
                        background: "#dceaf4",
                      },
                      {
                        key: "Planned/Availed Leaves",
                        value: getLeaveCount(GENERAL),
                        background: LEAVE_COLOR,
                      },
                      {
                        key: "Total LOP",
                        value: getLeaveCount(LOP),
                        background: "#ffe3e3",
                      },
                    ].map(({ key, value, background }, i) => (
                      <Flex
                        mb={"2"}
                        key={key}
                        border={`1px solid #eaeaea`}
                        rounded={"md"}
                        background={background}
                        p={"3"}
                        justifyContent={"space-between"}
                        direction={"column"}
                        width={"full"}
                        alignItems={"center"}
                      >
                        <Text fontWeight={"bold"} fontSize={"xl"}>
                          {value}
                        </Text>
                        <Text fontSize={"sm"}>{key}</Text>
                      </Flex>
                    ))}
                  </Flex>
                ) : null}
                <Flex
                  width={"full"}
                  direction={"column"}
                  border={"1px solid #eaeaea"}
                  rounded={"md"}
                  background={"white"}
                >
                  <Text
                    m={"2"}
                    textAlign={"center"}
                    background={"#F2F2F2"}
                    p={"2"}
                    rounded={"md"}
                  >
                    Holidays this month
                  </Text>
                  {calender?.length &&
                  holidays &&
                  holidays.length &&
                  holidays.filter(({ date }) => {
                    if (new Date(date).getMonth() === currentMonth) {
                      return true;
                    }
                    return false;
                  }).length ? (
                    <Flex direction={"column"} width={"full"}>
                      {holidays
                        .filter(({ date }) => {
                          if (new Date(date).getMonth() === currentMonth) {
                            return true;
                          }
                          return false;
                        })
                        .sort(
                          (a, b) =>
                            getDateFromString(a.date).getTime() -
                            getDateFromString(b.date).getTime(),
                        )
                        .map(({ date, name }, i) => (
                          <Flex
                            key={date + name}
                            px={"4"}
                            py={"3"}
                            justifyContent={"space-between"}
                            direction={"column"}
                            borderBottom={"1px solid #eaeaea"}
                          >
                            <Text
                              color={HOLIDAY_COLOR}
                              fontSize={"sm"}
                              fontWeight={"bold"}
                              mb={"1"}
                            >
                              {formatDate(date)}
                            </Text>
                            <Text>{name}</Text>
                          </Flex>
                        ))}
                    </Flex>
                  ) : (
                    <Flex
                      alignItems={"center"}
                      minHeight={"100px"}
                      justifyContent={"center"}
                    >
                      <Text
                        fontSize={"sm"}
                        color={"gray.500"}
                        textAlign={"center"}
                      >
                        No Holiday for this month.
                      </Text>
                    </Flex>
                  )}
                </Flex>
              </Flex>
            ) : null}
          </Flex>
          <LeaveHistory
            isLeaveHistoryOpen={isLeaveHistoryOpen}
            leavesData={leavesData}
            onLeaveHistoryClose={onLeaveHistoryClose}
            onDateClick={onDateClick}
            canCancelLeave={checkForPermission(
              PERMISSION.Leave["My Leaves & Week Off's"].Apply,
            )}
            empName={empName}
            year={currentYear}
            payrollConfig={payrollConfig}
          />

          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Apply Leave</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {leaveTypes?.length ? (
                  <FormControl mb={"4"} isRequired>
                    <FormLabel>Type</FormLabel>
                    <RadioGroup
                      value={type}
                      onChange={(value) => setType(value)}
                      isDisabled={
                        messageObj &&
                        messageObj.length &&
                        forceConfirmApplicable
                          ? true
                          : false
                      }
                      mb={"2"}
                    >
                      <Stack direction="row">
                        {leaveTypes.map(({ label, value }) => (
                          <Radio value={value} key={value + label}>
                            {label}
                          </Radio>
                        ))}
                      </Stack>
                    </RadioGroup>
                    {/* <AppSelect
                  disabled={
                    messageObj && messageObj.length && forceConfirmApplicable
                      ? true
                      : false
                  }
                  value={type}
                  onChange={(value) => setType(value)}
                  options={
                    leaveTypes && leaveTypes.length
                      ? leaveTypes.map(({ label, value }) => ({
                          label,
                          value,
                        }))
                      : []
                  }
                /> */}
                    {leavesData &&
                    type === GENERAL &&
                    leavesData.totalAllowedLeaves - getLeaveCount(GENERAL) <=
                      0 ? (
                      <FormHelperText fontSize={"xs"}>
                        Your General Leave Balance is 0, so Your leave will be
                        considered as LOP.
                      </FormHelperText>
                    ) : null}
                  </FormControl>
                ) : null}

                <FormControl mb={"4"}>
                  <FormLabel>Comment</FormLabel>
                  <Textarea
                    maxLength={COMMENT_MAX_LENGTH}
                    disabled={
                      messageObj && messageObj.length && forceConfirmApplicable
                        ? true
                        : false
                    }
                    placeholder="Enter here"
                    value={comment}
                    onChange={(e) => {
                      if (!e.target.value) {
                        setComment("");
                      } else if (/^[a-zA-Z0-9@,.#\s]+$/.test(e.target.value)) {
                        setComment(e.target.value);
                      }
                    }}
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
                  <FormLabel>From Date</FormLabel>
                  <SingleDatepicker
                    disabled={
                      messageObj && messageObj.length && forceConfirmApplicable
                        ? true
                        : false
                    }
                    date={fromDate ? new Date(fromDate) : undefined}
                    onDateChange={(date) => {
                      setFromDate(moment(date).format("YYYY-MM-DD"));
                      setToDate("");
                    }}
                    minDate={moment(
                      payrollConfig.currentPStartDateTime,
                    ).toDate()}
                    configs={{
                      dateFormat: "dd-MM-yyyy",
                    }}
                    disabledDates={getDisabledDates()}
                  />
                </FormControl>
                {[GENERAL, LOP].includes(type) ? (
                  <FormControl mb={"4"} isRequired>
                    <FormLabel>To Date</FormLabel>
                    <SingleDatepicker
                      disabled={
                        messageObj &&
                        messageObj.length &&
                        forceConfirmApplicable
                          ? true
                          : false
                      }
                      date={toDate ? new Date(toDate) : undefined}
                      onDateChange={(date) =>
                        setToDate(moment(date).format("YYYY-MM-DD"))
                      }
                      minDate={
                        fromDate
                          ? subDays(new Date(fromDate), 1)
                          : subDays(new Date(), 1)
                      }
                      maxDate={moment(getDateFromString(fromDate))
                        .endOf("year")
                        .toDate()}
                      configs={{
                        dateFormat: "dd-MM-yyyy",
                      }}
                      disabledDates={getDisabledDates()}
                    />
                    {fromDate && toDate ? (
                      <FormHelperText>
                        Duration:{" "}
                        {moment(new Date(toDate)).diff(
                          moment(fromDate),
                          "days",
                        ) + 1}{" "}
                        Days
                      </FormHelperText>
                    ) : null}
                  </FormControl>
                ) : null}

                {messageObj?.length ? (
                  <>
                    {messageObj.map(({ message, messageType }) => (
                      <Text
                        key={message}
                        background={
                          messageType === "INFO" ? "#fff7d6" : "#ffeaea"
                        }
                        color={messageType === "INFO" ? "#907400" : "red"}
                        fontSize={"xs"}
                        p={"2"}
                        rounded={"md"}
                        textAlign={"center"}
                        mb={"2"}
                      >
                        <span
                          dangerouslySetInnerHTML={{ __html: message }}
                        ></span>
                      </Text>
                    ))}
                  </>
                ) : null}
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="outline"
                  fontSize={"sm"}
                  mr={3}
                  onClick={onClose}
                >
                  Close
                </Button>
                <Button
                  isDisabled={
                    !type ||
                    !fromDate ||
                    ([GENERAL, LOP].includes(type) ? !toDate : false) ||
                    isLoading
                  }
                  onClick={() =>
                    onSaveLeave(
                      messageObj && messageObj.length && forceConfirmApplicable
                        ? true
                        : false,
                    )
                  }
                >
                  {isLoading ? (
                    <Spinner />
                  ) : messageObj &&
                    messageObj.length &&
                    forceConfirmApplicable ? (
                    "Confirm"
                  ) : (
                    "Save"
                  )}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Modal isOpen={isCancelOpen} onClose={onCancelClose} size={"xl"}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Cancel Leave</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {leavesData?.leaves?.length ? (
                  <>
                    <Text>
                      By default, all leaves within the selected range will be
                      canceled. To partially cancel leaves, please select or
                      deselect specific dates.
                    </Text>
                    <Text mt={"2"}>
                      {/* Duration:{" "}
                      {formatDate(
                        leavesData.leaves.find(({ id }) => cancelLeaveId === id)
                          ?.fromDate ?? ""
                      )}{" "}
                      to{" "}
                      {formatDate(
                        leavesData.leaves.find(({ id }) => cancelLeaveId === id)
                          ?.toDate ?? ""
                      )} */}
                    </Text>
                    <Flex flexWrap={"wrap"}>
                      {getBWDates({
                        fromDate: leavesData.leaves.find(
                          ({ id }) => cancelLeaveId === id,
                        )?.fromDate,
                        toDate: leavesData.leaves.find(
                          ({ id }) => cancelLeaveId === id,
                        )?.toDate,
                      }).map((date) => {
                        let isDisabled =
                          moment(date).startOf("day").unix() * 1000 <
                          moment(payrollConfig.currentPStartDateTime)
                            .startOf("day")
                            .unix() *
                            1000;

                        return (
                          <Flex key={date}>
                            <Flex
                              justifyContent={"center"}
                              alignItems={"center"}
                              rounded={"xl"}
                              transition={"0.3s"}
                              background={
                                isDisabled
                                  ? "#e85f5f33"
                                  : leaveCancelledDates.includes(date)
                                    ? "#e85f5f"
                                    : "#e85f5f33"
                              }
                              px={"3"}
                              py={"1"}
                              m={"1"}
                              cursor={isDisabled ? "not-allowed" : "pointer"}
                              opacity={isDisabled ? 0.25 : 1}
                              color={
                                leaveCancelledDates.includes(date)
                                  ? "white"
                                  : "black"
                              }
                              onClick={() => {
                                if (isDisabled) {
                                  return;
                                }
                                if (leaveCancelledDates.includes(date)) {
                                  setLeaveCancelledDates(
                                    leaveCancelledDates.filter(
                                      (d) => d !== date,
                                    ),
                                  );
                                } else {
                                  setLeaveCancelledDates([
                                    ...leaveCancelledDates,
                                    date,
                                  ]);
                                }
                              }}
                            >
                              <Text fontSize={"xs"}>
                                {moment(date).format("DD MMM")}
                              </Text>
                            </Flex>
                          </Flex>
                        );
                      })}
                    </Flex>
                  </>
                ) : null}
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="outline"
                  fontSize={"sm"}
                  mr={3}
                  onClick={onCancelClose}
                >
                  Close
                </Button>
                <Button
                  colorScheme="red"
                  variant={"solid"}
                  fontSize={"sm"}
                  onClick={() => onCancelLeave({ cancelAllLeave: false })}
                  mr={3}
                  isDisabled={leaveCancelledDates.length === 0}
                >
                  Cancel Selected
                </Button>

                <Button
                  colorScheme="red"
                  variant={"solid"}
                  fontSize={"sm"}
                  onClick={() => onCancelLeave({ cancelAllLeave: true })}
                >
                  Cancel All
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Modal isOpen={isHolidayOpen} onClose={onHolidayClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Holidays (Year:{currentYear})</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {holidays?.length ? (
                  <Flex>
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
                              Date
                            </Th>
                            <Th background="#EBF3F8" color="#616161">
                              Name
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody fontSize={"sm"}>
                          {holidays
                            .sort(
                              (a, b) =>
                                new Date(a.date).getTime() -
                                new Date(b.date).getTime(),
                            )
                            .map(({ date, name }, i) => (
                              <Tr key={date + name}>
                                <Td py={"3"}>{formatDate(date)}</Td>
                                <Td py={"3"}>{name}</Td>
                              </Tr>
                            ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Flex>
                ) : null}
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="outline"
                  fontSize={"sm"}
                  onClick={onHolidayClose}
                >
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ) : (
        <></>
      )}
    </>
  );
}

export default LeavesWeekOffs;
