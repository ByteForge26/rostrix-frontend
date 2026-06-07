import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import AppHeader from "../../components/AppHeader";
import {
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
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
  IMyLeaveResponse,
  IMyTeamLeavesResponse,
  IUserClusterInfoResponse,
} from "../../helper/Interface";
import { useApi } from "../../hooks/useApi";
import { ENDPOINT } from "../../config/endpoint.config";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import {
  BsChevronDown,
  BsSearch,
  BsSortAlphaDown,
  BsSortAlphaDownAlt,
  BsSortNumericDown,
  BsSortNumericDownAlt,
} from "react-icons/bs";
import { useAppSelector } from "../../app/store/store";
import { COLORS, GLOBAL_VIEW_ROLES, NAV_HEIGHT } from "../../helper/Constant";
import LeaveHistory from "./LeaveHistory";
import AppTableHeadingWithSort from "../../components/AppTableHeadingWithSort";
import { sortByFunc } from "../../helper/Utils";
import LeavesWeekOffs from "./LeavesWeekOffs";
import { FiMoreHorizontal, FiMoreVertical } from "react-icons/fi";

function MyTeamLeaves() {
  const { get } = useApi();
  const today = new Date();
  const { selectedCostCenterName } = useAppSelector((state) => state.auth);
  const [year, setYear] = useState(today.getFullYear());
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [empList, setEmpList] = useState<
    IMyTeamLeavesResponse["empLeaveSummaryList"]
  >([]);
  const [searchKey, setSearchKey] = useState("");
  const [sortBy, setSortBy] = useState("firstName");
  const [sortMethodAsc, setSortMethodAsc] = useState<boolean>(true);
  const [filterClusterName, setFilterClusterName] = useState("");
  const {
    isOpen: isLeaveHistoryOpen,
    onClose: onLeaveHistoryClose,
    onOpen: onLeaveHistoryOpen,
  } = useDisclosure();
  const {
    isOpen: isLeaveApplyOpen,
    onClose: onLeaveApplyClose,
    onOpen: onLeaveApplyOpen,
  } = useDisclosure();
  const [empId, setEmpId] = useState("");
  const [leavesData, setLeavesData] = useState<IMyLeaveResponse>();

  useEffect(() => {
    if (selectedCostCenterName && year && isLeaveApplyOpen === false) {
      getMyTeamLeaves();
    }
  }, [selectedCostCenterName, year, isLeaveApplyOpen]);

  const getMyTeamLeaves = async () => {
    const params = {
      costCentre: selectedCostCenterName,
      year: year,
    };
    onLoading();
    const res = await get<IMyTeamLeavesResponse>(
      ENDPOINT["/leave"]["/my-team-leaves"],
      {
        params,
      }
    );
    offLoading();
    if (res?.empLeaveSummaryList?.length) {
      setEmpList(res.empLeaveSummaryList);
    } else {
      setEmpList([]);
    }
  };
  const onView = (empId: string) => {
    onLeaveHistoryOpen();
    setEmpId(empId);
  };
  const onApply = (empId: string) => {
    onLeaveApplyOpen();
    setEmpId(empId);
  };
  useEffect(() => {
    if (empId && isLeaveHistoryOpen) {
      getEmpLeaves();
    }
  }, [empId, isLeaveHistoryOpen]);
  const getEmpLeaves = async () => {
    setLeavesData(undefined);
    const res = await get<IMyLeaveResponse>(
      ENDPOINT["/leave"]["/my-leaves"] + `/${empId}`,
      {
        params: {
          year: year,
        },
      }
    );
    if (res?.stateId) {
      setLeavesData(res);
    } else {
      setLeavesData(undefined);
    }
  };

  return (
    <AppContainer
      heading="My Team Leaves"
      info="Dive into your team's leave plans, including planned and availed leaves, to effectively manage team availability and workload."
    >
      <AppHeader justifyContentLeft>
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
        <InputGroup width={"fit-content"}>
          <InputLeftElement pointerEvents="none">
            <BsSearch color="gray.300" />
          </InputLeftElement>
          <Input
            background={"white"}
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            placeholder="Search here"
            width={"fit-content"}
          />
        </InputGroup>
      </AppHeader>
      <Flex overflow={"auto"}>
        {empList?.length ? (
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
                    Action
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    Sr. No.
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
                      value="firstName"
                      label="Name"
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
                    <AppTableHeadingWithSort
                      value="totalAllowed"
                      label="Total Allowed"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                      number
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    <AppTableHeadingWithSort
                      value="plannedGeneral"
                      label="General (Planned)"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                      number
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    <AppTableHeadingWithSort
                      value="availedGeneral"
                      label="General (Availed)"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                      number
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    <AppTableHeadingWithSort
                      value="plannedLop"
                      label="LOP (Planned)"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                      number
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    <AppTableHeadingWithSort
                      value="availedLop"
                      label="LOP (Availed)"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                      number
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    Maternity/Paternity
                  </Th>
                </Tr>
              </Thead>
              <Tbody fontSize={"sm"}>
                <Tr>
                  <Td py={"3"}></Td>
                  <Td py={"3"}></Td>
                  <Td py={"3"}></Td>
                  <Td py={"3"}></Td>
                  <Td py={"3"}>
                    <Select
                      minWidth={"152px"}
                      size={"sm"}
                      value={filterClusterName}
                      onChange={(e) => setFilterClusterName(e.target.value)}
                    >
                      <option value="">- All -</option>
                      <option value="unassigned">- Unassigned -</option>
                      {Array.from(
                        new Set(empList.map((item) => item.clusterName))
                      )
                        .filter((clusterName) => clusterName)
                        .map((clusterName) => (
                          <option key={clusterName} value={clusterName}>
                            {clusterName}
                          </option>
                        ))}
                    </Select>
                  </Td>
                  <Td py={"3"}></Td>
                  <Td py={"3"}></Td>
                  <Td py={"3"}></Td>
                  <Td py={"3"}></Td>
                  <Td py={"3"}></Td>
                  <Td py={"3"}></Td>
                </Tr>
                {empList
                  .filter(
                    ({ firstName, lastName, empId, clusterName }) =>
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
                        .includes(searchKey.trim().toLowerCase()) ||
                      (clusterName || "")
                        .trim()
                        .toLowerCase()
                        .includes(searchKey.trim().toLowerCase())
                  )
                  .filter(({ clusterName }) => {
                    if (filterClusterName) {
                      if (
                        filterClusterName === "unassigned" &&
                        (!clusterName ||
                          clusterName === undefined ||
                          clusterName === null)
                      ) {
                        return true;
                      }
                      return clusterName === filterClusterName;
                    }

                    return true;
                  })
                  .sort((a, b) => sortByFunc(a, b, sortBy, sortMethodAsc))
                  .map(
                    (
                      {
                        availedGeneral,
                        availedLop,
                        clusterName,
                        clusterId,
                        empId,
                        firstName,
                        lastName,
                        matOrPatAvailed,
                        plannedGeneral,
                        plannedLop,
                        totalAllowed,
                      },
                      i
                    ) => (
                      <Tr key={empId}>
                        <Td py={"3"}>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<FiMoreVertical />}
                              size={"sm"}
                              variant={"ghost"}
                              aria-label="Options"
                            ></MenuButton>
                            <MenuList>
                              <MenuItem onClick={() => onApply(empId)}>
                                Manage Leave/Week Off
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                        <Td py={"3"}>{i + 1}</Td>
                        <Td py={"3"}>
                          <Text
                            onClick={() => onView(empId)}
                            color={"#027DBC"}
                            cursor={"pointer"}
                          >
                            {empId}
                          </Text>
                        </Td>
                        <Td py={"3"}>{firstName + " " + lastName}</Td>

                        <Td py={"3"}>
                          {clusterId && clusterName ? (
                            <Flex
                              background={COLORS[clusterId % COLORS.length]}
                              justifyContent={"center"}
                              rounded={"sm"}
                              m={"1"}
                              py={"0.5"}
                              px={"2"}
                              width={"fit-content"}
                            >
                              <Text>{clusterName}</Text>
                            </Flex>
                          ) : null}
                        </Td>
                        <Td py={"3"} textAlign={"center"}>
                          {totalAllowed}
                        </Td>

                        <Td py={"3"} textAlign={"center"}>
                          {plannedGeneral}
                        </Td>
                        <Td py={"3"} textAlign={"center"}>
                          {availedGeneral}
                        </Td>
                        <Td py={"3"} textAlign={"center"}>
                          {plannedLop}
                        </Td>
                        <Td py={"3"} textAlign={"center"}>
                          {availedLop}
                        </Td>

                        <Td py={"3"}>
                          {matOrPatAvailed ? (
                            <Badge colorScheme={"green"} variant={"outline"}>
                              Yes
                            </Badge>
                          ) : null}
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
      <LeaveHistory
        isLeaveHistoryOpen={isLeaveHistoryOpen}
        leavesData={leavesData}
        onLeaveHistoryClose={onLeaveHistoryClose}
        canCancelLeave={false}
        empName={
          (empList.find((obj) => obj.empId === empId)?.firstName ?? "") +
          ` ${empList.find((obj) => obj.empId === empId)?.lastName ?? ""}`
        }
        year={year}
      />
      <Drawer
        placement={"bottom"}
        onClose={onLeaveApplyClose}
        isOpen={isLeaveApplyOpen}
        isFullHeight
      >
        <DrawerOverlay />
        <DrawerContent maxH={`calc(100vh - ${0}px)`}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            {`Manage Leave/Week Off | ${
              (empList.find((obj) => obj.empId === empId)?.firstName ?? "") +
              ` ${empList.find((obj) => obj.empId === empId)?.lastName ?? ""}`
            } | ${year}`}
          </DrawerHeader>
          <DrawerBody>
            <LeavesWeekOffs
              empId={empId}
              empName={
                (empList.find((obj) => obj.empId === empId)?.firstName ?? "") +
                ` ${empList.find((obj) => obj.empId === empId)?.lastName ?? ""}`
              }
              contractTypeId={
                empList.find((obj) => obj.empId === empId)?.contractTypeId ?? 0
              }
              stateId={empList.find((obj) => obj.empId === empId)?.stateId ?? 0}
              applyBy="LEADER"
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </AppContainer>
  );
}

export default MyTeamLeaves;
