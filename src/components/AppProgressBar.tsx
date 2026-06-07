import React, { useEffect, useState } from "react";
import {
  IAnalyticsCombinedData,
  IAnalyticsKeyValueCategory,
  ILegend,
} from "../helper/Interface";
import { Flex, Tooltip as ProgressBarTooltip, Text } from "@chakra-ui/react";
import ProgressBar from "@ramonak/react-progress-bar";
import AppChartWrapper from "./AppChartWrapper";
import { formatChartLabel } from "../helper/Utils";

function AppProgressBar(props: {
  res: IAnalyticsKeyValueCategory[];
  legend?: ILegend[];
  heading: string;
  width?: string;
  childrenDisplay?: string;
  absolute?: boolean;
  attached?: string;
}) {
  const { res, heading, childrenDisplay, legend, width, absolute, attached } =
    props;
  const [legendOptions, setLegendOptions] = useState<Record<string, boolean>>(
    {},
  );
  const [data, setData] = useState<
    {
      category: string;
      key: string;
      value: number;
      percentage: number;
    }[]
  >([]);
  useEffect(() => {
    if (legend && legend.length) {
      let temp: Record<string, boolean> = {};
      legend.forEach(({ key }) => {
        temp[key] = true;
      });
      setLegendOptions(temp);
    }
  }, [legend]);
  useEffect(() => {
    modifyData();
  }, [res, absolute, legendOptions, legend]);

  const modifyData = () => {
    let data: {
      category: string;
      key: string;
      value: number;
      percentage: number;
    }[] = [];
    let total = 0;
    res.forEach(({ value }) => {
      total += value;
    });
    res
      .filter(({ category }) => legendOptions[category])
      .forEach(({ value, category, key }) => {
        data.push({
          category,
          key,
          value,
          percentage: Number(((value * 100) / total).toFixed(1)),
        });
      });
    setData(data);
  };
  const onChangeLegendOptions = (key: string, value: boolean) => {
    setLegendOptions((old) => ({ ...old, [key]: value }));
  };

  return (
    <AppChartWrapper
      heading={heading}
      width={width}
      childrenDisplay={childrenDisplay}
      legend={legend}
      hideLegend
      legendOptions={legendOptions}
      onChangeLegendOptions={onChangeLegendOptions}
    >
      <Flex direction={"column"} width={"full"} pr={"4"}>
        {data && data.length ? (
          <>
            {data
              .sort((a, b) => b.value - a.value)
              .map(({ category, key, percentage, value }) => {
                const colorObj = legend?.find((obj) => obj.key === category);
                return (
                  <ProgressBarTooltip
                    label={colorObj?.label}
                    hasArrow
                    key={key}
                  >
                    <Flex
                      key={key}
                      width={"full"}
                      my={"2"}
                      direction={"column"}
                    >
                      <Flex justifyContent={"space-between"} pb={"0.5"}>
                        <Text fontSize={"xs"}>{key}</Text>
                        <Text fontSize={"xs"} fontWeight={"medium"}>
                          {formatChartLabel({
                            absolute,
                            attached,
                            value: absolute ? value : percentage,
                          })}
                        </Text>
                      </Flex>

                      <ProgressBar
                        className="ProgressBar"
                        height="14px"
                        completed={percentage}
                        bgColor={
                          colorObj && colorObj.color
                            ? colorObj.color
                            : "#0071A9"
                        }
                        customLabelStyles={{
                          display: "none",
                        }}
                        borderRadius="4px"
                      />
                    </Flex>
                  </ProgressBarTooltip>
                );
              })}
          </>
        ) : null}
      </Flex>
    </AppChartWrapper>
  );
}

export default AppProgressBar;
