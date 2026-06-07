import React, { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { Button, Flex, useBoolean } from "@chakra-ui/react";
import { useAppSelector } from "../../app/store/store";
import { ENDPOINT } from "../../config/endpoint.config";
import { IPayrollConfig } from "../../helper/Interface";
import { addMonths } from "date-fns";
import moment from "moment";
import { MONTHS_SHORT } from "../../helper/Constant";
import AppContainer from "../../components/AppContainer";
import AppHeader from "../../components/AppHeader";
import AppSelect from "../../components/AppSelect";
import AppLoader from "../../components/AppLoader";
import { EXTRACT } from "../../helper/Images";
import {
  downloadCSV,
  formatDate,
  generateMonthsListing,
  getFinalMonthListing,
  timerUI,
} from "../../helper/Utils";
import { isAxiosError } from "axios";
import AppNoData from "../../components/AppNoData";
import { useService } from "../../hooks/useService";

function ExtractPayroll() {
  const { get } = useApi();
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(false);
  const { user, selectedCostCenterName } = useAppSelector(
    (state) => state.auth,
  );
  const [showTimer, setShowTimer] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [selectedYearMonth, setSelectedYearMonth] = useState("");
  const [yearMonthListing, setYearMonthListing] = useState<
    { label: string; value: string; isDisabled?: boolean }[]
  >([]);
  const { getPayrollConfig, payrollConfig } = useService();
  const [globalStatus, setGlobalStatus] = useState<
    "NA" | "PAST" | "CURRENT" | "FUTURE"
  >("NA");
  useEffect(() => {
    getPayrollConfig();
  }, []);

  useEffect(() => {
    if (payrollConfig) {
      getMonthListing();
    }
  }, [payrollConfig]);
  useEffect(() => {
    if (selectedYearMonth) {
      checkForTimer();
    }
  }, [selectedYearMonth, timeRemaining]);
  const checkForTimer = () => {
    if (payrollConfig) {
      const today = moment();
      const selectedStartDate = moment()
        .set("year", Number(selectedYearMonth.split("_")[0]))
        .set("month", Number(selectedYearMonth.split("_")[1]))
        .set("D", moment(payrollConfig.currentPStartDateTime).get("D"))
        .subtract(1, "M")
        .set({
          h: 0,
          m: 0,
          s: 0,
        });
      const selectedEndDate = moment()
        .set("year", Number(selectedYearMonth.split("_")[0]))
        .set("month", Number(selectedYearMonth.split("_")[1]))
        .set("D", moment(payrollConfig.currentPEndDateTime).get("D"))
        .add(1, "d")
        .set({
          h: 0,
          m: 0,
          s: 0,
        });

      const currentPayrollExtractStartTime = moment(
        payrollConfig.currentPayrollExtractStartTime,
      );

      if (today.unix() >= selectedStartDate.unix()) {
        if (today.unix() <= selectedEndDate.unix()) {
          setGlobalStatus("FUTURE");
          if (
            today.year() == currentPayrollExtractStartTime.year() &&
            today.month() === currentPayrollExtractStartTime.month() &&
            today.get("D") === currentPayrollExtractStartTime.get("D")
          ) {
            if (today.unix() < currentPayrollExtractStartTime.unix()) {
              setShowTimer(true);
            } else {
              setGlobalStatus("PAST");
            }
          }
        } else {
          setGlobalStatus("PAST");
        }
      } else {
        setGlobalStatus("PAST");
      }
    }
  };
  useEffect(() => {
    if (showTimer && payrollConfig) {
      const calculateTimeRemaining = () => {
        const now = new Date().getTime();
        const difference =
          new Date(payrollConfig.currentPayrollExtractStartTime).getTime() -
          now;
        setTimeRemaining(difference);
      };

      calculateTimeRemaining();

      const timerId = setInterval(() => {
        calculateTimeRemaining();
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [showTimer, payrollConfig]);

  const getMonthListing = () => {
    if (payrollConfig) {
      const { listing, selectedYearMonth } = getFinalMonthListing({
        sDate: payrollConfig.currentPStartDateTime,
        eDate: payrollConfig.currentPEndDateTime,
        disabledAfter: payrollConfig.currentPayrollExtractStartTime,
      });
      setYearMonthListing(listing);
      setSelectedYearMonth(selectedYearMonth);
    }
  };
  const onExtractPayroll = async () => {
    if (payrollConfig) {
      const date = moment()
        .set("year", Number(selectedYearMonth.split("_")[0]))
        .set("month", Number(selectedYearMonth.split("_")[1]))
        .set("D", moment(payrollConfig.currentPEndDateTime).get("D"))
        .format("YYYY-MM-DD");
      onLoading();
      const res = await get<any>(
        ENDPOINT["/hours"]["/payroll-data"] + `/${date}`,
      );
      offLoading();
      if (res && !isAxiosError(res)) {
        downloadCSV({ res, name: `Payroll_${date}` });
      }
    }
  };

  return (
    <AppContainer heading="Extract Payroll" info="">
      <AppHeader justifyContentLeft>
        <AppSelect
          value={selectedYearMonth}
          onChange={(value) => setSelectedYearMonth(value)}
          options={
            yearMonthListing?.length
              ? yearMonthListing
                  .sort((a, b) => b.value.localeCompare(a.value))
                  .map(({ label, value, isDisabled }) => ({
                    label,
                    value,
                    isDisabled,
                  }))
              : []
          }
        />
      </AppHeader>
      {globalStatus === "FUTURE" && payrollConfig ? (
        <AppNoData
          hideImage={true}
          msg={
            showTimer && timeRemaining > 0
              ? `Payroll Extraction for selected dates will open in </br>${timerUI(
                  timeRemaining,
                )}`
              : `Payroll Extraction for selected dates will be available after </br><strong>${formatDate(
                  payrollConfig.currentPayrollExtractStartTime,
                  { time: true },
                )}</strong>`
          }
        />
      ) : (
        <>
          {isLoading ? (
            <AppLoader />
          ) : (
            <Flex
              minH={"60vh"}
              justifyContent={"center"}
              alignItems={"center"}
              direction={"column"}
            >
              <img src={EXTRACT} alt="" width={160} />
              <Flex mt={"4"}>
                <Button
                  isDisabled={!selectedYearMonth || isLoading}
                  onClick={() => onExtractPayroll()}
                >
                  Extract Payroll Data
                </Button>
              </Flex>
            </Flex>
          )}
        </>
      )}
    </AppContainer>
  );
}

export default ExtractPayroll;
