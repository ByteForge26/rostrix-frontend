import { Button } from "@chakra-ui/react";
import _ from "lodash";
import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { useAppSelector } from "../../../app/store/store";
import AppContainer from "../../../components/AppContainer";
import AppNoData from "../../../components/AppNoData";
import AppTabs from "../../../components/AppTabs";
import { GLOBAL_VIEW_ROLES } from "../../../helper/Constant";
import { useRoster } from "../../../hooks/useRoster";
import CloneRoster from "../common/CloneRoster";
import ManageRosterWrapper from "../common/ManageRosterWrapper";

const rosterType = "primary";
function ManageRoster() {
  const {
    goToRosterEdit,
    onCreateRosterClick,
    selectedYear,
    onChangeYear,
    weeks,
    onChangeWeek,
    roster,
    shifts,
    onCloneWeekModalClose,
    cloneWeekId,
    setCloneWeekId,
    onStartFreshRoster,
    onCloneWeek,
    getEmployeeCluster,
    getAllClusters,
    clusters,
    userClustersInfo,
    selectedClusterId,
    onChangeSelectedClusterId,
    miscWorks,
    getPayrollConfig,
    payrollConfig,
    recommendedHours,
  } = useRoster({
    viewMode: "LATEST",
    mode: "view",
    rosterType,
  });
  const { selectedWeek, isCloneWeekModalOpen } = useAppSelector(
    (state) => state.roster
  );
  const { user, selectedCostCenterName, roles } = useAppSelector(
    (state) => state.auth
  );
  useEffect(() => {
    getEmployeeCluster();
    getAllClusters();
    getPayrollConfig();
  }, []);

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
  const [visibleClusters, setVisibleClusters] = useState<number[]>([]);
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
      heading="Layout | Create/Edit Roster"
      info="Create customized rosters for employees."
    >
      {visibleClusters?.length ? (
        <>
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
          >
            {selectedWeek &&
            roster &&
            roster.rosterWeekId &&
            roster.empWeekRosters &&
            roster.empWeekRosters.length ? (
              <Button
                leftIcon={<FiEdit />}
                onClick={() => goToRosterEdit(selectedWeek)}
              >
                Edit Roster
              </Button>
            ) : null}
          </AppTabs>
          <ManageRosterWrapper
            rosterType={rosterType}
            miscWorks={miscWorks}
            onChangeWeek={onChangeWeek}
            onChangeYear={onChangeYear}
            onCreateRosterClick={onCreateRosterClick}
            payrollConfig={payrollConfig}
            shifts={shifts}
            weeks={weeks}
            recommendedHours={recommendedHours}
            roster={roster}
            selectedWeek={selectedWeek}
            selectedYear={selectedYear}
          />
        </>
      ) : (
        <AppNoData msg="Sorry, but it seems you are not the leader of any cluster. This action requires cluster leadership privileges." />
      )}
      <CloneRoster
        cloneWeekId={cloneWeekId}
        onCloneWeek={onCloneWeek}
        onCloneWeekModalClose={onCloneWeekModalClose}
        onStartFreshRoster={onStartFreshRoster}
        selectedWeek={selectedWeek}
        setCloneWeekId={setCloneWeekId}
        weeks={weeks}
        isCloneWeekModalOpen={isCloneWeekModalOpen}
      />
    </AppContainer>
  );
}

export default ManageRoster;
