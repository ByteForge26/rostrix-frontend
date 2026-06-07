import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import {
  BsFilter,
  BsSortAlphaDown,
  BsSortAlphaDownAlt,
  BsSortNumericDown,
  BsSortNumericDownAlt,
} from "react-icons/bs";
import AppTableHeading from "./AppTableHeading";

function AppTableHeadingWithSort({
  value,
  label,
  number,
  info,
  sortBy,
  setSortBy,
  sortMethodAsc,
  setSortMethodAsc,
}: {
  value: string;
  label: string;
  sortBy: string;
  setSortBy: (value: React.SetStateAction<string>) => void;
  sortMethodAsc: boolean;
  setSortMethodAsc: (value: React.SetStateAction<boolean>) => void;
  number?: boolean;
  info?: string;
}) {
  return (
    <Flex alignItems={"center"}>
      <Flex
        alignItems={"center"}
        cursor={"pointer"}
        onClick={() => {
          if (sortBy === value) {
            setSortMethodAsc(!sortMethodAsc);
          } else {
            setSortMethodAsc(true);
            setSortBy(value);
          }
        }}
        borderBottom={`1px solid ${
          sortBy === value ? "#616161" : "transparent"
        }`}
      >
        <Text mr={1}>{label}</Text>
        {sortBy !== value ? <BsFilter opacity={0.6} /> : null}
        {sortBy === value && number ? (
          <>
            {sortMethodAsc ? <BsSortNumericDown /> : <BsSortNumericDownAlt />}
          </>
        ) : null}
        {sortBy === value && !number ? (
          <>{sortMethodAsc ? <BsSortAlphaDown /> : <BsSortAlphaDownAlt />}</>
        ) : null}
      </Flex>

      {info ? <AppTableHeading label="" info={info} /> : null}
    </Flex>
  );
}

export default AppTableHeadingWithSort;
