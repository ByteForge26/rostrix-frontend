import React from "react";
import AppSelect from "../../../components/AppSelect";
import { FILTERS, MONTHS } from "../../../helper/Constant";
import { Flex } from "@chakra-ui/react";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import moment from "moment";
import { subDays } from "date-fns";

function DateSelection(props: {
  selectedFilter: string;
  selectedYearMonth: string;
  setSelectedYearMonth: (value: React.SetStateAction<string>) => void;
  yearMonthListing: { label: string; value: string; isDisabled?: boolean }[];
  currentMonth: number;
  setCurrentMonth: (value: React.SetStateAction<number>) => void;
  currentYear: number;
  setCurrentYear: (value: React.SetStateAction<number>) => void;
  customFromDate: string;
  setCustomFromDate: (value: React.SetStateAction<string>) => void;
  customToDate: string;
  setCustomToDate: (value: React.SetStateAction<string>) => void;
}) {
  const {
    selectedFilter,
    selectedYearMonth,
    setSelectedYearMonth,
    yearMonthListing,
    currentMonth,
    setCurrentMonth,
    currentYear,
    setCurrentYear,
    customFromDate,
    setCustomFromDate,
    customToDate,
    setCustomToDate,
  } = props;
  return (
    <>
      {selectedFilter === FILTERS[0].value ? (
        <AppSelect
          value={selectedYearMonth}
          onChange={(value) => setSelectedYearMonth(value)}
          options={
            yearMonthListing?.length
              ? yearMonthListing
                  .sort((a, b) => b.value.localeCompare(a.value))
                  .map(({ label, value, isDisabled }) => ({
                    label,
                    value,
                    isDisabled,
                  }))
              : []
          }
        />
      ) : null}
      {selectedFilter === FILTERS[1].value ? (
        <Flex>
          <Flex>
            <AppSelect
              value={currentMonth}
              onChange={(value) => setCurrentMonth(value)}
              options={
                MONTHS?.length
                  ? MONTHS.map((label) => ({
                      label,
                      value: MONTHS.indexOf(label),
                    }))
                  : []
              }
            />
          </Flex>
          <Flex pl={"2"}>
            <AppSelect
              value={currentYear}
              onChange={(value) => setCurrentYear(value)}
              options={[
                new Date().getFullYear() - 1,
                new Date().getFullYear(),
                new Date().getFullYear() + 1,
              ].map((year) => ({
                label: year,
                value: year,
              }))}
            />
          </Flex>
        </Flex>
      ) : null}
      {selectedFilter === FILTERS[2].value ? (
        <Flex alignItems={"center"}>
          <Flex>
            <SingleDatepicker
              date={customFromDate ? new Date(customFromDate) : undefined}
              onDateChange={(date) => {
                setCustomFromDate(moment(date).format("YYYY-MM-DD"));
                if (
                  moment(moment(date).format("YYYY-MM-DD")).unix() >
                  moment(customToDate).unix()
                ) {
                  setCustomToDate(moment(date).format("YYYY-MM-DD"));
                }
              }}
              configs={{
                dateFormat: "dd-MM-yyyy",
              }}
              propsConfigs={{
                inputProps: {
                  autoFocus: true,
                  "aria-label": "custom_start_date",
                },
              }}
            />
          </Flex>
          <Flex pl={"2"}>
            <SingleDatepicker
              date={customToDate ? new Date(customToDate) : undefined}
              onDateChange={(date) =>
                setCustomToDate(moment(date).format("YYYY-MM-DD"))
              }
              minDate={subDays(new Date(customFromDate), 1)}
              configs={{
                dateFormat: "dd-MM-yyyy",
              }}
              propsConfigs={{
                inputProps: {
                  autoFocus: true,
                  "aria-label": "custom_end_date",
                },
              }}
            />
          </Flex>
        </Flex>
      ) : null}
    </>
  );
}

export default DateSelection;
