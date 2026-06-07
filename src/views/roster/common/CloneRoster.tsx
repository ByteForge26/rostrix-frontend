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
  Select,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { IWeekResponse } from "../../../helper/Interface";

function CloneRoster(props: {
  readonly isCloneWeekModalOpen?: boolean;
  readonly onCloneWeekModalClose: () => void;
  readonly selectedWeek?: number;
  readonly weeks: IWeekResponse[];
  readonly cloneWeekId: number;
  readonly setCloneWeekId: (value: React.SetStateAction<number>) => void;
  readonly onStartFreshRoster: () => void;
  readonly onCloneWeek: () => void;
}) {
  const {
    isCloneWeekModalOpen,
    onCloneWeekModalClose,
    selectedWeek,
    weeks,
    cloneWeekId,
    setCloneWeekId,
    onCloneWeek,
    onStartFreshRoster,
  } = props;
  return (
    <Modal isOpen={!!isCloneWeekModalOpen} onClose={onCloneWeekModalClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Autofill Roster</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize={"sm"} mb={"2"}>
            Would you like to autofill shifts from one of your previous week?
          </Text>
          {selectedWeek && weeks?.length ? (
            <Flex alignItems={"center"}>
              <Text fontSize={"sm"} fontWeight={"medium"}>
                Autofill from
              </Text>
              <Select
                value={cloneWeekId}
                width={"fit-content"}
                marginLeft={4}
                onChange={(e) => setCloneWeekId(Number(e.target.value))}
              >
                <option selected value={""}>
                  Select Week
                </option>

                {weeks
                  .filter(({ number }) => number < selectedWeek)
                  .sort((a, b) => b.number - a.number)
                  .map(({ number }) => {
                    return (
                      <option value={number} key={number}>
                        Week {number}
                      </option>
                    );
                  })}
              </Select>
            </Flex>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant={"outline"} mr={3} onClick={onStartFreshRoster}>
            Start Fresh
          </Button>

          <Button isDisabled={!cloneWeekId} onClick={onCloneWeek}>
            Autofill
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CloneRoster;
