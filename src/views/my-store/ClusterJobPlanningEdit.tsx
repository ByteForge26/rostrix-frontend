import React, { useEffect } from "react";
import { useRoster } from "../../hooks/useRoster";
import {
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import CalenderTimeView from "../roster/common/CalenderTimeView";
import { NAV_HEIGHT, SECONDARY_JOBS_CONFIG } from "../../helper/Constant";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { useAppSelector } from "../../app/store/store";
import { BsInfoCircle } from "react-icons/bs";
import WeekStatus from "../roster/common/WeekStatus";
import moment from "moment";
import { isFutureWeek } from "../../helper/Utils";

let pollingInterval: any;

function ClusterJobPlanningEdit() {
  const {
    getPlannedJobs,
    plannedJobs,
    plannedJobTimes,
    cjpRoster,
    getAllClusters,
    clusters,
    onSaveShift,
    onCjpDraftDataSave,
    isRosterSaving,
    onCjpPublish,
    payrollConfig,
    getPayrollConfig,
  } = useRoster({
    mode: "edit",
    rosterType: "cjp",
    viewMode: "LATEST",
  });
  const navigate = useNavigate();
  const { selectedWeek, selectedPlannedJobId, cjpDraft, selectedYear } =
    useAppSelector((state) => state.roster);
  useEffect(() => {
    getPlannedJobs();
    getAllClusters();
    getPayrollConfig();
  }, []);
  useEffect(() => {
    pollingInterval = setInterval(() => {
      onCjpDraftDataSave({});
    }, 10000);
    return () => {
      onCjpDraftDataSave({});
      clearInterval(pollingInterval);
    };
  }, []);
  const getJobName = () => {
    const job = plannedJobs?.length
      ? plannedJobs.find(({ id }) => id === selectedPlannedJobId)
      : undefined;

    return job
      ? job.miscWorkJobName
        ? job.miscWorkJobName
        : SECONDARY_JOBS_CONFIG.find(
            (obj) => obj.jobType === job.secondaryJobType
          )?.label || job.secondaryJobType
      : "";
  };
  return (
    <Flex flexDirection={"column"} width={"100%"} minHeight={"100vh"}>
      <Flex
        height={`${NAV_HEIGHT}px`}
        alignItems={"center"}
        borderBottom={"1px solid #d4d4d4"}
        width={"100%"}
        justifyContent={"space-between"}
        background={"white"}
        zIndex={11}
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

          <Text fontSize={"lg"}>
            {`${getJobName()}  |  Week ${selectedWeek}`}
          </Text>
          <WeekStatus rosterStatus={cjpRoster?.status} />

          {/* <Flex
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
          </Flex> */}
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
          {/* {cjpDraft?.length ? (
            <Button
              variant={"outline"}
              mr={3}
              onClick={() => onCjpDraftDataSave()}
            >
              Save
            </Button>
          ) : null} */}
          {selectedWeek &&
          selectedYear &&
          payrollConfig &&
          plannedJobs?.length &&
          isFutureWeek({
            currentPStartDateTime: payrollConfig.currentPStartDateTime,
            selectedWeek,
            selectedYear,
          }) ? (
            <Flex alignItems={"center"}>
              <Tooltip
                label="Upon publishing the roster, cluster leaders will be notified of the scheduled shifts. Any shifts that deviate from the planned schedule will be automatically removed."
                hasArrow
              >
                <Text mr={"2"}>
                  <BsInfoCircle />
                </Text>
              </Tooltip>
              <Menu>
                <MenuButton>
                  <Button background={"#359735"} mr={"4"}>
                    Publish
                  </Button>
                </MenuButton>
                <MenuList>
                  {[
                    {
                      label: "Just Publish",
                      value: "NONE",
                    },
                    {
                      label: "Publish & Notify All",
                      value: "ALL",
                    },
                    {
                      label: "Publish & Notify Concerned",
                      value: "CONCERNED",
                    },
                  ].map(({ label, value }) => (
                    <MenuItemOption
                      key={value}
                      onClick={() =>
                        onCjpPublish({ final: false, notifyTo: value })
                      }
                      fontSize={"sm"}
                    >
                      {label}
                    </MenuItemOption>
                  ))}
                </MenuList>
              </Menu>
            </Flex>
          ) : null}
        </Flex>
      </Flex>
      <Flex pt={"2"}>
        <CalenderTimeView
          days={cjpRoster?.days || []}
          plannedJobTimes={plannedJobTimes}
          contentMaxHeight={"calc(100vh - 142px)"}
          clusters={clusters}
          edit={true}
          onSaveShift={onSaveShift}
        />
      </Flex>
    </Flex>
  );
}

export default ClusterJobPlanningEdit;
