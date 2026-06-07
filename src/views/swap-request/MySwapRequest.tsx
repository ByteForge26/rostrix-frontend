import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import {
  Button,
  Flex,
  Grid,
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Spinner,
  Stack,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import { useToasts } from "react-toast-notifications";
import { useApi } from "../../hooks/useApi";
import AppTabs from "../../components/AppTabs";
import AppQuickFilterChips from "../../components/AppQuickFilterChips";
import { ENDPOINT } from "../../config/endpoint.config";
import { useAppSelector } from "../../app/store/store";
import { BsChevronDown } from "react-icons/bs";
import { IApiResponse, IMiscWork, ISwapRequest } from "../../helper/Interface";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import { DAYS_FULL, SECONDARY_JOBS_CONFIG } from "../../helper/Constant";
import moment from "moment";
import { convertTime, formatDate, getDuration } from "../../helper/Utils";
import { AiFillDelete, AiOutlineSwap } from "react-icons/ai";

const requestTypes = [
  {
    name: "Recieved",
    value: "RECEIVED",
  },
  {
    name: "Requested",
    value: "REQUESTED",
  },
];
const filters = [
  {
    label: "Pending",
    value: "PENDING",
    color: "#027DBC",
  },
  {
    label: "Approved",
    value: "APPROVED",
    color: "#359735",
  },
  {
    label: "Rejected",
    value: "REJECTED",
    color: "#c0c017",
  },
  {
    label: "Deleted",
    value: "DELETED",
    color: "#e85f5f",
  },
  {
    label: "Auto Deleted",
    value: "AUTO_DELETED",
    color: "#e85f5f",
  },
];
function MySwapRequest() {
  const today = new Date();
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [year, setYear] = useState(today.getFullYear());
  const { user, selectedCostCenterName } = useAppSelector(
    (state) => state.auth
  );
  const { get, post } = useApi();
  const { addToast } = useToasts();
  const [miscWorks, setMiscWorks] = useState<IMiscWork[]>([]);
  const [swapRequests, setSwapRequests] = useState<ISwapRequest[]>([]);
  const [requestType, setRequestType] = useState(requestTypes[0].value);
  const [statuses, setStatuses] = useState<string[]>([filters[0].value]);
  useEffect(() => {
    if (statuses && requestType && user && year) {
      getSwapRequest();
    }
  }, [requestType, statuses, user, year]);
  useEffect(() => {
    getMiscWorks();
  }, []);

  const getSwapRequest = async () => {
    onLoading();
    const res = await get<{ data: ISwapRequest[] }>(
      ENDPOINT["/shift-swap"][""] + `/${user?.empId}`,
      {
        params: {
          costCentre: selectedCostCenterName,
          year,
          requestType,
          statuses: statuses.toString(),
        },
      }
    );
    offLoading();
    if (res && res.data && res.data.length) {
      setSwapRequests(res.data);
    } else {
      setSwapRequests([]);
    }
  };
  const getMiscWorks = async () => {
    const res = await get<IMiscWork[]>(
      ENDPOINT["/roster"]["/primary"]["/miscWork"]
    );
    if (res?.length) {
      setMiscWorks(res);
    } else {
      setMiscWorks([]);
    }
  };

  const ShiftSwapCard = (props: ISwapRequest) => {
    const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(false);
    const {
      approvedAt,
      clusterId,
      clusterName,
      costCentre,
      deletedReason,
      id,
      jobType,
      receiverDate,
      receiverEmpId,
      receiverName,
      receiverShifts,
      requestedAt,
      senderDate,
      senderEmpId,
      senderName,
      senderShifts,
      status,
      weekNo,
    } = props;
    const onDelete = async (id: number) => {
      onLoading();
      const res = await post<IApiResponse>(
        ENDPOINT["/shift-swap"]["/delete"] + `/${id}`
      );
      offLoading();
      if (res && res.message) {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
      }
      getSwapRequest();
    };
    const onReject = async (id: number) => {
      onLoading();
      const res = await post<IApiResponse>(
        ENDPOINT["/shift-swap"]["/reject"] + `/${id}`
      );
      offLoading();
      if (res && res.message) {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
      }
      getSwapRequest();
    };
    const onApprove = async (id: number) => {
      onLoading();
      const res = await post<IApiResponse>(
        ENDPOINT["/shift-swap"]["/approve"] + `/${id}`
      );
      offLoading();
      if (res && res.message) {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
      }
      getSwapRequest();
    };
    return (
      <Flex
        py={"4"}
        px={"5"}
        rounded={"lg"}
        border={"1px solid"}
        transition={"0.3s"}
        _hover={{
          boxShadow: "0 0 8px 0 lightgray",
        }}
        borderColor={"#e7e7e7 "}
        direction={"column"}
      >
        <Flex
          mb={"4"}
          pb={"4"}
          justifyContent={"space-between"}
          borderBottom={"1px solid #f1f1f1"}
        >
          <Text fontSize={"sm"} fontWeight={"medium"}>{`${
            clusterName
              ? clusterName
              : SECONDARY_JOBS_CONFIG.find((obj) => obj.jobType === jobType)
                  ?.label || jobType
          } | Week ${weekNo}`}</Text>
          <Flex alignItems={"center"}>
            <Text fontSize={"xs"}>
              {`${formatDate(requestedAt, {
                time: true,
              })}`}
            </Text>
            <Text
              border={"1px solid"}
              padding={"2px 8px"}
              borderRadius={"4"}
              width={"fit-content"}
              fontSize={"xs"}
              fontWeight={"medium"}
              ml={"2"}
              color={
                filters.find(
                  ({ value }) => value.toLowerCase() === status.toLowerCase()
                )?.color
              }
            >
              {
                filters.find(
                  ({ value }) => value.toLowerCase() === status.toLowerCase()
                )?.label
              }
            </Text>
          </Flex>
        </Flex>
        <Flex justifyContent={"space-between"} mb={"2"}>
          <Flex direction={"column"} width={"45%"}>
            <Text fontSize={"xs"} mb={"2"} color={"gray"}>
              Sender
            </Text>
            <Text fontSize={"sm"} fontWeight={"medium"}>
              {senderName}
            </Text>
            <Text fontSize={"xs"} fontWeight={"medium"}>
              {senderEmpId}
            </Text>
            <Text fontSize={"xs"} mb={"4"} color={"#027DBC"}>
              {`${formatDate(senderDate)} | ${
                DAYS_FULL[moment(senderDate).get("day")]
              }`}
            </Text>
            <Text fontSize={"xs"} color={"gray"}>
              Shifts
            </Text>
            {senderShifts && senderShifts.length ? (
              <Stack mt={"2"}>
                {senderShifts
                  .sort((a, b) => a.s.localeCompare(b.s))
                  .map(({ s, e, c, workId }) => (
                    <Text fontSize={"xs"} fontWeight={"medium"}>
                      {`${convertTime(s)} - ${convertTime(e)} (${
                        getDuration(
                          moment(s, "HH:mm:ss"),
                          moment(e, "HH:mm:ss")
                        ).text
                      })${
                        workId
                          ? ` | ${
                              miscWorks.find(({ id }) => id === workId)?.name
                            }`
                          : ""
                      }`}
                    </Text>
                  ))}
              </Stack>
            ) : null}
          </Flex>
          <Flex pt={"8"}>
            <AiOutlineSwap />
          </Flex>
          <Flex direction={"column"} width={"45%"}>
            <Text fontSize={"xs"} mb={"2"} color={"gray"}>
              Receiver
            </Text>
            <Text fontSize={"sm"} fontWeight={"medium"}>
              {receiverName}
            </Text>
            <Text fontSize={"xs"} fontWeight={"medium"}>
              {receiverEmpId}
            </Text>
            <Text fontSize={"xs"} mb={"4"} color={"#027DBC"}>
              {`${formatDate(receiverDate)} | ${
                DAYS_FULL[moment(receiverDate).get("day")]
              }`}
            </Text>
            <Text fontSize={"xs"} color={"gray"}>
              Shifts
            </Text>
            {receiverShifts && receiverShifts.length ? (
              <Stack mt={"2"}>
                {receiverShifts
                  .sort((a, b) => a.s.localeCompare(b.s))
                  .map(({ s, e, c, workId }) => (
                    <Text fontSize={"xs"}>
                      {`${convertTime(s)} - ${convertTime(e)} (${
                        getDuration(
                          moment(s, "HH:mm:ss"),
                          moment(e, "HH:mm:ss")
                        ).text
                      })${
                        workId
                          ? ` | ${
                              miscWorks.find(({ id }) => id === workId)?.name
                            }`
                          : ""
                      }`}
                    </Text>
                  ))}
              </Stack>
            ) : null}
          </Flex>
        </Flex>
        {user &&
        status.toLowerCase() === "pending" &&
        (senderEmpId === user.empId || receiverEmpId === user.empId) ? (
          <Flex
            justifyContent={"end"}
            borderTop={"1px solid #f1f1f1"}
            pt={"4"}
            mt={"auto"}
          >
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                {senderEmpId === user.empId ? (
                  <Flex>
                    <Button
                      colorScheme="red"
                      variant={"solid"}
                      fontSize={"sm"}
                      onClick={() => onDelete(id)}
                    >
                      Delete
                    </Button>
                  </Flex>
                ) : (
                  <>
                    <Button
                      fontSize={"sm"}
                      variant={"outline"}
                      mr={3}
                      onClick={() => onReject(id)}
                    >
                      Reject
                    </Button>
                    <Button onClick={() => onApprove(id)}>Approve</Button>
                  </>
                )}
              </>
            )}
          </Flex>
        ) : null}
        {status.toLowerCase() === "auto_deleted" && deletedReason ? (
          <Flex
            // justifyContent={"end"}
            borderTop={"1px solid #f1f1f1"}
            pt={"4"}
            mt={"auto"}
          >
            <Text fontSize={"xs"}>
              <strong style={{ color: "#e85f5f" }}>Reason: </strong>{" "}
              {deletedReason}
            </Text>
          </Flex>
        ) : null}
      </Flex>
    );
  };

  return (
    <AppContainer heading="My Swap Request" info="">
      <AppTabs
        setValue={setRequestType}
        value={requestType}
        tabs={requestTypes}
      >
        <Menu>
          <MenuButton>
            <Text
              fontSize={"sm"}
              fontWeight={"bold"}
              mx={"2"}
              display={"flex"}
              alignItems={"center"}
            >
              {`${year}`}
              <BsChevronDown
                size={"12px"}
                style={{
                  marginLeft: 4,
                }}
              />
            </Text>
          </MenuButton>
          <MenuList>
            <MenuOptionGroup
              defaultValue={year.toString()}
              title="Select Year"
              type="radio"
            >
              {[
                new Date().getFullYear() - 1,
                new Date().getFullYear(),
                new Date().getFullYear() + 1,
              ].map((year) => (
                <MenuItemOption
                  key={year}
                  value={year.toString()}
                  onClick={() => setYear(Number(year))}
                  fontSize={"sm"}
                >
                  {year}
                </MenuItemOption>
              ))}
            </MenuOptionGroup>
          </MenuList>
        </Menu>
      </AppTabs>
      <AppQuickFilterChips
        filters={filters}
        selectedFilters={statuses}
        setSelectedFilters={setStatuses}
      />
      {swapRequests.length ? (
        <Grid gridTemplateColumns={"1fr 1fr"} width={"full"} gap={"4"} mt={"4"}>
          {swapRequests
            .sort(
              (a, b) =>
                moment(a.requestedAt).unix() - moment(b.requestedAt).unix()
            )
            .map((obj, i) => {
              return <ShiftSwapCard {...obj} key={i} />;
            })}
        </Grid>
      ) : isLoading ? (
        <AppLoader />
      ) : (
        <AppNoData msg="" />
      )}
    </AppContainer>
  );
}

export default MySwapRequest;
