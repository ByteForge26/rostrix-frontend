import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { DAYS } from "../../../helper/Constant";

function CalenderRow() {
  return (
    <Flex>
      <Flex
        width={"70px"}
        height={"90px"}
        background={"white"}
        boxShadow={"sm"}
        m={"0.5px"}
        mr={"2"}
        p={"0.5"}
      >
        <Text
          fontSize={"xs"}
          display={"flex"}
          width={"80px"}
          height={"60px"}
          rounded={"md"}
          fontWeight={"medium"}
        >
          Week
        </Text>
      </Flex>

      {DAYS.map((day) => (
        <Flex
          key={day}
          m={"0.5px"}
          width={"114px"}
          height={"90px"}
          background={"white"}
          boxShadow={"sm"}
          p={"0.5"}
        >
          <Text fontSize={"sm"}>{day}</Text>
        </Flex>
      ))}
    </Flex>
  );
}

export default CalenderRow;
