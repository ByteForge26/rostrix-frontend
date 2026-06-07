import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import React from "react";

function RosterPublishForceConfirmWarning(props: {
  readonly isForceConfirmModalOpen: boolean;
  readonly onForceConfirmModalClose: () => void;
  readonly messageObj?: {
    messageType: "INFO" | "WARN";
    message: string;
  }[];
  readonly onPublishRoster: (props: {
    notifyTo: string;
    forceConfirm?: boolean;
    week?: number;
  }) => void;
  readonly globalNotifyTo: string;
}) {
  const {
    isForceConfirmModalOpen,
    onForceConfirmModalClose,
    messageObj,
    onPublishRoster,
    globalNotifyTo,
  } = props;
  return (
    <Modal isOpen={isForceConfirmModalOpen} onClose={onForceConfirmModalClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Warning</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {messageObj?.length ? (
            <Flex>
              {messageObj.map(({ message, messageType }) => (
                <Text
                  mt={"2"}
                  key={message}
                  background={messageType === "INFO" ? "#fff7d6" : "#ffeaea"}
                  color={messageType === "INFO" ? "#907400" : "red"}
                  fontSize={"xs"}
                  p={"2"}
                  rounded={"md"}
                  textAlign={"center"}
                  mb={"2"}
                >
                  <span dangerouslySetInnerHTML={{ __html: message }}></span>
                </Text>
              ))}
            </Flex>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="outline"
            fontSize={"sm"}
            mr={3}
            onClick={onForceConfirmModalClose}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              onForceConfirmModalClose();
              onPublishRoster({
                notifyTo: globalNotifyTo,
                forceConfirm: true,
              });
            }}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default RosterPublishForceConfirmWarning;
