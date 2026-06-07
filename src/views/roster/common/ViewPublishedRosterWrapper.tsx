import { Flex, Text, useBoolean } from "@chakra-ui/react";
import { useAppSelector } from "../../../app/store/store";
import { INSIGHTS_WIDTH } from "../../../helper/Constant";
import {
  IMiscWork,
  IRecommendedHours,
  IRoster,
  IRosterHookProps,
  IShift,
  IWeekResponse,
} from "../../../helper/Interface";
import CalenderView from "./CalenderView";
import InsightsWrapper from "./InsightsWrapper";
import NoRosterWrapper from "./NoRosterWrapper";
import WeekChanger from "./WeekChanger";

function ViewPublishedRosterWrapper(props: {
  readonly rosterType: IRosterHookProps["rosterType"];
  readonly selectedYear?: number;
  readonly onChangeYear: (year: number) => void;
  readonly weeks: IWeekResponse[];
  readonly onChangeWeek: (week: number) => void;
  readonly roster?: IRoster;
  readonly shifts: IShift[];
  readonly miscWorks: IMiscWork[];
  readonly onChangeSelectedDay: (dayId: string) => void;
  readonly recommendedHours?: IRecommendedHours[];
}) {
  const {
    rosterType,
    selectedYear,
    onChangeYear,
    weeks,
    onChangeWeek,
    roster,
    shifts,
    miscWorks,
    onChangeSelectedDay,
    recommendedHours,
  } = props;
  const { selectedWeek, selectedDate } = useAppSelector(
    (state) => state.roster
  );
  const [isInsightsShow, { toggle }] = useBoolean(false);
  return (
    <Flex width={"100%"} direction={"column"}>
      <WeekChanger
        onChangeWeek={onChangeWeek}
        onChangeYear={onChangeYear}
        selectedWeek={selectedWeek}
        selectedYear={selectedYear}
        weeks={weeks}
        isPublished={!!roster?.rosterWeekId}
        rosterStatus={roster?.rosterStatus}
      />
      <Flex mt={"4"}>
        {roster?.rosterWeekId ? (
          <Flex width={"full"}>
            <Flex
              width={`calc(100% - ${isInsightsShow ? INSIGHTS_WIDTH : 36}px)`}
              transition={"0.3s"}
            >
              <CalenderView
                roster={roster}
                shifts={shifts}
                editable={false}
                dayChangable={true}
                miscWorks={miscWorks}
                rosterType={rosterType}
                onChangeSelectedDay={onChangeSelectedDay}
                recommendedHours={recommendedHours}
              />
            </Flex>
            <InsightsWrapper
              isInsightsShow={isInsightsShow}
              selectedDate={selectedDate}
              toggle={toggle}
            />
          </Flex>
        ) : (
          <NoRosterWrapper>
            <Text fontWeight={"medium"}>
              Oh Shift! Looks like no roster exists for this week.
            </Text>
          </NoRosterWrapper>
        )}
      </Flex>
    </Flex>
  );
}

export default ViewPublishedRosterWrapper;
