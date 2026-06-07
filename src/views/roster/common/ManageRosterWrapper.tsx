import { Button, Flex, Text } from "@chakra-ui/react";
import {
  IMiscWork,
  IPayrollConfig,
  IRecommendedHours,
  IRoster,
  IRosterHookProps,
  IShift,
  IWeekResponse,
} from "../../../helper/Interface";
import { isFutureWeek } from "../../../helper/Utils";
import CalenderView from "./CalenderView";
import NoRosterWrapper from "./NoRosterWrapper";
import WeekChanger from "./WeekChanger";

function ManageRosterWrapper(props: {
  readonly rosterType: IRosterHookProps["rosterType"];
  readonly selectedWeek?: number;
  readonly weeks: IWeekResponse[];
  readonly selectedYear?: number;
  readonly onChangeWeek: (week: number) => void;
  readonly onChangeYear: (year: number) => void;
  readonly roster?: IRoster;
  readonly shifts: IShift[];
  readonly miscWorks: IMiscWork[];
  readonly recommendedHours?: IRecommendedHours[];
  readonly payrollConfig?: IPayrollConfig;
  readonly onCreateRosterClick: () => Promise<void>;
}) {
  const {
    rosterType,
    weeks,
    selectedWeek,
    selectedYear,
    onChangeWeek,
    onChangeYear,
    roster,
    shifts,
    miscWorks,
    recommendedHours,
    onCreateRosterClick,
    payrollConfig,
  } = props;
  return (
    <Flex width={"100%"} direction={"column"}>
      <WeekChanger
        onChangeWeek={onChangeWeek}
        onChangeYear={onChangeYear}
        selectedWeek={selectedWeek}
        selectedYear={selectedYear}
        weeks={weeks}
        rosterStatus={roster?.rosterStatus}
      />
      <Flex mt={"4"}>
        {roster?.rosterWeekId ? (
          <CalenderView
            roster={roster}
            shifts={shifts}
            editable={false}
            miscWorks={miscWorks}
            rosterType={rosterType}
            recommendedHours={recommendedHours}
          />
        ) : (
          <NoRosterWrapper>
            {selectedWeek &&
            selectedYear &&
            payrollConfig &&
            isFutureWeek({
              currentPStartDateTime: payrollConfig.currentPStartDateTime,
              selectedWeek,
              selectedYear,
            }) ? (
              <>
                <Text fontWeight={"medium"} pb={"2"}>
                  Oh Shift! Looks like you haven't scheduled anything yet!
                </Text>
                <Text fontSize={"xs"}>
                  This week’s roster is as empty as monday mornings before the
                  first cup of coffee.
                </Text>
                <Flex justifyContent={"center"} pt={"4"}>
                  <Button onClick={onCreateRosterClick}>+ Create Roster</Button>
                </Flex>
              </>
            ) : (
              <>
                <Text fontWeight={"medium"} pb={"2"}>
                  Oh Shift! Looks like no roster exists for this week.
                </Text>
                <Text fontSize={"xs"}>
                  You can not create a new Roster for past weeks.
                </Text>
              </>
            )}
          </NoRosterWrapper>
        )}
      </Flex>
    </Flex>
  );
}

export default ManageRosterWrapper;
