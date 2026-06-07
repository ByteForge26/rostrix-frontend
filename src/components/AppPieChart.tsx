import React from "react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { RADIAN } from "../helper/Constant";
import { IAnalyticsKeyValue, ILegend } from "../helper/Interface";
import AppChartWrapper from "./AppChartWrapper";
import { Flex, Text } from "@chakra-ui/react";
import { formatChartLabel } from "../helper/Utils";

function AppPieChart(props: {
  res: IAnalyticsKeyValue[];
  legend?: ILegend[];
  heading: string;
  width?: string;
  childrenDisplay?: string;
  absolute?: boolean;
  attached?: string;
}) {
  const { res, legend, heading, childrenDisplay, width, absolute, attached } =
    props;

  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, innerRadius, midAngle, outerRadius, percent, value } =
      props;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {formatChartLabel({
          absolute,
          attached,
          value: absolute ? value : percent * 100,
        })}
      </text>
    );
  };
  const getTotal = () => {
    let total = 0;
    res.forEach(({ value }) => {
      total += value;
    });
    return total;
  };
  const total = getTotal();
  let CustomTooltip = (props: any) => {
    const { active, payload } = props;
    if (!active) {
      return <div></div>;
    }
    const colorObj = legend?.find((obj) => obj.key === payload[0].name);
    return (
      <div
        style={{
          padding: "6px 12px",
          background: "white",
          borderRadius: 8,
          boxShadow: "0 0 4px 1px gray",
        }}
      >
        {payload.map((p: any) => {
          return (
            <p
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "4px 0",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  display: "flex",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    background: colorObj?.color,
                    marginRight: 6,
                    whiteSpace: "nowrap",
                  }}
                ></div>
                <span
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {colorObj && colorObj.label
                    ? colorObj.label
                    : payload[0].name}
                  :
                </span>
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                {formatChartLabel({
                  absolute,
                  attached,
                  value: absolute ? p.value : (p.value * 100) / total,
                })}
              </span>
            </p>
          );
        })}
      </div>
    );
  };
  return (
    <AppChartWrapper
      heading={heading}
      width={width}
      childrenDisplay={childrenDisplay}
    >
      <PieChart width={280} height={280}>
        <Pie
          data={res.map(({ key, value }) => ({
            name: key,
            value,
          }))}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {res.map(({ key }, index) => {
            const colorObj = legend?.find((obj) => obj.key === key);
            if (colorObj) {
              return <Cell key={`cell-${index}`} fill={colorObj.color} />;
            }
            return null;
          })}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
      {legend ? (
        <Flex direction={"column"} justifyContent={"center"} p={"4"}>
          {legend?.map(({ color, label }) => {
            return (
              <Flex
                alignItems={"center"}
                my={"1"}
                width={"fit-content"}
                border={"1px solid"}
                borderColor={color}
                padding={"2px 6px"}
                borderRadius={"md"}
              >
                <Flex
                  mr={"2"}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: color,
                  }}
                ></Flex>
                <Text color={"#615E83"}>{label}</Text>
              </Flex>
            );
          })}
        </Flex>
      ) : null}
    </AppChartWrapper>
  );
}

export default AppPieChart;
