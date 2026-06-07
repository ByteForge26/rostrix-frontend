import {
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { MONTHS } from "../../../helper/Constant";
import { BsChevronDown } from "react-icons/bs";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

function MonthSwitcher(props: {
  currentMonth: number;
  currentYear: number;
  setCurrentMonth: React.Dispatch<React.SetStateAction<number>>;
  setCurrentYear: React.Dispatch<React.SetStateAction<number>>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  disabled?: boolean;
}) {
  const {
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear,
    onPrevMonth,
    onNextMonth,
    disabled,
  } = props;
  return (
    <Flex
      background={"white"}
      p={"2"}
      justifyContent={"space-between"}
      width={"full"}
      alignItems={"center"}
      roundedTopLeft={"md"}
      roundedTopRight={"md"}
      boxShadow={"sm"}
      mb={"2"}
      minHeight={"48px"}
    >
      <Flex>
        <Menu>
          <MenuButton disabled={disabled}>
            <Text
              fontSize={"sm"}
              fontWeight={"bold"}
              mx={"2"}
              display={"flex"}
              alignItems={"center"}
            >
              {`${MONTHS[currentMonth]}`}
              {disabled ? null : (
                <BsChevronDown
                  size={"12px"}
                  style={{
                    marginLeft: 4,
                  }}
                />
              )}
            </Text>
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              defaultValue={MONTHS[currentMonth]}
              title="Select Month"
              type="radio"
            >
              {MONTHS.map((month) => (
                <MenuItemOption
                  key={month}
                  value={month}
                  onClick={() => setCurrentMonth(MONTHS.indexOf(month))}
                >
                  {month}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
        <Menu>
          <MenuButton disabled={disabled}>
            <Text
              fontSize={"sm"}
              fontWeight={"bold"}
              mx={"2"}
              display={"flex"}
              alignItems={"center"}
            >
              {`${currentYear}`}
              {disabled ? null : (
                <BsChevronDown
                  size={"12px"}
                  style={{
                    marginLeft: 4,
                  }}
                />
              )}
            </Text>
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              defaultValue={currentYear.toString()}
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
                  onClick={() => setCurrentYear(Number(year))}
                  fontSize={"sm"}
                >
                  {year}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </Flex>
      {disabled ? null : (
        <Flex>
          <IconButton
            data-testid="prev_month"
            variant={"ghost"}
            color={"#027DBC"}
            size={"sm"}
            aria-label="prev_month"
            onClick={onPrevMonth}
          >
            <FiArrowLeft />
          </IconButton>
          <Button
            variant={"ghost"}
            color={"#027DBC"}
            size={"sm"}
            onClick={() => {
              const today = new Date();
              setCurrentMonth(today.getMonth());
              setCurrentYear(today.getFullYear());
            }}
          >
            Today
          </Button>
          <IconButton
            data-testid="next_month"
            variant={"ghost"}
            color={"#027DBC"}
            aria-label="next_month"
            size={"sm"}
            onClick={onNextMonth}
          >
            <FiArrowRight />
          </IconButton>
        </Flex>
      )}
    </Flex>
  );
}

export default MonthSwitcher;
