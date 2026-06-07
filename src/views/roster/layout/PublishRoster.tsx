import { useEffect, useState } from "react";
import AppContainer from "../../../components/AppContainer";
import AppTabs from "../../../components/AppTabs";
import { Flex, Text } from "@chakra-ui/react";
import { useRoster } from "../../../hooks/useRoster";
import MonthsView from "../common/MonthsView";
import MonthsSummary from "../common/MonthsSummary";
import RosterStatusLegend from "../common/RosterStatusLegend";
import { IRosterHookProps } from "../../../helper/Interface";
import { useAppSelector } from "../../../app/store/store";
import _ from "lodash";
import moment from "moment";
import { formatDate, isRosterAboutToFreeze } from "../../../helper/Utils";
import { GLOBAL_VIEW_ROLES } from "../../../helper/Constant";
import AppLoading from "../../../components/AppLoading";

const rosterType: IRosterHookProps["rosterType"] = "primary";
function PublishRoster() {
  const {
    goToRosterEdit,
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
    getAllClusters,
    clusters,
    selectedClusterId,
    onChangeSelectedClusterId,
    userClustersInfo,
    getEmployeeCluster,
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
  useEffect(() => {
    getEmployeeCluster();
    getAllClusters();
    getPayrollConfig();
  }, []);
  const [visibleClusters, setVisibleClusters] = useState<number[]>([]);
  useEffect(() => {
    if (
      user?.userRoles &&
      roles?.length &&
      clusters?.length &&
      selectedCostCenterName &&
      userClustersInfo
    ) {
      getVisibleClusters();
    }
  }, [user, roles, selectedCostCenterName, userClustersInfo, clusters]);
  const getVisibleClusters = () => {
    setVisibleClusters([]);
    if (
      user?.userRoles &&
      roles?.length &&
      clusters?.length &&
      selectedCostCenterName &&
      userClustersInfo
    ) {
      let tempVisibleClusters: number[] = [];

      if (userClustersInfo?.memberOfClusters?.length) {
        userClustersInfo.memberOfClusters.forEach((clusterId) => {
          if (
            clusters.findIndex(
              ({ id, editable }) => editable && id === clusterId
            ) >= 0
          ) {
            tempVisibleClusters.push(clusterId);
          }
        });
      }
      if (userClustersInfo?.leaderOfClusters?.length) {
        userClustersInfo.leaderOfClusters.forEach((clusterId) => {
          if (
            clusters.findIndex(
              ({ id, editable }) => editable && id === clusterId
            ) >= 0
          ) {
            tempVisibleClusters.push(clusterId);
          }
        });
      }
      user.userRoles[selectedCostCenterName].forEach((id) => {
        if (
          roles.filter((obj) => obj.id === id).length &&
          GLOBAL_VIEW_ROLES.includes(
            roles.filter((obj) => obj.id === id)[0].title
          )
        ) {
          tempVisibleClusters = [
            ...tempVisibleClusters,
            ...clusters.filter(({ editable }) => editable).map(({ id }) => id),
          ];
        }
      });

      setVisibleClusters(_.uniq(tempVisibleClusters));
    }
  };
  useEffect(() => {
    if (visibleClusters?.length) {
      if (visibleClusters.findIndex((id) => id === selectedClusterId) === -1) {
        onChangeSelectedClusterId(visibleClusters[0]);
      }
    }
  }, [visibleClusters]);

  return (
    <AppContainer
      heading="Layout | Publish Roster"
      info="Publish roster to make them live & notify relevant employees about their assigned shifts."
    >
      {visibleClusters?.length ? (
        <AppTabs
          setValue={(value) => {
            onChangeSelectedClusterId(Number(value));
          }}
          value={selectedClusterId ? selectedClusterId.toString() : ""}
          tabs={visibleClusters.map((value) => ({
            name: clusters?.length
              ? clusters.find(({ id }) => id === value)?.name ?? ""
              : "",
            value: value.toString(),
          }))}
        ></AppTabs>
      ) : null}
      {payrollConfig && isRosterAboutToFreeze({ payrollConfig }) ? (
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
          {clusters?.length &&
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
              isWeekUncoveredShiftsModalOpen={isWeekUncoveredShiftsModalOpen}
              onWeekUncoveredShiftsModalClose={onWeekUncoveredShiftsModalClose}
              weekUncoveredShifts={weekUncoveredShifts}
              globalNotifyTo={globalNotifyTo}
              setGlobalNotifyTo={setGlobalNotifyTo}
            />
          ) : null}
        </Flex>
        <RosterStatusLegend />
      </Flex>
      {isPublishing ? <AppLoading message="Validating Rosters..." /> : null}
    </AppContainer>
  );
}

export default PublishRoster;
