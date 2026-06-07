import { useState } from "react";
import { ENDPOINT } from "../config/endpoint.config";
import {
  ICalender,
  IClusterResponse,
  ICostCenter,
  ICostCenterResponse,
  IPayrollConfig,
  IWeekResponse,
} from "../helper/Interface";
import { useApi } from "./useApi";
import { useBoolean } from "@chakra-ui/react";
import { FILTERS, MAX_WEEK_IN_MONTH } from "../helper/Constant";
import moment from "moment";
import { getFinalMonthListing } from "../helper/Utils";

export const useService = () => {
  const [payrollConfig, setPayrollConfig] = useState<IPayrollConfig>();
  const [weeks, setWeeks] = useState<IWeekResponse[]>([]);
  const [costCenters, setCostCenters] = useState<ICostCenter[]>([]);
  const [allCluster, setAllCluster] = useState<IClusterResponse[]>([]);
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const { get } = useApi();
  const [selectedFilter, setSelectedFilter] = useState<string>(
    FILTERS[0].value,
  );
  const [selectedYearMonth, setSelectedYearMonth] = useState("");
  const [yearMonthListing, setYearMonthListing] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [calender, setCalender] = useState<ICalender[]>([]);
  const [weeksInCurrentMonth, setWeeksInCurrentMonth] =
    useState(MAX_WEEK_IN_MONTH);
  const [customFromDate, setCustomFromDate] = useState(
    moment().startOf("month").format("YYYY-MM-DD"),
  );
  const [customToDate, setCustomToDate] = useState(
    moment().endOf("month").format("YYYY-MM-DD"),
  );

  const getPayrollConfig = async () => {
    const res = await get<IPayrollConfig>(
      ENDPOINT["/hours"]["/payroll-config"],
    );
    if (res.currentPStartDateTime) {
      setPayrollConfig(res);
    }
  };
  const getWeeks = async (currentYear: number) => {
    const res = await get<IWeekResponse[]>(
      ENDPOINT["/master"]["/week"] + `/${currentYear}`,
      undefined,
      true,
    );
    setWeeks(res);
  };
  const getCostCenters = async (props?: { allTypes?: boolean }) => {
    onLoading();
    const res = await get<ICostCenterResponse>(
      ENDPOINT["/master"]["/cost-centre"],
    );
    offLoading();
    if (res?.costCenters?.length) {
      setCostCenters(
        res.costCenters
          .filter(({ disabled }) => (props?.allTypes ? true : !disabled))
          .filter(({ type }) => (props?.allTypes ? true : type === "RETAIL")),
      );
    } else {
      setCostCenters([]);
    }
  };
  const getAllCluster = async (costCentre: string) => {
    onLoading();
    const res = await get<IClusterResponse[]>(
      ENDPOINT["/cluster"][""] + `?costCentre=${costCentre}`,
    );
    offLoading();
    if (res?.length) {
      setAllCluster(res.filter(({ editable }) => editable));
    } else {
      setAllCluster([]);
    }
  };
  const getMonthListing = () => {
    if (payrollConfig) {
      const { listing, selectedYearMonth } = getFinalMonthListing({
        sDate: payrollConfig.currentPStartDateTime,
        eDate: payrollConfig.currentPEndDateTime,
      });
      setYearMonthListing(listing);
      setSelectedYearMonth(selectedYearMonth);
    }
  };

  const onPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(11);
      return;
    }
    setCurrentMonth(currentMonth - 1);
  };
  const onNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(0);
      return;
    }
    setCurrentMonth(currentMonth + 1);
  };
  return {
    isLoading,
    onLoading,
    offLoading,
    payrollConfig,
    getPayrollConfig,
    weeks,
    getWeeks,
    costCenters,
    getCostCenters,
    allCluster,
    getAllCluster,
    selectedFilter,
    setSelectedFilter,
    currentMonth,
    currentYear,
    getMonthListing,
    customFromDate,
    customToDate,
    selectedYearMonth,
    setWeeksInCurrentMonth,
    setCalender,
    onPrevMonth,
    onNextMonth,
    calender,
    setCurrentMonth,
    setCurrentYear,
    setCustomFromDate,
    setCustomToDate,
    setSelectedYearMonth,
    yearMonthListing,
    weeksInCurrentMonth,
  };
};
