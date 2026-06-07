import { Flex, Grid, Text, Tooltip, useDisclosure } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import {
  CJP_DAY_CARD_HEIGHT,
  DAYS,
  CJP_CELL_HEIGHT,
  CJP_TIME_CELL_WIDTH,
  DEFAULT_START_TIME,
  DEFAULT_OPEN_TIME,
} from "../../../helper/Constant";
import { cloneDeep, uniq } from "lodash";
import moment from "moment";
import { ICJPRoster, IClusterResponse } from "../../../helper/Interface";
import CJPCellCard from "./CJPCellCard";
import CJPShiftCard from "./CJPShiftCard";
import { isShiftOverlap } from "../../../helper/Utils";

function CalenderTimeView(props: {
  days: ICJPRoster["days"];
  plannedJobTimes: { label: string; value: string }[];
  contentMaxHeight: string;
  clusters: IClusterResponse[];
  edit: boolean;
  onSaveShift?: (props: {
    startTime: string;
    endTime: string;
    clusterId: number;
    id?: number;
    deleted?: boolean;
    date: string;
  }) => void;
}) {
  const divRef = useRef<any>();
  const {
    days,
    plannedJobTimes,
    contentMaxHeight,
    clusters,
    edit,
    onSaveShift,
  } = props;
  const [leftPlacementObj, setLeftPlacementObj] = useState<
    Record<
      string,
      {
        min: string;
        max: string;
        values: string[];
      }[]
    >
  >({});
  const [shiftHoverId, setShiftHoverId] = useState("");
  const [cellHoverId, setCellHoverId] = useState("");
  const {
    isOpen: isCellOpen,
    onClose: onCellClose,
    onOpen: onCellOpen,
  } = useDisclosure();
  const {
    isOpen: isShiftOpen,
    onClose: onShiftClose,
    onOpen: onShiftOpen,
  } = useDisclosure();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (plannedJobTimes?.length && days?.length) {
      scrollTo(DEFAULT_START_TIME);
    }
  }, [plannedJobTimes]);
  useEffect(() => {
    if (plannedJobTimes?.length && days?.length) {
      generateLeftPlacementObj();
    }
  }, [plannedJobTimes, days]);

  const generateLeftPlacementObj = () => {
    let data: Record<string, { min: string; max: string; values: string[] }[]> =
      {};
    days.forEach(({ date, shifts }) => {
      data[date] = [];
      shifts.forEach(({ clusterId, startTime, endTime }) => {
        const key = `${startTime}_${endTime}_${clusterId}`;
        const remainingShift = shifts.filter(
          (obj) => `${obj.startTime}_${obj.endTime}_${obj.clusterId}` !== key
        );
        remainingShift.forEach((obj) => {
          if (
            (startTime < obj.endTime && endTime > obj.startTime) ||
            (startTime === obj.startTime && endTime === obj.endTime)
          ) {
            const array = [
              startTime,
              endTime,
              obj.startTime,
              obj.endTime,
            ].sort();
            const min = array[0];
            const max = array[array.length - 1];
            const index = data[date].findIndex((obj) => {
              if (
                (min < obj.max && max > obj.min) ||
                (min === obj.min && max === obj.max)
              ) {
                return true;
              }
              return false;
            });
            if (index === -1) {
              data[date].push({
                min,
                max,
                values: [key],
              });
            } else {
              let newMinArray = [min, data[date][index].min].sort();
              let newMaxArray = [max, data[date][index].max].sort();
              data[date][index] = {
                min: newMinArray[0],
                max: newMaxArray[newMaxArray.length - 1],
                values: uniq([...data[date][index].values, key]).sort(),
              };
            }
          }
        });
      });
    });

    setLeftPlacementObj(data);
  };
  const scrollTo = (time: string) => {
    const firstTime = moment(DEFAULT_OPEN_TIME, "HH:mm:ss");
    const secondTime = moment(time, "HH:mm:ss");
    const diff = secondTime.diff(firstTime, "hours");
    const scrollTop = CJP_CELL_HEIGHT * diff - 9;
    if (scrollTop) (divRef as any).current.scrollTop = scrollTop;
  };

  const onSaveTemp = (props: {
    startTime: string;
    endTime: string;
    clusterId: number;
    id?: number;
    deleted?: boolean;
    date: string;
  }) => {
    const { startTime, endTime, clusterId, id, date, deleted } = props;

    const { isConflicting, message } = isShiftOverlap({
      startTime,
      endTime,
      id,
      clusterId,
      deleted,
      shifts: days.filter((day) => day.date === date)[0].shifts,
    });

    if (!isConflicting && onSaveShift) {
      onSaveShift(props);
      setCellHoverId("");
      setShiftHoverId("");
      onCellClose();
      onShiftClose();
    }
    if (message) {
      setMessage(message);
    }
  };

  return (
    <Flex width={"100%"} background={"white"} pt={"2"} direction={"column"}>
      <Flex>
        <Flex
          height={`${CJP_DAY_CARD_HEIGHT}px`}
          width={`${CJP_TIME_CELL_WIDTH}px`}
          borderRight={"1px solid #f1f1f1"}
        ></Flex>
        <Flex flex={1}>
          <Grid
            width={`calc(100%)`}
            gridTemplateColumns={`repeat(${
              days && days.length ? days.length : 0
            }, 1fr)`}
          >
            {cloneDeep(days)
              .sort((a, b) => moment(a.date).unix() - moment(b.date).unix())
              .map(({ date, status, metadata }) => (
                <Flex
                  borderRight={"1px solid #f1f1f1"}
                  flexDirection={"column"}
                  key={date}
                  style={{
                    transition: "0.3s",
                    position: "relative",
                  }}
                  background={"transparent"}
                >
                  <Flex
                    borderBottom={"1px solid #f1f1f1"}
                    borderTop={"1px solid #f1f1f1"}
                    height={`${CJP_DAY_CARD_HEIGHT}px`}
                    alignItems={"center"}
                    justifyContent={"center"}
                    position={"relative"}
                  >
                    <Text
                      fontWeight={"bold"}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      color={
                        ["WORKING_HOLIDAY", "HOLIDAY"].includes(status)
                          ? "#F29727"
                          : "#027DBC"
                      }
                      background={
                        ["WORKING_HOLIDAY", "HOLIDAY"].includes(status)
                          ? "#F297270d"
                          : "#027DBC0d"
                      }
                      width={"24px"}
                      height={"24px"}
                      mr={"2"}
                      rounded={"sm"}
                    >
                      {moment(date).get("date")}
                    </Text>
                    <Text
                      display={"flex"}
                      alignItems={"center"}
                      color={"gray.600"}
                      fontWeight={"medium"}
                    >
                      {DAYS[moment(date).get("day")]}
                    </Text>
                    <Text
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      background={"white"}
                      position={"absolute"}
                      top={"-10px"}
                      left={"6px"}
                      color={"gray.400"}
                      fontSize={"xs"}
                      p={"0px 8px"}
                    >
                      {moment(date).format("MMM")}
                    </Text>
                    {metadata ? (
                      <Tooltip label={metadata}>
                        <Text
                          display={"block"}
                          background={"#F29727"}
                          position={"absolute"}
                          top={"-10px"}
                          right={"6px"}
                          color={"white"}
                          fontSize={"xs"}
                          p={"0px 4px"}
                          rounded={"sm"}
                          fontWeight={"medium"}
                          maxWidth={"calc(100% - 54px)"}
                          whiteSpace={"nowrap"}
                          overflow={"hidden"}
                          textOverflow={"ellipsis"}
                        >
                          {metadata}
                        </Text>
                      </Tooltip>
                    ) : null}
                  </Flex>
                </Flex>
              ))}
          </Grid>
        </Flex>
      </Flex>
      <Flex
        flexDirection={"column"}
        overflow={"auto"}
        maxHeight={contentMaxHeight}
        ref={divRef}
      >
        {cloneDeep(plannedJobTimes)
          .sort(
            (a, b) =>
              moment(a.value, "HH:mm:ss").unix() -
              moment(b.value, "HH:mm:ss").unix()
          )
          .map((time, i) => {
            return (
              <Flex key={time.value}>
                <Flex
                  height={`${CJP_CELL_HEIGHT}px`}
                  width={`${CJP_TIME_CELL_WIDTH}px`}
                  justifyContent={"end"}
                  pr={"2"}
                  borderRight={"1px solid #f1f1f1"}
                >
                  <Text
                    fontSize={"xs"}
                    color={"gray.500"}
                    mt={i === 0 ? "-4px" : "-9px"}
                  >
                    {`${time.label}`}
                  </Text>
                </Flex>
                <Flex flex={1}>
                  <Grid
                    width={`calc(100%)`}
                    gridTemplateColumns={`repeat(${
                      days && days.length ? days.length : 0
                    }, 1fr)`}
                  >
                    {cloneDeep(days)
                      .sort(
                        (a, b) => moment(a.date).unix() - moment(b.date).unix()
                      )
                      .map(({ date, shifts, edit: dayEdit, status }) => (
                        <Flex
                          borderRight={"1px solid #f1f1f1"}
                          flexDirection={"column"}
                          key={date}
                          style={{
                            transition: "0.3s",
                            position: "relative",
                          }}
                          background={"transparent"}
                        >
                          <Flex
                            borderBottom={
                              i === cloneDeep(plannedJobTimes).length - 1
                                ? "unset"
                                : "1px solid #f1f1f1"
                            }
                            height={`${CJP_CELL_HEIGHT}px`}
                            alignItems={"center"}
                            justifyContent={"center"}
                            position={"relative"}
                          >
                            <Flex
                              flex={1}
                              height={"100%"}
                              cursor={
                                edit && dayEdit ? "pointer" : "not-allowed"
                              }
                              background={
                                status === "NA"
                                  ? "repeating-linear-gradient(-45deg, rgb(175 175 175 / 50%), #ffffff 2px, #ffffff 2px, #e0e0e000 4px)"
                                  : "unset"
                              }
                              id="123"
                              onClick={(e: any) => {
                                console.log(e.target.tagName);

                                if (edit && dayEdit) {
                                  if (
                                    e.target.tagName !== "svg" &&
                                    e.target.tagName !== "path"
                                  ) {
                                    setCellHoverId(`${date}_${time.value}`);
                                  }
                                }
                              }}
                            >
                              {/* {cellHoverId} */}
                              {`${date}_${time.value}` === cellHoverId &&
                              onSaveShift ? (
                                <CJPCellCard
                                  clusters={clusters}
                                  time={time.value}
                                  edit={edit && dayEdit}
                                  message={message}
                                  setMessage={setMessage}
                                  onSaveShift={({
                                    clusterId,
                                    endTime,
                                    startTime,
                                    deleted,
                                    id,
                                  }) => {
                                    onSaveTemp({
                                      clusterId,
                                      endTime,
                                      startTime,
                                      deleted,
                                      id,
                                      date,
                                    });
                                  }}
                                  isOpen={isCellOpen}
                                  onClose={() => {
                                    console.log(1);
                                    onCellClose();
                                    setCellHoverId("");
                                  }}
                                  onOpen={onCellOpen}
                                />
                              ) : null}
                            </Flex>

                            {shifts?.length ? (
                              <>
                                {shifts
                                  .filter(({ startTime }) => {
                                    const midTime = moment(
                                      time.value,
                                      "HH:mm:ss"
                                    )
                                      .add({ minute: 30 })
                                      .format("HH:mm:ss");
                                    if (
                                      startTime === time.value ||
                                      startTime === midTime
                                    ) {
                                      return true;
                                    }
                                    return false;
                                  })
                                  .filter(
                                    (value, index, self) =>
                                      self.findIndex(
                                        ({
                                          clusterId,
                                          startTime,
                                          endTime,
                                          deleted,
                                        }) =>
                                          value.clusterId === clusterId &&
                                          value.startTime === startTime &&
                                          value.endTime === endTime &&
                                          !deleted
                                      ) === index
                                  )
                                  .map((shift, j) => (
                                    <CJPShiftCard
                                      key={j}
                                      shift={shift}
                                      time={time.value}
                                      date={date}
                                      leftPlacementObj={leftPlacementObj}
                                      clusters={clusters}
                                      setShiftHoverId={(value) => {
                                        setCellHoverId("");
                                        setShiftHoverId(value);
                                      }}
                                      shiftHoverId={shiftHoverId}
                                      edit={edit && dayEdit}
                                      message={message}
                                      setMessage={setMessage}
                                      onSaveShift={({
                                        clusterId,
                                        endTime,
                                        startTime,
                                        deleted,
                                        id,
                                      }) => {
                                        onSaveTemp({
                                          clusterId,
                                          endTime,
                                          startTime,
                                          deleted,
                                          id,
                                          date,
                                        });
                                      }}
                                      id={shift.id ?? 0}
                                      isOpen={
                                        `${date}_${shift.startTime}_${shift.endTime}_${shift.clusterId}` ===
                                          shiftHoverId && isShiftOpen
                                      }
                                      onClose={onShiftClose}
                                      onOpen={onShiftOpen}
                                      status={status}
                                    />
                                  ))}
                              </>
                            ) : null}
                          </Flex>
                        </Flex>
                      ))}
                  </Grid>
                </Flex>
              </Flex>
            );
          })}
      </Flex>
      <Flex
        borderBottom={"1px solid #f1f1f1"}
        ml={`${CJP_TIME_CELL_WIDTH}px`}
      ></Flex>
    </Flex>
  );
}

export default CalenderTimeView;
