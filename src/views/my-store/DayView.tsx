import React, { useEffect, useRef, useState } from "react";
import AppContainer from "../../components/AppContainer";
import AppHeader from "../../components/AppHeader";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Flex,
  Text,
  Tooltip,
  useBoolean,
} from "@chakra-ui/react";
import { convertTime, generateTimeSlots } from "../../helper/Utils";
import {
  COLORS,
  DEFAULT_CLOSE_TIME,
  DEFAULT_START_TIME,
  NAV_HEIGHT,
  SECONDARY_JOBS_CONFIG,
} from "../../helper/Constant";
import moment from "moment";
import { IDayView } from "../../helper/Interface";
import { useApi } from "../../hooks/useApi";
import { ENDPOINT } from "../../config/endpoint.config";
import { useAppSelector } from "../../app/store/store";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import AppQuickFilterChips from "../../components/AppQuickFilterChips";
import AppNoData from "../../components/AppNoData";
import AppLoader from "../../components/AppLoader";
const filters = [
  {
    label: "Layout",
    value: "Layout",
    color: "#027DBC",
    byDefaultVisible: true,
  },
  {
    label: "Secondary",
    value: "Secondary",
    byDefaultVisible: true,
  },
  {
    label: "Miscellaneous",
    value: "Miscellaneous",
    byDefaultVisible: true,
  },
  {
    label: "Leave",
    value: "LEAVE",
    color: "#c1e1c1",
    byDefaultVisible: false,
    text: "black",
    divider: true,
  },
  {
    label: "Week Off",
    value: "WEEK_OFF",
    color: "#82abd4",
    byDefaultVisible: false,
    text: "black",
  },
];
function DayView() {
  const { get } = useApi();
  const { selectedCostCenterName, contractTypes } = useAppSelector(
    (state) => state.auth
  );
  const [selectedFilters, setSelectedFilters] = useState(
    filters
      .filter(({ byDefaultVisible }) => byDefaultVisible)
      .map(({ value }) => value)
  );
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [dayView, setDayView] = useState<IDayView>();
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const [currentTime, setCurrentTime] = useState(moment().format("hh:mm"));
  const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
  const [timeSlots, setTimeSlots] = useState<
    { label: string; value: string }[]
  >([]);
  const [openTime, setOpenTime] = useState("");
  useEffect(() => {
    if (date) getDayView();
  }, [date]);
  const getDayView = async () => {
    onLoading();
    const res = await get<IDayView>(
      `${ENDPOINT["/roster"]["/day-work"]}/${selectedCostCenterName}/${date}`
    );
    offLoading();
    if (res?.clusters?.length || res?.secondaryJobs?.length) {
      setDayView(res);
    } else {
      setDayView(undefined);
    }
  };
  useEffect(() => {
    if (dayView) {
      getTimeSlots();
    }
  }, [dayView]);

  const getTimeSlots = () => {
    let openTime = DEFAULT_START_TIME;
    if (dayView) {
      [...dayView.clusters, ...dayView.secondaryJobs].map(
        ({ empDayShifts }) => {
          if (empDayShifts && empDayShifts.length) {
            empDayShifts.forEach(({ shifts }) => {
              if (shifts && shifts.length) {
                shifts.forEach(({ s }) => {
                  if (s < openTime) {
                    openTime = s;
                  }
                });
              }
            });
          }
        }
      );
    }
    if (openTime.includes("30:00")) {
      openTime = moment(openTime, "HH:mm:ss")
        .subtract({
          minute: 30,
        })
        .format("HH:mm:ss");
    }
    setOpenTime(openTime);
    setTimeSlots(generateTimeSlots(openTime, DEFAULT_CLOSE_TIME, "", 60));
  };

  const CARD_WIDTH = 56;
  const CELL_H = 54;

  const getPosition = (s: string, e: string) => {
    const left =
      CARD_WIDTH / 2 +
      (moment(s, "hh:mm:ss").diff(
        moment(openTime || DEFAULT_START_TIME, "hh:mm:ss"),
        "minute"
      ) /
        30) *
        (CARD_WIDTH / 2);
    const width =
      (moment(e, "hh:mm:ss").diff(moment(s, "hh:mm:ss"), "minute") / 30) *
      (CARD_WIDTH / 2);
    return { left, width };
  };
  useEffect(() => {
    getCurrentTimePosition();
    const interval = setInterval(() => {
      getCurrentTimePosition();
    }, 1 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
  const getCurrentTimePosition = (scrollLeft?: number) => {
    const left =
      190 +
      CARD_WIDTH / 2 +
      (moment().diff(
        moment(openTime || DEFAULT_START_TIME, "hh:mm:ss"),
        "minute"
      ) /
        30) *
        (CARD_WIDTH / 2);
    setCurrentTimePosition(left - (scrollLeft || 0));
    setCurrentTime(moment().format("hh:mm"));
  };
  const firstDivRef = useRef<any>();
  const secondDivRef = useRef<any>();
  const handleScrollFirst = (scroll: any) => {
    getCurrentTimePosition(scroll.target.scrollLeft);
    (secondDivRef as any).current.scrollLeft = scroll.target.scrollLeft;
  };

  const handleScrollSecond = (scroll: any) => {
    (firstDivRef as any).current.scrollLeft = scroll.target.scrollLeft;
  };
  const filterFn = (type?: string, workId?: number) => {
    // return true;
    let valid = false;
    if (selectedFilters.includes("Layout")) {
      if (!type && !workId) {
        valid = true;
      }
    }
    if (selectedFilters.includes("Secondary")) {
      if (type && !workId) {
        valid = true;
      }
    }
    if (selectedFilters.includes("Miscellaneous")) {
      if (workId) {
        valid = true;
      }
    }
    return valid;
  };

  return (
    <AppContainer heading="Day View" info="">
      <AppHeader justifyContentLeft>
        <AppQuickFilterChips
          filters={filters}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
        />
        <Flex data-testid="datepicker">
          <SingleDatepicker
            date={date ? new Date(date) : undefined}
            onDateChange={(date) => setDate(moment(date).format("YYYY-MM-DD"))}
            configs={{
              dateFormat: "dd-MM-yyyy",
            }}
          />
        </Flex>
      </AppHeader>
      <Flex overflow={"auto"} p={"2"}>
        {dayView ? (
          <Flex
            border={"1px solid #f5f5f5"}
            direction={"column"}
            overflow={"hidden"}
            rounded={"md"}
            position={"relative"}
            data-testid="dayView-list"
          >
            {currentTimePosition && date === moment().format("YYYY-MM-DD") ? (
              <>
                <Flex
                  position={"absolute"}
                  left={currentTimePosition}
                  background={"#EEACAC"}
                  width={"1px"}
                  height={"100%"}
                ></Flex>
                <Flex
                  position={"absolute"}
                  left={currentTimePosition - 32}
                  top={"56px"}
                  background={"#FF0000"}
                  rounded={"lg"}
                  width={"64px"}
                  justifyContent={"center"}
                  zIndex={2}
                >
                  <Text fontSize={"xs"} fontWeight={"medium"} color={"white"}>
                    {currentTime}
                  </Text>
                </Flex>
              </>
            ) : null}
            <Flex
              overflow={"auto"}
              width={"full"}
              boxShadow={"0px 0px 4px 0 lightgray"}
              onScroll={handleScrollFirst}
              ref={firstDivRef}
              data-testid="time-slots"
            >
              <Flex minWidth={"190px"}></Flex>
              <Flex>
                {timeSlots.map(({ label, value }, i) => (
                  <Flex
                    key={i}
                    width={`${CARD_WIDTH}px`}
                    height={"56px"}
                    justifyContent={"center"}
                    alignItems={"center"}
                  >
                    <Flex
                      direction={"column"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      width={"100%"}
                    >
                      <Text fontSize={"lg"} fontWeight={"medium"}>
                        {moment(label, "hh:mm:ss A").format("h")}
                      </Text>
                      <Text fontSize={"xs"}>
                        {moment(label, "hh:mm:ss A").format("A")}
                      </Text>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            </Flex>

            <Flex
              direction={"column"}
              maxHeight={`calc(100vh - ${NAV_HEIGHT}px - 56px - 48px - 48px - 16px - ${
                dayView.unRosteredClusters?.length ? "48px" : "0px"
              } )`}
              overflow={"auto"}
              onScroll={handleScrollSecond}
              ref={secondDivRef}
              data-testid="emp-time-slots"
            >
              {[
                ...dayView.secondaryJobs.filter(({ name }) => name === "DM"),
                ...dayView.clusters,
                ...dayView.secondaryJobs.filter(({ name }) => name !== "DM"),
              ].map(({ empDayShifts, name, totalHours }, i) => (
                <Flex key={i} width={"full"} direction={"column"} pb={"4"}>
                  <Flex width={"full"} background={"#f5f5f5"}>
                    <Flex
                      minWidth={"190px"}
                      p={"2"}
                      pl={"4"}
                      borderTop={"1px solid lightgray"}
                      borderBottom={"1px solid lightgray"}
                      direction={"column"}
                    >
                      <Text fontSize={"md"} fontWeight={"medium"}>
                        {name}
                      </Text>
                      <Text fontSize={"xs"} color={"gray.600"}>
                        {`Total Hours: ${totalHours}`}
                      </Text>
                    </Flex>

                    <Flex
                      borderTop={"1px solid lightgray"}
                      borderBottom={"1px solid lightgray"}
                      background={"#f5f5f5"}
                    >
                      {timeSlots.map((_, i) => (
                        <Flex
                          key={i}
                          width={`${CARD_WIDTH}px`}
                          justifyContent={"center"}
                          alignItems={"center"}
                        >
                          <Flex
                            direction={"column"}
                            justifyContent={"center"}
                            alignItems={"center"}
                            width={"1px"}
                            height={"100%"}
                            background={"white"}
                          ></Flex>
                        </Flex>
                      ))}
                    </Flex>
                  </Flex>
                  <Flex direction={"column"}>
                    {empDayShifts
                      // .filter(({ status }) => {
                      //   let valid = true;
                      //   if (status) {
                      //     if (
                      //       status === "LEAVE" &&
                      //       !selectedFilters.includes("LEAVE")
                      //     ) {
                      //       valid = false;
                      //     }
                      //     if (
                      //       status === "WEEK_OFF" &&
                      //       !selectedFilters.includes("WEEK_OFF")
                      //     ) {
                      //       valid = false;
                      //     }
                      //   }
                      //   return valid;
                      // })
                      .map(({ empId, name, shifts, status, contractId }, k) => (
                        <Flex width={"full"} key={k}>
                          <Flex
                            p={"2"}
                            pl={"4"}
                            minWidth={"190px"}
                            borderTop={k === 0 ? "1px solid" : "none"}
                            borderBottom={"1px solid"}
                            // borderRight={"1px solid"}
                            borderColor={"#f5f5f5"}
                            direction={"column"}
                            justifyContent={"center"}
                            height={`${CELL_H}px`}
                          >
                            <Text
                              overflow={"hidden"}
                              textOverflow={"ellipsis"}
                              whiteSpace={"nowrap"}
                            >
                              {name}
                            </Text>
                            <Flex alignItems={"center"} wrap={"wrap"}>
                              <Text fontSize={"xs"} color={"gray.500"}>
                                {empId}
                              </Text>
                              <Flex
                                width={"1"}
                                height={"1"}
                                background={"gray.500"}
                                rounded={"full"}
                                mx={"1"}
                              ></Flex>
                              <Text fontSize={"xs"} color={"gray.500"}>{`${
                                contractTypes?.length
                                  ? contractTypes.find(
                                      ({ id }) => id === contractId
                                    )?.name
                                  : ""
                              }`}</Text>
                            </Flex>
                          </Flex>

                          <Flex position={"relative"}>
                            {status ? (
                              <>
                                {["WEEK_OFF", "LEAVE"].includes(status) ? (
                                  <>
                                    {(selectedFilters.includes("WEEK_OFF") &&
                                      status === "WEEK_OFF") ||
                                    (selectedFilters.includes("LEAVE") &&
                                      status === "LEAVE") ? (
                                      <Flex
                                        position={"absolute"}
                                        style={{
                                          inset: 0,
                                          left: CARD_WIDTH / 2,
                                          background:
                                            status === "WEEK_OFF"
                                              ? "#82abd433"
                                              : "#c1e1c133",
                                          color: "#fffff",
                                          justifyContent: "center",
                                          alignItems: "center",
                                        }}
                                      >
                                        <Text fontWeight={"medium"}>
                                          {status.replaceAll("_", " ")}
                                        </Text>
                                      </Flex>
                                    ) : null}
                                  </>
                                ) : null}
                              </>
                            ) : null}
                            {shifts && shifts.length ? (
                              <>
                                {shifts
                                  .filter(({ type, workId }) =>
                                    filterFn(type, workId)
                                  )
                                  .map(
                                    ({ s, e, type, workName, workId }, j) => {
                                      const { left, width } = getPosition(s, e);
                                      const text = workName
                                        ? workName
                                        : type
                                        ? SECONDARY_JOBS_CONFIG.find(
                                            ({ jobType }) => jobType === type
                                          )?.label
                                        : "Layout";
                                      const background = workId
                                        ? COLORS[workId % COLORS.length]
                                        : type
                                        ? COLORS[
                                            SECONDARY_JOBS_CONFIG.findIndex(
                                              ({ jobType }) => jobType === type
                                            ) % COLORS.length
                                          ]
                                        : "#027DBC29";
                                      const color = workId
                                        ? COLORS[workId % COLORS.length].slice(
                                            0,
                                            -2
                                          )
                                        : type
                                        ? COLORS[
                                            SECONDARY_JOBS_CONFIG.findIndex(
                                              ({ jobType }) => jobType === type
                                            ) % COLORS.length
                                          ].slice(0, -2)
                                        : "#027DBC";
                                      return (
                                        <Flex
                                          key={j}
                                          position={"absolute"}
                                          style={{
                                            width: width || 0,
                                            left: left || 0,
                                            padding: "2px",
                                            top: 0,
                                            bottom: 0,
                                            alignItems: "center",
                                          }}
                                          data-testid={`${s} - ${e}`}
                                        >
                                          <Tooltip
                                            label={`${text}: ${convertTime(
                                              s
                                            )} - ${convertTime(e)}`}
                                            hasArrow
                                          >
                                            <Flex
                                              width={"full"}
                                              background={background}
                                              border={"1px solid"}
                                              color={color}
                                              //   color={"black"}
                                              rounded={"sm"}
                                              p={"1"}
                                              pl={"2"}
                                              alignItems={"center"}
                                              //   justifyContent={"center"}
                                            >
                                              <Text
                                                fontSize={"xs"}
                                                overflow={"hidden"}
                                                textOverflow={"ellipsis"}
                                                whiteSpace={"nowrap"}
                                              >
                                                {`${text}: ${convertTime(
                                                  s
                                                )} - ${convertTime(e)}`}
                                              </Text>
                                            </Flex>
                                          </Tooltip>
                                        </Flex>
                                      );
                                    }
                                  )}
                              </>
                            ) : null}
                            {timeSlots.map((_, j) => (
                              <Flex
                                key={j}
                                width={`${CARD_WIDTH}px`}
                                height={`${CELL_H}px`}
                                justifyContent={"center"}
                                alignItems={"center"}
                                borderTop={k === 0 ? "1px solid" : "none"}
                                borderBottom={"1px solid"}
                                borderColor={"#f5f5f5"}
                              >
                                <Flex
                                  direction={"column"}
                                  justifyContent={"center"}
                                  alignItems={"center"}
                                  width={"1px"}
                                  height={"100%"}
                                  background={"#f5f5f5"}
                                ></Flex>
                              </Flex>
                            ))}
                          </Flex>
                        </Flex>
                      ))}
                  </Flex>
                </Flex>
              ))}
            </Flex>
            {dayView?.unRosteredClusters?.length ? (
              <Flex width={"full"} direction={"column"}>
                <Accordion allowToggle>
                  <AccordionItem border={"none"} width={"full"}>
                    <AccordionButton
                      background={"#FF00001a"}
                      _hover={{
                        background: "#FF00001a",
                      }}
                      px={"4"}
                      py={"2"}
                      justifyContent={"space-between"}
                      width={"full"}
                    >
                      <Text fontSize={"md"} fontWeight={"medium"}>
                        {`Non Rostered Clusters (${dayView.unRosteredClusters.length})`}
                      </Text>

                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel p={"2"} pr={"2"}>
                      {dayView.unRosteredClusters.map(({ name }, k) => {
                        return (
                          <Flex
                            key={name + k}
                            p={"2"}
                            pl={"4"}
                            minWidth={"190px"}
                            borderTop={k === 0 ? "1px solid" : "none"}
                            borderBottom={"1px solid"}
                            // borderRight={"1px solid"}
                            borderColor={"#f5f5f5"}
                            direction={"column"}
                            justifyContent={"center"}
                          >
                            <Text
                              overflow={"hidden"}
                              textOverflow={"ellipsis"}
                              whiteSpace={"nowrap"}
                            >
                              {name}
                            </Text>
                          </Flex>
                        );
                      })}
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </Flex>
            ) : null}
          </Flex>
        ) : isLoading ? (
          <AppLoader />
        ) : (
          <AppNoData />
        )}
      </Flex>
    </AppContainer>
  );
}

export default DayView;
