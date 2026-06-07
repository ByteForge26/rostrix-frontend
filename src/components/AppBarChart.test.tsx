import React from "react";
import { render, screen } from "@testing-library/react";
import AppBarChart from "./AppBarChart";
import { IAnalyticsCellKeyValue, ILegend } from "../helper/Interface";

describe("AppBarChart Component", () => {
  const mockData: IAnalyticsCellKeyValue[] = [
    {
      key: "Category A",
      data: [
        { key: "value1", value: 40 },
        { key: "value2", value: 60 },
      ],
    },
    {
      key: "Category B",
      data: [
        { key: "value1", value: 30 },
        { key: "value2", value: 70 },
      ],
    },
  ];

  const mockLegend: ILegend[] = [
    { key: "value1", label: "Value 1", color: "#8884d8" },
    { key: "value2", label: "Value 2", color: "#82ca9d" },
  ];

  it("renders custom tooltip content", () => {
    render(
      <AppBarChart
        res={mockData}
        legend={mockLegend}
        heading="Tooltip Test"
        absolute={true}
      />
    );

    expect(screen.getByText("Tooltip Test")).toBeInTheDocument();
  });
});
