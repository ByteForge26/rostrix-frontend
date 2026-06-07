import {
  useBoolean,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Badge,
  Button,
  Checkbox,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
} from "@chakra-ui/react";
import { addMonths } from "date-fns";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  BsSortNumericDown,
  BsSortNumericDownAlt,
  BsSortAlphaDown,
  BsSortAlphaDownAlt,
  BsSearch,
} from "react-icons/bs";
import { useAppSelector } from "../../app/store/store";
import { ENDPOINT } from "../../config/endpoint.config";
import { MONTHS_SHORT, NAV_HEIGHT } from "../../helper/Constant";
import {
  IPayrollConfig,
  IMyTeamHours,
  IApiResponse,
} from "../../helper/Interface";
import { useApi } from "../../hooks/useApi";
import AppContainer from "../../components/AppContainer";
import AppHeader from "../../components/AppHeader";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import AppSelect from "../../components/AppSelect";
import AppTabs from "../../components/AppTabs";
import { useToasts } from "react-toast-notifications";
import {
  formatDate,
  generateMonthsListing,
  getFinalMonthListing,
  sortByFunc,
} from "../../helper/Utils";
import AppTableHeadingWithSort from "../../components/AppTableHeadingWithSort";
import { cloneDeep } from "lodash";
import { useService } from "../../hooks/useService";

const approvalStatusTypes = [
  {
    name: "Pending",
    value: "PENDING",
  },
  {
    name: "Approved",
    value: "APPROVED",
  },
];

function HoursApproval() {
  const { get, post } = useApi();
  const { addToast } = useToasts();
  const [searchKey, setSearchKey] = useState("");
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const { user, selectedCostCenterName } = useAppSelector(
    (state) => state.auth,
  );
  const [selectedYearMonth, setSelectedYearMonth] = useState("");
  const [yearMonthListing, setYearMonthListing] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const { getPayrollConfig, payrollConfig } = useService();
  const [teamWorkHours, setTeamWorkHours] = useState<IMyTeamHours>();
  const [sortBy, setSortBy] = useState("name");
  const [sortMethodAsc, setSortMethodAsc] = useState<boolean>(true);
  const [approvalStatus, setApprovalStatus] = useState(
    approvalStatusTypes[0].value,
  );
  const [ids, setIds] = useState<number[]>([]);
  const [selectedLogId, setSelectedLogId] = useState(0);
  const [logs, setLogs] =
    useState<IMyTeamHours["finalisedWorkHoursList"][0]["approvalLogs"]>();

  useEffect(() => {
    setIds([]);
    getPayrollConfig();
  }, []);

  useEffect(() => {
    if (payrollConfig) {
      getMonthListing();
    }
  }, [payrollConfig]);
  const getMonthListing = () => {
    if (payrollConfig) {
      const { listing, selectedYearMonth } = getFinalMonthListing({
        sDate: payrollConfig.currentPStartDateTime,
        eDate: payrollConfig.currentPEndDateTime,
        disabledAfter: payrollConfig.currentPEndDateTime,
      });
      setYearMonthListing(listing);
      setSelectedYearMonth(selectedYearMonth);
    }
  };
  useEffect(() => {
    if (selectedYearMonth && approvalStatus) {
      setIds([]);
      getTeamHours();
    }
  }, [selectedYearMonth, approvalStatus]);
  const getTeamHours = async () => {
    if (!payrollConfig) return;
    setTeamWorkHours(undefined);
    onLoading();
    const startDate = moment(payrollConfig.currentPStartDateTime).get("D");
    const endDate = moment(payrollConfig.currentPEndDateTime).get("D");
    let fromDate = moment(
      `${
        selectedYearMonth.split("_")[1] === "00"
          ? Number(selectedYearMonth.split("_")[0]) - 1
          : selectedYearMonth.split("_")[0]
      }-${
        selectedYearMonth.split("_")[1] === "00"
          ? "12"
          : selectedYearMonth.split("_")[1]
      }-${startDate.toString().padStart(2, "0")}`,
    );

    let toDate = moment(
      `${
        selectedYearMonth.split("_")[1] === "00"
          ? Number(selectedYearMonth.split("_")[0]) - 1
          : selectedYearMonth.split("_")[0]
      }-${
        selectedYearMonth.split("_")[1] === "00"
          ? "12"
          : selectedYearMonth.split("_")[1]
      }-${endDate.toString().padStart(2, "0")}`,
    ).add({
      month: 1,
    });
    const res = await get<IMyTeamHours>(
      ENDPOINT["/hours"]["/my-team-hours"] + `/${user?.empId}`,
      {
        params: {
          costCentre: selectedCostCenterName,
          fromDate: fromDate.format("YYYY-MM-DD"),
          toDate: toDate.format("YYYY-MM-DD"),
          empId: user?.empId,
          approvalStatus,
          type: "PAYROLL_MONTH",
        },
      },
    );
    offLoading();
    if (res.success) {
      setTeamWorkHours(res);
    } else {
      setTeamWorkHours(undefined);
    }
  };

  const isValid = () => {
    let valid = false;
    if (payrollConfig) {
      const today = moment();
      // today.set({ date: 20 });
      // today.set({ hours: 17 });

      const manualHourStartTime = moment(
        payrollConfig.currentManualHourStartTime,
      );
      const manualHourEndTime = moment(payrollConfig.currentManualHourEndTime);

      if (today.unix() >= manualHourStartTime.unix()) {
        if (today.unix() <= manualHourEndTime.unix()) {
          valid = true;
        }
      }
    }
    return valid;
  };
  const aprrove = async (ids: number[]) => {
    if (payrollConfig) {
      const dateOfProcessing = moment()
        .set("year", Number(selectedYearMonth.split("_")[0]))
        .set("month", Number(selectedYearMonth.split("_")[1]))
        .set("D", moment(payrollConfig.currentPEndDateTime).get("D"))
        .format("YYYY-MM-DD");
      const res = await post<IApiResponse>(ENDPOINT["/hours"]["/approve"], {
        data: {
          ids,
          dateOfProcessing,
        },
      });

      addToast(res?.message, {
        appearance: res.success ? "success" : "error",
      });
      if (res.success) {
        setIds([]);
        getTeamHours();
      }
    }
  };
  return (
    <AppContainer heading="Hours Approval" info="">
      <AppTabs
        setValue={setApprovalStatus}
        value={approvalStatus}
        tabs={approvalStatusTypes}
      ></AppTabs>
      <AppHeader justifyContentLeft>
        <AppSelect
          value={selectedYearMonth}
          onChange={(value) => setSelectedYearMonth(value)}
          options={
            yearMonthListing?.length
              ? yearMonthListing
                  .sort((a, b) => b.value.localeCompare(a.value))
                  .map(({ label, value, isDisabled }) => ({
                    label,
                    value,
                    isDisabled,
                  }))
              : []
          }
        />
        {approvalStatus === "PENDING" &&
        teamWorkHours &&
        teamWorkHours.finalisedWorkHoursList &&
        teamWorkHours.finalisedWorkHoursList.length &&
        isValid() ? (
          <Flex>
            {ids.length ? (
              <Button variant={"outline"} mr={"2"} onClick={() => aprrove(ids)}>
                Approve Selected
              </Button>
            ) : null}

            <Button
              onClick={() =>
                aprrove(
                  teamWorkHours.finalisedWorkHoursList
                    ? teamWorkHours.finalisedWorkHoursList.map(({ id }) => id)
                    : [],
                )
              }
            >
              Approve All
            </Button>
          </Flex>
        ) : null}
      </AppHeader>
      <Flex overflow={"auto"}>
        {teamWorkHours?.status === "FINALISED" &&
        teamWorkHours.finalisedWorkHoursList?.length ? (
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
                    {approvalStatus === "PENDING" && isValid() ? "" : "Sr. no."}
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    <AppTableHeadingWithSort
                      value="name"
                      label="Employee"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    <AppTableHeadingWithSort
                      value="empId"
                      label="Employee Id"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    <AppTableHeadingWithSort
                      value="contractTypeName"
                      label="Contract Type"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    <AppTableHeadingWithSort
                      value="clusterName"
                      label="Cluster"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    Approval Status
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    <AppTableHeadingWithSort
                      value="numWorkingHours"
                      label="Working Hours"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                      number
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    <AppTableHeadingWithSort
                      value="manualHours"
                      label="Manual Hours"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                      number
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    <AppTableHeadingWithSort
                      value="totalHours"
                      label="Total Hours"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                      number
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    LOP's
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    <AppTableHeadingWithSort
                      value="numWorkingHolidays"
                      label="Working Holidays"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                      number
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    Logs
                  </Th>
                </Tr>
              </Thead>
              <Tbody fontSize={"sm"}>
                {teamWorkHours.finalisedWorkHoursList
                  .sort((a, b) => sortByFunc(a, b, sortBy, sortMethodAsc))
                  .filter(
                    ({ name, empId, contractTypeName, clusterName }) =>
                      name
                        .trim()
                        .toLowerCase()
                        .includes(searchKey.trim().toLowerCase()) ||
                      empId
                        .trim()
                        .toLowerCase()
                        .includes(searchKey.trim().toLowerCase()) ||
                      contractTypeName
                        .trim()
                        .toLowerCase()
                        .includes(searchKey.trim().toLowerCase()) ||
                      (clusterName || "")
                        .trim()
                        .toLowerCase()
                        .includes(searchKey.trim().toLowerCase()),
                  )
                  .map(
                    (
                      {
                        id,
                        contractTypeName,
                        empId,
                        name,
                        numWorkingHolidays,
                        approvalStatus,
                        manualHours,
                        numLop,
                        numWorkingHours,
                        totalHours,
                        clusterName,
                        approvalLogs,
                      },
                      i,
                    ) => (
                      <Tr key={id}>
                        <Td py={"3"}>
                          {approvalStatus === "PENDING" && isValid() ? (
                            <Checkbox
                              isChecked={ids.includes(id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setIds((old) => [...old, id]);
                                } else {
                                  setIds((old) => [
                                    ...old.filter((v) => v !== id),
                                  ]);
                                }
                              }}
                            />
                          ) : (
                            i + 1
                          )}
                        </Td>
                        <Td py={"3"}>{name}</Td>
                        <Td py={"3"}>{empId}</Td>
                        <Td py={"3"}>
                          <Badge
                            colorScheme={
                              contractTypeName.toLowerCase() === "full time"
                                ? "green"
                                : "gray"
                            }
                            variant={"outline"}
                          >
                            {contractTypeName}
                          </Badge>
                        </Td>
                        <Td py={"3"}>{clusterName}</Td>
                        <Td py={"3"}>
                          <Flex
                            background={
                              approvalStatus === "PENDING"
                                ? "#FFEFE7"
                                : "#DAF6E3"
                            }
                            py={"0.5"}
                            px={"2"}
                            width={"fit-content"}
                            rounded={"sm"}
                          >
                            <Text
                              fontSize={"xs"}
                              color={
                                approvalStatus === "PENDING"
                                  ? "#DD4900"
                                  : "#009660"
                              }
                              fontWeight={"medium"}
                            >
                              {approvalStatus}
                            </Text>
                          </Flex>
                        </Td>
                        <Td py={"3"} textAlign={"center"}>
                          {numWorkingHours}
                        </Td>
                        <Td py={"3"} textAlign={"center"}>
                          {manualHours}
                        </Td>
                        <Td py={"3"} textAlign={"center"}>
                          <Text fontWeight={"medium"}>{totalHours}</Text>
                        </Td>
                        <Td py={"3"} textAlign={"center"}>
                          {numLop}
                        </Td>
                        <Td py={"3"} textAlign={"center"}>
                          {numWorkingHolidays}
                        </Td>
                        <Td py={"3"} textAlign={"center"}>
                          {approvalLogs?.length ? (
                            <Button
                              variant={"outline"}
                              size={"sm"}
                              onClick={() => {
                                setSelectedLogId(id);
                                setLogs(approvalLogs);
                              }}
                            >
                              View
                            </Button>
                          ) : null}

                          <Drawer
                            placement={"bottom"}
                            onClose={() => {
                              setSelectedLogId(0);
                              setLogs([]);
                            }}
                            isOpen={id === selectedLogId}
                            isFullHeight
                          >
                            <DrawerOverlay />
                            <DrawerContent
                              maxH={`calc(100vh - ${NAV_HEIGHT}px)`}
                            >
                              <DrawerCloseButton data-testid="drawer-close" />
                              <DrawerHeader
                                borderBottomWidth="1px"
                                display={"flex"}
                                alignItems={"center"}
                              >
                                {`Approval Logs | ${name} :`}
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
                                          <Th
                                            background="#EBF3F8"
                                            color="#616161"
                                          >
                                            Version
                                          </Th>
                                          <Th
                                            background="#EBF3F8"
                                            color="#616161"
                                          >
                                            Action User
                                          </Th>
                                          <Th
                                            background="#EBF3F8"
                                            color="#616161"
                                          >
                                            Action User Email
                                          </Th>
                                          <Th
                                            background="#EBF3F8"
                                            color="#616161"
                                          >
                                            Action User Employee ID
                                          </Th>
                                          <Th
                                            background="#EBF3F8"
                                            color="#616161"
                                          >
                                            Comment
                                          </Th>
                                          <Th
                                            background="#EBF3F8"
                                            color="#616161"
                                          >
                                            Status
                                          </Th>
                                          <Th
                                            background="#EBF3F8"
                                            color="#616161"
                                          >
                                            Action At
                                          </Th>
                                        </Tr>
                                      </Thead>
                                      <Tbody fontSize={"sm"}>
                                        {cloneDeep(logs)
                                          .sort((a, b) => b.version - a.version)
                                          .map(
                                            (
                                              {
                                                actionTimestamp,
                                                comment,
                                                email,
                                                empId,
                                                name,
                                                status,
                                                version,
                                              },
                                              i,
                                            ) => (
                                              <Tr key={version}>
                                                <Td py={"3"}>{version}</Td>
                                                <Td py={"3"}>{name}</Td>
                                                <Td py={"3"}>{email}</Td>
                                                <Td py={"3"}>{empId}</Td>
                                                <Td
                                                  py={"3"}
                                                  maxWidth={"420px"}
                                                  whiteSpace={"break-spaces"}
                                                >
                                                  {comment}
                                                </Td>
                                                <Td py={"3"}>{status}</Td>
                                                <Td py={"3"}>
                                                  {formatDate(actionTimestamp, {
                                                    time: true,
                                                  })}
                                                </Td>
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
                        </Td>
                      </Tr>
                    ),
                  )}
              </Tbody>
            </Table>
          </TableContainer>
        ) : isLoading ? (
          <AppLoader />
        ) : (
          <AppNoData msg={teamWorkHours?.message || ""} />
        )}
      </Flex>
    </AppContainer>
  );
}

export default HoursApproval;
