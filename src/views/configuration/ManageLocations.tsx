import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useBoolean,
  useDisclosure,
} from "@chakra-ui/react";
import AppHeader from "../../components/AppHeader";
import {
  IApiResponse,
  ICityResponse,
  ICountryResponse,
  IStateResponse,
} from "../../helper/Interface";
import { useApi } from "../../hooks/useApi";
import { ENDPOINT } from "../../config/endpoint.config";
import { FiEdit, FiEdit3 } from "react-icons/fi";
import { useToasts } from "react-toast-notifications";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSION } from "../../config/permission.config";
import { BsSearch } from "react-icons/bs";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";

function ManageLocations() {
  const { get, post, put } = useApi();
  const { addToast } = useToasts();
  const { checkForPermission } = usePermission();
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [expandedIndex, setExpandedIndex] = useState(-1);
  const [countries, setCountries] = useState<ICountryResponse[]>([]);
  const [stateSearchKey, setStateSearchKey] = useState("");
  const [states, setStates] = useState<IStateResponse[]>([]);
  const [cities, setCities] = useState<ICityResponse[]>([]);
  const [countryId, setCountryId] = useState(0);
  //
  const [stateId, setStateId] = useState(0);
  const [stateName, setStateName] = useState("");
  const [stateCode, setStateCode] = useState("");
  //
  const [cityId, setCityId] = useState(0);
  const [cityName, setCityName] = useState("");

  useEffect(() => {
    getCountries();
  }, []);

  const {
    isOpen: isStateOpen,
    onOpen: onStateOpen,
    onClose: onStateClose,
  } = useDisclosure();
  const {
    isOpen: isCityOpen,
    onOpen: onCityOpen,
    onClose: onCityClose,
  } = useDisclosure();
  //
  useEffect(() => {
    getCountries();
  }, []);

  const getCountries = async () => {
    onLoading();
    const res = await get<ICountryResponse[]>(ENDPOINT["/master"]["/country"]);
    offLoading();
    if (res?.length) {
      setCountries(res.sort((a, b) => a.name.localeCompare(b.name)));
      setCountryId(res.sort((a, b) => a.name.localeCompare(b.name))[0].id);
    } else {
      setCountries([]);
    }
  };
  useEffect(() => {
    if (countryId) {
      getStates(countryId);
    }
  }, [countryId]);

  const getStates = async (countryId: number) => {
    onLoading();
    const res = await get<IStateResponse[]>(ENDPOINT["/master"]["/state"], {
      params: { countryId },
    });
    offLoading();
    if (res?.length) {
      setStates(res.sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      setStates([]);
    }
  };
  const getCities = async (stateId: number) => {
    setCities([]);
    const res = await get<ICityResponse[]>(ENDPOINT["/master"]["/city"], {
      params: { stateId },
    });
    if (res?.length) {
      setCities(res.sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const onCreateState = (countryId: number) => {
    setCountryId(countryId);
    setStateId(0);
    setStateName("");
    setStateCode("");
    onStateOpen();
  };
  const onEditState = (
    countryId: number,
    stateId: number,
    name: string,
    code: string
  ) => {
    setCountryId(countryId);
    setStateId(stateId);
    setStateName(name);
    setStateCode(code);
    onStateOpen();
  };
  const onSaveState = () => {
    onStateClose();
    if (stateId) {
      put<IApiResponse>(ENDPOINT["/master"]["/state"] + `/${stateId}`, {
        data: {
          name: stateName,
          code: stateCode,
          countryId: countryId,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getStates(Number(countryId));
        }
      });
    } else {
      post<IApiResponse>(ENDPOINT["/master"]["/state"], {
        data: {
          name: stateName,
          code: stateCode,
          countryId: countryId,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getStates(Number(countryId));
        }
      });
    }
  };
  const onCreateCity = (stateId: number) => {
    setStateId(stateId);
    setCityId(0);
    setCityName("");
    onCityOpen();
  };
  const onEditCity = (stateId: number, cityId: number, name: string) => {
    setStateId(stateId);
    setCityId(cityId);
    setCityName(name);
    onCityOpen();
  };
  const onSaveCity = () => {
    onCityClose();
    if (cityId) {
      put<IApiResponse>(ENDPOINT["/master"]["/city"] + `/${cityId}`, {
        data: {
          name: cityName,
          stateId: stateId,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getCities(Number(stateId));
        }
      });
    } else {
      post<IApiResponse>(ENDPOINT["/master"]["/city"], {
        data: {
          name: cityName,
          stateId: stateId,
        },
      }).then((res) => {
        addToast(res.message, {
          appearance: res.success ? "success" : "error",
        });
        if (res.success) {
          getCities(Number(stateId));
        }
      });
    }
  };
  return (
    <AppContainer heading="Locations" info="Add/edit state/city name(s).">
      <AppHeader>
        <InputGroup width={"fit-content"}>
          <InputLeftElement pointerEvents="none">
            <BsSearch color="gray.300" />
          </InputLeftElement>
          <Input
            background={"white"}
            value={stateSearchKey}
            onChange={(e) => setStateSearchKey(e.target.value)}
            placeholder="Search State"
            width={"fit-content"}
          />
        </InputGroup>
        {checkForPermission(PERMISSION.Config["Location"].Update) && (
          <Flex ml={"4"}>
            <Button onClick={() => onCreateState(countryId)}>
              + Add State
            </Button>
          </Flex>
        )}
      </AppHeader>

      <Flex width={"100%"}>
        {countries.length ? (
          <Accordion
            index={expandedIndex}
            onChange={(index) => {
              setExpandedIndex(Number(index));
            }}
            width={"100%"}
            allowToggle
          >
            {states
              .filter(({ name }) =>
                name
                  .trim()
                  .toLowerCase()
                  .includes(stateSearchKey.trim().toLowerCase())
              )
              .map(({ id: stateId, name, code }, j) => {
                return (
                  <Flex
                    key={stateId}
                    direction={"column"}
                    style={{
                      marginBottom: 8,
                      borderRadius: 4,
                      border: "1px solid lightgrey",
                      overflow: "hidden",
                    }}
                  >
                    <AccordionItem border={"none"}>
                      <AccordionButton
                        onClick={() => getCities(stateId)}
                        // background={"#d3d3d345"}
                      >
                        <Box as="span" flex="1" textAlign="left">
                          <Flex
                            p={"1"}
                            justifyContent={"space-between"}
                            alignItems={"center"}
                            pr={"4"}
                          >
                            <Text fontWeight={"medium"}>
                              {j + 1}. {name}
                            </Text>
                            {j === expandedIndex &&
                            checkForPermission(
                              PERMISSION.Config["Location"].Update
                            ) ? (
                              <Button
                                ml={"auto"}
                                leftIcon={<FiEdit />}
                                size={"sm"}
                                variant={"outline"}
                                onClick={() =>
                                  onEditState(countryId, stateId, name, code)
                                }
                              >
                                Edit
                              </Button>
                            ) : null}
                          </Flex>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel p={0}>
                        <Flex
                          direction={"column"}
                          borderTop={"1px solid lightgray"}
                        >
                          <Flex
                            px={"4"}
                            pt={"4"}
                            mb={"4"}
                            justifyContent={"space-between"}
                            alignItems={"center"}
                          >
                            <Text fontWeight={"bold"}>
                              Total Cities: {cities?.length ? cities.length : 0}
                            </Text>
                            {checkForPermission(
                              PERMISSION.Config["Location"].Update
                            ) && (
                              <Button onClick={() => onCreateCity(stateId)}>
                                + Add City
                              </Button>
                            )}
                          </Flex>
                          <Flex>
                            {cities?.length ? (
                              <>
                                {cities.map(({ name, id: cityId }) => {
                                  return (
                                    <Flex
                                      key={cityId}
                                      px={"4"}
                                      py={"1"}
                                      border={"1px solid lightgray"}
                                      m={"4"}
                                      mt={"0"}
                                      rounded={"md"}
                                      alignItems={"center"}
                                    >
                                      <Text fontSize={"sm"} mr={"2"}>
                                        {name}
                                      </Text>
                                      {checkForPermission(
                                        PERMISSION.Config["Location"].Update
                                      ) && (
                                        <FiEdit3
                                          cursor={"pointer"}
                                          data-testid="edit-city-icon"
                                          fontSize={12}
                                          onClick={() =>
                                            onEditCity(stateId, cityId, name)
                                          }
                                        />
                                      )}
                                    </Flex>
                                  );
                                })}
                              </>
                            ) : null}
                          </Flex>
                        </Flex>
                      </AccordionPanel>
                    </AccordionItem>
                  </Flex>
                );
              })}
          </Accordion>
        ) : isLoading ? (
          <AppLoader />
        ) : (
          <AppNoData />
        )}
      </Flex>

      <Modal isOpen={isStateOpen} onClose={onStateClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{stateId ? "Edit" : "Add"} State</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter here"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
              />
            </FormControl>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Code</FormLabel>
              <Input
                placeholder="Enter here"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Flex width={"full"} direction={"column"}>
              <Text
                width={"full"}
                background={"#fff7d6"}
                color={"#907400"}
                fontSize={"xs"}
                px={"4"}
                py={"2"}
                rounded={"md"}
                textAlign={"center"}
                mb={"4"}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      "Please double check the details, State can't be deleted.",
                  }}
                ></span>
              </Text>
              <Flex justifyContent={"flex-end"}>
                <Button
                  variant="outline"
                  fontSize={"sm"}
                  mr={3}
                  onClick={onStateClose}
                >
                  Close
                </Button>
                <Button
                  isDisabled={!stateName || !stateCode}
                  onClick={onSaveState}
                >
                  Save
                </Button>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={isCityOpen} onClose={onCityClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{cityId ? "Edit" : "Add"} City</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter here"
                value={cityName}
                onChange={(e) => {
                  if (/^[A-Za-z\s]*$/.test(e.target.value)) {
                    setCityName(e.target.value);
                  }
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Flex width={"full"} direction={"column"}>
              <Text
                width={"full"}
                background={"#fff7d6"}
                color={"#907400"}
                fontSize={"xs"}
                px={"4"}
                py={"2"}
                rounded={"md"}
                textAlign={"center"}
                mb={"4"}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html:
                      "Please double check the details, City can't be deleted.",
                  }}
                ></span>
              </Text>
              <Flex justifyContent={"flex-end"}>
                <Button
                  variant="outline"
                  fontSize={"sm"}
                  mr={3}
                  onClick={onCityClose}
                >
                  Close
                </Button>
                <Button isDisabled={!cityName} onClick={onSaveCity}>
                  Save
                </Button>
              </Flex>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppContainer>
  );
}

export default ManageLocations;
