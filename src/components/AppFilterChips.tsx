import { Flex, Text } from "@chakra-ui/react";
import { AiOutlineEdit } from "react-icons/ai";

function AppFilterChips(props: {
  readonly filters: (string | undefined)[];
  readonly onClick?: () => void;
}) {
  const { filters, onClick } = props;

  return (
    <Flex
      alignItems={"center"}
      px={"2"}
      mr={filters.filter((value) => value).length ? "3" : "0"}
      style={{
        borderRight: filters.filter((value) => value).length
          ? "1px solid"
          : "none",
      }}
    >
      {filters
        .filter((value) => value)
        .map((filter) => (
          <Flex
            key={filter}
            onClick={onClick}
            m={"1"}
            cursor={"pointer"}
            style={{
              background: "black",
              color: "white",
              height: "fit-content",
              padding: "6px 16px",
              borderRadius: 26,
              alignItems: "center",
              boxShadow: "0 0 1px 0 #027DBC",
            }}
          >
            <Text mr={"1"} whiteSpace={"nowrap"}>
              {filter}
            </Text>
            <AiOutlineEdit />
          </Flex>
        ))}
    </Flex>
  );
}

export default AppFilterChips;
