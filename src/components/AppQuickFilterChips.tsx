import { Divider, Flex, Text } from "@chakra-ui/react";
import React from "react";
import {
  BsCheck2,
  BsCheck2Circle,
  BsCheckCircle,
  BsPlusCircle,
} from "react-icons/bs";

function AppQuickFilterChips(props: {
  readonly filters: {
    label: string;
    value: string;
    color?: string;
    text?: string;
    divider?: boolean;
  }[];
  readonly selectedFilters: string[];
  readonly setSelectedFilters: (filters: string[]) => void;
  readonly onClick?: (filter: string) => void;
  readonly children?: React.ReactNode;
}) {
  const { children, filters, setSelectedFilters, selectedFilters, onClick } =
    props;
  return (
    <Flex alignItems={"center"} width={"full"}>
      {filters.map((filter) => (
        <Flex key={filter.value} alignItems={"center"}>
          {filter.divider ? (
            <Divider
              orientation="vertical"
              height={"6"}
              mx={"1"}
              background={"#027DBC"}
            />
          ) : null}
          <Flex
            onClick={() => {
              if (onClick) onClick(filter.value);
              if (selectedFilters.includes(filter.value)) {
                setSelectedFilters(
                  selectedFilters.filter((value) => value !== filter.value)
                );
              } else {
                setSelectedFilters([...selectedFilters, filter.value]);
              }
            }}
            m={"1"}
            cursor={"pointer"}
            transition={"0.3s"}
            style={{
              background: selectedFilters.includes(filter.value)
                ? filter.color || "black"
                : "#d3d3d34f",
              color: filter.text
                ? filter.text
                : selectedFilters.includes(filter.value)
                ? "white"
                : "black",
              height: "fit-content",
              padding: "5px 12px",
              borderRadius: 26,
              alignItems: "center",
              boxShadow: "0 0 1px 0 #027DBC",
              border: `1px solid ${filter.color || "black"}`,
              opacity: selectedFilters.includes(filter.value) ? 1 : 0.6,
            }}
          >
            <Text fontSize={"xs"} mr={"1"} whiteSpace={"nowrap"}>
              {filter.label}
            </Text>
            {selectedFilters.includes(filter.value) ? (
              <BsCheckCircle />
            ) : (
              <BsPlusCircle />
            )}
          </Flex>
        </Flex>
      ))}
      {children ? <Flex ml={"auto"}>{children}</Flex> : null}
    </Flex>
  );
}

export default AppQuickFilterChips;
