import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  IAnalyticsGrowthCellData,
  IAnalyticsGrowthData,
  ILegend,
} from "../helper/Interface";
import moment from "moment";
import AppChartWrapper from "./AppChartWrapper";
import { currencyConverter, formatChartLabel } from "../helper/Utils";

const LAST_YEAR = "(Last Year)";

function AppLineChart(props: {
  res: IAnalyticsGrowthCellData[];
  comparisonData?: IAnalyticsGrowthCellData[];
  legend?: ILegend[];
  heading: string;
  width?: string;
  childrenDisplay?: string;
  absolute?: boolean;
  referenceDate?: string;
  attached?: string;
}) {
  const [modifiedData, setModifiedData] = useState<any[]>();
  const [legendOptions, setLegendOptions] = useState<Record<string, boolean>>(
    {},
  );
  const {
    res,
    heading,
    childrenDisplay,
    legend,
    width,
    absolute,
    comparisonData,
    referenceDate,
    attached,
  } = props;

  useEffect(() => {
    if (res) {
      getModifyData();
    }
  }, [res, absolute, comparisonData, legendOptions, legend]);

  useEffect(() => {
    if (legend && legend.length) {
      let temp: Record<string, boolean> = {};
      legend
        .filter(({ disabled }) => !disabled)
        .forEach(({ key }) => {
          temp[key] = true;
        });
      setLegendOptions(temp);
    }
  }, [legend]);

  const onChangeLegendOptions = (key: string, value: boolean) => {
    setLegendOptions((old) => ({ ...old, [key]: value }));
  };

  const getModifyData = () => {
    let temp: any[] = [];

    res.forEach(({ data, key, startDate }) => {
      let total = 0;
      let obj: any = {
        name: key,
        startDate,
      };
      if (legend && legend.length) {
        legend
          .filter(({ disabled }) => !disabled)
          .filter(({ key }) => legendOptions[key])
          .forEach(({ key }) => {
            obj[key] = 0;
            if (comparisonData) {
              obj[`${key} ${LAST_YEAR}`] = 0;
            }
          });
      }

      data?.forEach(({ value }) => {
        total += Number(value);
      });
      data?.forEach(({ value, key }) => {
        if (value && legendOptions[key]) {
          if (absolute) {
            obj[key] = Number(value);
          } else {
            obj[key] += Number(((Number(value) * 100) / total).toFixed(1));
          }
        }
      });
      temp.push(obj);
    });

    if (comparisonData && comparisonData.length) {
      comparisonData.forEach(({ data, key }) => {
        let total = 0;
        data?.forEach(({ value }) => {
          total += Number(value);
        });
        const index = temp.findIndex(({ name }) => name === key);
        if (index >= 0) {
          data?.forEach(({ value, key }) => {
            if (value && legendOptions[key]) {
              if (absolute) {
                temp[index][`${key} ${LAST_YEAR}`] = Number(value);
              } else {
                temp[index][`${key} ${LAST_YEAR}`] += Number(
                  ((Number(value) * 100) / total).toFixed(1),
                );
              }
            }
          });
        }
      });
    }
    setModifiedData(temp);
  };

  const renderCustomizedLabel = (props: any) => {
    const { x, y, stroke, value } = props;

    return (
      <text x={x} y={y} dy={-4} fill={stroke} fontSize={10} textAnchor="middle">
        {absolute ? value : `${value}%`}
      </text>
    );
  };
  let CustomTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (!active) {
      return <div></div>;
    }

    const data = res?.find((obj) => obj.key === label)?.data || [];

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
          ...payload
            .filter((p: any) => !p.dataKey.includes(LAST_YEAR))
            .sort((a: any, b: any) => b.value - a.value),
          ...(legend
            ?.filter(({ disabled }) => disabled)
            .map(({ key, disabled, currency }) => ({
              dataKey: key,
              color: "#027DBC29",
              value: data.find((obj) => obj.key === key)?.value || 0,
              disabled: disabled,
              currency,
            })) || []),
        ].map((p: any) => {
          const colorObj = legend?.find((obj) => obj.key === p.dataKey);
          let lastYearValue =
            payload.find(
              (obj: any) => obj.dataKey === `${p.dataKey} ${LAST_YEAR}`,
            )?.value || 0;
          if (p.disabled && comparisonData) {
            const obj = comparisonData.find((obj) => obj.key === label);
            if (obj?.data?.length) {
              lastYearValue =
                obj.data.find((obj) => obj.key === p.dataKey)?.value || 0;
            }
          }
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
                    background: p.color || colorObj?.color,
                    marginRight: 6,
                    whiteSpace: "nowrap",
                  }}
                ></div>
                <span
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {colorObj && colorObj.label ? colorObj?.label : p.dataKey}:
                </span>
              </span>
              <span>
                {comparisonData ? (
                  <>
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
                        value: lastYearValue,
                        currency: p.currency,
                        disabled: p.disabled,
                      })}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        whiteSpace: "nowrap",
                        margin: "0px 8px",
                      }}
                    >
                      {"=>"}
                    </span>
                  </>
                ) : null}
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
      legend={legend?.filter(({ disabled }) => !disabled)}
      childrenDisplay={childrenDisplay}
      width={width}
      legendOptions={legendOptions}
      onChangeLegendOptions={onChangeLegendOptions}
      extraLegends={!!comparisonData}
      referenceDate={referenceDate}
    >
      {modifiedData && modifiedData.length ? (
        <LineChart
          width={modifiedData.length * 160}
          height={280}
          data={modifiedData.sort(
            (a, b) => moment(a.startDate).unix() - moment(b.startDate).unix(),
          )}
          margin={{
            top: 15,
            right: 5,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            padding={{ left: 30, right: 30 }}
          />
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
            <Line
              hide={disabled}
              dataKey={key}
              type="monotone"
              stroke={color}
              key={key}
            />
          ))}
          {comparisonData ? (
            <>
              {legend?.map(({ color, key }) => (
                <Line
                  type="monotone"
                  dataKey={`${key} (Last Year)`}
                  stroke={color}
                  strokeDasharray="5 5"
                />
              ))}
            </>
          ) : null}
        </LineChart>
      ) : null}
    </AppChartWrapper>
  );
}

export default AppLineChart;
