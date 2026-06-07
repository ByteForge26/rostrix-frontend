import React, { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { useToasts } from "react-toast-notifications";
import { IApiResponse, ISport } from "../../helper/Interface";
import { ENDPOINT } from "../../config/endpoint.config";
import {
  Flex,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Text,
  Button,
  useDisclosure,
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
  InputGroup,
  InputLeftElement,
  useBoolean,
} from "@chakra-ui/react";
import AppContainer from "../../components/AppContainer";
import { FiEdit } from "react-icons/fi";
import AppHeader from "../../components/AppHeader";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSION } from "../../config/permission.config";
import { BsSearch, BsSortAlphaDown, BsSortAlphaDownAlt } from "react-icons/bs";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import AppTableHeadingWithSort from "../../components/AppTableHeadingWithSort";
import { sortByFunc } from "../../helper/Utils";

function ManageSports() {
  const { get, post, put } = useApi();
  const { addToast } = useToasts();
  const { checkForPermission } = usePermission();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [searchKey, setSearchKey] = useState("");
  const [sports, setSports] = useState<ISport[]>([]);
  const [sportId, setSportId] = useState("");
  const [sportName, setSportName] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortMethodAsc, setSortMethodAsc] = useState<boolean>(true);
  useEffect(() => {
    getSports();
  }, []);

  const getSports = async () => {
    onLoading();
    const res = await get<ISport[]>(ENDPOINT["/master"]["/sport"]);
    offLoading();
    if (res?.length) {
      setSports(res);
    } else {
      setSports([]);
    }
  };
  const onCreateSport = () => {
    onOpen();
    setSportId("");
    setSportName("");
  };
  const onEditSport = (id: number, name: string) => {
    onOpen();
    setSportId(id.toString());
    setSportName(name);
  };
  const onSaveSport = () => {
    onClose();
    if (sportId) {
      put<IApiResponse>(ENDPOINT["/master"]["/sport"] + `/${sportId}`, {
        data: {
          name: sportName,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getSports();
        }
      });
    } else {
      post<IApiResponse>(ENDPOINT["/master"]["/sport"], {
        data: {
          name: sportName,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getSports();
        }
      });
    }
  };
  return (
    <AppContainer heading="Sports" info="Add/edit name of available sports.">
      <AppHeader>
        <InputGroup width={"fit-content"}>
          <InputLeftElement pointerEvents="none">
            <BsSearch color="gray.300" />
          </InputLeftElement>
          <Input
            background={"white"}
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            placeholder="Search here"
            width={"fit-content"}
          />
        </InputGroup>
        {checkForPermission(PERMISSION.Config["Sports"].Update) && (
          <Flex ml={"4"}>
            <Button onClick={onCreateSport}>+ Add Sport</Button>
          </Flex>
        )}
      </AppHeader>

      <Flex overflow={"auto"}>
        {sports.length ? (
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
                      value="name"
                      label="Name"
                      sortBy={sortBy}
                      setSortBy={setSortBy}
                      sortMethodAsc={sortMethodAsc}
                      setSortMethodAsc={setSortMethodAsc}
                    />
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody fontSize={"sm"}>
                {sports
                  .filter(({ name }) =>
                    name
                      .trim()
                      .toLowerCase()
                      .includes(searchKey.trim().toLowerCase())
                  )
                  .sort((a, b) => sortByFunc(a, b, sortBy, sortMethodAsc))
                  .map(({ name, id }, i) => (
                    <Tr key={id}>
                      <Td py={"3"}>{i + 1}</Td>
                      <Td py={"3"}>{name}</Td>
                      <Td py={"3"}>
                        {checkForPermission(
                          PERMISSION.Config["Sports"].Update
                        ) && (
                          <Button
                            leftIcon={<FiEdit />}
                            size={"sm"}
                            variant={"ghost"}
                            color={"#027DBC"}
                            onClick={() => onEditSport(id, name)}
                          >
                            Edit
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </TableContainer>
        ) : isLoading ? (
          <AppLoader />
        ) : (
          <AppNoData />
        )}
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{sportId ? "Edit" : "Add"} Sport</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter here"
                value={sportName}
                onChange={(e) => {
                  if (/^[A-Za-z0-9\s]*$/.test(e.target.value)) {
                    setSportName(e.target.value);
                  }
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" fontSize={"sm"} mr={3} onClick={onClose}>
              Close
            </Button>
            <Button isDisabled={!sportName} onClick={onSaveSport}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppContainer>
  );
}

export default ManageSports;
