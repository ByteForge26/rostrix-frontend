import { Flex, Icon, Text } from "@chakra-ui/react";
import moment from "moment";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import {
  DAYS,
  INSIGHTS_WIDTH,
  MONTHS_SHORT,
  ROSTER_DAY_CARD_MIN_HEIGHT,
} from "../../../helper/Constant";
import InsightsView from "./InsightsView";

function InsightsWrapper(props: {
  readonly isInsightsShow: boolean;
  readonly selectedDate?: string;
  readonly toggle: () => void;
}) {
  const { isInsightsShow, selectedDate, toggle } = props;
  return (
    <Flex
      borderLeft={"1px solid #F2F2F2"}
      width={`${isInsightsShow ? INSIGHTS_WIDTH : 44}px`}
      overflow={"hidden"}
      direction={"column"}
      transition={"0.3s"}
    >
      <Flex
        direction={"column"}
        height={`${ROSTER_DAY_CARD_MIN_HEIGHT}px`}
        borderBottom={"1px solid #f1f1f1"}
        width={"full"}
        justifyContent={"center"}
        pl={"3"}
      >
        <Flex alignItems={"center"}>
          <Text fontSize={"xl"}>
            <Icon cursor={"pointer"} onClick={toggle}>
              {isInsightsShow ? <AiOutlineClose /> : <AiOutlineMenu />}
            </Icon>
          </Text>
          {isInsightsShow ? (
            <Text fontSize={"xl"} fontWeight={"medium"} ml={"2"}>
              Insights
            </Text>
          ) : null}
        </Flex>

        {selectedDate && isInsightsShow ? (
          <Text fontSize={"xs"} color={"gray.600"} ml={"7"}>
            {`${DAYS[moment(selectedDate).get("day")]}, ${moment(
              selectedDate
            ).get("D")} ${MONTHS_SHORT[moment(selectedDate).get("M")]}`}
          </Text>
        ) : null}
      </Flex>
      {isInsightsShow ? (
        <>
          {selectedDate ? (
            <InsightsView />
          ) : (
            <Text
              fontSize={"sm"}
              textAlign={"center"}
              color={"gray.600"}
              mt={"4"}
            >
              Please Select any day to view Insights.
            </Text>
          )}
        </>
      ) : (
        <Text
          width={"14px"}
          fontSize={"xl"}
          fontWeight={"medium"}
          margin={"16px auto"}
          textAlign={"center"}
          lineHeight={"38px"}
        >
          INSIGHTS
        </Text>
      )}
    </Flex>
  );
}

export default InsightsWrapper;
