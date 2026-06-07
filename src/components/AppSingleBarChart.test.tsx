import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AppSingleBarChart from "./AppSingleBarChart";
import { IAnalyticsKeyValue, ILegend } from "../helper/Interface";
jest.mock("./AppChartWrapper", () => {
  return ({ children, heading, legend, onChangeSortValue, sortValue }) => (
    <div data-testid="chart-wrapper">
      <div data-testid="heading">{heading}</div>
      <div data-testid="legend">{legend[0].label}</div>
      <select
        data-testid="sort-selector"
        value={sortValue}
        onChange={(e) => onChangeSortValue(e.target.value)}
      >
        <option value={`${legend[0].key}__H2L`}>High to Low</option>
        <option value={`${legend[0].key}__L2H`}>Low to High</option>
      </select>
      {children}
    </div>
  );
});

jest.mock("recharts", () => {
  const OriginalModule = jest.requireActual("recharts");
  return {
    ...OriginalModule,
    BarChart: ({ children, data, width, height }) => (
      <div
        data-testid="bar-chart"
        data-width={width}
        data-height={height}
        data-items={data.length}
      >
        {children}
      </div>
    ),
    Bar: ({ children, dataKey, fill }) => (
      <div data-testid="bar" data-key={dataKey} data-fill={fill}>
        {children}
      </div>
    ),
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    XAxis: ({ dataKey }) => <div data-testid="x-axis" data-key={dataKey} />,
    YAxis: ({ tickFormatter }) => {
      const formattedValue = tickFormatter ? tickFormatter(10) : 10;
      return <div data-testid="y-axis" data-formatted-value={formattedValue} />;
    },
    Tooltip: ({ content }) => (
      <div data-testid="tooltip">{content && "Custom"}</div>
    ),
    LabelList: ({ dataKey, content }) => (
      <div data-testid="label-list" data-key={dataKey} />
    ),
    Legend: () => <div data-testid="legend-component" />,
  };
});

describe("AppSingleBarChart", () => {
  const defaultProps = {
    res: [
      { key: "A", value: 200 },
      { key: "B", value: 300 },
      { key: "C", value: 500 },
    ] as IAnalyticsKeyValue[],
    legend: {
      key: "amount",
      label: "Amount",
      color: "#8884d8",
    } as ILegend,
    heading: "Test Chart",
    width: "100%",
    childrenDisplay: "block",
    sort: true,
    absolute: false,
  };

  test("renders with percentage values by default", async () => {
    render(<AppSingleBarChart {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("chart-wrapper")).toBeInTheDocument();
      expect(screen.getByTestId("heading")).toHaveTextContent("Test Chart");
      expect(screen.getByTestId("legend")).toHaveTextContent("Amount");
    });

    const yAxis = screen.getByTestId("y-axis");
    expect(yAxis).toHaveAttribute("data-formatted-value", "10%");
  });

  test("renders with absolute values when absolute prop is true", async () => {
    render(<AppSingleBarChart {...defaultProps} absolute={true} />);

    await waitFor(() => {
      const yAxis = screen.getByTestId("y-axis");
      expect(yAxis).toHaveAttribute("data-formatted-value", "10");
    });
  });

  test("correctly calculates percentage values", async () => {
    const { rerender } = render(<AppSingleBarChart {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    expect(screen.getByTestId("bar-chart")).toHaveAttribute("data-items", "3");

    const newProps = {
      ...defaultProps,
      res: [
        { key: "A", value: 50 },
        { key: "B", value: 50 },
      ] as IAnalyticsKeyValue[],
    };

    rerender(<AppSingleBarChart {...newProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toHaveAttribute(
        "data-items",
        "2"
      );
    });
  });

  test("handles sorting functionality", async () => {
    render(<AppSingleBarChart {...defaultProps} />);

    const sortSelector = screen.getByTestId("sort-selector");
    expect(sortSelector).toHaveValue(`${defaultProps.legend.key}__H2L`);

    fireEvent.change(sortSelector, {
      target: { value: `${defaultProps.legend.key}__L2H` },
    });

    expect(sortSelector).toHaveValue(`${defaultProps.legend.key}__L2H`);
  });

  test("renders correct bar width based on data length", async () => {
    render(<AppSingleBarChart {...defaultProps} />);

    await waitFor(() => {
      const barChart = screen.getByTestId("bar-chart");
      expect(barChart).toHaveAttribute("data-width", "360");
    });

    const newProps = {
      ...defaultProps,
      res: [
        { key: "A", value: 100 },
        { key: "B", value: 200 },
        { key: "C", value: 300 },
        { key: "D", value: 400 },
      ] as IAnalyticsKeyValue[],
    };

    const { rerender } = render(<AppSingleBarChart {...newProps} />);

    waitFor(() => {
      const barChart = screen.getByTestId("bar-chart");
      expect(barChart).toHaveAttribute("data-width", "480");
    });
  });

  test("handles zero values properly", async () => {
    const props = {
      ...defaultProps,
      res: [
        { key: "A", value: 0 },
        { key: "B", value: 100 },
        { key: "C", value: 0 },
      ] as IAnalyticsKeyValue[],
    };

    render(<AppSingleBarChart {...props} />);

    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
      expect(screen.getByTestId("bar-chart")).toHaveAttribute(
        "data-items",
        "3"
      );
    });
  });

  test("does not render chart when there is no data", () => {
    const props = {
      ...defaultProps,
      res: [] as IAnalyticsKeyValue[],
    };

    render(<AppSingleBarChart {...props} />);

    expect(screen.queryByTestId("bar-chart")).not.toBeInTheDocument();
  });

  test("applies correct color from legend", async () => {
    const customProps = {
      ...defaultProps,
      legend: {
        ...defaultProps.legend,
        color: "#FF5733",
      },
    };

    render(<AppSingleBarChart {...customProps} />);

    await waitFor(() => {
      const bar = screen.getByTestId("bar");
      expect(bar).toHaveAttribute("data-fill", "#FF5733");
    });
  });

  test("initializes with no sort when sort prop is false", async () => {
    render(<AppSingleBarChart {...defaultProps} sort={false} />);

    await waitFor(() => {
      const sortSelector = screen.getByTestId("sort-selector");
    });
  });

  test("correctly formats decimal values", async () => {
    const props = {
      ...defaultProps,
      res: [
        { key: "A", value: 33.33 },
        { key: "B", value: 66.67 },
      ] as IAnalyticsKeyValue[],
    };

    render(<AppSingleBarChart {...props} absolute={true} />);

    await waitFor(() => {
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });
  });
});
