import _ from "lodash";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../app/store/store";
import AppContainer from "../../../components/AppContainer";
import AppNoData from "../../../components/AppNoData";
import AppTabs from "../../../components/AppTabs";
import { GLOBAL_VIEW_ROLES } from "../../../helper/Constant";
import { useRoster } from "../../../hooks/useRoster";
import ShiftSwap from "../common/ShiftSwap";
import ViewPublishedRosterWrapper from "../common/ViewPublishedRosterWrapper";

const rosterType = "primary";
function ViewPublishedRoster() {
  const {
    roster,
    onChangeSelectedClusterId,
    getEmployeeCluster,
    getAllClusters,
    userClustersInfo,
    clusters,
    selectedClusterId,
    selectedYear,
    onChangeYear,
    years,
    weeks,
    onChangeWeek,
    shifts,
    miscWorks,
    onChangeSelectedDay,
    recommendedHours,
  } = useRoster({
    viewMode: "PUBLISHED",
    mode: "view",
    rosterType,
  });

  const { user, selectedCostCenterName, roles } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    getEmployeeCluster();
    getAllClusters();
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
    onChangeSelectedDay("");
    if (visibleClusters?.length) {
      if (visibleClusters.findIndex((id) => id === selectedClusterId) === -1) {
        onChangeSelectedClusterId(visibleClusters[0]);
      }
    }
  }, [visibleClusters]);

  return (
    <AppContainer
      heading="Layout | View Published Roster"
      info="Access/review live roster."
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
            <ShiftSwap miscWorks={miscWorks} roster={roster} />
          </AppTabs>
          <ViewPublishedRosterWrapper
            rosterType={rosterType}
            miscWorks={miscWorks}
            onChangeSelectedDay={onChangeSelectedDay}
            onChangeWeek={onChangeWeek}
            onChangeYear={onChangeYear}
            shifts={shifts}
            weeks={weeks}
            recommendedHours={recommendedHours}
            roster={roster}
            selectedYear={selectedYear}
          />
        </>
      ) : (
        <AppNoData msg="Sorry, but it seems you are not the member of any cluster. This action requires cluster membership privileges." />
      )}
    </AppContainer>
  );
}

export default ViewPublishedRoster;
