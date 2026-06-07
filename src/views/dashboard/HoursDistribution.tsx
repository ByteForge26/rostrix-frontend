import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel as AccordionPanelHD,
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
import { useEffect, useState } from "react";
import "react-date-range/dist/styles.css"; // main css file
import { FiDownload, FiFilter } from "react-icons/fi";
import { setView } from "../../app/slice/filter.slice";
import { useAppDispatch, useAppSelector } from "../../app/store/store";
import AppBarChart from "../../components/AppBarChart";
import AppContainer from "../../components/AppContainer";
import AppDashboardFilterHD from "../../components/AppDashboardFilter";
import AppDashboardFilterDetails from "../../components/AppDashboardFilterDetails";
import AppHeader from "../../components/AppHeader";

import "react-date-range/dist/theme/default.css"; // theme css file
import AppLineChartHD from "../../components/AppLineChart";
import AppLoader from "../../components/AppLoader";
import AppNoDataHD from "../../components/AppNoData";
import AppPieChart from "../../components/AppPieChart";
import AppProgressBar from "../../components/AppProgressBar";
import AppTableChart from "../../components/AppTableChart";
import AppTabs from "../../components/AppTabs";
import { ENDPOINT } from "../../config/endpoint.config";
import { GRAPH_COLORS, VIEWS } from "../../helper/Constant";

import {
  analyticsNoDataFound,
  noDashboardDataImage,
} from "../../helper/Images";
import {
  IAnalyticsCategoryData,
  IAnalyticsCellKeyValue,
  IAnalyticsCellKeyValueCategory,
  IAnalyticsCombinedData,
  IAnalyticsGrowthData,
  IAnalyticsWorkTypeData,
} from "../../helper/Interface";
import { downloadCSV } from "../../helper/Utils";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useApi } from "../../hooks/useApi";

function HoursDistribution() {
  const { get, post } = useApi();
  const dispatch = useAppDispatch();
  const {
    toDate,
    compareLastYear: compareLastYearHD,
    fromDate: fromDateHD,

    tempFromDate,
    tempToDate,
    // ,
    view,
  } = useAppSelector((state) => state.filter);

  const {
    isLoading: isHHLoading,
    getCityOptions,
    getClusterOptions,
    getCostCenterOptions,
    getZoneOptions,
    getAnalyticsBody,
    isFilterOpen: isFilterOpenHD,
    onFilterClose,
    onFilterOpen,
    isDateRangeOpen,
    onDateRangeClose,
    onDateRangeOpen: onHHDateRangeOpen,
  } = useAnalytics({
    VIEWS,
  });
  const [analyticsHHCombinedData, setAnalyticsHHCombinedData] =
    useState<IAnalyticsCombinedData>();
  const [analyticsHHCategoryData, setAnalyticsHHCategoryData] =
    useState<IAnalyticsCategoryData>();
  const [analyticsHHWorkTypeData, setAnalyticsWorkTypeData] =
    useState<IAnalyticsWorkTypeData>();
  const [analyticsWOWData, setAnalyticsWOWData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsHHMOMData, setAnalyticsMOMData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsHHQOQData, setAnalyticsHHQOQData] =
    useState<IAnalyticsGrowthData>();

  const [isAbsolute, setIsAbsoluteHD] = useState(false);

  const getHHData = () => {
    if (view === VIEWS[0].value) {
      getAnalyticsHHCombinedData();
      getAnalyticsCategoryData();
      getAnalyticsHHWorkTypeData();
    } else {
      getGrowthHHData();
    }
  };

  const getBodyHH = () => {
    return getAnalyticsBody({
      tempFromDate,
      tempToDate,
      cityOptions: getCityOptions(),
      costCenterOptions: getCostCenterOptions(),
      zoneOptions: getZoneOptions(),
      clusterOptions: getClusterOptions(),
    });
  };
  const getAnalyticsHHCombinedData = async () => {
    const res = await post<IAnalyticsCombinedData>(
      ENDPOINT["/analytics"]["/hrs-dist-combined"],
      {
        data: getBodyHH(),
      },
    );
    setAnalyticsHHCombinedData(res);
  };
  const getAnalyticsCategoryData = async () => {
    const res = await post<IAnalyticsCategoryData>(
      ENDPOINT["/analytics"]["/hrs-dist-category"],
      {
        data: getBodyHH(),
      },
    );
    setAnalyticsHHCategoryData(res);
  };
  const getAnalyticsHHWorkTypeData = async () => {
    const res = await post<IAnalyticsWorkTypeData>(
      ENDPOINT["/analytics"]["/hrs-dist-work-type"],
      {
        data: getBodyHH(),
      },
    );
    setAnalyticsWorkTypeData(res);
  };

  useEffect(() => {
    if (view && fromDateHD && toDate) {
      getHHData();
    }
  }, [view]);
  const getGrowthHHData = () => {
    getAnalyticsHHWOWData();
    getAnalyticsHHMOMData();
    getAnalyticsHHQOQData();
  };

  const getAnalyticsHHWOWData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/hrs-dist-wow"],
      {
        data: getBodyHH(),
      },
    );
    setAnalyticsWOWData(res);
  };
  const getAnalyticsHHMOMData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/hrs-dist-mom"],
      {
        data: getBodyHH(),
      },
    );
    setAnalyticsMOMData(res);
  };
  const getAnalyticsHHQOQData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/hrs-dist-qoq"],
      {
        data: getBodyHH(),
      },
    );
    setAnalyticsHHQOQData(res);
  };

  const onDownloadHH = () => {
    let dataHH: {
      key: string;
      values: {
        key: string;
        value: string;
      }[];
      category?: string;
    }[] = [];
    let arr: {
      heading: string;
      data: {
        key: string;
        values: {
          key: string;
          value: string;
        }[];
        category?: string;
      }[];
    }[] = [];
    if (view === VIEWS[0].value) {
      if (
        analyticsHHCombinedData &&
        analyticsHHCombinedData.byCategory &&
        analyticsHHCombinedData.byCategory.length
      ) {
        dataHH = [];
        let total = 0;
        analyticsHHCombinedData.byCategory.forEach(({ value }) => {
          total += value;
        });
        GRAPH_COLORS.forEach(({ key }) => {
          const value =
            analyticsHHCombinedData.byCategory.find((obj) => obj.key === key)
              ?.value || 0;
          dataHH.push({
            key,
            values: [
              {
                key: "(%) Value",
                value: ((value * 100) / total).toFixed(1),
              },
            ],
          });
        });
        arr.push({
          heading: "Hour Distribution By Category",
          data: [
            ...dataHH.sort(
              (a, b) => Number(b.values[0].value) - Number(a.values[0].value),
            ),
          ],
        });
      }
      if (
        analyticsHHCombinedData &&
        analyticsHHCombinedData.byType &&
        analyticsHHCombinedData.byType.length
      ) {
        dataHH = [];
        let total = 0;
        analyticsHHCombinedData.byType.forEach(({ value }) => {
          total += value;
        });
        analyticsHHCombinedData.byType.forEach(({ key, value, category }) => {
          dataHH.push({
            key,
            values: [
              {
                key: "(%) Value",
                value: ((value * 100) / total).toFixed(1),
              },
            ],
            category,
          });
        });
        arr.push({
          heading: "Hour Distribution By Type",
          data: [
            ...dataHH.sort(
              (a, b) => Number(b.values[0].value) - Number(a.values[0].value),
            ),
          ],
        });
      }
      if (
        analyticsHHCategoryData &&
        analyticsHHCategoryData.byZone &&
        analyticsHHCategoryData.byZone.length
      ) {
        dataHH = convertHHData(analyticsHHCategoryData.byZone);
        arr.push({
          heading: "Category - By Zone",
          data: [...dataHH],
        });
      }
      if (
        analyticsHHCategoryData &&
        analyticsHHCategoryData.byCity &&
        analyticsHHCategoryData.byCity.length
      ) {
        dataHH = convertHHData(analyticsHHCategoryData.byCity);
        arr.push({
          heading: "Category - By City",
          data: [...dataHH],
        });
      }
      if (
        analyticsHHCategoryData &&
        analyticsHHCategoryData.byStore &&
        analyticsHHCategoryData.byStore.length
      ) {
        dataHH = convertHHData(analyticsHHCategoryData.byStore);
        arr.push({
          heading: "Category - By Store",
          data: [...dataHH],
        });
      }
      if (
        analyticsHHCategoryData &&
        analyticsHHCategoryData.byCluster &&
        analyticsHHCategoryData.byCluster.length
      ) {
        dataHH = convertHHData(analyticsHHCategoryData.byCluster);
        arr.push({
          heading: "Category - By Cluster",
          data: [...dataHH],
        });
      }
      if (
        analyticsHHWorkTypeData &&
        analyticsHHWorkTypeData.byZone &&
        analyticsHHWorkTypeData.byZone.length
      ) {
        dataHH = convertDataHHWithCategory(analyticsHHWorkTypeData.byZone);
        arr.push({
          heading: "Work Type - By Zone",
          data: [...dataHH],
        });
      }
      if (
        analyticsHHWorkTypeData &&
        analyticsHHWorkTypeData.byCity &&
        analyticsHHWorkTypeData.byCity.length
      ) {
        dataHH = convertDataHHWithCategory(analyticsHHWorkTypeData.byCity);
        arr.push({
          heading: "Work Type - By City",
          data: [...dataHH],
        });
      }
      if (
        analyticsHHWorkTypeData &&
        analyticsHHWorkTypeData.byStore &&
        analyticsHHWorkTypeData.byStore.length
      ) {
        dataHH = convertDataHHWithCategory(analyticsHHWorkTypeData.byStore);
        arr.push({
          heading: "Work Type - By Store",
          data: [...dataHH],
        });
      }
      if (
        analyticsHHWorkTypeData &&
        analyticsHHWorkTypeData.byCluster &&
        analyticsHHWorkTypeData.byCluster.length
      ) {
        dataHH = convertDataHHWithCategory(analyticsHHWorkTypeData.byCluster);
        arr.push({
          heading: "Work Type - By Cluster",
          data: [...dataHH],
        });
      }
    } else {
      if (
        analyticsWOWData &&
        analyticsWOWData.data &&
        analyticsWOWData.data.length
      ) {
        dataHH = convertHHGrowthData(analyticsWOWData);
        arr.push({
          heading: "Performance - Week on Week",
          data: [...dataHH],
        });
      }
      if (
        analyticsHHMOMData &&
        analyticsHHMOMData.data &&
        analyticsHHMOMData.data.length
      ) {
        dataHH = convertHHGrowthData(analyticsHHMOMData);
        arr.push({
          heading: "Performance - Month on Month",
          data: [...dataHH],
        });
      }
      if (
        analyticsHHQOQData &&
        analyticsHHQOQData.data &&
        analyticsHHQOQData.data.length
      ) {
        dataHH = convertHHGrowthData(analyticsHHQOQData);
        arr.push({
          heading: "Performance - Quarter on Quarter",
          data: [...dataHH],
        });
      }
    }

    let string = `Roster Dashboad Report\n`;
    string += `Duration ${moment(fromDateHD).format("DD/MM/yyyy")} to ${moment(
      toDate,
    ).format("DD/MM/yyyy")}`;
    arr.forEach(({ data, heading }) => {
      string += `\n\n${heading}\n\n`;
      string += `Name,`;
      data[0].values
        .sort((a, b) => a.key.localeCompare(b.key))
        .forEach(({ key }) => {
          string += `${
            GRAPH_COLORS.find((obj) => obj.key === key)?.label || key
          },`;
        });
      if (data[0].category) {
        string += `Category,`;
      }
      string += `\n`;

      data.forEach(({ key, values, category }) => {
        string += `${
          GRAPH_COLORS.find((obj) => obj.key === key)?.label || key
        },`;
        values
          .sort((a, b) => a.key.localeCompare(b.key))
          .forEach(({ value }) => {
            string += `${value}%,`;
          });
        if (category) {
          string += `${
            GRAPH_COLORS.find((obj) => obj.key === category)?.label || category
          },`;
        }
        string += `\n`;
      });
    });
    string += `\n`;
    downloadCSV({ name: `Roster_Analytics_${Date.now()}`, res: string });
  };
  const convertHHData = (res: IAnalyticsCellKeyValue[]) => {
    let returnData: {
      key: string;
      values: {
        key: string;
        value: string;
      }[];
      category?: string;
    }[] = [];

    res.forEach(({ data, key }) => {
      let total = 0;
      let tempObj: any = {
        CASHIERING: 0,
        COMMERCIAL: 0,
        ECOMMERCE: 0,
        NON_COMMERCIAL: 0,
      };
      data?.forEach(({ value }) => {
        total += value;
      });
      data?.forEach(({ value, key }) => {
        if (value) {
          tempObj[key] = Number(((value * 100) / total).toFixed(1));
        }
      });
      returnData.push({
        key,
        values: Object.keys(tempObj).map((key) => {
          return {
            key: key,
            value: `${tempObj[key]}`,
          };
        }),
      });
    });
    return returnData;
  };
  const convertDataHHWithCategory = (res: IAnalyticsCellKeyValueCategory[]) => {
    let returnData: {
      key: string;
      values: {
        key: string;
        value: string;
      }[];
      category?: string;
    }[] = [];
    let masterObj: any = {};
    res.forEach(({ data }) => {
      data.forEach(({ key, category }) => {
        masterObj[key] = category;
      });
    });
    res.forEach(({ data, key }) => {
      let total = 0;
      let tempObj: any = {};
      Object.keys(masterObj).forEach((key) => {
        tempObj[key] = 0;
      });
      data?.forEach(({ value }) => {
        total += value;
      });
      data?.forEach(({ value, key }) => {
        if (value) {
          tempObj[key] = Number(((value * 100) / total).toFixed(1));
        }
      });
      returnData.push({
        key,
        values: Object.keys(tempObj).map((key) => {
          return {
            key: key,
            value: `${tempObj[key]}`,
          };
        }),
      });
    });
    return returnData;
  };
  const convertHHGrowthData = (res: IAnalyticsGrowthData) => {
    let returnData: {
      key: string;
      values: {
        key: string;
        value: string;
      }[];
      category?: string;
      startDate: string;
    }[] = [];

    res?.data?.forEach(({ data, key, startDate }) => {
      let total = 0;
      let tempObj: any = {
        CASHIERING: 0,
        COMMERCIAL: 0,
        ECOMMERCE: 0,
        NON_COMMERCIAL: 0,
      };
      data?.forEach(({ value }) => {
        total += value;
      });
      data?.forEach(({ value, key }) => {
        if (value) {
          tempObj[key] = Number(((value * 100) / total).toFixed(1));
        }
      });
      returnData.push({
        key,
        values: Object.keys(tempObj).map((key) => {
          return {
            key: key,
            value: `${tempObj[key]}`,
          };
        }),
        startDate,
      });
    });
    return returnData.sort(
      (a, b) => moment(a.startDate).unix() - moment(b.startDate).unix(),
    );
  };

  return (
    <AppContainer
      heading="Hours Distribution"
      info=""
      bgColored={analyticsHHCombinedData || analyticsWOWData ? true : false}
    >
      <AppHeader justifyContentLeft></AppHeader>
      <AppTabs
        value={view}
        setValue={(value) => dispatch(setView(value))}
        tabs={VIEWS}
      >
        {fromDateHD && toDate ? (
          <Menu>
            <MenuButton as={Button} mr={"4"} leftIcon={<FiDownload />}>
              Download
            </MenuButton>
            <MenuList>
              <MenuItem fontSize={"xs"} onClick={onDownloadHH}>
                Download as CSV
              </MenuItem>
            </MenuList>
          </Menu>
        ) : null}

        <Button
          variant={"outline"}
          leftIcon={<FiFilter />}
          onClick={onFilterOpen}
          // FiFilter HD
        >
          Filters
        </Button>
      </AppTabs>
      <AppDashboardFilterDetails
        VIEWS={VIEWS}
        cityOptions={getCityOptions()}
        clusterOptions={getClusterOptions()}
        costCenterOptions={getCostCenterOptions()}
        isFilterOpen={isFilterOpenHD}
        zoneOptions={getZoneOptions()}
        isAbsolute={isAbsolute}
        setIsAbsolute={setIsAbsoluteHD}
      />
      {fromDateHD && toDate ? (
        <>
          {view === VIEWS[0].value ? (
            <>
              {analyticsHHCombinedData?.byCategory?.length ||
              analyticsHHCombinedData?.byType?.length ||
              analyticsHHCategoryData?.byZone?.length ||
              analyticsHHCategoryData?.byCity?.length ||
              analyticsHHCategoryData?.byStore?.length ||
              analyticsHHCategoryData?.byCluster?.length ||
              analyticsHHWorkTypeData?.byZone?.length ||
              analyticsHHWorkTypeData?.byCity?.length ||
              analyticsHHWorkTypeData?.byStore?.length ||
              analyticsHHWorkTypeData?.byCluster?.length ? (
                <Flex direction={"column"}>
                  <Flex gap={"4"} overflow={"auto"} p={"2"} mb={"4"}>
                    {analyticsHHCombinedData?.byCategory?.length ? (
                      <AppPieChart
                        res={analyticsHHCombinedData.byCategory}
                        legend={GRAPH_COLORS}
                        heading="Hour Distribution By Category :"
                        width={"50%"}
                        childrenDisplay={"flex"}
                        absolute={isAbsolute}
                      />
                    ) : null}
                    {analyticsHHCombinedData?.byType?.length ? (
                      <AppProgressBar
                        res={analyticsHHCombinedData.byType}
                        heading="Hour Distribution By Type :"
                        width="50%"
                        legend={GRAPH_COLORS}
                        absolute={isAbsolute}
                      />
                    ) : null}
                  </Flex>
                  {analyticsHHCategoryData?.byZone?.length ||
                  analyticsHHCategoryData?.byCity?.length ||
                  analyticsHHCategoryData?.byStore?.length ||
                  analyticsHHCategoryData?.byCluster?.length ? (
                    <Flex my={"1"} p={"2"}>
                      <Accordion allowToggle defaultIndex={[0]} width={"full"}>
                        <AccordionItem border={"none"}>
                          <AccordionButton
                            style={{
                              position: "relative",
                            }}
                          >
                            <Box as="span" flex="1" textAlign="left" zIndex={1}>
                              <Text
                                fontWeight={"medium"}
                                style={{
                                  padding: "4px 12px",
                                  width: "fit-content",
                                  margin: "auto",
                                  background: "#f9f9f9",
                                }}
                              >
                                {"By Category"}
                              </Text>
                            </Box>
                            <Flex
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "0",
                                right: "54px",
                                height: "1px",
                                background: "#dceaf4",
                              }}
                            ></Flex>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanelHD p={0}>
                            <Flex direction={"column"}>
                              {analyticsHHCategoryData?.byZone?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsHHCategoryData.byZone}
                                    heading={"By Zone :"}
                                    legend={GRAPH_COLORS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHHCategoryData?.byCity?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsHHCategoryData.byCity}
                                    heading="By City :"
                                    legend={GRAPH_COLORS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHHCategoryData?.byStore?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsHHCategoryData.byStore}
                                    heading="By Store :"
                                    legend={GRAPH_COLORS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHHCategoryData?.byCluster?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsHHCategoryData.byCluster}
                                    heading="By Cluster :"
                                    legend={GRAPH_COLORS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                            </Flex>
                          </AccordionPanelHD>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  ) : null}
                  {analyticsHHWorkTypeData?.byZone?.length ||
                  analyticsHHWorkTypeData?.byCity?.length ||
                  analyticsHHWorkTypeData?.byStore?.length ||
                  analyticsHHWorkTypeData?.byCluster?.length ? (
                    <Flex my={"1"} p={"2"}>
                      <Accordion allowToggle defaultIndex={[0]} width={"full"}>
                        <AccordionItem border={"none"}>
                          <AccordionButton
                            style={{
                              position: "relative",
                            }}
                          >
                            <Box as="span" flex="1" textAlign="left" zIndex={1}>
                              <Text
                                fontWeight={"medium"}
                                style={{
                                  padding: "4px 12px",
                                  width: "fit-content",
                                  margin: "auto",
                                  background: "#f9f9f9",
                                }}
                              >
                                {"By Work Type"}
                              </Text>
                            </Box>
                            <Flex
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "0",
                                right: "54px",
                                height: "1px",
                                background: "#dceaf4",
                              }}
                            ></Flex>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanelHD p={0}>
                            <Flex direction={"column"}>
                              {analyticsHHWorkTypeData?.byZone?.length ? (
                                <Flex my={"4"}>
                                  <AppTableChart
                                    type="Zone"
                                    res={analyticsHHWorkTypeData.byZone}
                                    heading="By Zone :"
                                    legend={GRAPH_COLORS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHHWorkTypeData?.byCity?.length ? (
                                <Flex my={"4"}>
                                  <AppTableChart
                                    type="City"
                                    res={analyticsHHWorkTypeData.byCity}
                                    heading="By City :"
                                    legend={GRAPH_COLORS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHHWorkTypeData?.byStore?.length ? (
                                <Flex my={"4"}>
                                  <AppTableChart
                                    type="Store"
                                    res={analyticsHHWorkTypeData.byStore}
                                    heading="By Store :"
                                    legend={GRAPH_COLORS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHHWorkTypeData?.byCluster?.length ? (
                                <Flex my={"4"}>
                                  <AppTableChart
                                    type="Cluster"
                                    res={analyticsHHWorkTypeData.byCluster}
                                    heading="By Cluster :"
                                    legend={GRAPH_COLORS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                            </Flex>
                          </AccordionPanelHD>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  ) : null}
                </Flex>
              ) : (
                <AppNoDataHD
                  image={analyticsNoDataFound}
                  msg="Oops!... No result found, please try using a different filter"
                />
              )}
            </>
          ) : (
            <>
              {analyticsWOWData?.data?.length ||
              analyticsHHMOMData?.data?.length ||
              analyticsHHQOQData?.data?.length ? (
                <Flex width={"full"}>
                  <Flex width={"full"} px={"2"} py={"1"} direction={"column"}>
                    {analyticsWOWData?.data?.length ? (
                      <Flex mt={"1"} mb={"5"} width={"full"}>
                        <AppLineChartHD
                          res={analyticsWOWData.data}
                          comparisonData={
                            compareLastYearHD
                              ? analyticsWOWData.comparisonData
                              : undefined
                          }
                          heading="Week on Week"
                          legend={GRAPH_COLORS}
                          absolute={isAbsolute}
                          referenceDate={
                            compareLastYearHD &&
                            analyticsHHQOQData &&
                            analyticsHHQOQData.comparisonData
                              ? toDate
                              : ""
                          }
                        />
                      </Flex>
                    ) : null}
                    {analyticsHHMOMData?.data?.length ? (
                      <Flex mt={"1"} mb={"5"} width={"full"}>
                        <AppLineChartHD
                          res={analyticsHHMOMData.data}
                          comparisonData={
                            compareLastYearHD
                              ? analyticsHHMOMData.comparisonData
                              : undefined
                          }
                          heading="Month on Month"
                          legend={GRAPH_COLORS}
                          absolute={isAbsolute}
                          referenceDate={
                            compareLastYearHD &&
                            analyticsHHQOQData &&
                            analyticsHHQOQData.comparisonData
                              ? toDate
                              : ""
                          }
                        />
                      </Flex>
                    ) : null}
                    {analyticsHHQOQData?.data?.length ? (
                      <Flex mt={"1"} mb={"5"} width={"full"}>
                        <AppLineChartHD
                          res={analyticsHHQOQData.data}
                          comparisonData={
                            compareLastYearHD
                              ? analyticsHHQOQData.comparisonData
                              : undefined
                          }
                          heading="Quarter on Quarter"
                          legend={GRAPH_COLORS}
                          absolute={isAbsolute}
                          referenceDate={
                            compareLastYearHD &&
                            analyticsHHQOQData &&
                            analyticsHHQOQData.comparisonData
                              ? toDate
                              : ""
                          }
                        />
                      </Flex>
                    ) : null}
                  </Flex>
                </Flex>
              ) : (
                <AppNoDataHD
                  image={analyticsNoDataFound}
                  msg="Oops!... No result found, please try using a different filter"
                  // OopsOopsOops
                />
              )}
            </>
          )}
        </>
      ) : isHHLoading ? (
        <AppLoader />
      ) : (
        // Kickstart
        <AppNoDataHD
          msg="Kickstart the analytics engine with some filters! Choose your flavor and make data dance to your tune!"
          image={noDashboardDataImage}
          // noDashboardDataImage. ddd
        />
      )}

      <AppDashboardFilterHD
        costCenterOptions={getCostCenterOptions()}
        VIEWS={VIEWS}
        cityOptions={getCityOptions()}
        clusterOptions={getClusterOptions()}
        zoneOptions={getZoneOptions()}
        isDateRangeOpen={isDateRangeOpen}
        isFilterOpen={isFilterOpenHD}
        onApply={getHHData}
        onDateRangeClose={onDateRangeClose}
        onDateRangeOpen={onHHDateRangeOpen}
        onFilterClose={onFilterClose}
      />
    </AppContainer>
  );
}

export default HoursDistribution;
