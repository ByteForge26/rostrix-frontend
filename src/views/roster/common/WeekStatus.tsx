import { Badge, Flex, Text } from "@chakra-ui/react";
import React from "react";

function WeekStatus(props: { isPublished?: boolean; rosterStatus?: string }) {
  const { rosterStatus, isPublished } = props;

  return (
    <>
      {isPublished ||
      rosterStatus === "PUBLISHED" ||
      rosterStatus === "PUB_DRAFT" ||
      rosterStatus === "DRAFT" ? (
        <Flex ml={"4"}>
          <Badge
            variant={"subtle"}
            colorScheme={rosterStatus === "PUBLISHED" ? "green" : undefined}
            color={
              rosterStatus === "PUBLISHED"
                ? "green"
                : rosterStatus === "PUB_DRAFT"
                ? "#F29727"
                : "#027DBC"
            }
          >
            <Flex alignItems={"center"} gap={"1"}>
              <Flex
                width={"1.5"}
                height={"1.5"}
                background={
                  rosterStatus === "PUBLISHED"
                    ? "green"
                    : rosterStatus === "PUB_DRAFT"
                    ? "#F29727"
                    : "#027DBC"
                }
                rounded={"full"}
              ></Flex>
              <Text>
                {rosterStatus === "PUB_DRAFT"
                  ? "PUBLISHED DRAFT"
                  : rosterStatus === "DRAFT"
                  ? "DRAFT"
                  : "PUBLISHED"}
              </Text>
            </Flex>
          </Badge>
        </Flex>
      ) : null}
    </>
  );
}

export default WeekStatus;
