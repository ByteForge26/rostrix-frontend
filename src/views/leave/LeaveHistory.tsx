import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
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
  AUTO_APPROVED,
  LEAVE_STATUS_MAPING,
  LEAVE_TYPE_MAPING,
  NAV_HEIGHT,
} from "../../helper/Constant";
import { IMyLeaveResponse, IPayrollConfig } from "../../helper/Interface";
import { formatDate, getDateFromString } from "../../helper/Utils";
import moment from "moment";
import { AiFillCloseCircle } from "react-icons/ai";

interface IProps {
  readonly onLeaveHistoryClose: () => void;
  readonly isLeaveHistoryOpen: boolean;
  readonly leavesData?: IMyLeaveResponse;
  readonly onDateClick?: ({
    date,
    leaveId,
  }: {
    date: Date;
    leaveId?: number;
  }) => void;
  readonly canCancelLeave: boolean;
  readonly empName: string;
  readonly year: number;
  readonly payrollConfig?: IPayrollConfig;
}
function LeaveHistory(props: IProps) {
  const {
    isLeaveHistoryOpen,
    onLeaveHistoryClose,
    leavesData,
    onDateClick,
    canCancelLeave,
    empName,
    year,
    payrollConfig,
  } = props;
  return (
    <Drawer
      placement={"bottom"}
      onClose={onLeaveHistoryClose}
      isOpen={isLeaveHistoryOpen}
      isFullHeight
    >
      <DrawerOverlay />
      <DrawerContent maxH={`calc(100vh - ${NAV_HEIGHT}px)`}>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          {`Leaves History | ${empName} | ${year}`}
        </DrawerHeader>
        <DrawerBody p={0}>
          {leavesData?.leaves ? (
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
                      From
                    </Th>
                    <Th background="#EBF3F8" color="#616161">
                      To
                    </Th>
                    <Th background="#EBF3F8" color="#616161">
                      Duration
                    </Th>
                    <Th background="#EBF3F8" color="#616161">
                      Type
                    </Th>
                    <Th background="#EBF3F8" color="#616161">
                      Applied On
                    </Th>
                    <Th background="#EBF3F8" color="#616161">
                      Comment
                    </Th>
                    <Th background="#EBF3F8" color="#616161">
                      Status
                    </Th>
                    {canCancelLeave ? (
                      <Th background="#EBF3F8" color="#616161">
                        Action
                      </Th>
                    ) : null}
                  </Tr>
                </Thead>
                <Tbody fontSize={"sm"}>
                  {leavesData.leaves
                    .filter(({ status }) => status === AUTO_APPROVED)
                    .sort(
                      (a, b) =>
                        new Date(a.fromDate).getTime() -
                        new Date(b.fromDate).getTime()
                    )
                    .map(
                      (
                        {
                          id,
                          appliedOn,
                          comment,
                          fromDate,
                          status,
                          toDate,
                          type,
                        },
                        i
                      ) => (
                        <Tr key={id}>
                          <Td py={"3"}>{formatDate(fromDate)}</Td>
                          <Td py={"3"}>{formatDate(toDate)}</Td>
                          <Td py={"3"}>
                            {moment(new Date(toDate)).diff(
                              moment(fromDate),
                              "days"
                            ) + 1}
                            {`${
                              moment(new Date(toDate)).diff(
                                moment(fromDate),
                                "days"
                              )
                                ? " days"
                                : " day"
                            }`}
                          </Td>
                          <Td py={"3"}>
                            <Flex
                              background={
                                LEAVE_TYPE_MAPING.find(
                                  ({ value }) => type === value
                                )?.bgColor ?? "white"
                              }
                              py={"0.5"}
                              px={"2"}
                              width={"fit-content"}
                              rounded={"sm"}
                            >
                              <Text
                                color={
                                  LEAVE_TYPE_MAPING.find(
                                    ({ value }) => type === value
                                  )?.color ?? "black"
                                }
                                fontWeight={"medium"}
                              >
                                {
                                  LEAVE_TYPE_MAPING.find(
                                    ({ value }) => type === value
                                  )?.label
                                }
                              </Text>
                            </Flex>
                          </Td>
                          <Td py={"3"}>{formatDate(appliedOn)}</Td>
                          <Td py={"3"}>{comment}</Td>
                          <Td py={"3"}>
                            <Flex>
                              <Text
                                color={
                                  LEAVE_STATUS_MAPING.find(
                                    ({ value }) => status === value
                                  )?.color ?? "black"
                                }
                                fontWeight={"medium"}
                              >
                                {
                                  LEAVE_STATUS_MAPING.find(
                                    ({ value }) => status === value
                                  )?.label
                                }
                              </Text>
                            </Flex>
                          </Td>
                          {canCancelLeave ? (
                            <Td py={"3"}>
                              {payrollConfig &&
                              getDateFromString(toDate).getTime() >=
                                moment(payrollConfig.currentPStartDateTime)
                                  .startOf("day")
                                  .unix() *
                                  1000 &&
                              onDateClick ? (
                                <Button
                                  leftIcon={<AiFillCloseCircle />}
                                  size={"sm"}
                                  variant={"ghost"}
                                  colorScheme="red"
                                  onClick={() =>
                                    onDateClick({
                                      date: getDateFromString(fromDate),
                                      leaveId: id,
                                    })
                                  }
                                >
                                  Cancel
                                </Button>
                              ) : null}
                            </Td>
                          ) : null}
                        </Tr>
                      )
                    )}
                </Tbody>
              </Table>
            </TableContainer>
          ) : null}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default LeaveHistory;
