import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import AppHeader from "../../components/AppHeader";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSION } from "../../config/permission.config";
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
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useBoolean,
  useDisclosure,
} from "@chakra-ui/react";
import {
  IApiResponse,
  ISecondaryJob,
  IStoreSecondaryJob,
  IStoreSecondaryJobEmployee,
  IUserResponse,
} from "../../helper/Interface";
import { useApi } from "../../hooks/useApi";
import { ENDPOINT } from "../../config/endpoint.config";
import { useAppSelector } from "../../app/store/store";
import AppSelect from "../../components/AppSelect";
import { useToasts } from "react-toast-notifications";
import { AiFillDelete, AiOutlineUser } from "react-icons/ai";
import { FiAlertTriangle } from "react-icons/fi";
import AppRightDrawer from "../../components/AppRightDrawer";
import { BsPlusLg, BsSearch } from "react-icons/bs";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import { SECONDARY_JOBS_ICONS } from "../../helper/Images";
import { SECONDARY_JOBS_CONFIG } from "../../helper/Constant";

function ManageSecondaryJobs() {
  const { checkForPermission } = usePermission();
  const { get, post, put } = useApi();
  const { addToast } = useToasts();
  const [isDeleting, { on: onDeleting, off: offDeleting }] = useBoolean(false);
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const {
    isOpen: isSecondaryJobOpen,
    onOpen: onSecondaryJobOpen,
    onClose: onSecondaryJobClose,
  } = useDisclosure();
  const {
    isOpen: isSecondaryJobDeleteConfirmationOpen,
    onClose: onSecondaryJobDeleteConfirmationClose,
    onOpen: onSecondaryJobDeleteConfirmationOpen,
  } = useDisclosure();
  const {
    isOpen: isSecondaryJobDetailsOpen,
    onClose: onSecondaryJobDetailsClose,
    onOpen: onSecondaryJobDetailsOpen,
  } = useDisclosure();
  const {
    isOpen: isEmployeesOpen,
    onClose: onEmployeesClose,
    onOpen: onEmployeesOpen,
  } = useDisclosure();
  const [searchKey, setSearchKey] = useState("");
  const { selectedCostCenterName, contractTypes } = useAppSelector(
    (state) => state.auth
  );
  const [allSecondaryJobs, setAllSecondaryJobs] = useState<ISecondaryJob[]>([]);
  const [storeSecondaryJobs, setStoreSecondaryJobs] = useState<
    IStoreSecondaryJob[]
  >([]);
  const [storeSecondaryJobsEmployees, setStoreSecondaryJobsEmployees] =
    useState<IStoreSecondaryJobEmployee[]>([]);
  const [configId, setConfigId] = useState<number>();
  const [forceConfirmApplicable, setForceConfirmApplicable] = useState(false);
  const [messageObj, setMessageObj] = useState<IApiResponse["messages"]>([]);
  const [secondaryJobIds, setSecondaryJobIds] = useState<number[]>([]);
  const [allUsers, setAllUsers] = useState<IUserResponse[]>([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [empType, setEmpType] = useState<string>("");
  const [action, setAction] = useState<"ADD" | "REMOVE">("ADD");
  const getAllUsers = async () => {
    const res = await get<IUserResponse[]>(
      ENDPOINT["/user"]["/cost-centre"] + `/${selectedCostCenterName}`
    );
    if (res?.length) {
      setAllUsers(res);
    } else {
      setAllUsers([]);
    }
  };
  useEffect(() => {
    getAllSecondaryJobs();
    getStoreSecondaryJobs();
    getAllUsers();
  }, []);
  const getAllSecondaryJobs = async () => {
    const res = await get<ISecondaryJob[]>(
      ENDPOINT["/secondary"]["/master-config"]
    );
    if (res?.length) {
      setAllSecondaryJobs(res);
    } else {
      setAllSecondaryJobs([]);
    }
  };
  const getStoreSecondaryJobs = async () => {
    onLoading();
    const res = await get<IStoreSecondaryJob[]>(
      ENDPOINT["/secondary"]["/store-config"] + `/${selectedCostCenterName}`
    );
    offLoading();
    if (res?.length) {
      setStoreSecondaryJobs(res);
    } else {
      setStoreSecondaryJobs([]);
    }
  };

  const onAddSecondaryJobs = () => {
    setSecondaryJobIds([]);
    onSecondaryJobOpen();
  };
  const onSaveSecondaryJobs = () => {
    onSecondaryJobClose();
    post<IApiResponse>(ENDPOINT["/secondary"]["/add-store-config"], {
      data: {
        costCentre: selectedCostCenterName,
        secondaryJobIds: secondaryJobIds,
      },
    }).then((res) => {
      if (res?.success) {
        getStoreSecondaryJobs();
      }
      addToast(res.message, {
        appearance: res.success ? "success" : "error",
      });
    });
  };
  const onDeleteSecondaryJob = (forceConfirm?: boolean) => {
    if (configId) {
      onDeleting();
      post<IApiResponse>(ENDPOINT["/secondary"]["/remove-store-config"], {
        data: {
          configId,
          forceConfirm: forceConfirm ?? false,
        },
      })
        .then((res) => {
          if (res.success) {
            onSecondaryJobDeleteConfirmationClose();
            addToast(res.message, {
              appearance: "success",
            });
            getStoreSecondaryJobs();
          } else if (res.warn && res.messages?.length) {
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
          //
          offDeleting();
        });
    }
  };
  useEffect(() => {
    if (configId && isSecondaryJobDetailsOpen) {
      getStoreSecondaryJobsEmployees();
    }
  }, [isSecondaryJobDetailsOpen]);
  const getStoreSecondaryJobsEmployees = async () => {
    const res = await get<IStoreSecondaryJobEmployee[]>(
      ENDPOINT["/secondary"]["/members"] + `/${configId}`
    );
    if (res?.length) {
      setStoreSecondaryJobsEmployees(res);
    } else {
      setStoreSecondaryJobsEmployees([]);
    }
  };
  const onSaveEmployees = () => {
    onEmployeesClose();
    post<IApiResponse>(ENDPOINT["/secondary"]["/update-members"], {
      data: {
        configId,
        empIds: selectedEmpIds,
        action,
        empType: empType,
        forceConfirm: false,
      },
    }).then((res) => {
      getStoreSecondaryJobsEmployees();
      getStoreSecondaryJobs();
      addToast(res.message, {
        appearance: res.success ? "success" : "error",
      });
    });
  };
  useEffect(() => {
    if (empType == "COACH" && selectedEmpIds && selectedEmpIds.length > 1) {
      setSelectedEmpIds([selectedEmpIds[1]]);
    }
  }, [selectedEmpIds]);

  return (
    <AppContainer
      heading="Secondary Jobs"
      info="Add/remove secondary jobs to be assigned to employees at your store."
    >
      <AppHeader>
        {checkForPermission(
          PERMISSION["My Store"]["Manage Secondary Jobs"][
            "Update Secondary Jobs"
          ]
        ) && <Button onClick={onAddSecondaryJobs}>+ Add Secondary Jobs</Button>}
      </AppHeader>
      <Flex overflow={"auto"} p={"2"}>
        {storeSecondaryJobs.length ? (
          <Grid gridTemplateColumns={"1fr 1fr 1fr"} width={"full"} gap={"4"}>
            {storeSecondaryJobs.map(
              ({ jobType, id, firstName, lastName }, i) => {
                return (
                  <Flex
                    background={"white"}
                    onClick={(e: any) => {
                      if (
                        ["svg", "button", "path"].includes(e.target.localName)
                      ) {
                        return;
                      }
                      setConfigId(id);
                      onSecondaryJobDetailsOpen();
                    }}
                    key={id}
                    cursor={"pointer"}
                    p={"4"}
                    rounded={"lg"}
                    border={"1px solid #e7e7e7 "}
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
                          <img src={SECONDARY_JOBS_ICONS[jobType]} alt="" />
                        </Flex>
                        <Flex direction={"column"} ml={"4"}>
                          <Flex alignItems={"center"}>
                            <Text fontSize={"lg"} fontWeight={"medium"}>
                              {SECONDARY_JOBS_CONFIG.find(
                                (obj) => obj.jobType === jobType
                              )?.label ?? jobType}
                            </Text>
                            {!firstName ? (
                              <Flex ml={"2"}>
                                <Tooltip label="Currently No Coach Assigned to this Job.">
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
                          <Flex my={"1"}>
                            <Text fontSize={"sm"} color={"gray.500"} mr={"2"}>
                              Coach:
                            </Text>
                            <Text fontSize={"sm"} fontWeight={"normal"}>
                              {firstName
                                ? firstName + (lastName ? ` ${lastName}` : "")
                                : "-"}
                            </Text>
                          </Flex>
                        </Flex>
                      </Flex>

                      <Flex>
                        {checkForPermission(
                          PERMISSION["My Store"]["Manage Secondary Jobs"][
                            "Update Secondary Jobs"
                          ]
                        ) && (
                          <IconButton
                            aria-label="delete"
                            size={"sm"}
                            variant={"ghost"}
                            colorScheme="red"
                            onClick={() => {
                              setConfigId(id);
                              setForceConfirmApplicable(false);
                              setMessageObj([]);
                              onSecondaryJobDeleteConfirmationOpen();
                            }}
                          >
                            <AiFillDelete />
                          </IconButton>
                        )}
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
      <Modal isOpen={isSecondaryJobOpen} onClose={onSecondaryJobClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Secondary Jobs</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Secondary Job</FormLabel>
              <AppSelect
                isMulti
                value={secondaryJobIds}
                onChange={(value) => setSecondaryJobIds(value)}
                options={
                  allSecondaryJobs?.length
                    ? allSecondaryJobs
                        .filter(({ type }) => {
                          if (
                            storeSecondaryJobs?.length &&
                            storeSecondaryJobs.findIndex(
                              ({ jobType }) => jobType === type
                            ) >= 0
                          ) {
                            return false;
                          }
                          return true;
                        })
                        .map(({ type, id }) => ({
                          label:
                            SECONDARY_JOBS_CONFIG.find(
                              (obj) => obj.jobType === type
                            )?.label ?? type,
                          value: id,
                        }))
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
              onClick={onSecondaryJobClose}
            >
              Close
            </Button>
            <Button
              onClick={onSaveSecondaryJobs}
              isDisabled={secondaryJobIds.length === 0}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isSecondaryJobDeleteConfirmationOpen}
        onClose={onSecondaryJobDeleteConfirmationClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Secondary Job</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to Delete Secondary Job?</Text>
            {messageObj?.length ? (
              <>
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
              </>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onSecondaryJobDeleteConfirmationClose}
            >
              Close
            </Button>
            <Button
              aria-label="Delete"
              colorScheme="red"
              variant={"solid"}
              fontSize={"sm"}
              onClick={() =>
                onDeleteSecondaryJob(
                  messageObj && messageObj.length && forceConfirmApplicable
                    ? true
                    : false
                )
              }
            >
              {isDeleting ? (
                <Spinner />
              ) : messageObj && messageObj.length && forceConfirmApplicable ? (
                "Confirm Delete"
              ) : (
                "Delete"
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AppRightDrawer
        heading={
          SECONDARY_JOBS_CONFIG.find(
            (obj) =>
              obj.jobType ===
              (storeSecondaryJobs?.length &&
                storeSecondaryJobs.find(({ id }) => id === configId)?.jobType)
          )?.label || ""
        }
        isOpen={isSecondaryJobDetailsOpen}
        onClose={onSecondaryJobDetailsClose}
      >
        <Flex direction={"column"}>
          {[
            {
              heading: `${
                SECONDARY_JOBS_CONFIG.find(
                  (obj) =>
                    obj.jobType ===
                    (storeSecondaryJobs?.length &&
                      storeSecondaryJobs.find(({ id }) => id === configId)
                        ?.jobType)
                )?.label
              } Coach`,
              empType: "COACH",
              isActive: true,
            },

            {
              heading: `${
                SECONDARY_JOBS_CONFIG.find(
                  (obj) =>
                    obj.jobType ===
                    (storeSecondaryJobs?.length &&
                      storeSecondaryJobs.find(({ id }) => id === configId)
                        ?.jobType)
                )?.label
              } Members`,
              empType: "MEMBER",
              isActive: true,
            },
            {
              heading: "Buddy DM",
              empType: "SUBORDINATE",
              isActive: allSecondaryJobs?.length
                ? allSecondaryJobs.find(
                    ({ type }) =>
                      storeSecondaryJobs.find(({ id }) => id === configId)
                        ?.jobType === type
                  )?.allowSubMem
                : false,
            },
          ]
            .filter(({ isActive }) => isActive)
            .map(({ empType, heading }) => (
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

                  <Flex>
                    <IconButton
                      aria-label="addIcon"
                      size={"xs"}
                      isDisabled={
                        empType === "COACH" &&
                        storeSecondaryJobsEmployees &&
                        storeSecondaryJobsEmployees.length
                          ? storeSecondaryJobsEmployees.filter(
                              ({ type }) => type === empType
                            ).length === 1
                          : false
                      }
                      onClick={() => {
                        onEmployeesOpen();
                        setEmpType(empType);
                        setAction("ADD");
                        setSearchKey("");
                        setSelectedEmpIds([]);
                      }}
                    >
                      <BsPlusLg />
                    </IconButton>
                    <IconButton
                      aria-label="deleteIcon"
                      size={"xs"}
                      colorScheme="red"
                      variant={"solid"}
                      ml={"2"}
                      onClick={() => {
                        onEmployeesOpen();
                        setEmpType(empType);
                        setAction("REMOVE");
                        setSelectedEmpIds([]);
                      }}
                      isDisabled={
                        !storeSecondaryJobsEmployees.filter(
                          ({ type }) => type === empType
                        ).length
                      }
                    >
                      <AiFillDelete />
                    </IconButton>
                  </Flex>
                </Flex>
                {storeSecondaryJobsEmployees.filter(
                  ({ type }) => type === empType
                ).length ? (
                  <Flex direction={"column"}>
                    <Accordion allowMultiple defaultIndex={[]}>
                      {storeSecondaryJobsEmployees
                        .filter(({ type }) => type === empType)
                        .sort((a, b) => a.firstName.localeCompare(b.firstName))
                        .map(
                          ({
                            firstName,
                            lastName,
                            configId,
                            empId,
                            contractTypeId,
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
                                  px={"9"}
                                >
                                  <Text fontSize={"xs"}>{`${empId} | ${
                                    contractTypes && contractTypes.length
                                      ? contractTypes.find(
                                          ({ id }) => id === contractTypeId
                                        )?.name
                                      : ""
                                  }`}</Text>
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
              </Flex>
            ))}
        </Flex>
        <AppRightDrawer
          isOpen={isEmployeesOpen}
          onClose={onEmployeesClose}
          heading={action === "ADD" ? "Add Employees" : "Remove Employees"}
        >
          <Flex py={"2"}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <BsSearch color="gray.300" />
              </InputLeftElement>
              <Input
                background={"white"}
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder="Search here"
              />
            </InputGroup>
          </Flex>
          <CheckboxGroup
            colorScheme="blue"
            value={selectedEmpIds}
            onChange={(values) => setSelectedEmpIds(values as string[])}
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
                  if (action === "ADD") {
                    return (
                      storeSecondaryJobsEmployees
                        .filter(({ type }) => type === empType)
                        .findIndex((obj) => obj.empId === empId) === -1
                    );
                  }
                  return (
                    storeSecondaryJobsEmployees
                      .filter(({ type }) => type === empType)
                      .findIndex((obj) => obj.empId === empId) >= 0
                  );
                })
                .filter(({ empId }) => {
                  if (empType === "SUBORDINATE") {
                    return (
                      storeSecondaryJobsEmployees
                        .filter(({ type }) => type === "MEMBER")
                        .findIndex((obj) => obj.empId === empId) === -1
                    );
                  }
                  return true;
                })
                .filter(({ empId }) => {
                  if (empType === "MEMBER") {
                    return (
                      storeSecondaryJobsEmployees
                        .filter(({ type }) => type === "SUBORDINATE")
                        .findIndex((obj) => obj.empId === empId) === -1
                    );
                  }
                  return true;
                })

                .filter(({ firstName, lastName, empId }) => {
                  if (searchKey) {
                    if (
                      firstName
                        .trim()
                        .toLowerCase()
                        .includes(searchKey.trim().toLowerCase()) ||
                      (lastName || "")
                        .trim()
                        .toLowerCase()
                        .includes(searchKey.trim().toLowerCase()) ||
                      (firstName + " " + (lastName || ""))
                        .trim()
                        .toLowerCase()
                        .includes(searchKey.trim().toLowerCase()) ||
                      empId
                        .trim()
                        .toLowerCase()
                        .includes(searchKey.trim().toLowerCase())
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
            <Flex>
              <Text
                background={"#fff7d6"}
                color={"#907400"}
                fontSize={"xs"}
                px={"4"}
                py={"2"}
                rounded={"md"}
                textAlign={"center"}
                mb={"4"}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      "This action will change the role of selected employees.",
                  }}
                ></span>
              </Text>
            </Flex>
            <Button
              isDisabled={selectedEmpIds.length === 0}
              width={"full"}
              onClick={onSaveEmployees}
            >
              Confirm
            </Button>
          </Flex>
        </AppRightDrawer>
      </AppRightDrawer>
    </AppContainer>
  );
}

export default ManageSecondaryJobs;
