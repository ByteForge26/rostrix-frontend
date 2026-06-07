import React from "react";
import { MONTHS_SHORT, ROSTER_STATUS } from "../../../helper/Constant";
import {
  Badge,
  Divider,
  Flex,
  Grid,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { BsChevronDown } from "react-icons/bs";
import { useAppSelector } from "../../../app/store/store";
import { IMonthSummary } from "../../../helper/Interface";
import CustomBox from "./CustomBox";
import moment from "moment";
import { formatDate } from "../../../helper/Utils";

interface IProps {
  readonly onChangeYear: (year: number) => void;
  readonly onChangeMonth: (month: number) => void;
  readonly monthSummary: IMonthSummary[];
}
function MonthsView(props: IProps) {
  const { onChangeYear, monthSummary, onChangeMonth } = props;
  const { selectedYear, selectedMonth } = useAppSelector(
    (state) => state.roster
  );
  return (
    <Flex
      border={"1px solid #eaeaea"}
      width={"fit-content"}
      rounded={"md"}
      direction={"column"}
      background={"#F8F8F8"}
      p={"2"}
    >
      <Flex
        background={"white"}
        p={"2"}
        width={"full"}
        roundedTopLeft={"md"}
        roundedTopRight={"md"}
        boxShadow={"sm"}
        mb={"2"}
        minHeight={"68px"}
        justifyContent={"center"}
      >
        {selectedYear ? (
          <Menu>
            <MenuButton>
              <Text
                fontSize={"md"}
                fontWeight={"bold"}
                mx={"2"}
                display={"flex"}
                alignItems={"center"}
              >
                {`${selectedYear}`}

                <BsChevronDown
                  size={"12px"}
                  style={{
                    marginLeft: 4,
                  }}
                />
              </Text>
            </MenuButton>
            <MenuList>
              <MenuOptionGroup
                defaultValue={selectedYear.toString()}
                title="Select Year"
                type="radio"
              >
                {[
                  new Date().getFullYear() - 1,
                  new Date().getFullYear(),
                  new Date().getFullYear() + 1,
                ].map((year) => (
                  <MenuItemOption
                    key={year}
                    value={year.toString()}
                    onClick={() => onChangeYear(Number(year))}
                    fontSize={"sm"}
                  >
                    {year}
                  </MenuItemOption>
                ))}
              </MenuOptionGroup>
            </MenuList>
          </Menu>
        ) : null}
      </Flex>
      <Grid
        gridTemplateColumns={"1fr 1fr 1fr"}
        boxShadow={"sm"}
        roundedBottomLeft={"md"}
        roundedBottomRight={"md"}
        overflow={"hidden"}
      >
        {monthSummary
          .sort((a, b) => a.month - b.month)
          .map(({ month, weekList }) => {
            return (
              <Flex key={month}>
                <Tooltip
                  hasArrow
                  label={
                    <Flex
                      direction={"column"}
                      background={"white"}
                      p="2"
                      gap={"2"}
                    >
                      {weekList
                        .sort(
                          (a, b) =>
                            moment(a.startDate).unix() -
                            moment(b.startDate).unix()
                        )
                        .map(({ status, startDate, endDate, week }, i) => {
                          const { background, color, name } =
                            ROSTER_STATUS.filter(
                              (obj) => obj.status === status
                            )[0];
                          return (
                            <Flex key={startDate} direction={"column"}>
                              {i !== 0 ? <Divider mb={"2"} /> : null}
                              <Flex alignItems={"center"}>
                                <CustomBox
                                  size={6}
                                  background={background}
                                  color={color}
                                />
                                <Text ml={"2"} mr={"2"}>{`Week: ${week}`}</Text>
                                <Badge
                                  variant={"subtle"}
                                  color={background}
                                  ml={"auto"}
                                  fontSize={"10px"}
                                >
                                  {name}
                                </Badge>
                              </Flex>

                              <Text
                                fontSize={"x-small"}
                                fontWeight={"normal"}
                                color={"gray.500"}
                              >
                                {`(${formatDate(startDate)} - ${formatDate(
                                  endDate
                                )})`}
                              </Text>
                            </Flex>
                          );
                        })}
                    </Flex>
                  }
                  bg="gray.100"
                  color="black"
                  p="1"
                  openDelay={750}
                >
                  <Flex
                    px={"4"}
                    py={"4"}
                    width={"128px"}
                    height={"102px"}
                    transition={"0.3s"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    position={"relative"}
                    background={"white"}
                    _hover={{
                      background: "#E8F6FD0d",
                    }}
                  >
                    <Flex
                      width={"full"}
                      height={"full"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      rounded={"md"}
                      transition={"0.3s"}
                      background={selectedMonth === month ? "#E8F6FD" : "white"}
                      cursor={"pointer"}
                      onClick={() => onChangeMonth(month)}
                      direction={"column"}
                    >
                      <Text
                        textAlign={"center"}
                        fontWeight={
                          selectedMonth === month ? "medium" : "normal"
                        }
                      >
                        {MONTHS_SHORT[month]}
                      </Text>
                      <Flex gap={"1"} pt={"2"}>
                        {weekList
                          .sort(
                            (a, b) =>
                              moment(a.startDate).unix() -
                              moment(b.startDate).unix()
                          )
                          .map(({ status, startDate }) => {
                            const { background, color } = ROSTER_STATUS.filter(
                              (obj) => obj.status === status
                            )[0];
                            return (
                              <CustomBox
                                key={startDate}
                                size={6}
                                background={background}
                                color={color}
                              />
                            );
                          })}
                      </Flex>
                    </Flex>
                  </Flex>
                </Tooltip>
              </Flex>
            );
          })}
      </Grid>
    </Flex>
  );
}

export default MonthsView;
