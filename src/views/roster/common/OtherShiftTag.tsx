import { Flex, Text, Tooltip } from "@chakra-ui/react";
import { BsInfoCircle } from "react-icons/bs";
import { convertTime, getDuration } from "../../../helper/Utils";
import { FiMinusCircle } from "react-icons/fi";
import moment from "moment";

interface IProps {
  readonly name: string;
  readonly comment: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly workId?: number;
  readonly secondaryJobType?: string;
  readonly empId: string;
  readonly id: number;
  readonly onRemoveShift?: (props: {
    empId: string;
    id: number;
    shift: {
      startTime: string;
      endTime: string;
      workId?: number;
      plannedJob?: boolean;
      secondaryJobType?: string;
      comment?: string;
    };
  }) => void;
  readonly color: string;
  readonly background: string;
  readonly viewOnly?: boolean;
  readonly type?: string;
}
function OtherShiftTag(props: IProps) {
  const {
    name,
    comment,
    endTime,
    onRemoveShift,
    startTime,
    workId,
    secondaryJobType,
    empId,
    id,
    background,
    color,
    viewOnly,
    type,
  } = props;
  return (
    <Flex pl={"1"} pr={"2"} mt={"2px"} mb={"2px"}>
      <Flex
        pt={"2px"}
        pb={"2px"}
        pl={"6px"}
        pr={onRemoveShift ? "2" : "0"}
        alignItems={"center"}
        background={
          type
            ? `repeating-linear-gradient(-45deg, ${background}, #ffffff 2px, #ffffff 2px, #e0e0e000 4px)`
            : background
        }
        borderTopRightRadius={3}
        borderBottomRightRadius={3}
        position={"relative"}
        //   color={color}
        color={"#fffff"}
        wrap={"wrap"}
        width={"full"}
      >
        <Flex
          position={"absolute"}
          background={color}
          top={0}
          left={0}
          bottom={0}
          width={"2px"}
        ></Flex>

        <Text
          fontWeight={"medium"}
          style={{
            fontSize: 11,
          }}
        >
          <span
            dangerouslySetInnerHTML={{
              __html: `${convertTime(startTime)} - ${convertTime(endTime)}${
                !viewOnly
                  ? ` <i>(${
                      getDuration(
                        moment(startTime, "HH:mm:ss"),
                        moment(endTime, "HH:mm:ss")
                      ).text
                    })<i>`
                  : ""
              } `,
            }}
          ></span>
        </Text>

        <Tooltip label={name} hasArrow>
          <Text
            fontSize={"11px"}
            fontWeight={"normal"}
            ml={"2"}
            pr={"2"}
            flex={1}
            textOverflow={"ellipsis"}
            overflow={"hidden"}
            whiteSpace={"nowrap"}
            textAlign={"left"}
            maxWidth={"fit-content"}
          >
            {`${name}`}
          </Text>
        </Tooltip>
        {comment && !viewOnly ? (
          <Tooltip label={comment} hasArrow>
            <Text color={"black"} mr={"2"} cursor={"pointer"}>
              <BsInfoCircle size={"12px"} />
            </Text>
          </Tooltip>
        ) : null}
        {/* <Text
        fontSize={"xs"}
        fontWeight={"bold"}
        ml={"2"}
        // pr={"2"}
        minWidth={"100px"}
      >
        {name}
      </Text> */}

        {onRemoveShift ? (
          <Flex ml={"auto"} cursor={"pointer"} data-testid="menu-button">
            {/* <FiMinusCircle /> */}
            <FiMinusCircle
              onClick={() =>
                onRemoveShift({
                  empId,
                  id,
                  shift: {
                    endTime,
                    startTime,
                    comment,
                    workId: workId ?? 0,
                    secondaryJobType: secondaryJobType ?? "",
                  },
                })
              }
              color="#e85f5f"
              fontSize={"12px"}
            />
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  );
}

export default OtherShiftTag;
