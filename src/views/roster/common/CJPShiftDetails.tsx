import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  IconButton,
  MenuList,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import AppSelect from "../../../components/AppSelect";
import { generateTimeSlots, getDuration } from "../../../helper/Utils";
import {
  DEFAULT_CLOSE_TIME,
  DEFAULT_OPEN_TIME,
  MAX_SHIFT_WITH_LUNCH,
  TIME_GAP,
} from "../../../helper/Constant";
import { IClusterResponse } from "../../../helper/Interface";
import moment from "moment";
import { BsXCircle } from "react-icons/bs";
import { FiDelete } from "react-icons/fi";
import { AiFillDelete } from "react-icons/ai";

function CJPShiftDetails(props: {
  startTime: string;
  endTime?: string;
  id?: number;
  onSaveShift: (props: {
    startTime: string;
    endTime: string;
    clusterId: number;
    id?: number;
    deleted?: boolean;
  }) => void;

  clusters: IClusterResponse[];
  clusterId?: number;
  onClose: () => void;
  message: string;
}) {
  const {
    onSaveShift,
    startTime,
    id,
    clusters,
    clusterId: shiftClusterId,
    endTime,
    onClose,
    message,
  } = props;
  const [clusterId, setClusterId] = useState(
    shiftClusterId ? shiftClusterId.toString() : ""
  );
  const startTimeSlots = generateTimeSlots(
    DEFAULT_OPEN_TIME,
    DEFAULT_CLOSE_TIME
  );
  const [endTimeSlots, setEndTimeSlots] =
    useState<{ label: string; value: string }[]>();
  const [workStartTime, setWorkStartTime] = useState<string>(startTime);
  const [workEndTime, setWorkEndTime] = useState<string>(endTime || "");
  useEffect(() => {
    if (workStartTime) {
      if (workStartTime === DEFAULT_CLOSE_TIME) {
        setEndTimeSlots([]);
        return;
      }
      const newStartTime = moment(workStartTime, "HH:mm:ss")
        .add({ minutes: TIME_GAP })
        .format("HH:mm:ss");

      let newEndTime = moment(workStartTime, "HH:mm:ss")
        .add({
          hours: MAX_SHIFT_WITH_LUNCH,
        })
        .format("HH:mm:ss");

      if (newEndTime < DEFAULT_CLOSE_TIME && newEndTime < workStartTime) {
        let newHours = getDuration(
          moment(workStartTime, "HH:mm:ss"),
          moment(DEFAULT_CLOSE_TIME, "HH:mm:ss")
        ).durationHours;

        newEndTime = moment(workStartTime, "HH:mm:ss")
          .add({ hours: newHours })
          .format("HH:mm:ss");
      }
      setEndTimeSlots(
        generateTimeSlots(newStartTime, newEndTime, workStartTime)
      );
    }
  }, [workStartTime]);
  return (
    <MenuList
      zIndex={2}
      width={"320px"}
      cursor={"unset"}
      p={"0"}
      // transform={"scale(0.75) !important"}
    >
      <Flex direction={"column"} p={"4"}>
        <Flex alignItems={"center"} justifyContent={"space-between"} mb={"2"}>
          <Text fontSize={"md"} fontWeight={"medium"}>{`${
            id ? "Edit" : "Add"
          } Shift Details`}</Text>
          <Flex>
            <BsXCircle onClick={onClose} cursor={"pointer"} />
          </Flex>
        </Flex>

        <Flex direction={"column"}>
          <FormControl mb={"4"} isRequired>
            <FormLabel fontSize={"sm"}>Cluster</FormLabel>
            <AppSelect
              options={clusters
                .filter(({ editable }) => editable)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((cluster) => ({
                  label: cluster.name,
                  value: cluster.id.toString(),
                }))}
              onChange={setClusterId}
              value={clusterId}
              size="sm"
            />
          </FormControl>

          <FormControl mb={"4"} isRequired>
            <FormLabel fontSize={"sm"}>Timings</FormLabel>
            <Flex>
              <Flex pr={"2"} width={"50%"}>
                <AppSelect
                  options={startTimeSlots}
                  onChange={setWorkStartTime}
                  value={workStartTime}
                  size="sm"
                />
              </Flex>
              <Flex pl={"2"} width={"50%"}>
                <AppSelect
                  options={endTimeSlots}
                  onChange={setWorkEndTime}
                  value={workEndTime}
                  size="sm"
                />
              </Flex>
            </Flex>
          </FormControl>
        </Flex>
        {message ? (
          <Flex>
            <Text
              key={message}
              background={"#ffeaea"}
              color={"red"}
              fontSize={"xs"}
              p={"2"}
              rounded={"md"}
              textAlign={"center"}
              mb={"4"}
            >
              <span dangerouslySetInnerHTML={{ __html: message }}></span>
            </Text>
          </Flex>
        ) : null}
        <Flex width={"full"}>
          {id && onSaveShift ? (
            <Flex pr={"2"}>
              <IconButton
                aria-label=""
                colorScheme="red"
                variant={"solid"}
                fontSize={"sm"}
                width={"full"}
                onClick={() =>
                  onSaveShift({
                    clusterId: Number(clusterId),
                    startTime: workStartTime,
                    endTime: workEndTime,
                    id,
                    deleted: true,
                  })
                }
              >
                <AiFillDelete />
              </IconButton>
            </Flex>
          ) : null}
          <Flex width={"100%"} flex={1} pl={id ? "2" : "0"}>
            <Button
              width={"full"}
              onClick={() =>
                onSaveShift({
                  clusterId: Number(clusterId),
                  startTime: workStartTime,
                  endTime: workEndTime,
                  id,
                })
              }
              isDisabled={!workEndTime || !clusterId}
            >
              Save
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </MenuList>
  );
}

export default CJPShiftDetails;
