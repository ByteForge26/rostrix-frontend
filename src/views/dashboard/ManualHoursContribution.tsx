import { Button, Flex } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { FiFilter } from "react-icons/fi";
import { setView } from "../../app/slice/filter.slice";
import { useAppDispatch, useAppSelector } from "../../app/store/store";
import AppBarChart from "../../components/AppBarChart";
import AppContainer from "../../components/AppContainer";
import AppDashboardCards from "../../components/AppDashboardCards";
import AppDashboardFilter from "../../components/AppDashboardFilter";
import AppDashboardFilterDetails from "../../components/AppDashboardFilterDetails";
// AppDashboardFilterDetails
import AppHeader from "../../components/AppHeader";
import AppLineChart from "../../components/AppLineChart";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import AppTabs from "../../components/AppTabs";
import { ENDPOINT } from "../../config/endpoint.config";
import { VIEWS } from "../../helper/Constant";
import {
  analyticsNoDataFound,
  noDashboardDataImage,
} from "../../helper/Images";
import {
  IAnalyticsMHContributionData,
  IAnalyticsMHContributionDistData,
  IAnalyticsMHContributionMOMData,
} from "../../helper/Interface";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useApi } from "../../hooks/useApi";

function ManualHoursContribution() {
  const { get, post } = useApi();
  const dispatch = useAppDispatch();
  const {
    fromDate,
    tempFromDate: tempFromDateMH,
    tempToDate,
    toDate: toDateMH,
    view,
  } = useAppSelector((state) => state.filter);
  const {
    isLoading: isLoadingMH,
    getCityOptions,
    getClusterOptions,
    getCostCenterOptions,
    getZoneOptions,
    getAnalyticsBody,
    isFilterOpen,
    onFilterClose,
    onFilterOpen,
    isDateRangeOpen: isDateRangeOpenMH,
    onDateRangeClose,
    onDateRangeOpen: onDateRangeOpenMH,
  } = useAnalytics({
    VIEWS,
  });

  const [analyticsMHContributionData, setAnalyticsMHContributionData] =
    useState<IAnalyticsMHContributionData>();
  const [analyticsMHContributionDistData, setAnalyticsMHContributionDistData] =
    useState<IAnalyticsMHContributionDistData>();
  const [analyticsMHContributionMOMData, setAnalyticsMHContributionMOMData] =
    useState<IAnalyticsMHContributionMOMData[]>();

  const getData = () => {
    if (view === VIEWS[0].value) {
      getAnalyticsMHContributionData();
      getAnalyticsMHContributionDistData();
    } else {
      getAnalyticsMHContributionMOMData();
    }
  };

  const getBodyMH = () => {
    return getAnalyticsBody({
      tempFromDate: tempFromDateMH,
      tempToDate,
      cityOptions: getCityOptions(),
      costCenterOptions: getCostCenterOptions(),
      zoneOptions: getZoneOptions(),
      clusterOptions: getClusterOptions(),
    });
  };
  const getAnalyticsMHContributionData = async () => {
    const res = await post<IAnalyticsMHContributionData>(
      ENDPOINT["/analytics"]["/manual-hr-contribution"],
      {
        data: getBodyMH(),
      },
    );
    setAnalyticsMHContributionData(res);
  };
  const getAnalyticsMHContributionDistData = async () => {
    const res = await post<IAnalyticsMHContributionDistData>(
      ENDPOINT["/analytics"]["/manual-hr-contrib-dist"],
      {
        data: getBodyMH(),
      },
    );
    setAnalyticsMHContributionDistData(res);
  };

  useEffect(() => {
    if (view && fromDate && toDateMH) {
      getData();
    }
  }, [view]);

  const getAnalyticsMHContributionMOMData = async () => {
    const res = await post<IAnalyticsMHContributionMOMData[]>(
      ENDPOINT["/analytics"]["/manual-hr-contrib-mom"],
      {
        data: getBodyMH(),
      },
    );
    setAnalyticsMHContributionMOMData(res);
  };

  return (
    <AppContainer
      heading="Manual Hours Contribution"
      info=""
      bgColored={
        (analyticsMHContributionData && analyticsMHContributionDistData) ||
        analyticsMHContributionMOMData
          ? true
          : false
      }
    >
      <AppHeader justifyContentLeft></AppHeader>
      <AppTabs
        value={view}
        setValue={(value) => dispatch(setView(value))}
        tabs={VIEWS}
      >
        <Button
          variant={"outline"}
          leftIcon={<FiFilter />}
          onClick={onFilterOpen}
        >
          Filters
        </Button>
      </AppTabs>
      <AppDashboardFilterDetails
        VIEWS={VIEWS}
        cityOptions={getCityOptions()}
        clusterOptions={getClusterOptions()}
        costCenterOptions={getCostCenterOptions()}
        isFilterOpen={isFilterOpen}
        zoneOptions={getZoneOptions()}
      />
      {fromDate && toDateMH ? (
        <>
          {view === VIEWS[0].value ? (
            <>
              {analyticsMHContributionData ||
              analyticsMHContributionDistData?.byStore?.length ||
              analyticsMHContributionDistData?.byCluster?.length ? (
                <Flex direction={"column"}>
                  <Flex
                    overflow={"auto"}
                    p={"2"}
                    mb={"4"}
                    width={"full"}
                    direction={"column"}
                  >
                    {analyticsMHContributionData ? (
                      <AppDashboardCards
                        data={[
                          {
                            child: [
                              {
                                title: "Rostered Hours",
                                info: "",
                                value: Number(
                                  analyticsMHContributionData.rosteredHours ||
                                    0,
                                ).toString(),
                              },
                            ],
                          },
                          {
                            child: [
                              {
                                title: "Manual Hour (in %)",
                                info: "",
                                value: `${Number(
                                  analyticsMHContributionData.manualHourContribPercentage ||
                                    0,
                                )}%`,
                              },
                            ],
                          },
                          {
                            child: [
                              {
                                title: "Total Hours",
                                info: "",
                                value: Number(
                                  analyticsMHContributionData.totalHours || 0,
                                ).toString(),
                              },
                            ],
                          },
                          {
                            child: [
                              {
                                title: "Manual Hours",
                                info: "",
                                value: Number(
                                  analyticsMHContributionData.manualHours || 0,
                                ).toString(),
                              },
                            ],
                          },
                        ]}
                      />
                    ) : null}
                    {analyticsMHContributionDistData?.byStore?.length ||
                    analyticsMHContributionDistData?.byCluster?.length ? (
                      <>
                        {analyticsMHContributionDistData?.byStore?.length ? (
                          <AppBarChart
                            res={analyticsMHContributionDistData.byStore.map(
                              ({ key, manualHourContribPercentage }) => ({
                                key,
                                data: [
                                  {
                                    key: "manualHourContribPercentage",
                                    value: manualHourContribPercentage,
                                  },
                                ],
                              }),
                            )}
                            heading={"By Store :"}
                            legend={[
                              {
                                color: "#FDB833",
                                key: "manualHourContribPercentage",
                                label: "Manual Hours Percentage",
                              },
                            ]}
                            sort
                            absolute
                            width="auto"
                          />
                        ) : null}
                        {analyticsMHContributionDistData?.byCluster?.length ? (
                          <AppBarChart
                            res={analyticsMHContributionDistData.byCluster.map(
                              ({ key, manualHourContribPercentage }) => ({
                                key,
                                data: [
                                  {
                                    key: "manualHourContribPercentage",
                                    value: manualHourContribPercentage,
                                  },
                                ],
                              }),
                            )}
                            heading={"By Cluster :"}
                            legend={[
                              {
                                color: "#FDB833",
                                key: "manualHourContribPercentage",
                                label: "Manual Hours Percentage",
                              },
                            ]}
                            sort
                            width="50%"
                            absolute
                          />
                        ) : null}
                      </>
                    ) : null}
                  </Flex>
                </Flex>
              ) : (
                <AppNoData
                  image={analyticsNoDataFound}
                  msg="Oops!... No result found, please try using a different filter"
                />
              )}
            </>
          ) : (
            <>
              {analyticsMHContributionMOMData?.length ? (
                <Flex width={"full"}>
                  <Flex width={"full"} px={"2"} py={"1"} direction={"column"}>
                    {analyticsMHContributionMOMData?.length ? (
                      <Flex mt={"1"} mb={"5"} width={"full"}>
                        <AppLineChart
                          res={analyticsMHContributionMOMData.map(
                            ({ key, pmonth, manualHourContribPercentage }) => ({
                              key,
                              data: [
                                {
                                  key: "manualHourContribPercentage",
                                  value: manualHourContribPercentage,
                                },
                              ],
                              startDate: pmonth,
                            }),
                          )}
                          heading="Month on Month"
                          legend={[
                            {
                              color: "#FDB833",
                              key: "manualHourContribPercentage",
                              label: "Manual Hours Percentage",
                            },
                          ]}
                          absolute
                        />
                      </Flex>
                    ) : null}
                  </Flex>
                </Flex>
              ) : (
                <AppNoData
                  image={analyticsNoDataFound}
                  msg="Oops!... No result found, please try using a different filter"
                />
              )}
            </>
          )}
        </>
      ) : isLoadingMH ? (
        <AppLoader />
      ) : (
        <AppNoData
          msg="Kickstart the analytics engine with some filters! Choose your flavor and make data dance to your tune!"
          image={noDashboardDataImage}
          // Kickstart MHH
        />
      )}
      <AppDashboardFilter
        VIEWS={VIEWS}
        cityOptions={getCityOptions()}
        clusterOptions={getClusterOptions()}
        costCenterOptions={getCostCenterOptions()}
        zoneOptions={getZoneOptions()}
        isDateRangeOpen={isDateRangeOpenMH}
        isFilterOpen={isFilterOpen}
        onApply={getData}
        onDateRangeClose={onDateRangeClose}
        onDateRangeOpen={onDateRangeOpenMH}
        onFilterClose={onFilterClose}
      />
    </AppContainer>
  );
}

export default ManualHoursContribution;
