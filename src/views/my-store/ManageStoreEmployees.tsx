import {
  useBoolean,
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
  Button,
  Badge,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BsSearch, BsSortAlphaDown, BsSortAlphaDownAlt } from "react-icons/bs";
import { useToasts } from "react-toast-notifications";
import AppContainer from "../../components/AppContainer";
import AppHeader from "../../components/AppHeader";
import { ENDPOINT } from "../../config/endpoint.config";
import { PERMISSION } from "../../config/permission.config";
import { IRoleResponse, IUserResponse } from "../../helper/Interface";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import BasicDetails from "../profile/BasicDetails";
import RolesDetails from "../profile/RolesDetails";
import { useAppSelector } from "../../app/store/store";
import { FiEdit } from "react-icons/fi";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import { COLORS } from "../../helper/Constant";
import _ from "lodash";
import AppTableHeadingWithSort from "../../components/AppTableHeadingWithSort";
import { sortByFunc } from "../../helper/Utils";

function ManageStoreEmployees() {
  const { get } = useApi();
  const { addToast } = useToasts();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [searchKey, setSearchKey] = useState("");
  const { selectedCostCenterName } = useAppSelector((state) => state.auth);
  const { checkForPermission } = usePermission();
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [userDetails, setUserDetails] = useState<IUserResponse>();
  const [allRoles, setAllRoles] = useState<IRoleResponse[]>([]);
  const [allUsers, setAllUsers] = useState<IUserResponse[]>([]);
  const [sortBy, setSortBy] = useState("firstName");
  const [sortMethodAsc, setSortMethodAsc] = useState<boolean>(true);
  const [filterClusterName, setFilterClusterName] = useState("");
  const [filterContractTypeName, setFilterContractTypeName] = useState("");
  const [filterRoleId, setFilterRoleId] = useState("");
  const getAllUsers = async () => {
    onLoading();
    const res = await get<IUserResponse[]>(
      ENDPOINT["/user"]["/cost-centre"] +
        `/${selectedCostCenterName}?detailed=true`
    );
    offLoading();
    if (res?.length) {
      setAllUsers(res);
    } else {
      setAllUsers([]);
    }
  };
  const getAllRoles = async () => {
    const res = await get<IRoleResponse[]>(ENDPOINT["/access"]["/roles"]);
    setAllRoles(res);
  };
  useEffect(() => {
    getAllRoles();
  }, []);

  useEffect(() => {
    if (selectedCostCenterName) {
      getAllUsers();
    }
  }, [selectedCostCenterName]);

  const onView = (empId: string) => {
    onOpen();
    setUserDetails(allUsers.find((obj) => obj.empId === empId));
  };
  const getRoles = () => {
    const roles: number[] = [];
    allUsers.forEach(({ userRolesDetails }) => {
      if (userRolesDetails?.length)
        userRolesDetails.forEach(({ roleId }) => {
          roles.push(roleId);
        });
    });
    return _.uniq(roles);
  };

  return (
    <AppContainer
      heading="Store Employees"
      info="Access information about your store employees & assign/edit their roles across cost centers."
    >
      <AppHeader>
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
        {allUsers.length ? (
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
                    Roles
                  </Th>
                  {checkForPermission(
                    PERMISSION["My Store"]["Manage Store Employees"].Update
                  ) ? (
                    <Th background="#EBF3F8" color="#616161">
                      Action
                    </Th>
                  ) : null}
                </Tr>
              </Thead>
              <Tbody fontSize={"sm"}>
                <Tr>
                  <Td py={"3"}></Td>
                  <Td py={"3"}></Td>
                  <Td py={"3"}></Td>
                  <Td py={"3"}>
                    <Select
                      size={"sm"}
                      data-testid="filter-contract-type"
                      value={filterContractTypeName}
                      onChange={(e) =>
                        setFilterContractTypeName(e.target.value)
                      }
                    >
                      <option value="">- All -</option>

                      {Array.from(
                        new Set(allUsers.map((item) => item.contractTypeName))
                      )
                        .filter((contractTypeName) => contractTypeName)
                        .map((contractTypeName) => (
                          <option
                            key={contractTypeName}
                            value={contractTypeName}
                          >
                            {contractTypeName}
                          </option>
                        ))}
                    </Select>
                  </Td>
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
                        new Set(allUsers.map((item) => item.clusterName))
                      )
                        .filter((clusterName) => clusterName)
                        .map((clusterName) => (
                          <option key={clusterName} value={clusterName}>
                            {clusterName}
                          </option>
                        ))}
                    </Select>
                  </Td>
                  <Td py={"3"}>
                    <Select
                      size={"sm"}
                      value={filterRoleId}
                      onChange={(e) => setFilterRoleId(e.target.value)}
                    >
                      <option value="">- All -</option>
                      {getRoles()
                        .filter((roleId) => roleId)
                        .map((roleId) => (
                          <option key={roleId} value={roleId}>
                            {allRoles.find(({ id }) => roleId === id)?.name}
                          </option>
                        ))}
                    </Select>
                  </Td>

                  {checkForPermission(
                    PERMISSION["My Store"]["Manage Store Employees"].Update
                  ) ? (
                    <Td py={"3"}></Td>
                  ) : null}
                </Tr>
                {allUsers
                  .filter(
                    ({
                      firstName,
                      lastName,
                      empId,
                      contractTypeName,
                      clusterName,
                    }) =>
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
                      (contractTypeName || "")
                        .trim()
                        .toLowerCase()
                        .includes(searchKey.trim().toLowerCase()) ||
                      (clusterName || "")
                        .trim()
                        .toLowerCase()
                        .includes(searchKey.trim().toLowerCase())
                  )
                  .filter(({ contractTypeName }) => {
                    if (filterContractTypeName) {
                      return contractTypeName === filterContractTypeName;
                    }
                    return true;
                  })
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
                  .filter(({ userRolesDetails }) => {
                    if (
                      filterRoleId &&
                      userRolesDetails &&
                      userRolesDetails.length
                    ) {
                      return (
                        userRolesDetails.findIndex(
                          ({ roleId }) => filterRoleId === roleId.toString()
                        ) >= 0
                      );
                    }
                    return true;
                  })
                  .sort((a, b) => sortByFunc(a, b, sortBy, sortMethodAsc))
                  .map(
                    (
                      {
                        empId,
                        firstName,
                        lastName,
                        contractTypeName,
                        userRolesDetails,
                        clusterName,
                      },
                      i
                    ) => (
                      <Tr key={empId}>
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
                        <Td py={"3"}>
                          {firstName} {" " + lastName}
                        </Td>
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
                          {userRolesDetails?.length &&
                          allRoles &&
                          allRoles.length ? (
                            <Flex
                              maxWidth={"280px"}
                              display={"flex"}
                              flexWrap={"wrap"}
                            >
                              {userRolesDetails.map(({ roleId }, i) => (
                                <Flex
                                  background={COLORS[roleId % COLORS.length]}
                                  rounded={"sm"}
                                  m={"1"}
                                  py={"0.5"}
                                  px={"2"}
                                  key={roleId}
                                >
                                  <Text>
                                    {
                                      allRoles.find(({ id }) => id === roleId)
                                        ?.name
                                    }
                                  </Text>
                                </Flex>
                              ))}
                            </Flex>
                          ) : (
                            ""
                          )}
                        </Td>

                        {checkForPermission(
                          PERMISSION["My Store"]["Manage Store Employees"]
                            .Update
                        ) ? (
                          <Td py={"3"}>
                            <Button
                              leftIcon={<FiEdit />}
                              size={"sm"}
                              variant={"ghost"}
                              color={"#027DBC"}
                              onClick={() => onView(empId)}
                            >
                              Edit
                            </Button>
                          </Td>
                        ) : null}
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
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
        }}
        size={"6xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>View Employee Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {userDetails?.empId && selectedCostCenterName ? (
              <>
                <BasicDetails userDetails={userDetails} />
                <RolesDetails
                  userRolesDetails={userDetails.userRolesDetails ?? []}
                  userId={userDetails.userId}
                  defaultCostCenterName={selectedCostCenterName}
                  getEmployeeDetails={() => {
                    getAllUsers();
                    onClose();
                  }}
                  viewOnly={
                    !checkForPermission(
                      PERMISSION["My Store"]["Manage Store Employees"].Update
                    )
                  }
                />
              </>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={() => {
                onClose();
              }}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppContainer>
  );
}

export default ManageStoreEmployees;
