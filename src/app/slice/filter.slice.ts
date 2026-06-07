import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Option } from "react-multi-select-component";

interface IFilterStore {
  fromDate: string;
  toDate: string;
  tempFromDate: string;
  tempToDate: string;
  selectedZones: Option[];
  selectedCities: Option[];
  selectedCostCenters: Option[];
  selectedClusters: Option[];
  compareLastYear: boolean;
  view: string;
}

const initialState: IFilterStore = {
  fromDate: "",
  toDate: "",
  tempFromDate: "",
  tempToDate: "",
  selectedZones: [],
  selectedCities: [],
  selectedCostCenters: [],
  selectedClusters: [],
  compareLastYear: false,
  view: "",
};

const filterSlice = createSlice({
  name: "filter",
  initialState: initialState,
  reducers: {
    resetFilter: (state) => {
      state.compareLastYear = false;
      state.selectedCities = [];
      state.selectedClusters = [];
      state.selectedCostCenters = [];
      state.selectedZones = [];
      state.fromDate = "";
      state.toDate = "";
      state.tempFromDate = "";
      state.tempToDate = "";
    },
    setCompareLastYear: (state, action: PayloadAction<boolean>) => {
      state.compareLastYear = action.payload;
    },
    setSelectedCities: (state, action: PayloadAction<Option[]>) => {
      state.selectedCities = action.payload;
    },
    setSelectedClusters: (state, action: PayloadAction<Option[]>) => {
      state.selectedClusters = action.payload;
    },
    setSelectedCostCenters: (state, action: PayloadAction<Option[]>) => {
      state.selectedCostCenters = action.payload;
    },
    setSelectedZones: (state, action: PayloadAction<Option[]>) => {
      state.selectedZones = action.payload;
    },
    setFromDate: (state, action: PayloadAction<string>) => {
      state.fromDate = action.payload;
    },
    setToDate: (state, action: PayloadAction<string>) => {
      state.toDate = action.payload;
    },
    setTempFromDate: (state, action: PayloadAction<string>) => {
      state.tempFromDate = action.payload;
    },
    setTempToDate: (state, action: PayloadAction<string>) => {
      state.tempToDate = action.payload;
    },
    setView: (state, action: PayloadAction<string>) => {
      state.view = action.payload;
    },
  },
});

const { reducer } = filterSlice;
const {
  resetFilter,
  setCompareLastYear,
  setSelectedCities,
  setSelectedClusters,
  setSelectedCostCenters,
  setSelectedZones,
  setFromDate,
  setToDate,
  setTempFromDate,
  setTempToDate,
  setView,
} = filterSlice.actions;

export {
  reducer as filterReducer,
  resetFilter,
  setCompareLastYear,
  setSelectedCities,
  setSelectedClusters,
  setSelectedCostCenters,
  setSelectedZones,
  setFromDate,
  setToDate,
  setTempFromDate,
  setTempToDate,
  setView,
};
