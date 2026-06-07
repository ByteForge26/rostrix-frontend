import {
  Badge,
  Button,
  ButtonGroup,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
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
import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import { useApi } from "../../hooks/useApi";
import { ENDPOINT } from "../../config/endpoint.config";
import {
  IApiResponse,
  ICostCenter,
  ICostCenterResponse,
  IIntegration,
  IIntegrationLog,
} from "../../helper/Interface";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import { FiEdit, FiRefreshCw } from "react-icons/fi";
import { useToasts } from "react-toast-notifications";
import {
  formatDate,
  generateMonthsListing,
  getFinalMonthListing,
  renderPlaceholder,
  sortByFunc,
} from "../../helper/Utils";
import { MultiSelect, Option } from "react-multi-select-component";
import { DateRangePicker } from "react-date-range";
import moment from "moment";
import AppSelect from "../../components/AppSelect";
import AppRightDrawer from "../../components/AppRightDrawer";
import { NAV_HEIGHT } from "../../helper/Constant";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { cloneDeep } from "lodash";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSION } from "../../config/permission.config";
import AppTableHeadingWithSort from "../../components/AppTableHeadingWithSort";
import { useService } from "../../hooks/useService";

const MAPING = [
  {
    name: "Perfeco: Realised TO/Qty Sync",
    value: "REALISED_TO_QTY",
  },
  {
    name: "My Game: Piloted TO/Qty Sync",
    value: "PILOTED_TO_QTY",
  },
  {
    name: "My Game: Post Realised Hours",
    value: "POST_REALISED_HOURS",
  },
  {
    name: "My Offer: Cluster Sync",
    value: "CLUSTER",
  },
  {
    name: "My Game: Post Piloted Hours",
    value: "POST_PILOTED_HOURS",
  },
  {
    name: "My Game: Recommended Hours Sync",
    value: "RECOMMENDED_HOURS",
  },
];
function IntegratedJobSync() {
  const { get, post } = useApi();
  const { addToast, removeAllToasts } = useToasts();
  const { checkForPermission } = usePermission();
  const { costCenters, getCostCenters, onLoading, offLoading, isLoading } =
    useService();
  const [integrationList, setIntegrationList] = useState<IIntegration[]>([]);
  const [selectedJobEntity, setSelectedJobEntity] = useState("");
  const [selectedLogEntity, setSelectedLogEntity] = useState("");

  useEffect(() => {
    getAllIntegrationStatus();
    getCostCenters();
  }, []);
  const getAllIntegrationStatus = async () => {
    onLoading();
    const res = await get<IIntegration[]>(
      ENDPOINT["/integration-job"]["/status"],
    );
    offLoading();
    if (res?.length) {
      setIntegrationList(res);
    } else {
      setIntegrationList([]);
    }
  };

  const Card = (job: IIntegration) => {
    const {
      allowedFutureDate,
      allowedPastDate,
      costCentreBased,
      dateMode,
      jobEntity,
      refreshEndPointPath,
      lastManualUpdatedAt,
      lastScheduleUpdatedAt,
      manualUpdateStatus,
      scheduleUpdatedStatus,
    } = job;
    const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(false);
    const [selectedCostCenters, setSelectedCostCenters] = useState<Option[]>(
      [],
    );
    const {
      isOpen: isDateRangeOpen,
      onClose: onDateRangeClose,
      onOpen: onDateRangeOpen,
    } = useDisclosure();

    const [errorLogId, setErrorLogId] = useState<number>(0);

    const [selectedYearMonth, setSelectedYearMonth] = useState("");
    const [yearMonthListing, setYearMonthListing] = useState<
      { label: string; value: string }[]
    >([]);
    useEffect(() => {
      if (dateMode === "PAY_ROLL") getMonthListing();
    }, []);
    const getMonthListing = () => {
      if (allowedPastDate && allowedFutureDate) {
        const { listing, selectedYearMonth } = getFinalMonthListing({
          sDate: allowedPastDate,
          eDate: allowedFutureDate,
          disabledAfter: allowedFutureDate,
          minDate: allowedPastDate,
          maxDate: allowedFutureDate,
        });
        setYearMonthListing(listing);
        setSelectedYearMonth(selectedYearMonth);
      }
    };

    const [fromDate, setFromDate] = useState(
      allowedPastDate || moment().format("yyyy-MM-DD"),
    );
    const [toDate, setToDate] = useState(
      allowedFutureDate || moment().format("yyyy-MM-DD"),
    );
    const [tempFromDate, setTempFromDate] = useState(
      allowedPastDate || moment().format("yyyy-MM-DD"),
    );
    const [tempToDate, setTempToDate] = useState(
      allowedFutureDate || moment().format("yyyy-MM-DD"),
    );

    const [logs, setLogs] = useState<IIntegrationLog[]>();
    const [sortBy, setSortBy] = useState("dateOfExecution");
    const [sortMethodAsc, setSortMethodAsc] = useState(false);

    const [logFromDate, setLogFromDate] = useState("");
    const getIntegrationStatus = async () => {
      onLoading();
      const res = await get<IIntegration[]>(
        ENDPOINT["/integration-job"]["/status"] + `?jobType=${jobEntity}`,
      );
      offLoading();
      if (res?.length) {
        let tempIntegrationList = cloneDeep(integrationList).filter(
          (obj) => obj.jobEntity !== jobEntity,
        );
        tempIntegrationList.push(res[0]);
        setIntegrationList(tempIntegrationList);
      }
    };
    const onSync = async () => {
      setSelectedJobEntity("");
      const res = await post<IApiResponse>(
        ENDPOINT["/integration-job"][""] +
          `${refreshEndPointPath}` +
          (dateMode === "RANGE" || dateMode === "PAY_ROLL"
            ? `?fromDate=${fromDate}&toDate=${toDate}`
            : ""),
        {
          data: {
            costCentres: selectedCostCenters.length
              ? costCenters.length === selectedCostCenters.length
                ? []
                : selectedCostCenters.map(({ value }) => value)
              : undefined,
          },
        },
      );
      if (res.message) {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
      }
      if (res.success) {
        getIntegrationStatus();
      }
    };
    useEffect(() => {
      if (selectedYearMonth && dateMode === "PAY_ROLL") {
        const selectedStartDate = moment()
          .set("year", Number(selectedYearMonth.split("_")[0]))
          .set("month", Number(selectedYearMonth.split("_")[1]))
          .set("D", moment(allowedPastDate).get("D"))
          .subtract(1, "M")
          .set({
            h: 0,
            m: 0,
            s: 0,
          });
        const selectedEndDate = moment()
          .set("year", Number(selectedYearMonth.split("_")[0]))
          .set("month", Number(selectedYearMonth.split("_")[1]))
          .set("D", moment(allowedFutureDate).get("D"))
          .set({
            h: 0,
            m: 0,
            s: 0,
          });
        setFromDate(selectedStartDate.format("yyyy-MM-DD"));
        setToDate(selectedEndDate.format("yyyy-MM-DD"));
      }
    }, [selectedYearMonth]);

    const onApplyDateRange = () => {
      setFromDate(tempFromDate);
      setToDate(tempToDate);
      onDateRangeClose();
    };

    useEffect(() => {
      if (selectedLogEntity === jobEntity) {
        setLogFromDate(moment().add({ month: -3 }).format("yyyy-MM-DD"));
      }
    }, [selectedLogEntity]);
    useEffect(() => {
      if (logFromDate) {
        getLogs();
      }
    }, [logFromDate]);

    const getLogs = async () => {
      const res = await get<IIntegrationLog[]>(
        ENDPOINT["/integration-job"]["/error"] +
          `?jobType=${selectedLogEntity}&fromDate=${logFromDate}`,
      );
      setLogs(res);
    };
    return (
      <>
        <Flex
          background={"white"}
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
              {MAPING.find(({ value }) => value === jobEntity)?.name ??
                jobEntity}
            </Text>
            <Flex>
              <Button
                onClick={() => getIntegrationStatus()}
                size={"sm"}
                variant={"outline"}
                mr={"2"}
                isLoading={isLoading}
              >
                Update Status
              </Button>
              {checkForPermission(
                PERMISSION.Integration["Integrated Job Sync"]["Perform Sync"],
              ) ? (
                <Button
                  leftIcon={<FiRefreshCw />}
                  size={"sm"}
                  onClick={() => {
                    setSelectedJobEntity(jobEntity);
                    removeAllToasts();
                  }}
                >
                  Manual Sync
                </Button>
              ) : null}
              <AppRightDrawer
                isOpen={jobEntity === selectedJobEntity}
                heading={
                  MAPING.find(({ value }) => value === jobEntity)?.name ??
                  jobEntity
                }
                onClose={() => setSelectedJobEntity("")}
              >
                <Grid>
                  {costCentreBased ? (
                    <FormControl mb={"4"}>
                      <FormLabel>Select Cost Center</FormLabel>
                      <MultiSelect
                        options={costCenters
                          .sort((a, b) =>
                            (a.displayName || a.costCentreName).localeCompare(
                              b.displayName || b.costCentreName,
                            ),
                          )
                          .map(({ costCentreName, displayName }) => ({
                            label: `${displayName} (${costCentreName})`,
                            value: costCentreName,
                          }))}
                        value={selectedCostCenters}
                        onChange={(value: Option[]) => {
                          setSelectedCostCenters(value);
                        }}
                        labelledBy="Select Cost Center"
                        valueRenderer={(selected) => {
                          return selected?.length
                            ? selected.length === costCenters.length
                              ? "Cost Center (All)"
                              : renderPlaceholder(selected)
                            : "Select or type here...";
                        }}
                      />
                    </FormControl>
                  ) : null}
                  {dateMode === "PAY_ROLL" ? (
                    <FormControl mb={"4"} isRequired>
                      <FormLabel>Select Payroll Cycle</FormLabel>
                      <AppSelect
                        value={selectedYearMonth}
                        onChange={(value) => setSelectedYearMonth(value)}
                        options={
                          yearMonthListing?.length
                            ? yearMonthListing
                                .sort((a, b) => b.value.localeCompare(a.value))
                                .map(({ label, value }) => ({
                                  label,
                                  value,
                                }))
                            : []
                        }
                      />
                    </FormControl>
                  ) : null}
                  {dateMode === "RANGE" ? (
                    <>
                      <FormControl mb={"4"} isRequired>
                        <FormLabel>From Date</FormLabel>
                        <Input
                          value={moment(new Date(fromDate)).format(
                            "DD-MM-YYYY",
                          )}
                          onClick={onDateRangeOpen}
                        />
                      </FormControl>

                      <FormControl mb={"4"} isRequired>
                        <FormLabel>To Date</FormLabel>
                        <Input
                          value={moment(new Date(toDate)).format("DD-MM-YYYY")}
                          onClick={onDateRangeOpen}
                        />
                      </FormControl>
                    </>
                  ) : null}
                </Grid>

                <Button onClick={onSync}>Manual Sync</Button>
              </AppRightDrawer>
            </Flex>
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
                  value: lastScheduleUpdatedAt
                    ? formatDate(lastScheduleUpdatedAt, { time: true })
                    : "-",
                },
                {
                  label: "Status",
                  value: scheduleUpdatedStatus,
                  badge: scheduleUpdatedStatus
                    ? scheduleUpdatedStatus.toLowerCase() === "completed"
                      ? "green"
                      : scheduleUpdatedStatus.toLowerCase() ===
                          "completed_with_errors"
                        ? "yellow"
                        : "red"
                    : undefined,
                },
              ].map(({ label, value, badge }) => {
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
                        color={"black"}
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
                    ? manualUpdateStatus.toLowerCase() === "completed"
                      ? "green"
                      : manualUpdateStatus.toLowerCase() ===
                          "completed_with_errors"
                        ? "yellow"
                        : "red"
                    : undefined,
                },
              ].map(({ label, value, badge }) => {
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
                        color={"black"}
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
          <Flex justifyContent={"flex-end"} pt={"2"}>
            <Button
              variant={"outline"}
              size={"sm"}
              onClick={() => setSelectedLogEntity(jobEntity)}
            >
              See Logs
            </Button>
          </Flex>
        </Flex>
        <Drawer
          placement={"bottom"}
          onClose={() => setSelectedLogEntity("")}
          isOpen={jobEntity === selectedLogEntity}
          isFullHeight
        >
          <DrawerOverlay />
          <DrawerContent maxH={`calc(100vh - ${NAV_HEIGHT}px)`}>
            <DrawerCloseButton />
            <DrawerHeader
              borderBottomWidth="1px"
              display={"flex"}
              alignItems={"center"}
            >
              {`Logs | ${
                MAPING.find(({ value }) => value === jobEntity)?.name ??
                jobEntity
              } | From Date:`}
              {logFromDate ? (
                <Flex ml={"2"}>
                  <SingleDatepicker
                    date={moment(logFromDate).toDate()}
                    onDateChange={(date) => {
                      setLogFromDate(moment(date).format("YYYY-MM-DD"));
                    }}
                    configs={{
                      dateFormat: "dd-MM-yyyy",
                    }}
                    closeOnSelect
                  />
                </Flex>
              ) : null}
            </DrawerHeader>
            <DrawerBody p={"0"}>
              {logs ? (
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
                          Id
                        </Th>
                        <Th background="#EBF3F8" color="#616161">
                          <AppTableHeadingWithSort
                            value="dateOfExecution"
                            label="Execution Time"
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            sortMethodAsc={sortMethodAsc}
                            setSortMethodAsc={setSortMethodAsc}
                            number
                          />
                        </Th>
                        <Th background="#EBF3F8" color="#616161">
                          Type
                        </Th>
                        <Th background="#EBF3F8" color="#616161">
                          Status
                        </Th>
                        <Th background="#EBF3F8" color="#616161">
                          Date Range
                        </Th>
                        <Th background="#EBF3F8" color="#616161">
                          Input Parameters
                        </Th>
                        <Th background="#EBF3F8" color="#616161">
                          Errors
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody fontSize={"sm"}>
                      {cloneDeep(logs)
                        .sort(
                          (a, b) =>
                            new Date(b.dateOfExecution).getTime() -
                            new Date(a.dateOfExecution).getTime(),
                        )
                        .sort((a, b) => sortByFunc(a, b, sortBy, sortMethodAsc))
                        .map(
                          (
                            {
                              id,
                              dateOfExecution,
                              dateRange,
                              errors,
                              executionType,
                              parameters,
                              status,
                            },
                            i,
                          ) => (
                            <Tr key={id}>
                              <Td py={"3"}>{id}</Td>
                              <Td py={"3"}>
                                {formatDate(dateOfExecution, { time: true })}
                              </Td>
                              <Td py={"3"}>
                                <Badge
                                  variant={
                                    executionType.toLowerCase() === "manual"
                                      ? "subtle"
                                      : "outline"
                                  }
                                >
                                  {executionType}
                                </Badge>
                              </Td>
                              <Td py={"3"}>
                                <Badge
                                  colorScheme={
                                    status.toLowerCase() === "completed"
                                      ? "green"
                                      : status.toLowerCase() ===
                                          "completed_with_errors"
                                        ? "yellow"
                                        : "red"
                                  }
                                  variant={"outline"}
                                  margin={"auto 0"}
                                >
                                  {status}
                                </Badge>
                              </Td>
                              <Td py={"3"}>{dateRange}</Td>
                              <Td
                                py={"3"}
                                maxWidth={"420px"}
                                whiteSpace={"break-spaces"}
                              >
                                {parameters}
                              </Td>
                              <Td py={"3"}>
                                <Flex>
                                  {errors?.length ? (
                                    <Button
                                      color={"red"}
                                      size={"xs"}
                                      variant={"outline"}
                                      onClick={() => setErrorLogId(id)}
                                    >
                                      {`${errors.length} Error(s)`}
                                    </Button>
                                  ) : null}
                                </Flex>
                              </Td>
                              {errors?.length ? (
                                <Drawer
                                  placement={"bottom"}
                                  onClose={() => setErrorLogId(0)}
                                  isOpen={id === errorLogId}
                                >
                                  <DrawerOverlay />
                                  <DrawerContent
                                    maxH={`calc(100vh - ${NAV_HEIGHT * 2}px)`}
                                  >
                                    <DrawerCloseButton />
                                    <DrawerHeader
                                      borderBottomWidth="1px"
                                      borderTopWidth="1px"
                                      display={"flex"}
                                      alignItems={"center"}
                                    >
                                      {`Error(s) | ${formatDate(
                                        dateOfExecution,
                                      )}`}
                                    </DrawerHeader>
                                    <DrawerBody p={"0"}>
                                      <TableContainer
                                        background="white"
                                        width={"full"}
                                        border={"1px solid #F2F2F2"}
                                        borderRadius={"md"}
                                      >
                                        <Table variant="simple">
                                          <Thead height={"48px"}>
                                            <Tr>
                                              <Th
                                                background="#EBF3F8"
                                                color="#616161"
                                              >
                                                Id
                                              </Th>
                                              <Th
                                                background="#EBF3F8"
                                                color="#616161"
                                              >
                                                Cost Centre
                                              </Th>

                                              <Th
                                                background="#EBF3F8"
                                                color="#616161"
                                              >
                                                Error Message
                                              </Th>
                                            </Tr>
                                          </Thead>
                                          <Tbody fontSize={"sm"}>
                                            {errors.map(
                                              (
                                                {
                                                  id,
                                                  costCentre,
                                                  errorMessage,
                                                },
                                                i,
                                              ) => (
                                                <Tr key={id}>
                                                  <Td py={"3"}>{id}</Td>
                                                  <Td py={"3"}>{costCentre}</Td>
                                                  <Td py={"3"}>
                                                    {errorMessage}
                                                  </Td>
                                                </Tr>
                                              ),
                                            )}
                                          </Tbody>
                                        </Table>
                                      </TableContainer>
                                    </DrawerBody>
                                  </DrawerContent>
                                </Drawer>
                              ) : null}
                            </Tr>
                          ),
                        )}
                    </Tbody>
                  </Table>
                </TableContainer>
              ) : null}
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        <Modal
          isOpen={isDateRangeOpen}
          onClose={onDateRangeClose}
          size={"3xl"}
          scrollBehavior={"outside"}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{"Select Date Range"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody
              display={"flex"}
              justifyContent={"center"}
              minHeight={"330px"}
              className="no-options"
            >
              <DateRangePicker
                ranges={[
                  {
                    startDate: moment(tempFromDate).toDate(),
                    endDate: moment(tempToDate).toDate(),
                    key: "selection",
                  },
                ]}
                onChange={(r) => {
                  if (r["selection"].startDate) {
                    setTempFromDate(
                      moment(r["selection"].startDate).format("YYYY-MM-DD"),
                    );
                  }
                  if (r["selection"].endDate) {
                    setTempToDate(
                      moment(r["selection"].endDate).format("YYYY-MM-DD"),
                    );
                  }
                }}
                months={2}
                direction={"horizontal"}
                dateDisplayFormat={"dd MMM yyyy"}
                rangeColors={["#027DBC"]}
                minDate={moment(allowedPastDate || "").toDate()}
                maxDate={moment(allowedFutureDate || "").toDate()}
                staticRanges={[]}
                inputRanges={[]}
              />
            </ModalBody>

            <ModalFooter>
              <Button
                colorScheme="gray"
                variant={"ghost"}
                mr={3}
                onClick={onDateRangeClose}
                // size={"sm"}
                fontSize={"sm"}
              >
                Close
              </Button>
              <Button
                variant="solid"
                fontSize={"sm"}
                aria-label="model-apply"
                onClick={onDateRangeClose}
              >
                Apply
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  };

  return (
    <AppContainer heading="Integrated Job Sync" info="">
      <Flex overflow={"auto"}>
        {integrationList.length ? (
          <Grid
            gridTemplateColumns={"1fr 1fr"}
            width={"full"}
            gap={"4"}
            p={"2"}
          >
            {integrationList
              .sort((a, b) => a.jobEntity.localeCompare(b.jobEntity))
              .map((job, i) => {
                return <Card {...job} key={i} />;
              })}
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

export default IntegratedJobSync;
