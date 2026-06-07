import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import AppHeader from "../../components/AppHeader";
import { useApi } from "../../hooks/useApi";
import { useToasts } from "react-toast-notifications";
import { ICostCenter, ICostCenterResponse } from "../../helper/Interface";
import { ENDPOINT } from "../../config/endpoint.config";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useBoolean,
  useDisclosure,
} from "@chakra-ui/react";
import { FiFilter } from "react-icons/fi";
import { BsSearch } from "react-icons/bs";
import AppFilterChips from "../../components/AppFilterChips";
import AppRightDrawer from "../../components/AppRightDrawer";
import AppSelect from "../../components/AppSelect";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import { useService } from "../../hooks/useService";

function ViewCostCenters() {
  const { get, post, put } = useApi();
  const { addToast } = useToasts();
  const {
    isOpen: isFilterOpen,
    onClose: onFilterClose,
    onOpen: onFilterOpen,
  } = useDisclosure();
  const { costCenters, getCostCenters, isLoading } = useService();
  const [searchKey, setSearchKey] = useState("");

  const [selectedZone, setSelectedZone] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string[]>([]);
  useEffect(() => {
    getCostCenters({ allTypes: true });
  }, []);

  return (
    <AppContainer
      heading="Cost Center"
      info="Filter out live cost center(s) by zone, state, city."
    >
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
        <Flex>
          <AppFilterChips
            onClick={onFilterOpen}
            filters={[...selectedZone, ...selectedState, ...selectedCity]}
          />

          <Flex>
            <Button
              variant={"outline"}
              leftIcon={<FiFilter />}
              onClick={onFilterOpen}
            >
              Filters
            </Button>
          </Flex>
        </Flex>
      </AppHeader>

      {costCenters.length ? (
        <Flex direction={"column"} overflow={"auto"}>
          <Accordion allowMultiple defaultIndex={[]}>
            {costCenters?.length
              ? costCenters
                  .filter(
                    ({ costCentreName, city, address }) =>
                      costCentreName
                        .trim()
                        .toLowerCase()
                        .includes(searchKey.trim().toLowerCase()) ||
                      city
                        .trim()
                        .toLowerCase()
                        .includes(searchKey.trim().toLowerCase()) ||
                      address
                        .trim()
                        .toLowerCase()
                        .includes(searchKey.trim().toLowerCase()),
                  )
                  .filter(({ costCentreZone }) => {
                    if (selectedZone.length) {
                      return selectedZone.includes(costCentreZone);
                    }
                    return true;
                  })
                  .filter(({ state }) => {
                    if (selectedState.length) {
                      return selectedState.includes(state);
                    }
                    return true;
                  })
                  .filter(({ city }) => {
                    if (selectedCity.length) {
                      return selectedCity.includes(city);
                    }
                    return true;
                  })
                  .sort((a, b) => a.city.localeCompare(b.city))
                  .map(
                    (
                      {
                        address,
                        city,
                        country,
                        costCentreName,
                        costCentreZone,
                        id,
                        managerEmpId,
                        pinCode,
                        state,
                        superManagerEmpId,
                        updatedAt,
                        displayName,
                        disabled,
                      },
                      i,
                    ) => {
                      return (
                        <Flex
                          background={"white"}
                          key={id}
                          direction={"column"}
                          style={{
                            marginBottom: 16,
                            borderRadius: 4,
                            border: "1px solid lightgrey",
                            overflow: "hidden",
                          }}
                        >
                          <AccordionItem
                            border={"none"}
                            opacity={disabled ? "0.75" : 1}
                            background={disabled ? "#f2f2f2" : "unset"}
                          >
                            <AccordionButton>
                              <Box as="span" flex="1" textAlign="left">
                                <Flex p={"1"} justifyContent={"space-between"}>
                                  <Text fontWeight={"bold"}>
                                    {i + 1}. {city},
                                    {displayName ? ` ${displayName}, ` : ""}{" "}
                                    <small>{costCentreName}</small>
                                    {disabled ? (
                                      <Badge ml={"2"}>DISABLED</Badge>
                                    ) : null}
                                  </Text>
                                  <Flex alignItems={"center"}>
                                    <Text fontSize={"sm"} mr={"1"}>
                                      Zone:
                                    </Text>
                                    <Text
                                      fontSize={"sm"}
                                      fontWeight={"bold"}
                                      mr={"4"}
                                    >
                                      {costCentreZone}
                                    </Text>
                                  </Flex>
                                </Flex>

                                <Flex
                                  pl={"1"}
                                  alignItems={"center"}
                                  pt={"2"}
                                  pr={"4"}
                                >
                                  <Text fontSize={"xs"}>{address}</Text>
                                </Flex>
                              </Box>
                              <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel p={0}>
                              <Flex
                                direction={"column"}
                                borderTop={"1px solid lightgray"}
                                padding={"4"}
                              >
                                <Flex
                                  justifyContent={"space-between"}
                                  wrap={"wrap"}
                                >
                                  <Text
                                    fontSize={"sm"}
                                    mb={"2"}
                                    minWidth={"25%"}
                                  >
                                    <strong>Cost Center:</strong>{" "}
                                    {costCentreName}
                                  </Text>
                                  <Text
                                    fontSize={"sm"}
                                    mb={"2"}
                                    minWidth={"25%"}
                                  >
                                    <strong>Cost Center Zone:</strong>{" "}
                                    {costCentreZone}
                                  </Text>
                                  <Text
                                    fontSize={"sm"}
                                    mb={"2"}
                                    minWidth={"25%"}
                                  >
                                    <strong>Manger Id:</strong> {managerEmpId}
                                  </Text>
                                  <Text
                                    fontSize={"sm"}
                                    mb={"2"}
                                    minWidth={"25%"}
                                  >
                                    <strong>Super Manger Id:</strong>{" "}
                                    {superManagerEmpId}
                                  </Text>
                                  <Text
                                    fontSize={"sm"}
                                    mb={"2"}
                                    minWidth={"25%"}
                                  >
                                    <strong>City:</strong> {city}
                                  </Text>
                                  <Text
                                    fontSize={"sm"}
                                    mb={"2"}
                                    minWidth={"25%"}
                                  >
                                    <strong>State:</strong> {state}
                                  </Text>
                                  <Text
                                    fontSize={"sm"}
                                    mb={"2"}
                                    minWidth={"25%"}
                                  >
                                    <strong>Country:</strong> {country}
                                  </Text>
                                  <Text
                                    fontSize={"sm"}
                                    mb={"2"}
                                    minWidth={"25%"}
                                  >
                                    <strong>Pin Code:</strong> {pinCode}
                                  </Text>
                                </Flex>
                              </Flex>
                            </AccordionPanel>
                          </AccordionItem>
                        </Flex>
                      );
                    },
                  )
              : null}
          </Accordion>
        </Flex>
      ) : isLoading ? (
        <AppLoader />
      ) : (
        <AppNoData />
      )}
      <AppRightDrawer
        heading="Filter"
        isOpen={isFilterOpen}
        onClose={onFilterClose}
      >
        <Flex direction={"column"} height={"full"} py={"3"}>
          <FormControl mb={"4"}>
            <FormLabel>Zone</FormLabel>
            <AppSelect
              isMulti
              onChange={(value) => {
                setSelectedZone(value);
                setSelectedState([]);
              }}
              value={selectedZone}
              options={
                costCenters?.length
                  ? Array.from(
                      new Set(costCenters.map((item) => item.costCentreZone)),
                    )
                      .filter((value) => value)
                      .sort((a, b) => a.localeCompare(b))
                      .map((value) => ({
                        label: value,
                        value,
                      }))
                  : []
              }
            />
          </FormControl>
          <FormControl mb={"4"}>
            <FormLabel>State</FormLabel>
            <AppSelect
              isMulti
              onChange={(value) => {
                setSelectedState(value);
                setSelectedCity([]);
              }}
              value={selectedState}
              options={
                costCenters?.length
                  ? Array.from(
                      new Set(
                        costCenters
                          .filter(({ costCentreZone }) =>
                            selectedZone.includes(costCentreZone),
                          )
                          .map((item) => item.state),
                      ),
                    )
                      .filter((value) => value)
                      .sort((a, b) => a.localeCompare(b))
                      .map((value) => ({
                        label: value,
                        value,
                      }))
                  : []
              }
            />
          </FormControl>
          <FormControl mb={"4"}>
            <FormLabel>City</FormLabel>
            <AppSelect
              isMulti
              onChange={(value) => setSelectedCity(value)}
              value={selectedCity}
              options={
                costCenters?.length
                  ? Array.from(
                      new Set(
                        costCenters
                          .filter(({ state }) => selectedState.includes(state))
                          .map((item) => item.city),
                      ),
                    )
                      .filter((value) => value)
                      .sort((a, b) => a.localeCompare(b))
                      .map((value) => ({
                        label: value,
                        value,
                      }))
                  : []
              }
            />
          </FormControl>
          <Flex mt={"auto"} direction={"column"}>
            <Button
              variant={"outline"}
              onClick={() => {
                setSelectedZone([]);
                setSelectedState([]);
                setSelectedCity([]);
                onFilterClose();
              }}
            >
              Reset
            </Button>
            <Button mt={"4"} onClick={onFilterClose}>
              Close
            </Button>
          </Flex>
        </Flex>
      </AppRightDrawer>
    </AppContainer>
  );
}

export default ViewCostCenters;
