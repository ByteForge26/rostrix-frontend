import { Button, Flex, IconButton, Text, useBoolean } from "@chakra-ui/react";
import { useEffect } from "react";
import { BsInfoCircle } from "react-icons/bs";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../app/store/store";
import {
  INSIGHTS_WIDTH,
  NAV_HEIGHT,
  SECONDARY_JOBS_CONFIG,
} from "../../../helper/Constant";
import { IRosterHookProps } from "../../../helper/Interface";
import { useRoster } from "../../../hooks/useRoster";
import CalenderView from "./CalenderView";
import InsightsWrapper from "./InsightsWrapper";
import RosterPublishButton from "./RosterPublishButton";
import RosterPublishCJPWarning from "./RosterPublishCJPWarning";
import RosterPublishForceConfirmWarning from "./RosterPublishForceConfirmWarning";
import RosterPublishHoursWarning from "./RosterPublishHoursWarning";
import RosterPublishSuccess from "./RosterPublishSuccess";
import WeekStatus from "./WeekStatus";

let pollingInterval: any;
function EditRosterWrapper(props: {
  readonly rosterType: IRosterHookProps["rosterType"];
}) {
  const { rosterType } = props;
  const {
    roster,
    finalDuplicateDayIds,
    isDuplicateModalOpen,
    onChangeSelectedDay,
    onDuplicateClick,
    onDuplicateModalClose,
    onDuplicateModalOpen,
    shifts,
    onShiftChange,
    onDraftDataSave,
    isRosterSaving,
    getShifts,
    miscWorks,
    onRemoveMiscShift,
    onPublishRoster,
    setGlobalNotifyTo,
    globalNotifyTo,
    isEmpExceedingHoursListModalOpen,
    onEmpExceedingHoursListModalClose,
    empDailyExceedingHoursList,
    empWeeklyExceedingHoursList,
    empExceedingHoursList,
    onChangeWeek,
    goToRosterEdit,
    isForceConfirmModalOpen,
    onForceConfirmModalClose,
    messageObj,
    isWeekUncoveredShiftsModalOpen,
    onWeekUncoveredShiftsModalClose,
    weekUncoveredShifts,
    isPublishedRosterModalOpen,
    onPublishedRosterModalClose,
    recommendedHours,
    getAllClusters,
    clusters,
    selectedClusterId,
    isRecommendedHoursLoading,
  } = useRoster({
    viewMode: "LATEST",
    mode: "edit",
    rosterType,
  });
  const navigate = useNavigate();
  const { selectedWeek, draft, selectedJobType, selectedDate } = useAppSelector(
    (state) => state.roster
  );
  const [isInsightsShow, { toggle }] = useBoolean(false);
  useEffect(() => {
    if (rosterType === "primary") getAllClusters();
    onChangeSelectedDay("");
  }, []);
  useEffect(() => {
    pollingInterval = setInterval(() => {
      onDraftDataSave();
    }, 20000);
    return () => {
      onDraftDataSave();
      clearInterval(pollingInterval);
    };
  }, []);
  return (
    <Flex flexDirection={"column"} width={"100%"} minHeight={"100vh"}>
      <Flex
        height={`${NAV_HEIGHT}px`}
        alignItems={"center"}
        borderBottom={"1px solid #d4d4d4"}
        width={"100%"}
        justifyContent={"space-between"}
        background={"white"}
        zIndex={1}
      >
        <Flex alignItems={"center"}>
          <IconButton
            aria-label="FiArrowLeft"
            variant={"ghost"}
            onClick={() => navigate(-1)}
            mx={2}
            fontSize={"lg"}
          >
            <FiArrowLeft />
          </IconButton>

          <Text fontSize={"lg"} ml={"0"}>
            {`${
              rosterType === "primary"
                ? clusters?.length
                  ? clusters.find(({ id }) => id === selectedClusterId)?.name ??
                    ""
                  : ""
                : SECONDARY_JOBS_CONFIG.find(
                    ({ jobType }) => jobType === selectedJobType
                  )?.label || selectedJobType
            }  |  Rostering Week ${selectedWeek}`}
          </Text>
          <WeekStatus rosterStatus={roster?.rosterStatus} />
          {roster?.empWeekRosters?.filter(
            ({ empHours, allowedHours }) =>
              empHours.filter(({ totalHours }) => totalHours > allowedHours)
                .length > 0
          )?.length ? (
            <Flex
              ml={"4"}
              py={"0.5"}
              px={"2"}
              alignItems={"center"}
              background={"#e85f5f26"}
              color={"#e85f5f"}
              rounded={"sm"}
            >
              <BsInfoCircle />
              <Text ml={"2"} fontSize={"sm"} fontWeight={"medium"}>
                Hours Limit Exceeded
              </Text>
            </Flex>
          ) : null}
          {isRosterSaving ? (
            <Flex
              ml={"4"}
              py={"0.5"}
              px={"2"}
              alignItems={"center"}
              background={"#DAF6E3"}
              rounded={"sm"}
            >
              <Text fontSize={"sm"} fontWeight={"medium"} color={"green"}>
                DRAFT SAVED
              </Text>
            </Flex>
          ) : null}
        </Flex>

        <Flex>
          {draft?.length && !isRosterSaving ? (
            <Button
              variant={"outline"}
              mr={3}
              onClick={() => onDraftDataSave()}
            >
              Save
            </Button>
          ) : null}
          <Flex mr={3}>
            <RosterPublishButton
              setGlobalNotifyTo={setGlobalNotifyTo}
              onPublishRoster={({ notifyTo }) => {
                onPublishRoster({
                  notifyTo,
                  week: selectedWeek,
                });
              }}
              withSave={draft.length > 0}
            />
          </Flex>
        </Flex>
      </Flex>
      <Flex
        height={`calc(100% - ${NAV_HEIGHT}px)`}
        flex={1}
        paddingBottom={"53px"}
      >
        <Flex
          width={`calc(100% - ${isInsightsShow ? INSIGHTS_WIDTH : 36}px)`}
          transition={"0.3s"}
        >
          <CalenderView
            editable={true}
            finalDuplicateDayIds={finalDuplicateDayIds}
            isDuplicateModalOpen={isDuplicateModalOpen}
            onChangeSelectedDay={onChangeSelectedDay}
            onDuplicateClick={onDuplicateClick}
            onDuplicateModalClose={onDuplicateModalClose}
            onDuplicateModalOpen={onDuplicateModalOpen}
            roster={roster}
            shifts={shifts}
            onShiftChange={onShiftChange}
            getShifts={getShifts}
            miscWorks={miscWorks?.filter(({ disabled }) => !disabled)}
            onRemoveMiscShift={onRemoveMiscShift}
            rosterType={rosterType}
            recommendedHours={recommendedHours}
            isRecommendedHoursLoading={isRecommendedHoursLoading}
            clusters={clusters}
            assignedJobShifts={roster?.assignedJobShifts}
          />
        </Flex>

        <InsightsWrapper
          isInsightsShow={isInsightsShow}
          selectedDate={selectedDate}
          toggle={toggle}
        />
      </Flex>
      <RosterPublishSuccess
        globalNotifyTo={globalNotifyTo}
        selectedWeek={selectedWeek}
        isPublishedRosterModalOpen={isPublishedRosterModalOpen}
        onPublishedRosterModalClose={onPublishedRosterModalClose}
      />
      <RosterPublishHoursWarning
        isEmpExceedingHoursListModalOpen={isEmpExceedingHoursListModalOpen}
        onEmpExceedingHoursListModalClose={onEmpExceedingHoursListModalClose}
        empDailyExceedingHoursList={empDailyExceedingHoursList}
        empWeeklyExceedingHoursList={empWeeklyExceedingHoursList}
        empExceedingHoursList={empExceedingHoursList}
        onChangeWeek={onChangeWeek}
        goToRosterEdit={goToRosterEdit}
      />
      <RosterPublishForceConfirmWarning
        isForceConfirmModalOpen={isForceConfirmModalOpen}
        onForceConfirmModalClose={onForceConfirmModalClose}
        messageObj={messageObj}
        globalNotifyTo={globalNotifyTo}
        onPublishRoster={({ notifyTo, forceConfirm }) => {
          onPublishRoster({
            notifyTo,
            forceConfirm,
            week: selectedWeek,
          });
        }}
      />
      <RosterPublishCJPWarning
        isWeekUncoveredShiftsModalOpen={isWeekUncoveredShiftsModalOpen}
        onWeekUncoveredShiftsModalClose={onWeekUncoveredShiftsModalClose}
        weekUncoveredShifts={weekUncoveredShifts}
        goToRosterEdit={goToRosterEdit}
        onChangeWeek={onChangeWeek}
      />
    </Flex>
  );
}

export default EditRosterWrapper;
