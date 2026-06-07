import { Flex, Text, Tooltip, useMediaQuery } from "@chakra-ui/react";
import React from "react";
import AppSelect from "./AppSelect";
import { FiAlertTriangle } from "react-icons/fi";
import CustomBox from "../views/roster/common/CustomBox";

interface IProps {
  readonly children?: React.ReactNode;
  readonly tabs: {
    name: string;
    value: string;
    icon?: JSX.Element;
    index?: number;
    alertInfo?: string;
    dot?: {
      color: string;
      background: string;
    };
  }[];
  readonly value: string;
  readonly setValue: (value: string) => void;
  readonly mb?: string;
}
function AppTabs(props: IProps) {
  const { children, setValue, value, tabs, mb } = props;
  const [isMobile] = useMediaQuery("(max-width: 800px)");
  return (
    <Flex
      justifyContent={"space-between"}
      alignItems={"center"}
      mb={mb ? mb : "4"}
      minHeight={"40px"}
    >
      {tabs.length > 6 || isMobile ? (
        <AppSelect
          onChange={(v) => setValue(v)}
          options={(tabs?.length && Number(tabs[0].index) >= 0
            ? [...tabs.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))]
            : [...tabs.sort((a, b) => a.name.localeCompare(b.name))]
          ).map(({ name, value }) => ({
            label: name,
            value,
          }))}
          value={value}
        />
      ) : (
        <Flex background={"#3138510d"} py={"1"} rounded={"md"}>
          {(tabs?.length && Number(tabs[0].index) >= 0
            ? [...tabs.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))]
            : [...tabs]
          ).map((obj, i) => (
            <Flex
              key={obj.value}
              rounded={"md"}
              onClick={() => setValue(obj.value)}
              background={value === obj.value ? "white" : "transparent"}
              boxShadow={value === obj.value ? "sm" : "none"}
              px={"3"}
              py={"1"}
              mx={"1"}
              transition={"0.3s"}
              cursor={"pointer"}
              alignItems={"center"}
            >
              {obj.icon ? (
                <Text
                  mr={"2"}
                  color={value === obj.value ? "black" : "gray.500"}
                >
                  {obj.icon}
                </Text>
              ) : null}
              {obj.dot ? (
                <Flex mr={"2"}>
                  <CustomBox
                    size={8}
                    background={obj.dot.background}
                    color={obj.dot.color}
                  />
                </Flex>
              ) : null}
              <Text
                fontSize={"14px"}
                color={value === obj.value ? "black" : "gray.500"}
                fontWeight={value === obj.value ? "medium" : "normal"}
              >
                {obj.name}
              </Text>
              {obj.alertInfo ? (
                <Tooltip label={obj.alertInfo}>
                  <Text
                    ml={"1"}
                    color={value === obj.value ? "black" : "gray.500"}
                  >
                    <FiAlertTriangle />
                  </Text>
                </Tooltip>
              ) : null}
            </Flex>
          ))}
        </Flex>
      )}

      <Flex>{children}</Flex>
    </Flex>
  );
}

export default AppTabs;
