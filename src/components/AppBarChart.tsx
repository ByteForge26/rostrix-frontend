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
import { IAnalyticsCellKeyValue, ILegend } from "../helper/Interface";
import AppChartWrapper from "./AppChartWrapper";
import {
  currencyConverter,
  formatChartLabel,
  removeDSI,
} from "../helper/Utils";
import AppCustomizedAxisTick from "./AppCustomizedAxisTick";

function AppBarChart(props: {
  res: IAnalyticsCellKeyValue[];
  legend?: ILegend[];
  heading: string;
  width?: string;
  childrenDisplay?: string;
  sort?: boolean;
  absolute?: boolean;
  attached?: string;
}) {
  const [modifiedData, setModifiedData] = useState<any[]>();
  const {
    res,
    heading,
    childrenDisplay,
    legend,
    width,
    sort,
    absolute,
    attached,
  } = props;
  const [sortValue, setSortValue] = useState(
    sort && legend && legend.filter(({ disabled }) => !disabled).length
      ? `${legend.filter(({ disabled }) => !disabled)[0].key}__H2L`
      : "",
  );

  useEffect(() => {
    if (res) {
      getModifyData();
    }
  }, [res, absolute]);
  const getModifyData = () => {
    const temp: any[] = [];
    res.forEach(({ data, key }) => {
      let total = 0;
      let obj: any = {
        name: removeDSI(key),
      };
      legend?.forEach(({ key }) => {
        obj[key] = 0;
      });
      data?.forEach(({ value }) => {
        total += value;
      });
      data?.forEach(({ value, key }) => {
        if (value) {
          if (absolute) {
            obj[key] = Number(Number(value || 0).toFixed(2));
          } else {
            obj[key] += Number(((value * 100) / total).toFixed(1));
          }
        }
      });
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
          {formatChartLabel({
            absolute,
            attached,
            value,
          })}
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
        {[
          ...payload,
          ...(legend
            ?.filter(({ disabled }) => disabled)
            .map(({ key, disabled, currency }) => ({
              dataKey: key,
              fill: "#027DBC29",
              value: modifiedData?.find((obj) => obj.name === label)[key] || 0,
              disabled: disabled,
              currency,
            })) || []),
        ].map((p: any) => {
          const colorObj = legend?.find((obj) => obj.key === p.dataKey);
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
                  {colorObj && colorObj.label ? colorObj.label : p.dataKey}:
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
                  value: p.value,
                  currency: p.currency,
                  disabled: p.disabled,
                })}
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
      legend={legend?.filter(({ disabled }) => !disabled)}
      childrenDisplay={childrenDisplay}
      width={width}
      sortValue={sortValue}
      onChangeSortValue={onChangeSortValue}
    >
      {modifiedData && modifiedData.length ? (
        <BarChart
          width={
            modifiedData.length *
            (legend && legend.filter(({ disabled }) => !disabled).length
              ? legend.filter(({ disabled }) => !disabled).length === 1
                ? 128
                : legend.filter(({ disabled }) => !disabled).length * 70
              : 280)
          }
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
            tickFormatter={(value) =>
              formatChartLabel({
                absolute,
                attached,
                value,
              })
            }
          />
          <Tooltip content={<CustomTooltip />} />
          {legend?.map(({ color, key, disabled }) => (
            <Bar hide={disabled} dataKey={key} fill={color} key={key}>
              <LabelList dataKey={key} content={renderCustomizedLabel} />
            </Bar>
          ))}
        </BarChart>
      ) : null}
    </AppChartWrapper>
  );
}

export default AppBarChart;
