import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import BottomBar from "./BottomBar";
import { IMiscWork } from "../../../helper/Interface";
import { DRAG_TYPE } from "../../../helper/Constant";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const mockMiscWorks: IMiscWork[] = [
  { id: 1, name: "Task A" },
  { id: 2, name: "Task B" },
  { id: 3, name: "Task C" },
  { id: 4, name: "Task D" },
  { id: 5, name: "Task E" },
  { id: 6, name: "Task F" },
  { id: 7, name: "Task G" },
  { id: 8, name: "Task H" },
  { id: 9, name: "Task I" },
];

describe("BottomBar Component", () => {
  it("renders the BottomBar with limited misc works", () => {
    render(
      <DndProvider backend={HTML5Backend}>
        <BottomBar miscWorks={mockMiscWorks} />
      </DndProvider>
    );
    for (let i = 0; i < 7; i++) {
      expect(screen.getByText(mockMiscWorks[i].name)).toBeInTheDocument();
    }
    expect(screen.getByText("+ 2 More")).toBeInTheDocument();
  });

  it("expands to show all misc works when 'Show More' is clicked", () => {
    render(
      <DndProvider backend={HTML5Backend}>
        <BottomBar miscWorks={mockMiscWorks} />
      </DndProvider>
    );

    const showMoreButton = screen.getByText("+ 2 More");
    fireEvent.click(showMoreButton);
    for (let i = 0; i < mockMiscWorks.length; i++) {
      expect(screen.getByText(mockMiscWorks[i].name)).toBeInTheDocument();
    }
    expect(screen.getByText("Show Less")).toBeInTheDocument();
  });

  it("collapses to show only limited misc works when 'Show Less' is clicked", () => {
    render(
      <DndProvider backend={HTML5Backend}>
        <BottomBar miscWorks={mockMiscWorks} />
      </DndProvider>
    );

    const showMoreButton = screen.getByText("+ 2 More");
    fireEvent.click(showMoreButton);
    const showLessButton = screen.getByText("Show Less");
    fireEvent.click(showLessButton);
    for (let i = 0; i < 7; i++) {
      expect(screen.getByText(mockMiscWorks[i].name)).toBeInTheDocument();
    }
    for (let i = 7; i < mockMiscWorks.length; i++) {
      expect(screen.queryByText(mockMiscWorks[i].name)).toBeNull();
    }
    expect(screen.getByText("+ 2 More")).toBeInTheDocument();
  });
});
