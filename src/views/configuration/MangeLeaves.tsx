import React, { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import AppContainer from "../../components/AppContainer";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
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
import { ENDPOINT } from "../../config/endpoint.config";
import {
  IApiResponse,
  ILeaveResponse,
  IStateResponse,
} from "../../helper/Interface";
import moment from "moment";
import { FiEdit } from "react-icons/fi";
import AppHeader from "../../components/AppHeader";
import { AiFillDelete } from "react-icons/ai";
import { useToasts } from "react-toast-notifications";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSION } from "../../config/permission.config";
import AppSelect from "../../components/AppSelect";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import { formatDate, sortByFunc } from "../../helper/Utils";
import { BsSortAlphaDown, BsSortAlphaDownAlt } from "react-icons/bs";
import AppTableHeadingWithSort from "../../components/AppTableHeadingWithSort";

function MangeLeaves() {
  const { get, put, post } = useApi();
  const { addToast } = useToasts();
  const { checkForPermission } = usePermission();
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [leaves, setLeaves] = useState<ILeaveResponse[]>([]);

  const [leaveId, setLeaveId] = useState("");
  const [numLeaves, setNumLeaves] = useState("");
  const [stateId, setStateId] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [states, setStates] = useState<IStateResponse[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("state");
  const [sortMethodAsc, setSortMethodAsc] = useState<boolean>(true);
  const {
    isOpen: isLeaveModalOpen,
    onClose: onLeaveModalClose,
    onOpen: onLeaveModalOpen,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onClose: onDeleteModalClose,
    onOpen: onDeleteModalOpen,
  } = useDisclosure();
  useEffect(() => {
    getYears();
    getAllLeaves();
    getStates();
  }, []);

  const getYears = () => {
    const date = new Date();
    const years: string[] = [];
    for (let index = 1; index <= 10; index++) {
      years.push((date.getFullYear() + index).toString());
    }
    setYears(years);
  };
  const getStates = async () => {
    const res = await get<IStateResponse[]>(ENDPOINT["/master"]["/state"]);
    if (res?.length) {
      setStates(res);
    }
  };

  const getAllLeaves = async () => {
    onLoading();
    const res = await get<ILeaveResponse[]>(ENDPOINT["/master"]["/leave"]);
    offLoading();
    if (res?.length) {
      setLeaves(res);
    } else {
      setLeaves([]);
    }
  };
  const isFutureDate = (effectiveDate: Date) => {
    effectiveDate.setHours(0, 0, 0, 0);
    let today = new Date();
    let todayMorningDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    if (effectiveDate.getTime() >= todayMorningDate.getTime()) {
      return true;
    }
    return false;
  };
  const onCreateLeave = () => {
    setLeaveId("");
    setNumLeaves("");
    setStateId("");
    setEffectiveDate("");
    onLeaveModalOpen();
  };
  const onEditLeave = (
    id: number,
    numLeaves: number,
    effectiveDate: string,
    stateId: string
  ) => {
    setLeaveId(id.toString());
    setNumLeaves(numLeaves.toString());
    setStateId(stateId);
    setEffectiveDate(effectiveDate);
    onLeaveModalOpen();
  };
  const onDeleteLeaveConfirmation = (
    id: number,
    numLeaves: number,
    effectiveDate: string,
    stateId: string
  ) => {
    setLeaveId(id.toString());
    setNumLeaves(numLeaves.toString());
    setStateId(stateId);
    setEffectiveDate(effectiveDate);
    onDeleteModalOpen();
  };
  const onSaveLeaves = () => {
    onLeaveModalClose();
    if (leaveId) {
      put<IApiResponse>(ENDPOINT["/master"]["/leave"] + `/${leaveId}`, {
        data: {
          numLeaves,
          stateId,
          effectiveDate,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getAllLeaves();
        }
      });
    } else {
      post<IApiResponse>(ENDPOINT["/master"]["/leave"], {
        data: {
          numLeaves,
          stateId,
          effectiveDate,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getAllLeaves();
        }
      });
    }
  };
  const onDeleteLeaves = () => {
    onDeleteModalClose();
    put<IApiResponse>(ENDPOINT["/master"]["/leave"] + `/${leaveId}`, {
      data: {
        numLeaves,
        stateId,
        effectiveDate,
        delete: true,
      },
    }).then((res) => {
      addToast(res.message, {
        appearance: res.success ? "success" : "error",
      });
      if (res.success) {
        getAllLeaves();
      }
    });
  };

  return (
    <AppContainer
      heading="Leaves"
      info="Define maximum number of leaves to be assigned in a state along effective date."
    >
      <AppHeader>
        {checkForPermission(PERMISSION.Config["Leaves"].Update) && (
          <Button ml={"4"} onClick={onCreateLeave}>
            + Add Leaves
          </Button>
        )}
      </AppHeader>
      <Flex overflow={"auto"}>
        {leaves.length ? (
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
                      value="state"
                      label="State"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    <AppTableHeadingWithSort
                      value="numLeaves"
                      label="Leaves"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    Effective Date
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody fontSize={"sm"}>
                {leaves
                  .sort((a, b) => sortByFunc(a, b, sortBy, sortMethodAsc))
                  .map(
                    ({ effectiveDate, numLeaves, id, state, stateId }, i) => (
                      <Tr key={id}>
                        <Td py={"3"}>{i + 1}</Td>
                        <Td py={"3"}>{state}</Td>
                        <Td py={"3"}>{numLeaves}</Td>
                        <Td py={"3"}>{formatDate(effectiveDate)}</Td>
                        <Td py={"2"}>
                          {isFutureDate(new Date(effectiveDate)) &&
                          checkForPermission(
                            PERMISSION.Config["Leaves"].Update
                          ) ? (
                            <>
                              <Button
                                leftIcon={<FiEdit />}
                                size={"sm"}
                                variant={"ghost"}
                                color={"#027DBC"}
                                onClick={() =>
                                  onEditLeave(
                                    id,
                                    numLeaves,
                                    effectiveDate,
                                    stateId
                                  )
                                }
                              >
                                Edit
                              </Button>
                              <Button
                                ml={"2"}
                                leftIcon={<AiFillDelete />}
                                size={"sm"}
                                variant={"ghost"}
                                colorScheme="red"
                                onClick={() =>
                                  onDeleteLeaveConfirmation(
                                    id,
                                    numLeaves,
                                    effectiveDate,
                                    stateId
                                  )
                                }
                              >
                                Delete
                              </Button>
                            </>
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
      <Modal isOpen={isLeaveModalOpen} onClose={onLeaveModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{leaveId ? "Edit" : "Add"} Leaves</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>State</FormLabel>
              <AppSelect
                value={stateId}
                onChange={(value) => setStateId(value)}
                options={
                  states?.length
                    ? states
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(({ id, name }) => ({
                          label: name,
                          value: id,
                        }))
                    : []
                }
              />
            </FormControl>

            <FormControl mb={"4"} isRequired>
              <FormLabel>Effective Year</FormLabel>
              <AppSelect
                value={effectiveDate}
                options={years.map((year) => ({
                  label: year,
                  value: moment([year]).format("YYYY-MM-DD"),
                }))}
                onChange={(date) => setEffectiveDate(date)}
              />
              {/* <SingleDatepicker
                date={effectiveDate ? new Date(effectiveDate) : undefined}
                onDateChange={(date) =>
                  setEffectiveDate(moment(date).format("YYYY-MM-DD"))
                }
                minDate={subDays(new Date(), 1)}
                configs={{
                  dateFormat: "dd-MM-yyyy",
                }}
              /> */}
            </FormControl>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Number of Leaves</FormLabel>
              <Input
                placeholder="Enter here"
                type="number"
                value={numLeaves}
                onChange={(e) => setNumLeaves(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onLeaveModalClose}
            >
              Close
            </Button>
            <Button
              isDisabled={!stateId || !effectiveDate || !numLeaves}
              onClick={onSaveLeaves}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Leaves</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onDeleteModalClose}
            >
              Close
            </Button>
            <Button
              colorScheme="red"
              variant={"solid"}
              fontSize={"sm"}
              isDisabled={!stateId || !effectiveDate || !numLeaves}
              onClick={onDeleteLeaves}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppContainer>
  );
}

export default MangeLeaves;

//  47.77 |     27.5 |      25 |   47.19
