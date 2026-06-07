import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import AppHeader from "../../components/AppHeader";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Grid,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useBoolean,
  useDisclosure,
} from "@chakra-ui/react";
import { useApi } from "../../hooks/useApi";
import { useToasts } from "react-toast-notifications";
import { useAppSelector } from "../../app/store/store";
import {
  IApiResponse,
  IClusterResponse,
  IClusterUserResponse,
  IContractType,
  ISport,
  IUserResponse,
} from "../../helper/Interface";
import { ENDPOINT } from "../../config/endpoint.config";
import { FiAlertTriangle } from "react-icons/fi";
import { PERMISSION } from "../../config/permission.config";
import { AiFillDelete, AiOutlineUser } from "react-icons/ai";
import { usePermission } from "../../hooks/usePermission";
import AppRightDrawer from "../../components/AppRightDrawer";
import AppNoData from "../../components/AppNoData";
import AppLoader from "../../components/AppLoader";
import { BsPlusLg, BsSearch } from "react-icons/bs";
import { formatDate } from "../../helper/Utils";
import { uniq } from "lodash";
import { GLOBAL_VIEW_ROLES } from "../../helper/Constant";

function ManageClusters() {
  const { get, post, put, Delete } = useApi();
  const { addToast } = useToasts();
  const { checkForPermission } = usePermission();
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const {
    isOpen: isClusterDetailsOpen,
    onClose: onClusterDetailsClose,
    onOpen: onClusterDetailsOpen,
  } = useDisclosure();
  const {
    isOpen: isEmployeesOpen,
    onClose: onEmployeesClose,
    onOpen: onEmployeesOpen,
  } = useDisclosure();
  const [isSaving, { on: onSaving, off: offSaving }] = useBoolean();
  const { selectedCostCenterName, user, roles, contractTypes } = useAppSelector(
    (state) => state.auth
  );
  const [sports, setSports] = useState<ISport[]>([]);
  const [clusterSearchKey, setClusterSearchKey] = useState("");
  const [employeeSearchKey, setEmployeeSearchKey] = useState("");
  const [allUsers, setAllUsers] = useState<IUserResponse[]>([]);
  const [clusterEmployees, setClusterEmployees] = useState<
    IClusterUserResponse[]
  >([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [selectedEmployeesAction, setSelectedEmployeesAction] = useState<
    "ADD" | "REMOVE"
  >("ADD");
  const getSports = async () => {
    // const res = await get<ISport[]>(ENDPOINT["/master"]["/sport"]);
    // if (res && res.length) {
    //   setSports(res);
    // } else {
    //   setSports([]);
    // }
  };
  const [empType, setEmpType] = useState<"LEADER" | "MEMBER">("LEADER");

  const [allCluster, setAllCluster] = useState<IClusterResponse[]>([]);
  const [clusterId, setClusterId] = useState(0);
  const [name, setName] = useState("");
  const [sportIds, setSportIds] = useState<number[]>([]);
  const [leaderEmpId, setLeaderEmpId] = useState("");
  const [forceConfirmApplicable, setForceConfirmApplicable] = useState(false);
  const [messageObj, setMessageObj] = useState<IApiResponse["messages"]>([]);
  useEffect(() => {
    if (selectedCostCenterName) {
      getAllCluster();
      getAllUsers();
    }
    getSports();
  }, []);

  const getAllCluster = async () => {
    onLoading();
    let endpoint =
      ENDPOINT["/cluster"][""] + `?costCentre=${selectedCostCenterName}`;
    if (!isUserStoreOrOpsLeader() && user && user.empId) {
      endpoint += `&leaderEmpId=${user.empId}`;
    }
    const res = await get<IClusterResponse[]>(endpoint);
    offLoading();
    if (res?.length) {
      setAllCluster(res);
    } else {
      setAllCluster([]);
    }
  };
  const isUserStoreOrOpsLeader = () => {
    let isLeader = false;
    if (
      user?.userRoles &&
      Object.values(user?.userRoles).length &&
      selectedCostCenterName &&
      roles &&
      roles.length
    ) {
      user.userRoles[selectedCostCenterName].forEach((id) => {
        if (
          roles.filter((obj) => obj.id === id).length &&
          GLOBAL_VIEW_ROLES.includes(
            roles.filter((obj) => obj.id === id)[0].title
          )
        ) {
          isLeader = true;
        }
      });
    }
    return isLeader;
  };
  const getAllUsers = async () => {
    const res = await get<IUserResponse[]>(
      ENDPOINT["/user"]["/cost-centre"] +
        `/${selectedCostCenterName}?detailed=true`
    );
    if (res?.length) {
      setAllUsers(res);
    } else {
      setAllUsers([]);
    }
  };
  const onSaveCluster = (forceConfirm?: boolean) => {
    if (clusterId) {
      onSaving();
      put<IApiResponse>(ENDPOINT["/cluster"][""] + `/${clusterId}`, {
        data: {
          name,
          costCentre: selectedCostCenterName,
          // sportIds,
          leaderEmpId: leaderEmpId
            ? leaderEmpId
            : selectedEmployeesAction === "ADD"
            ? selectedEmployeeIds[0]
            : "",
          forceConfirm: forceConfirm ?? false,
        },
      })
        .then((res) => {
          if (res.success) {
            onEmployeesClose();
            onSaveClusterEmployees(selectedEmployeeIds);
            addToast(res.message, {
              appearance: "success",
            });
            getAllCluster();
          } else if (res.warn && res.messages && res.messages.length) {
            setMessageObj(res.messages);
            setForceConfirmApplicable(true);
          } else {
            setMessageObj([
              {
                message: res.message,
                messageType: "WARN",
              },
            ]);
          }
        })
        .finally(() => {
          offSaving();
        });
    }
  };
  useEffect(() => {
    if (isClusterDetailsOpen && clusterId) {
      getClusterEmployees();
    }
  }, [isClusterDetailsOpen, clusterId]);
  const getClusterEmployees = async () => {
    setClusterEmployees([]);
    const res = await get<IClusterUserResponse[]>(
      ENDPOINT["/cluster"][""] + `/${clusterId}` + "/employees"
    );
    if (res?.length) {
      setClusterEmployees(res);
    } else {
      setClusterEmployees([]);
    }
  };
  const onSaveEmployees = (forceConfirm?: boolean) => {
    if (empType === "LEADER") {
      onSaveCluster(forceConfirm);
    } else {
      onSaveClusterEmployees();
    }
    //
  };

  const onSaveClusterEmployees = (employeeIds?: string[]) => {
    onEmployeesClose();
    post<IApiResponse>(ENDPOINT["/cluster"]["/employees"], {
      data: {
        clusterId,
        empIds: employeeIds
          ? uniq([...employeeIds, ...selectedEmployeeIds])
          : selectedEmployeeIds,
        action: selectedEmployeesAction,
      },
    }).then((res) => {
      if (res.success) {
        getClusterEmployees();
        getAllUsers();
        getAllCluster();
      } else {
        onClusterDetailsClose();
      }

      addToast(res.message, {
        appearance: res.success ? "success" : "error",
      });
    });
  };
  useEffect(() => {
    if (empType == "LEADER" && selectedEmployeeIds) {
      if (selectedEmployeesAction === "ADD" && selectedEmployeeIds.length > 1) {
        setSelectedEmployeeIds([selectedEmployeeIds[1]]);
        setLeaderEmpId(selectedEmployeeIds[1]);
      }
    }
  }, [selectedEmployeeIds]);
  return (
    <AppContainer
      heading="Clusters"
      info="Access list of clusters, assign leaders or add/remove employees at respective clusters."
    >
      <AppHeader>
        <InputGroup width={"fit-content"} mr={"2"}>
          <InputLeftElement pointerEvents="none">
            <BsSearch color="gray.300" />
          </InputLeftElement>
          <Input
            background={"white"}
            value={clusterSearchKey}
            onChange={(e) => setClusterSearchKey(e.target.value)}
            placeholder="Search here"
            width={"fit-content"}
          />
        </InputGroup>
      </AppHeader>

      <Flex overflow={"auto"} p={"2"}>
        {allCluster.length ? (
          <Grid gridTemplateColumns={"1fr 1fr 1fr"} width={"full"} gap={"4"}>
            {allCluster
              .sort((a, b) => a.name.localeCompare(b.name))
              .filter(
                ({ name, leaderEmpName }) =>
                  name
                    .trim()
                    .toLowerCase()
                    .includes(clusterSearchKey.trim().toLowerCase()) ||
                  (leaderEmpName || "")
                    .trim()
                    .toLowerCase()
                    .includes(clusterSearchKey.trim().toLowerCase())
              )
              .map(({ name, id, leaderEmpName, leaderEmpId, editable }, i) => {
                return (
                  <Flex
                    background={editable ? "white" : "#80808014"}
                    onClick={() => {
                      if (editable) {
                        setClusterId(id);
                        onClusterDetailsOpen();
                      }
                    }}
                    key={id}
                    cursor={editable ? "pointer" : "not-allowed"}
                    p={"2"}
                    rounded={"lg"}
                    border={"1px solid"}
                    direction={"column"}
                    transition={"0.3s"}
                    _hover={{
                      boxShadow: editable ? "0 0 8px 0 lightgray" : "none",
                    }}
                    borderColor={"#e7e7e7 "}
                    opacity={editable ? 1 : 0.5}
                  >
                    <Flex
                      alignItems={"center"}
                      justifyContent={"space-between"}
                      width={"full"}
                      pl={"2"}
                    >
                      <Flex
                        alignItems={"center"}
                        justifyContent={"space-between"}
                        width={"full"}
                      >
                        <Text fontSize={"lg"} fontWeight={"medium"}>
                          {name}
                        </Text>
                        {!leaderEmpName ? (
                          <Flex mr={"2"}>
                            <Tooltip label="Assign a leader">
                              <Text>
                                <FiAlertTriangle
                                  color="#e85f5f"
                                  fontSize={"14px"}
                                />
                              </Text>
                            </Tooltip>
                          </Flex>
                        ) : null}
                      </Flex>

                      <Flex>
                        {checkForPermission(
                          PERMISSION["My Store"]["Manage Clusters"][
                            "Update Cluster"
                          ]
                        ) && (
                          <>
                            {/* <IconButton
                              aria-label=""
                              size={"sm"}
                              variant={"ghost"}
                              onClick={() =>
                                onEditCluster(id, name, leaderEmpId)
                              }
                            >
                              <FiEdit />
                            </IconButton> */}
                          </>
                        )}
                      </Flex>
                    </Flex>
                    <Flex direction={"column"} px={"2"}>
                      <Flex my={"2"}>
                        <Text fontSize={"sm"} color={"gray.500"} mr={"2"}>
                          Leader:
                        </Text>
                        <Text fontSize={"sm"} fontWeight={"normal"}>
                          {leaderEmpName ?? "-"}
                        </Text>
                      </Flex>
                      {/* <Flex pt={"2"} wrap={"wrap"}>
                        {sportIds
                          .map(
                            (id) => sports.find((obj) => obj.id === id)?.name
                          )
                          .map((sport, j) => (
                            <Flex
                              key={j}
                              mr={"2"}
                              mb={"2"}
                              background={COLORS[j]}
                              rounded={"sm"}
                              px={"3"}
                              py={"1"}
                            >
                              <Text fontSize={"xs"} fontWeight={"normal"}>
                                {sport}
                              </Text>
                            </Flex>
                          ))}
                      </Flex> */}
                    </Flex>
                  </Flex>
                );
              })}
          </Grid>
        ) : isLoading ? (
          <AppLoader />
        ) : (
          <AppNoData />
        )}
      </Flex>

      <AppRightDrawer
        heading={
          allCluster?.length &&
          allCluster.filter(({ id }) => clusterId === id).length
            ? allCluster.filter(({ id }) => clusterId === id)[0].name
            : ""
        }
        isOpen={isClusterDetailsOpen}
        onClose={onClusterDetailsClose}
      >
        <Flex direction={"column"}>
          {[
            {
              heading: `Leader`,
              empType: "LEADER",
            },

            {
              heading: `Members`,
              empType: "MEMBER",
            },
          ].map(({ empType, heading }) => (
            <Flex
              key={empType}
              direction={"column"}
              // borderBottom={"1px solid lightgray"}
              mb={"4"}
              pb={"6"}
            >
              <Flex
                justifyContent={"space-between"}
                alignItems={"center"}
                mb={"2"}
              >
                <Text fontWeight={"medium"}>{heading}</Text>
                {checkForPermission(
                  PERMISSION["My Store"]["Manage Clusters"]["Update Employees"]
                ) ? (
                  <Flex>
                    <IconButton
                      aria-label="addIcon"
                      size={"xs"}
                      isDisabled={
                        empType === "LEADER" &&
                        allCluster &&
                        allCluster.length &&
                        allCluster.filter(({ id }) => clusterId === id)
                          .length &&
                        allCluster.filter(({ id }) => clusterId === id)[0]
                          .leaderEmpId
                          ? true
                          : false
                      }
                      onClick={() => {
                        onEmployeesOpen();
                        setEmpType(empType as any);
                        setSelectedEmployeesAction("ADD");
                        setEmployeeSearchKey("");
                        setSelectedEmployeeIds([]);
                        setForceConfirmApplicable(false);
                        setMessageObj([]);
                        setLeaderEmpId("");
                      }}
                    >
                      <BsPlusLg />
                    </IconButton>
                    <IconButton
                      aria-label="removeIcon"
                      size={"xs"}
                      colorScheme="red"
                      variant={"solid"}
                      ml={"2"}
                      onClick={() => {
                        onEmployeesOpen();
                        setEmpType(empType as any);
                        setSelectedEmployeesAction("REMOVE");
                        setEmployeeSearchKey("");
                        setSelectedEmployeeIds([]);
                        setForceConfirmApplicable(false);
                        setMessageObj([]);
                        setLeaderEmpId("");
                      }}
                      isDisabled={
                        empType === "LEADER" &&
                        allCluster &&
                        allCluster.length &&
                        allCluster.filter(({ id }) => clusterId === id)
                          .length &&
                        !allCluster.filter(({ id }) => clusterId === id)[0]
                          .leaderEmpId
                          ? true
                          : empType === "MEMBER" &&
                            clusterEmployees.length === 0
                          ? true
                          : false
                      }
                    >
                      <AiFillDelete />
                    </IconButton>
                  </Flex>
                ) : null}
              </Flex>
              {empType === "LEADER" &&
              allCluster &&
              allCluster.length &&
              allCluster.find(({ id }) => clusterId === id) ? (
                <>
                  {allCluster.find(({ id }) => clusterId === id)
                    ?.leaderEmpId ? (
                    <Flex direction={"column"}>
                      <Accordion allowMultiple defaultIndex={[]}>
                        {allCluster
                          .filter(({ id }) => clusterId === id)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(({ leaderEmpName, leaderEmpId }) => (
                            <AccordionItem
                              border={"1px solid #f1f1f1"}
                              mb={"2"}
                              rounded={"md"}
                              key={leaderEmpId}
                            >
                              <AccordionButton p={0}>
                                <Box as="span" flex="1" textAlign="left">
                                  <Flex
                                    key={leaderEmpId}
                                    // boxShadow={"md"}
                                    px={"3"}
                                    py={"2"}
                                    alignItems={"center"}
                                    width={"full"}
                                  >
                                    <AiOutlineUser />
                                    <Text fontSize={"sm"} ml={"2"}>
                                      {leaderEmpName}
                                    </Text>
                                    <AccordionIcon ml={"auto"} />
                                  </Flex>
                                </Box>
                              </AccordionButton>
                              <AccordionPanel p={0}>
                                <Flex
                                  borderTop={"1px solid #f1f1f1"}
                                  py={"2"}
                                  px={"9"}
                                >
                                  <Text
                                    fontSize={"xs"}
                                  >{`${leaderEmpId}`}</Text>
                                </Flex>
                              </AccordionPanel>
                            </AccordionItem>
                          ))}
                      </Accordion>
                    </Flex>
                  ) : (
                    <Text
                      fontSize={"sm"}
                      color={"gray"}
                      textAlign={"center"}
                      p={"2"}
                    >
                      Not found!
                    </Text>
                  )}
                </>
              ) : (
                <>
                  {clusterEmployees?.length ? (
                    <Flex direction={"column"}>
                      <Accordion allowMultiple defaultIndex={[]}>
                        {clusterEmployees
                          .sort((a, b) =>
                            a.firstName.localeCompare(b.firstName)
                          )
                          .map(
                            ({
                              firstName,
                              addedDate,
                              contractTypeId,
                              empId,
                              lastName,
                            }) => (
                              <AccordionItem
                                border={"1px solid #f1f1f1"}
                                mb={"2"}
                                rounded={"md"}
                                key={empId}
                              >
                                <AccordionButton p={0}>
                                  <Box as="span" flex="1" textAlign="left">
                                    <Flex
                                      key={empId}
                                      // boxShadow={"md"}
                                      px={"3"}
                                      py={"2"}
                                      alignItems={"center"}
                                      width={"full"}
                                    >
                                      <AiOutlineUser />
                                      <Text fontSize={"sm"} ml={"2"}>
                                        {firstName}
                                        {" " + lastName}
                                      </Text>
                                      <AccordionIcon ml={"auto"} />
                                    </Flex>
                                  </Box>
                                </AccordionButton>
                                <AccordionPanel p={0}>
                                  <Flex
                                    borderTop={"1px solid #f1f1f1"}
                                    py={"2"}
                                    px={"4"}
                                  >
                                    <Text fontSize={"xs"}>{`${empId} | ${
                                      contractTypes && contractTypes.length
                                        ? contractTypes.find(
                                            ({ id }) => id === contractTypeId
                                          )?.name
                                        : ""
                                    } | Since ${formatDate(addedDate)}`}</Text>
                                  </Flex>
                                </AccordionPanel>
                              </AccordionItem>
                            )
                          )}
                      </Accordion>
                    </Flex>
                  ) : (
                    <Text
                      fontSize={"sm"}
                      color={"gray"}
                      textAlign={"center"}
                      p={"2"}
                    >
                      Not found!
                    </Text>
                  )}
                </>
              )}
            </Flex>
          ))}
        </Flex>
        <AppRightDrawer
          isOpen={isEmployeesOpen}
          onClose={onEmployeesClose}
          heading={
            selectedEmployeesAction === "ADD"
              ? "Add Employees"
              : "Remove Employees"
          }
        >
          <Flex py={"2"}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <BsSearch color="gray.300" />
              </InputLeftElement>
              <Input
                background={"white"}
                data-testid="Search Employees"
                value={employeeSearchKey}
                onChange={(e) => setEmployeeSearchKey(e.target.value)}
                placeholder="Search here"
              />
            </InputGroup>
          </Flex>
          <CheckboxGroup
            colorScheme="blue"
            value={selectedEmployeeIds}
            onChange={(values) => setSelectedEmployeeIds(values as string[])}
          >
            <Stack
              pl={"1"}
              spacing={2}
              direction={"column"}
              overflow={"auto"}
              mb={"auto"}
            >
              {allUsers
                .filter(({ empId }) => {
                  if (selectedEmployeesAction === "ADD") {
                    if (empType === "LEADER") {
                      return (
                        allCluster?.length &&
                        allCluster.filter(({ id }) => clusterId === id)
                          .length &&
                        allCluster.filter(({ id }) => clusterId === id)[0]
                          .leaderEmpId !== empId
                      );
                    }
                    return (
                      clusterEmployees.findIndex(
                        (obj) => obj.empId === empId
                      ) === -1
                    );
                  } else {
                    if (empType === "LEADER") {
                      return (
                        allCluster?.length &&
                        allCluster.filter(({ id }) => clusterId === id)
                          .length &&
                        allCluster.filter(({ id }) => clusterId === id)[0]
                          .leaderEmpId === empId
                      );
                    }
                    return (
                      clusterEmployees.findIndex(
                        (obj) => obj.empId === empId
                      ) >= 0
                    );
                  }
                })
                .filter(({ clusterId }) => {
                  if (selectedEmployeesAction === "ADD") {
                    return clusterId === undefined;
                  }
                  return true;
                })
                .filter(({ firstName, lastName, empId }) => {
                  if (employeeSearchKey) {
                    if (
                      firstName
                        .trim()
                        .toLowerCase()
                        .includes(employeeSearchKey.trim().toLowerCase()) ||
                      (lastName || "")
                        .trim()
                        .toLowerCase()
                        .includes(employeeSearchKey.trim().toLowerCase()) ||
                      (firstName + " " + (lastName || ""))
                        .trim()
                        .toLowerCase()
                        .includes(employeeSearchKey.trim().toLowerCase()) ||
                      empId
                        .trim()
                        .toLowerCase()
                        .includes(employeeSearchKey.trim().toLowerCase())
                    ) {
                      return true;
                    }
                    return false;
                  }
                  return true;
                })
                .sort((a, b) => a.firstName.localeCompare(b.firstName))
                .map(({ firstName, lastName, empId }) => (
                  <Checkbox
                    key={empId}
                    value={empId}
                    mt={"2"}
                    data-testid={`checkbox-${empId}`}
                    isDisabled={
                      messageObj && messageObj.length && forceConfirmApplicable
                        ? true
                        : false
                    }
                  >
                    <Text
                      fontSize={"sm"}
                      display={"flex"}
                      alignItems={"center"}
                      flexWrap={"wrap"}
                    >
                      {firstName}
                      {lastName ? " " + lastName : ""}
                      <small
                        style={{
                          marginLeft: 4,
                        }}
                      >
                        {empId}
                      </small>
                    </Text>
                  </Checkbox>
                ))}
            </Stack>
          </CheckboxGroup>
          <Flex py={"4"} direction={"column"}>
            {messageObj?.length ? (
              <Flex>
                {messageObj.map(({ message, messageType }) => (
                  <Text
                    mt={"2"}
                    key={message}
                    background={messageType === "INFO" ? "#fff7d6" : "#ffeaea"}
                    color={messageType === "INFO" ? "#907400" : "red"}
                    fontSize={"xs"}
                    p={"2"}
                    rounded={"md"}
                    textAlign={"center"}
                    mb={"2"}
                  >
                    <span dangerouslySetInnerHTML={{ __html: message }}></span>
                  </Text>
                ))}
              </Flex>
            ) : null}

            <Button
              isDisabled={selectedEmployeeIds.length === 0}
              width={"full"}
              onClick={() =>
                onSaveEmployees(
                  messageObj && messageObj.length && forceConfirmApplicable
                    ? true
                    : false
                )
              }
            >
              {isSaving ? (
                <Spinner />
              ) : messageObj && messageObj.length && forceConfirmApplicable ? (
                "Confirm"
              ) : (
                "Save"
              )}
            </Button>
          </Flex>
        </AppRightDrawer>
      </AppRightDrawer>
    </AppContainer>
  );
}

export default ManageClusters;
