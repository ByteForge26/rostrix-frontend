import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import CustomBox from "../roster/common/CustomBox";
import {
  HOLIDAY_COLOR,
  LEAVE_COLOR,
  WEEK_OFF_COLOR,
} from "../../hooks/useCalender";

function Badges() {
  return (
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
          Leave
        </Text>
      </Flex>
      <Flex my={"2"} mx={"4"} alignItems={"center"}>
        <CustomBox color={WEEK_OFF_COLOR} background={WEEK_OFF_COLOR} />
        <Text ml={"2"} fontWeight={"medium"} fontSize={"sm"}>
          Week Off
        </Text>
      </Flex>
    </Flex>
  );
}

export default Badges;
