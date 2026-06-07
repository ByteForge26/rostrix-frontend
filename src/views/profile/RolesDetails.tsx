import {
  Badge,
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
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import {
  IApiResponse,
  ICostCenter,
  ICostCenterResponse,
  IRoleResponse,
  IUserResponse,
} from "../../helper/Interface";
import { useApi } from "../../hooks/useApi";
import { ENDPOINT } from "../../config/endpoint.config";
import { useToasts } from "react-toast-notifications";
import { FiEdit } from "react-icons/fi";
import { store, useAppSelector } from "../../app/store/store";
import AppSelect from "../../components/AppSelect";
import { COLORS } from "../../helper/Constant";
import { AiFillDelete } from "react-icons/ai";

function RolesDetails(props: {
  readonly userRolesDetails: IUserResponse["userRolesDetails"];
  readonly userId: IUserResponse["userId"];
  readonly defaultCostCenterName?: string;
  readonly viewOnly?: boolean;
  readonly getEmployeeDetails?: () => void;
}) {
  const {
    userRolesDetails,
    userId,
    defaultCostCenterName,
    viewOnly,
    getEmployeeDetails,
  } = props;
  const { get, put } = useApi();
  const { addToast } = useToasts();
  const { selectedCostCenterName } = useAppSelector((state) => state.auth);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onClose: onDeleteClose,
    onOpen: onDeleteOpen,
  } = useDisclosure();
  const [allCostCenters, setAllCostCenters] = useState<ICostCenter[]>([]);
  const [allRoles, setAllRoles] = useState<IRoleResponse[]>([]);
  const [uniqueId, setUniqueId] = useState("");
  const [costCentre, setCostCentre] = useState("");
  const [roleId, setRoleId] = useState("");
  const [filterCostCentre, setFilterCostCentre] = useState(
    defaultCostCenterName ?? ""
  );
  const [filterRoleId, setFilterRoleId] = useState("");
  const [filterRoleType, setFilterRoleType] = useState("");

  useEffect(() => {
    getAllRoles();
    getAllCostCenters();
  }, []);
  useEffect(() => {
    if (userRolesDetails && userRolesDetails.length > 0) {
      if (
        filterCostCentre &&
        userRolesDetails.findIndex(
          (obj) => obj.costCentre === filterCostCentre
        ) === -1
      ) {
        setFilterCostCentre("");
      }
      if (
        filterRoleId &&
        userRolesDetails.findIndex(
          (obj) => obj.roleId.toString() === filterRoleId
        ) === -1
      ) {
        setFilterRoleId("");
      }
    }
  }, [userRolesDetails]);

  const getAllRoles = async () => {
    const res = await get<IRoleResponse[]>(ENDPOINT["/access"]["/roles"]);
    if (res?.length) {
      setAllRoles(res);
    } else {
      setAllRoles([]);
    }
  };
  const getAllCostCenters = async () => {
    const res = await get<ICostCenterResponse>(
      ENDPOINT["/master"]["/cost-centre"],
      {
        params: {},
      }
    );
    if (res?.costCenters?.length) {
      setAllCostCenters(res.costCenters.filter(({ disabled }) => !disabled));
    } else {
      setAllCostCenters([]);
    }
  };
  const onAddRole = () => {
    setUniqueId("");
    setCostCentre(defaultCostCenterName ? defaultCostCenterName : "");
    setRoleId("");
    onOpen();
  };
  const onEditRole = (costCentre: string, roleId: number) => {
    setUniqueId(`${costCentre}_${roleId}`);
    setCostCentre(costCentre);
    setRoleId(roleId.toString());
    onOpen();
  };
  const onDeleteRoleOpen = (costCentre: string, roleId: number) => {
    setUniqueId(`${costCentre}_${roleId}`);
    setCostCentre(costCentre);
    setRoleId(roleId.toString());
    onDeleteOpen();
  };
  const getUserRoleList = () => {
    let userRoleList: { costCentre: string; roleId: number }[] = [];
    let index = -1;
    if (userRolesDetails?.length) {
      userRoleList = [
        ...userRolesDetails.map(({ costCentre, roleId }) => ({
          costCentre: costCentre.trim(),
          roleId,
        })),
      ];
    }
    userRoleList.forEach(({ costCentre, roleId }, i) => {
      if (`${costCentre}_${roleId}` === uniqueId) {
        index = i;
      }
    });
    if (index >= 0) {
      userRoleList.splice(index, 1);
    }
    return userRoleList;
  };
  const onSaveRole = (action: "add" | "delete") => {
    onClose();
    onDeleteClose();
    if (userId) {
      const userRoleList = getUserRoleList();
      if (action && action == "add") {
        userRoleList.push({
          costCentre: costCentre.trim(),
          roleId: Number(roleId),
        });
      }
      put<IApiResponse>(
        ENDPOINT["/user"][""] +
          `/${userId}` +
          (defaultCostCenterName ? `/${defaultCostCenterName}` : "") +
          "/roles",
        {
          data: {
            userRoleList,
          },
        }
      ).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success && getEmployeeDetails) {
          getEmployeeDetails();
        }
      });
    }
  };
  const isRoleLower = () => {
    let isLower = false;
    if (userRolesDetails?.length && allRoles && allRoles.length) {
      userRolesDetails.forEach(({ roleId }) => {
        const level = allRoles.find(({ id }) => id === roleId)?.level;
        const roleLevel = store.getState().auth.roleLevel;

        if (level && roleLevel && level > roleLevel) {
          isLower = true;
        }
      });
    }
    return isLower;
  };
  return (
    <Flex
      direction={"column"}
      style={{
        background: "#b6b6b61a",
        marginBottom: 16,
        borderRadius: 4,
        border: "1px solid lightgrey",
        overflow: "hidden",
      }}
    >
      <Flex
        style={{
          padding: "6px 10px",
          borderBottom: "1px solid lightgrey",
          minHeight: 56,
        }}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Text
          fontWeight={"bold"}
          style={{
            padding: "4px 12px",
          }}
          minWidth={"13%"}
        >
          Roles
        </Text>
        {!viewOnly && isRoleLower() ? (
          <Button onClick={() => onAddRole()}>+ Assign Role</Button>
        ) : null}
      </Flex>

      <Flex background={"white"}>
        {userRolesDetails?.length ? (
          <TableContainer
            background="white"
            width={"full"}
            maxHeight={"320px"}
            overflowY={"auto"}
          >
            <Table variant="simple">
              <Thead height={"48px"}>
                <Tr>
                  <Th background="#EBF3F8" color="#616161">
                    Sr. No.
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    Cost Center
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    Role
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    Role Type
                  </Th>
                  {!viewOnly ? (
                    <Th background="#EBF3F8" color="#616161">
                      Action
                    </Th>
                  ) : null}
                </Tr>
              </Thead>
              <Tbody fontSize={"sm"}>
                <Tr>
                  <Td py={"3"}></Td>
                  <Td py={"3"}>
                    <Select
                      size={"sm"}
                      value={filterCostCentre}
                      onChange={(e) => setFilterCostCentre(e.target.value)}
                      isDisabled={!!defaultCostCenterName}
                    >
                      <option value="">- All -</option>
                      {Array.from(
                        new Set(userRolesDetails.map((item) => item.costCentre))
                      ).map((costCentre) => {
                        const cc = allCostCenters?.find(
                          ({ costCentreName }) => costCentreName === costCentre
                        );
                        return (
                          <option key={costCentre} value={costCentre}>
                            {cc?.displayName
                              ? `${cc.displayName} (${cc.costCentreName})`
                              : costCentre}
                          </option>
                        );
                      })}
                    </Select>
                  </Td>
                  <Td py={"3"}>
                    <Select
                      size={"sm"}
                      value={filterRoleId}
                      onChange={(e) => setFilterRoleId(e.target.value)}
                    >
                      <option value="">- All -</option>
                      {Array.from(
                        new Set(userRolesDetails.map((item) => item.roleId))
                      ).map((roleId) => (
                        <option key={roleId} value={roleId}>
                          {allRoles?.length
                            ? allRoles.find(({ id }) => id === roleId)?.name
                            : ""}
                        </option>
                      ))}
                    </Select>
                  </Td>
                  <Td py={"3"}>
                    <Select
                      size={"sm"}
                      value={filterRoleType}
                      onChange={(e) => setFilterRoleType(e.target.value)}
                    >
                      <option value="">- All -</option>
                      {Array.from(
                        new Set(userRolesDetails.map((item) => item.roleType))
                      ).map((roleType) => (
                        <option key={roleType} value={roleType}>
                          {roleType}
                        </option>
                      ))}
                    </Select>
                  </Td>
                  {!viewOnly ? <Td py={"3"}></Td> : null}
                </Tr>
                {userRolesDetails && userRolesDetails.length ? (
                  <>
                    {userRolesDetails
                      .filter(({ costCentre }) => costCentre)
                      .sort((a, b) => a.costCentre.localeCompare(b.costCentre))
                      .filter(({ costCentre }) => {
                        if (defaultCostCenterName) {
                          if (defaultCostCenterName === costCentre) {
                            return true;
                          } else {
                            return false;
                          }
                        }
                        return true;
                      })
                      .filter(({ costCentre }) => {
                        if (filterCostCentre) {
                          return filterCostCentre === costCentre;
                        }
                        return true;
                      })
                      .filter(({ roleId }) => {
                        if (filterRoleId) {
                          return roleId.toString() === filterRoleId;
                        }
                        return true;
                      })
                      .filter(({ roleType }) => {
                        if (filterRoleType) {
                          return filterRoleType === roleType;
                        }
                        return true;
                      })
                      .map(({ costCentre, roleId, roleType }, i) => {
                        const finalCostCentre = allCostCenters?.find(
                          ({ costCentreName }) => costCentreName === costCentre
                        );
                        return (
                          <Tr key={roleId + "_" + costCentre}>
                            <Td py={"3"}>{i + 1}</Td>
                            <Td py={"3"}>
                              {finalCostCentre?.displayName
                                ? `${finalCostCentre?.displayName} (${finalCostCentre?.costCentreName})`
                                : costCentre}{" "}
                              (<small>{finalCostCentre?.city || "--"}</small>)
                              {viewOnly &&
                              costCentre === selectedCostCenterName ? (
                                <Badge variant={"outline"} ml={"2"}>
                                  SELECTED
                                </Badge>
                              ) : null}
                            </Td>
                            <Td py={"3"} display={"flex"} alignItems={"center"}>
                              <Flex
                                background={COLORS[roleId % COLORS.length]}
                                rounded={"sm"}
                                m={"1"}
                                py={"0.5"}
                                px={"2"}
                                width={"fit-content"}
                              >
                                <Text>
                                  {
                                    allRoles?.find(({ id }) => id === roleId)
                                      ?.name
                                  }
                                </Text>
                              </Flex>
                              {allRoles?.length &&
                              allRoles.find(({ id }) => id === roleId)
                                ?.basic ? (
                                <Badge variant={"outline"} ml={"2"}>
                                  BASIC
                                </Badge>
                              ) : null}
                            </Td>
                            <Td py={"3"}>{roleType}</Td>
                            {!viewOnly && allRoles && allRoles.length ? (
                              <Td py={"3"}>
                                {(roleType.toLowerCase() ===
                                  "CUSTOM".toLowerCase() ||
                                  (roleType.toLowerCase() ===
                                    "SYSTEM".toLowerCase() &&
                                    allRoles.find(({ id }) => id === roleId)
                                      ?.title === "STORE_LEADER")) &&
                                (allRoles.find(({ id }) => id === roleId)
                                  ?.level || 0) >
                                  (store.getState().auth.roleLevel || 0) &&
                                allRoles.find(({ id }) => id === roleId)
                                  ?.assignable ? (
                                  <>
                                    <Button
                                      leftIcon={<FiEdit />}
                                      size={"sm"}
                                      variant={"ghost"}
                                      color={"#027DBC"}
                                      onClick={() =>
                                        onEditRole(costCentre, roleId)
                                      }
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      data-testid="remove-role-button"
                                      ml={"2"}
                                      leftIcon={<AiFillDelete />}
                                      size={"sm"}
                                      variant={"ghost"}
                                      colorScheme={"red"}
                                      onClick={() =>
                                        onDeleteRoleOpen(costCentre, roleId)
                                      }
                                    >
                                      Remove
                                    </Button>
                                  </>
                                ) : null}
                              </Td>
                            ) : null}
                          </Tr>
                        );
                      })}
                  </>
                ) : null}
              </Tbody>
            </Table>
          </TableContainer>
        ) : null}
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{uniqueId ? "Edit" : "Add"} Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Cost Center</FormLabel>
              <AppSelect
                value={costCentre}
                onChange={(value) => setCostCentre(value)}
                options={
                  allCostCenters?.length
                    ? allCostCenters
                        .sort((a, b) =>
                          (a.displayName || a.costCentreName).localeCompare(
                            b.displayName || b.costCentreName
                          )
                        )
                        .map(({ costCentreName, displayName }) => ({
                          label: displayName
                            ? `${displayName} (${costCentreName})`
                            : costCentreName,
                          value: costCentreName,
                        }))
                    : []
                }
                disabled={!!defaultCostCenterName}
              />
            </FormControl>

            <FormControl mb={"4"} isRequired>
              <FormLabel>Role</FormLabel>
              <AppSelect
                value={roleId}
                onChange={(value) => setRoleId(value)}
                options={
                  allRoles?.length
                    ? allRoles
                        .filter(
                          ({ type, level, assignable, title }) =>
                            (type.toLowerCase() === "CUSTOM".toLowerCase() ||
                              (type.toLowerCase() === "SYSTEM".toLowerCase() &&
                                title === "STORE_LEADER")) &&
                            level > (store.getState().auth.roleLevel ?? 0) &&
                            assignable
                        )
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(({ id, name }) => ({
                          label: name,
                          value: id,
                        }))
                    : []
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" fontSize={"sm"} mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              // data-testid="save-role-button"
              isDisabled={!costCentre || !roleId}
              onClick={() => onSaveRole("add")}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Remove Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to Remove Role?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onDeleteClose}
            >
              Close
            </Button>
            <Button
              colorScheme="red"
              variant={"solid"}
              fontSize={"sm"}
              onClick={() => onSaveRole("delete")}
            >
              Remove
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default RolesDetails;
