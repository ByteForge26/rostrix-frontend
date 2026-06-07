import React, { useEffect } from "react";
import { ICJPRoster, IClusterResponse } from "../../../helper/Interface";
import moment from "moment";
import {
  Flex,
  Menu,
  MenuButton,
  MenuList,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { CJP_CELL_HEIGHT, COLORS } from "../../../helper/Constant";
import { convertTime } from "../../../helper/Utils";
import CJPShiftDetails from "./CJPShiftDetails";

function CJPShiftCard(props: {
  shift: ICJPRoster["days"][0]["shifts"][0];
  time: string;
  date: string;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  leftPlacementObj: Record<
    string,
    {
      min: string;
      max: string;
      values: string[];
    }[]
  >;
  clusters: IClusterResponse[];
  setShiftHoverId: React.Dispatch<React.SetStateAction<string>>;
  shiftHoverId: string;
  edit: boolean;
  onSaveShift: (props: {
    startTime: string;
    endTime: string;
    clusterId: number;
    id?: number;
    deleted?: boolean;
  }) => void;

  id: number;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  status: string;
}) {
  const {
    shift,
    time,
    date,
    leftPlacementObj,
    clusters,
    shiftHoverId,
    setShiftHoverId,
    edit,
    onSaveShift,
    id,
    message,
    setMessage,
    isOpen,
    onClose,
    onOpen,
    status,
  } = props;

  useEffect(() => {
    if (!isOpen) {
      setShiftHoverId(``);
    }
  }, [isOpen]);
  const cluster = shift.clusterId
    ? clusters.find(({ id }) => id === shift.clusterId)
    : undefined;
  if (shift && cluster) {
    const diff = moment(shift.endTime, "HH:mm:ss").diff(
      moment(shift.startTime, "HH:mm:ss"),
      "minutes"
    );
    let left = 0;
    if (leftPlacementObj[date] && Object.keys(leftPlacementObj[date])) {
      Object.keys(leftPlacementObj[date]).forEach((key) => {
        const obj = leftPlacementObj[date].find(
          ({ min, max }) => shift.startTime >= min && shift.endTime <= max
        );
        if (obj) {
          const index = obj.values.findIndex((value) => {
            const array = value.split("_");
            if (
              shift.startTime === array[0] &&
              shift.endTime === array[1] &&
              shift.clusterId.toString() === array[2]
            ) {
              return true;
            }
            return false;
          });
          left = index * 4;
        }
      });
    }

    return (
      <Flex
        height={`${(diff / 60) * CJP_CELL_HEIGHT}px`}
        background={"white"}
        position={"absolute"}
        top={`${shift.startTime === time ? 0 : CJP_CELL_HEIGHT / 2}px`}
        zIndex={
          `${date}_${shift.startTime}_${shift.endTime}_${shift.clusterId}` ===
          shiftHoverId
            ? 200
            : 2 + left
        }
        right={0}
        left={left}
        onMouseLeave={() => {
          if (!edit) setShiftHoverId(``);
        }}
      >
        <Menu
          isOpen={isOpen}
          onClose={() => {
            onClose();
          }}
          placement="auto"
        >
          <MenuButton
            as={Flex}
            data-testid="menu-button"
            onClick={() => {
              setShiftHoverId(
                `${date}_${shift.startTime}_${shift.endTime}_${shift.clusterId}`
              );
              if (edit) {
                onOpen();
                setMessage("");
              }
            }}
            width={"full"}
            background={COLORS[shift.clusterId % COLORS.length]}
            direction={"column"}
            pb={"2px"}
            pl={"6px"}
            borderLeftWidth={
              `${date}_${shift.startTime}_${shift.endTime}_${shift.clusterId}` ===
              shiftHoverId
                ? 4
                : 2
            }
            borderLeftStyle={"solid"}
            transition={"0.3s"}
            borderTopRightRadius={3}
            borderBottomRightRadius={3}
            borderColor={`${COLORS[shift.clusterId % COLORS.length].slice(
              0,
              -2
            )}`}
            boxShadow={
              `${date}_${shift.startTime}_${shift.endTime}_${shift.clusterId}` ===
              shiftHoverId
                ? "0 0 8px 0 lightgray"
                : "none"
            }
            _hover={{
              borderLeftWidth: 4,
              boxShadow: "0 0 8px 0 lightgray",
            }}
            cursor={"pointer"}
          >
            <Text fontSize={"xs"}>{cluster.name}</Text>
            <Text
              fontWeight={"medium"}
              color={"gray.600"}
              style={{
                fontSize: 11,
              }}
            >{`${convertTime(shift.startTime)} - ${convertTime(
              shift.endTime
            )}`}</Text>
          </MenuButton>
          {isOpen && edit ? (
            <CJPShiftDetails
              clusters={clusters}
              clusterId={shift.clusterId}
              onSaveShift={({ clusterId, endTime, startTime, deleted, id }) => {
                onSaveShift({ clusterId, endTime, startTime, deleted, id });
              }}
              startTime={time}
              endTime={shift.endTime}
              id={id}
              onClose={onClose}
              message={message}
            />
          ) : null}
        </Menu>
      </Flex>
    );
  }
  return <></>;
}

export default CJPShiftCard;
