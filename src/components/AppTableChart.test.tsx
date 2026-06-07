import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AppTableChart from "./AppTableChart";
import { IAnalyticsCellKeyValueCategory, ILegend } from "../helper/Interface";
import * as chakraUI from "@chakra-ui/react";
import { Table } from "rsuite";

jest.mock("@chakra-ui/react", () => {
  const original = jest.requireActual("@chakra-ui/react");
  return {
    ...original,
    Flex: ({ children, ...props }: any) => (
      <div data-testid="chakra-flex" {...props}>
        {children}
      </div>
    ),
    Text: ({ children, ...props }: any) => (
      <span data-testid="chakra-text" {...props}>
        {children}
      </span>
    ),
  };
});

jest.mock("rsuite", () => {
  const original = jest.requireActual("rsuite");
  return {
    ...original,
    Table: ({ children, data, onSortColumn, ...props }: any) => {
      const safeProps = Object.entries(props).reduce((acc, [key, value]) => {
        if (typeof value === "boolean") {
          acc[key] = value.toString();
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      return (
        <div data-testid="rsuite-table" {...safeProps}>
          <table>
            <thead>
              <tr data-testid="table-header-row"></tr>
            </thead>
            <tbody>
              {data.map((row: any, index: number) => (
                <tr key={index} data-testid="table-row">
                  {Object.entries(row).map(([key, value]) => (
                    <td key={key} data-testid={`cell-${key}-${index}`}>
                      {value as React.ReactNode}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {children}
          <button
            data-testid="sort-button"
            onClick={() => onSortColumn && onSortColumn("column1", "asc")}
          >
            Sort
          </button>
        </div>
      );
    },
  };
});

jest.mock("./AppChartWrapper", () => {
  return {
    __esModule: true,
    default: ({
      children,
      heading,
      legend,
      legendOptions,
      onChangeLegendOptions,
    }: any) => (
      <div data-testid="app-chart-wrapper" data-heading={heading}>
        {legend && (
          <div data-testid="legend-options">
            {legend.map((item: ILegend) => (
              <button
                key={item.key}
                data-testid={`legend-option-${item.key}`}
                onClick={() =>
                  onChangeLegendOptions(item.key, !legendOptions[item.key])
                }
              >
                {item.key} ({legendOptions[item.key] ? "active" : "inactive"})
              </button>
            ))}
          </div>
        )}
        {children}
      </div>
    ),
  };
});

const mockColumn = ({ children, sortable, fixed, ...props }: any) => {
  const safeProps = {
    ...props,
    "data-sortable": sortable ? "true" : "false",
    "data-fixed": fixed ? "true" : "false",
  };

  return (
    <div data-testid="rsuite-column" {...safeProps}>
      {children}
    </div>
  );
};

const mockHeaderCell = ({ children, style }: any) => (
  <div data-testid="rsuite-header-cell" style={style}>
    {children}
  </div>
);

const mockCell = ({ dataKey }: any) => (
  <div data-testid={`rsuite-cell-${dataKey}`} data-key={dataKey}></div>
);

const mockRes: IAnalyticsCellKeyValueCategory[] = [
  {
    key: "Row1",
    data: [
      { key: "column1", value: 100, category: "category1" },
      { key: "column2", value: 200, category: "category2" },
    ],
  },
  {
    key: "Row2",
    data: [
      { key: "column1", value: 300, category: "category1" },
      { key: "column2", value: 400, category: "category2" },
    ],
  },
];

const mockLegend: ILegend[] = [
  { key: "category1", label: "Category 1", color: "#ff0000" },
  { key: "category2", label: "Category 2", color: "#00ff00" },
];

const setup = (props = {}) => {
  const defaultProps = {
    res: mockRes,
    type: "Row",
    heading: "Test Table",
    legend: mockLegend,
    sort: true,
    absolute: false,
  };

  return render(<AppTableChart {...defaultProps} {...props} />);
};

beforeAll(() => {
  Table.Column = mockColumn;
  Table.HeaderCell = mockHeaderCell;
  Table.Cell = mockCell;
});

describe("AppTableChart", () => {
  it("renders correctly with default props", async () => {
    setup();

    expect(screen.getByTestId("app-chart-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("app-chart-wrapper")).toHaveAttribute(
      "data-heading",
      "Test Table"
    );

    expect(screen.getByTestId("rsuite-table")).toBeInTheDocument();

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(2);
  });

  it("initializes legend options correctly", () => {
    setup();

    const category1Button = screen.getByTestId("legend-option-category1");
    const category2Button = screen.getByTestId("legend-option-category2");

    expect(category1Button).toHaveTextContent("category1 (active)");
    expect(category2Button).toHaveTextContent("category2 (active)");
  });

  it("handles legend option changes", async () => {
    setup();

    const category1Button = screen.getByTestId("legend-option-category1");

    fireEvent.click(category1Button);

    await waitFor(() => {
      expect(category1Button).toHaveTextContent("category1 (inactive)");
    });
  });

  it("handles sorting when sort is enabled", async () => {
    setup();

    const sortButton = screen.getByTestId("sort-button");

    fireEvent.click(sortButton);

    await waitFor(() => {
      expect(screen.getByTestId("rsuite-table")).toBeInTheDocument();
    });
  });

  it("disables sorting when sort prop is false", async () => {
    setup({ sort: false });

    const columnElements = screen.getAllByTestId("rsuite-column");

    columnElements.forEach((column) => {
      expect(column).toHaveAttribute("data-sortable", "false");
    });
  });

  it("displays absolute values when absolute prop is true", async () => {
    setup({ absolute: true });

    await waitFor(() => {
      const row1Column1Cell = screen.getByTestId("cell-column1-0");

      expect(row1Column1Cell.textContent).not.toContain("%");
    });
  });

  it("displays percentage values when absolute prop is false", async () => {
    setup({ absolute: false });

    await waitFor(() => {
      const row1Column1Cell = screen.getByTestId("cell-column1-0");

      expect(row1Column1Cell.textContent).toContain("%");
    });
  });

  it("calculates percentages correctly", async () => {
    setup({ absolute: false });

    await waitFor(() => {
      const row1Column1Cell = screen.getByTestId("cell-column1-0");
      const row1Column2Cell = screen.getByTestId("cell-column2-0");

      expect(row1Column1Cell.textContent).toContain("33.3%");

      expect(row1Column2Cell.textContent).toContain("66.7%");
    });
  });

  it("applies column colors from the legend", async () => {
    setup();

    await waitFor(() => {
      const textElements = screen.getAllByTestId("chakra-text");

      const column1Header = textElements.find(
        (el) => el.textContent === "column1"
      );
      const column2Header = textElements.find(
        (el) => el.textContent === "column2"
      );
      expect(column1Header).toHaveStyle("background: #ff0000");
      expect(column2Header).toHaveStyle("background: #00ff00");
    });
  });
});
