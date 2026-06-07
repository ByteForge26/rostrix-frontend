import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import {
  Badge,
  Button,
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
  Text,
  Textarea,
  useBoolean,
  useDisclosure,
} from "@chakra-ui/react";
import { useApi } from "../../hooks/useApi";
import { ENDPOINT } from "../../config/endpoint.config";
import { IApiResponse, IRoleResponse } from "../../helper/Interface";
import { FiEdit } from "react-icons/fi";
import { useToasts } from "react-toast-notifications";
import AppHeader from "../../components/AppHeader";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSION } from "../../config/permission.config";
import { AiFillDelete, AiOutlineDrag } from "react-icons/ai";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { BsSearch } from "react-icons/bs";

function ManageRoles() {
  const { get, post, put } = useApi();
  const { addToast } = useToasts();
  const {
    isOpen: isRoleDeleteConfirmationOpen,
    onClose: onRoleDeleteConfimationClose,
    onOpen: onRoleDeleteConfirmationOpen,
  } = useDisclosure();
  const {
    isOpen: isRoleLevelDndOpen,
    onClose: onRoleLevelDndClose,
    onOpen: onRoleLevelDndOpen,
  } = useDisclosure();
  const { checkForPermission } = usePermission();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [allRoles, setAllRoles] = useState<IRoleResponse[]>([]);
  const [roleId, setRoleId] = useState(0);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [roleBasic, setRoleBasic] = useState(false);
  const [roleLevel, setRoleLevel] = useState(1);
  const [roleLvlPrimary, setRoleLvlPrimary] = useState(false);
  const [roleDelete, setRoleDelete] = useState(false);
  const [stateSearchKey, setStateSearchKey] = useState("");
  useEffect(() => {
    getAllRoles();
  }, []);
  const getAllRoles = async () => {
    onLoading();
    const res = await get<IRoleResponse[]>(ENDPOINT["/access"]["/roles"]);
    offLoading();
    if (res?.length) {
      setAllRoles(res);
    } else {
      setAllRoles([]);
    }
  };
  const onCreateRole = () => {
    setRoleId(0);
    setRoleName("");
    setRoleDescription("");
    setRoleBasic(false);
    setRoleLevel(1);
    onOpen();
  };
  const onEditRole = (
    id: number,
    name: string,
    description: string,
    basic: boolean,
    level: number,
    title: string,
    lvlPrimary: boolean
  ) => {
    setRoleId(id);
    setRoleName(name);
    setRoleDescription(description);
    setRoleBasic(basic);
    setRoleDelete(false);
    setRoleLevel(level);
    setRoleLvlPrimary(lvlPrimary);
    onOpen();
  };
  const onDeleteRole = (
    id: number,
    name: string,
    description: string,
    basic: boolean,
    level: number,
    title: string,
    lvlPrimary: boolean
  ) => {
    setRoleId(id);
    setRoleName(name);
    setRoleDescription(description);
    setRoleBasic(basic);
    setRoleLevel(level);
    setRoleDelete(true);
    setRoleLvlPrimary(lvlPrimary);
    onRoleDeleteConfirmationOpen();
  };
  const onSaveRole = () => {
    onClose();
    onRoleDeleteConfimationClose();
    if (roleId) {
      put<IApiResponse>(ENDPOINT["/access"]["/roles"] + `/${roleId}`, {
        data: {
          name: roleName,
          description: roleDescription,
          delete: roleDelete,
          basic: roleBasic,
          level: roleLevel,
          lvlPrimary: roleLvlPrimary,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getAllRoles();
        }
      });
    } else {
      post<IApiResponse>(ENDPOINT["/access"]["/roles"], {
        data: {
          name: roleName,
          description: roleDescription,
          basic: roleBasic,
          level: Math.max(...allRoles.map((o) => o.level)),
          lvlPrimary: false,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getAllRoles();
        }
      });
    }
  };
  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === 0) {
      return;
    }
    const sortedRoles = allRoles
      .sort((a, b) => a.level - b.level)
      .filter(({ lvlPrimary, name }) => lvlPrimary)
      .filter(({ id }) => {
        if (id) {
          if (id !== roleId) {
            return true;
          }
          return false;
        }
        return true;
      });
    const up =
      result.destination.index === sortedRoles.length
        ? sortedRoles[result.destination.index - 1].level + 2000
        : sortedRoles[result.destination.index].level;
    const down = sortedRoles[result.destination.index - 1].level;
    const newLevel = (up + down) / 2;
    setRoleLevel(Math.floor(newLevel));
  };
  const uniqueRolesForDragAndDrop = () => {
    if (!roleId) {
      return [
        {
          name: roleName,
          level: roleLevel,
          id: 0,
          lvlPrimary: true,
        },
        ...allRoles,
      ]
        .sort((a, b) => a.level - b.level)
        .filter(({ lvlPrimary }) => lvlPrimary);
    } else if (roleLvlPrimary) {
      return [
        {
          name: roleName,
          level: roleLevel,
          id: roleId,
          lvlPrimary: roleLvlPrimary,
        },
        ...allRoles.filter(({ id }) => id !== roleId),
      ]
        .sort((a, b) => a.level - b.level)
        .filter(({ lvlPrimary }) => lvlPrimary);
    } else {
      return [
        {
          name: roleName,
          level: roleLevel,
          id: roleId,
          lvlPrimary: true,
        },
        ...allRoles.filter(({ id }) => id !== roleId),
      ]
        .sort((a, b) => a.level - b.level)
        .filter(({ lvlPrimary }) => lvlPrimary);
    }
  };

  return (
    <AppContainer heading="Roles" info="Add a new role/edit role description.">
      <AppHeader>
        <InputGroup width={"fit-content"}>
          <InputLeftElement pointerEvents="none">
            <BsSearch color="gray.300" />
          </InputLeftElement>
          <Input
            background={"white"}
            value={stateSearchKey}
            onChange={(e) => setStateSearchKey(e.target.value)}
            placeholder="Search Roles"
            width={"fit-content"}
          />
        </InputGroup>
        {checkForPermission(PERMISSION.Access["Manage Roles"].Update) && (
          <Flex ml={"4"}>
            <Button onClick={onCreateRole}>+ Add Role</Button>
          </Flex>
        )}
      </AppHeader>
      <Flex overflow={"auto"} p={"2"}>
        {allRoles.length ? (
          <Grid gridTemplateColumns={"1fr 1fr 1fr"} width={"full"} gap={"4"}>
            {allRoles
              .sort((a, b) => a.name.localeCompare(b.name))
              // .sort((a, b) => b.type.localeCompare(a.type))
              .filter(({ name }) =>
                name
                  .trim()
                  .toLowerCase()
                  .includes(stateSearchKey.trim().toLowerCase())
              )
              .map(
                (
                  {
                    basic,
                    description,
                    editable,
                    id,
                    name,
                    type,
                    deletable,
                    title,
                    level,
                    lvlPrimary,
                  },
                  i
                ) => {
                  return (
                    <Flex
                      background={"white"}
                      key={id}
                      p={"2"}
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
                        <Text fontSize={"lg"} fontWeight={"medium"}>
                          {name}

                          {basic ? (
                            <Badge variant={"outline"} ml={"2"}>
                              BASIC ROLE
                            </Badge>
                          ) : (
                            <>
                              {type === "SYSTEM" ? (
                                <Badge
                                  variant={"outline"}
                                  ml={"2"}
                                  colorScheme="green"
                                >
                                  SYSTEM ROLE
                                </Badge>
                              ) : null}
                            </>
                          )}
                        </Text>
                        <Flex>
                          {checkForPermission(
                            PERMISSION.Access["Manage Roles"].Update
                          ) && (
                            <>
                              {editable && (
                                <IconButton
                                  aria-label=""
                                  size={"sm"}
                                  variant={"ghost"}
                                  onClick={() =>
                                    onEditRole(
                                      id,
                                      name,
                                      description,
                                      basic,
                                      level,
                                      title,
                                      lvlPrimary
                                    )
                                  }
                                >
                                  <FiEdit />
                                </IconButton>
                              )}
                              {deletable && (
                                <IconButton
                                  aria-label=""
                                  size={"sm"}
                                  variant={"ghost"}
                                  colorScheme="red"
                                  onClick={() => {
                                    onDeleteRole(
                                      id,
                                      name,
                                      description,
                                      basic,
                                      level,
                                      title,
                                      lvlPrimary
                                    );
                                  }}
                                  data-testid={"delete"}
                                >
                                  <AiFillDelete />
                                </IconButton>
                              )}
                            </>
                          )}
                        </Flex>
                      </Flex>
                      <Flex direction={"column"} px={"2"} pb={"2"}>
                        <Flex my={"2"}>
                          <Text fontSize={"sm"} color={"gray.500"} mr={"2"}>
                            Type:
                          </Text>
                          <Text fontSize={"sm"} fontWeight={"normal"}>
                            {title || "--"}
                          </Text>
                        </Flex>
                        {/* <Flex>
                          <Text fontSize={"sm"} color={"gray.500"} mr={"2"}>
                            Type:
                          </Text>
                          <Text fontSize={"sm"} fontWeight={"normal"}>
                            {type || "--"}
                          </Text>
                        </Flex> */}
                        <Flex pt={"2"} wrap={"wrap"}>
                          <Text fontSize={"xs"} color={"gray.400"}>
                            {description}
                          </Text>
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
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{roleId ? "Edit" : "Add"} Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter here"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                data-testid="input-name"

              />
            </FormControl>
            <FormControl mb={"4"}>
              <FormLabel>Description</FormLabel>
              <Textarea
                placeholder="Enter here"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                data-testid="input-description"
              />
            </FormControl>
            {/* <FormControl mb={"4"}>
              <FormLabel>Role level b/w</FormLabel>
              <Button
                isDisabled={!roleName}
                onClick={() => {
                  if (!roleLevel) {
                    const up = allRoles
                      .sort((a, b) => a.level - b.level)
                      .filter(({ lvlPrimary }) => lvlPrimary)[0].level;
                    const down = allRoles
                      .sort((a, b) => a.level - b.level)
                      .filter(({ lvlPrimary }) => lvlPrimary)[1].level;
                    setRoleLevel(Math.floor((up + down) / 2));
                  }
                  onRoleLevelDndOpen();
                }}
              >
                Drag Role Level
              </Button>
            </FormControl>
            <FormControl mb={"4"}>
              <FormLabel>Role level as</FormLabel>
              <AppSelect
                onChange={(value) => setRoleLevel(value)}
                options={allRoles
                  .sort((a, b) => a.level - b.level)
                  .filter(({ lvlPrimary }) => lvlPrimary)
                  .map(({ name, level }) => ({
                    label: name,
                    value: level,
                  }))}
                value={roleLevel}
              />
            </FormControl> */}
            {/* <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="roleBasics" mb="0">
                Basic Role
              </FormLabel>
              <Switch
                id="roleBasic"
                isChecked={roleBasic}
                onChange={(e) => setRoleBasic(e.target.checked)}
              />
            </FormControl> */}
            <Modal isOpen={isRoleLevelDndOpen} onClose={onRoleLevelDndClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Drag and Drop Role Level</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="droppable">
                      {(provided, snapshot) => (
                        <Flex
                          transition={"0.3s"}
                          direction={"column"}
                          p="2"
                          rounded={"md"}
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          style={{
                            border: `1px ${
                              snapshot.isDraggingOver ? "dashed" : "solid"
                            } ${
                              snapshot.isDraggingOver
                                ? "#027DBC29"
                                : "transparent"
                            }`,
                            background: "#3138510d",
                          }}
                        >
                          {uniqueRolesForDragAndDrop().map((item, index) => (
                            <Draggable
                              key={item.id}
                              draggableId={item.id.toString()}
                              index={index}
                              isDragDisabled={!(!item.id || roleId === item.id)}
                            >
                              {(provided) => (
                                <Flex
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  p={"2"}
                                  mt={index === 0 ? "0" : "2"}
                                  rounded={"md"}
                                  background={
                                    !item.id || roleId === item.id
                                      ? "#027DBC"
                                      : "#027DBC29"
                                  }
                                  color={
                                    !item.id || roleId === item.id
                                      ? "white"
                                      : "#027DBC"
                                  }
                                  fontWeight={
                                    !item.id || roleId === item.id
                                      ? "medium"
                                      : "normal"
                                  }
                                  style={{
                                    userSelect: "none",
                                    ...provided.draggableProps.style,
                                  }}
                                  alignItems={"center"}
                                >
                                  {!item.id || roleId === item.id ? (
                                    <AiOutlineDrag />
                                  ) : null}
                                  <Text
                                    ml={
                                      !item.id || roleId === item.id ? "2" : "6"
                                    }
                                  >
                                    {item.name} {item.level}
                                  </Text>
                                </Flex>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </Flex>
                      )}
                    </Droppable>
                  </DragDropContext>
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="outline"
                    fontSize={"sm"}
                    onClick={onRoleLevelDndClose}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" fontSize={"sm"} mr={3} onClick={onClose}>
              Close
            </Button>
            <Button isDisabled={!roleName || !roleLevel} onClick={onSaveRole}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isRoleDeleteConfirmationOpen}
        onClose={onRoleDeleteConfimationClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to Delete Role?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onRoleDeleteConfimationClose}
            >
              Close
            </Button>
            <Button
              colorScheme="red"
              variant={"solid"}
              fontSize={"sm"}
              onClick={onSaveRole}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppContainer>
  );
}

export default ManageRoles;
