import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import AppTabs from "../../components/AppTabs";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useBoolean,
  useDisclosure,
} from "@chakra-ui/react";
import { useApi } from "../../hooks/useApi";
import { ENDPOINT } from "../../config/endpoint.config";
import AppSelect from "../../components/AppSelect";
import { COLORS, SECONDARY_JOBS_CONFIG } from "../../helper/Constant";
import { useToasts } from "react-toast-notifications";
import {
  IApiResponse,
  IPlannedJob,
  IStorePlannedJob,
} from "../../helper/Interface";
import { useAppSelector } from "../../app/store/store";
import { noCJPConfig, SECONDARY_JOBS_ICONS } from "../../helper/Images";
import { AiFillDelete } from "react-icons/ai";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSION } from "../../config/permission.config";

function ClusterJobConfiguration() {
  const { checkForPermission } = usePermission();
  const { get, post, put } = useApi();
  const { addToast } = useToasts();
  const { selectedCostCenterName } = useAppSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState("Cluster Jobs");
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [isDeleting, { on: onDeleting, off: offDeleting }] = useBoolean(false);

  const [allPlannedJobs, setAllPlannedJobs] = useState<IPlannedJob[]>([]);
  const [plannedJobs, setPlannedJobs] = useState<IStorePlannedJob[]>([]);
  const {
    isOpen: isEnablePlannedJobOpen,
    onOpen: onEnablePlannedJobOpen,
    onClose: onEnablePlannedJobClose,
  } = useDisclosure();
  const {
    isOpen: isDisablePlannedJobOpen,
    onOpen: onDisablePlannedJobOpen,
    onClose: onDisablePlannedJobClose,
  } = useDisclosure();
  const [configId, setConfigId] = useState<number>();
  const [clusterPlannedJobIds, setClusterPlannedJobIds] = useState<number[]>(
    []
  );
  useEffect(() => {
    if (tabValue) {
      getPlannedJobs();
    }
  }, [tabValue]);
  const getPlannedJobs = async () => {
    onLoading();
    const res = await get<IStorePlannedJob[]>(
      ENDPOINT["/cluster-planned-jobs"]["/store"]
    );
    offLoading();
    if (res?.length) {
      setPlannedJobs(res.filter(({ disabled }) => !disabled));
    } else {
      setPlannedJobs([]);
    }
  };
  useEffect(() => {
    if (isEnablePlannedJobOpen) {
      setClusterPlannedJobIds([]);
      getAllClusterPlannedJobs();
    }
  }, [isEnablePlannedJobOpen]);
  const getAllClusterPlannedJobs = async () => {
    const res = await get<IPlannedJob[]>(
      ENDPOINT["/cluster-planned-jobs"]["/"]
    );
    if (res?.length) {
      setAllPlannedJobs(res);
    } else {
      setAllPlannedJobs([]);
    }
  };

  const onAddConfig = () => {
    onEnablePlannedJobOpen();
  };
  const onSaveClusterPlannedJobs = () => {
    onEnablePlannedJobClose();
    post<IApiResponse>(ENDPOINT["/cluster-planned-jobs"]["/store"], {
      data: {
        costCentre: selectedCostCenterName,
        jobIds: clusterPlannedJobIds,
      },
    }).then((res) => {
      if (res?.success) {
        getPlannedJobs();
      }
      addToast(res.message, {
        appearance: res.success ? "success" : "error",
      });
    });
  };
  const onDeleteClusterPlannedJob = () => {
    if (configId) {
      onDeleting();
      put<IApiResponse>(
        ENDPOINT["/cluster-planned-jobs"]["/store/disable"] + `/${configId}`
      )
        .then((res) => {
          if (res.success) {
            addToast(res.message, {
              appearance: "success",
            });
            getPlannedJobs();
          } else {
            addToast(res.message, {
              appearance: "error",
            });
          }
        })
        .finally(() => {
          onDisablePlannedJobClose();
          offDeleting();
        });
    }
  };
  return (
    <AppContainer
      heading="Planned Cluster Job Configuration"
      info="This page lets you enable or disable jobs that require planning. Enabled jobs can then be scheduled by leaders, who assign shifts to different clusters."
    >
      {checkForPermission(
        PERMISSION["My Store"]["Cluster Job Configuration"].Update
      ) ? (
        <AppTabs setValue={setTabValue} value={tabValue} tabs={[]}>
          <Button onClick={onAddConfig}>+ Add Config</Button>
        </AppTabs>
      ) : null}

      <Flex overflow={"auto"}>
        {plannedJobs?.length ? (
          <Grid
            gridTemplateColumns={"1fr 1fr 1fr"}
            width={"full"}
            gap={"4"}
            p={"2"}
          >
            {plannedJobs.map(
              ({ secondaryJobType, id, miscWorkId, miscWorkJobName }, i) => {
                return (
                  <Flex
                    background={
                      COLORS[
                        (miscWorkId
                          ? miscWorkId
                          : SECONDARY_JOBS_CONFIG.findIndex(
                              (obj) => obj.jobType === secondaryJobType
                            ) % COLORS.length) % COLORS.length
                      ]
                    }
                    key={id}
                    p={"4"}
                    rounded={"lg"}
                    border={"1px solid #e7e7e7 "}
                    direction={"column"}
                    transition={"0.3s"}
                    _hover={{
                      boxShadow: "0 0 4px 0 lightgray",
                    }}
                  >
                    <Flex
                      alignItems={"center"}
                      justifyContent={"space-between"}
                      width={"full"}
                      pl={"2"}
                    >
                      <Flex alignItems={"center"}>
                        <Flex
                          style={{
                            height: "72px",
                            width: "72px",
                            objectFit: "cover",
                          }}
                          alignItems={"center"}
                        >
                          <img
                            src={
                              miscWorkId
                                ? SECONDARY_JOBS_ICONS["NA"]
                                : SECONDARY_JOBS_ICONS[secondaryJobType]
                            }
                            alt=""
                          />
                        </Flex>
                        <Flex direction={"column"} ml={"4"}>
                          <Flex alignItems={"center"}>
                            <Text fontSize={"lg"} fontWeight={"medium"}>
                              {miscWorkId
                                ? miscWorkJobName || miscWorkId
                                : SECONDARY_JOBS_CONFIG.find(
                                    (obj) => obj.jobType === secondaryJobType
                                  )?.label ?? secondaryJobType}
                            </Text>
                          </Flex>
                        </Flex>
                      </Flex>
                      {checkForPermission(
                        PERMISSION["My Store"]["Cluster Job Configuration"]
                          .Update
                      ) ? (
                        <Flex>
                          <IconButton
                            aria-label="Disable Button"
                            size={"sm"}
                            variant={"ghost"}
                            colorScheme="red"
                            onClick={() => {
                              setConfigId(id);
                              onDisablePlannedJobOpen();
                            }}
                          >
                            <AiFillDelete />
                          </IconButton>
                        </Flex>
                      ) : null}
                    </Flex>
                  </Flex>
                );
              }
            )}
          </Grid>
        ) : isLoading ? (
          <AppLoader />
        ) : (
          <AppNoData image={noCJPConfig} />
        )}
      </Flex>
      <Modal isOpen={isEnablePlannedJobOpen} onClose={onEnablePlannedJobClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Cluster Planned Jobs</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Cluster Planned Job</FormLabel>
              <AppSelect
                isMulti
                value={clusterPlannedJobIds}
                onChange={(value) => setClusterPlannedJobIds(value)}
                options={
                  allPlannedJobs?.length
                    ? allPlannedJobs
                        .filter(({ jobType, miscWorkId }) => {
                          if (miscWorkId) {
                            if (
                              plannedJobs?.length &&
                              plannedJobs.findIndex(
                                (obj) => obj.miscWorkId === miscWorkId
                              ) >= 0
                            ) {
                              return false;
                            }
                            return true;
                          } else {
                            if (
                              plannedJobs?.length &&
                              plannedJobs.findIndex(
                                (obj) => obj.secondaryJobType === jobType
                              ) >= 0
                            ) {
                              return false;
                            }
                            return true;
                          }
                        })
                        .map(
                          ({
                            type,
                            id,
                            jobType,
                            miscWorkId,
                            miscWorkJobName,
                          }) => ({
                            label: miscWorkId
                              ? miscWorkJobName
                              : SECONDARY_JOBS_CONFIG.find(
                                  (obj) => obj.jobType === jobType
                                )?.label ?? jobType,
                            value: id,
                          })
                        )
                    : []
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onEnablePlannedJobClose}
            >
              Close
            </Button>
            <Button
              onClick={onSaveClusterPlannedJobs}
              isDisabled={clusterPlannedJobIds.length === 0}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isDisablePlannedJobOpen}
        onClose={onDisablePlannedJobClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Disable Cluster Planned Job</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to Disable Cluster Planned Job?</Text>

            <Text
              mt={"2"}
              background={"#fff7d6"}
              color={"#907400"}
              fontSize={"xs"}
              p={"2"}
              rounded={"md"}
              textAlign={"center"}
              mb={"2"}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    "<strong>Note:</strong> Disabling this job will remove all planned shifts from tomorrow onwards and remove the respective assigned shifts in the cluster as well as in the assigned plan. Please ensure you make an informed decision before proceeding.",
                }}
              ></span>
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onDisablePlannedJobClose}
            >
              Close
            </Button>
            <Button
              colorScheme="red"
              variant={"solid"}
              fontSize={"sm"}
              onClick={() => onDeleteClusterPlannedJob()}
            >
              {isDeleting ? <Spinner /> : "Disable"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppContainer>
  );
}

export default ClusterJobConfiguration;
