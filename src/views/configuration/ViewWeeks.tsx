import React, { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import AppContainer from "../../components/AppContainer";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
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
import { ENDPOINT } from "../../config/endpoint.config";
import { IWeekResponse } from "../../helper/Interface";
import AppRightDrawer from "../../components/AppRightDrawer";
import AppHeader from "../../components/AppHeader";
import AppSelect from "../../components/AppSelect";
import AppNoData from "../../components/AppNoData";
import AppLoader from "../../components/AppLoader";
import { formatDate } from "../../helper/Utils";

function ViewWeeks() {
  const { get } = useApi();
  const [years, setYears] = useState<string[]>([]);
  const [weeks, setWeeks] = useState<IWeekResponse[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const {
    isOpen: isFilterOpen,
    onClose: onFilterClose,
    onOpen: onFilterOpen,
  } = useDisclosure();
  useEffect(() => {
    getYears();
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

  useEffect(() => {
    if (selectedYear) {
      getAllWeeks();
    }
  }, [selectedYear]);
  const getAllWeeks = async () => {
    onLoading();
    setWeeks([]);
    const res = await get<IWeekResponse[]>(
      ENDPOINT["/master"]["/week"] + `/${selectedYear}`
    );
    offLoading();
    if (res?.length) {
      setWeeks(res);
    }
  };

  return (
    <AppContainer
      heading="Weeks"
      info="Easily see the calendar weeks and their corresponding dates."
    >
      <AppHeader justifyContentLeft>
        <AppSelect
          onChange={(value) => setSelectedYear(value)}
          value={selectedYear}
          options={years.map((year) => ({ label: year, value: year }))}
        />
        {/* <AppFilterChips onClick={onFilterOpen} filters={[selectedYear]} />
        <Button
          variant={"outline"}
          leftIcon={<FiFilter />}
          onClick={onFilterOpen}
        >
          Filters
        </Button> */}
      </AppHeader>
      <Flex overflow={"auto"}>
        {weeks.length ? (
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
                    Week No.
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    Start Date
                  </Th>
                  <Th background="#EBF3F8" color="#616161">
                    End Date
                  </Th>
                </Tr>
              </Thead>
              <Tbody fontSize={"sm"}>
                {weeks.map(({ number, startDate, endDate }, i) => (
                  <Tr key={startDate}>
                    <Td py={"3"}>{number}</Td>
                    <Td py={"3"}>{formatDate(startDate)}</Td>
                    <Td py={"3"}>{formatDate(endDate)}</Td>
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
      <AppRightDrawer
        heading="Filter"
        isOpen={isFilterOpen}
        onClose={onFilterClose}
      >
        <Flex direction={"column"} height={"full"} py={"3"}>
          <FormControl mb={"4"}>
            <FormLabel>Year</FormLabel>
            <AppSelect
              onChange={(value) => setSelectedYear(value)}
              value={selectedYear}
              options={years.map((year) => ({ label: year, value: year }))}
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

export default ViewWeeks;
