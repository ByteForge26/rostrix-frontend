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
import {
  IEmpDailyExceedingHours,
  IEmpExceedingHours,
  IEmpWeeklyExceedingHours,
} from "../../../helper/Interface";
import moment from "moment";
import { formatDate } from "../../../helper/Utils";
import { FiExternalLink } from "react-icons/fi";
import { cloneDeep } from "lodash";

function RosterPublishHoursWarning(props: {
  readonly isEmpExceedingHoursListModalOpen: boolean;
  readonly onEmpExceedingHoursListModalClose: () => void;
  readonly empDailyExceedingHoursList: IEmpDailyExceedingHours[];
  readonly empWeeklyExceedingHoursList: IEmpWeeklyExceedingHours[];
  readonly empExceedingHoursList: IEmpExceedingHours[];
  readonly onChangeWeek: (week: number) => void;
  readonly goToRosterEdit: (week: number) => void;
}) {
  const {
    isEmpExceedingHoursListModalOpen,
    onEmpExceedingHoursListModalClose,
    empDailyExceedingHoursList,
    empWeeklyExceedingHoursList,
    empExceedingHoursList,
    goToRosterEdit,
    onChangeWeek,
  } = props;
  return (
    <Modal
      isOpen={isEmpExceedingHoursListModalOpen}
      onClose={onEmpExceedingHoursListModalClose}
      size={"5xl"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Review and Fix Hours</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction={"column"}>
            <Text
              fontWeight={"medium"}
              fontSize={"xs"}
              mb={"4"}
              p={"2"}
              textAlign={"center"}
              style={{
                background: "#e85f5f1a",
                color: "#e85f5f",
              }}
              rounded={"md"}
            >
              Please review the working hours for the following employees as
              their rostered hours exceed the allowed limit for the payroll
              month. Adjust their hours to ensure they are within the limit.
            </Text>
            {empDailyExceedingHoursList?.length ? (
              <Flex mb={"4"} direction={"column"}>
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
                  >{`Daily Working Hours Issues`}</Text>
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
                          Sr. No.
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Employee
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Date
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Week
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Working Hours
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody fontSize={"sm"}>
                      {cloneDeep(empDailyExceedingHoursList)
                        .sort(
                          (a, b) =>
                            moment(a.date).unix() - moment(b.date).unix()
                        )
                        .map(
                          (
                            { empId, empName, date, weekNumber, workHours },
                            i
                          ) => (
                            <Tr key={`${empId}_${date}`}>
                              <Td py={"3"}>{i + 1}</Td>
                              <Td py={"3"}>{`${empName} (${empId})`}</Td>
                              <Td py={"2"}>{`${formatDate(date)}`}</Td>
                              <Td py={"3"}>
                                <Button
                                  variant={"ghost"}
                                  size={"sm"}
                                  rightIcon={<FiExternalLink />}
                                  onClick={() => {
                                    onEmpExceedingHoursListModalClose();
                                    onChangeWeek(weekNumber);
                                    goToRosterEdit(weekNumber);
                                  }}
                                >
                                  {`Week ${weekNumber}`}
                                </Button>
                              </Td>
                              <Td
                                py={"3"}
                                color={"#e85f5f"}
                                fontWeight={"medium"}
                              >
                                {workHours}
                              </Td>
                            </Tr>
                          )
                        )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Flex>
            ) : null}
            {empWeeklyExceedingHoursList?.length ? (
              <Flex mb={"4"} direction={"column"}>
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
                  >{`Weekly Working Hours Issues`}</Text>
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
                          Sr. No.
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Employee
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Date Range
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Week
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Working Hours
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Exceeding Hours
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody fontSize={"sm"}>
                      {cloneDeep(empWeeklyExceedingHoursList)
                        .sort((a, b) => a.weekNumber - b.weekNumber)
                        .map(
                          (
                            {
                              allowedHours,
                              empId,
                              wendDate,
                              wstartDate,
                              totalHours,
                              empName,
                              weekNumber,
                            },
                            i
                          ) => (
                            <Tr key={`${empId}_${totalHours}`}>
                              <Td py={"3"}>{i + 1}</Td>
                              <Td py={"3"}>{`${empName} (${empId})`}</Td>
                              <Td py={"2"}>
                                {`${formatDate(wstartDate)} to ${formatDate(
                                  wendDate
                                )}`}
                              </Td>
                              <Td py={"3"}>
                                <Button
                                  variant={"ghost"}
                                  size={"sm"}
                                  rightIcon={<FiExternalLink />}
                                  onClick={() => {
                                    onEmpExceedingHoursListModalClose();
                                    onChangeWeek(weekNumber);
                                    goToRosterEdit(weekNumber);
                                  }}
                                >
                                  {`Week ${weekNumber}`}
                                </Button>
                              </Td>
                              <Td
                                py={"3"}
                              >{`${totalHours}/${allowedHours}`}</Td>
                              <Td
                                py={"3"}
                                color={"#e85f5f"}
                                fontWeight={"medium"}
                              >
                                {totalHours - allowedHours}
                              </Td>
                            </Tr>
                          )
                        )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Flex>
            ) : null}
            {empExceedingHoursList?.length ? (
              <Flex mb={"4"} direction={"column"}>
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
                  >{`Monthly Working Hours Issues`}</Text>
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
                          Sr. No.
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Employee
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Date Range
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Working Hours
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Exceeding Hours
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody fontSize={"sm"}>
                      {cloneDeep(empExceedingHoursList)
                        .filter((e) => e)
                        .sort(
                          (a, b) =>
                            moment(a.pendDate || "").unix() -
                            moment(b.pstartDate || "").unix()
                        )
                        .map(
                          (
                            {
                              allowedHours,
                              empId,
                              pendDate,
                              pstartDate,
                              totalHours,
                              empName,
                            },
                            i
                          ) => (
                            <Tr key={`${empId}_${totalHours}`}>
                              <Td py={"3"}>{i + 1}</Td>
                              <Td py={"3"}>{`${empName} (${empId})`}</Td>
                              <Td py={"2"}>
                                {`${formatDate(pstartDate)} to ${formatDate(
                                  pendDate
                                )}`}
                              </Td>
                              <Td
                                py={"3"}
                              >{`${totalHours}/${allowedHours}`}</Td>
                              <Td
                                py={"3"}
                                color={"#e85f5f"}
                                fontWeight={"medium"}
                              >
                                {totalHours - allowedHours}
                              </Td>
                            </Tr>
                          )
                        )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Flex>
            ) : null}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default RosterPublishHoursWarning;
