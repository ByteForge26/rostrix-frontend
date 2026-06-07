import {
  Badge,
  Button,
  Flex,
  IconButton,
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
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  COLORS,
  MONTHS,
  PUBLISH_OPTIONS,
  ROSTER_STATUS,
  SECONDARY_JOBS_CONFIG,
} from "../../../helper/Constant";
import {
  IEmpDailyExceedingHours,
  IEmpExceedingHours,
  IEmpWeeklyExceedingHours,
  IMonthSummary,
  IPayrollConfig,
  IRosterHookProps,
  IWeekUncoveredShift,
} from "../../../helper/Interface";
import { useAppSelector } from "../../../app/store/store";
import moment from "moment";
import AppTabs from "../../../components/AppTabs";
import { rosterV2Image } from "../../../helper/Images";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiExternalLink } from "react-icons/fi";
import { formatDate, isFutureWeek } from "../../../helper/Utils";
import { BsLink } from "react-icons/bs";
import { cloneDeep } from "lodash";
import RosterPublishSuccess from "./RosterPublishSuccess";
import RosterPublishHoursWarning from "./RosterPublishHoursWarning";
import RosterPublishForceConfirmWarning from "./RosterPublishForceConfirmWarning";
import RosterPublishCJPWarning from "./RosterPublishCJPWarning";
import RosterPublishButton from "./RosterPublishButton";

interface IProps {
  readonly monthSummary: IMonthSummary[];
  readonly onPublishRoster: (props: {
    notifyTo: string;
    forceConfirm?: boolean;
    week?: number;
  }) => Promise<void>;
  readonly onChangeWeek: (week: number) => void;
  readonly onCloneWeekModalOpen: () => void;
  readonly goToRosterEdit: (week: number) => void;
  readonly isPublishedRosterModalOpen: boolean;
  readonly onPublishedRosterModalClose: () => void;
  readonly rosterType: IRosterHookProps["rosterType"];
  readonly empExceedingHoursList: IEmpExceedingHours[];
  readonly empWeeklyExceedingHoursList: IEmpWeeklyExceedingHours[];
  readonly empDailyExceedingHoursList: IEmpDailyExceedingHours[];
  readonly isEmpExceedingHoursListModalOpen: boolean;
  readonly onEmpExceedingHoursListModalClose: () => void;
  readonly payrollConfig?: IPayrollConfig;
  readonly isForceConfirmModalOpen: boolean;
  readonly onForceConfirmModalClose: () => void;
  readonly messageObj?: {
    messageType: "INFO" | "WARN";
    message: string;
  }[];
  readonly isWeekUncoveredShiftsModalOpen: boolean;
  readonly onWeekUncoveredShiftsModalClose: () => void;
  readonly weekUncoveredShifts: IWeekUncoveredShift[];
  readonly globalNotifyTo: string;
  readonly setGlobalNotifyTo: (notifyTo: string) => void;
}
function MonthsSummary(props: IProps) {
  const navigate = useNavigate();
  const {
    monthSummary,
    onPublishRoster,
    onChangeWeek,
    onCloneWeekModalOpen,
    goToRosterEdit,
    isPublishedRosterModalOpen,
    onPublishedRosterModalClose,
    rosterType,
    payrollConfig,
    empExceedingHoursList,
    empWeeklyExceedingHoursList,
    empDailyExceedingHoursList,
    isEmpExceedingHoursListModalOpen,
    onEmpExceedingHoursListModalClose,
    isForceConfirmModalOpen,
    onForceConfirmModalClose,
    messageObj,
    isWeekUncoveredShiftsModalOpen,
    onWeekUncoveredShiftsModalClose,
    weekUncoveredShifts,
    globalNotifyTo,
    setGlobalNotifyTo,
  } = props;

  const { selectedYear, selectedMonth, selectedWeek } = useAppSelector(
    (state) => state.roster
  );
  const {
    isOpen: isPublishWarningOpen,
    onOpen: onPublishWarningOpen,
    onClose: onPublishWarningClose,
  } = useDisclosure();
  const [notInitialisedWeeks, setNotInitialisedWeeks] = useState<number[]>([]);
  const checkForNIWeeks = (notifyTo: string) => {
    const NIWeeks: number[] = [];
    if (selectedMonth !== undefined) {
      const selectedMonthData = monthSummary.find(
        ({ month }) => month === selectedMonth
      );
      if (selectedMonthData?.weekList?.length) {
        selectedMonthData.weekList.forEach(({ status, week }) => {
          if (["NI"].includes(status)) {
            NIWeeks.push(week);
          }
        });
      }
    }
    setNotInitialisedWeeks(NIWeeks);
    return !!NIWeeks.length;
  };
  const onCreateRosterClick = () => {
    navigate(`/${rosterType === "primary" ? "layout" : "secondary"}/roster`);
    onCloneWeekModalOpen();
  };
  useEffect(() => {
    if (selectedMonth !== undefined && monthSummary && monthSummary.length) {
      const firstWeekOfMonth = monthSummary.filter(
        ({ month }) => selectedMonth === month
      )[0].weekList[0].week;
      if (selectedWeek) {
        if (
          monthSummary
            .filter(({ month }) => month === selectedMonth)[0]
            .weekList.findIndex(({ week }) => week === selectedWeek) === -1
        ) {
          onChangeWeek(firstWeekOfMonth);
        }
      } else {
        onChangeWeek(firstWeekOfMonth);
      }
    }
  }, [selectedMonth]);
  return (
    <Flex
      flex={1}
      ml={"4"}
      border={"1px solid #eaeaea"}
      width={"fit-content"}
      rounded={"md"}
      direction={"column"}
      background={"#F8F8F8"}
      p={"2"}
    >
      {selectedMonth !== undefined ? (
        <Flex
          background={"white"}
          p={"2"}
          width={"full"}
          roundedTopLeft={"md"}
          roundedTopRight={"md"}
          boxShadow={"sm"}
          mb={"2"}
          minHeight={"68px"}
          alignItems={"center"}
          justifyContent={"space-between"}
          pr={"4"}
        >
          <Flex alignItems={"center"}>
            <Text
              ml={"3"}
              fontWeight={"medium"}
              mr={"2"}
            >{`${MONTHS[selectedMonth]} ${selectedYear}`}</Text>
          </Flex>

          {selectedWeek &&
          selectedYear &&
          monthSummary.filter(({ month }) => selectedMonth === month).length &&
          monthSummary.filter(({ month }) => selectedMonth === month)[0]
            .publishable &&
          !["NA", "NI"].includes(
            monthSummary.filter(({ month }) => selectedMonth === month)[0]
              .status
          ) ? (
            <RosterPublishButton
              setGlobalNotifyTo={setGlobalNotifyTo}
              onPublishRoster={(props) => {
                if (checkForNIWeeks(props.notifyTo)) {
                  onPublishWarningOpen();
                } else {
                  onPublishRoster({ notifyTo: props.notifyTo });
                }
              }}
              withSave={false}
            />
          ) : null}
        </Flex>
      ) : null}

      <Flex
        background={"white"}
        p={"4"}
        width={"full"}
        roundedBottomLeft={"md"}
        roundedBottomRight={"md"}
        boxShadow={"sm"}
        flex={1}
        direction={"column"}
      >
        <AppTabs
          tabs={monthSummary
            .filter(({ month }) => month === selectedMonth)[0]
            .weekList.sort(
              (a, b) => moment(a.startDate).unix() - moment(b.startDate).unix()
            )
            .map(({ week, status }) => {
              const { background, color } = ROSTER_STATUS.filter(
                (obj) => obj.status === status
              )[0];
              return {
                name: `Week ${week}`,
                value: week.toString(),
                dot: {
                  background,
                  color,
                },
              };
            })}
          setValue={(value) => onChangeWeek(Number(value))}
          value={selectedWeek ? selectedWeek?.toString() : ""}
        ></AppTabs>

        <Flex
          borderTop={"1px solid #eaeaea"}
          // p={"2"}
          flex={1}
          direction={"column"}
        >
          <Flex
            mt={"4"}
            justifyContent={"space-between"}
            alignItems={"center"}
            minHeight={"40px"}
          >
            <Flex alignItems={"center"}>
              <Text fontWeight={"medium"}>Week Summary</Text>
              {monthSummary?.length ? (
                <>
                  {monthSummary
                    .filter(({ month }) => selectedMonth == month)[0]
                    .weekList.filter(({ week }) => selectedWeek === week)
                    .map(({ startDate, endDate, status }) => {
                      const { background, name } = ROSTER_STATUS.filter(
                        (obj) => obj.status === status
                      )[0];
                      return (
                        <Flex key={startDate} ml={"2"} alignItems={"center"}>
                          <Text fontSize={"xs"} color={"gray.600"}>
                            {`(${formatDate(startDate)} - ${formatDate(
                              endDate
                            )})`}
                          </Text>
                          <Badge variant={"subtle"} color={background} ml={"2"}>
                            {name}
                          </Badge>
                        </Flex>
                      );
                    })}
                </>
              ) : null}
            </Flex>

            {selectedWeek &&
            selectedYear &&
            payrollConfig &&
            isFutureWeek({
              selectedWeek,
              selectedYear,
              currentPStartDateTime: payrollConfig.currentPStartDateTime,
            }) &&
            monthSummary
              .filter(({ month }) => month === selectedMonth)[0]
              .weekList.find(({ week }) => selectedWeek === week)?.status &&
            !["NA", "NI"].includes(
              monthSummary
                .filter(({ month }) => month === selectedMonth)[0]
                .weekList.find(({ week }) => selectedWeek === week)?.status ||
                ""
            ) ? (
              <Button
                leftIcon={<FiEdit />}
                variant={"outline"}
                onClick={() => goToRosterEdit(selectedWeek)}
              >
                Edit
              </Button>
            ) : null}
          </Flex>
          {monthSummary
            .filter(({ month }) => selectedMonth == month)[0]
            .weekList.filter(({ week }) => selectedWeek === week)[0] &&
          ["NI", "NA"].includes(
            monthSummary
              .filter(({ month }) => selectedMonth == month)[0]
              .weekList.filter(({ week }) => selectedWeek === week)[0].status
          ) ? (
            <Flex
              width={"full"}
              justifyContent={"space-evenly"}
              alignItems={"center"}
              height={"full"}
              rounded={"lg"}
              border={"1px solid #e7e7e7 "}
              mt={"4"}
            >
              <Flex>
                <img
                  src={rosterV2Image}
                  alt=""
                  style={{
                    maxWidth: "240px",
                  }}
                />
              </Flex>

              <Flex
                direction={"column"}
                textAlign={"center"}
                maxWidth={"300px"}
                pb={"4"}
              >
                {selectedWeek &&
                selectedYear &&
                payrollConfig &&
                isFutureWeek({
                  currentPStartDateTime: payrollConfig.currentPStartDateTime,
                  selectedWeek,
                  selectedYear,
                }) ? (
                  <>
                    <Text fontWeight={"medium"} pb={"2"}>
                      Oh Shift! Looks like you haven't scheduled anything yet!
                    </Text>
                    <Text fontSize={"xs"}>
                      This week’s roster is as empty as monday mornings before
                      the first cup of coffee.
                    </Text>
                    <Flex justifyContent={"center"} pt={"4"}>
                      <Button onClick={onCreateRosterClick}>
                        + Create Roster
                      </Button>
                    </Flex>
                  </>
                ) : (
                  <>
                    <Text fontWeight={"medium"} pb={"2"}>
                      Oh Shift! Looks like no roster exists for this week.
                    </Text>
                    <Text fontSize={"xs"}>
                      You can not create a new Roster for past weeks.
                    </Text>
                  </>
                )}
              </Flex>
            </Flex>
          ) : (
            <>
              {monthSummary
                .filter(({ month }) => selectedMonth == month)[0]
                .weekList.filter(({ week }) => selectedWeek === week)
                .map(
                  (
                    {
                      status,
                      initAt,
                      initBy,
                      startDate,
                      endDate,
                      impacted,
                      updatedAt,
                      updatedBy,
                    },
                    i
                  ) => (
                    <Flex
                      key={startDate + "_" + endDate}
                      background={"white"}
                      p={"2"}
                      rounded={"lg"}
                      border={"1px solid #e7e7e7 "}
                      direction={"column"}
                      margin={"auto"}
                      // minW={"70%"}
                      width={"full"}
                      mt={"4"}
                      flex={1}
                    >
                      <Flex direction={"column"} px={"1"}>
                        {[
                          //   {
                          //     label: "Week Duration",
                          //     value: `${formatDate(startDate)} - ${formatDate(
                          //       endDate
                          //     )}`,
                          //   },
                          {
                            label: "Status",
                            value: status
                              ? ROSTER_STATUS.find(
                                  (obj) => status === obj.status
                                )?.name
                              : "-",
                            status: status,
                          },
                          {
                            label: "Created Time",
                            value: initAt
                              ? formatDate(initAt, { time: true })
                              : "-",
                          },
                          {
                            label: "Created By",
                            value: initBy || "-",
                          },

                          {
                            label: "Last Updated On",
                            value: updatedAt
                              ? formatDate(updatedAt, { time: true })
                              : "-",
                          },
                          {
                            label: "Last Updated By",
                            value: updatedBy || "-",
                          },
                        ].map(({ label, value, status }) => {
                          return (
                            <Flex
                              my={"1"}
                              key={label}
                              // background={"#E8F6FD"}
                              px={"3"}
                              py={"1"}
                              rounded={"md"}
                            >
                              <Text
                                fontSize={"sm"}
                                color={"gray.500"}
                                mr={"2"}
                                minWidth={"35%"}
                              >
                                {label}:
                              </Text>
                              <Text fontSize={"sm"} fontWeight={"normal"}>
                                {status ? (
                                  <Badge
                                    variant={"subtle"}
                                    color={
                                      ROSTER_STATUS.find(
                                        (obj) => status === obj.status
                                      )?.background
                                    }
                                  >
                                    {value}
                                  </Badge>
                                ) : (
                                  value
                                )}
                              </Text>
                            </Flex>
                          );
                        })}
                      </Flex>
                    </Flex>
                  )
                )}
            </>
          )}
        </Flex>
      </Flex>
      <Modal isOpen={isPublishWarningOpen} onClose={onPublishWarningClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Warning</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex direction={"column"}>
              <Text fontSize={"sm"}>
                Roster for one or more below weeks is not yet created, are you
                sure you want to publish this month roster?
              </Text>
              <Flex pt={"4"}>
                {notInitialisedWeeks.map((week) => {
                  return (
                    <Badge
                      key={week}
                      m={"2"}
                      colorScheme={"red"}
                      variant={"solid"}
                      px={"2"}
                      py={"1"}
                      rounded={"md"}
                    >{`Week ${week}`}</Badge>
                  );
                })}
              </Flex>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onPublishWarningClose}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                onPublishWarningClose();
                onPublishRoster({ notifyTo: globalNotifyTo });
              }}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <RosterPublishSuccess
        globalNotifyTo={globalNotifyTo}
        selectedMonth={selectedMonth}
        isPublishedRosterModalOpen={isPublishedRosterModalOpen}
        onPublishedRosterModalClose={onPublishedRosterModalClose}
      />
      <RosterPublishHoursWarning
        isEmpExceedingHoursListModalOpen={isEmpExceedingHoursListModalOpen}
        onEmpExceedingHoursListModalClose={onEmpExceedingHoursListModalClose}
        empDailyExceedingHoursList={empDailyExceedingHoursList}
        empWeeklyExceedingHoursList={empWeeklyExceedingHoursList}
        empExceedingHoursList={empExceedingHoursList}
        onChangeWeek={onChangeWeek}
        goToRosterEdit={goToRosterEdit}
      />
      <RosterPublishForceConfirmWarning
        isForceConfirmModalOpen={isForceConfirmModalOpen}
        onForceConfirmModalClose={onForceConfirmModalClose}
        messageObj={messageObj}
        globalNotifyTo={globalNotifyTo}
        onPublishRoster={onPublishRoster}
      />
      <RosterPublishCJPWarning
        isWeekUncoveredShiftsModalOpen={isWeekUncoveredShiftsModalOpen}
        onWeekUncoveredShiftsModalClose={onWeekUncoveredShiftsModalClose}
        weekUncoveredShifts={weekUncoveredShifts}
        goToRosterEdit={goToRosterEdit}
        onChangeWeek={onChangeWeek}
      />
    </Flex>
  );
}

export default MonthsSummary;
