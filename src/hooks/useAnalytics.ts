import { useEffect } from "react";
import { useService } from "./useService";
import { useAppDispatch, useAppSelector } from "../app/store/store";
import {
  setSelectedCities,
  setSelectedCostCenters,
  setSelectedZones,
  setTempFromDate,
  setTempToDate,
  setView,
} from "../app/slice/filter.slice";
import moment from "moment";
import { Option } from "react-multi-select-component";
import { IClusterResponse } from "../helper/Interface";
import { useDisclosure } from "@chakra-ui/react";

export const useAnalytics = (props: {
  VIEWS: {
    name: string;
    value: string;
  }[];
}) => {
  const { VIEWS } = props;
  const dispatch = useAppDispatch();
  const {
    isOpen: isFilterOpen,
    onClose: onFilterClose,
    onOpen: onFilterOpen,
  } = useDisclosure();
  const {
    isOpen: isDateRangeOpen,
    onClose: onDateRangeClose,
    onOpen: onDateRangeOpen,
  } = useDisclosure();
  const {
    tempFromDate,
    tempToDate,
    selectedCostCenters,
    view,
    selectedZones,
    selectedCities,
    selectedClusters,
    compareLastYear,
  } = useAppSelector((state) => state.filter);
  const { costCenters, getCostCenters, allCluster, getAllCluster, isLoading } =
    useService();

  useEffect(() => {
    getCostCenters();
    if (!view) dispatch(setView(VIEWS[0].value));
    const today = moment();
    if (!tempToDate)
      dispatch(setTempToDate(today.add({ day: -1 }).format("YYYY-MM-DD")));
    if (!tempFromDate)
      dispatch(setTempFromDate(today.add({ day: -7 }).format("YYYY-MM-DD")));
  }, []);

  useEffect(() => {
    if (selectedCostCenters && selectedCostCenters.length === 1) {
      getAllCluster(selectedCostCenters[0].value);
    }
  }, [selectedCostCenters]);

  useEffect(() => {
    if (costCenters && costCenters.length) {
      if (!selectedZones || !selectedZones.length)
        dispatch(setSelectedZones(getZoneOptions(true)));
    }
  }, [costCenters]);
  const getAnalyticsBody = (props: {
    tempFromDate: string;
    tempToDate: string;
    cityOptions: Option[];
    costCenterOptions: Option[];
    zoneOptions: Option[];
    clusterOptions: Option[];
  }) => {
    const {
      tempFromDate,
      tempToDate,
      cityOptions,
      costCenterOptions,
      zoneOptions,
      clusterOptions,
    } = props;
    return {
      fromDate: view !== VIEWS[1].value ? tempFromDate : undefined,
      toDate: view !== VIEWS[1].value ? tempToDate : undefined,
      referenceDate: view === VIEWS[0].value ? undefined : tempToDate,
      cityIds:
        selectedCities && selectedCities.length === cityOptions.length
          ? []
          : selectedCities.map(({ value }) => value),
      costCenters:
        selectedCostCenters &&
        selectedCostCenters.length === costCenterOptions.length
          ? []
          : selectedCostCenters.map(({ value }) => value),
      zones:
        selectedZones && selectedZones.length === zoneOptions.length
          ? []
          : selectedZones.map(({ value }) => value),
      clusterIds:
        selectedClusters && selectedClusters.length === clusterOptions.length
          ? []
          : selectedClusters?.map(({ value }) => value),
      compareLastYear,
    };
  };

  const getClusterOptions = (): Option[] => {
    const arr: Option[] = [];
    allCluster.forEach(({ id, name }) => {
      arr.push({
        label: name,
        value: id,
      });
    });
    return arr.sort((a, b) => a.label.localeCompare(b.label));
  };

  const getCostCenterOptions = (
    selectedZonesTemp?: Option[],
    selectedCitiesTemp?: Option[],
  ): Option[] => {
    const zones = selectedZonesTemp || selectedZones;
    const cities = selectedCitiesTemp || selectedCities;
    const arr: Option[] = [];
    costCenters
      .filter(({ disabled }) => !disabled)
      .filter(
        ({ costCentreZone, cityId }) =>
          (zones?.length
            ? zones.findIndex(({ value }) => value === costCentreZone) >= 0
            : true) &&
          (cities?.length
            ? cities.findIndex(({ value }) => value === cityId) >= 0
            : true),
      )
      .filter(({ costCentreName }) => costCentreName)
      .forEach(({ displayName, costCentreName }) => {
        arr.push({
          label: displayName || costCentreName,
          value: costCentreName,
        });
      });
    return arr.sort((a, b) => a.label.localeCompare(b.label));
  };

  const getCityOptions = (selectedZonesTemp?: Option[]): Option[] => {
    const zones = selectedZonesTemp || selectedZones;
    let obj: Record<string, number> = {};
    const arr: Option[] = [];
    costCenters
      .filter(({ costCentreZone }) =>
        zones?.length
          ? zones.findIndex(({ value }) => value === costCentreZone) >= 0
          : true,
      )
      .forEach((item) => {
        if (item.cityId) {
          obj[item.city] = item.cityId;
        }
      });
    Object.keys(obj).forEach((key) => {
      arr.push({
        label: key,
        value: obj[key],
      });
    });
    if (selectedZonesTemp) {
      dispatch(
        setSelectedCostCenters(getCostCenterOptions(selectedZonesTemp, arr)),
      );
    }
    return arr.sort((a, b) => a.label.localeCompare(b.label));
  };

  const getZoneOptions = (prefill?: boolean): Option[] => {
    const arr: Option[] = [];
    Array.from(new Set(costCenters.map((item) => item.costCentreZone)))
      .filter((value) => value)
      .forEach((value) => {
        arr.push({
          label: value,
          value,
        });
      });
    if (prefill) {
      dispatch(setSelectedCities(getCityOptions(arr)));
    }

    return arr.sort((a, b) => a.label.localeCompare(b.label));
  };

  return {
    costCenters,
    allCluster,
    getAllCluster,
    isLoading,
    getAnalyticsBody,
    getClusterOptions,
    getCostCenterOptions,
    getCityOptions,
    getZoneOptions,
    isFilterOpen,
    onFilterClose,
    onFilterOpen,
    isDateRangeOpen,
    onDateRangeClose,
    onDateRangeOpen,
  };
};
