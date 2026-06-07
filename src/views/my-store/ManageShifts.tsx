import { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import AppTabs from "../../components/AppTabs";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
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
import {
  IApiResponse,
  IClusterResponse,
  IShift,
  IStoreSecondaryJob,
} from "../../helper/Interface";
import { useApi } from "../../hooks/useApi";
import { ENDPOINT } from "../../config/endpoint.config";
import { useAppSelector } from "../../app/store/store";
import AppRightDrawer from "../../components/AppRightDrawer";
import AppSelect from "../../components/AppSelect";
import { useToasts } from "react-toast-notifications";
import { AiFillDelete } from "react-icons/ai";
import { PERMISSION } from "../../config/permission.config";
import { usePermission } from "../../hooks/usePermission";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import moment from "moment";
import {
  generateTimeSlots,
  getDuration,
  getIsPartTime,
  similerShiftExist,
  sortByFunc,
} from "../../helper/Utils";
import {
  COLORS,
  DEFAULT_CLOSE_TIME,
  DEFAULT_OPEN_TIME,
  DEFAULT_START_TIME,
  LAYOUT,
  LUNCH_INCLUDE,
  MAX_SHIFT_WITHOUT_LUNCH,
  MAX_SHIFT_WITH_LUNCH,
  TIME_GAP,
} from "../../helper/Constant";
import { BsSortAlphaDown, BsSortAlphaDownAlt } from "react-icons/bs";
import FormHelpText from "rsuite/esm/FormHelpText";
import AppTableHeadingWithSort from "../../components/AppTableHeadingWithSort";

function ManageShifts() {
  const { selectedCostCenterName, contractTypes } = useAppSelector(
    (state) => state.auth
  );
  const { get, post, Delete } = useApi();
  const { checkForPermission } = usePermission();
  const { addToast } = useToasts();
  const [tabValue, setTabValue] = useState(LAYOUT);
  const [shiftId, setShiftId] = useState(0);
  const [storeSecondaryJobs, setStoreSecondaryJobs] = useState<
    IStoreSecondaryJob[]
  >([]);
  const [clusterId, setClusterId] = useState(0);
  const [allCluster, setAllCluster] = useState<IClusterResponse[]>([]);
  const [err, setErr] = useState("");
  const {
    isOpen: isShiftDeleteConfirmationOpen,
    onClose: onShiftDeleteConfimationClose,
    onOpen: onShiftDeleteConfirmationOpen,
  } = useDisclosure();
  const [shifts, setShifts] = useState<IShift[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [startTime, setStartTime] = useState(DEFAULT_START_TIME);
  const [endTime, setEndTime] = useState("");
  const [contractTypeId, setContractTypeId] = useState(0);
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [filterClusterId, setFilterClusterId] = useState(0);
  const [filterContractTypeId, setFilterContractTypeId] = useState(0);
  const [sortBy, setSortBy] = useState("startTime");
  const [sortMethodAsc, setSortMethodAsc] = useState<boolean>(true);
  const startTimeSlots = generateTimeSlots(
    DEFAULT_OPEN_TIME,
    DEFAULT_CLOSE_TIME
  );
  const [endTimeSlots, setEndTimeSlots] =
    useState<{ label: string; value: string }[]>();
  useEffect(() => {
    if (selectedCostCenterName) {
      getStoreSecondaryJobs();
      getAllCluster();
    }
  }, [selectedCostCenterName]);
  useEffect(() => {
    setShifts([]);
    if (storeSecondaryJobs?.length && tabValue) getShifts();
  }, [tabValue, storeSecondaryJobs]);

  const getStoreSecondaryJobs = async () => {
    onLoading();
    const res = await get<IStoreSecondaryJob[]>(
      ENDPOINT["/secondary"]["/store-config"] + `/${selectedCostCenterName}`
    );
    offLoading();
    setStoreSecondaryJobs([
      { id: 0, costCentre: "", jobType: LAYOUT },
      ...(res?.length ? res : []),
    ]);
    // } else {
    // setStoreSecondaryJobs([]);
    // }
  };
  const getShifts = async () => {
    onLoading();
    const res = await get<IShift[]>(
      ENDPOINT["/shift"][""] + `/${selectedCostCenterName}?jobType=${tabValue}`
    );
    offLoading();
    if (res?.length) {
      setShifts(res);
    } else {
      setShifts([]);
    }
  };
  const getAllCluster = async () => {
    onLoading();
    const res = await get<IClusterResponse[]>(
      ENDPOINT["/cluster"][""] + `?costCentre=${selectedCostCenterName}`
    );
    offLoading();
    if (res?.length) {
      setAllCluster(res);
    } else {
      setAllCluster([]);
    }
  };
  const onAddShift = async () => {
    setStartTime(DEFAULT_START_TIME);
    setEndTime("");
    setContractTypeId(0);
    setClusterId(0);
    onOpen();
  };

  const onSaveShift = async () => {
    if (
      similerShiftExist({
        shifts,
        clusterId,
        contractTypeId,
        endTime,
        startTime,
      })
    ) {
      setErr("The shift you are trying to add already exists!");
      return;
    }
    setErr("");
    onClose();
    const res = await post<IApiResponse>(ENDPOINT["/shift"][""], {
      data: {
        costCentre: selectedCostCenterName,
        jobType: tabValue,
        startTime,
        endTime,
        contractTypeId,
        clusterId: clusterId ? clusterId : undefined,
      },
    });
    addToast(res.message, {
      appearance: res.success ? "success" : "error",
    });
    if (res.success) {
      getShifts();
    }
  };
  const onDeleteShift = async () => {
    onShiftDeleteConfimationClose();

    const res = await Delete<IApiResponse>(
      ENDPOINT["/shift"][""] + `/${shiftId}`
    );
    addToast(res.message, {
      appearance: res.success ? "success" : "error",
    });
    if (res.success) {
      getShifts();
    }
  };

  useEffect(() => {
    if (tabValue) {
      setFilterClusterId(0);
      setFilterContractTypeId(0);
    }
  }, [tabValue]);

  useEffect(() => {
    if (startTime && contractTypeId) {
      setEndTime("");
      if (startTime === DEFAULT_CLOSE_TIME) {
        setEndTimeSlots([]);
        return;
      }
      const newStartTime = moment(startTime, "HH:mm:ss")
        .add({ minutes: TIME_GAP })
        .format("HH:mm:ss");

      let newEndTime = moment(startTime, "HH:mm:ss")
        .add({
          hours: getIsPartTime({ contractTypeId, contractTypes })
            ? MAX_SHIFT_WITHOUT_LUNCH
            : MAX_SHIFT_WITH_LUNCH,
        })
        .format("HH:mm:ss");

      if (newEndTime < DEFAULT_CLOSE_TIME && newEndTime < startTime) {
        let newHours = getDuration(
          moment(startTime, "HH:mm:ss"),
          moment(DEFAULT_CLOSE_TIME, "HH:mm:ss")
        ).durationHours;

        newEndTime = moment(startTime, "HH:mm:ss")
          .add({ hours: newHours })
          .format("HH:mm:ss");
      }
      setEndTimeSlots(generateTimeSlots(newStartTime, newEndTime, startTime));
    }
  }, [startTime, contractTypeId]);

  return (
    <AppContainer
      heading="My Store Shifts"
      info="Maintain complete control over shift schedules by creating, editing, or deleting shift details for various jobs within your store."
    >
      <AppTabs
        setValue={setTabValue}
        value={tabValue}
        tabs={storeSecondaryJobs.map(({ jobType }) => ({
          name: jobType,
          value: jobType,
        }))}
      >
        {checkForPermission(
          PERMISSION["My Store"]["Manage Shifts"]["Update"]
        ) &&
        storeSecondaryJobs &&
        storeSecondaryJobs.length ? (
          <Button onClick={onAddShift}>+ Add Shift</Button>
        ) : null}
      </AppTabs>

      <Flex overflow={"auto"}>
        {shifts.length ? (
          <TableContainer
            background="white"
            width={"full"}
            border={"1px solid #F2F2F2"}
            borderRadius={"md"}
          >
            <Table variant="simple">
              <Thead height={"48px"}>
                <Tr>
                  <Th background="#EBF3F8" color="#616161">
                    Sr. No.
                  </Th>
                  {tabValue === LAYOUT ? (
                    <Th background="#EBF3F8" color="#616161">
                      Cluster
                    </Th>
                  ) : null}
                  <Th background="#EBF3F8" color="#616161">
                    Contract Type
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    <AppTableHeadingWithSort
                      value="startTime"
                      label="Shift Timings"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    Duration
                  </Th>

                  <Th background="#EBF3F8" color="#616161">
                    Lunch Duration
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody fontSize={"sm"}>
                <Tr>
                  <Td py={"3"}></Td>
                  {tabValue === LAYOUT ? (
                    <Td py={"3"}>
                      <Select
                        minWidth={"152px"}
                        size={"sm"}
                        value={filterClusterId}
                        onChange={(e) =>
                          setFilterClusterId(Number(e.target.value))
                        }
                      >
                        <option value="">- All -</option>
                        {Array.from(
                          new Set(shifts.map((item) => item.clusterId))
                        )
                          .filter((clusterId) => clusterId)
                          .map((clusterId) => {
                            const clusterName =
                              allCluster.find(({ id }) => id === clusterId)
                                ?.name ?? "";
                            return (
                              <option key={clusterId} value={clusterId}>
                                {clusterName}
                              </option>
                            );
                          })}
                      </Select>
                    </Td>
                  ) : null}

                  <Td py={"3"}>
                    <Select
                      size={"sm"}
                      value={filterContractTypeId}
                      onChange={(e) =>
                        setFilterContractTypeId(Number(e.target.value))
                      }
                    >
                      <option value="">- All -</option>

                      {Array.from(
                        new Set(shifts.map((item) => item.contractTypeId))
                      )
                        .filter((contractTypeId) => contractTypeId)
                        .map((contractTypeId) => {
                          const contractTypeName =
                            contractTypes && contractTypes.length
                              ? contractTypes.find(
                                  ({ id }) => id === contractTypeId
                                )?.name ?? ""
                              : "";
                          return (
                            <option key={contractTypeId} value={contractTypeId}>
                              {contractTypeName}
                            </option>
                          );
                        })}
                    </Select>
                  </Td>
                  <Td py={"3"}></Td>
                  <Td py={"3"}></Td>
                  <Td py={"3"}></Td>
                  <Td py={"3"}></Td>
                </Tr>
                {shifts
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .filter(({ clusterId }) => {
                    if (filterClusterId) {
                      return clusterId === filterClusterId;
                    }
                    return true;
                  })
                  .filter(({ contractTypeId }) => {
                    if (filterContractTypeId) {
                      return contractTypeId === filterContractTypeId;
                    }
                    return true;
                  })
                  .sort((a, b) => sortByFunc(a, b, sortBy, sortMethodAsc))
                  .map(
                    (
                      {
                        contractTypeId,
                        endTime,
                        id,
                        lunchHours,
                        startTime,
                        clusterId,
                      },
                      i
                    ) => (
                      <Tr key={id}>
                        <Td py={"3"}>{i + 1}</Td>
                        {tabValue === LAYOUT ? (
                          <Td py={"3"}>
                            <Flex
                              background={COLORS[clusterId % COLORS.length]}
                              justifyContent={"center"}
                              rounded={"sm"}
                              m={"1"}
                              py={"0.5"}
                              px={"2"}
                              width={"fit-content"}
                            >
                              <Text>
                                {allCluster.find(({ id }) => id === clusterId)
                                  ?.name ?? ""}
                              </Text>
                            </Flex>
                          </Td>
                        ) : null}
                        <Td py={"3"}>
                          {contractTypes && contractTypes.length
                            ? contractTypes.find(
                                ({ id }) => id === contractTypeId
                              )?.name
                            : ""}
                        </Td>
                        <Td py={"3"}>
                          {startTime && endTime
                            ? `${moment(startTime, "HH:mm:ss")
                                .format("h:mm A")
                                .replaceAll(":00", "")} - ${moment(
                                endTime,
                                "HH:mm:ss"
                              )
                                .format("h:mm A")
                                .replaceAll(":00", "")}`
                            : ""}
                        </Td>
                        <Td py={"3"}>
                          {
                            getDuration(
                              moment(startTime, "HH:mm:ss"),
                              moment(endTime, "HH:mm:ss")
                            ).text
                          }
                        </Td>

                        <Td py={"3"}>{`${
                          lunchHours ? `${lunchHours} hr` : lunchHours
                        }`}</Td>
                        <Td py={"3"}>
                          {checkForPermission(
                            PERMISSION["My Store"]["Manage Shifts"]["Update"]
                          ) && (
                            <Button
                              aria-label="deleteIcon"
                              leftIcon={<AiFillDelete />}
                              size={"sm"}
                              variant={"ghost"}
                              colorScheme="red"
                              color={"#e85f5f"}
                              onClick={() => {
                                setShiftId(id);
                                onShiftDeleteConfirmationOpen();
                              }}
                            >
                              Delete
                            </Button>
                          )}
                        </Td>
                      </Tr>
                    )
                  )}
              </Tbody>
            </Table>
          </TableContainer>
        ) : isLoading ? (
          <AppLoader />
        ) : (
          <AppNoData />
        )}
      </Flex>

      <AppRightDrawer
        isOpen={isOpen}
        onClose={onClose}
        heading={`Add Shift (${tabValue || "--"})`}
      >
        <Flex direction={"column"}>
          {tabValue === LAYOUT ? (
            <FormControl mb={"4"} isRequired>
              <FormLabel>Cluster</FormLabel>
              <AppSelect
                onChange={(value) => setClusterId(value)}
                value={clusterId}
                options={
                  allCluster?.length
                    ? allCluster
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .filter(({ editable }) => editable)
                        .map(({ id, name }) => ({
                          label: name,
                          value: id,
                        }))
                    : []
                }
              />
            </FormControl>
          ) : null}
          <FormControl mb={"4"} isRequired>
            <FormLabel>Contract Type</FormLabel>
            <AppSelect
              onChange={(value) => {
                setContractTypeId(value);
                setErr("");
              }}
              value={contractTypeId}
              options={
                contractTypes && contractTypes.length
                  ? contractTypes.map(({ id, name }) => ({
                      label: name,
                      value: id,
                    }))
                  : []
              }
            />
          </FormControl>
          <FormControl mb={"4"} isRequired>
            <FormLabel>Start Time</FormLabel>
            <AppSelect
              options={startTimeSlots}
              onChange={setStartTime}
              value={startTime}
            />
          </FormControl>
          <FormControl mb={"4"} isRequired>
            <FormLabel>End Time</FormLabel>
            <AppSelect
              options={endTimeSlots}
              onChange={setEndTime}
              value={endTime}
            />
            {getDuration(
              moment(startTime, "HH:mm:ss"),
              moment(endTime, "HH:mm:ss")
            ).durationHours >= LUNCH_INCLUDE ? (
              <FormHelpText>Lunch: 1hr</FormHelpText>
            ) : null}
          </FormControl>
        </Flex>

        <Flex direction={"column"}>
          {err ? (
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
                mb={"4"}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: err,
                  }}
                ></span>
              </Text>
            </Flex>
          ) : null}

          <Button
            width={"full"}
            mb={"4"}
            isDisabled={
              !contractTypeId ||
              !startTime ||
              !endTime ||
              (tabValue === LAYOUT && !clusterId ? true : false)
            }
            onClick={onSaveShift}
          >
            Save
          </Button>
        </Flex>
      </AppRightDrawer>
      <Modal
        isOpen={isShiftDeleteConfirmationOpen}
        onClose={onShiftDeleteConfimationClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Shift</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to Delete Shift?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onShiftDeleteConfimationClose}
            >
              Close
            </Button>
            <Button colorScheme="red" variant={"solid"} onClick={onDeleteShift}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppContainer>
  );
}

export default ManageShifts;
