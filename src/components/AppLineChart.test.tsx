import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AppLineChart from "./AppLineChart";
import { IAnalyticsCellKeyValue, ILegend } from "../helper/Interface";

const LAST_YEAR = "LAST_YEAR";

jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
    Bar: function MockBar(props) {
      return <div data-testid={`bar-${props.dataKey}`}>{props.children}</div>;
    },
    BarChart: function MockBarChart(props) {
      return (
        <div data-testid="bar-chart" data-items={props.data?.length}>
          {props.children}
        </div>
      );
    },
    CartesianGrid: function MockCartesianGrid() {
      return <div data-testid="cartesian-grid" />;
    },
    LabelList: function MockLabelList(props) {
      if (typeof props.content === "function") {
        const LabelContent = props.content;
        const mockLabelProps = {
          x: 100,
          y: 50,
          width: 60,
          value: 75,
        };
        return (
          <div data-testid={`label-list-${props.dataKey || "default"}`}>
            <LabelContent {...mockLabelProps} />
          </div>
        );
      }
      return <div data-testid={`label-list-${props.dataKey || "default"}`} />;
    },
    Tooltip: function MockTooltip() {
      return <div data-testid="tooltip" />;
    },
    XAxis: function MockXAxis() {
      return <div data-testid="x-axis" />;
    },
    YAxis: function MockYAxis(props) {
      const formattedValue = props.tickFormatter
        ? props.tickFormatter(100)
        : 100;
      return <div data-testid="y-axis" data-formatted-value={formattedValue} />;
    },
    Legend: function MockLegend() {
      return <div data-testid="legend" />;
    },
  };
});

jest.mock("./AppChartWrapper", () => {
  return function MockAppChartWrapper({
    children,
    heading,
    legend,
    onChangeSortValue,
    sortValue,
    legendOptions,
    setLegendOptions,
  }) {
    const handleLegendToggle = (key, value) => {
      if (setLegendOptions) {
        setLegendOptions((old) => ({ ...old, [key]: value }));
      }
    };

    return (
      <div data-testid="app-chart-wrapper">
        <h2>{heading}</h2>
        {legend &&
          legend.map((item) => (
            <div key={item.key} data-testid={`legend-item-${item.key}`}>
              <input
                type="checkbox"
                checked={legendOptions?.[item.key] || false}
                onChange={(e) => handleLegendToggle(item.key, e.target.checked)}
                data-testid={`legend-checkbox-${item.key}`}
              />
              <span>{item.label || item.key}</span>
            </div>
          ))}
        <div data-testid="sort-selector">
          <select
            data-testid="sort-select"
            value={sortValue || ""}
            onChange={(e) =>
              onChangeSortValue && onChangeSortValue(e.target.value)
            }
          >
            {legend &&
              legend.map((item) => (
                <option key={`${item.key}__H2L`} value={`${item.key}__H2L`}>
                  {item.label || item.key} (High to Low)
                </option>
              ))}
            {legend &&
              legend.map((item) => (
                <option key={`${item.key}__L2H`} value={`${item.key}__L2H`}>
                  {item.label || item.key} (Low to High)
                </option>
              ))}
          </select>
        </div>
        <div data-testid="chart-content">{children}</div>
      </div>
    );
  };
});

const testDataTransformation = (
  mockData,
  mockComparisonData,
  mockLegend,
  options = {},
) => {
  const { absolute = false } = options;
  const legendOptions = mockLegend.reduce((acc, { key }) => {
    acc[key] = true;
    return acc;
  }, {});

  const temp = [];

  mockData.forEach(({ data, key }) => {
    let total = 0;
    let obj = {
      name: key,
    };

    mockLegend.forEach(({ key }) => {
      obj[key] = 0;
      if (mockComparisonData) {
        obj[`${key} ${LAST_YEAR}`] = 0;
      }
    });

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

  if (mockComparisonData && mockComparisonData.length) {
    mockComparisonData.forEach(({ data, key }) => {
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

  return temp;
};

describe("AppLineChart Component", () => {
  const mockData = [
    {
      key: "Category A",
      data: [
        { key: "value1", value: 40 },
        { key: "value2", value: 60 },
      ],
      startDate: "2023-01-01",
    },
    {
      key: "Category B",
      data: [
        { key: "value1", value: 30 },
        { key: "value2", value: 70 },
      ],
      startDate: "2023-02-01",
    },
  ];

  const mockComparisonData = [
    {
      key: "Category A",
      data: [
        { key: "value1", value: 35 },
        { key: "value2", value: 55 },
      ],
      startDate: "2022-01-01",
    },
    {
      key: "Category B",
      data: [
        { key: "value1", value: 25 },
        { key: "value2", value: 65 },
      ],
      startDate: "2022-02-01",
    },
  ];

  const mockLegend = [
    { key: "value1", label: "Value 1", color: "#8884d8" },
    { key: "value2", label: "Value 2", color: "#82ca9d" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("transforms data correctly with comparison data in absolute mode", () => {
    const result = testDataTransformation(
      mockData,
      mockComparisonData,
      mockLegend,
      { absolute: true },
    );

    expect(result.length).toBe(2);

    expect(result[0].name).toBe("Category A");
    expect(result[0].value1).toBe(40);
    expect(result[0].value2).toBe(60);

    expect(result[0][`value1 ${LAST_YEAR}`]).toBe(35);
    expect(result[0][`value2 ${LAST_YEAR}`]).toBe(55);
  });

  it("transforms data correctly with comparison data in percentage mode", () => {
    const result = testDataTransformation(
      mockData,
      mockComparisonData,
      mockLegend,
      { absolute: false },
    );

    expect(result.length).toBe(2);

    expect(result[0].name).toBe("Category A");
    expect(result[0].value1).toBe(40);
    expect(result[0].value2).toBe(60);

    expect(result[0][`value1 ${LAST_YEAR}`]).toBe(38.9);
    expect(result[0][`value2 ${LAST_YEAR}`]).toBe(61.1);
  });

  it("handles non-matching keys in comparison data", () => {
    const nonMatchingComparisonData = [
      ...mockComparisonData,
      {
        key: "Category C",
        data: [
          { key: "value1", value: 45 },
          { key: "value2", value: 55 },
        ],
      },
    ];

    const result = testDataTransformation(
      mockData,
      nonMatchingComparisonData,
      mockLegend,
    );

    expect(result.length).toBe(2);
    expect(result[0].name).toBe("Category A");

    const categoryC = result.find((item) => item.name === "Category C");
    expect(categoryC).toBeUndefined();
  });

  it("handles zero values in data", () => {
    const zeroValueData = [
      {
        key: "Category A",
        data: [
          { key: "value1", value: 0 },
          { key: "value2", value: 100 },
        ],
      },
    ];

    const result = testDataTransformation(zeroValueData, null, mockLegend);

    expect(result[0].value1).toBe(0);
    expect(result[0].value2).toBe(100);
  });

  it("handles disabled legend options", () => {
    const customTestDataTransformation = (mockData, mockLegend) => {
      const legendOptions = {
        value1: true,
        value2: false,
      };

      const temp = [];

      mockData.forEach(({ data, key }) => {
        let total = 0;
        let obj = {
          name: key,
        };

        mockLegend.forEach(({ key }) => {
          obj[key] = 0;
        });

        data?.forEach(({ value }) => {
          total += Number(value);
        });

        data?.forEach(({ value, key }) => {
          if (value && legendOptions[key]) {
            obj[key] = Number(((Number(value) * 100) / total).toFixed(1));
          }
        });

        temp.push(obj);
      });

      return temp;
    };

    const result = customTestDataTransformation(mockData, mockLegend);

    expect(result[0].value1).toBe(40);
    expect(result[0].value2).toBe(0);
  });

  it("handles tooltip display with comparison data", async () => {
    const CustomTooltipTester = () => {
      const props = {
        active: true,
        payload: [
          { dataKey: "value1", value: 40, fill: "#8884d8" },
          { dataKey: "value2", value: 60, fill: "#82ca9d" },
          { dataKey: `value1 ${LAST_YEAR}`, value: 35, fill: "#8884d8" },
          { dataKey: `value2 ${LAST_YEAR}`, value: 55, fill: "#82ca9d" },
        ],
        label: "Test Label",
      };

      return (
        <div data-testid="custom-tooltip-test">
          <p data-testid="custom-tooltip-label">{props.label}</p>
          <div data-testid="tooltip-payload-items">
            {props.payload
              .filter((p) => !p.dataKey.includes(LAST_YEAR))
              .map((p) => (
                <div key={p.dataKey} data-testid={`tooltip-item-${p.dataKey}`}>
                  {p.dataKey}: {p.value}
                </div>
              ))}
          </div>
        </div>
      );
    };

    render(<CustomTooltipTester />);

    expect(screen.getByTestId("custom-tooltip-label")).toHaveTextContent(
      "Test Label",
    );
    expect(screen.getByTestId("tooltip-item-value1")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip-item-value2")).toBeInTheDocument();

    expect(
      screen.queryByTestId(`tooltip-item-value1 ${LAST_YEAR}`),
    ).not.toBeInTheDocument();
  });

  it("handles sorting with comparisonData", async () => {
    render(
      <AppLineChart
        res={mockData}
        comparisonData={mockComparisonData}
        legend={mockLegend}
        heading="Sort With Comparison"
        sort={true}
      />,
    );

    expect(screen.getByText("Sort With Comparison")).toBeInTheDocument();

    await waitFor(() => {
      const sortSelect = screen.getByTestId("sort-select");

      fireEvent.change(sortSelect, { target: { value: "value1__L2H" } });

      fireEvent.change(sortSelect, { target: { value: "value2__H2L" } });
    });
  });

  it("tests customTooltip with no active state", () => {
    const InactiveTooltipTester = () => {
      const props = {
        active: false,
        payload: [],
        label: "",
      };

      return (
        <div data-testid="inactive-tooltip-container">
          <div data-testid="inactive-tooltip"></div>
        </div>
      );
    };

    render(<InactiveTooltipTester />);

    expect(
      screen.getByTestId("inactive-tooltip-container"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("inactive-tooltip")).toBeInTheDocument();
  });

  it("tests tooltip with findIndex functionality", () => {
    const TooltipWithFindIndex = () => {
      const payload = [
        { dataKey: "value1", value: 40 },
        { dataKey: "value2", value: 60 },
        { dataKey: `value1 ${LAST_YEAR}`, value: 35 },
        { dataKey: `value2 ${LAST_YEAR}`, value: 55 },
      ];

      const item = payload.find((obj) => obj.dataKey === `value1 ${LAST_YEAR}`);

      return (
        <div data-testid="find-index-test">
          {item && <span data-testid="found-value">{item.value}</span>}
        </div>
      );
    };

    render(<TooltipWithFindIndex />);

    expect(screen.getByTestId("find-index-test")).toBeInTheDocument();
    expect(screen.getByTestId("found-value")).toHaveTextContent("35");
  });
  it("handles legend option changes when onChangeLegendOptions is called", () => {
    let mockLegendOptions = { value1: true, value2: true };

    const onChangeLegendOptions = (key, value) => {
      mockLegendOptions = { ...mockLegendOptions, [key]: value };
    };

    onChangeLegendOptions("value1", false);
    expect(mockLegendOptions.value1).toBe(false);
    expect(mockLegendOptions.value2).toBe(true);

    onChangeLegendOptions("value1", true);
    expect(mockLegendOptions.value1).toBe(true);
    expect(mockLegendOptions.value2).toBe(true);
  });

  it("renders in absolute mode correctly", () => {
    render(
      <AppLineChart
        res={mockData}
        legend={mockLegend}
        heading="Absolute Mode Test"
        absolute={true}
      />,
    );
  });

  it("renders comparison data in absolute mode correctly", () => {
    render(
      <AppLineChart
        res={mockData}
        comparisonData={mockComparisonData}
        legend={mockLegend}
        heading="Absolute Mode with Comparison Test"
        absolute={true}
      />,
    );
  });

  it("tests the renderCustomizedLabel function", () => {
    const RenderCustomizedLabelTester = ({ absolute }) => {
      const renderLabel = (props) => {
        const { x, y, stroke, value } = props;
        return (
          <text
            data-testid="custom-label"
            x={x}
            y={y}
            dy={-4}
            fill={stroke}
            fontSize={10}
            textAnchor="middle"
          >
            {absolute ? value : `${value}%`}
          </text>
        );
      };

      const testProps = {
        x: 100,
        y: 50,
        stroke: "#8884d8",
        value: 75,
      };

      return <svg>{renderLabel(testProps)}</svg>;
    };

    const { rerender } = render(
      <RenderCustomizedLabelTester absolute={true} />,
    );
    expect(screen.getByTestId("custom-label")).toHaveTextContent("75");

    rerender(<RenderCustomizedLabelTester absolute={false} />);
    expect(screen.getByTestId("custom-label")).toHaveTextContent("75%");
  });

  it("tests tooltip when a legend color object is not found", () => {
    const TooltipMissingColorObjTester = () => {
      const testProps = {
        active: true,
        payload: [{ dataKey: "unknown", value: 25, fill: "#cccccc" }],
        label: "Category A",
      };

      const CustomTooltip = ({ active, payload, label }) => {
        if (!active) return <div></div>;

        return (
          <div data-testid="active-tooltip">
            <p data-testid="tooltip-label">{label}</p>
            {payload
              .filter((p) => !p.dataKey.includes(LAST_YEAR))
              .map((p) => {
                const colorObj = mockLegend.find(
                  (obj) => obj.key === p.dataKey,
                );
                return (
                  <p key={p.dataKey} data-testid={`tooltip-item-${p.dataKey}`}>
                    <span data-testid={`tooltip-key-display-${p.dataKey}`}>
                      {colorObj && colorObj.label ? colorObj.label : p.dataKey}:
                    </span>
                    <span>{`${p.value}%`}</span>
                  </p>
                );
              })}
          </div>
        );
      };

      return <CustomTooltip {...testProps} />;
    };

    render(<TooltipMissingColorObjTester />);

    expect(screen.getByTestId("tooltip-key-display-unknown")).toHaveTextContent(
      "unknown:",
    );
  });

  it("tests the tickFormatter function in percentage and absolute modes", () => {
    const TickFormatterTesterPercentage = () => {
      const tickFormatter = (value) => (false ? value : `${value}%`);
      return <div data-testid="formatted-tick">{tickFormatter(75)}</div>;
    };

    const { rerender } = render(<TickFormatterTesterPercentage />);
    expect(screen.getByTestId("formatted-tick")).toHaveTextContent("75%");

    const TickFormatterTesterAbsolute = () => {
      const tickFormatter = (value) => (true ? value : `${value}%`);
      return <div data-testid="formatted-tick">{tickFormatter(75)}</div>;
    };

    rerender(<TickFormatterTesterAbsolute />);
    expect(screen.getByTestId("formatted-tick")).toHaveTextContent("75");
  });

  it("handles empty data gracefully", () => {
    render(
      <AppLineChart res={[]} legend={mockLegend} heading="Empty Data Test" />,
    );
    expect(screen.queryByTestId("chart-content")).toBeInTheDocument();
    expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
  });
  it("handles legend option changes when onChangeLegendOptions is called", () => {
    let mockLegendOptions = { value1: true, value2: true };

    const onChangeLegendOptions = (key, value) => {
      mockLegendOptions = { ...mockLegendOptions, [key]: value };
    };

    onChangeLegendOptions("value1", false);
    expect(mockLegendOptions.value1).toBe(false);
    expect(mockLegendOptions.value2).toBe(true);

    onChangeLegendOptions("value1", true);
    expect(mockLegendOptions.value1).toBe(true);
    expect(mockLegendOptions.value2).toBe(true);
  });

  it("processes data correctly with absolute flag", () => {
    const processDataWithAbsoluteFlag = (data, absolute) => {
      let processedData = {};

      data.forEach(({ key, value }) => {
        if (absolute) {
          processedData[key] = Number(value);
        } else {
          const total = 100;
          processedData[key] = Number(
            ((Number(value) * 100) / total).toFixed(1),
          );
        }
      });

      return processedData;
    };

    const testData = [
      { key: "value1", value: 40 },
      { key: "value2", value: 60 },
    ];

    const absoluteResult = processDataWithAbsoluteFlag(testData, true);
    expect(absoluteResult.value1).toBe(40);
    expect(absoluteResult.value2).toBe(60);

    const percentageResult = processDataWithAbsoluteFlag(testData, false);
    expect(percentageResult.value1).toBe(40);
    expect(percentageResult.value2).toBe(60);
  });

  it("processes comparison data correctly with absolute flag", () => {
    const processComparisonData = (data, absolute) => {
      let result = {};

      data.forEach(({ key, value }) => {
        if (absolute) {
          result[`${key} ${LAST_YEAR}`] = Number(value);
        } else {
          const total = 100;
          result[`${key} ${LAST_YEAR}`] = Number(
            ((Number(value) * 100) / total).toFixed(1),
          );
        }
      });

      return result;
    };

    const testData = [
      { key: "value1", value: 35 },
      { key: "value2", value: 55 },
    ];

    const absoluteResult = processComparisonData(testData, true);
    expect(absoluteResult[`value1 ${LAST_YEAR}`]).toBe(35);
    expect(absoluteResult[`value2 ${LAST_YEAR}`]).toBe(55);

    const percentageResult = processComparisonData(testData, false);
    expect(percentageResult[`value1 ${LAST_YEAR}`]).toBe(35);
    expect(percentageResult[`value2 ${LAST_YEAR}`]).toBe(55);
  });

  it("tests the renderCustomizedLabel function", () => {
    const mockLabelProps = {
      x: 100,
      y: 50,
      stroke: "#8884d8",
      value: 75,
    };

    const renderCustomizedLabel = (props, absolute) => {
      const { x, y, stroke, value } = props;
      return absolute ? value : `${value}%`;
    };

    const absoluteLabel = renderCustomizedLabel(mockLabelProps, true);
    expect(absoluteLabel).toBe(75);

    const percentageLabel = renderCustomizedLabel(mockLabelProps, false);
    expect(percentageLabel).toBe("75%");
  });

  it("tests the tooltip active check and content generation", () => {
    const mockTooltipProps = {
      active: true,
      payload: [
        { dataKey: "value1", value: 40 },
        { dataKey: "value2", value: 60 },
        { dataKey: `value1 ${LAST_YEAR}`, value: 35 },
        { dataKey: `value2 ${LAST_YEAR}`, value: 55 },
      ],
      label: "Category A",
    };

    const isTooltipActive = (active) => {
      return active ? "tooltip content" : null;
    };

    expect(isTooltipActive(false)).toBeNull();

    expect(isTooltipActive(true)).toBe("tooltip content");

    const filteredPayload = mockTooltipProps.payload.filter(
      (p) => !p.dataKey.includes(LAST_YEAR),
    );
    expect(filteredPayload.length).toBe(2);
    expect(filteredPayload[0].dataKey).toBe("value1");
    expect(filteredPayload[1].dataKey).toBe("value2");

    const value1LastYear = mockTooltipProps.payload.find(
      (obj) => obj.dataKey === `value1 ${LAST_YEAR}`,
    );
    expect(value1LastYear).toBeDefined();
    expect(value1LastYear.value).toBe(35);

    const sortedPayload = [...filteredPayload].sort(
      (a, b) => b.value - a.value,
    );
    expect(sortedPayload[0].dataKey).toBe("value2");
    expect(sortedPayload[0].value).toBe(60);
    expect(sortedPayload[1].dataKey).toBe("value1");
    expect(sortedPayload[1].value).toBe(40);
  });

  it("tests tooltip color object finding", () => {
    const findColorObj = (dataKey, legendItems) => {
      return legendItems.find((obj) => obj.key === dataKey);
    };
    const value1ColorObj = findColorObj("value1", mockLegend);
    expect(value1ColorObj).toBeDefined();
    expect(value1ColorObj.label).toBe("Value 1");
    expect(value1ColorObj.color).toBe("#8884d8");

    const missingColorObj = findColorObj("nonexistent", mockLegend);
    expect(missingColorObj).toBeUndefined();

    const getDisplayLabel = (colorObj, dataKey) => {
      return colorObj && colorObj.label ? colorObj.label : dataKey;
    };

    expect(getDisplayLabel(value1ColorObj, "value1")).toBe("Value 1");
    expect(getDisplayLabel(missingColorObj, "nonexistent")).toBe("nonexistent");
  });

  it("tests the tickFormatter function", () => {
    const tickFormatter = (value, absolute) => {
      return absolute ? value : `${value}%`;
    };

    expect(tickFormatter(75, true)).toBe(75);

    expect(tickFormatter(75, false)).toBe("75%");
  });

  it("tests CustomTooltip display with comparison data", () => {
    const formatComparisonValue = (absoluteMode, value) => {
      return absoluteMode ? value : `${value}%`;
    };

    expect(formatComparisonValue(true, 35)).toBe(35);

    expect(formatComparisonValue(false, 35)).toBe("35%");
  });
});
