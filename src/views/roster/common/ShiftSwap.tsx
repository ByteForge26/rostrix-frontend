import React, { useEffect, useState } from "react";
import { usePermission } from "../../../hooks/usePermission";
import { useAppSelector } from "../../../app/store/store";
import { IApiResponse, IMiscWork, IRoster } from "../../../helper/Interface";
import { PERMISSION } from "../../../config/permission.config";
import {
  Badge,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { AiOutlineSwap } from "react-icons/ai";
import { cloneDeep } from "lodash";
import moment from "moment";
import { DAYS, SECONDARY_JOBS_CONFIG } from "../../../helper/Constant";
import AppSelect from "../../../components/AppSelect";
import { convertTime, getDuration } from "../../../helper/Utils";
import { BsInfoCircle } from "react-icons/bs";
import { useToasts } from "react-toast-notifications";
import { useApi } from "../../../hooks/useApi";
import { ENDPOINT } from "../../../config/endpoint.config";

function ShiftSwap(props: {
  readonly roster?: IRoster;
  readonly miscWorks?: IMiscWork[];
}) {
  const { roster, miscWorks } = props;
  const { checkForPermission } = usePermission();
  const { user, contractTypes, selectedCostCenterName } = useAppSelector(
    (state) => state.auth
  );
  const { selectedWeek } = useAppSelector((state) => state.roster);
  const { addToast } = useToasts();
  const { post } = useApi();
  const [senderEmpId, setSenderEmpId] = useState("");
  const [senderDate, setSenderDate] = useState("");
  const [senderShifts, setSenderShifts] = useState<string[]>([]);
  const [senderAllShifts, setSenderAllShifts] = useState<
    {
      s: string;
      e: string;
      c: string;
      workId?: number;
      type?: string;
      plannedJob?: boolean;
      secondaryJobType?: string;
    }[]
  >([]);
  const [receiverEmpId, setReceiverEmpId] = useState("");
  const [receiverDate, setReceiverDate] = useState("");
  const [receiverShifts, setReceiverShifts] = useState<string[]>([]);
  const [receiverAllShifts, setReceiverAllShifts] = useState<
    {
      s: string;
      e: string;
      c: string;
      workId?: number;
      type?: string;
      plannedJob?: boolean;
      secondaryJobType?: string;
    }[]
  >([]);
  const [err, setErr] = useState("");
  const {
    isOpen: isShiftSwapOpen,
    onOpen: onShiftSwapOpen,
    onClose: onShiftSwapClose,
  } = useDisclosure();
  useEffect(() => {
    if (roster?.empWeekRosters?.length && senderDate && senderEmpId) {
      const day = roster.empWeekRosters
        .find(({ empId }) => senderEmpId === empId)
        ?.days?.find(({ date }) => date === senderDate);
      setSenderAllShifts([...(day?.main || []), ...(day?.misc || [])]);
      setSenderShifts([]);
    }
  }, [senderDate, senderEmpId]);
  useEffect(() => {
    if (roster?.empWeekRosters?.length && receiverDate && receiverEmpId) {
      const day = roster.empWeekRosters
        .find(({ empId }) => receiverEmpId === empId)
        ?.days?.find(({ date }) => date === receiverDate);
      setReceiverAllShifts([...(day?.main || []), ...(day?.misc || [])]);
      setReceiverShifts([]);
    }
  }, [receiverDate, receiverEmpId]);
  const isEmpPartOfRoster = () => {
    if (
      selectedWeek &&
      user &&
      roster?.empWeekRosters?.length &&
      roster.empWeekRosters.findIndex(({ empId }) => user.empId === empId) >= 0
    ) {
      return true;
    }
    return false;
  };
  const onSwapRequest = async () => {
    setErr("");
    const tempSenderShifts = senderShifts.map((value) => {
      const arr = value.split("_");
      const s = arr[0];
      const e = arr[1];
      const c = arr[2];
      const workId = arr[3];
      const plannedJob = arr[4];
      const secondaryJobType = arr[5];
      return {
        s,
        e,
        c,
        workId: workId ? Number(workId) : undefined,
        plannedJob: Number(plannedJob) ? true : undefined,
        secondaryJobType: secondaryJobType ? secondaryJobType : undefined,
      };
    });
    const tempReceiverShifts = receiverShifts.map((value) => {
      const arr = value.split("_");
      const s = arr[0];
      const e = arr[1];
      const c = arr[2];
      const workId = arr[3];
      const plannedJob = arr[4];
      const secondaryJobType = arr[5];
      return {
        s,
        e,
        c,
        workId: workId ? Number(workId) : undefined,
        plannedJob: Number(plannedJob) ? true : undefined,
        secondaryJobType: secondaryJobType ? secondaryJobType : undefined,
      };
    });
    let isValid = true;
    if (
      tempSenderShifts.findIndex(({ plannedJob }) => plannedJob) >= 0 ||
      tempReceiverShifts.findIndex(({ plannedJob }) => plannedJob) >= 0
    ) {
      if (senderDate !== receiverDate) {
        isValid = false;
        setErr(
          "Please note that the planned assigned job can be switched between the same day only."
        );
      }
    }
    if (!isValid) {
      return;
    }

    const res = await post<IApiResponse>(ENDPOINT["/shift-swap"][""], {
      data: {
        costCentre: selectedCostCenterName,
        rosterWeekId: roster?.rosterWeekId,
        senderEmpId,
        receiverEmpId,
        senderDate,
        receiverDate,
        senderShifts: tempSenderShifts,
        receiverShifts: tempReceiverShifts,
      },
    });
    if (res?.success) {
      onShiftSwapClose();
      addToast(res.message, {
        appearance: "success",
      });
    } else {
      setErr(res.message || "Something went wrong!");
    }
  };
  return (
    <>
      {roster &&
      isEmpPartOfRoster() &&
      user &&
      checkForPermission(PERMISSION["Shift Swap"]["My Shift Swaps"].Apply) ? (
        <Button
          variant={"outline"}
          leftIcon={<AiOutlineSwap />}
          onClick={() => {
            setSenderEmpId(user.empId);
            setSenderAllShifts([]);
            setSenderDate("");
            setSenderShifts([]);
            setReceiverEmpId("");
            setReceiverAllShifts([]);
            setReceiverDate("");
            setReceiverShifts([]);
            setErr("");
            onShiftSwapOpen();
          }}
        >
          Swap Shift
        </Button>
      ) : null}
      <Modal isOpen={isShiftSwapOpen} onClose={onShiftSwapClose} size={"4xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{`Swap Shift (Week ${selectedWeek})`}</ModalHeader>

          <ModalCloseButton />
          <ModalBody>
            {roster && roster.empWeekRosters && roster.empWeekRosters.length ? (
              <Flex mt={"4"} justifyContent={"space-between"} wrap={"wrap"}>
                <Flex direction={"column"}>
                  <Text fontSize={"sm"} mb={"4"}>
                    Which day's shift would you like to swap?
                  </Text>
                  {selectedWeek &&
                  roster &&
                  roster.empWeekRosters &&
                  roster.empWeekRosters[0] &&
                  roster.empWeekRosters[0].days &&
                  roster.empWeekRosters[0].days.length ? (
                    <Flex mb={"4"}>
                      {cloneDeep(roster.empWeekRosters[0].days)
                        // .filter(
                        //   ({ date }) => moment(date).unix() > moment().unix()
                        // )
                        .sort(
                          (a, b) =>
                            moment(a.date).unix() - moment(b.date).unix()
                        )
                        .map(({ date }, i) => (
                          <Flex key={date} px={1}>
                            <Button
                              size={"sm"}
                              variant={
                                senderDate === date ? undefined : "solid"
                              }
                              onClick={() => {
                                setSenderDate(date);
                              }}
                              borderRadius={"2xl"}
                              isDisabled={moment(date).unix() < moment().unix()}
                            >
                              {DAYS[moment(date).get("day")]}
                            </Button>
                          </Flex>
                        ))}
                    </Flex>
                  ) : null}

                  {senderDate ? (
                    <>
                      <Text fontSize={"xs"} fontWeight={"medium"}>
                        You
                      </Text>
                      <AppSelect
                        value={senderEmpId}
                        options={
                          roster
                            ? cloneDeep(roster.empWeekRosters)
                                .sort((a, b) =>
                                  a.fistName.localeCompare(b.fistName)
                                )
                                .map(({ empId, fistName }) => ({
                                  label: `${fistName} | ${empId}`,
                                  value: empId,
                                }))
                            : []
                        }
                        onChange={(value) => setSenderEmpId(value)}
                        disabled
                      />
                    </>
                  ) : null}

                  {senderDate && senderEmpId ? (
                    <CheckboxGroup
                      value={senderShifts}
                      onChange={(value) => setSenderShifts(value as string[])}
                    >
                      <Text fontSize={"xs"} mt={"2"}>
                        Your Shifts
                      </Text>
                      {cloneDeep(senderAllShifts).sort((a, b) =>
                        a.s.localeCompare(b.s)
                      ).length ? (
                        <Stack mt={"2"}>
                          {cloneDeep(senderAllShifts)
                            .sort((a, b) => a.s.localeCompare(b.s))
                            .map(
                              (
                                {
                                  s,
                                  e,
                                  c,
                                  workId,
                                  plannedJob,
                                  secondaryJobType,
                                },
                                i
                              ) => (
                                <Checkbox
                                  key={i}
                                  value={
                                    s +
                                    "_" +
                                    e +
                                    "_" +
                                    c +
                                    "_" +
                                    (workId ? workId : "") +
                                    "_" +
                                    +(plannedJob ? plannedJob : "") +
                                    "_" +
                                    (secondaryJobType ? secondaryJobType : "")
                                  }
                                  size={"sm"}
                                >
                                  <Text fontSize={"xs"}>
                                    {`${convertTime(s)} - ${convertTime(e)} (${
                                      getDuration(
                                        moment(s, "HH:mm:ss"),
                                        moment(e, "HH:mm:ss")
                                      ).text
                                    })${
                                      workId
                                        ? ` | ${
                                            miscWorks?.length
                                              ? miscWorks.find(
                                                  ({ id }) => id === workId
                                                )?.name
                                              : workId
                                          }`
                                        : secondaryJobType
                                        ? ` | ${
                                            SECONDARY_JOBS_CONFIG.find(
                                              ({ jobType }) =>
                                                jobType === secondaryJobType
                                            )?.label
                                          }`
                                        : ""
                                    }`}
                                    {plannedJob ? (
                                      <Badge
                                        ml={"1"}
                                        fontSize={"10px"}
                                        variant={"outline"}
                                      >
                                        Planned Job
                                      </Badge>
                                    ) : null}
                                  </Text>
                                </Checkbox>
                              )
                            )}
                        </Stack>
                      ) : (
                        <Text
                          fontSize={"xs"}
                          color={"red.400"}
                          display={"flex"}
                          justifyContent={"center"}
                          alignItems={"center"}
                          py={"4"}
                        >
                          <BsInfoCircle
                            style={{
                              marginRight: 4,
                            }}
                          />
                          Looks like there is no shift.
                        </Text>
                      )}
                    </CheckboxGroup>
                  ) : null}
                </Flex>
                <Flex pt={"12"}>
                  <AiOutlineSwap />
                </Flex>
                <Flex direction={"column"}>
                  <Text fontSize={"sm"} mb={"4"}>
                    Which day's shift would you like to swap with?
                  </Text>
                  {selectedWeek &&
                  roster &&
                  roster.empWeekRosters &&
                  roster.empWeekRosters[0] &&
                  roster.empWeekRosters[0].days &&
                  roster.empWeekRosters[0].days.length ? (
                    <Flex mb={"4"}>
                      {cloneDeep(roster.empWeekRosters[0].days)
                        // .filter(
                        //   ({ date }) => moment(date).unix() > moment().unix()
                        // )
                        .sort(
                          (a, b) =>
                            moment(a.date).unix() - moment(b.date).unix()
                        )
                        .map(({ date }, i) => (
                          <Flex key={date} px={1}>
                            <Button
                              size={"sm"}
                              variant={
                                receiverDate === date ? undefined : "solid"
                              }
                              onClick={() => {
                                setReceiverDate(date);
                              }}
                              borderRadius={"2xl"}
                              isDisabled={moment(date).unix() < moment().unix()}
                            >
                              {DAYS[moment(date).get("day")]}
                            </Button>
                          </Flex>
                        ))}
                    </Flex>
                  ) : null}
                  {receiverDate ? (
                    <>
                      <Text fontSize={"xs"} fontWeight={"medium"}>
                        Swap With
                      </Text>
                      <AppSelect
                        value={receiverEmpId}
                        options={
                          roster && contractTypes?.length
                            ? cloneDeep(
                                roster.empWeekRosters.filter(
                                  ({ empId }) => user?.empId !== empId
                                )
                              )
                                .sort(
                                  (a, b) =>
                                    contractTypes
                                      .filter(
                                        ({ id }) => id === a.contractId
                                      )[0]
                                      .category.localeCompare(
                                        contractTypes.filter(
                                          ({ id }) => id === b.contractId
                                        )[0].category
                                      ) || a.fistName.localeCompare(b.fistName)
                                )
                                .map(({ empId, fistName, contractId }) => ({
                                  label: `${fistName} | ${empId} | ${
                                    contractTypes && contractTypes.length
                                      ? contractTypes.find(
                                          ({ id }) => id === contractId
                                        )?.name
                                      : ""
                                  }`,
                                  value: empId,
                                }))
                            : []
                        }
                        onChange={(value) => setReceiverEmpId(value)}
                      />
                    </>
                  ) : null}

                  {receiverEmpId && receiverDate ? (
                    <CheckboxGroup
                      value={receiverShifts}
                      onChange={(value) => setReceiverShifts(value as string[])}
                    >
                      <Text fontSize={"xs"} mt={"2"}>
                        {`${
                          roster.empWeekRosters.find(
                            ({ empId }) => receiverEmpId === empId
                          )?.fistName
                        }'s Shifts`}
                      </Text>
                      {cloneDeep(receiverAllShifts).sort((a, b) =>
                        a.s.localeCompare(b.s)
                      ).length ? (
                        <Stack mt={"2"}>
                          {cloneDeep(receiverAllShifts)
                            .sort((a, b) => a.s.localeCompare(b.s))
                            .map(
                              (
                                {
                                  s,
                                  e,
                                  c,
                                  workId,
                                  plannedJob,
                                  secondaryJobType,
                                },
                                i
                              ) => (
                                <Checkbox
                                  key={i}
                                  value={
                                    s +
                                    "_" +
                                    e +
                                    "_" +
                                    c +
                                    "_" +
                                    (workId ? workId : "") +
                                    "_" +
                                    +(plannedJob ? plannedJob : "") +
                                    "_" +
                                    (secondaryJobType ? secondaryJobType : "")
                                  }
                                  size={"sm"}
                                >
                                  <Text fontSize={"xs"}>
                                    {`${convertTime(s)} - ${convertTime(e)} (${
                                      getDuration(
                                        moment(s, "HH:mm:ss"),
                                        moment(e, "HH:mm:ss")
                                      ).text
                                    })${
                                      workId
                                        ? ` | ${
                                            miscWorks?.length
                                              ? miscWorks.find(
                                                  ({ id }) => id === workId
                                                )?.name
                                              : workId
                                          }`
                                        : secondaryJobType
                                        ? ` | ${
                                            SECONDARY_JOBS_CONFIG.find(
                                              ({ jobType }) =>
                                                jobType === secondaryJobType
                                            )?.label
                                          }`
                                        : ""
                                    }`}
                                    {plannedJob ? (
                                      <Badge
                                        ml={"1"}
                                        fontSize={"10px"}
                                        variant={"outline"}
                                      >
                                        Planned Job
                                      </Badge>
                                    ) : null}
                                  </Text>
                                </Checkbox>
                              )
                            )}
                        </Stack>
                      ) : (
                        <Text
                          fontSize={"xs"}
                          color={"red.400"}
                          display={"flex"}
                          justifyContent={"center"}
                          alignItems={"center"}
                          py={"4"}
                        >
                          <BsInfoCircle
                            style={{
                              marginRight: 4,
                            }}
                          />
                          Looks like there is no shift.
                        </Text>
                      )}
                    </CheckboxGroup>
                  ) : null}
                </Flex>
              </Flex>
            ) : null}
          </ModalBody>
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
                mt={"2"}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: err,
                  }}
                ></span>
              </Text>
            </Flex>
          ) : null}
          <ModalFooter>
            <Button variant={"outline"} mr={3} onClick={onShiftSwapClose}>
              Cancel
            </Button>
            <Button
              isDisabled={
                !senderDate ||
                !receiverEmpId ||
                !receiverDate ||
                senderShifts.length === 0
              }
              onClick={() => {
                onSwapRequest();
              }}
            >
              Swap
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default ShiftSwap;
