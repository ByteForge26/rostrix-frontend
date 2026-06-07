import {
  Badge,
  Button,
  Flex,
  Grid,
  IconButton,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import { useApi } from "../../hooks/useApi";
import { ENDPOINT } from "../../config/endpoint.config";
import { IApiResponse, IMigration } from "../../helper/Interface";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import { FiRefreshCw } from "react-icons/fi";
import { useToasts } from "react-toast-notifications";
import { formatDate } from "../../helper/Utils";

const MAPING = [
  {
    name: "Users",
    value: "USERS",
  },
  {
    name: "Leave",
    value: "LEAVE",
  },
  {
    name: "Cost Centre",
    value: "COST_CENTRE",
  },
];
function MangeMigration() {
  const { get, post } = useApi();
  const { addToast } = useToasts();
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [migrationList, setMigrationList] = useState<IMigration[]>([]);
  useEffect(() => {
    getMigrationStatus();
  }, []);
  const getMigrationStatus = async () => {
    onLoading();
    const res = await get<IMigration[]>(ENDPOINT["/migration"]["/status"]);
    offLoading();
    if (res?.length) {
      setMigrationList(res);
    } else {
      setMigrationList([]);
    }
  };
  const onRefresh = async (refreshEndPointPath: string, status: string) => {
    if (status?.toLowerCase() === "started") {
      getMigrationStatus();
    } else {
      const res = await post<IApiResponse>(
        ENDPOINT["/migration"][""] + `${refreshEndPointPath}`
      );
      if (res.message) {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
      }
      if (res.success) {
        getMigrationStatus();
      }
    }
  };

  return (
    <AppContainer
      heading="Migration"
      info="Perform a data refresh from the V1 database for employee and cost center information. The migration process is scheduled to run nightly to automatically update the data. Additionally, you have the flexibility to trigger the migration manually whenever needed."
    >
      <Flex overflow={"auto"}>
        {migrationList.length ? (
          <Grid
            gridTemplateColumns={"1fr 1fr"}
            width={"full"}
            gap={"4"}
            p={"2"}
          >
            {migrationList
              .sort((a, b) =>
                a.migrationEntity.localeCompare(b.migrationEntity)
              )
              .map(
                (
                  {
                    initLoadSuccess,
                    initialLoadAt,
                    lastUpdatedAt,
                    migrationEntity,
                    status,
                    errorMessage,
                    lastManualUpdatedAt,
                    manualUpdateErrorMessage,
                    manualUpdateLastSuccessAt,
                    manualUpdateStatus,
                    manualUpdateSuccess,
                    lastSuccessAt,
                    updateSuccess,
                    refreshEndPointPath,
                  },
                  i
                ) => {
                  return (
                    <Flex
                      background={"white"}
                      key={migrationEntity}
                      p={"2"}
                      rounded={"lg"}
                      border={"1px solid #e7e7e7"}
                      direction={"column"}
                      transition={"0.3s"}
                      _hover={{
                        boxShadow: "0 0 8px 0 lightgray",
                      }}
                    >
                      <Flex
                        alignItems={"center"}
                        justifyContent={"space-between"}
                        width={"full"}
                        pl={"2"}
                        mb={"2"}
                      >
                        <Text fontSize={"lg"} fontWeight={"medium"}>
                          {MAPING.find(({ value }) => value === migrationEntity)
                            ?.name ?? migrationEntity}
                        </Text>
                        <Flex>
                          <Button
                            onClick={() => getMigrationStatus()}
                            size={"sm"}
                            variant={"outline"}
                            mr={"2"}
                          >
                            Update Status
                          </Button>
                          <Button
                            leftIcon={<FiRefreshCw />}
                            onClick={() =>
                              onRefresh(refreshEndPointPath, status)
                            }
                            size={"sm"}
                          >
                            Manual Sync
                          </Button>
                        </Flex>
                      </Flex>
                      <Flex direction={"column"} px={"2"}>
                        {[
                          {
                            label: "Initial Load On",
                            value: initialLoadAt
                              ? formatDate(initialLoadAt, { time: true })
                              : "-",
                          },
                          {
                            label: "Initial Load Success",
                            value: initLoadSuccess ? "Yes" : "No",
                          },
                        ].map(({ label, value }) => {
                          return (
                            <Flex my={"1"} key={label} alignItems={"center"}>
                              <Text
                                fontSize={"sm"}
                                color={"gray.500"}
                                mr={"2"}
                                minWidth={"24%"}
                              >
                                {label}:
                              </Text>
                              <Text fontSize={"sm"} fontWeight={"normal"}>
                                {value}
                              </Text>
                            </Flex>
                          );
                        })}
                      </Flex>
                      <Flex
                        direction={"column"}
                        background={"#3138510d"}
                        color={"#616161"}
                        px={"3"}
                        py={"1"}
                        rounded={"md"}
                        mt={"2"}
                      >
                        <Text mt={"1"} fontWeight={"medium"} fontSize={"md"}>
                          Scheduled Sync
                        </Text>
                        <Flex direction={"column"}>
                          {[
                            {
                              label: "Last Updated On",
                              value: lastUpdatedAt
                                ? formatDate(lastUpdatedAt, { time: true })
                                : "-",
                            },
                            {
                              label: "Status",
                              value: status,
                              badge: status
                                ? status.toLowerCase() === "started"
                                  ? "gray"
                                  : status.toLowerCase() ===
                                    "completed_with_errors"
                                  ? "yellow"
                                  : "green"
                                : undefined,
                            },
                            {
                              label: "Last Successful Updated On",
                              value: lastSuccessAt
                                ? formatDate(lastSuccessAt, { time: true })
                                : "-",
                            },
                            {
                              label: "Last Update Success",
                              value: updateSuccess ? "Yes" : "No",
                            },
                            {
                              label: "Error Message",
                              value: errorMessage,
                              color: errorMessage ? "#e85f5f" : undefined,
                            },
                          ].map(({ label, value, badge, color }) => {
                            return (
                              <Flex my={"1"} key={label}>
                                <Text
                                  fontSize={"sm"}
                                  color={"gray.500"}
                                  mr={"2"}
                                  minWidth={"24%"}
                                >
                                  {label}:
                                </Text>
                                {badge ? (
                                  <Badge
                                    colorScheme={badge}
                                    variant={"outline"}
                                    margin={"auto 0"}
                                  >
                                    {value}
                                  </Badge>
                                ) : (
                                  <Text
                                    fontSize={"sm"}
                                    fontWeight={"normal"}
                                    color={color || "black"}
                                    wordBreak={"break-word"}
                                  >
                                    {value}
                                  </Text>
                                )}
                              </Flex>
                            );
                          })}
                        </Flex>
                      </Flex>
                      <Flex
                        direction={"column"}
                        background={"#EBF3F8"}
                        color={"#616161"}
                        px={"3"}
                        py={"1"}
                        rounded={"md"}
                        mt={"2"}
                        flex={1}
                      >
                        <Text mt={"1"} fontWeight={"medium"} fontSize={"md"}>
                          Manual Sync
                        </Text>
                        <Flex direction={"column"}>
                          {[
                            {
                              label: "Last Updated On",
                              value: lastManualUpdatedAt
                                ? formatDate(lastManualUpdatedAt, {
                                    time: true,
                                  })
                                : "-",
                            },
                            {
                              label: "Status",
                              value: manualUpdateStatus,
                              badge: manualUpdateStatus
                                ? manualUpdateStatus.toLowerCase() === "started"
                                  ? "gray"
                                  : manualUpdateStatus.toLowerCase() ===
                                    "completed_with_errors"
                                  ? "yellow"
                                  : "green"
                                : undefined,
                            },
                            {
                              label: "Last Successful Updated On",
                              value: manualUpdateLastSuccessAt
                                ? formatDate(manualUpdateLastSuccessAt, {
                                    time: true,
                                  })
                                : "-",
                            },
                            {
                              label: "Last Update Success",
                              value: manualUpdateSuccess ? "Yes" : "No",
                            },
                            {
                              label: "Error Message",
                              value: manualUpdateErrorMessage,
                              color: manualUpdateErrorMessage
                                ? "#e85f5f"
                                : undefined,
                            },
                          ].map(({ label, value, badge, color }) => {
                            return (
                              <Flex my={"1"} key={label}>
                                <Text
                                  fontSize={"sm"}
                                  color={"gray.500"}
                                  mr={"2"}
                                  minWidth={"24%"}
                                >
                                  {label}:
                                </Text>
                                {badge ? (
                                  <Badge
                                    colorScheme={badge}
                                    variant={"outline"}
                                    margin={"auto 0"}
                                  >
                                    {value}
                                  </Badge>
                                ) : (
                                  <Text
                                    fontSize={"sm"}
                                    fontWeight={"normal"}
                                    color={color || "black"}
                                    wordBreak={"break-word"}
                                  >
                                    {value}
                                  </Text>
                                )}
                              </Flex>
                            );
                          })}
                        </Flex>
                      </Flex>
                    </Flex>
                  );
                }
              )}
          </Grid>
        ) : isLoading ? (
          <AppLoader />
        ) : (
          <AppNoData />
        )}
      </Flex>
    </AppContainer>
  );
}

export default MangeMigration;
