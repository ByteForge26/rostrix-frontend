import React, { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import {
  IApiResponse,
  ICountryResponse,
  IHolidayResponse,
  IStateResponse,
} from "../../helper/Interface";
import { ENDPOINT } from "../../config/endpoint.config";
import {
  Button,
  Flex,
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
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useBoolean,
  useDisclosure,
} from "@chakra-ui/react";
import AppContainer from "../../components/AppContainer";
import moment from "moment";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { subDays } from "date-fns";
import { useToasts } from "react-toast-notifications";
import { FiFilter } from "react-icons/fi";
import AppRightDrawer from "../../components/AppRightDrawer";
import AppHeader from "../../components/AppHeader";
import AppFilterChips from "../../components/AppFilterChips";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSION } from "../../config/permission.config";
import AppSelect from "../../components/AppSelect";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import { formatDate } from "../../helper/Utils";

function ManageHolidays() {
  const { get, post } = useApi();
  const { addToast } = useToasts();
  const { checkForPermission } = usePermission();
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [years, setYears] = useState<string[]>([]);
  const [states, setStates] = useState<IStateResponse[]>([]);
  const [holidays, setHolidays] = useState<IHolidayResponse[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedState, setSelectedState] = useState(0);
  const [holidayName, setHolidayName] = useState("");
  const [holidayStateId, setHolidayStateId] = useState(0);
  const [holidayDate, setHolidayDate] = useState("");

  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    isOpen: isFilterOpen,
    onClose: onFilterClose,
    onOpen: onFilterOpen,
  } = useDisclosure();

  useEffect(() => {
    getYears();
    getCountries();
  }, []);
  const getYears = () => {
    const date = new Date();
    setYears([
      (date.getFullYear() - 1).toString(),
      date.getFullYear().toString(),
      (date.getFullYear() + 1).toString(),
    ]);
    setSelectedYear(date.getFullYear().toString());
  };
  const getCountries = async () => {
    onLoading();
    const res = await get<ICountryResponse[]>(ENDPOINT["/master"]["/country"]);
    offLoading();

    if (res?.length) {
      getAllStates(res[0].id);
    }
  };
  const getAllStates = async (selectedCountry: number) => {
    onLoading();
    const res = await get<IStateResponse[]>(
      ENDPOINT["/master"]["/state"] + `?countryId=${selectedCountry}`
    );
    offLoading();
    if (res?.length) {
      setStates(res);
      setSelectedState(res[0].id);
    } else {
      setStates([]);
      setSelectedState(0);
    }
  };

  useEffect(() => {
    if (selectedYear && selectedState) {
      getAllHoliday(selectedYear, selectedState);
    }
  }, [selectedYear, selectedState]);
  const getAllHoliday = async (selectedYear: string, selectedState: number) => {
    setHolidays([]);
    onLoading();
    const res = await get<IHolidayResponse[]>(
      ENDPOINT["/master"]["/holiday"] +
        `?stateId=${selectedState}&year=${selectedYear}`
    );
    offLoading();
    if (res?.length) {
      setHolidays(res);
    } else {
      setHolidays([]);
    }
  };

  const onCreateHoliday = () => {
    onOpen();
    setHolidayName("");
    setHolidayDate("");
    setHolidayStateId(selectedState);
  };

  const onSaveHoliday = () => {
    onClose();
    post<IApiResponse>(ENDPOINT["/master"]["/holiday"], {
      data: {
        name: holidayName,
        stateId: holidayStateId,
        date: holidayDate,
      },
    }).then((res) => {
      addToast(res.message, {
        appearance: res.success ? "success" : "error",
      });
      if (res.success) {
        setSelectedYear(new Date(holidayDate).getFullYear().toString());
        setSelectedState(holidayStateId);
        getAllHoliday(
          new Date(holidayDate).getFullYear().toString(),
          holidayStateId
        );
      }
    });
  };

  return (
    <AppContainer heading="Holidays" info="Add Holidays specific to state(s).">
      <AppHeader>
        <AppFilterChips
          onClick={onFilterOpen}
          filters={[
            selectedYear,
            states?.length
              ? states.find(({ id }) => id === selectedState)?.name
              : "",
          ]}
        />
        <Button
          variant={"outline"}
          leftIcon={<FiFilter />}
          onClick={onFilterOpen}
        >
          Filters
        </Button>
        {checkForPermission(PERMISSION.Config["Holidays"].Update) && (
          <Button ml={"4"} onClick={onCreateHoliday}>
            + Add Holiday
          </Button>
        )}
      </AppHeader>
      <Flex overflow={"auto"}>
        {holidays.length ? (
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
                    Date
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    Name
                  </Th>
                  {/* <Th background="#EBF3F8" color="#616161">
                    State
                  </Th> */}
                </Tr>
              </Thead>
              <Tbody fontSize={"sm"}>
                {holidays
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )
                  .map(({ date, name, stateId }, i) => (
                    <Tr key={stateId + "_" + i}>
                      <Td py={"3"}>{i + 1}</Td>
                      <Td py={"3"}>{formatDate(date)}</Td>
                      <Td py={"3"}>{name}</Td>
                      {/* <Td py={"3"}>
                        {states.find(({ id }) => id === stateId)?.name}
                      </Td> */}
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
          <ModalHeader>Add Holiday</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormControl mb={"4"} isRequired>
                <FormLabel>State</FormLabel>
                <AppSelect
                  value={holidayStateId}
                  onChange={(value) => setHolidayStateId(value)}
                  options={
                    states?.length
                      ? states
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(({ id, name }) => ({ label: name, value: id }))
                      : []
                  }
                />
              </FormControl>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter here"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
              />
            </FormControl>

            <FormControl mb={"4"} isRequired>
              <FormLabel>Date</FormLabel>
              <SingleDatepicker
                date={holidayDate ? new Date(holidayDate) : undefined}
                onDateChange={(date) =>
                  setHolidayDate(moment(date).format("YYYY-MM-DD"))
                }
                minDate={
                  new Date(`01-01-${selectedYear}`) > subDays(new Date(), 1)
                    ? new Date(`01-01-${selectedYear}`)
                    : subDays(new Date(), 1)
                }
                configs={{
                  dateFormat: "dd-MM-yyyy",
                }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" fontSize={"sm"} mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              isDisabled={!holidayName || !holidayStateId || !holidayDate}
              onClick={onSaveHoliday}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AppRightDrawer
        heading="Filter"
        isOpen={isFilterOpen}
        onClose={onFilterClose}
      >
        <Flex direction={"column"} height={"full"} py={"3"}>
          <FormControl mb={"4"}>
            <FormLabel>Year</FormLabel>
            <AppSelect
              value={selectedYear}
              onChange={(value) => setSelectedYear(value)}
              options={
                years?.length
                  ? years.map((year) => ({ label: year, value: year }))
                  : []
              }
            />
          </FormControl>
          <FormControl mb={"4"}>
            <FormLabel>State</FormLabel>
            <AppSelect
              value={selectedState}
              onChange={(value) => setSelectedState(value)}
              options={
                states?.length
                  ? states
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(({ name, id }) => ({ label: name, value: id }))
                  : []
              }
            />
          </FormControl>
          <Button mt={"auto"} onClick={onFilterClose}>
            Close
          </Button>
        </Flex>
      </AppRightDrawer>
    </AppContainer>
  );
}

export default ManageHolidays;
