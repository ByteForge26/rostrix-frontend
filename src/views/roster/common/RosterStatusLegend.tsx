import { Flex, Text, Tooltip } from "@chakra-ui/react";
import React from "react";
import { ROSTER_STATUS } from "../../../helper/Constant";
import CustomBox from "./CustomBox";
import { BsInfoCircle } from "react-icons/bs";

function RosterStatusLegend() {
  return (
    <Flex
      border={"1px solid #eaeaea"}
      width={"full"}
      rounded={"md"}
      direction={"column"}
      background={"#F8F8F8"}
      p={"2"}
      mt={"4"}
      justifyContent={"center"}
    >
      <Flex
        background={"white"}
        justifyContent={"center"}
        p={"2"}
        width={"full"}
        rounded={"md"}
        boxShadow={"sm"}
      >
        {ROSTER_STATUS.map(({ background, color, name, description }, i) => {
          return (
            <Flex
              my={"2"}
              mx={"4"}
              alignItems={"center"}
              key={name + "_" + color}
            >
              <CustomBox color={color} background={background} />

              <Text ml={"2"} fontWeight={"medium"} fontSize={"sm"}>
                {name}
              </Text>
              <Tooltip label={description} hasArrow>
                <Text ml={"1"}>
                  <BsInfoCircle size={"12px"} />
                </Text>
              </Tooltip>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}

export default RosterStatusLegend;
