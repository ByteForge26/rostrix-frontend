import {
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text,
} from "@chakra-ui/react";
import { BsCheck, BsSortAlphaDown, BsSortDown, BsSortUp } from "react-icons/bs";
import { Fragment, useState } from "react";
import { ILegend } from "../helper/Interface";
import { FiMoreHorizontal, FiMoreVertical } from "react-icons/fi";
import moment from "moment";

const AppChartWrapper = (props: {
  heading: string;
  children: any;
  width?: string;
  legend?: ILegend[];
  hideLegend?: boolean;
  childrenDisplay?: string;
  sortValue?: string;
  onChangeSortValue?: (value: string) => void;
  legendOptions?: Record<string, boolean>;
  onChangeLegendOptions?: (key: string, value: boolean) => void;
  extraLegends?: boolean;
  referenceDate?: string;
}) => {
  const {
    heading,
    children,
    width,
    legend,
    hideLegend,
    childrenDisplay,
    sortValue,
    onChangeSortValue,
    legendOptions,
    onChangeLegendOptions,
    extraLegends,
    referenceDate,
  } = props;
  return (
    <Flex
      width={width ? width : "100%"}
      p={"6"}
      m={"1"}
      rounded={"md"}
      direction={"column"}
      style={{
        boxShadow: "0px 0px 4px 0 lightgray",
      }}
      background={"white"}
    >
      <Flex width={"full"} pb={"4"} justifyContent={"space-between"}>
        <Text fontSize={"lg"} fontWeight={"medium"}>
          {heading}
        </Text>
        <Flex>
          <Flex>
            {legend && !hideLegend ? (
              <>
                {legend.map(({ color, label }) => {
                  return (
                    <Flex
                      alignItems={"center"}
                      width={"fit-content"}
                      padding={"0px 8px"}
                      borderRadius={"md"}
                    >
                      <Flex
                        mr={"2"}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: color,
                        }}
                      ></Flex>
                      <Text color={"#615E83"}>{label}</Text>
                    </Flex>
                  );
                })}
              </>
            ) : null}

            {legendOptions &&
            onChangeLegendOptions &&
            legend &&
            legend.length > 1 ? (
              <Menu closeOnSelect={false}>
                <MenuButton
                  as={IconButton}
                  variant={"ghost"}
                  ml={"4"}
                  icon={<FiMoreVertical />}
                />
                <MenuList zIndex={11}>
                  {legend.map(({ key, label, color }) => (
                    <MenuItem
                      key={key}
                      justifyContent={"space-between"}
                      onClick={() => {
                        onChangeLegendOptions(
                          key,
                          legendOptions[key] ? false : true
                        );
                      }}
                    >
                      <Flex alignItems={"center"}>
                        <Flex
                          mr={"2"}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: color,
                          }}
                        ></Flex>
                        <Text fontSize={"xs"}>{label}</Text>
                      </Flex>

                      {legendOptions[key] ? <BsCheck /> : null}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            ) : null}
          </Flex>

          {sortValue && onChangeSortValue && legend ? (
            <Flex ml={"4"}>
              <Menu closeOnSelect={false}>
                <MenuButton as={Button} variant={"outline"}>
                  Sort
                </MenuButton>
                <MenuList minWidth="240px" zIndex={11}>
                  {legend.map(({ key, label }) => (
                    <Fragment key={key}>
                      <MenuOptionGroup
                        title={label}
                        type="radio"
                        value={sortValue}
                        onChange={(value) => onChangeSortValue(value as string)}
                      >
                        {[
                          { label: "High to Low", value: "H2L" },
                          { label: "Low to High", value: "L2H" },
                        ].map(({ label, value }) => (
                          <MenuItemOption
                            key={value}
                            value={`${key}__${value}`}
                            fontSize={"xs"}
                          >
                            {label}
                          </MenuItemOption>
                        ))}
                      </MenuOptionGroup>
                      <MenuDivider />
                    </Fragment>
                  ))}
                </MenuList>
              </Menu>
            </Flex>
          ) : null}
        </Flex>
      </Flex>
      <Flex
        height={"280px"}
        overflow={"auto"}
        display={childrenDisplay ? childrenDisplay : "block"}
        justifyContent={"center"}
      >
        {children}
      </Flex>
      <Flex justifyContent={"center"}>
        {extraLegends ? (
          <>
            {[
              {
                borderStyle: "dashed",
                label: referenceDate
                  ? (moment(referenceDate).get("year") - 1).toString()
                  : "Last Year",
              },
              {
                borderStyle: "solid",
                label: referenceDate
                  ? moment(referenceDate).get("year").toString()
                  : "Current Year",
              },
            ].map(({ label, borderStyle }) => {
              return (
                <Flex
                  alignItems={"center"}
                  width={"fit-content"}
                  padding={"0px 8px"}
                  borderRadius={"md"}
                >
                  <Flex
                    mr={"2"}
                    style={{
                      width: 25,
                      borderTop: "1px",
                      borderStyle,
                      borderColor: "#615E83",
                    }}
                  ></Flex>
                  <Text color={"#615E83"}>{label}</Text>
                </Flex>
              );
            })}
          </>
        ) : null}
      </Flex>
    </Flex>
  );
};
export default AppChartWrapper;
