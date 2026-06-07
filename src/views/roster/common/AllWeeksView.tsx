import { Flex, IconButton, Text, Tooltip } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import {
  CJP_DAY_CARD_HEIGHT,
  INSIGHTS_WIDTH,
  ROSTER_STATUS,
} from "../../../helper/Constant";
import { AiOutlineClose } from "react-icons/ai";
import { IPlannedJobWeekResponse } from "../../../helper/Interface";
import moment from "moment";
import { formatDate } from "../../../helper/Utils";
import {
  BsCheckCircle,
  BsDashCircleDotted,
  BsEye,
  BsEyeFill,
  BsFillEyeFill,
} from "react-icons/bs";
import { useAppSelector } from "../../../app/store/store";

function AllWeeksView(props: {
  isAllWeeksOpen: boolean;
  onAllWeeksClose: () => void;
  plannedJobWeeks: IPlannedJobWeekResponse[];
  onChangeWeek: (week: number) => void;
  contentMaxHeight: string;
}) {
  const { selectedYear, selectedWeek } = useAppSelector(
    (state) => state.roster
  );
  const divRef = useRef<any>();
  const {
    isAllWeeksOpen,
    onAllWeeksClose,
    plannedJobWeeks,
    onChangeWeek,
    contentMaxHeight,
  } = props;
  useEffect(() => {
    if (isAllWeeksOpen && selectedYear && selectedWeek) {
      scrollToCurrentWeek();
    }
  }, [isAllWeeksOpen, plannedJobWeeks, selectedYear, selectedWeek]);
  const scrollToCurrentWeek = () => {
    (divRef as any).current.scrollTop =
      (selectedWeek && selectedWeek > 1 ? selectedWeek - 1 : 0) * 68;
  };

  return (
    <>
      <Flex
        transition={"0.3s"}
        width={isAllWeeksOpen ? `${INSIGHTS_WIDTH}px` : "0px"}
        overflow={"hidden"}
      >
        <Flex
          direction={"column"}
          ml={"4"}
          mt={"2"}
          width={"full"}
          border={"1px solid #f1f1f1"}
        >
          <Flex
            alignItems={"center"}
            justifyContent={"space-between"}
            width={"full"}
            pl={"4"}
            pr={"2"}
            height={`${CJP_DAY_CARD_HEIGHT}px`}
            borderBottom={"1px solid #f1f1f1"}
          >
            <Text>Weeks Insight</Text>
            <IconButton
              aria-label=""
              variant={"ghost"}
              size={"sm"}
              onClick={onAllWeeksClose}
            >
              <AiOutlineClose />
            </IconButton>
          </Flex>
          <Flex
            direction={"column"}
            overflow={"auto"}
            maxHeight={contentMaxHeight}
            ref={divRef}
            scrollBehavior={"smooth"}
          >
            {plannedJobWeeks
              .sort(
                (a, b) =>
                  moment(a.startDate).unix() - moment(b.startDate).unix()
              )
              .map(({ endDate, week, startDate, year, weekStatus }, i) => {
                const bg =
                  weekStatus === "DRAFT"
                    ? "#027DBC1a"
                    : weekStatus === "PUBLISHED"
                    ? "#3597351a"
                    : weekStatus === "PUB_DRAFT"
                    ? "#F297271a"
                    : weekStatus === "NI"
                    ? "#ffffff1a"
                    : "#7180961a";
                const color =
                  weekStatus === "DRAFT"
                    ? "#027DBC"
                    : weekStatus === "PUBLISHED"
                    ? "#359735"
                    : weekStatus === "PUB_DRAFT"
                    ? "#F29727"
                    : weekStatus === "NI"
                    ? "gray.500"
                    : "#718096";
                const status = ROSTER_STATUS.find(
                  ({ status }) => status === weekStatus
                );
                return (
                  <Tooltip
                    key={startDate}
                    label={status ? status.name : ""}
                    hasArrow
                  >
                    <Flex
                      justifyContent={"space-between"}
                      alignItems={"center"}
                      px={"3"}
                      py={"2"}
                      m={"3"}
                      my={"2"}
                      background={bg}
                      color={color}
                      rounded={"md"}
                      shadow={"0 0 1px 0 gray"}
                      cursor={"pointer"}
                      onClick={() => onChangeWeek(week)}
                    >
                      <Flex direction={"column"}>
                        <Flex alignItems={"center"}>
                          <Text fontWeight={"medium"} fontSize={"sm"} mr={"2"}>
                            {`Week ${week}, ${year}`}
                          </Text>
                          {week === selectedWeek ? <BsEyeFill /> : null}
                        </Flex>

                        <Text
                          fontSize={"x-small"}
                          color={"gray.400"}
                          fontWeight={"medium"}
                        >
                          {`${formatDate(startDate)} - ${formatDate(endDate)}`}
                        </Text>
                      </Flex>
                      <Flex>
                        {weekStatus === "PUBLISHED" ? <BsCheckCircle /> : null}
                        {weekStatus === "DRAFT" ||
                        weekStatus === "PUB_DRAFT" ? (
                          <BsDashCircleDotted />
                        ) : null}
                      </Flex>
                    </Flex>
                  </Tooltip>
                );
              })}
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}

export default AllWeeksView;
