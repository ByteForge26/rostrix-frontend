import { Button, Flex, IconButton } from "@chakra-ui/react";
import { isAfter, isBefore } from "date-fns";
import moment from "moment";
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { FiEye } from "react-icons/fi";
import DatePicker from "rsuite/DatePicker";
import "rsuite/dist/rsuite.min.css";
import { IWeekResponse } from "../../../helper/Interface";
import WeekStatus from "./WeekStatus";

interface IProps {
  readonly selectedWeek?: number;
  readonly weeks: IWeekResponse[];
  readonly selectedYear?: number;
  readonly onChangeWeek: (week: number) => void;
  readonly onChangeYear: (year: number) => void;
  readonly isPublished?: boolean;
  readonly rosterStatus?: string;
  readonly onAllWeeksToggle?: () => void;
  readonly isAllWeeksOpen?: boolean;
}
function WeekChanger(props: IProps) {
  const {
    selectedWeek,
    selectedYear,
    weeks,
    onChangeWeek,
    onChangeYear,
    isPublished,
    rosterStatus,
    isAllWeeksOpen,
    onAllWeeksToggle,
  } = props;
  useEffect(() => {
    if (selectedYear && selectedWeek) {
      weeks
        .filter(({ number }) => selectedWeek === number)
        .forEach(({ endDate, number }) => {
          onWeekChange(number);
          onWeekStartDateChange(moment(endDate).toDate());
        });
    }
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date>();
  const onChange = (date: Date) => {
    const weekNumber = moment(date).get("week");
    onWeekChange(weekNumber);
    const dateFrom = moment(date).endOf("week").toDate();
    onWeekStartDateChange(dateFrom);
  };
  const onWeekChange = (weekNumber: number) => {
    onChangeWeek(weekNumber);
  };
  const onWeekStartDateChange = (date: Date) => {
    setSelectedDate(date);
    onChangeYear(date.getFullYear());
  };
  const renderValue = (date: Date) => {
    return `Week ${selectedWeek}, ${selectedYear}`;
  };
  const onNextWeekClick = () => {
    const selectedWeekLastDate = moment()
      .set({
        year: selectedYear,
        week: selectedWeek,
      })
      .endOf("week")
      .add({ week: 1 });
    onChange(selectedWeekLastDate.toDate());
  };
  const onPrevWeekClick = () => {
    const selectedWeekLastDate = moment()
      .set({
        year: selectedYear,
        week: selectedWeek,
      })
      .endOf("week")
      .subtract({ week: 1 });
    onChange(selectedWeekLastDate.toDate());
  };
  return (
    <>
      {selectedWeek && weeks?.length && selectedYear ? (
        <Flex alignItems={"center"} width={"100%"}>
          <Flex className="WeekPicker" zIndex={0} alignItems={"center"}>
            <DatePicker
              shouldDisableDate={(date) =>
                isBefore(date, new Date("01-01-2022")) ||
                isAfter(date, moment().add({ year: 1 }).endOf("year").toDate())
              }
              placeholder="Select Week"
              showWeekNumbers
              value={selectedDate}
              onChange={(date) => {
                if (date) {
                  onChange(date);
                }
              }}
              renderValue={renderValue}
              cleanable={false}
              oneTap
              ranges={[
                {
                  label: "Current Week",
                  value: moment().endOf("week").toDate(),
                  closeOverlay: true,
                },
              ]}
            />
          </Flex>
          <Flex px={"2"} alignItems={"center"}>
            <IconButton
              aria-label=""
              variant={"outline"}
              mr={"2"}
              minWidth={"36px"}
              height={"36px"}
              onClick={onPrevWeekClick}
            >
              <BsArrowLeft />
            </IconButton>
            <IconButton
              aria-label=""
              variant={"outline"}
              minWidth={"36px"}
              height={"36px"}
              onClick={onNextWeekClick}
            >
              <BsArrowRight />
            </IconButton>
          </Flex>
          <WeekStatus rosterStatus={rosterStatus} isPublished={isPublished} />
          {onAllWeeksToggle && !isAllWeeksOpen ? (
            <Button
              color={"#027DBC"}
              fontWeight={"medium"}
              ml={"auto"}
              variant={"ghost"}
              size={"sm"}
              rightIcon={isAllWeeksOpen ? <AiOutlineClose /> : <FiEye />}
              onClick={() => {
                onAllWeeksToggle();
              }}
            >
              Weeks Insight
            </Button>
          ) : null}
        </Flex>
      ) : null}
    </>
  );
}

export default WeekChanger;
