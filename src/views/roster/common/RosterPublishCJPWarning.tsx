import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
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
} from "@chakra-ui/react";
import React from "react";
import { IWeekUncoveredShift } from "../../../helper/Interface";
import { FiEdit } from "react-icons/fi";
import moment from "moment";
import { COLORS, SECONDARY_JOBS_CONFIG } from "../../../helper/Constant";

function RosterPublishCJPWarning(props: {
  readonly isWeekUncoveredShiftsModalOpen: boolean;
  readonly onWeekUncoveredShiftsModalClose: () => void;
  readonly weekUncoveredShifts: IWeekUncoveredShift[];
  readonly onChangeWeek: (week: number) => void;
  readonly goToRosterEdit: (week: number) => void;
}) {
  const {
    isWeekUncoveredShiftsModalOpen,
    onWeekUncoveredShiftsModalClose,
    weekUncoveredShifts,
    goToRosterEdit,
    onChangeWeek,
  } = props;
  return (
    <Modal
      isOpen={isWeekUncoveredShiftsModalOpen}
      onClose={onWeekUncoveredShiftsModalClose}
      size={"3xl"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Assigned Planned Job: Uncovered Periods</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction={"column"}>
            <Text
              fontWeight={"medium"}
              fontSize={"xs"}
              mb={"4"}
              p={"2"}
              textAlign={"center"}
              rounded={"md"}
              style={{
                background: "#e85f5f1a",
                color: "#e85f5f",
              }}
            >
              The following assigned job shifts have not been fully or partially
              covered as per the assigned plan. The table below highlights the
              uncovered periods for each assigned job. Please ensure that the
              shifts are adjusted accordingly to cover these gaps before
              publishing the roster.
            </Text>
            <Flex mb={"4"} direction={"column"}>
              {weekUncoveredShifts.map(
                ({ week, year, dateUncoveredShifts }) => (
                  <Flex key={week} direction={"column"} mb={"6"}>
                    <Flex
                      alignItems={"center"}
                      justifyContent={"space-between"}
                      mb={"2"}
                    >
                      <Text
                        fontSize={"md"}
                        fontWeight={"medium"}
                        textAlign={"center"}
                        textDecoration={"underline"}
                      >{`Week: ${week}, Year: ${year}`}</Text>
                      <Button
                        variant={"outline"}
                        leftIcon={<FiEdit />}
                        size={"sm"}
                        onClick={() => {
                          onWeekUncoveredShiftsModalClose();
                          onChangeWeek(week);
                          goToRosterEdit(week);
                        }}
                      >
                        Edit
                      </Button>
                    </Flex>

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
                            <Th background="#EBF3F8" color="#1e2640">
                              Date
                            </Th>
                            <Th background="#EBF3F8" color="#1e2640">
                              Planned Job
                            </Th>
                            <Th background="#EBF3F8" color="#1e2640">
                              Planned Shift
                            </Th>
                            <Th background="#EBF3F8" color="#1e2640">
                              Uncovered Period
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody fontSize={"sm"}>
                          {dateUncoveredShifts
                            .sort(
                              (a, b) =>
                                moment(a.date).unix() - moment(b.date).unix()
                            )
                            .map(({ date, uncoveredShifts }, i) => (
                              <React.Fragment key={`${i}_${date}`}>
                                {uncoveredShifts
                                  .sort((a, b) =>
                                    a.plannedShift.st.localeCompare(
                                      b.plannedShift.st
                                    )
                                  )
                                  .map(
                                    (
                                      {
                                        miscWorkId,
                                        miscWorkName,
                                        plannedShift,
                                        secondaryJobType,
                                        uncoveredPeriods,
                                      },
                                      j
                                    ) => (
                                      <Tr key={`${i}_${j}`}>
                                        <Td py={"3"}>{`${moment(date).format(
                                          "DD MMM YYYY"
                                        )}`}</Td>
                                        <Td py={"2"}>
                                          <Text
                                            width={"fit-content"}
                                            px={"2"}
                                            py={"0.5"}
                                            background={
                                              COLORS[
                                                (miscWorkId
                                                  ? miscWorkId
                                                  : SECONDARY_JOBS_CONFIG.findIndex(
                                                      (obj) =>
                                                        obj.jobType ===
                                                        secondaryJobType
                                                    ) || 0) % COLORS.length
                                              ]
                                            }
                                          >
                                            {miscWorkId
                                              ? miscWorkName || miscWorkId
                                              : SECONDARY_JOBS_CONFIG.find(
                                                  (obj) =>
                                                    obj.jobType ===
                                                    secondaryJobType
                                                )?.label ?? secondaryJobType}
                                          </Text>
                                        </Td>
                                        <Td py={"3"} fontWeight={"medium"}>
                                          {`${moment(
                                            plannedShift.st,
                                            "HH:mm:ss"
                                          ).format("hh:mm A")} - ${moment(
                                            plannedShift.et,
                                            "HH:mm:ss"
                                          ).format("hh:mm A")}`}
                                        </Td>
                                        <Td
                                          py={"3"}
                                          color={"#e85f5f"}
                                          fontWeight={"medium"}
                                        >
                                          <Flex direction={"column"}>
                                            {uncoveredPeriods
                                              .sort((a, b) =>
                                                a.start.localeCompare(b.start)
                                              )
                                              .map(({ end, start }, k) => (
                                                <Text
                                                  key={`${i}_${j}_${k}`}
                                                  mt={k === 0 ? "0" : "2"}
                                                >
                                                  {`${moment(
                                                    start,
                                                    "HH:mm:ss"
                                                  ).format(
                                                    "hh:mm A"
                                                  )} - ${moment(
                                                    end,
                                                    "HH:mm:ss"
                                                  ).format("hh:mm A")}`}
                                                </Text>
                                              ))}
                                          </Flex>
                                        </Td>
                                      </Tr>
                                    )
                                  )}
                              </React.Fragment>
                            ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Flex>
                )
              )}
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default RosterPublishCJPWarning;
