import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import moment from "moment";
import { useEffect, useState } from "react";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { FiDownload, FiFilter } from "react-icons/fi";
import { setView } from "../../app/slice/filter.slice";
import { useAppDispatch, useAppSelector } from "../../app/store/store";
import AppBarChart from "../../components/AppBarChart";
import AppContainer from "../../components/AppContainer";
import AppDashboardCards from "../../components/AppDashboardCards";
import AppDashboardFilter from "../../components/AppDashboardFilter";
import AppDashboardFilterDetails from "../../components/AppDashboardFilterDetails";
import AppHeader from "../../components/AppHeader";
import AppLineChart from "../../components/AppLineChart";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import AppTabs from "../../components/AppTabs";
import { ENDPOINT } from "../../config/endpoint.config";
import { AFFINITY_LEGENDS, GRAPH_COLORS, VIEWS } from "../../helper/Constant";
import {
  analyticsNoDataFound,
  noDashboardDataImage,
} from "../../helper/Images";
import {
  IAffinityRateTotal,
  IAnalyticsCategoryData,
  IAnalyticsCellKeyValue,
  IAnalyticsGrowthData,
} from "../../helper/Interface";
import { currencyConverter, downloadCSV } from "../../helper/Utils";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useApi } from "../../hooks/useApi";

function AffinityRate() {
  const { get, post } = useApi();
  const dispatch = useAppDispatch();
  const {
    tempToDate,
    // tempToDate
    compareLastYear,
    fromDate,

    tempFromDate,

    toDate,
    view,
  } = useAppSelector((state) => state.filter);

  const {
    onFilterClose,
    //   onFilterClose,
    isLoading,
    getCityOptions,

    onDateRangeClose,
    onDateRangeOpen,
    getCostCenterOptions,
    getZoneOptions,
    getAnalyticsBody,
    getClusterOptions,
    isFilterOpen: isAffFilterOpen,

    onFilterOpen: onAffFilterOpen,
    isDateRangeOpen: isAffDateRangeOpen,
  } = useAnalytics({
    VIEWS,
  });
  const [affinityRateTotal, setAffinityRateTotal] =
    useState<IAffinityRateTotal>();
  const [affinityRateHrsDistWork, setAffinityRateHrsDistWork] =
    useState<IAnalyticsCategoryData>();

  const [affinityRateHrsDistWOW, setAffinityRateHrsDistWOW] =
    useState<IAnalyticsGrowthData>();
  const [affinityRateHrsDistMOM, setAffinityRateHrsDistMOM] =
    useState<IAnalyticsGrowthData>();
  const [affinityRateHrsDistQOQ, setAffinityRateHrsDistQOQ] =
    useState<IAnalyticsGrowthData>();

  const getAffData = () => {
    if (view === VIEWS[0].value) {
      getAffMetricsData();
    } else {
      getAffGrowthData();
    }
  };

  const getBody = () => {
    return getAnalyticsBody({
      tempFromDate,
      tempToDate,
      cityOptions: getCityOptions(),
      costCenterOptions: getCostCenterOptions(),
      zoneOptions: getZoneOptions(),
      clusterOptions: getClusterOptions(),
    });
  };
  const getAffinityRateTotalData = async () => {
    const res = await post<IAffinityRateTotal>(
      ENDPOINT["/analytics"]["/affinity-hrs-total"],
      {
        data: getBody(),
      },
    );
    setAffinityRateTotal(res);
  };
  const getAffinityRateHrsDistWorkData = async () => {
    const res = await post<IAnalyticsCategoryData>(
      ENDPOINT["/analytics"]["/affinity-hrs-dist-work"],
      {
        data: getBody(),
      },
    );
    setAffinityRateHrsDistWork(res);
  };

  useEffect(() => {
    if (view && fromDate && toDate) {
      getAffData();
    }
  }, [view]);
  const getAffMetricsData = () => {
    getAffinityRateTotalData();
    getAffinityRateHrsDistWorkData();
  };
  const getAffGrowthData = () => {
    getAffinityRateHrsDistWOWData();
    getAffinityRateHrsDistMOMData();
    getAffinityRateHrsDistQOQData();
  };

  const getAffinityRateHrsDistWOWData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/affinity-hrs-dist-wow"],
      {
        data: getBody(),
      },
    );
    setAffinityRateHrsDistWOW(res);
  };
  const getAffinityRateHrsDistMOMData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/affinity-hrs-dist-mom"],
      {
        data: getBody(),
      },
    );
    setAffinityRateHrsDistMOM(res);
  };
  const getAffinityRateHrsDistQOQData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/affinity-hrs-dist-qoq"],
      {
        data: getBody(),
      },
    );
    setAffinityRateHrsDistQOQ(res);
  };

  const onDownload = () => {
    let dataAff: {
      key: string;
      values: {
        key: string;
        value: string;
      }[];
      absolute?: boolean;
    }[] = [];
    let arr: {
      heading: string;
      data: {
        key: string;
        values: {
          key: string;
          value: string;
        }[];
        absolute?: boolean;
      }[];
    }[] = [];
    if (view === VIEWS[0].value) {
      dataAff = [];
      dataAff.push({
        key: "Total",
        values: [
          {
            key: "Affinity Rate",
            value: `${Number(
              Number(affinityRateTotal?.affinityRate || 0).toFixed(2),
            )}%`,
          },
          {
            key: "Total Commercial Hours",
            value: Number(
              Number(affinityRateTotal?.totalHours || 0).toFixed(2),
            ).toString(),
          },
          {
            key: "Total TO",
            value: `${Number(
              Number(affinityRateTotal?.totalTurnover || 0).toFixed(2),
            )}`,
          },
        ],
        absolute: true,
      });
      arr.push({
        heading: "Total Hours",
        data: [...dataAff],
      });

      if (
        affinityRateHrsDistWork &&
        affinityRateHrsDistWork.byZone &&
        affinityRateHrsDistWork.byZone.length
      ) {
        dataAff = convertAffDataWithCategory(affinityRateHrsDistWork.byZone);
        arr.push({
          heading: "By Zone",
          data: [...dataAff],
        });
      }
      if (
        affinityRateHrsDistWork &&
        affinityRateHrsDistWork.byCity &&
        affinityRateHrsDistWork.byCity.length
      ) {
        dataAff = convertAffDataWithCategory(affinityRateHrsDistWork.byCity);
        arr.push({
          heading: "By City",
          data: [...dataAff],
        });
      }
      if (
        affinityRateHrsDistWork &&
        affinityRateHrsDistWork.byStore &&
        affinityRateHrsDistWork.byStore.length
      ) {
        dataAff = convertAffDataWithCategory(affinityRateHrsDistWork.byStore);
        arr.push({
          heading: "By Store",
          data: [...dataAff],
        });
      }
      if (
        affinityRateHrsDistWork &&
        affinityRateHrsDistWork.byCluster &&
        affinityRateHrsDistWork.byCluster.length
      ) {
        dataAff = convertAffDataWithCategory(affinityRateHrsDistWork.byCluster);
        arr.push({
          heading: "By Cluster",
          data: [...dataAff],
        });
      }
    } else {
      if (
        affinityRateHrsDistWOW &&
        affinityRateHrsDistWOW.data &&
        affinityRateHrsDistWOW.data.length
      ) {
        dataAff = convertAffGrowthData(affinityRateHrsDistWOW);
        arr.push({
          heading: "Week on Week",
          data: [...dataAff],
        });
      }
      if (
        affinityRateHrsDistMOM &&
        affinityRateHrsDistMOM.data &&
        affinityRateHrsDistMOM.data.length
      ) {
        dataAff = convertAffGrowthData(affinityRateHrsDistMOM);
        arr.push({
          heading: "Month on Month",
          data: [...dataAff],
        });
      }
      if (
        affinityRateHrsDistQOQ &&
        affinityRateHrsDistQOQ.data &&
        affinityRateHrsDistQOQ.data.length
      ) {
        dataAff = convertAffGrowthData(affinityRateHrsDistQOQ);
        arr.push({
          heading: "Quarter on Quarter",
          data: [...dataAff],
        });
      }
    }
    let stringAff = `Affinity Rate Report\n`;
    stringAff += `Duration ${moment(fromDate).format("DD/MM/yyyy")} to ${moment(
      toDate,
    ).format("DD/MM/yyyy")}`;
    arr.forEach(({ data, heading }) => {
      stringAff += `\n\n${heading}\n\n`;
      stringAff += `Name,`;
      data[0].values
        .sort((a, b) => a.key.localeCompare(b.key))
        .forEach(({ key }) => {
          stringAff += `${
            GRAPH_COLORS.find((obj) => obj.key === key)?.label || key
          },`;
        });
      stringAff += `\n`;

      data.forEach(({ key, values }) => {
        stringAff += `${
          GRAPH_COLORS.find((obj) => obj.key === key)?.label || key
        },`;
        values
          .sort((a, b) => a.key.localeCompare(b.key))
          .forEach(({ value }) => {
            stringAff += `${value},`;
          });
        stringAff += `\n`;
      });
    });
    stringAff += `\n`;
    downloadCSV({ name: `Roster_Analytics_${Date.now()}`, res: stringAff });
  };

  const convertAffDataWithCategory = (res: IAnalyticsCellKeyValue[]) => {
    let returnData: {
      key: string;
      values: {
        key: string;
        value: string;
      }[];
    }[] = [];

    res.forEach(({ data, key }) => {
      returnData.push({
        key: `"${key}"`,
        values: data.map(({ key, value }) => {
          return {
            key: AFFINITY_LEGENDS.find((obj) => obj.key === key)?.label || key,
            value: `${Number(Number(value || 0).toFixed(2))}${
              key === "AFFINITY_RATE" ? "%" : ""
            }`,
          };
        }),
      });
    });
    return returnData;
  };
  const convertAffGrowthData = (res: IAnalyticsGrowthData) => {
    let returnData: {
      key: string;
      values: {
        key: string;
        value: string;
      }[];
      startDate: string;
      absolute?: boolean;
    }[] = [];
    res?.data?.forEach(({ data, key: rootKey, startDate }) => {
      returnData.push({
        key: `"${rootKey}"`,
        values: data.map(({ key, value }) => {
          return {
            key: AFFINITY_LEGENDS.find((obj) => obj.key === key)?.label || key,
            value: `${Number(Number(value || 0).toFixed(2))}${
              key === "AFFINITY_RATE" ? "%" : ""
            }`,
          };
        }),
        startDate,
        absolute: true,
      });
    });
    return returnData.sort(
      (a, b) => moment(a.startDate).unix() - moment(b.startDate).unix(),
    );
  };

  return (
    <AppContainer
      heading="Affinity Rate"
      info=""
      bgColored={affinityRateTotal || affinityRateHrsDistWOW ? true : false}
    >
      <AppHeader justifyContentLeft></AppHeader>
      <AppTabs
        value={view}
        setValue={(value) => dispatch(setView(value))}
        tabs={VIEWS}
      >
        {fromDate && toDate ? (
          <Menu>
            <MenuButton as={Button} mr={"4"} leftIcon={<FiDownload />}>
              Download
            </MenuButton>
            <MenuList>
              <MenuItem fontSize={"xs"} onClick={onDownload}>
                Download as CSV
              </MenuItem>
            </MenuList>
          </Menu>
        ) : null}

        <Button
          variant={"outline"}
          leftIcon={<FiFilter />}
          onClick={onAffFilterOpen}
          data-testid="Filters-Button"
        >
          Filters
        </Button>
      </AppTabs>
      <AppDashboardFilterDetails
        VIEWS={VIEWS}
        cityOptions={getCityOptions()}
        clusterOptions={getClusterOptions()}
        costCenterOptions={getCostCenterOptions()}
        isFilterOpen={isAffFilterOpen}
        zoneOptions={getZoneOptions()}
      />
      {fromDate && toDate ? (
        <>
          {view === VIEWS[0].value ? (
            <>
              {affinityRateTotal ||
              affinityRateHrsDistWork?.byZone?.length ||
              affinityRateHrsDistWork?.byCity?.length ||
              affinityRateHrsDistWork?.byStore?.length ||
              affinityRateHrsDistWork?.byCluster?.length ? (
                <Flex direction={"column"}>
                  <AppDashboardCards
                    data={[
                      {
                        child: [
                          {
                            title: "Affinity Rate",
                            info: "",
                            value: `${Number(
                              Number(
                                affinityRateTotal?.affinityRate || 0,
                              ).toFixed(2),
                            )}%`,
                          },
                        ],
                      },
                      {
                        child: [
                          {
                            title: "Total Commercial Hours",
                            info: "",
                            value: Number(
                              Number(
                                affinityRateTotal?.totalHours || 0,
                              ).toFixed(2),
                            ).toString(),
                          },
                        ],
                      },
                      {
                        child: [
                          {
                            title: "Total Turnover",
                            info: "",
                            value: `${currencyConverter.format(
                              Number(
                                Number(
                                  affinityRateTotal?.totalTurnover || 0,
                                ).toFixed(2),
                              ),
                            )}`,
                          },
                        ],
                      },
                    ]}
                  />

                  {affinityRateHrsDistWork?.byZone?.length ||
                  affinityRateHrsDistWork?.byCity?.length ||
                  affinityRateHrsDistWork?.byStore?.length ||
                  affinityRateHrsDistWork?.byCluster?.length ? (
                    <Flex my={"1"} p={"2"}>
                      <Flex direction={"column"} width={"calc(100% - 8px)"}>
                        {affinityRateHrsDistWork?.byZone?.length ? (
                          <Flex my={"4"}>
                            <AppBarChart
                              res={affinityRateHrsDistWork.byZone}
                              heading={"By Zone :"}
                              legend={AFFINITY_LEGENDS}
                              sort
                              absolute
                              attached="%"
                            />
                          </Flex>
                        ) : null}
                        {affinityRateHrsDistWork?.byCity?.length ? (
                          <Flex my={"4"}>
                            <AppBarChart
                              res={affinityRateHrsDistWork.byCity}
                              heading="By City :"
                              legend={AFFINITY_LEGENDS}
                              sort
                              absolute
                              attached="%"
                            />
                          </Flex>
                        ) : null}
                        {affinityRateHrsDistWork?.byStore?.length ? (
                          <Flex my={"4"}>
                            <AppBarChart
                              res={affinityRateHrsDistWork.byStore}
                              heading="By Store :"
                              legend={AFFINITY_LEGENDS}
                              sort
                              absolute
                              attached="%"
                            />
                          </Flex>
                        ) : null}
                        {affinityRateHrsDistWork?.byCluster?.length ? (
                          <Flex my={"4"}>
                            <AppBarChart
                              res={affinityRateHrsDistWork.byCluster}
                              heading="By Cluster :"
                              legend={AFFINITY_LEGENDS}
                              sort
                              absolute
                              attached="%"
                            />
                          </Flex>
                        ) : null}
                      </Flex>
                    </Flex>
                  ) : null}
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
              {affinityRateHrsDistWOW?.data?.length ||
              affinityRateHrsDistMOM?.data?.length ||
              affinityRateHrsDistQOQ?.data?.length ? (
                <Flex my={"1"} p={"2"}>
                  <Flex direction={"column"} width={"calc(100%)"}>
                    {affinityRateHrsDistWOW?.data?.length ? (
                      <Flex mt={"1"} mb={"5"} width={"full"}>
                        <AppLineChart
                          res={affinityRateHrsDistWOW.data}
                          comparisonData={
                            compareLastYear
                              ? affinityRateHrsDistWOW.comparisonData
                              : undefined
                          }
                          heading="Week on Week"
                          legend={AFFINITY_LEGENDS}
                          absolute
                          referenceDate={
                            compareLastYear &&
                            affinityRateHrsDistWOW &&
                            affinityRateHrsDistWOW.comparisonData
                              ? toDate
                              : ""
                          }
                          attached="%"
                        />
                      </Flex>
                    ) : null}
                    {affinityRateHrsDistMOM?.data?.length ? (
                      <Flex mt={"1"} mb={"5"} width={"full"}>
                        <AppLineChart
                          res={affinityRateHrsDistMOM.data}
                          comparisonData={
                            compareLastYear
                              ? affinityRateHrsDistMOM.comparisonData
                              : undefined
                          }
                          heading="Month on Month"
                          legend={AFFINITY_LEGENDS}
                          absolute
                          referenceDate={
                            compareLastYear &&
                            affinityRateHrsDistMOM &&
                            affinityRateHrsDistMOM.comparisonData
                              ? toDate
                              : ""
                          }
                          attached="%"
                        />
                      </Flex>
                    ) : null}
                    {affinityRateHrsDistQOQ?.data?.length ? (
                      <Flex mt={"1"} mb={"5"} width={"full"}>
                        <AppLineChart
                          res={affinityRateHrsDistQOQ.data}
                          comparisonData={
                            compareLastYear
                              ? affinityRateHrsDistQOQ.comparisonData
                              : undefined
                          }
                          heading="Quarter on Quarter"
                          legend={AFFINITY_LEGENDS}
                          absolute
                          referenceDate={
                            compareLastYear &&
                            affinityRateHrsDistQOQ &&
                            affinityRateHrsDistQOQ.comparisonData
                              ? toDate
                              : ""
                          }
                          attached="%"
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
      ) : isLoading ? (
        <AppLoader />
      ) : (
        <AppNoData
          msg="Kickstart the analytics engine with some filters! Choose your flavor and make data dance to your tune!"
          image={noDashboardDataImage}
          // Aff
        />
      )}

      <AppDashboardFilter
        VIEWS={VIEWS}
        cityOptions={getCityOptions()}
        // getCityOptions Aff
        clusterOptions={getClusterOptions()}
        costCenterOptions={getCostCenterOptions()}
        zoneOptions={getZoneOptions()}
        isDateRangeOpen={isAffDateRangeOpen}
        isFilterOpen={isAffFilterOpen}
        onApply={getAffData}
        onDateRangeClose={onDateRangeClose}
        onDateRangeOpen={onDateRangeOpen}
        onFilterClose={onFilterClose}
      />
    </AppContainer>
  );
}

export default AffinityRate;
