import { render, screen } from "@testing-library/react";
import CustomCircle from "./CustomCircle";
import React from "react";

describe("CustomCircle Component", () => {
  it("renders correctly with the provided color", () => {
    const testColor = "#FF5733"; 

    render(<CustomCircle color={testColor} />);
  });
});
