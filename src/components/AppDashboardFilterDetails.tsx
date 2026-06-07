import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { formatDate, renderPlaceholder } from "../helper/Utils";
import AppTabs from "./AppTabs";
import { DATA_VIEW_MODES } from "../helper/Constant";
import { Option } from "react-multi-select-component";
import { useAppSelector } from "../app/store/store";

function AppDashboardFilterDetails(props: {
  isFilterOpen: boolean;
  VIEWS: {
    name: string;
    value: string;
  }[];
  zoneOptions: Option[];
  cityOptions: Option[];
  costCenterOptions: Option[];
  clusterOptions: Option[];
  isAbsolute?: boolean;
  setIsAbsolute?: (value: React.SetStateAction<boolean>) => void;
}) {
  const {
    fromDate,
    toDate,
    view,
    selectedCities,
    selectedClusters,
    selectedCostCenters,
    selectedZones,
  } = useAppSelector((state) => state.filter);
  const {
    isFilterOpen,
    VIEWS,
    zoneOptions,
    cityOptions,
    costCenterOptions,
    clusterOptions,
    isAbsolute,
    setIsAbsolute,
  } = props;
  return (
    <>
      {fromDate && !isFilterOpen ? (
        <Flex
          mb={"2"}
          justifyContent={"space-between"}
          alignItems={"center"}
          minH={"12"}
        >
          <Flex>
            {[
              {
                label: view === VIEWS[1].value ? "Reference Date" : "Duration",
                value:
                  view === VIEWS[1].value
                    ? `${formatDate(toDate)}`
                    : `${formatDate(fromDate)} to ${formatDate(toDate)}`,
                isActive: true,
              },
              {
                label: "Zone",
                value:
                  selectedZones?.length === zoneOptions.length
                    ? "All"
                    : renderPlaceholder(selectedZones),
                isActive: selectedZones && selectedZones.length,
              },
              {
                label: "City",
                value:
                  selectedCities?.length === cityOptions.length
                    ? "All"
                    : renderPlaceholder(selectedCities),
                isActive: selectedCities && selectedCities.length,
              },
              {
                label: "Store",
                value:
                  selectedCostCenters?.length === costCenterOptions.length
                    ? "All"
                    : renderPlaceholder(selectedCostCenters),
                isActive: selectedCostCenters && selectedCostCenters.length,
              },
              {
                label: "Cluster",
                value:
                  selectedClusters?.length === clusterOptions.length
                    ? "All"
                    : renderPlaceholder(selectedClusters),
                isActive: selectedClusters && selectedClusters.length,
              },
            ]
              .filter(({ isActive }) => isActive)
              .map(({ label, value }, i) => (
                <Flex key={i} background={"white"} padding={"2px 8px"} mr={"2"}>
                  <Text fontWeight={"medium"} color={"#615E83"}>
                    {`${label}:`}
                  </Text>
                  <Text ml={"1"} color={"#615E83"}>
                    {value}
                  </Text>
                </Flex>
              ))}
          </Flex>
          {isAbsolute === undefined ? null : (
            <Flex alignItems={"center"}>
              <AppTabs
                value={DATA_VIEW_MODES[isAbsolute ? 1 : 0].value}
                setValue={(value) => {
                  if (setIsAbsolute)
                    setIsAbsolute(value !== DATA_VIEW_MODES[0].value);
                }}
                tabs={DATA_VIEW_MODES}
                mb="2"
              ></AppTabs>
            </Flex>
          )}
        </Flex>
      ) : null}
    </>
  );
}

export default AppDashboardFilterDetails;
