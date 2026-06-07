import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
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
import AppSingleBarChart from "../../components/AppSingleBarChart";
import AppTabs from "../../components/AppTabs";
import { ENDPOINT } from "../../config/endpoint.config";
import {
  FT_PT_LEGENDS,
  GRAPH_COLORS,
  PK_NPK_LEGENDS,
  VIEWS,
  WD_NWD_LEGENDS,
} from "../../helper/Constant";
import {
  analyticsNoDataFound,
  noDashboardDataImage,
} from "../../helper/Images";
import {
  IAnalyticsCategoryData,
  IAnalyticsCellKeyValue,
  IAnalyticsData,
  IAnalyticsGrowthData,
  IAnalyticsHrsCombinedData,
  IAnalyticsKeyValue,
} from "../../helper/Interface";
import { downloadCSV } from "../../helper/Utils";
import { useAnalytics } from "../../hooks/useAnalytics";
import { useApi } from "../../hooks/useApi";

function HoursVisibility() {
  const { get, post } = useApi();
  const dispatch = useAppDispatch();
  const {
    compareLastYear,
    fromDate,

    tempFromDate,
    tempToDate,
    toDate,
    view,
  } = useAppSelector((state) => state.filter);

  const {
    isLoading,
    getCityOptions,
    getClusterOptions,
    getCostCenterOptions,
    getZoneOptions,
    getAnalyticsBody,
    isFilterOpen,
    onFilterClose,
    onFilterOpen,
    isDateRangeOpen,
    onDateRangeClose,
    onDateRangeOpen,
  } = useAnalytics({
    VIEWS,
  });
  const [analyticsHrsCombinedData, setAnalyticsHrsCombinedData] =
    useState<IAnalyticsHrsCombinedData>();
  const [analyticsHrsDistCombinedData, setAnalyticsHrsDistCombinedData] =
    useState<IAnalyticsData>();

  const [
    analyticsPTFTHrsDistCombinedData,
    setAnalyticsPTFTHrsDistCombinedData,
  ] = useState<IAnalyticsCategoryData>();

  const [
    analyticsWDNWDHrsDistCombinedData,
    setAnalyticsWDNWDHrsDistCombinedData,
  ] = useState<IAnalyticsCategoryData>();

  const [analyticsPNPHrsDistCombinedData, setAnalyticsPNPHrsDistCombinedData] =
    useState<IAnalyticsCategoryData>();
  const [analyticsHrsDistWOWData, setAnalyticsHrsDistWOWData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsHrsDistMOMData, setAnalyticsHrsDistMOMData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsHrsDistQOQData, setAnalyticsHrsDistQOQData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsHrsDistPTFTWOWData, setAnalyticsHrsDistPTFTWOWData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsHrsDistPTFTMOMData, setAnalyticsHrsDistPTFTMOMData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsHrsDistPTFTQOQData, setAnalyticsHrsDistPTFTQOQData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsHrsDistWDNWDWOWData, setAnalyticsHrsDistWDNWDWOWData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsHrsDistWDNWDMOMData, setAnalyticsHrsDistWDNWDMOMData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsHrsDistWDNWDQOQData, setAnalyticsHrsDistWDNWDQOQData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsHrsDistPNPWOWData, setAnalyticsHrsDistPNPWOWData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsHrsDistPNPMOMData, setAnalyticsHrsDistPNPMOMData] =
    useState<IAnalyticsGrowthData>();
  const [analyticsHrsDistPNPQOQData, setAnalyticsHrsDistPNPQOQData] =
    useState<IAnalyticsGrowthData>();

  const [isAbsolute, setIsAbsolute] = useState(false);

  const getDataHrs = () => {
    if (view === VIEWS[0].value) {
      getMetricsHrsData();
    } else {
      getGrowthHrsData();
    }
  };

  const getBodyHrs = () => {
    return getAnalyticsBody({
      tempFromDate,
      tempToDate,
      cityOptions: getCityOptions(),
      costCenterOptions: getCostCenterOptions(),
      zoneOptions: getZoneOptions(),
      clusterOptions: getClusterOptions(),
    });
  };
  const getAnalyticsHrsCombinedData = async () => {
    const res = await post<IAnalyticsHrsCombinedData>(
      ENDPOINT["/analytics"]["/hrs-combined"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsHrsCombinedData(res);
  };
  const getAnalyticsHrsDistCategoryData = async () => {
    const res = await post<IAnalyticsData>(
      ENDPOINT["/analytics"]["/hrs-dist-work"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsHrsDistCombinedData(res);
  };

  const getAnalyticsPTFTHrsDistCombinedData = async () => {
    const res = await post<IAnalyticsCategoryData>(
      ENDPOINT["/analytics"]["/pt-ft-dist-hrs"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsPTFTHrsDistCombinedData(res);
  };

  const getAnalyticsWDNWDHrsDistCombinedData = async () => {
    const res = await post<IAnalyticsCategoryData>(
      ENDPOINT["/analytics"]["/wd-nwd-dist-hrs-combined"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsWDNWDHrsDistCombinedData(res);
  };

  const getAnalyticsPNPHrsDistCombinedData = async () => {
    const res = await post<IAnalyticsCategoryData>(
      ENDPOINT["/analytics"]["/pk-npk-dist-hrs-combined"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsPNPHrsDistCombinedData(res);
  };

  useEffect(() => {
    if (view && fromDate && toDate) {
      getDataHrs();
    }
  }, [view]);
  const getMetricsHrsData = () => {
    getAnalyticsHrsCombinedData();
    getAnalyticsHrsDistCategoryData();
    getAnalyticsPTFTHrsDistCombinedData();
    getAnalyticsWDNWDHrsDistCombinedData();
    getAnalyticsPNPHrsDistCombinedData();
  };
  const getGrowthHrsData = () => {
    getAnalyticsHrsWOWData();
    getAnalyticsHrsMOMData();
    getAnalyticsHrsQOQData();
    getAnalyticsHrsPTFTWOWData();
    getAnalyticsHrsPTFTMOMData();
    getAnalyticsHrsPTFTQOQData();
    getAnalyticsHrsWDNWDWOWData();
    getAnalyticsHrsWDNWDMOMData();
    getAnalyticsHrsWDNWDQOQData();
    getAnalyticsHrsPNPWOWData();
    getAnalyticsHrsPNPMOMData();
    getAnalyticsHrsPNPQOQData();
  };

  const getAnalyticsHrsWOWData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/total-hrs-dist-wow"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsHrsDistWOWData(res);
  };
  const getAnalyticsHrsMOMData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/total-hrs-dist-mom"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsHrsDistMOMData(res);
  };
  const getAnalyticsHrsQOQData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/total-hrs-dist-qoq"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsHrsDistQOQData(res);
  };
  const getAnalyticsHrsPTFTWOWData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/pt-ft-hrs-dist-wow"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsHrsDistPTFTWOWData(res);
  };
  const getAnalyticsHrsPTFTMOMData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/pt-ft-hrs-dist-mom"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsHrsDistPTFTMOMData(res);
  };
  const getAnalyticsHrsPTFTQOQData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/pt-ft-hrs-dist-qoq"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsHrsDistPTFTQOQData(res);
  };
  const getAnalyticsHrsWDNWDWOWData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/wd-nwd-hrs-dist-wow"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsHrsDistWDNWDWOWData(res);
  };
  const getAnalyticsHrsWDNWDMOMData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/wd-nwd-hrs-dist-mom"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsHrsDistWDNWDMOMData(res);
  };
  const getAnalyticsHrsWDNWDQOQData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/wd-nwd-hrs-dist-qoq"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsHrsDistWDNWDQOQData(res);
  };
  const getAnalyticsHrsPNPWOWData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/pk-npk-hrs-dist-wow"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsHrsDistPNPWOWData(res);
  };
  const getAnalyticsHrsPNPMOMData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/pk-npk-hrs-dist-mom"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsHrsDistPNPMOMData(res);
  };
  const getAnalyticsHrsPNPQOQData = async () => {
    const res = await post<IAnalyticsGrowthData>(
      ENDPOINT["/analytics"]["/pk-npk-hrs-dist-qoq"],
      {
        data: getBodyHrs(),
      },
    );
    setAnalyticsHrsDistPNPQOQData(res);
  };

  const onDownload = () => {
    let data: {
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
      data = [];
      data.push({
        key: "Total",
        values: [
          {
            key: "Hours",
            value: analyticsHrsCombinedData?.totalHours?.toString() || "",
          },
        ],
        absolute: true,
      });
      if (analyticsHrsCombinedData?.employmentTypeWorkHours?.length) {
        analyticsHrsCombinedData.employmentTypeWorkHours.forEach(
          ({ key, value }) => {
            data.push({
              key,
              values: [
                {
                  key: "Hours",
                  value: Number(value).toString(),
                },
              ],
              absolute: true,
            });
          },
        );
      }
      if (analyticsHrsCombinedData?.dayTypeWorkHours?.length) {
        analyticsHrsCombinedData.dayTypeWorkHours.forEach(({ key, value }) => {
          data.push({
            key,
            values: [
              {
                key: "Hours",
                value: Number(value).toString(),
              },
            ],
            absolute: true,
          });
        });
      }
      if (analyticsHrsCombinedData?.peakNonPeakHours?.length) {
        analyticsHrsCombinedData.peakNonPeakHours.forEach(({ key, value }) => {
          data.push({
            key,
            values: [
              {
                key: "Hours",
                value: Number(value).toString(),
              },
            ],
            absolute: true,
          });
        });
      }

      arr.push({
        heading: "Total Hours",
        data: [...data],
      });

      if (
        analyticsHrsDistCombinedData &&
        analyticsHrsDistCombinedData.byZone &&
        analyticsHrsDistCombinedData.byZone.length
      ) {
        data = convertData(analyticsHrsDistCombinedData.byZone);
        arr.push({
          heading: "Total Hours - By Zone",
          data: [...data],
        });
      }
      if (
        analyticsHrsDistCombinedData &&
        analyticsHrsDistCombinedData.byCity &&
        analyticsHrsDistCombinedData.byCity.length
      ) {
        data = convertData(analyticsHrsDistCombinedData.byCity);
        arr.push({
          heading: "Total Hours - By City",
          data: [...data],
        });
      }
      if (
        analyticsHrsDistCombinedData &&
        analyticsHrsDistCombinedData.byStore &&
        analyticsHrsDistCombinedData.byStore.length
      ) {
        data = convertData(analyticsHrsDistCombinedData.byStore);
        arr.push({
          heading: "Total Hours - By Store",
          data: [...data],
        });
      }
      if (
        analyticsHrsDistCombinedData &&
        analyticsHrsDistCombinedData.byCluster &&
        analyticsHrsDistCombinedData.byCluster.length
      ) {
        data = convertData(analyticsHrsDistCombinedData.byCluster);
        arr.push({
          heading: "Total Hours - By Cluster",
          data: [...data],
        });
      }
      if (
        analyticsPTFTHrsDistCombinedData &&
        analyticsPTFTHrsDistCombinedData.byZone &&
        analyticsPTFTHrsDistCombinedData.byZone.length
      ) {
        data = convertDataWithCategory(analyticsPTFTHrsDistCombinedData.byZone);
        arr.push({
          heading: "Part Time vs Full Time - By Zone",
          data: [...data],
        });
      }
      if (
        analyticsPTFTHrsDistCombinedData &&
        analyticsPTFTHrsDistCombinedData.byCity &&
        analyticsPTFTHrsDistCombinedData.byCity.length
      ) {
        data = convertDataWithCategory(analyticsPTFTHrsDistCombinedData.byCity);
        arr.push({
          heading: "Part Time vs Full Time - By City",
          data: [...data],
        });
      }
      if (
        analyticsPTFTHrsDistCombinedData &&
        analyticsPTFTHrsDistCombinedData.byStore &&
        analyticsPTFTHrsDistCombinedData.byStore.length
      ) {
        data = convertDataWithCategory(
          analyticsPTFTHrsDistCombinedData.byStore,
        );
        arr.push({
          heading: "Part Time vs Full Time - By Store",
          data: [...data],
        });
      }
      if (
        analyticsPTFTHrsDistCombinedData &&
        analyticsPTFTHrsDistCombinedData.byCluster &&
        analyticsPTFTHrsDistCombinedData.byCluster.length
      ) {
        data = convertDataWithCategory(
          analyticsPTFTHrsDistCombinedData.byCluster,
        );
        arr.push({
          heading: "Part Time vs Full Time - By Cluster",
          data: [...data],
        });
      }
      //
      if (
        analyticsWDNWDHrsDistCombinedData &&
        analyticsWDNWDHrsDistCombinedData.byZone &&
        analyticsWDNWDHrsDistCombinedData.byZone.length
      ) {
        data = convertDataWithCategory(
          analyticsWDNWDHrsDistCombinedData.byZone,
        );
        arr.push({
          heading: "Weekday vs Weekend - By Zone",
          data: [...data],
        });
      }
      if (
        analyticsWDNWDHrsDistCombinedData &&
        analyticsWDNWDHrsDistCombinedData.byCity &&
        analyticsWDNWDHrsDistCombinedData.byCity.length
      ) {
        data = convertDataWithCategory(
          analyticsWDNWDHrsDistCombinedData.byCity,
        );
        arr.push({
          heading: "Weekday vs Weekend - By City",
          data: [...data],
        });
      }
      if (
        analyticsWDNWDHrsDistCombinedData &&
        analyticsWDNWDHrsDistCombinedData.byStore &&
        analyticsWDNWDHrsDistCombinedData.byStore.length
      ) {
        data = convertDataWithCategory(
          analyticsWDNWDHrsDistCombinedData.byStore,
        );
        arr.push({
          heading: "Weekday vs Weekend - By Store",
          data: [...data],
        });
      }
      if (
        analyticsWDNWDHrsDistCombinedData &&
        analyticsWDNWDHrsDistCombinedData.byCluster &&
        analyticsWDNWDHrsDistCombinedData.byCluster.length
      ) {
        data = convertDataWithCategory(
          analyticsWDNWDHrsDistCombinedData.byCluster,
        );
        arr.push({
          heading: "Weekday vs Weekend - By Cluster",
          data: [...data],
        });
      }
      //
      if (
        analyticsPNPHrsDistCombinedData &&
        analyticsPNPHrsDistCombinedData.byZone &&
        analyticsPNPHrsDistCombinedData.byZone.length
      ) {
        data = convertDataWithCategory(analyticsPNPHrsDistCombinedData.byZone);
        arr.push({
          heading: "Peak vs Non Peak - By Zone",
          data: [...data],
        });
      }
      if (
        analyticsPNPHrsDistCombinedData &&
        analyticsPNPHrsDistCombinedData.byCity &&
        analyticsPNPHrsDistCombinedData.byCity.length
      ) {
        data = convertDataWithCategory(analyticsPNPHrsDistCombinedData.byCity);
        arr.push({
          heading: "Peak vs Non Peak - By City",
          data: [...data],
        });
      }
      if (
        analyticsPNPHrsDistCombinedData &&
        analyticsPNPHrsDistCombinedData.byStore &&
        analyticsPNPHrsDistCombinedData.byStore.length
      ) {
        data = convertDataWithCategory(analyticsPNPHrsDistCombinedData.byStore);
        arr.push({
          heading: "Peak vs Non Peak - By Store",
          data: [...data],
        });
      }
      if (
        analyticsPNPHrsDistCombinedData &&
        analyticsPNPHrsDistCombinedData.byCluster &&
        analyticsPNPHrsDistCombinedData.byCluster.length
      ) {
        data = convertDataWithCategory(
          analyticsPNPHrsDistCombinedData.byCluster,
        );
        arr.push({
          heading: "Peak vs Non Peak - By Cluster",
          data: [...data],
        });
      }
    } else {
      if (
        analyticsHrsDistWOWData &&
        analyticsHrsDistWOWData.data &&
        analyticsHrsDistWOWData.data.length
      ) {
        data = convertGrowthData(analyticsHrsDistWOWData);
        arr.push({
          heading: "Total Hours - Week on Week",
          data: [...data],
        });
      }
      if (
        analyticsHrsDistMOMData &&
        analyticsHrsDistMOMData.data &&
        analyticsHrsDistMOMData.data.length
      ) {
        data = convertGrowthData(analyticsHrsDistMOMData);
        arr.push({
          heading: "Total Hours - Month on Month",
          data: [...data],
        });
      }
      if (
        analyticsHrsDistQOQData &&
        analyticsHrsDistQOQData.data &&
        analyticsHrsDistQOQData.data.length
      ) {
        data = convertGrowthData(analyticsHrsDistQOQData);
        arr.push({
          heading: "Total Hours - Quarter on Quarter",
          data: [...data],
        });
      }
      //
      if (
        analyticsHrsDistPTFTWOWData &&
        analyticsHrsDistPTFTWOWData.data &&
        analyticsHrsDistPTFTWOWData.data.length
      ) {
        data = convertGrowthDataWithCategory(analyticsHrsDistPTFTWOWData);
        arr.push({
          heading: "Part Time vs Full Time - Week on Week",
          data: [...data],
        });
      }
      if (
        analyticsHrsDistPTFTMOMData &&
        analyticsHrsDistPTFTMOMData.data &&
        analyticsHrsDistPTFTMOMData.data.length
      ) {
        data = convertGrowthDataWithCategory(analyticsHrsDistPTFTMOMData);
        arr.push({
          heading: "Part Time vs Full Time - Month on Month",
          data: [...data],
        });
      }
      if (
        analyticsHrsDistPTFTQOQData &&
        analyticsHrsDistPTFTQOQData.data &&
        analyticsHrsDistPTFTQOQData.data.length
      ) {
        data = convertGrowthDataWithCategory(analyticsHrsDistPTFTQOQData);
        arr.push({
          heading: "Part Time vs Full Time - Quarter on Quarter",
          data: [...data],
        });
      }
    }
    //
    if (
      analyticsHrsDistWDNWDWOWData &&
      analyticsHrsDistWDNWDWOWData.data &&
      analyticsHrsDistWDNWDWOWData.data.length
    ) {
      data = convertGrowthDataWithCategory(analyticsHrsDistWDNWDWOWData);
      arr.push({
        heading: "Weekday vs Weekend - Week on Week",
        data: [...data],
      });
    }
    if (
      analyticsHrsDistWDNWDMOMData &&
      analyticsHrsDistWDNWDMOMData.data &&
      analyticsHrsDistWDNWDMOMData.data.length
    ) {
      data = convertGrowthDataWithCategory(analyticsHrsDistWDNWDMOMData);
      arr.push({
        heading: "Weekday vs Weekend - Month on Month",
        data: [...data],
      });
    }
    if (
      analyticsHrsDistWDNWDQOQData &&
      analyticsHrsDistWDNWDQOQData.data &&
      analyticsHrsDistWDNWDQOQData.data.length
    ) {
      data = convertGrowthDataWithCategory(analyticsHrsDistWDNWDQOQData);
      arr.push({
        heading: "Weekday vs Weekend - Quarter on Quarter",
        data: [...data],
      });
    }
    //
    if (
      analyticsHrsDistPNPWOWData &&
      analyticsHrsDistPNPWOWData.data &&
      analyticsHrsDistPNPWOWData.data.length
    ) {
      data = convertGrowthDataWithCategory(analyticsHrsDistPNPWOWData);
      arr.push({
        heading: "Peak vs Non Peak - Week on Week",
        data: [...data],
      });
    }
    if (
      analyticsHrsDistPNPMOMData &&
      analyticsHrsDistPNPMOMData.data &&
      analyticsHrsDistPNPMOMData.data.length
    ) {
      data = convertGrowthDataWithCategory(analyticsHrsDistPNPMOMData);
      arr.push({
        heading: "Peak vs Non Peak - Month on Month",
        data: [...data],
      });
    }
    if (
      analyticsHrsDistPNPQOQData &&
      analyticsHrsDistPNPQOQData.data &&
      analyticsHrsDistPNPQOQData.data.length
    ) {
      data = convertGrowthDataWithCategory(analyticsHrsDistPNPQOQData);
      arr.push({
        heading: "Peak vs Non Peak - Quarter on Quarter",
        data: [...data],
      });
    }

    let string = `Roster Dashboad Report\n`;
    string += `Duration ${moment(fromDate).format("DD/MM/yyyy")} to ${moment(
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
      string += `\n`;

      data.forEach(({ key, values, absolute }) => {
        string += `${
          GRAPH_COLORS.find((obj) => obj.key === key)?.label || key
        },`;
        values
          .sort((a, b) => a.key.localeCompare(b.key))
          .forEach(({ value }) => {
            string += `${value}${!absolute ? "%" : ""},`;
          });
        string += `\n`;
      });
    });
    string += `\n`;
    downloadCSV({ name: `Roster_Analytics_${Date.now()}`, res: string });
  };
  const convertData = (res: IAnalyticsKeyValue[]) => {
    let returnData: {
      key: string;
      values: {
        key: string;
        value: string;
      }[];
    }[] = [];
    let total = 0;
    res.forEach(({ value }) => {
      total += Number(value);
    });

    res.forEach(({ key, value }) => {
      returnData.push({
        key,
        values: [
          {
            key: "Total Hours",
            value: Number(
              ((Number(value) * 100) / total).toFixed(1),
            ).toString(),
          },
        ],
      });
    });
    return returnData;
  };
  const convertDataWithCategory = (res: IAnalyticsCellKeyValue[]) => {
    let returnData: {
      key: string;
      values: {
        key: string;
        value: string;
      }[];
    }[] = [];

    res.forEach(({ data, key }) => {
      let total = 0;
      data?.forEach(({ value }) => {
        total += Number(value);
      });
      let tempObj: any = {};
      data?.forEach(({ value, key }) => {
        if (value) {
          tempObj[key] = Number(((Number(value) * 100) / total).toFixed(1));
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
  const convertGrowthData = (res: IAnalyticsGrowthData) => {
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
      data?.forEach(({ value, key }) => {
        returnData.push({
          key: rootKey,
          values: [
            {
              key,
              value: Number(value).toString(),
            },
          ],
          startDate,
          absolute: true,
        });
      });
    });
    return returnData.sort(
      (a, b) => moment(a.startDate).unix() - moment(b.startDate).unix(),
    );
  };
  const convertGrowthDataWithCategory = (res: IAnalyticsGrowthData) => {
    let returnData: {
      key: string;
      values: {
        key: string;
        value: string;
      }[];
      startDate: string;
    }[] = [];

    res?.data?.forEach(({ data, key, startDate }) => {
      let total = 0;

      data?.forEach(({ value }) => {
        total += Number(value);
      });
      let tempObj: any = {};
      data?.forEach(({ value, key }) => {
        tempObj[key] = Number(((Number(value) * 100) / total).toFixed(1));
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

  const getCellValue = (data: IAnalyticsKeyValue[], key: string) => {
    const arr = data || [];

    const value = Number(
      Number(arr.find((obj) => obj.key === key)?.value || 0).toFixed(2),
    );
    if (isAbsolute) {
      return `${value} hrs`;
    } else {
      let total = 0;
      arr.forEach(({ value }) => {
        total += Number(value);
      });
      return `${Number(((value * 100) / total || 0).toFixed(1))}%`;
    }
  };

  return (
    <AppContainer
      heading="Hours Visibility"
      info=""
      bgColored={
        analyticsHrsCombinedData || analyticsHrsDistWOWData ? true : false
      }
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
          onClick={onFilterOpen}
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
        isFilterOpen={isFilterOpen}
        zoneOptions={getZoneOptions()}
        isAbsolute={isAbsolute}
        setIsAbsolute={setIsAbsolute}
      />
      {fromDate && toDate ? (
        <>
          {view === VIEWS[0].value ? (
            <>
              {analyticsHrsCombinedData?.totalHours ||
              analyticsHrsDistCombinedData?.byZone?.length ||
              analyticsHrsDistCombinedData?.byCity?.length ||
              analyticsHrsDistCombinedData?.byStore?.length ||
              analyticsHrsDistCombinedData?.byCluster?.length ||
              analyticsPTFTHrsDistCombinedData?.byZone?.length ||
              analyticsPTFTHrsDistCombinedData?.byCity?.length ||
              analyticsPTFTHrsDistCombinedData?.byStore?.length ||
              analyticsPTFTHrsDistCombinedData?.byCluster?.length ||
              analyticsWDNWDHrsDistCombinedData?.byZone?.length ||
              analyticsWDNWDHrsDistCombinedData?.byCity?.length ||
              analyticsWDNWDHrsDistCombinedData?.byStore?.length ||
              analyticsWDNWDHrsDistCombinedData?.byCluster?.length ||
              analyticsPNPHrsDistCombinedData?.byZone?.length ||
              analyticsPNPHrsDistCombinedData?.byCity?.length ||
              analyticsPNPHrsDistCombinedData?.byStore?.length ||
              analyticsPNPHrsDistCombinedData?.byCluster?.length ? (
                <Flex direction={"column"}>
                  <AppDashboardCards
                    data={[
                      {
                        child: [
                          {
                            title: "Total Hours",
                            info: "",
                            value: Number(
                              Number(
                                analyticsHrsCombinedData?.totalHours || 0,
                              ).toFixed(2),
                            ).toString(),
                          },
                        ],
                      },
                      {
                        child: [
                          {
                            title: "Full Time",
                            info: "",
                            value: getCellValue(
                              analyticsHrsCombinedData?.employmentTypeWorkHours ||
                                [],
                              "FULL_TIME",
                            ),
                          },
                          {
                            title: "Part Time",
                            info: "",
                            value: getCellValue(
                              analyticsHrsCombinedData?.employmentTypeWorkHours ||
                                [],
                              "NON_FULL_TIME",
                            ),
                          },
                        ],
                      },
                      {
                        child: [
                          {
                            title: "Weekday",
                            info: "",
                            value: getCellValue(
                              analyticsHrsCombinedData?.dayTypeWorkHours || [],
                              "Weekday",
                            ),
                          },
                          {
                            title: "Weekend",
                            info: "",
                            value: getCellValue(
                              analyticsHrsCombinedData?.dayTypeWorkHours || [],
                              "Non-Weekday",
                            ),
                          },
                        ],
                      },
                      {
                        child: [
                          {
                            title: "Peak",
                            info: "",
                            value: getCellValue(
                              analyticsHrsCombinedData?.peakNonPeakHours || [],
                              "PEAK",
                            ),
                          },
                          {
                            title: "Non Peak",
                            info: "",
                            value: getCellValue(
                              analyticsHrsCombinedData?.peakNonPeakHours || [],
                              "NON_PEAK",
                            ),
                          },
                        ],
                      },
                    ]}
                  />

                  {analyticsHrsDistCombinedData?.byZone?.length ||
                  analyticsHrsDistCombinedData?.byCity?.length ||
                  analyticsHrsDistCombinedData?.byStore?.length ||
                  analyticsHrsDistCombinedData?.byCluster?.length ? (
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
                                {`Total Hours`}
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
                          <AccordionPanel p={0}>
                            <Flex direction={"column"}>
                              {analyticsHrsDistCombinedData?.byZone?.length ? (
                                <Flex my={"4"}>
                                  <AppSingleBarChart
                                    res={analyticsHrsDistCombinedData.byZone}
                                    heading={"By Zone :"}
                                    legend={{
                                      key: "Total Hours",
                                      label: "Total Hours",
                                      color: "#0071A9",
                                    }}
                                    absolute={isAbsolute}
                                    sort
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHrsDistCombinedData?.byCity?.length ? (
                                <Flex my={"4"}>
                                  <AppSingleBarChart
                                    res={analyticsHrsDistCombinedData.byCity}
                                    heading={"By City :"}
                                    legend={{
                                      key: "Total Hours",
                                      label: "Total Hours",
                                      color: "#0071A9",
                                    }}
                                    absolute={isAbsolute}
                                    sort
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHrsDistCombinedData?.byStore?.length ? (
                                <Flex my={"4"}>
                                  <AppSingleBarChart
                                    res={analyticsHrsDistCombinedData.byStore}
                                    heading={"By Store :"}
                                    legend={{
                                      key: "Total Hours",
                                      label: "Total Hours",
                                      color: "#0071A9",
                                    }}
                                    absolute={isAbsolute}
                                    sort
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHrsDistCombinedData?.byCluster
                                ?.length ? (
                                <Flex my={"4"}>
                                  <AppSingleBarChart
                                    res={analyticsHrsDistCombinedData.byCluster}
                                    heading={"By Cluster :"}
                                    legend={{
                                      key: "Total Hours",
                                      label: "Total Hours",
                                      color: "#0071A9",
                                    }}
                                    absolute={isAbsolute}
                                    sort
                                  />
                                </Flex>
                              ) : null}
                            </Flex>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  ) : null}
                  {analyticsPTFTHrsDistCombinedData?.byZone?.length ||
                  analyticsPTFTHrsDistCombinedData?.byCity?.length ||
                  analyticsPTFTHrsDistCombinedData?.byStore?.length ||
                  analyticsPTFTHrsDistCombinedData?.byCluster?.length ? (
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
                                {"Part Time vs Full Time"}
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
                          <AccordionPanel p={0}>
                            <Flex direction={"column"}>
                              {analyticsPTFTHrsDistCombinedData?.byZone
                                ?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={
                                      analyticsPTFTHrsDistCombinedData.byZone
                                    }
                                    heading={"By Zone :"}
                                    legend={FT_PT_LEGENDS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsPTFTHrsDistCombinedData?.byCity
                                ?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={
                                      analyticsPTFTHrsDistCombinedData.byCity
                                    }
                                    heading="By City :"
                                    legend={FT_PT_LEGENDS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsPTFTHrsDistCombinedData?.byStore
                                ?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={
                                      analyticsPTFTHrsDistCombinedData.byStore
                                    }
                                    heading="By Store :"
                                    legend={FT_PT_LEGENDS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsPTFTHrsDistCombinedData?.byCluster
                                ?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={
                                      analyticsPTFTHrsDistCombinedData.byCluster
                                    }
                                    heading="By Cluster :"
                                    legend={FT_PT_LEGENDS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                            </Flex>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  ) : null}
                  {analyticsWDNWDHrsDistCombinedData?.byZone?.length ||
                  analyticsWDNWDHrsDistCombinedData?.byCity?.length ||
                  analyticsWDNWDHrsDistCombinedData?.byStore?.length ||
                  analyticsWDNWDHrsDistCombinedData?.byCluster?.length ? (
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
                                {"Weekday vs Weekend"}
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
                          <AccordionPanel p={0}>
                            <Flex direction={"column"}>
                              {analyticsWDNWDHrsDistCombinedData?.byZone
                                ?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={
                                      analyticsWDNWDHrsDistCombinedData.byZone
                                    }
                                    heading={"By Zone :"}
                                    legend={WD_NWD_LEGENDS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsWDNWDHrsDistCombinedData?.byCity
                                ?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={
                                      analyticsWDNWDHrsDistCombinedData.byCity
                                    }
                                    heading="By City :"
                                    legend={WD_NWD_LEGENDS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsWDNWDHrsDistCombinedData?.byStore
                                ?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={
                                      analyticsWDNWDHrsDistCombinedData.byStore
                                    }
                                    heading="By Store :"
                                    legend={WD_NWD_LEGENDS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsWDNWDHrsDistCombinedData?.byCluster
                                ?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={
                                      analyticsWDNWDHrsDistCombinedData.byCluster
                                    }
                                    heading="By Cluster :"
                                    legend={WD_NWD_LEGENDS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                            </Flex>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  ) : null}
                  {analyticsPNPHrsDistCombinedData?.byZone?.length ||
                  analyticsPNPHrsDistCombinedData?.byCity?.length ||
                  analyticsPNPHrsDistCombinedData?.byStore?.length ||
                  analyticsPNPHrsDistCombinedData?.byCluster?.length ? (
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
                                {"Peak vs Non Peak"}
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
                          <AccordionPanel p={0}>
                            <Flex direction={"column"}>
                              {analyticsPNPHrsDistCombinedData?.byZone
                                ?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsPNPHrsDistCombinedData.byZone}
                                    heading={"By Zone :"}
                                    legend={PK_NPK_LEGENDS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsPNPHrsDistCombinedData?.byCity
                                ?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={analyticsPNPHrsDistCombinedData.byCity}
                                    heading="By City :"
                                    legend={PK_NPK_LEGENDS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsPNPHrsDistCombinedData?.byStore
                                ?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={
                                      analyticsPNPHrsDistCombinedData.byStore
                                    }
                                    heading="By Store :"
                                    legend={PK_NPK_LEGENDS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                              {analyticsPNPHrsDistCombinedData?.byCluster
                                ?.length ? (
                                <Flex my={"4"}>
                                  <AppBarChart
                                    res={
                                      analyticsPNPHrsDistCombinedData.byCluster
                                    }
                                    heading="By Cluster :"
                                    legend={PK_NPK_LEGENDS}
                                    sort
                                    absolute={isAbsolute}
                                  />
                                </Flex>
                              ) : null}
                            </Flex>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
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
              {analyticsHrsDistWOWData?.data?.length ||
              analyticsHrsDistMOMData?.data?.length ||
              analyticsHrsDistQOQData?.data?.length ||
              analyticsHrsDistPTFTWOWData?.data?.length ||
              analyticsHrsDistPTFTMOMData?.data?.length ||
              analyticsHrsDistPTFTQOQData?.data?.length ||
              analyticsHrsDistWDNWDWOWData?.data?.length ||
              analyticsHrsDistWDNWDMOMData?.data?.length ||
              analyticsHrsDistWDNWDQOQData?.data?.length ||
              analyticsHrsDistPNPWOWData?.data?.length ||
              analyticsHrsDistPNPMOMData?.data?.length ||
              analyticsHrsDistPNPQOQData?.data?.length ? (
                <>
                  {analyticsHrsDistWOWData?.data?.length ||
                  analyticsHrsDistMOMData?.data?.length ||
                  analyticsHrsDistQOQData?.data?.length ? (
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
                                {"Total Hours"}
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
                          <AccordionPanel p={0}>
                            <Flex direction={"column"}>
                              {analyticsHrsDistWOWData?.data?.length ? (
                                <Flex mt={"1"} mb={"5"} width={"full"}>
                                  <AppLineChart
                                    res={analyticsHrsDistWOWData.data}
                                    comparisonData={
                                      compareLastYear
                                        ? analyticsHrsDistWOWData.comparisonData
                                        : undefined
                                    }
                                    heading="Week on Week"
                                    legend={[
                                      {
                                        key: "Total Hours",
                                        label: "Total Hours",
                                        color: "#0071A9",
                                      },
                                    ]}
                                    absolute
                                    referenceDate={
                                      compareLastYear &&
                                      analyticsHrsDistWOWData &&
                                      analyticsHrsDistWOWData.comparisonData
                                        ? toDate
                                        : ""
                                    }
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHrsDistMOMData?.data?.length ? (
                                <Flex mt={"1"} mb={"5"} width={"full"}>
                                  <AppLineChart
                                    res={analyticsHrsDistMOMData.data}
                                    comparisonData={
                                      compareLastYear
                                        ? analyticsHrsDistMOMData.comparisonData
                                        : undefined
                                    }
                                    heading="Month on Month"
                                    legend={[
                                      {
                                        key: "Total Hours",
                                        label: "Total Hours",
                                        color: "#0071A9",
                                      },
                                    ]}
                                    absolute
                                    referenceDate={
                                      compareLastYear &&
                                      analyticsHrsDistMOMData &&
                                      analyticsHrsDistMOMData.comparisonData
                                        ? toDate
                                        : ""
                                    }
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHrsDistQOQData?.data?.length ? (
                                <Flex mt={"1"} mb={"5"} width={"full"}>
                                  <AppLineChart
                                    res={analyticsHrsDistQOQData.data}
                                    comparisonData={
                                      compareLastYear
                                        ? analyticsHrsDistQOQData.comparisonData
                                        : undefined
                                    }
                                    heading="Quarter on Quarter"
                                    legend={[
                                      {
                                        key: "Total Hours",
                                        label: "Total Hours",
                                        color: "#0071A9",
                                      },
                                    ]}
                                    absolute
                                    referenceDate={
                                      compareLastYear &&
                                      analyticsHrsDistQOQData &&
                                      analyticsHrsDistQOQData.comparisonData
                                        ? toDate
                                        : ""
                                    }
                                  />
                                </Flex>
                              ) : null}
                            </Flex>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  ) : null}
                  {analyticsHrsDistPTFTWOWData?.data?.length ||
                  analyticsHrsDistPTFTMOMData?.data?.length ||
                  analyticsHrsDistPTFTQOQData?.data?.length ? (
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
                                {"Part Time vs Full Time"}
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
                          <AccordionPanel p={0}>
                            <Flex direction={"column"}>
                              {analyticsHrsDistPTFTWOWData?.data?.length ? (
                                <Flex mt={"1"} mb={"5"} width={"full"}>
                                  <AppLineChart
                                    res={analyticsHrsDistPTFTWOWData.data}
                                    comparisonData={
                                      compareLastYear
                                        ? analyticsHrsDistPTFTWOWData.comparisonData
                                        : undefined
                                    }
                                    heading="Week on Week"
                                    legend={FT_PT_LEGENDS}
                                    absolute={isAbsolute}
                                    referenceDate={
                                      compareLastYear &&
                                      analyticsHrsDistPTFTWOWData &&
                                      analyticsHrsDistPTFTWOWData.comparisonData
                                        ? toDate
                                        : ""
                                    }
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHrsDistPTFTMOMData?.data?.length ? (
                                <Flex mt={"1"} mb={"5"} width={"full"}>
                                  <AppLineChart
                                    res={analyticsHrsDistPTFTMOMData.data}
                                    comparisonData={
                                      compareLastYear
                                        ? analyticsHrsDistPTFTMOMData.comparisonData
                                        : undefined
                                    }
                                    heading="Month on Month"
                                    legend={FT_PT_LEGENDS}
                                    absolute={isAbsolute}
                                    referenceDate={
                                      compareLastYear &&
                                      analyticsHrsDistPTFTMOMData &&
                                      analyticsHrsDistPTFTMOMData.comparisonData
                                        ? toDate
                                        : ""
                                    }
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHrsDistPTFTQOQData?.data?.length ? (
                                <Flex mt={"1"} mb={"5"} width={"full"}>
                                  <AppLineChart
                                    res={analyticsHrsDistPTFTQOQData.data}
                                    comparisonData={
                                      compareLastYear
                                        ? analyticsHrsDistPTFTQOQData.comparisonData
                                        : undefined
                                    }
                                    heading="Quarter on Quarter"
                                    legend={FT_PT_LEGENDS}
                                    absolute={isAbsolute}
                                    referenceDate={
                                      compareLastYear &&
                                      analyticsHrsDistPTFTQOQData &&
                                      analyticsHrsDistPTFTQOQData.comparisonData
                                        ? toDate
                                        : ""
                                    }
                                  />
                                </Flex>
                              ) : null}
                            </Flex>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  ) : null}
                  {analyticsHrsDistWDNWDWOWData?.data?.length ||
                  analyticsHrsDistWDNWDMOMData?.data?.length ||
                  analyticsHrsDistWDNWDQOQData?.data?.length ? (
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
                                {"Weekday vs Weekend"}
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
                          <AccordionPanel p={0}>
                            <Flex direction={"column"}>
                              {analyticsHrsDistWDNWDWOWData?.data?.length ? (
                                <Flex mt={"1"} mb={"5"} width={"full"}>
                                  <AppLineChart
                                    res={analyticsHrsDistWDNWDWOWData.data}
                                    comparisonData={
                                      compareLastYear
                                        ? analyticsHrsDistWDNWDWOWData.comparisonData
                                        : undefined
                                    }
                                    heading="Week on Week"
                                    legend={WD_NWD_LEGENDS}
                                    absolute={isAbsolute}
                                    referenceDate={
                                      compareLastYear &&
                                      analyticsHrsDistWDNWDWOWData &&
                                      analyticsHrsDistWDNWDWOWData.comparisonData
                                        ? toDate
                                        : ""
                                    }
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHrsDistWDNWDMOMData?.data?.length ? (
                                <Flex mt={"1"} mb={"5"} width={"full"}>
                                  <AppLineChart
                                    res={analyticsHrsDistWDNWDMOMData.data}
                                    comparisonData={
                                      compareLastYear
                                        ? analyticsHrsDistWDNWDMOMData.comparisonData
                                        : undefined
                                    }
                                    heading="Month on Month"
                                    legend={WD_NWD_LEGENDS}
                                    absolute={isAbsolute}
                                    referenceDate={
                                      compareLastYear &&
                                      analyticsHrsDistWDNWDMOMData &&
                                      analyticsHrsDistWDNWDMOMData.comparisonData
                                        ? toDate
                                        : ""
                                    }
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHrsDistWDNWDQOQData?.data?.length ? (
                                <Flex mt={"1"} mb={"5"} width={"full"}>
                                  <AppLineChart
                                    res={analyticsHrsDistWDNWDQOQData.data}
                                    comparisonData={
                                      compareLastYear
                                        ? analyticsHrsDistWDNWDQOQData.comparisonData
                                        : undefined
                                    }
                                    heading="Quarter on Quarter"
                                    legend={WD_NWD_LEGENDS}
                                    absolute={isAbsolute}
                                    referenceDate={
                                      compareLastYear &&
                                      analyticsHrsDistWDNWDQOQData &&
                                      analyticsHrsDistWDNWDQOQData.comparisonData
                                        ? toDate
                                        : ""
                                    }
                                  />
                                </Flex>
                              ) : null}
                            </Flex>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  ) : null}
                  {analyticsHrsDistPNPWOWData?.data?.length ||
                  analyticsHrsDistPNPMOMData?.data?.length ||
                  analyticsHrsDistPNPQOQData?.data?.length ? (
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
                                {"Peak vs Non Peak"}
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
                          <AccordionPanel p={0}>
                            <Flex direction={"column"}>
                              {analyticsHrsDistPNPWOWData?.data?.length ? (
                                <Flex mt={"1"} mb={"5"} width={"full"}>
                                  <AppLineChart
                                    res={analyticsHrsDistPNPWOWData.data}
                                    comparisonData={
                                      compareLastYear
                                        ? analyticsHrsDistPNPWOWData.comparisonData
                                        : undefined
                                    }
                                    heading="Week on Week"
                                    legend={PK_NPK_LEGENDS}
                                    absolute={isAbsolute}
                                    referenceDate={
                                      compareLastYear &&
                                      analyticsHrsDistPNPWOWData &&
                                      analyticsHrsDistPNPWOWData.comparisonData
                                        ? toDate
                                        : ""
                                    }
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHrsDistPNPMOMData?.data?.length ? (
                                <Flex mt={"1"} mb={"5"} width={"full"}>
                                  <AppLineChart
                                    res={analyticsHrsDistPNPMOMData.data}
                                    comparisonData={
                                      compareLastYear
                                        ? analyticsHrsDistPNPMOMData.comparisonData
                                        : undefined
                                    }
                                    heading="Month on Month"
                                    legend={PK_NPK_LEGENDS}
                                    absolute={isAbsolute}
                                    referenceDate={
                                      compareLastYear &&
                                      analyticsHrsDistPNPMOMData &&
                                      analyticsHrsDistPNPMOMData.comparisonData
                                        ? toDate
                                        : ""
                                    }
                                  />
                                </Flex>
                              ) : null}
                              {analyticsHrsDistPNPQOQData?.data?.length ? (
                                <Flex mt={"1"} mb={"5"} width={"full"}>
                                  <AppLineChart
                                    res={analyticsHrsDistPNPQOQData.data}
                                    comparisonData={
                                      compareLastYear
                                        ? analyticsHrsDistPNPQOQData.comparisonData
                                        : undefined
                                    }
                                    heading="Quarter on Quarter"
                                    legend={PK_NPK_LEGENDS}
                                    absolute={isAbsolute}
                                    referenceDate={
                                      compareLastYear &&
                                      analyticsHrsDistPNPQOQData &&
                                      analyticsHrsDistPNPQOQData.comparisonData
                                        ? toDate
                                        : ""
                                    }
                                  />
                                </Flex>
                              ) : null}
                            </Flex>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    </Flex>
                  ) : null}
                </>
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
        />
      )}
      <AppDashboardFilter
        VIEWS={VIEWS}
        cityOptions={getCityOptions()}
        clusterOptions={getClusterOptions()}
        costCenterOptions={getCostCenterOptions()}
        zoneOptions={getZoneOptions()}
        isDateRangeOpen={isDateRangeOpen}
        isFilterOpen={isFilterOpen}
        onApply={getDataHrs}
        onDateRangeClose={onDateRangeClose}
        onDateRangeOpen={onDateRangeOpen}
        onFilterClose={onFilterClose}
      />
    </AppContainer>
  );
}

export default HoursVisibility;
