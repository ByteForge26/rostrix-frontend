import _ from "lodash";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../app/store/store";
import AppContainer from "../../../components/AppContainer";
import AppNoData from "../../../components/AppNoData";
import AppTabs from "../../../components/AppTabs";
import { SECONDARY_JOBS_CONFIG } from "../../../helper/Constant";
import { useRoster } from "../../../hooks/useRoster";
import ShiftSwap from "../common/ShiftSwap";
import ViewPublishedRosterWrapper from "../common/ViewPublishedRosterWrapper";

const rosterType = "secondary";
function ViewPublishedRoster() {
  const {
    storeSecondaryJobs,
    roster,
    getStoreSecondaryJobs,
    selectedJobType,
    onChangeSelectedJobType,
    selectedYear,
    onChangeYear,
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
  const [visibleSecondaryJobs, setVisibleSecondaryJobs] = useState<string[]>(
    []
  );
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
  useEffect(() => {
    getStoreSecondaryJobs();
  }, []);
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
      jobs.forEach(({ view, jobType }) => {
        user.userRoles[selectedCostCenterName].forEach((id) => {
          const title = roles.filter((obj) => obj.id === id).length
            ? roles.filter((obj) => obj.id === id)[0].title
            : "";
          if (title && view.includes(title)) {
            tempVisibleSecondaryJobs.push(jobType);
          }
        });
      });
      setVisibleSecondaryJobs(_.uniq(tempVisibleSecondaryJobs));
    }
  };
  useEffect(() => {
    onChangeSelectedDay("");
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

  return (
    <AppContainer
      heading="Secondary | View Published Roster"
      info="Access/review live roster for secondary jobs."
    >
      {visibleSecondaryJobs.length ? (
        <>
          <AppTabs
            setValue={onChangeSelectedJobType}
            value={selectedJobType ?? ""}
            tabs={visibleSecondaryJobs.map((jobType) => ({
              name: jobType,
              value: jobType,
            }))}
          >
            <ShiftSwap roster={roster} miscWorks={miscWorks} />
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
        <AppNoData msg="Sorry, but it seems you are not the member/leader of any secondary roster. This action requires secondary roster membership/leadership privileges." />
      )}
    </AppContainer>
  );
}

export default ViewPublishedRoster;
