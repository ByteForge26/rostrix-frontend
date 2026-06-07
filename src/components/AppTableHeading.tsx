import { Flex, Text, Tooltip } from "@chakra-ui/react";
import React from "react";
import { BsInfoCircle } from "react-icons/bs";

function AppTableHeading(props: {
  readonly info: string;
  readonly label: string;
}) {
  const { info, label } = props;
  return (
    <Flex alignItems={"center"}>
      {label ? <Text>{label}</Text> : null}
      {info ? (
        <Tooltip hasArrow rounded={"sm"} py={"2"} label={info}>
          <Flex pl={"1"} position={"relative"}>
            <BsInfoCircle fontSize={"12px"} />
          </Flex>
        </Tooltip>
      ) : null}
    </Flex>
  );
}

export default AppTableHeading;
