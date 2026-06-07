import { Button, Flex, Text, useDisclosure } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { useAppSelector } from "../../app/store/store";
import AppContainer from "../../components/AppContainer";
import AppTabs from "../../components/AppTabs";
import { PERMISSION } from "../../config/permission.config";
import { SECONDARY_JOBS_CONFIG } from "../../helper/Constant";
import { noCJPData } from "../../helper/Images";
import { IRosterHookProps } from "../../helper/Interface";
import {
  formatDate,
  isFutureWeek,
  isRosterAboutToFreeze,
} from "../../helper/Utils";
import { usePermission } from "../../hooks/usePermission";
import { useRoster } from "../../hooks/useRoster";
import AllWeeksView from "../roster/common/AllWeeksView";
import CalenderTimeView from "../roster/common/CalenderTimeView";
import WeekChanger from "../roster/common/WeekChanger";

const VIEW_MODES = [
  {
    name: "Latest Plan",
    value: "LATEST",
    index: 0,
  },
  {
    name: "Published Plan",
    value: "PUBLISHED",
    index: 1,
  },
];

function ClusterJobPlanning() {
  const { checkForPermission } = usePermission();
  const [viewMode, setViewMode] = useState(
    VIEW_MODES[
      checkForPermission(PERMISSION["My Store"]["Cluster Job Planning"].Update)
        ? 0
        : 1
    ].value
  );
  const {
    weeks,
    years,
    getPlannedJobs,
    onChangeWeek,
    onChangeYear,
    plannedJobs,
    onChangeSelectedPlannedJobId,
    onChangeSelectedPlannedJobType,
    onChangeSelectedPlannedSecondaryJobType,
    onChangeSelectedPlannedMiscWorkId,
    goToPlannedJobEdit,
    // plannedJobDays,
    plannedJobTimes,
    getPlannedJobWeeks,
    plannedJobWeeks,
    cjpRoster,
    cjpRosterWeekId,
    payrollConfig,
    getPayrollConfig,
    onCreateCJPRosterClick,
    getAllClusters,
    clusters,
  } = useRoster({
    mode: "view",
    rosterType: "cjp",
    viewMode: viewMode as IRosterHookProps["viewMode"],
  });
  const {
    selectedWeek,
    selectedPlannedJobId,
    selectedYear,
    selectedPlannedJobType,
    selectedPlannedSecondaryJobType,
    selectedPlannedMiscWorkId,
  } = useAppSelector((state) => state.roster);

  const {
    isOpen: isAllWeeksOpen,
    onOpen: onAllWeeksOpen,
    onClose: onAllWeeksClose,
  } = useDisclosure();
  useEffect(() => {
    getPlannedJobs();
    getPayrollConfig();
    getAllClusters();
  }, []);

  useEffect(() => {
    if (
      selectedPlannedJobType &&
      isAllWeeksOpen &&
      selectedYear &&
      (selectedPlannedSecondaryJobType || selectedPlannedMiscWorkId)
    ) {
      getPlannedJobWeeks();
    }
  }, [
    selectedPlannedJobType,
    isAllWeeksOpen,
    selectedYear,
    selectedPlannedSecondaryJobType,
    selectedPlannedMiscWorkId,
  ]);

  useEffect(() => {
    if (plannedJobs?.length) {
      if (
        plannedJobs.findIndex(({ id }) => id === selectedPlannedJobId) === -1
      ) {
        const job = plannedJobs[0];
        if (job) {
          onChangeSelectedPlannedJobId(job.id);
          onChangeSelectedPlannedJobType(job.type);
          if (job.type === "MISCELLANEOUS") {
            onChangeSelectedPlannedSecondaryJobType("");
            if (job.miscWorkId)
              onChangeSelectedPlannedMiscWorkId(job.miscWorkId);
          } else {
            onChangeSelectedPlannedSecondaryJobType(job.secondaryJobType);
            onChangeSelectedPlannedMiscWorkId(0);
          }
        }
      }
    }
  }, [plannedJobs]);
  return (
    <AppContainer
      heading="Cluster Job Planning"
      info="This section allows you to assign and plan job responsibilities among Layout teammates for roles that don't have a dedicated team. You can organize weekly schedules by assigning shifts to clusters, and cluster leaders will then allocate shifts to their employees based on your planned timings."
    >
      <Flex overflow={"auto"} direction={"column"}>
        {plannedJobs?.length ? (
          <AppTabs
            setValue={(value) => {
              onChangeSelectedPlannedJobId(Number(value));
              let job = plannedJobs.length
                ? plannedJobs.find(({ id }) => id === Number(value))
                : undefined;

              if (job) {
                onChangeSelectedPlannedJobType(job.type);
                if (job.type === "MISCELLANEOUS") {
                  onChangeSelectedPlannedSecondaryJobType("");
                  if (job.miscWorkId)
                    onChangeSelectedPlannedMiscWorkId(job.miscWorkId);
                } else {
                  onChangeSelectedPlannedSecondaryJobType(job.secondaryJobType);
                  onChangeSelectedPlannedMiscWorkId(0);
                }
              }
            }}
            value={selectedPlannedJobId ? selectedPlannedJobId.toString() : ""}
            tabs={plannedJobs
              .filter(({ id }) => id)
              .map((job) => {
                return {
                  name: job
                    ? job.miscWorkJobName
                      ? job.miscWorkJobName
                      : SECONDARY_JOBS_CONFIG.find(
                          (obj) => obj.jobType === job.secondaryJobType
                        )?.label || job.secondaryJobType
                    : "",
                  value: job.id.toString(),
                  alertInfo: job.disabled
                    ? "Job is disabled by the store leader for planning"
                    : undefined,
                };
              })}
          >
            <Flex alignItems={"center"}>
              {selectedWeek &&
              cjpRoster &&
              cjpRoster.pweekId &&
              viewMode === VIEW_MODES[0].value &&
              checkForPermission(
                PERMISSION["My Store"]["Cluster Job Planning"].Update
              ) ? (
                <Button
                  mr={"4"}
                  leftIcon={<FiEdit />}
                  onClick={() => goToPlannedJobEdit(selectedWeek)}
                >
                  Edit Plan
                </Button>
              ) : null}
              {checkForPermission(
                PERMISSION["My Store"]["Cluster Job Planning"].Update
              ) ? (
                <AppTabs
                  tabs={VIEW_MODES}
                  value={viewMode}
                  setValue={(value) => setViewMode(value)}
                  mb="0"
                />
              ) : null}
            </Flex>
          </AppTabs>
        ) : null}

        <Flex width={"100%"} direction={"column"}>
          <Flex alignItems={"center"} width={"100%"}>
            {selectedWeek &&
            weeks?.length &&
            selectedYear &&
            plannedJobs?.length ? (
              <WeekChanger
                onChangeWeek={onChangeWeek}
                onChangeYear={onChangeYear}
                selectedWeek={selectedWeek}
                selectedYear={selectedYear}
                weeks={weeks}
                rosterStatus={cjpRoster?.status}
                isAllWeeksOpen={isAllWeeksOpen}
                onAllWeeksToggle={() =>
                  isAllWeeksOpen ? onAllWeeksClose() : onAllWeeksOpen()
                }
              />
            ) : null}
          </Flex>
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
                // mb={"4"}
                mt={"4"}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: `<strong>Note:</strong> Ensure to publish changes made between <strong>${formatDate(
                      payrollConfig.currentPStartDateTime
                    )}</strong> and <strong>${formatDate(
                      payrollConfig.currentPEndDateTime
                    )}</strong> by publishing respective weeks. After <strong>${formatDate(
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

          <Flex mt={"4"}>
            {cjpRoster?.pweekId ? (
              <CalenderTimeView
                days={cjpRoster?.days || []}
                plannedJobTimes={plannedJobTimes}
                contentMaxHeight={`calc(100vh - 278px - ${
                  payrollConfig && isRosterAboutToFreeze({ payrollConfig })
                    ? "68px"
                    : "0px"
                })`}
                clusters={clusters}
                edit={false}
              />
            ) : (
              <Flex
                width={"full"}
                minHeight={"400px"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Flex direction={"column"}>
                  <Flex>
                    <img
                      src={noCJPData}
                      alt=""
                      style={{
                        maxWidth: "280px",
                      }}
                    />
                  </Flex>

                  <Flex
                    direction={"column"}
                    textAlign={"center"}
                    maxWidth={"300px"}
                    pb={"4"}
                  >
                    {/* Oh Shift! Looks like no roster exists for this week. */}

                    {selectedWeek &&
                    selectedYear &&
                    payrollConfig &&
                    plannedJobs?.length &&
                    isFutureWeek({
                      currentPStartDateTime:
                        payrollConfig.currentPStartDateTime,
                      selectedWeek,
                      selectedYear,
                    }) ? (
                      <>
                        <Text fontWeight={"medium"} pb={"2"}>
                          {plannedJobs.find(
                            ({ id }) => id === selectedPlannedJobId
                          )?.disabled
                            ? "Uh Oh! Looks like someone doesn’t want this job to be planned anymore."
                            : "Oh Shift! Looks like you haven't scheduled anything yet!"}
                        </Text>
                        <Text fontSize={"xs"}>
                          {plannedJobs.find(
                            ({ id }) => id === selectedPlannedJobId
                          )?.disabled
                            ? "This job is disabled by the Store Leader for further planning. You can view previously planned weeks but cannot plan new ones."
                            : "This week’s plan is as empty as monday mornings before the first cup of coffee."}
                        </Text>
                        {viewMode === VIEW_MODES[0].value &&
                        plannedJobs.filter(
                          ({ id }) => id === selectedPlannedJobId
                        ).length &&
                        plannedJobs.find(
                          ({ id }) => id === selectedPlannedJobId
                        )?.disabled === false &&
                        checkForPermission(
                          PERMISSION["My Store"]["Cluster Job Planning"].Update
                        ) ? (
                          <Flex justifyContent={"center"} pt={"4"}>
                            <Button onClick={onCreateCJPRosterClick}>
                              + Create Plan
                            </Button>
                          </Flex>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <Text fontWeight={"medium"} pb={"2"}>
                          Oh Shift! Looks like no plan exists for this week.
                        </Text>
                        <Text fontSize={"xs"}>
                          You can not create a new Plan for past weeks.
                        </Text>
                      </>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            )}

            <AllWeeksView
              isAllWeeksOpen={isAllWeeksOpen}
              onAllWeeksClose={onAllWeeksClose}
              plannedJobWeeks={plannedJobWeeks}
              onChangeWeek={onChangeWeek}
              contentMaxHeight={`calc(100vh - 278px - ${
                payrollConfig && isRosterAboutToFreeze({ payrollConfig })
                  ? "68px"
                  : "0px"
              })`}
            />
          </Flex>
        </Flex>
      </Flex>
    </AppContainer>
  );
}

export default ClusterJobPlanning;
