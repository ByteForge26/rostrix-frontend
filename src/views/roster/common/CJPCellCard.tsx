import { Flex, Menu, MenuButton, useDisclosure } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { BsPlusCircle } from "react-icons/bs";
import { IClusterResponse } from "../../../helper/Interface";
import CJPShiftDetails from "./CJPShiftDetails";

function CJPCellCard(props: {
  clusters: IClusterResponse[];
  time: string;
  edit: boolean;
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  onSaveShift: (props: {
    startTime: string;
    endTime: string;
    clusterId: number;
    deleted?: boolean;
    id?: number;
  }) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}) {
  const {
    clusters,
    time,
    edit,
    onSaveShift,
    message,
    setMessage,
    isOpen,
    onClose,
    onOpen,
  } = props;

  useEffect(() => {
    setMessage("");
    onOpen();
  }, []);

  return (
    <Flex
      width={"full"}
      justifyContent={"center"}
      alignItems={"center"}
      zIndex={200}
    >
      <Menu
        isOpen={isOpen}
        onClose={() => {
          onClose();
        }}
        placement="auto"
      >
        <MenuButton
          as={Flex}
          data-testid="menu-button"
          onClick={() => {
            if (edit) onOpen();
          }}
          background={"#027DBC0d"}
          width={"100%"}
          height={"100%"}
          justifyContent={"center"}
          alignItems={"center"}
          color={"#027DBC"}
        >
          <Flex justifyContent={"center"}>
            <BsPlusCircle />
          </Flex>
        </MenuButton>
        {isOpen && edit ? (
          <CJPShiftDetails
            startTime={time}
            onSaveShift={({ clusterId, endTime, startTime, deleted, id }) => {
              onSaveShift({ clusterId, endTime, startTime, deleted, id });
            }}
            clusters={clusters}
            onClose={onClose}
            message={message}
          />
        ) : null}
      </Menu>
    </Flex>
  );
}

export default CJPCellCard;
