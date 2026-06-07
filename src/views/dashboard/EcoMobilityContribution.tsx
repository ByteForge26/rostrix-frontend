import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel as AccordionPanelEco,
  Box,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableContainer as TableContainerEco,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
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
import AppDashboardFilterDetailsEco from "../../components/AppDashboardFilterDetails";
import AppHeader from "../../components/AppHeader";
import AppLineChart from "../../components/AppLineChart";

import AppLoaderEco from "../../components/AppLoader";
import AppNoDataEco from "../../components/AppNoData";
import AppPieChart from "../../components/AppPieChart";
import AppProgressBar from "../../components/AppProgressBar";
import AppTabs from "../../components/AppTabs";
import { ENDPOINT } from "../../config/endpoint.config";
import { PERMISSION } from "../../config/permission.config";
import {
  ECO_COM_GROWTH_LEGENDS,
  ECO_COM_LEGENDS,
  MODE_OF_COMMUTE,
  MONTHS,
  VIEWS_WITH_EXTRACTION as VIEWS,
} from "../../helper/Constant";
import {
  analyticsNoDataFound,
  noDashboardDataImage,
} from "../../helper/Images";

import {
  IAnalyticsEcoCategoryData,
  IAnalyticsEcoCombinedData,
  IAnalyticsEcoExtraction,
  IAnalyticsEcoKeyValue,
  IAnalyticsGrowthData,
} from "../../helper/Interface";
import {
  downloadCSV as downloadCSVEco,
  downloadExcelFromJSON,
} from "../../helper/Utils";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";

function EcoMobilityContribution() {
  const { get, post } = useApi();
  const dispatch = useAppDispatch();
  const {
    compareLastYear: compareLastYearEco,
    toDate,
    view,
    // compareLastYearEco
    fromDate: fromDateEco,

    tempFromDate,
    // tempToDate
    tempToDate,
  } = useAppSelector((state) => state.filter);
  const { checkForPermission: checkForPermissionEco } = usePermission();

  const {
    getZoneOptions,
    isLoading,
    getCityOptions: getCityOptionsEco,
    getClusterOptions,
    // getCostCenterOptions
    getCostCenterOptions,

    getAnalyticsBody: getAnalyticsEcoBody,
    isFilterOpen: isEcoFilterOpen,
    // getClusterOptions
    onFilterClose: onEcoFilterClose,
    onFilterOpen,
    isDateRangeOpen,
    onDateRangeClose,
    onDateRangeOpen,
  } = useAnalytics({
    VIEWS,
  });
  const [analyticsEcoCombinedData, setAnalyticsEcoCombinedData] =
    useState<IAnalyticsEcoCombinedData>();
  const [analyticsEcoCategoryData, setAnalyticsCategoryData] =
    useState<IAnalyticsEcoCategoryData>();
  const [analyticsEcoWOWData, setAnalyticsEcoWOWData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsEcoMOMData, setAnalyticsEcoMOMData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsEcoQOQData, setAnalyticsEcoQOQData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsExtractionData, setAnalyticsExtractionData] =
    useState<IAnalyticsEcoExtraction>();

  const [isAbsoluteEco, setIsAbsoluteEco] = useState(false);

  const getDataEco = () => {
    if (view === VIEWS[0].value) {
      getAnalyticsEcoCombinedData();
      getAnalyticsEcoCategoryData();
    } else if (view === VIEWS[1].value) {
      getEcoGrowthData();
    } else {
      getDataExtraction();
    }
  };

  const getEcoBody = () => {
    return getAnalyticsEcoBody({
      tempFromDate,
      tempToDate,
      cityOptions: getCityOptionsEco(),
      costCenterOptions: getCostCenterOptions(),
      zoneOptions: getZoneOptions(),
      clusterOptions: getClusterOptions(),
    });
  };
  const getAnalyticsEcoCombinedData = async () => {
    const res = await post<IAnalyticsEcoCombinedData>(
      ENDPOINT["/analytics"]["/eco-mobility/combined"],
      {
        data: getEcoBody(),
      },
    );
    setAnalyticsEcoCombinedData(res);
  };
  const getAnalyticsEcoCategoryData = async () => {
    const res = await post<IAnalyticsEcoCategoryData>(
      ENDPOINT["/analytics"]["/eco-mobility/distributed/eco-non-eco-distance"],
      {
        data: getEcoBody(),
      },
    );
    setAnalyticsCategoryData(res);
  };
  const getEcoGrowthData = () => {
    getAnalyticsEcoWOWData();
    getAnalyticsEcoMOMData();
    getAnalyticsEcoQOQData();
  };
  const getAnalyticsEcoWOWData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/eco-mobility/eco-share-wow"],
      {
        data: getEcoBody(),
      },
    );
    setAnalyticsEcoWOWData(res);
  };
  const getAnalyticsEcoMOMData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/eco-mobility/eco-share-mom"],
      {
        data: getEcoBody(),
      },
    );
    setAnalyticsEcoMOMData(res);
  };
  const getAnalyticsEcoQOQData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/eco-mobility/eco-share-qoq"],
      {
        data: getEcoBody(),
      },
    );
    setAnalyticsEcoQOQData(res);
  };
  const getDataExtraction = async () => {
    const res = await post<IAnalyticsEcoExtraction>(
      ENDPOINT["/analytics"]["/eco-mobility/cost-centre-wise-data-extraction"],
      {
        data: getEcoBody(),
      },
    );
    setAnalyticsExtractionData(res);
  };
  useEffect(() => {
    if (view && fromDateEco && toDate) {
      getDataEco();
    }
  }, [view]);
  useEffect(() => {
    return () => {
      if (view === VIEWS[2].value) {
        dispatch(setView(VIEWS[0].value));
      }
    };
  }, []);

  const onDownloadEco = () => {
    let dataEco: {
      key: string;
      valuesEco: {
        key: string;
        value: string;
      }[];
      category?: string;
    }[] = [];
    let arr: {
      heading: string;
      data: {
        key: string;
        valuesEco: {
          key: string;
          value: string;
        }[];
        category?: string;
      }[];
    }[] = [];
    if (view === VIEWS[0].value) {
      if (analyticsEcoCombinedData) {
        dataEco = [];
        arr.push({
          heading: "Global Eco Mobility",
          data: [
            {
              key: "Total Commute Distance",
              valuesEco: [
                {
                  key: "Value",
                  value: `${Number(
                    Number(
                      analyticsEcoCombinedData.kmEcoDistribution.totalKm || 0,
                    ).toFixed(2),
                  )} km`,
                },
              ],
            },
            {
              key: "Eco Friendly",
              valuesEco: [
                {
                  key: "Value",
                  value: `${Number(
                    Number(
                      analyticsEcoCombinedData.kmEcoDistribution
                        .ecoFriendlyKm || 0,
                    ).toFixed(2),
                  )} km`,
                },
              ],
            },
            {
              key: "Non-Eco Friendly",
              valuesEco: [
                {
                  key: "Value",
                  value: `${Number(
                    Number(
                      analyticsEcoCombinedData.kmEcoDistribution
                        .nonEcoFriendlyKm || 0,
                    ).toFixed(2),
                  )} km`,
                },
              ],
            },
            {
              key: "Avg. Commute Km",
              valuesEco: [
                {
                  key: "Value",
                  value: `${Number(
                    Number(
                      analyticsEcoCombinedData.avgCommuteKmPerEmpPerDay || 0,
                    ).toFixed(2),
                  )} km`,
                },
              ],
            },
            {
              key: "Employees with Eco Trip",
              valuesEco: [
                {
                  key: "Value",
                  value: `${Number(
                    Number(
                      analyticsEcoCombinedData.numEmpEcoDistribution
                        .empHavingAtLeastOneEcoTrip || 0,
                    ).toFixed(2),
                  )}`,
                },
              ],
            },
            {
              key: "Employees with No Eco Trip",
              valuesEco: [
                {
                  key: "Value",
                  value: `${Number(
                    Number(
                      analyticsEcoCombinedData.numEmpEcoDistribution
                        .empHavingNoEcoTrips || 0,
                    ).toFixed(2),
                  )}`,
                },
              ],
            },
          ],
        });
      }
      if (
        analyticsEcoCombinedData?.ecoModeKmWiseDistribution?.length ||
        analyticsEcoCombinedData?.nonEcoModeKmWiseDistribution?.length
      ) {
        dataEco = [];
        let d = [
          ...analyticsEcoCombinedData.ecoModeKmWiseDistribution.map(
            ({ key, value }) => ({
              category: "ecoFriendlyKm",
              key:
                MODE_OF_COMMUTE.find(({ value }) => value === key)?.label ||
                key,
              value,
            }),
          ),
          ...analyticsEcoCombinedData.nonEcoModeKmWiseDistribution.map(
            ({ key, value }) => ({
              category: "nonEcoFriendlyKm",
              key:
                MODE_OF_COMMUTE.find(({ value }) => value === key)?.label ||
                key,
              value,
            }),
          ),
        ];

        d.forEach(({ key, value, category }) => {
          dataEco.push({
            key,
            valuesEco: [
              {
                key: "Value",
                value: `${(value || 0).toFixed(1)} km`,
              },
            ],
            category,
          });
        });
        arr.push({
          heading: "Mode Distribution",
          data: [
            ...dataEco.sort(
              (a, b) =>
                Number(b.valuesEco[0].value) - Number(a.valuesEco[0].value),
            ),
          ],
        });
      }
      if (
        analyticsEcoCategoryData &&
        analyticsEcoCategoryData.byZone &&
        analyticsEcoCategoryData.byZone.length
      ) {
        dataEco = convertEcoData(analyticsEcoCategoryData.byZone);
        arr.push({
          heading: "Category - By Zone",
          data: [...dataEco],
        });
      }
      if (
        analyticsEcoCategoryData &&
        analyticsEcoCategoryData.byCity &&
        analyticsEcoCategoryData.byCity.length
      ) {
        dataEco = convertEcoData(analyticsEcoCategoryData.byCity);
        arr.push({
          heading: "Category - By City",
          data: [...dataEco],
        });
      }
      if (
        analyticsEcoCategoryData &&
        analyticsEcoCategoryData.byStore &&
        analyticsEcoCategoryData.byStore.length
      ) {
        dataEco = convertEcoData(analyticsEcoCategoryData.byStore);
        arr.push({
          heading: "Category - By Store",
          data: [...dataEco],
        });
      }
      if (
        analyticsEcoCategoryData &&
        analyticsEcoCategoryData.byCluster &&
        analyticsEcoCategoryData.byCluster.length
      ) {
        dataEco = convertEcoData(analyticsEcoCategoryData.byCluster);
        arr.push({
          heading: "Category - By Cluster",
          data: [...dataEco],
        });
      }
    } else {
      if (
        analyticsEcoWOWData &&
        analyticsEcoWOWData.data &&
        analyticsEcoWOWData.data.length
      ) {
        dataEco = convertEcoGrowthData(analyticsEcoWOWData);
        arr.push({
          heading: "Week on Week",
          data: [...dataEco],
        });
      }
      if (
        analyticsEcoMOMData &&
        analyticsEcoMOMData.data &&
        analyticsEcoMOMData.data.length
      ) {
        dataEco = convertEcoGrowthData(analyticsEcoMOMData);
        arr.push({
          heading: "Month on Month",
          data: [...dataEco],
        });
      }
      if (
        analyticsEcoQOQData &&
        analyticsEcoQOQData.data &&
        analyticsEcoQOQData.data.length
      ) {
        dataEco = convertEcoGrowthData(analyticsEcoQOQData);
        arr.push({
          heading: "Quarter on Quarter",
          data: [...dataEco],
        });
      }
    }

    let stringEco = `Roster Dashboad Report\n`;
    stringEco += `Duration ${moment(fromDateEco).format("DD/MM/yyyy")} to ${moment(
      toDate,
    ).format("DD/MM/yyyy")}`;
    arr.forEach(({ data, heading }) => {
      stringEco += `\n\n${heading}\n\n`;
      stringEco += `Name,`;
      data[0].valuesEco
        .sort((a, b) => a.key.localeCompare(b.key))
        .forEach(({ key }) => {
          stringEco += `${
            ECO_COM_LEGENDS.find((obj) => obj.key === key)?.label || key
          },`;
        });
      if (data[0].category) {
        stringEco += `Category,`;
      }
      stringEco += `\n`;

      data.forEach(({ key, valuesEco, category }) => {
        stringEco += `${
          ECO_COM_LEGENDS.find((obj) => obj.key === key)?.label || key
        },`;
        valuesEco
          .sort((a, b) => a.key.localeCompare(b.key))
          .forEach(({ value }) => {
            stringEco += `${value},`;
          });
        if (category) {
          stringEco += `${
            ECO_COM_LEGENDS.find((obj) => obj.key === category)?.label ||
            category
          },`;
        }
        stringEco += `\n`;
      });
    });
    stringEco += `\n`;
    downloadCSVEco({ name: `Roster_Analytics_${Date.now()}`, res: stringEco });
  };
  const convertEcoData = (resEco: IAnalyticsEcoKeyValue[]) => {
    let returnData: {
      key: string;
      valuesEco: {
        key: string;
        value: string;
      }[];
      category?: string;
    }[] = [];

    resEco.forEach(({ key, value }) => {
      let tempObj: any = {
        "Eco Friendly": 0,
        "Non-Eco Friendly": 0,
      };
      let d = [
        {
          key: "Eco Friendly",
          value: value.ecoFriendlyKm,
        },
        {
          key: "Non-Eco Friendly",
          value: value.nonEcoFriendlyKm,
        },
      ];

      d.forEach(({ value, key }) => {
        if (value) {
          tempObj[key] = Number((value || 0).toFixed(1));
        }
      });
      returnData.push({
        key,
        valuesEco: Object.keys(tempObj).map((key) => {
          return {
            key: key,
            value: `${tempObj[key]} km`,
          };
        }),
      });
    });
    return returnData;
  };
  const convertEcoGrowthData = (res: IAnalyticsGrowthData) => {
    let returnData: {
      key: string;
      valuesEco: {
        key: string;
        value: string;
      }[];
      category?: string;
      startDate: string;
    }[] = [];

    res?.data?.forEach(({ data, key, startDate }) => {
      let tempObj: any = {
        "Eco Friendly": 0,
        "Non-Eco Friendly": 0,
      };
      let d = [
        {
          key: "Eco Friendly",
          value: data.find(({ key }) => key === "ECO_KM")?.value || 0,
        },
        {
          key: "Non-Eco Friendly",
          value: data.find(({ key }) => key === "NON_ECO_KM")?.value || 0,
        },
      ];
      d.forEach(({ value, key }) => {
        if (value) {
          tempObj[key] = Number((value || 0).toFixed(1));
        }
      });
      returnData.push({
        key,
        valuesEco: Object.keys(tempObj).map((key) => {
          return {
            key: key,
            value: `${tempObj[key]} km`,
          };
        }),
        startDate,
      });
    });
    return returnData.sort(
      (a, b) => moment(a.startDate).unix() - moment(b.startDate).unix(),
    );
  };

  const sortCommuteData = (
    data: IAnalyticsEcoExtraction["data"],
  ): IAnalyticsEcoExtraction["data"] => {
    return [...data]
      .map((obj) => ({
        ...obj,
        value: Number(Number(obj.value).toFixed(2)).toString(),
      }))
      .sort((a, b) => {
        const dateA =
          Number(a.year) * 12 +
          MONTHS.findIndex((m) => m.toLowerCase() === a.month.toLowerCase());
        const dateB =
          Number(b.year) * 12 +
          MONTHS.findIndex((m) => m.toLowerCase() === a.month.toLowerCase());

        if (dateA !== dateB) {
          return dateB - dateA;
        }

        if (a.costCentre !== b.costCentre) {
          return a.costCentre.localeCompare(b.costCentre);
        }

        return a.modeOfCommute.localeCompare(b.modeOfCommute);
      });
  };
  const onDownloadExcel = () => {
    if (analyticsExtractionData) {
      downloadExcelFromJSON(
        sortCommuteData(analyticsExtractionData?.data),
        `Roster_Analytics_${Date.now()}`,
      );
    }
  };
  return (
    <AppContainer
      heading="Eco Mobility Contribution"
      info=""
      bgColored={analyticsEcoCombinedData ? true : false}
    >
      <AppHeader justifyContentLeft></AppHeader>
      <AppTabs
        value={view}
        setValue={(value) => dispatch(setView(value))}
        tabs={VIEWS}
        // VIEWS
      >
        {fromDateEco &&
        toDate &&
        checkForPermissionEco(PERMISSION.Dashboards["Eco Mobility"].Export) ? (
          <Menu>
            <MenuButton as={Button} mr={"4"} leftIcon={<FiDownload />}>
              Download
            </MenuButton>
            <MenuList>
              <MenuItem
                fontSize={"xs"}
                onClick={() => {
                  if (view === VIEWS[2].value) {
                    onDownloadExcel();
                  } else {
                    onDownloadEco();
                  }
                }}
              >
                {view === VIEWS[2].value
                  ? `Download as EXCEL`
                  : `Download as CSV`}
              </MenuItem>
            </MenuList>
          </Menu>
        ) : null}

        <Button
          variant={"outline"}
          leftIcon={<FiFilter />}
          onClick={onFilterOpen}
          // Filters
        >
          Filters
        </Button>
      </AppTabs>
      <AppDashboardFilterDetailsEco
        VIEWS={VIEWS}
        cityOptions={getCityOptionsEco()}
        clusterOptions={getClusterOptions()}
        costCenterOptions={getCostCenterOptions()}
        isFilterOpen={isEcoFilterOpen}
        zoneOptions={getZoneOptions()}
        isAbsolute={isAbsoluteEco}
        setIsAbsolute={setIsAbsoluteEco}
      />
      {fromDateEco && toDate ? (
        <>
          {view === VIEWS[0].value ? (
            <>
              {analyticsEcoCombinedData?.kmEcoDistribution ? (
                <AppDashboardCards
                  noColor
                  data={[
                    {
                      child: [
                        {
                          title: "Total Commute Distance",
                          info: "Total distance travelled by employees for commuting during the selected period.",
                          value: `${Number(
                            Number(
                              analyticsEcoCombinedData.kmEcoDistribution
                                .totalKm || 0,
                            ).toFixed(2),
                          )} km`,
                        },
                      ],
                    },
                    {
                      child: [
                        {
                          title: "Avg. Commute Km",
                          info: "Average daily commute distance per employee in the selected time range.",
                          value: `${Number(
                            Number(
                              analyticsEcoCombinedData.avgCommuteKmPerEmpPerDay ||
                                0,
                            ).toFixed(2),
                          )} km`,
                        },
                      ],
                    },
                    {
                      child: [
                        {
                          title: "Employees with Eco Trip",
                          info: "Number of employees who used at least one eco-friendly commute option.",
                          value: `${Number(
                            Number(
                              analyticsEcoCombinedData.numEmpEcoDistribution
                                .empHavingAtLeastOneEcoTrip || 0,
                            ).toFixed(2),
                          )}`,
                        },
                      ],
                    },
                    {
                      child: [
                        {
                          title: "Employees with No Eco Trip",
                          info: "Number of employees who did not take any eco-friendly trips in this period.",
                          value: `${Number(
                            Number(
                              analyticsEcoCombinedData.numEmpEcoDistribution
                                .empHavingNoEcoTrips || 0,
                            ).toFixed(2),
                          )}`,
                        },
                      ],
                    },
                  ]}
                />
              ) : null}

              {analyticsEcoCombinedData?.kmEcoDistribution ||
              analyticsEcoCombinedData?.ecoModeKmWiseDistribution ||
              analyticsEcoCategoryData?.byZone?.length ||
              analyticsEcoCategoryData?.byCity?.length ||
              analyticsEcoCategoryData?.byStore?.length ||
              analyticsEcoCategoryData?.byCluster?.length ? (
                <Flex direction={"column"}>
                  <Flex gap={"4"} overflow={"auto"} p={"2"} mb={"4"}>
                    {analyticsEcoCombinedData?.kmEcoDistribution ? (
                      <AppPieChart
                        res={[
                          {
                            key: "ecoFriendlyKm",
                            value:
                              analyticsEcoCombinedData.kmEcoDistribution
                                .ecoFriendlyKm,
                          },
                          {
                            key: "nonEcoFriendlyKm",
                            value:
                              analyticsEcoCombinedData.kmEcoDistribution
                                .nonEcoFriendlyKm,
                          },
                        ]}
                        legend={ECO_COM_LEGENDS}
                        heading="Eco vs Non-Eco Distribution :"
                        width={"50%"}
                        childrenDisplay={"flex"}
                        absolute={isAbsoluteEco}
                        attached={"km"}
                      />
                    ) : null}
                    {analyticsEcoCombinedData?.ecoModeKmWiseDistribution
                      ?.length ||
                    analyticsEcoCombinedData?.nonEcoModeKmWiseDistribution
                      ?.length ? (
                      <AppProgressBar
                        res={[
                          ...analyticsEcoCombinedData.ecoModeKmWiseDistribution.map(
                            ({ key, value }) => ({
                              category: "ecoFriendlyKm",
                              key:
                                MODE_OF_COMMUTE.find(
                                  ({ value }) => value === key,
                                )?.label || key,
                              value,
                            }),
                          ),
                          ...analyticsEcoCombinedData.nonEcoModeKmWiseDistribution.map(
                            ({ key, value }) => ({
                              category: "nonEcoFriendlyKm",
                              key:
                                MODE_OF_COMMUTE.find(
                                  ({ value }) => value === key,
                                )?.label || key,
                              value,
                            }),
                          ),
                        ]}
                        heading="Mode Distribution :"
                        width="50%"
                        legend={ECO_COM_LEGENDS}
                        absolute={isAbsoluteEco}
                        attached={"km"}
                      />
                    ) : null}
                  </Flex>
                  {analyticsEcoCategoryData?.byZone?.length ||
                  analyticsEcoCategoryData?.byCity?.length ||
                  analyticsEcoCategoryData?.byStore?.length ||
                  analyticsEcoCategoryData?.byCluster?.length ? (
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
                          <AccordionPanelEco p={0}>
                            <Flex direction={"column"}>
                              {analyticsEcoCategoryData?.byZone?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsEcoCategoryData.byZone.map(
                                      ({ key, value }) => ({
                                        key,
                                        data: [
                                          {
                                            key: "ecoFriendlyKm",
                                            value: value.ecoFriendlyKm,
                                          },
                                          {
                                            key: "nonEcoFriendlyKm",
                                            value: value.nonEcoFriendlyKm,
                                          },
                                        ],
                                      }),
                                    )}
                                    heading={"By Zone :"}
                                    legend={ECO_COM_LEGENDS}
                                    sort
                                    absolute={isAbsoluteEco}
                                    attached={"km"}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsEcoCategoryData?.byCity?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsEcoCategoryData.byCity.map(
                                      ({ key, value }) => ({
                                        key,
                                        data: [
                                          {
                                            key: "ecoFriendlyKm",
                                            value: value.ecoFriendlyKm,
                                          },
                                          {
                                            key: "nonEcoFriendlyKm",
                                            value: value.nonEcoFriendlyKm,
                                          },
                                        ],
                                      }),
                                    )}
                                    heading="By City :"
                                    legend={ECO_COM_LEGENDS}
                                    sort
                                    absolute={isAbsoluteEco}
                                    attached={"km"}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsEcoCategoryData?.byStore?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsEcoCategoryData.byStore.map(
                                      ({ key, value }) => ({
                                        key,
                                        data: [
                                          {
                                            key: "ecoFriendlyKm",
                                            value: value.ecoFriendlyKm,
                                          },
                                          {
                                            key: "nonEcoFriendlyKm",
                                            value: value.nonEcoFriendlyKm,
                                          },
                                        ],
                                      }),
                                    )}
                                    heading="By Store :"
                                    legend={ECO_COM_LEGENDS}
                                    sort
                                    absolute={isAbsoluteEco}
                                    attached={"km"}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsEcoCategoryData?.byCluster?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsEcoCategoryData.byCluster.map(
                                      ({ key, value }) => ({
                                        key,
                                        data: [
                                          {
                                            key: "ecoFriendlyKm",
                                            value: value.ecoFriendlyKm,
                                          },
                                          {
                                            key: "nonEcoFriendlyKm",
                                            value: value.nonEcoFriendlyKm,
                                          },
                                        ],
                                      }),
                                    )}
                                    heading="By Cluster :"
                                    legend={ECO_COM_LEGENDS}
                                    sort
                                    absolute={isAbsoluteEco}
                                    attached={"km"}
                                  />
                                </Flex>
                              ) : null}
                            </Flex>
                          </AccordionPanelEco>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  ) : null}
                </Flex>
              ) : (
                <AppNoDataEco
                  image={analyticsNoDataFound}
                  msg="Oops!... No result found, please try using a different filter"
                  // No result found
                />
              )}
            </>
          ) : view === VIEWS[1].value ? (
            <>
              {analyticsEcoWOWData?.data?.length ||
              analyticsEcoMOMData?.data?.length ||
              analyticsEcoQOQData?.data?.length ? (
                <Flex width={"full"}>
                  <Flex width={"full"} px={"2"} py={"1"} direction={"column"}>
                    {analyticsEcoWOWData?.data?.length ? (
                      <Flex mt={"1"} mb={"5"} width={"full"}>
                        <AppLineChart
                          res={analyticsEcoWOWData.data}
                          comparisonData={
                            compareLastYearEco
                              ? analyticsEcoWOWData.comparisonData
                              : undefined
                          }
                          heading="Week on Week"
                          legend={ECO_COM_GROWTH_LEGENDS}
                          absolute={isAbsoluteEco}
                          referenceDate={
                            compareLastYearEco &&
                            analyticsEcoQOQData &&
                            analyticsEcoQOQData.comparisonData
                              ? toDate
                              : ""
                          }
                          attached={"km"}
                        />
                      </Flex>
                    ) : null}
                    {analyticsEcoMOMData?.data?.length ? (
                      <Flex mt={"1"} mb={"5"} width={"full"}>
                        <AppLineChart
                          res={analyticsEcoMOMData.data}
                          comparisonData={
                            compareLastYearEco
                              ? analyticsEcoMOMData.comparisonData
                              : undefined
                          }
                          heading="Month on Month"
                          legend={ECO_COM_GROWTH_LEGENDS}
                          absolute={isAbsoluteEco}
                          referenceDate={
                            compareLastYearEco &&
                            analyticsEcoQOQData &&
                            analyticsEcoQOQData.comparisonData
                              ? toDate
                              : ""
                          }
                          attached={"km"}
                        />
                      </Flex>
                    ) : null}
                    {analyticsEcoQOQData?.data?.length ? (
                      <Flex mt={"1"} mb={"5"} width={"full"}>
                        <AppLineChart
                          res={analyticsEcoQOQData.data}
                          comparisonData={
                            compareLastYearEco
                              ? analyticsEcoQOQData.comparisonData
                              : undefined
                          }
                          heading="Quarter on Quarter"
                          legend={ECO_COM_GROWTH_LEGENDS}
                          absolute={isAbsoluteEco}
                          referenceDate={
                            compareLastYearEco &&
                            analyticsEcoQOQData &&
                            analyticsEcoQOQData.comparisonData
                              ? toDate
                              : ""
                          }
                          attached={"km"}
                        />
                      </Flex>
                    ) : null}
                  </Flex>
                </Flex>
              ) : (
                <AppNoDataEco
                  image={analyticsNoDataFound}
                  msg="Oops!... No result found, please try using a different filter"
                />
              )}
            </>
          ) : (
            <Flex direction={"column"}>
              {analyticsExtractionData?.data?.length ? (
                <TableContainerEco
                  background="white"
                  width={"full"}
                  border={"1px solid #F2F2F2"}
                  borderRadius={"md"}
                  height={"fit-content"}
                >
                  <Table variant="simple">
                    <Thead height={"48px"}>
                      <Tr>
                        <Th background="#EBF3F8" color="#1e2640">
                          Year
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Month
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Cost Centre
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Mode Of Commute
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Value
                        </Th>
                        <Th background="#EBF3F8" color="#1e2640">
                          Unit
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody fontSize={"sm"}>
                      {sortCommuteData(analyticsExtractionData.data).map(
                        (
                          {
                            costCentre,
                            modeOfCommute,
                            month,
                            unit,
                            value,
                            year,
                          },
                          j,
                        ) => (
                          <Tr
                            key={`${month}_${value}_${costCentre}_${modeOfCommute}`}
                          >
                            <Td py={"3"}>{year}</Td>
                            <Td py={"3"}> {month}</Td>
                            <Td py={"2"}>{costCentre}</Td>
                            <Td py={"2"}>{modeOfCommute}</Td>
                            <Td py={"2"}>{value}</Td>
                            <Td py={"2"}>{unit}</Td>
                          </Tr>
                        ),
                      )}
                    </Tbody>
                  </Table>
                </TableContainerEco>
              ) : (
                <Flex
                  minHeight={"100px"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  // No Data Found!
                >
                  <Text fontSize={"sm"} color={"gray"}>
                    No Data Found!
                  </Text>
                </Flex>
              )}
            </Flex>
          )}
        </>
      ) : isLoading ? (
        <AppLoaderEco />
      ) : (
        <AppNoDataEco
          msg="Kickstart the analytics engine with some filters! Choose your flavor and make data dance to your tune!"
          image={noDashboardDataImage}
          // noDashboardDataImage eco
        />
      )}

      <AppDashboardFilter
        VIEWS={VIEWS}
        // VIEWS
        cityOptions={getCityOptionsEco()}
        clusterOptions={getClusterOptions()}
        costCenterOptions={getCostCenterOptions()}
        zoneOptions={getZoneOptions()}
        isDateRangeOpen={isDateRangeOpen}
        isFilterOpen={isEcoFilterOpen}
        onApply={getDataEco}
        onDateRangeClose={onDateRangeClose}
        onDateRangeOpen={onDateRangeOpen}
        onFilterClose={onEcoFilterClose}
      />
    </AppContainer>
  );
}

export default EcoMobilityContribution;
