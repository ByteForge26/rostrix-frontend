import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  IAnalyticsCellKeyValue,
  IAnalyticsKeyValue,
  ILegend,
} from "../helper/Interface";
import AppChartWrapper from "./AppChartWrapper";
import AppCustomizedAxisTick from "./AppCustomizedAxisTick";
import { removeDSI } from "../helper/Utils";

function AppSingleBarChart(props: {
  res: IAnalyticsKeyValue[];
  legend: ILegend;
  heading: string;
  width?: string;
  childrenDisplay?: string;
  sort?: boolean;
  absolute?: boolean;
}) {
  const [modifiedData, setModifiedData] = useState<any[]>();
  const { res, heading, childrenDisplay, legend, width, sort, absolute } =
    props;
  const [sortValue, setSortValue] = useState(
    sort && legend ? `${legend.key}__H2L` : ""
  );
  useEffect(() => {
    if (res) {
      getModifyData();
    }
  }, [res, absolute]);
  const getModifyData = () => {
    const temp: any[] = [];
    let total = 0;
    res.forEach(({ value }) => {
      total += value;
    });

    res.forEach(({ value, key }) => {
      let obj: any = {
        name: removeDSI(key),
      };
      obj[legend.key] = 0;
      if (value) {
        if (absolute) {
          obj[legend.key] = Number(Number(value || 0).toFixed(2));
        } else {
          obj[legend.key] += Number(((value * 100) / total).toFixed(1));
        }
      }
      temp.push(obj);
    });
    setModifiedData(temp);
  };

  const renderCustomizedLabel = (props: any) => {
    const { x, y, width, value } = props;

    return (
      <g>
        <text
          x={x + width / 2}
          y={y - 10}
          fill="#000"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={"10px"}
        >
          {absolute ? value : `${value}%`}
        </text>
      </g>
    );
  };
  let CustomTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (!active) {
      return <div></div>;
    }

    return (
      <div
        style={{
          padding: "6px 12px",
          background: "white",
          borderRadius: 8,
          boxShadow: "0 0 4px 1px gray",
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {label}
        </p>
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
                    background: p.fill,
                    marginRight: 6,
                    whiteSpace: "nowrap",
                  }}
                ></div>
                <span
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {legend.label || p.dataKey}:
                </span>
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                }}
              >
                {absolute ? p.value : `${p.value}%`}
              </span>
            </p>
          );
        })}
      </div>
    );
  };
  const onChangeSortValue = (value: string) => {
    setSortValue(value);
  };

  const sortFn = (a: any, b: any) => {
    if (sortValue) {
      let values = sortValue.split("__");
      const key = values[0];
      if (values[1] === "L2H") {
        return a[key] - b[key];
      } else {
        return b[key] - a[key];
      }
    }
    return 0;
  };

  return (
    <AppChartWrapper
      heading={heading}
      legend={[legend]}
      childrenDisplay={childrenDisplay}
      width={width}
      sortValue={sortValue}
      onChangeSortValue={onChangeSortValue}
    >
      {modifiedData && modifiedData.length ? (
        <BarChart
          width={modifiedData.length * 120}
          height={280}
          data={modifiedData.sort(sortFn)}
          margin={{
            top: 15,
            right: 5,
            left: 0,
            bottom: 5,
          }}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={AppCustomizedAxisTick} interval={0} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => (absolute ? value : `${value}%`)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={legend.key} fill={legend.color} key={legend.key}>
            <LabelList dataKey={legend.key} content={renderCustomizedLabel} />
          </Bar>
        </BarChart>
      ) : null}
    </AppChartWrapper>
  );
}

export default AppSingleBarChart;
