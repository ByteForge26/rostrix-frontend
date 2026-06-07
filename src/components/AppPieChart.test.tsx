import React from "react";
import { render, screen } from "@testing-library/react";
import AppPieChart from "../components/AppPieChart";
import { IAnalyticsKeyValue, ILegend } from "../helper/Interface";

const mockData: IAnalyticsKeyValue[] = [
  { key: "Category A", value: 40 },
  { key: "Category B", value: 60 },
];

const mockLegend: ILegend[] = [
  { key: "Category A", color: "#FF0000", label: "Red" },
  { key: "Category B", color: "#00FF00", label: "Green" },
];

describe("AppPieChart Component", () => {
  test("renders the chart heading", () => {
    render(<AppPieChart res={mockData} heading="Test Pie Chart" />);
    expect(screen.getByText("Test Pie Chart")).toBeInTheDocument();
  });

  test("renders legend if provided", () => {
    render(
      <AppPieChart res={mockData} legend={mockLegend} heading="Legend Test" />
    );
    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getByText("Green")).toBeInTheDocument();
  });

  test("renders PieChart component", () => {
    const { container } = render(
      <AppPieChart res={mockData} heading="Pie Test" />
    );
    expect(container.querySelector(".recharts-pie")).toBeInTheDocument();
  });

  test("calculates total correctly", () => {
    render(
      <AppPieChart res={mockData} heading="Total Calculation Test" absolute />
    );
    expect(mockData.reduce((acc, cur) => acc + cur.value, 0)).toBe(100);
  });
});
