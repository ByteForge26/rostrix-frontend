import {
  Accordion,
  AccordionButton as AccordionEffButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel as AccordionPanelEff,
  Box,
  Button,
  Flex,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
import { useEffect, useState } from "react";
import { FiFilter } from "react-icons/fi";
import { setView } from "../../app/slice/filter.slice";
import { useAppDispatch, useAppSelector } from "../../app/store/store";
import AppBarChart from "../../components/AppBarChart";
import AppContainer from "../../components/AppContainer";
import AppDashboardCardsEff from "../../components/AppDashboardCards";
import AppDashboardFilter from "../../components/AppDashboardFilter";
import AppDashboardFilterDetailsEff from "../../components/AppDashboardFilterDetails";
import AppHeader from "../../components/AppHeader";
import AppLineChart from "../../components/AppLineChart";
import AppLoader from "../../components/AppLoader";
import AppNoDataEff from "../../components/AppNoData";
import AppTabs from "../../components/AppTabs";
import { ENDPOINT } from "../../config/endpoint.config";
import { EFF_LEGENDS, PRO_LEGENDS, VIEWS } from "../../helper/Constant";
import {
  analyticsNoDataFound,
  noDashboardDataImage,
} from "../../helper/Images";
import {
  IAnalyticsCategoryData,
  IAnalyticsEffCombinedData,
  IAnalyticsGrowthData,
} from "../../helper/Interface";
import { currencyConverter } from "../../helper/Utils";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useApi } from "../../hooks/useApi";

function Efficiency() {
  const { get, post } = useApi();
  const dispatch = useAppDispatch();
  const {
    view: viewEff,
    compareLastYear,
    fromDate,

    tempFromDate,
    tempToDate,
    toDate,
    // Eff
  } = useAppSelector((state) => state.filter);

  const {
    isLoading,
    getCityOptions,
    onFilterOpen,
    getClusterOptions,
    getCostCenterOptions,
    getZoneOptions,

    isFilterOpen: isEffFilterOpen,
    onFilterClose,

    isDateRangeOpen,
    onDateRangeClose,
    getAnalyticsBody: getEffAnalyticsBody,
    onDateRangeOpen,
  } = useAnalytics({
    VIEWS,
  });
  const [analyticsEffCombinedData, setAnalyticsEffCombinedData] =
    useState<IAnalyticsEffCombinedData>();
  const [analyticsEffData, setAnalyticsEffData] =
    useState<IAnalyticsCategoryData>();

  const [analyticsEffWOWData, setAnalyticsEffWOWData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsEffMOMData, setAnalyticsEffMOMData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsEffQOQData, setAnalyticsEffQOQData] =
    useState<IAnalyticsGrowthData>();

  const getEffData = () => {
    if (viewEff === VIEWS[0].value) {
      getAnalyticsEffCombinedData();
      getAnalyticsEffData();
    } else {
      getEffGrowthData();
    }
  };

  const getEffBody = () => {
    return getEffAnalyticsBody({
      tempFromDate,
      tempToDate,
      cityOptions: getCityOptions(),
      costCenterOptions: getCostCenterOptions(),
      zoneOptions: getZoneOptions(),
      clusterOptions: getClusterOptions(),
    });
  };
  const getAnalyticsEffCombinedData = async () => {
    const res = await post<IAnalyticsEffCombinedData>(
      ENDPOINT["/analytics"]["/eff-combined"],
      {
        data: getEffBody(),
      },
    );
    setAnalyticsEffCombinedData(res);
  };
  const getAnalyticsEffData = async () => {
    const res = await post<IAnalyticsCategoryData>(
      ENDPOINT["/analytics"]["/eff-dist"],
      {
        data: getEffBody(),
      },
    );
    setAnalyticsEffData(res);
  };
  useEffect(() => {
    if (viewEff && fromDate && toDate) {
      getEffData();
    }
  }, [viewEff]);
  const getEffGrowthData = () => {
    getAnalyticsEffWOWData();
    getAnalyticsEffMOMData();
    getAnalyticsEffQOQData();
  };
  const getAnalyticsEffWOWData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/eff-wow"],
      {
        data: getEffBody(),
      },
    );
    setAnalyticsEffWOWData(res);
  };
  const getAnalyticsEffMOMData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/eff-mom"],
      {
        data: getEffBody(),
      },
    );
    setAnalyticsEffMOMData(res);
  };
  const getAnalyticsEffQOQData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/eff-qoq"],
      {
        data: getEffBody(),
      },
    );
    setAnalyticsEffQOQData(res);
  };

  const isMinMaxDateDiff = () => {
    let isDiff = false;
    let today = moment().set({
      h: 0,
      m: 0,
      s: 0,
    });
    if (
      moment(tempFromDate).unix() < today.unix() &&
      moment(tempToDate).unix() >= today.unix()
    ) {
      isDiff = true;
      //
    }

    return isDiff;
  };

  return (
    <AppContainer
      heading="Efficiency"
      info=""
      bgColored={analyticsEffCombinedData || analyticsEffWOWData ? true : false}
    >
      <AppHeader justifyContentLeft></AppHeader>
      <AppTabs
        value={viewEff}
        setValue={(value) => dispatch(setView(value))}
        tabs={VIEWS}
      >
        <Button
          variant={"outline"}
          leftIcon={<FiFilter />}
          // Filters EFF
          onClick={onFilterOpen}
        >
          Filters
        </Button>
      </AppTabs>
      <AppDashboardFilterDetailsEff
        VIEWS={VIEWS}
        cityOptions={getCityOptions()}
        clusterOptions={getClusterOptions()}
        costCenterOptions={getCostCenterOptions()}
        isFilterOpen={isEffFilterOpen}
        zoneOptions={getZoneOptions()}
      />
      {fromDate && toDate ? (
        <>
          {viewEff === VIEWS[0].value ? (
            <>
              {analyticsEffCombinedData ||
              analyticsEffData?.byZone?.length ||
              analyticsEffData?.byCity?.length ||
              analyticsEffData?.byStore?.length ||
              analyticsEffData?.byCluster?.length ? (
                <Flex direction={"column"}>
                  <Flex overflow={"auto"} p={"2"}>
                    {analyticsEffCombinedData ? (
                      <AppDashboardCardsEff
                        data={[
                          {
                            child: [
                              {
                                title: "Piloted Efficiency",
                                info: "Piloted Quantity Sold Per Hour",
                                value: Number(
                                  Number(
                                    analyticsEffCombinedData.pilotedEfficiency ||
                                      0,
                                  ).toFixed(2),
                                ).toString(),
                              },
                            ],
                          },
                          {
                            child: [
                              {
                                title: "Realised Efficiency",
                                info: "Realised Quantity Sold Per Hour",
                                value: Number(
                                  Number(
                                    analyticsEffCombinedData.realisedEfficiency ||
                                      0,
                                  ).toFixed(2),
                                ).toString(),
                                color:
                                  Number(
                                    analyticsEffCombinedData.realisedEfficiency ||
                                      0,
                                  ) >
                                  Number(
                                    analyticsEffCombinedData.pilotedEfficiency ||
                                      0,
                                  )
                                    ? "#359735"
                                    : "#e85f5f",
                              },
                            ],
                          },
                          {
                            child: [
                              {
                                title: "Piloted Productivity",
                                info: "Piloted Turnover Per Hour",
                                value: `${currencyConverter.format(
                                  Number(
                                    Number(
                                      analyticsEffCombinedData.pilotedProductivity ||
                                        0,
                                    ).toFixed(2),
                                  ),
                                )}`,
                              },
                            ],
                          },
                          {
                            child: [
                              {
                                title: "Realised Productivity",
                                info: "Realised Turnover Per Hour",
                                value: `${currencyConverter.format(
                                  Number(
                                    Number(
                                      analyticsEffCombinedData.realisedProductivity ||
                                        0,
                                    ).toFixed(2),
                                  ),
                                )}`,
                                color:
                                  Number(
                                    analyticsEffCombinedData.realisedProductivity ||
                                      0,
                                  ) >
                                  Number(
                                    analyticsEffCombinedData.pilotedProductivity ||
                                      0,
                                  )
                                    ? "#359735"
                                    : "#e85f5f",
                              },
                            ],
                          },
                        ]}
                      />
                    ) : null}
                  </Flex>
                  {analyticsEffData?.byZone?.length ||
                  analyticsEffData?.byCity?.length ||
                  analyticsEffData?.byStore?.length ||
                  analyticsEffData?.byCluster?.length ? (
                    <Flex my={"1"} p={"2"}>
                      <Accordion allowToggle defaultIndex={[0]} width={"full"}>
                        <AccordionItem border={"none"}>
                          <AccordionEffButton
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
                                {"Efficiency"}
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
                          </AccordionEffButton>
                          <AccordionPanelEff p={0}>
                            <Flex direction={"column"}>
                              {analyticsEffData?.byZone?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsEffData.byZone}
                                    heading={"By Zone :"}
                                    legend={EFF_LEGENDS}
                                    sort
                                    absolute={true}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsEffData?.byCity?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsEffData.byCity}
                                    heading="By City :"
                                    legend={EFF_LEGENDS}
                                    sort
                                    absolute={true}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsEffData?.byStore?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsEffData.byStore}
                                    heading="By Store :"
                                    legend={EFF_LEGENDS}
                                    sort
                                    absolute={true}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsEffData?.byCluster?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsEffData.byCluster}
                                    heading="By Cluster :"
                                    legend={EFF_LEGENDS}
                                    sort
                                    absolute={true}
                                  />
                                </Flex>
                              ) : null}
                            </Flex>
                          </AccordionPanelEff>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  ) : null}
                  {analyticsEffData?.byZone?.length ||
                  analyticsEffData?.byCity?.length ||
                  analyticsEffData?.byStore?.length ||
                  analyticsEffData?.byCluster?.length ? (
                    <Flex my={"1"} p={"2"}>
                      <Accordion allowToggle defaultIndex={[0]} width={"full"}>
                        <AccordionItem border={"none"}>
                          <AccordionEffButton
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
                                {"Productivity"}
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
                          </AccordionEffButton>
                          <AccordionPanelEff p={0}>
                            <Flex direction={"column"}>
                              {analyticsEffData?.byZone?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsEffData.byZone}
                                    heading={"By Zone :"}
                                    legend={PRO_LEGENDS}
                                    sort
                                    absolute={true}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsEffData?.byCity?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsEffData.byCity}
                                    heading="By City :"
                                    legend={PRO_LEGENDS}
                                    sort
                                    absolute={true}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsEffData?.byStore?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsEffData.byStore}
                                    heading="By Store :"
                                    legend={PRO_LEGENDS}
                                    sort
                                    absolute={true}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsEffData?.byCluster?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsEffData.byCluster}
                                    heading="By Cluster :"
                                    legend={PRO_LEGENDS}
                                    sort
                                    absolute={true}
                                  />
                                </Flex>
                              ) : null}
                            </Flex>
                          </AccordionPanelEff>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  ) : null}
                </Flex>
              ) : (
                <AppNoDataEff
                  image={analyticsNoDataFound}
                  msg="Oops!... No result found, please try using a different filter"
                  // result
                />
              )}
            </>
          ) : (
            <>
              {analyticsEffWOWData?.data?.length ||
              analyticsEffMOMData?.data?.length ||
              analyticsEffQOQData?.data?.length ? (
                <Flex width={"full"} direction={"column"}>
                  <Flex my={"1"} p={"2"}>
                    <Accordion allowToggle defaultIndex={[0]} width={"full"}>
                      <AccordionItem border={"none"}>
                        <AccordionEffButton
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
                              {"Efficiency"}
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
                        </AccordionEffButton>
                        <AccordionPanelEff p={0}>
                          <Flex
                            width={"full"}
                            px={"2"}
                            py={"1"}
                            direction={"column"}
                          >
                            {analyticsEffWOWData?.data?.length ? (
                              <Flex mt={"1"} mb={"5"} width={"full"}>
                                <AppLineChart
                                  res={analyticsEffWOWData.data}
                                  heading="Week on Week"
                                  comparisonData={
                                    compareLastYear
                                      ? analyticsEffWOWData.comparisonData
                                      : undefined
                                  }
                                  legend={EFF_LEGENDS}
                                  absolute={true}
                                  referenceDate={
                                    compareLastYear &&
                                    analyticsEffQOQData &&
                                    analyticsEffQOQData.comparisonData
                                      ? toDate
                                      : ""
                                  }
                                />
                              </Flex>
                            ) : null}
                            {analyticsEffMOMData?.data?.length ? (
                              <Flex mt={"1"} mb={"5"} width={"full"}>
                                <AppLineChart
                                  res={analyticsEffMOMData.data}
                                  heading="Month on Month"
                                  comparisonData={
                                    compareLastYear
                                      ? analyticsEffMOMData.comparisonData
                                      : undefined
                                  }
                                  legend={EFF_LEGENDS}
                                  absolute={true}
                                  referenceDate={
                                    compareLastYear &&
                                    analyticsEffQOQData &&
                                    analyticsEffQOQData.comparisonData
                                      ? toDate
                                      : ""
                                  }
                                />
                              </Flex>
                            ) : null}
                            {analyticsEffQOQData?.data?.length ? (
                              <Flex mt={"1"} mb={"5"} width={"full"}>
                                <AppLineChart
                                  res={analyticsEffQOQData.data}
                                  heading="Quarter on Quarter"
                                  comparisonData={
                                    compareLastYear
                                      ? analyticsEffQOQData.comparisonData
                                      : undefined
                                  }
                                  legend={EFF_LEGENDS}
                                  absolute={true}
                                  referenceDate={
                                    compareLastYear &&
                                    analyticsEffQOQData &&
                                    analyticsEffQOQData.comparisonData
                                      ? toDate
                                      : ""
                                  }
                                />
                              </Flex>
                            ) : null}
                          </Flex>
                        </AccordionPanelEff>
                      </AccordionItem>
                    </Accordion>
                  </Flex>
                  <Flex my={"1"} p={"2"}>
                    <Accordion allowToggle defaultIndex={[0]} width={"full"}>
                      <AccordionItem border={"none"}>
                        <AccordionEffButton
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
                              {"Productivity"}
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
                        </AccordionEffButton>
                        <AccordionPanelEff p={0}>
                          <Flex
                            width={"full"}
                            px={"2"}
                            py={"1"}
                            direction={"column"}
                          >
                            {analyticsEffWOWData?.data?.length ? (
                              <Flex mt={"1"} mb={"5"} width={"full"}>
                                <AppLineChart
                                  res={analyticsEffWOWData.data}
                                  heading="Week on Week"
                                  comparisonData={
                                    compareLastYear
                                      ? analyticsEffWOWData.comparisonData
                                      : undefined
                                  }
                                  legend={PRO_LEGENDS}
                                  absolute={true}
                                  referenceDate={
                                    compareLastYear &&
                                    analyticsEffQOQData &&
                                    analyticsEffQOQData.comparisonData
                                      ? toDate
                                      : ""
                                  }
                                />
                              </Flex>
                            ) : null}
                            {analyticsEffMOMData?.data?.length ? (
                              <Flex mt={"1"} mb={"5"} width={"full"}>
                                <AppLineChart
                                  res={analyticsEffMOMData.data}
                                  heading="Month on Month"
                                  comparisonData={
                                    compareLastYear
                                      ? analyticsEffMOMData.comparisonData
                                      : undefined
                                  }
                                  legend={PRO_LEGENDS}
                                  absolute={true}
                                  referenceDate={
                                    compareLastYear &&
                                    analyticsEffQOQData &&
                                    analyticsEffQOQData.comparisonData
                                      ? toDate
                                      : ""
                                  }
                                />
                              </Flex>
                            ) : null}
                            {analyticsEffQOQData?.data?.length ? (
                              <Flex mt={"1"} mb={"5"} width={"full"}>
                                <AppLineChart
                                  res={analyticsEffQOQData.data}
                                  heading="Quarter on Quarter"
                                  comparisonData={
                                    compareLastYear
                                      ? analyticsEffQOQData.comparisonData
                                      : undefined
                                  }
                                  legend={PRO_LEGENDS}
                                  absolute={true}
                                  referenceDate={
                                    compareLastYear &&
                                    analyticsEffQOQData &&
                                    analyticsEffQOQData.comparisonData
                                      ? toDate
                                      : ""
                                  }
                                />
                              </Flex>
                            ) : null}
                          </Flex>
                        </AccordionPanelEff>
                      </AccordionItem>
                    </Accordion>
                  </Flex>
                </Flex>
              ) : (
                <AppNoDataEff
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
        <AppNoDataEff
          msg="Kickstart the analytics engine with some filters! Choose your flavor and make data dance to your tune!"
          image={noDashboardDataImage}
        />
      )}

      <AppDashboardFilter
        VIEWS={VIEWS}
        cityOptions={getCityOptions()}
        clusterOptions={getClusterOptions()}
        costCenterOptions={getCostCenterOptions()}
        zoneOptions={getZoneOptions()}
        isDateRangeOpen={isDateRangeOpen}
        isFilterOpen={isEffFilterOpen}
        onApply={getEffData}
        onDateRangeClose={onDateRangeClose}
        onDateRangeOpen={onDateRangeOpen}
        onFilterClose={onFilterClose}
      />
    </AppContainer>
  );
}

export default Efficiency;
