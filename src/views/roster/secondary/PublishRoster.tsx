import React, { useEffect, useState } from "react";
import AppContainer from "../../../components/AppContainer";
import AppTabs from "../../../components/AppTabs";
import { Flex, Text } from "@chakra-ui/react";
import { useRoster } from "../../../hooks/useRoster";
import MonthsView from "../common/MonthsView";
import MonthsSummary from "../common/MonthsSummary";
import RosterStatusLegend from "../common/RosterStatusLegend";
import { IRosterHookProps } from "../../../helper/Interface";
import { useAppSelector } from "../../../app/store/store";
import { SECONDARY_JOBS_CONFIG } from "../../../helper/Constant";
import _ from "lodash";
import AppNoData from "../../../components/AppNoData";
import moment from "moment";
import { formatDate } from "../../../helper/Utils";
import AppLoading from "../../../components/AppLoading";

const rosterType: IRosterHookProps["rosterType"] = "secondary";
function PublishRoster() {
  const {
    goToRosterEdit,
    storeSecondaryJobs,
    onChangeSelectedJobType,
    selectedJobType,
    getStoreSecondaryJobs,
    selectedYear,
    selectedMonth,
    onChangeYear,
    onChangeMonth,
    monthSummary,
    onChangeWeek,
    onPublishRoster,
    onCloneWeekModalOpen,
    isPublishedRosterModalOpen,
    onPublishedRosterModalClose,
    getPayrollConfig,
    payrollConfig,
    isEmpExceedingHoursListModalOpen,
    onEmpExceedingHoursListModalClose,
    empExceedingHoursList,
    empWeeklyExceedingHoursList,
    empDailyExceedingHoursList,
    isForceConfirmModalOpen,
    onForceConfirmModalClose,
    messageObj,
    isWeekUncoveredShiftsModalOpen,
    onWeekUncoveredShiftsModalClose,
    weekUncoveredShifts,
    isPublishing,
    globalNotifyTo,
    setGlobalNotifyTo,
  } = useRoster({
    viewMode: "LATEST",
    mode: "summary",
    rosterType,
  });
  const { user, selectedCostCenterName, roles } = useAppSelector(
    (state) => state.auth
  );
  const [visibleSecondaryJobs, setVisibleSecondaryJobs] = useState<string[]>(
    []
  );
  useEffect(() => {
    getStoreSecondaryJobs();
    getPayrollConfig();
  }, []);
  useEffect(() => {
    if (
      user?.userRoles &&
      roles?.length &&
      storeSecondaryJobs?.length &&
      selectedCostCenterName
    ) {
      getVisibleSecondaryJobs();
    }
  }, [user, roles, selectedCostCenterName, storeSecondaryJobs]);
  const getVisibleSecondaryJobs = () => {
    if (
      user?.userRoles &&
      roles?.length &&
      storeSecondaryJobs?.length &&
      selectedCostCenterName
    ) {
      let tempVisibleSecondaryJobs: string[] = [];
      const jobs = SECONDARY_JOBS_CONFIG.filter(
        ({ jobType }) =>
          storeSecondaryJobs.findIndex((obj) => obj.jobType === jobType) >= 0
      );
      jobs.forEach(({ edit, jobType }) => {
        user.userRoles[selectedCostCenterName].forEach((id) => {
          if (edit.includes(roles.filter((obj) => obj.id === id)[0].title)) {
            tempVisibleSecondaryJobs.push(jobType);
          }
        });
      });
      setVisibleSecondaryJobs(_.uniq(tempVisibleSecondaryJobs));
    }
  };
  useEffect(() => {
    if (visibleSecondaryJobs?.length) {
      if (
        visibleSecondaryJobs.findIndex(
          (jobType) => jobType === selectedJobType
        ) === -1
      ) {
        onChangeSelectedJobType(visibleSecondaryJobs[0]);
      }
    }
  }, [visibleSecondaryJobs]);
  const isRosterAboutToFreeze = () => {
    let visible = false;
    if (payrollConfig) {
      const today = moment();
      const currentPEndDateTime = moment(payrollConfig.currentPEndDateTime);
      if (
        currentPEndDateTime.year() === currentPEndDateTime.year() &&
        currentPEndDateTime.month() === currentPEndDateTime.month() &&
        currentPEndDateTime.date() === currentPEndDateTime.date() &&
        currentPEndDateTime.diff(today, "hour") <= 3
      ) {
        visible = true;
      }
    }
    return visible;
  };
  return (
    <AppContainer
      heading="Secondary | Publish Roster"
      info="Publish roster to make them live & notify relevant employees about their assigned shifts."
    >
      {visibleSecondaryJobs?.length ? (
        <>
          <AppTabs
            setValue={(value) => {
              onChangeSelectedJobType(value);
            }}
            value={selectedJobType ?? ""}
            tabs={visibleSecondaryJobs.map((jobType) => ({
              name: jobType,
              value: jobType,
            }))}
          ></AppTabs>
          {payrollConfig && isRosterAboutToFreeze() ? (
            <Flex width={"full"}>
              <Text
                width={"full"}
                background={"#fff7d6"}
                color={"#907400"}
                fontSize={"xs"}
                px={"4"}
                py={"2"}
                rounded={"md"}
                textAlign={"center"}
                mb={"4"}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: `<strong>Note:</strong> Ensure to publish changes made between <strong>${formatDate(
                      payrollConfig.currentPStartDateTime
                    )}</strong> and <strong>${formatDate(
                      payrollConfig.currentPEndDateTime
                    )}</strong> by publishing respective months. After <strong>${formatDate(
                      payrollConfig.currentPEndDateTime,
                      {
                        time: true,
                      }
                    )}</strong> any unpublished changes will be discarded and not considered for Payroll Processing.`,
                  }}
                ></span>
              </Text>
            </Flex>
          ) : null}
          <Flex direction={"column"}>
            <Flex>
              {storeSecondaryJobs?.length &&
              selectedYear &&
              selectedMonth !== undefined &&
              monthSummary?.length ? (
                <MonthsView
                  monthSummary={monthSummary}
                  onChangeMonth={onChangeMonth}
                  onChangeYear={onChangeYear}
                />
              ) : null}
              {monthSummary?.length && selectedMonth !== undefined ? (
                <MonthsSummary
                  monthSummary={monthSummary}
                  goToRosterEdit={goToRosterEdit}
                  onChangeWeek={onChangeWeek}
                  onCloneWeekModalOpen={onCloneWeekModalOpen}
                  onPublishRoster={onPublishRoster}
                  isPublishedRosterModalOpen={isPublishedRosterModalOpen}
                  onPublishedRosterModalClose={onPublishedRosterModalClose}
                  rosterType={rosterType}
                  payrollConfig={payrollConfig}
                  empExceedingHoursList={empExceedingHoursList}
                  empWeeklyExceedingHoursList={empWeeklyExceedingHoursList}
                  empDailyExceedingHoursList={empDailyExceedingHoursList}
                  isEmpExceedingHoursListModalOpen={
                    isEmpExceedingHoursListModalOpen
                  }
                  onEmpExceedingHoursListModalClose={
                    onEmpExceedingHoursListModalClose
                  }
                  isForceConfirmModalOpen={isForceConfirmModalOpen}
                  onForceConfirmModalClose={onForceConfirmModalClose}
                  messageObj={messageObj}
                  isWeekUncoveredShiftsModalOpen={
                    isWeekUncoveredShiftsModalOpen
                  }
                  onWeekUncoveredShiftsModalClose={
                    onWeekUncoveredShiftsModalClose
                  }
                  weekUncoveredShifts={weekUncoveredShifts}
                  globalNotifyTo={globalNotifyTo}
                  setGlobalNotifyTo={setGlobalNotifyTo}
                />
              ) : null}
            </Flex>
            <RosterStatusLegend />
          </Flex>
        </>
      ) : (
        <AppNoData msg="Sorry, but it seems you are not the member/leader of any secondary roster. This action requires secondary roster membership/leadership privileges." />
      )}
      {isPublishing ? <AppLoading message="Validating Rosters..." /> : null}
    </AppContainer>
  );
}

export default PublishRoster;
