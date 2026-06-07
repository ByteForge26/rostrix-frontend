import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBoolean,
  useDisclosure,
} from "@chakra-ui/react";
import { useApi } from "../../hooks/useApi";
import { ENDPOINT } from "../../config/endpoint.config";
import {
  IApiResponse,
  IContractType,
  IContractTypeResponse,
  ILeavePoliciesResponse,
  IWeekOffResponse,
  IWeekResponse,
  IWorkHourResponse,
} from "../../helper/Interface";
import moment from "moment";
import { FiEdit } from "react-icons/fi";
import { AiFillDelete } from "react-icons/ai";
import { useToasts } from "react-toast-notifications";
import AppHeader from "../../components/AppHeader";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSION } from "../../config/permission.config";
import AppSelect from "../../components/AppSelect";
import AppTabs from "../../components/AppTabs";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import { formatDate, isFutureDate } from "../../helper/Utils";

const TABS = [
  {
    name: "Weeks offs",
    value: "weeks-offs",
    index: 0,
  },
  {
    name: "Leave Policy",
    value: "leave-policy",
    index: 1,
  },
  {
    name: "Work Hours",
    value: "work-hours",
    index: 3,
  },
];

function ManageContractTypes() {
  const contractTypeCategories = [
    {
      label: "Non Part Time",
      value: "FULL_TIME",
    },
    {
      label: "Part Time",
      value: "NON_FULL_TIME",
    },
  ];
  const leavePolicyList = [
    {
      label: "As per state policy",
      value: "STATE_POLICY",
    },
    {
      label: "No Leaves (Only LOP)",
      value: "ONLY_LOP",
    },
  ];
  const workHoursCategories = [
    "Layout",
    "SFS",
    "PlayGround",
    "DM",
    "POS",
    "CRM",
  ];

  const { get, post, put } = useApi();
  const { addToast } = useToasts();
  const { checkForPermission } = usePermission();
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [contractTypeName, setContractTypeName] = useState("");

  const [contractTypeCategory, setContractTypeCategory] = useState("");
  const [contractTypes, setContractTypes] = useState<IContractType[]>([]);
  const [contractTypeId, setContractTypeId] = useState("");
  const [weekOffId, setWeekOffId] = useState("");
  const [weekOffNumbers, setWeekOffNumbers] = useState("");
  const [weekOffEffectiveDate, setWeekOffEffectiveDate] = useState("");
  const [leavePolicyId, setLeavePolicyId] = useState("");
  const [leavePolicyType, setLeavePolicyType] = useState("");
  const [leavePolicyEffectiveDate, setLeavePolicyEffectiveDate] = useState("");
  const [workHoursId, setWorkHoursId] = useState("");
  const [workHoursInDayNumbers, setWorkHoursInDayNumbers] = useState("");
  const [workHoursInWeekNumbers, setWorkHoursInWeekNumbers] = useState("");
  const [workHoursInMonthNumbers, setWorkHoursInMonthNumbers] = useState("");
  const [workHoursEffectiveDate, setWorkHoursEffectiveDate] = useState("");
  const [tabValue, setTabValue] = useState(TABS[0].value);
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [weeks, setWeeks] = useState<IWeekResponse[]>([]);
  const {
    isOpen: isContractTypeModalOpen,
    onClose: onContractTypeModalClose,
    onOpen: onContractTypeModalOpen,
  } = useDisclosure();
  const {
    isOpen: isWeekOffModalOpen,
    onClose: onWeekOffModalClose,
    onOpen: onWeekOffModalOpen,
  } = useDisclosure();
  const {
    isOpen: isLeavePolicyModalOpen,
    onClose: onLeavePolicyModalClose,
    onOpen: onLeavePolicyModalOpen,
  } = useDisclosure();
  const {
    isOpen: isDeleteWeekOffModalOpen,
    onClose: onDeleteWeekOffModalClose,
    onOpen: onDeleteWeekOffModalOpen,
  } = useDisclosure();
  const {
    isOpen: isDeleteLeavePolicyModalOpen,
    onClose: onDeleteLeavePolicyModalClose,
    onOpen: onDeleteLeavePolicyModalOpen,
  } = useDisclosure();
  const {
    isOpen: isWorkHoursModalOpen,
    onClose: onWorkHoursModalClose,
    onOpen: onWorkHoursModalOpen,
  } = useDisclosure();
  const {
    isOpen: isDeleteWorkHoursModalOpen,
    onClose: onDeleteWorkHoursModalClose,
    onOpen: onDeleteWorkHoursModalOpen,
  } = useDisclosure();

  useEffect(() => {
    getAllContractTypes();
    getYears();
  }, []);
  const getYears = () => {
    const date = new Date();
    const years: string[] = [];
    for (let index = 0; index < 3; index++) {
      years.push((date.getFullYear() + index).toString());
    }
    setYears(years);
  };

  useEffect(() => {
    if (selectedYear) {
      getAllWeeks();
    }
  }, [selectedYear]);
  const getAllWeeks = async () => {
    setWeeks([]);
    const res = await get<IWeekResponse[]>(
      ENDPOINT["/master"]["/week"] + `/${selectedYear}`
    );
    if (res?.length) {
      setWeeks(res);
    }
  };

  const getAllContractTypes = async () => {
    onLoading();
    const res = await get<IContractTypeResponse[]>(
      ENDPOINT["/master"]["/contract-type"]
    );
    offLoading();
    if (res?.length) {
      getAllData(res);
    }
  };
  const getAllData = async (tempContractTypes: IContractType[]) => {
    onLoading();
    const resAll = await Promise.all([
      get<IWeekOffResponse[]>(ENDPOINT["/master"]["/week-off"]),
      get<IWorkHourResponse[]>(ENDPOINT["/master"]["/work-hours"]),
      get<ILeavePoliciesResponse[]>(ENDPOINT["/master"]["/leave-policy"]),
    ]);
    offLoading();
    if (resAll?.length) {
      resAll[0].forEach((obj) => {
        let index = tempContractTypes.findIndex(
          ({ id }) => obj.contractTypeId === id
        );
        if (index >= 0) {
          if (tempContractTypes[index].weekOffs) {
            tempContractTypes[index].weekOffs?.push(obj);
          } else {
            tempContractTypes[index].weekOffs = [obj];
          }
        }
      });
      resAll[1].forEach((obj) => {
        let index = tempContractTypes.findIndex(
          ({ id }) => obj.contractTypeId === id
        );
        if (index >= 0) {
          if (tempContractTypes[index].workHours) {
            tempContractTypes[index].workHours?.push(obj);
          } else {
            tempContractTypes[index].workHours = [obj];
          }
        }
      });
      resAll[2].forEach((obj) => {
        let index = tempContractTypes.findIndex(
          ({ id }) => obj.contractTypeId === id
        );
        if (index >= 0) {
          if (tempContractTypes[index].leavePolicies) {
            tempContractTypes[index].leavePolicies?.push(obj);
          } else {
            tempContractTypes[index].leavePolicies = [obj];
          }
        }
      });
    }

    setContractTypes(tempContractTypes);
  };
  const onCreateContractType = () => {
    setContractTypeName("");
    setContractTypeCategory("");
    onContractTypeModalOpen();
  };
  const onSaveContractTypeName = () => {
    onContractTypeModalClose();
    post<IApiResponse>(ENDPOINT["/master"]["/contract-type"], {
      data: {
        name: contractTypeName,
        category: contractTypeCategory,
      },
    }).then((res) => {
      addToast(res.message, {
        appearance: res.success ? "success" : "error",
      });
      if (res.success) {
        getAllContractTypes();
      }
    });
  };

  const onCreateWeekOff = (contractTypeId: number) => {
    setContractTypeId(contractTypeId.toString());
    setWeekOffId("");
    setSelectedYear(years[0]);
    setWeekOffEffectiveDate("");
    setWeekOffNumbers("");
    onWeekOffModalOpen();
  };
  const onEditWeekOff = (
    contractTypeId: number,
    weekOffId: number,
    effectiveDate: string,
    numWeekOff: number
  ) => {
    setContractTypeId(contractTypeId.toString());
    setWeekOffId(weekOffId.toString());
    setSelectedYear(moment(effectiveDate).get("year").toString());
    setWeekOffEffectiveDate(effectiveDate);
    setWeekOffNumbers(numWeekOff.toString());
    onWeekOffModalOpen();
  };
  const onDeleteWeekOffConfirmation = (
    contractTypeId: number,
    weekOffId: number,
    effectiveDate: string,
    numWeekOff: number
  ) => {
    setContractTypeId(contractTypeId.toString());
    setWeekOffId(weekOffId.toString());
    setWeekOffEffectiveDate(effectiveDate);
    setWeekOffNumbers(numWeekOff.toString());
    onDeleteWeekOffModalOpen();
  };
  const onCreateLeavePolicy = (contractTypeId: number) => {
    setContractTypeId(contractTypeId.toString());
    setLeavePolicyId("");
    setLeavePolicyEffectiveDate(moment([years[1]]).format("YYYY-MM-DD"));
    setLeavePolicyType("");
    onLeavePolicyModalOpen();
  };
  const onEditLeavePolicy = (
    contractTypeId: number,
    leavePolicyId: number,
    effectiveDate: string,
    leavePolicyType: string
  ) => {
    setContractTypeId(contractTypeId.toString());
    setLeavePolicyId(leavePolicyId.toString());
    setLeavePolicyEffectiveDate(effectiveDate);
    setLeavePolicyType(leavePolicyType.toString());
    onLeavePolicyModalOpen();
  };
  const onDeleteLeavePolicyConfirmation = (
    contractTypeId: number,
    leavePolicyId: number,
    effectiveDate: string,
    leavePolicyType: string
  ) => {
    setContractTypeId(contractTypeId.toString());
    setLeavePolicyId(leavePolicyId.toString());
    setLeavePolicyEffectiveDate(effectiveDate);
    setLeavePolicyType(leavePolicyType.toString());
    onDeleteLeavePolicyModalOpen();
  };
  const onSaveLeavePolicy = () => {
    onLeavePolicyModalClose();
    if (leavePolicyId) {
      put<IApiResponse>(
        ENDPOINT["/master"]["/leave-policy"] + `/${leavePolicyId}`,
        {
          data: {
            contractTypeId: Number(contractTypeId),
            leavePolicy: leavePolicyType,
            effectiveDate: leavePolicyEffectiveDate,
          },
        }
      ).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getAllContractTypes();
        }
      });
    } else {
      post<IApiResponse>(ENDPOINT["/master"]["/leave-policy"], {
        data: {
          contractTypeId: Number(contractTypeId),
          leavePolicy: leavePolicyType,
          effectiveDate: leavePolicyEffectiveDate,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getAllContractTypes();
        }
      });
    }
  };
  const onSaveWeekOffs = () => {
    onWeekOffModalClose();
    if (weekOffId) {
      put<IApiResponse>(ENDPOINT["/master"]["/week-off"] + `/${weekOffId}`, {
        data: {
          contractTypeId: Number(contractTypeId),
          numWeekOff: Number(weekOffNumbers),
          effectiveDate: weekOffEffectiveDate,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getAllContractTypes();
        }
      });
    } else {
      post<IApiResponse>(ENDPOINT["/master"]["/week-off"], {
        data: {
          contractTypeId: Number(contractTypeId),
          numWeekOff: Number(weekOffNumbers),
          effectiveDate: weekOffEffectiveDate,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getAllContractTypes();
        }
      });
    }
  };
  const onDeleteWeekOff = () => {
    onDeleteWeekOffModalClose();
    if (weekOffId) {
      put<IApiResponse>(ENDPOINT["/master"]["/week-off"] + `/${weekOffId}`, {
        data: {
          contractTypeId: Number(contractTypeId),
          numWeekOff: Number(weekOffNumbers),
          effectiveDate: weekOffEffectiveDate,
          delete: true,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getAllContractTypes();
        }
      });
    }
  };
  const onCreateWorkHours = (contractTypeId: number) => {
    setContractTypeId(contractTypeId.toString());
    setWorkHoursId("");
    setSelectedYear(years[0]);
    setWorkHoursEffectiveDate("");
    setWorkHoursInDayNumbers("");
    setWorkHoursInMonthNumbers("");
    setWorkHoursInWeekNumbers("");
    onWorkHoursModalOpen();
  };
  const onEditWorkHours = (
    contractTypeId: number,
    workHoursId: number,
    effectiveDate: string,
    day: number,
    week: number,
    month: number
  ) => {
    setContractTypeId(contractTypeId.toString());
    setWorkHoursId(workHoursId.toString());
    setSelectedYear(moment(effectiveDate).get("year").toString());
    setWorkHoursEffectiveDate(effectiveDate);
    setWorkHoursInDayNumbers(day.toString());
    setWorkHoursInMonthNumbers(month.toString());
    setWorkHoursInWeekNumbers(week.toString());
    onWorkHoursModalOpen();
  };

  const onDeleteWorkHoursConfirmation = (
    contractTypeId: number,
    workHoursId: number,
    effectiveDate: string,
    day: number,
    week: number,
    month: number
  ) => {
    setContractTypeId(contractTypeId.toString());
    setWorkHoursId(workHoursId.toString());
    setWorkHoursEffectiveDate(effectiveDate);
    setWorkHoursInDayNumbers(day.toString());
    setWorkHoursInMonthNumbers(month.toString());
    setWorkHoursInWeekNumbers(week.toString());
    onDeleteWorkHoursModalOpen();
  };
  const onSaveWorkHours = () => {
    onWorkHoursModalClose();
    if (workHoursId) {
      put<IApiResponse>(
        ENDPOINT["/master"]["/work-hours"] + `/${workHoursId}`,
        {
          data: {
            contractTypeId: Number(contractTypeId),
            week: Number(workHoursInWeekNumbers),
            day: Number(workHoursInDayNumbers),
            month: Number(workHoursInMonthNumbers),
            effectiveDate: workHoursEffectiveDate,
          },
        }
      ).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getAllContractTypes();
        }
      });
    } else {
      post<IApiResponse>(ENDPOINT["/master"]["/work-hours"], {
        data: {
          contractTypeId: Number(contractTypeId),
          week: Number(workHoursInWeekNumbers),
          day: Number(workHoursInDayNumbers),
          month: Number(workHoursInMonthNumbers),
          effectiveDate: workHoursEffectiveDate,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getAllContractTypes();
        }
      });
    }
  };
  const onDeleteWorkHours = () => {
    onDeleteWorkHoursModalClose();
    if (workHoursId) {
      put<IApiResponse>(
        ENDPOINT["/master"]["/work-hours"] + `/${workHoursId}`,
        {
          data: {
            contractTypeId: Number(contractTypeId),
            week: Number(workHoursInWeekNumbers),
            day: Number(workHoursInDayNumbers),
            month: Number(workHoursInMonthNumbers),
            effectiveDate: workHoursEffectiveDate,
            delete: true,
          },
        }
      ).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getAllContractTypes();
        }
      });
    }
  };
  const onDeleteLeavePolicy = () => {
    onDeleteLeavePolicyModalClose();
    if (leavePolicyId) {
      put<IApiResponse>(
        ENDPOINT["/master"]["/leave-policy"] + `/${leavePolicyId}`,
        {
          data: {
            contractTypeId: Number(contractTypeId),
            leavePolicy: leavePolicyType,
            effectiveDate: leavePolicyEffectiveDate,
            delete: true,
          },
        }
      ).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getAllContractTypes();
        }
      });
    }
  };
  const getWeekList = () => {
    return weeks
      ?.filter(({ startDate }) => moment(startDate).unix() > moment().unix())
      .map(({ startDate, number }) => ({
        label: `Week ${number} (${formatDate(startDate)} onwards)`,
        value: moment(startDate).format("YYYY-MM-DD"),
      })).length
      ? weeks
          .filter(({ startDate }) => moment(startDate).unix() > moment().unix())
          .map(({ startDate, number }) => ({
            label: `Week ${number} (${formatDate(startDate)} onwards)`,
            value: moment(startDate).format("YYYY-MM-DD"),
          }))
      : [];
  };

  return (
    <AppContainer
      heading="Contract Types"
      info="Set up different types of contracts for employees, such as full-time, part-time, or contract, including leave policy & defining work hours."
    >
      <AppHeader>
        {checkForPermission(PERMISSION.Config["Contract Types"].Update) ? (
          <Button onClick={onCreateContractType}>+ Add Contract Type</Button>
        ) : undefined}
      </AppHeader>
      {contractTypes.length ? (
        <Flex direction={"column"}>
          <Accordion allowToggle defaultIndex={[0]}>
            {contractTypes.map(
              (
                {
                  id: contractTypeId,
                  name,
                  weekOffs,
                  workHours,
                  leavePolicies,
                },
                i
              ) => {
                return (
                  <Flex
                    background={"white"}
                    key={contractTypeId}
                    direction={"column"}
                    style={{
                      // background: "#b6b6b61a",
                      marginBottom: 16,
                      borderRadius: 4,
                      border: "1px solid lightgrey",
                      overflow: "hidden",
                    }}
                  >
                    <AccordionItem border={"none"}>
                      <AccordionButton>
                        <Box as="span" flex="1" textAlign="left">
                          <Text
                            fontWeight={"medium"}
                            style={{
                              padding: "4px",
                            }}
                          >
                            {name}
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel p={0} borderTop={"1px solid lightgrey"}>
                        <Flex p={"4"} direction={"column"}>
                          <AppTabs
                            value={tabValue}
                            setValue={setTabValue}
                            tabs={TABS}
                          >
                            {tabValue == TABS[0].value &&
                            checkForPermission(
                              PERMISSION.Config["Contract Types"].Update
                            ) ? (
                              <Button
                                onClick={() => onCreateWeekOff(contractTypeId)}
                                variant={"outline"}
                                size={"sm"}
                              >
                                + Create Week Offs
                              </Button>
                            ) : null}
                            {tabValue == TABS[1].value &&
                            checkForPermission(
                              PERMISSION.Config["Contract Types"].Update
                            ) ? (
                              <Button
                                onClick={() =>
                                  onCreateLeavePolicy(contractTypeId)
                                }
                                variant={"outline"}
                                size={"sm"}
                              >
                                + Create Leave Policy
                              </Button>
                            ) : null}
                          </AppTabs>
                          {tabValue == TABS[0].value ? (
                            <Flex direction={"column"}>
                              {weekOffs?.length ? (
                                <TableContainer
                                  background="white"
                                  width={"full"}
                                  border={"1px solid #F2F2F2"}
                                  borderRadius={"md"}
                                  height={"fit-content"}
                                >
                                  <Table variant="simple">
                                    <Thead height={"48px"}>
                                      <Tr>
                                        <Th
                                          background="#EBF3F8"
                                          color="#1e2640"
                                        >
                                          Effective Date
                                        </Th>
                                        <Th
                                          background="#EBF3F8"
                                          color="#1e2640"
                                        >
                                          Week Offs
                                        </Th>
                                        <Th
                                          background="#EBF3F8"
                                          color="#1e2640"
                                        >
                                          Action
                                        </Th>
                                      </Tr>
                                    </Thead>
                                    <Tbody fontSize={"sm"}>
                                      {weekOffs
                                        .sort(
                                          (a, b) =>
                                            new Date(
                                              b.effectiveDate
                                            ).getTime() -
                                            new Date(a.effectiveDate).getTime()
                                        )
                                        .map(
                                          (
                                            {
                                              effectiveDate,
                                              numWeekOff,
                                              id: weekOffId,
                                            },
                                            j
                                          ) => (
                                            <Tr
                                              key={`${contractTypeId}_${weekOffId}`}
                                            >
                                              <Td py={"3"}>
                                                {formatDate(effectiveDate)}
                                              </Td>
                                              <Td py={"3"}> {numWeekOff}</Td>
                                              <Td py={"2"}>
                                                {isFutureDate(
                                                  new Date(effectiveDate)
                                                ) &&
                                                checkForPermission(
                                                  PERMISSION.Config[
                                                    "Contract Types"
                                                  ].Update
                                                ) ? (
                                                  <>
                                                    <IconButton
                                                      size={"sm"}
                                                      variant={"ghost"}
                                                      aria-label="edit-weekoff"
                                                      onClick={() =>
                                                        onEditWeekOff(
                                                          contractTypeId,
                                                          weekOffId,
                                                          effectiveDate,
                                                          numWeekOff
                                                        )
                                                      }
                                                    >
                                                      <FiEdit />
                                                    </IconButton>
                                                    <IconButton
                                                      size={"sm"}
                                                      ml={"2"}
                                                      variant={"ghost"}
                                                      colorScheme="red"
                                                      aria-label="delete-weekoff"
                                                      onClick={() =>
                                                        onDeleteWeekOffConfirmation(
                                                          contractTypeId,
                                                          weekOffId,
                                                          effectiveDate,
                                                          numWeekOff
                                                        )
                                                      }
                                                    >
                                                      <AiFillDelete />
                                                    </IconButton>
                                                  </>
                                                ) : null}
                                              </Td>
                                            </Tr>
                                          )
                                        )}
                                    </Tbody>
                                  </Table>
                                </TableContainer>
                              ) : (
                                <Flex
                                  minHeight={"100px"}
                                  justifyContent={"center"}
                                  alignItems={"center"}
                                >
                                  <Text fontSize={"sm"} color={"gray"}>
                                    No Data Found!
                                  </Text>
                                </Flex>
                              )}
                            </Flex>
                          ) : null}
                          {tabValue == TABS[1].value ? (
                            <Flex direction={"column"}>
                              {leavePolicies?.length ? (
                                <TableContainer
                                  background="white"
                                  width={"full"}
                                  border={"1px solid #F2F2F2"}
                                  borderRadius={"md"}
                                  height={"fit-content"}
                                >
                                  <Table variant="simple">
                                    <Thead height={"48px"}>
                                      <Tr>
                                        <Th
                                          background="#EBF3F8"
                                          color="#1e2640"
                                        >
                                          Effective Date
                                        </Th>
                                        <Th
                                          background="#EBF3F8"
                                          color="#1e2640"
                                        >
                                          Policy
                                        </Th>
                                        <Th
                                          background="#EBF3F8"
                                          color="#1e2640"
                                        >
                                          Action
                                        </Th>
                                      </Tr>
                                    </Thead>
                                    <Tbody fontSize={"sm"}>
                                      {leavePolicies
                                        .sort(
                                          (a, b) =>
                                            new Date(
                                              b.effectiveDate
                                            ).getTime() -
                                            new Date(a.effectiveDate).getTime()
                                        )
                                        .map(
                                          (
                                            {
                                              leavePolicy,
                                              effectiveDate,
                                              id: leavePolicyId,
                                            },
                                            j
                                          ) => (
                                            <Tr
                                              key={`${contractTypeId}_${leavePolicyId}`}
                                            >
                                              <Td py={"3"}>
                                                {formatDate(effectiveDate)}
                                              </Td>
                                              <Td py={"3"}>
                                                {
                                                  leavePolicyList.find(
                                                    ({ value }) =>
                                                      value === leavePolicy
                                                  )?.label
                                                }
                                              </Td>
                                              <Td py={"2"}>
                                                {isFutureDate(
                                                  new Date(effectiveDate)
                                                ) &&
                                                checkForPermission(
                                                  PERMISSION.Config[
                                                    "Contract Types"
                                                  ].Update
                                                ) ? (
                                                  <>
                                                    <IconButton
                                                      size={"sm"}
                                                      variant={"ghost"}
                                                      aria-label="edit-leavepolicy"
                                                      onClick={() =>
                                                        onEditLeavePolicy(
                                                          contractTypeId,
                                                          leavePolicyId,
                                                          effectiveDate,
                                                          leavePolicy
                                                        )
                                                      }
                                                    >
                                                      <FiEdit />
                                                    </IconButton>
                                                    <IconButton
                                                      size={"sm"}
                                                      ml={"2"}
                                                      variant={"ghost"}
                                                      colorScheme="red"
                                                      aria-label="delete-leavepolicy"
                                                      onClick={() =>
                                                        onDeleteLeavePolicyConfirmation(
                                                          contractTypeId,
                                                          leavePolicyId,
                                                          effectiveDate,
                                                          leavePolicy
                                                        )
                                                      }
                                                    >
                                                      <AiFillDelete />
                                                    </IconButton>
                                                  </>
                                                ) : null}
                                              </Td>
                                            </Tr>
                                          )
                                        )}
                                    </Tbody>
                                  </Table>
                                </TableContainer>
                              ) : (
                                <Flex
                                  minHeight={"100px"}
                                  justifyContent={"center"}
                                  alignItems={"center"}
                                >
                                  <Text fontSize={"sm"} color={"gray"}>
                                    No Data Found!
                                  </Text>
                                </Flex>
                              )}
                            </Flex>
                          ) : null}

                          {tabValue == TABS[2].value ? (
                            <Flex direction={"column"}>
                              {workHours?.length ? (
                                <TableContainer
                                  background="white"
                                  width={"full"}
                                  border={"1px solid #F2F2F2"}
                                  borderRadius={"md"}
                                  height={"fit-content"}
                                >
                                  <Table variant="simple">
                                    <Thead height={"48px"}>
                                      <Tr>
                                        <Th
                                          background="#EBF3F8"
                                          color="#1e2640"
                                        >
                                          Effective Date
                                        </Th>
                                        <Th
                                          background="#EBF3F8"
                                          color="#1e2640"
                                        >
                                          Day
                                        </Th>
                                        {/* <Th
                                          background="#EBF3F8"
                                          color="#1e2640"
                                        >
                                          Week
                                        </Th>
                                        <Th
                                          background="#EBF3F8"
                                          color="#1e2640"
                                        >
                                          Month
                                        </Th> */}
                                        <Th
                                          background="#EBF3F8"
                                          color="#1e2640"
                                        >
                                          Action
                                        </Th>
                                      </Tr>
                                    </Thead>
                                    <Tbody fontSize={"sm"}>
                                      {workHours
                                        .sort(
                                          (a, b) =>
                                            new Date(
                                              b.effectiveDate
                                            ).getTime() -
                                            new Date(a.effectiveDate).getTime()
                                        )
                                        .map(
                                          (
                                            {
                                              effectiveDate,
                                              day,
                                              month,
                                              week,
                                              id: workHoursId,
                                            },
                                            j
                                          ) => (
                                            <Tr
                                              key={`${contractTypeId}_${workHoursId}`}
                                            >
                                              <Td py={"3"}>
                                                {formatDate(effectiveDate)}
                                              </Td>

                                              <Td py={"3"}>{day} Hrs</Td>
                                              {/* <Td py={"3"}>{week} Hrs</Td>
                                              <Td py={"3"}>{month} Hrs</Td> */}
                                              <Td py={"2"}>
                                                {isFutureDate(
                                                  new Date(effectiveDate)
                                                ) &&
                                                checkForPermission(
                                                  PERMISSION.Config[
                                                    "Contract Types"
                                                  ].Update
                                                ) ? (
                                                  <>
                                                    <IconButton
                                                      size={"sm"}
                                                      variant={"ghost"}
                                                      aria-label="edit-workhours"
                                                      onClick={() =>
                                                        onEditWorkHours(
                                                          contractTypeId,
                                                          workHoursId,
                                                          effectiveDate,
                                                          day,
                                                          week,
                                                          month
                                                        )
                                                      }
                                                    >
                                                      <FiEdit />
                                                    </IconButton>
                                                    <IconButton
                                                      size={"sm"}
                                                      ml={"2"}
                                                      variant={"ghost"}
                                                      colorScheme="red"
                                                      aria-label="delete-workhours"
                                                      onClick={() =>
                                                        onDeleteWorkHoursConfirmation(
                                                          contractTypeId,
                                                          workHoursId,
                                                          effectiveDate,
                                                          day,
                                                          week,
                                                          month
                                                        )
                                                      }
                                                    >
                                                      <AiFillDelete />
                                                    </IconButton>
                                                  </>
                                                ) : null}
                                              </Td>
                                            </Tr>
                                          )
                                        )}
                                    </Tbody>
                                  </Table>
                                </TableContainer>
                              ) : (
                                <Flex
                                  minHeight={"100px"}
                                  justifyContent={"center"}
                                  alignItems={"center"}
                                >
                                  <Text fontSize={"sm"} color={"gray"}>
                                    No Data Found!
                                  </Text>
                                </Flex>
                              )}
                            </Flex>
                          ) : null}
                        </Flex>
                      </AccordionPanel>
                    </AccordionItem>
                  </Flex>
                );
              }
            )}
          </Accordion>
        </Flex>
      ) : isLoading ? (
        <AppLoader />
      ) : (
        <AppNoData />
      )}
      <Modal
        isOpen={isContractTypeModalOpen}
        onClose={onContractTypeModalClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Contract Type</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter here"
                value={contractTypeName}
                onChange={(e) => setContractTypeName(e.target.value)}
              />
            </FormControl>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Category</FormLabel>
              <AppSelect
                onChange={(value) => setContractTypeCategory(value)}
                value={contractTypeCategory}
                options={contractTypeCategories.map(({ label, value }) => ({
                  label,
                  value,
                }))}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Flex width={"full"} direction={"column"}>
              <Text
                width={"full"}
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
                      "Please double check the details, Contract Type can't be modified or deleted once created.",
                  }}
                ></span>
              </Text>
              <Flex justifyContent={"flex-end"}>
                <Button
                  variant="outline"
                  fontSize={"sm"}
                  mr={3}
                  onClick={onContractTypeModalClose}
                >
                  Close
                </Button>
                <Button
                  isDisabled={!contractTypeName || !contractTypeCategory}
                  onClick={onSaveContractTypeName}
                >
                  Save
                </Button>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isWeekOffModalOpen} onClose={onWeekOffModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{weekOffId ? "Edit" : "Add"} Week Offs</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Number of Week Offs</FormLabel>
              <Input
                placeholder="Enter here"
                type="number"
                value={weekOffNumbers}
                onChange={(e) => {
                  if (Number(e.target.value) > 7) {
                    setWeekOffNumbers("7");
                  } else {
                    setWeekOffNumbers(e.target.value);
                  }
                }}
              />
            </FormControl>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Select Year</FormLabel>
              <AppSelect
                onChange={(value) => {
                  setSelectedYear(value);
                  setWeekOffEffectiveDate("");
                }}
                options={
                  years?.length
                    ? years.map((year) => ({
                        label: year,
                        value: year,
                      }))
                    : []
                }
                value={selectedYear}
              />
            </FormControl>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Effective Week</FormLabel>
              <AppSelect
                onChange={(value) =>
                  setWeekOffEffectiveDate(moment(value).format("YYYY-MM-DD"))
                }
                options={weeks?.length ? getWeekList() : []}
                value={weekOffEffectiveDate}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onWeekOffModalClose}
            >
              Close
            </Button>
            <Button
              isDisabled={!weekOffNumbers || !weekOffEffectiveDate}
              onClick={onSaveWeekOffs}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isLeavePolicyModalOpen} onClose={onLeavePolicyModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {leavePolicyId ? "Edit" : "Add"} Leave Policy
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Leave Policy</FormLabel>
              <AppSelect
                onChange={(value) => setLeavePolicyType(value)}
                value={leavePolicyType}
                options={leavePolicyList.map(({ label, value }) => ({
                  label,
                  value,
                }))}
              />
            </FormControl>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Effective Year</FormLabel>
              <AppSelect
                value={leavePolicyEffectiveDate}
                options={years.map((year) => ({
                  label: year,
                  value: moment([year]).format("YYYY-MM-DD"),
                  isDisabled: year === new Date().getFullYear().toString(),
                }))}
                onChange={(date) => setLeavePolicyEffectiveDate(date)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onLeavePolicyModalClose}
            >
              Close
            </Button>
            <Button
              isDisabled={!leavePolicyType || !leavePolicyEffectiveDate}
              onClick={onSaveLeavePolicy}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isWorkHoursModalOpen} onClose={onWorkHoursModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{weekOffId ? "Edit" : "Add"} Work Hours</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Total Hours</FormLabel>
              <FormHelperText>Minimum 1 Required</FormHelperText>
            </FormControl>
            <Flex
              direction={"column"}
              border={"1px solid lightgray"}
              rounded={"md"}
              p={"4"}
              mb={"4"}
              background={"#d3d3d30f"}
            >
              <FormControl mb={"4"}>
                <FormLabel>In a Week</FormLabel>
                <Input
                  placeholder="Enter here"
                  type="number"
                  value={workHoursInWeekNumbers}
                  onChange={(e) => {
                    if (Number(e.target.value) <= 168) {
                      setWorkHoursInWeekNumbers(e.target.value);
                    } else {
                      setWorkHoursInWeekNumbers("168");
                    }
                  }}
                />
              </FormControl>
              <FormControl mb={"4"}>
                <FormLabel>In a Month</FormLabel>
                <Input
                  placeholder="Enter here"
                  type="number"
                  value={workHoursInMonthNumbers}
                  onChange={(e) => {
                    if (Number(e.target.value) <= 744) {
                      setWorkHoursInMonthNumbers(e.target.value);
                    } else {
                      setWorkHoursInMonthNumbers("744");
                    }
                  }}
                />
              </FormControl>
            </Flex>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Select Year</FormLabel>
              <AppSelect
                onChange={(value) => setSelectedYear(value)}
                options={
                  years?.length
                    ? years.map((year) => ({
                        label: year,
                        value: year,
                      }))
                    : []
                }
                value={selectedYear}
              />
            </FormControl>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Effective Week</FormLabel>
              <AppSelect
                onChange={(value) =>
                  setWorkHoursEffectiveDate(moment(value).format("YYYY-MM-DD"))
                }
                options={
                  weeks?.length
                    ? weeks
                        .filter(
                          ({ startDate }) =>
                            moment(startDate).unix() > moment().unix()
                        )
                        .map(({ startDate, number }) => ({
                          label: `Week ${number} (${formatDate(
                            startDate
                          )} onwards)`,
                          value: moment(startDate).format("YYYY-MM-DD"),
                        }))
                    : []
                }
                value={workHoursEffectiveDate}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onWorkHoursModalClose}
            >
              Close
            </Button>
            <Button
              isDisabled={
                !workHoursEffectiveDate ||
                (!workHoursInDayNumbers &&
                  !workHoursInWeekNumbers &&
                  !workHoursInMonthNumbers)
              }
              onClick={onSaveWorkHours}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isDeleteWeekOffModalOpen}
        onClose={onDeleteWeekOffModalClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Week Off</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onDeleteWeekOffModalClose}
            >
              Close
            </Button>
            <Button
              colorScheme="red"
              variant={"solid"}
              fontSize={"sm"}
              onClick={onDeleteWeekOff}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isDeleteWorkHoursModalOpen}
        onClose={onDeleteWorkHoursModalClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Work Hours's</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onDeleteWorkHoursModalClose}
            >
              Close
            </Button>
            <Button
              colorScheme="red"
              variant={"solid"}
              fontSize={"sm"}
              onClick={onDeleteWorkHours}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isDeleteLeavePolicyModalOpen}
        onClose={onDeleteLeavePolicyModalClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Leave Policy</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onDeleteLeavePolicyModalClose}
            >
              Close
            </Button>
            <Button
              colorScheme="red"
              fontSize={"sm"}
              variant={"solid"}
              onClick={onDeleteLeavePolicy}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppContainer>
  );
}

export default ManageContractTypes;
