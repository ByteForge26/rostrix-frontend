import { Flex, Text } from "@chakra-ui/react";
import { Table } from "rsuite";
import React, { useEffect, useState } from "react";
import { IAnalyticsCellKeyValueCategory, ILegend } from "../helper/Interface";
import AppChartWrapper from "./AppChartWrapper";
import {
  BsSortAlphaDown,
  BsSortNumericDown,
  BsSortNumericDownAlt,
  BsSortNumericUp,
} from "react-icons/bs";

function AppTableChart(props: {
  res: IAnalyticsCellKeyValueCategory[];
  type: string;
  legend?: ILegend[];
  heading: string;
  width?: string;
  childrenDisplay?: string;
  sort?: boolean;
  absolute?: boolean;
}) {
  const { Column, HeaderCell, Cell } = Table;
  const { res, type, heading, childrenDisplay, legend, width, sort, absolute } =
    props;
  const [sortValue, setSortValue] = useState("");
  const [legendOptions, setLegendOptions] = useState<Record<string, boolean>>(
    {},
  );
  const [columns, setColumns] = useState<
    {
      fixed: boolean;
      key: string;
      label: string;
      width: number;
      color: string;
    }[]
  >([]);
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    getColumns();
  }, [res, type, legend, legendOptions, absolute, sort]);

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
    getData();
  }, [columns, sort]);

  const getColumns = () => {
    let columns: {
      fixed: boolean;
      key: string;
      label: string;
      width: number;
      color: string;
    }[] = [
      {
        fixed: true,
        key: type,
        label: type,
        width: 220,
        color: "",
      },
    ];
    let obj: Record<string, string> = {};
    res.forEach(({ data }) => {
      data
        .filter(({ category }) => legendOptions[category])
        .forEach(({ key, category }) => {
          obj[key] = category;
        });
    });
    Object.keys(obj).forEach((key) => {
      columns.push({
        fixed: false,
        key: key,
        label: key,
        width: 160,
        color: legend?.find((o) => o.key === obj[key])?.color || "",
      });
    });
    setColumns(columns);
  };

  const getData = () => {
    let objArr: any[] = [];

    res.forEach(({ key, data }) => {
      let obj: Record<string, string> = {};
      columns.forEach(({ key }) => {
        obj[key] = absolute ? "0" : "0%";
      });
      obj[type] = key;
      let total = 0;
      data?.forEach(({ value }) => {
        total += value;
      });
      data.forEach(({ key, value }) => {
        obj[key] = absolute
          ? value.toString()
          : `${Number((value * 100) / total).toFixed(1)}%`;
      });
      objArr.push(obj);
    });

    setData(objArr);
  };
  const onChangeLegendOptions = (key: string, value: boolean) => {
    setLegendOptions((old) => ({ ...old, [key]: value }));
  };

  const sortFn = (a: any, b: any) => {
    if (sortValue) {
      const sortColumn = sortValue.split("__")[0];
      const sortType = sortValue.split("__")[1];
      if (sortType === "asc") {
        return (
          Number((a[sortColumn] || "1").replace("%", "")) -
          Number((b[sortColumn] || "1").replace("%", ""))
        );
      }
      return (
        Number((b[sortColumn] || "1").replace("%", "")) -
        Number((a[sortColumn] || "1").replace("%", ""))
      );
    }
    return 0;
  };
  return (
    <AppChartWrapper
      heading={heading}
      legend={legend}
      childrenDisplay={childrenDisplay}
      width={width}
      legendOptions={legendOptions}
      onChangeLegendOptions={onChangeLegendOptions}
    >
      <Flex width={"full"}>
        <Table
          data={data.sort(sortFn)}
          style={{
            width: "100%",
            textAlign: "center",
          }}
          bordered
          cellBordered
          headerHeight={44}
          height={280}
          onSortColumn={(sortColumn, sortType) => {
            if (!sort) {
              return;
            }
            if (!sortValue) {
              setSortValue(`${sortColumn}__${sortType}`);
            } else if (sortValue.split("__")[0] === sortColumn) {
              setSortValue(
                `${sortColumn}__${
                  sortValue.split("__")[1] === "asc" ? "desc" : "asc"
                }`,
              );
            } else {
              setSortValue(`${sortColumn}__${sortType}`);
            }
          }}
        >
          {columns.map((column) => {
            const { key, label, color, ...rest } = column;
            return (
              <Column
                {...rest}
                key={key}
                sortable={!sort ? false : type !== key}
              >
                <HeaderCell
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    fontWeight={"medium"}
                    style={{
                      background: color ? color : "transparent",
                      color: color ? "white" : "unset",
                      width: "fit-content",
                      padding: color ? "2px 8px" : "0px",
                      borderRadius: 4,
                      marginLeft:
                        type !== key && sortValue.split("__")[0] === key
                          ? 16
                          : 0,
                    }}
                  >
                    {label}
                  </Text>
                  {type !== key && sortValue.split("__")[0] === key ? (
                    <>
                      {sortValue.split("__")[1] === "asc" ? (
                        <BsSortNumericUp
                          style={{
                            marginLeft: "4px",
                            color: "black",
                          }}
                        />
                      ) : (
                        <BsSortNumericDownAlt
                          style={{
                            marginLeft: "4px",
                            color: "black",
                          }}
                        />
                      )}
                    </>
                  ) : null}
                </HeaderCell>
                <Cell dataKey={key} />
              </Column>
            );
          })}
        </Table>
      </Flex>
    </AppChartWrapper>
  );
}

export default AppTableChart;
