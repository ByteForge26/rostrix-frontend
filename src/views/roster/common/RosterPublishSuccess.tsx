import {
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { MONTHS } from "../../../helper/Constant";
import Lottie, { Options } from "react-lottie";
import * as animationData from "../../../assets/animation/success.json";

function RosterPublishSuccess(props: {
  readonly selectedMonth?: number;
  readonly selectedWeek?: number;
  readonly isPublishedRosterModalOpen: boolean;
  readonly onPublishedRosterModalClose: () => void;
  readonly globalNotifyTo: string;
}) {
  const defaultOptions: Options = {
    loop: false,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const {
    selectedMonth,
    selectedWeek,
    isPublishedRosterModalOpen,
    onPublishedRosterModalClose,
    globalNotifyTo,
  } = props;
  return (
    <Modal
      isOpen={isPublishedRosterModalOpen}
      onClose={onPublishedRosterModalClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction={"column"} pb={"4"}>
            <Flex p={"2"}>
              <Lottie options={defaultOptions} height={160} width={160} />
            </Flex>
            <Text
              fontWeight={"medium"}
              fontSize={"lg"}
              textAlign={"center"}
              mb={"2"}
            >
              Well hello there, Roster Master!
            </Text>
            {selectedMonth !== undefined || selectedWeek ? (
              <Text fontSize={"sm"} textAlign={"center"}>
                {globalNotifyTo === "NONE"
                  ? `Roster for ${
                      selectedWeek
                        ? `Week: ${selectedWeek}`
                        : `${MONTHS[selectedMonth || 0]} month`
                    } has been published. Keep up the amazing work, & let's conquer more rosters together!`
                  : `Roster for ${
                      selectedWeek
                        ? `Week: ${selectedWeek}`
                        : `${MONTHS[selectedMonth || 0]} month`
                    } has been published and shared with team. Keep up the amazing work, & let's conquer more rosters together!`}
              </Text>
            ) : null}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default RosterPublishSuccess;
