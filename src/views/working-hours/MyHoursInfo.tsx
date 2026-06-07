import { Flex, Text } from "@chakra-ui/react";
import React from "react";

function MyHoursInfo(props: {
  workSummary: {
    totalHours: number;
    relHours: number;
    planHours: number;
    wHolidays: number;
    weekOffs: number;
    leaves: number;
  };
}) {
  const { workSummary } = props;
  return (
    <Flex
      ml={"4"}
      pr={"4"}
      minWidth={"220px"}
      direction={"column"}
      textAlign={"center"}
    >
      <Flex
        p={"4"}
        rounded={"md"}
        border={"1px solid"}
        borderColor={"#e7e7e7"}
        background={"#027dbc66"}
        direction={"column"}
        mb={"4"}
      >
        <Text fontSize={"md"} fontWeight={"medium"} color={"gray.600"}>
          Total Working Hours
        </Text>
        <Text fontSize={"2xl"} fontWeight={"medium"}>
          {Number(Number(workSummary.totalHours).toFixed(2))}
        </Text>
        <Flex
          direction={"column"}
          borderTop={"1px solid"}
          borderColor={"white"}
          pt={"2"}
          mt={"2"}
        >
          <Flex alignItems={"center"} justifyContent={"center"}>
            <Text fontSize={"sm"} color={"gray.600"} mr={"2"}>
              Realised Hours :
            </Text>
            <Text fontSize={"md"} fontWeight={"medium"}>
              {Number(Number(workSummary.relHours).toFixed(2))}
            </Text>
          </Flex>
          <Flex alignItems={"center"} justifyContent={"center"}>
            <Text fontSize={"sm"} color={"gray.600"} mr={"2"}>
              Planned Hours :
            </Text>
            <Text fontSize={"md"} fontWeight={"medium"}>
              {Number(Number(workSummary.planHours).toFixed(2))}
            </Text>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        p={"4"}
        rounded={"md"}
        border={"1px solid"}
        borderColor={"#e7e7e7"}
        background={"#f2972766"}
        direction={"column"}
        mb={"4"}
      >
        <Text fontSize={"md"} fontWeight={"medium"} color={"gray.600"}>
          Total Working Holidays
        </Text>
        <Text fontSize={"2xl"} fontWeight={"medium"}>
          {Number(Number(workSummary.wHolidays).toFixed(2))}
        </Text>
      </Flex>
      <Flex
        p={"4"}
        rounded={"md"}
        border={"1px solid"}
        borderColor={"#e7e7e7"}
        background={"#81abd466"}
        direction={"column"}
        mb={"4"}
      >
        <Text fontSize={"md"} fontWeight={"medium"} color={"gray.600"}>
          Total Week Off's
        </Text>
        <Text fontSize={"2xl"} fontWeight={"medium"}>
          {Number(Number(workSummary.weekOffs).toFixed(2))}
        </Text>
      </Flex>
      <Flex
        p={"4"}
        rounded={"md"}
        border={"1px solid"}
        borderColor={"#e7e7e7"}
        background={"#c1e1c266"}
        direction={"column"}
        mb={"4"}
      >
        <Text fontSize={"md"} fontWeight={"medium"} color={"gray.600"}>
          Total Leaves
        </Text>
        <Text fontSize={"2xl"} fontWeight={"medium"}>
          {Number(Number(workSummary.leaves).toFixed(2))}
        </Text>
      </Flex>
    </Flex>
  );
}

export default MyHoursInfo;
