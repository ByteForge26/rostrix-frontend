import { Button } from "@chakra-ui/react";
import _ from "lodash";
import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { useAppSelector } from "../../../app/store/store";
import AppContainer from "../../../components/AppContainer";
import AppNoData from "../../../components/AppNoData";
import AppTabs from "../../../components/AppTabs";
import { PERMISSION } from "../../../config/permission.config";
import { SECONDARY_JOBS_CONFIG } from "../../../helper/Constant";
import { usePermission } from "../../../hooks/usePermission";
import { useRoster } from "../../../hooks/useRoster";
import CloneRoster from "../common/CloneRoster";
import ManageRosterWrapper from "../common/ManageRosterWrapper";

const rosterType = "secondary";
function ManageRoster() {
  const { checkForPermission } = usePermission();
  const {
    goToRosterEdit,
    onCreateRosterClick,
    selectedYear,
    onChangeYear,
    weeks,
    storeSecondaryJobs,
    onChangeWeek,
    roster,
    shifts,
    miscWorks,
    getStoreSecondaryJobs,
    onCloneWeekModalClose,
    cloneWeekId,
    setCloneWeekId,
    onStartFreshRoster,
    onCloneWeek,
    onChangeSelectedJobType,
    selectedJobType,
    getPayrollConfig,
    payrollConfig,
    recommendedHours,
  } = useRoster({
    viewMode: "LATEST",
    mode: "view",
    rosterType,
  });
  const { user, selectedCostCenterName, roles } = useAppSelector(
    (state) => state.auth
  );
  const { selectedWeek, isCloneWeekModalOpen } = useAppSelector(
    (state) => state.roster
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

  return (
    <AppContainer
      heading="Secondary | Create/Edit Roster"
      info="Create customized rosters for employees with secondary roles such as DM, CRM."
    >
      {visibleSecondaryJobs?.length ? (
        <>
          <AppTabs
            setValue={onChangeSelectedJobType}
            value={selectedJobType ?? ""}
            tabs={visibleSecondaryJobs.map((jobType) => ({
              name: jobType,
              value: jobType,
            }))}
          >
            {checkForPermission(
              PERMISSION["Secondary Roster"]["Manage Roster"]["Update"]
            ) &&
            selectedWeek &&
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
        <AppNoData msg="Sorry, but it seems you are not the member/leader of any secondary roster. This action requires secondary roster membership/leadership privileges." />
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
