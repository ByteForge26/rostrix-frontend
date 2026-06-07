import React from "react";
import AppRightDrawer from "./AppRightDrawer";
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
  Switch,
} from "@chakra-ui/react";
import { MultiSelect, Option } from "react-multi-select-component";
import { useAppDispatch, useAppSelector } from "../app/store/store";
import {
  setCompareLastYear,
  setFromDate,
  setSelectedCities,
  setSelectedClusters,
  setSelectedCostCenters,
  setSelectedZones,
  setTempFromDate,
  setTempToDate,
  setToDate,
} from "../app/slice/filter.slice";
import { renderPlaceholder } from "../helper/Utils";
import moment from "moment";
import { DateRangePicker } from "react-date-range";
import { SingleDatepicker } from "chakra-dayzed-datepicker";

const defaultMessage = "Select or type here...";
function AppDashboardFilter(props: {
  isFilterOpen: boolean;
  onFilterClose: () => void;
  zoneOptions: Option[];
  cityOptions: Option[];
  costCenterOptions: Option[];
  clusterOptions: Option[];
  VIEWS: {
    name: string;
    value: string;
  }[];
  onDateRangeOpen: () => void;
  onApply: () => void;
  isDateRangeOpen: boolean;
  onDateRangeClose: () => void;
}) {
  const {
    isFilterOpen,
    onFilterClose,
    zoneOptions,
    cityOptions,
    costCenterOptions,
    clusterOptions,
    VIEWS,
    onDateRangeOpen,
    onApply,
    isDateRangeOpen,
    onDateRangeClose,
  } = props;
  const {
    compareLastYear,
    selectedCities,
    selectedClusters,
    selectedCostCenters,
    selectedZones,
    tempFromDate,
    tempToDate,
    view,
  } = useAppSelector((state) => state.filter);
  const dispatch = useAppDispatch();
  return (
    <AppRightDrawer
      isOpen={isFilterOpen}
      heading="Filter"
      onClose={() => onFilterClose()}
    >
      <Flex direction={"column"} height={"full"} py={"3"}>
        <FormControl mb={"4"}>
          <FormLabel>Zone</FormLabel>
          <MultiSelect
            options={zoneOptions}
            value={selectedZones}
            onChange={(value: Option[]) => {
              dispatch(setSelectedZones(value));
              dispatch(setSelectedCities([]));
              dispatch(setSelectedCostCenters([]));
              dispatch(setSelectedClusters([]));
            }}
            labelledBy="Select Zone"
            valueRenderer={(selected) => {
              return selected?.length
                ? selected.length === zoneOptions.length
                  ? "Zone (All)"
                  : renderPlaceholder(selected)
                : defaultMessage;
            }}
          />
        </FormControl>

        <FormControl mb={"4"}>
          <FormLabel>City</FormLabel>
          <MultiSelect
            options={cityOptions}
            value={selectedCities}
            onChange={(value: Option[]) => {
              dispatch(setSelectedCities(value));
              dispatch(setSelectedCostCenters([]));
              dispatch(setSelectedClusters([]));
            }}
            labelledBy="Select City"
            valueRenderer={(selected) => {
              return selected?.length
                ? selected.length === cityOptions.length
                  ? "City (All)"
                  : renderPlaceholder(selected)
                : defaultMessage;
            }}
          />
        </FormControl>
        <FormControl mb={"4"}>
          <FormLabel>Store</FormLabel>
          <MultiSelect
            options={costCenterOptions}
            value={selectedCostCenters}
            onChange={(value: Option[]) => {
              dispatch(setSelectedCostCenters(value));
              dispatch(setSelectedClusters([]));
            }}
            labelledBy="Select Store"
            valueRenderer={(selected) => {
              return selected?.length
                ? selected.length === costCenterOptions.length
                  ? "Store (All)"
                  : renderPlaceholder(selected)
                : defaultMessage;
            }}
          />
        </FormControl>
        {selectedCostCenters?.length === 1 ? (
          <FormControl mb={"4"}>
            <FormLabel>Cluster</FormLabel>
            <MultiSelect
              options={clusterOptions}
              value={selectedClusters}
              onChange={(value: Option[]) => {
                dispatch(setSelectedClusters(value));
              }}
              labelledBy="Select Cluster"
              valueRenderer={(selected) => {
                return selected?.length
                  ? selected.length === clusterOptions.length
                    ? "Cluster (All)"
                    : renderPlaceholder(selected)
                  : defaultMessage;
              }}
            />
          </FormControl>
        ) : null}
        {view === VIEWS[1].value ? null : (
          <FormControl mb={"4"}>
            <FormLabel>From Date</FormLabel>
            <Input
              value={moment(new Date(tempFromDate)).format("DD-MM-YYYY")}
              onClick={onDateRangeOpen}
              readOnly
            />
          </FormControl>
        )}

        <FormControl mb={"4"}>
          <FormLabel>
            {view === VIEWS[1].value ? "Reference Date" : "To Date"}
          </FormLabel>
          <Input
            value={moment(new Date(tempToDate)).format("DD-MM-YYYY")}
            onClick={onDateRangeOpen}
            readOnly
          />
        </FormControl>
        {view === VIEWS[1].value ? (
          <FormControl
            display="flex"
            justifyContent={"space-between"}
            alignItems="center"
            mb={"4"}
          >
            <FormLabel htmlFor="compareLastYear" mb="0">
              Compare With Last Year
            </FormLabel>
            <Switch
              colorScheme="brand"
              id="compareLastYear"
              isChecked={compareLastYear}
              onChange={(e) => dispatch(setCompareLastYear(e.target.checked))}
            />
          </FormControl>
        ) : null}
        <Flex mt={"auto"} direction={"column"}>
          <Button
            onClick={() => {
              onFilterClose();
              onApply();
              dispatch(setFromDate(tempFromDate));
              dispatch(setToDate(tempToDate));
            }}
          >
            Apply
          </Button>
        </Flex>
      </Flex>
      <Modal
        isOpen={isDateRangeOpen}
        onClose={onDateRangeClose}
        size={view === VIEWS[1].value ? "xl" : "6xl"}
        scrollBehavior={"outside"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {view === VIEWS[1].value
              ? "Select Reference Date"
              : "Select Date Range"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display={"flex"}
            justifyContent={"center"}
            minHeight={"330px"}
          >
            {view === VIEWS[1].value ? (
              <SingleDatepicker
                date={moment(tempToDate).toDate()}
                onDateChange={(date) =>
                  dispatch(setTempToDate(moment(date).format("YYYY-MM-DD")))
                }
                configs={{
                  dateFormat: "dd-MM-yyyy",
                }}
                defaultIsOpen
                closeOnSelect
              />
            ) : (
              <DateRangePicker
                ranges={[
                  {
                    startDate: moment(tempFromDate).toDate(),
                    endDate: moment(tempToDate).toDate(),
                    key: "selection",
                  },
                ]}
                onChange={(r) => {
                  if (r["selection"].startDate) {
                    dispatch(
                      setTempFromDate(
                        moment(r["selection"].startDate).format("YYYY-MM-DD"),
                      ),
                    );
                  }
                  if (r["selection"].endDate) {
                    dispatch(
                      setTempToDate(
                        moment(r["selection"].endDate).format("YYYY-MM-DD"),
                      ),
                    );
                  }
                }}
                months={2}
                direction={"horizontal"}
                dateDisplayFormat={"dd MMM yyyy"}
                rangeColors={["#027DBC"]}
              />
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="gray"
              variant={"ghost"}
              mr={3}
              onClick={onDateRangeClose}
              fontSize={"sm"}
            >
              Close
            </Button>

            <Button
              variant="solid"
              fontSize={"sm"}
              aria-label="model-apply"
              onClick={onDateRangeClose}
            >
              Apply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppRightDrawer>
  );
}

export default AppDashboardFilter;
