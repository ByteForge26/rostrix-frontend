import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { Menu } from "@chakra-ui/react"; // ✅ Import Menu

import CJPShiftDetails from "./CJPShiftDetails";
import { IClusterResponse } from "../../../helper/Interface";

const mockOnSaveShift = jest.fn();
const mockOnClose = jest.fn();
const mockClusters: IClusterResponse[] = [
  {
    id: 1,
    name: "Cluster 1",
    sportIds: [],
    costCentre: "",
    leaderEmpId: "",
    leaderEmpName: "",
    editable: true,
  },
  {
    id: 2,
    name: "Cluster 2",
    sportIds: [],
    costCentre: "",
    leaderEmpId: "",
    leaderEmpName: "",
    editable: true,
  },
];

const renderWithMenu = (ui: React.ReactElement) => {
  return render(
    <Menu> {/* ✅ Wrap component in Menu */}
      {ui}
    </Menu>
  );
};

describe("CJPShiftDetails Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders component with correct title when adding a shift", () => {
    renderWithMenu(
      <CJPShiftDetails
        onSaveShift={mockOnSaveShift}
        startTime="08:00:00"
        clusters={mockClusters}
        clusterId={1}
        onClose={mockOnClose}
        message=""
      />
    );
    expect(screen.getByText("Add Shift Details")).toBeInTheDocument();
  });

  test("renders component with correct title when editing a shift", () => {
    renderWithMenu(
      <CJPShiftDetails
        onSaveShift={mockOnSaveShift}
        startTime="08:00:00"
        endTime="12:00:00"
        id={1}
        clusters={mockClusters}
        clusterId={1}
        onClose={mockOnClose}
        message=""
      />
    );
    expect(screen.getByText("Edit Shift Details")).toBeInTheDocument();
  });

  test("displays error message when provided", () => {
    renderWithMenu(
      <CJPShiftDetails
        onSaveShift={mockOnSaveShift}
        startTime="08:00:00"
        clusters={mockClusters}
        onClose={mockOnClose}
        message="Error message here"
      />
    );
    expect(screen.getByText("Error message here")).toBeInTheDocument();
  });
});
