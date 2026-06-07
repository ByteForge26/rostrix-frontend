import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  ICJPRoster,
  IEmpExceedingHours,
  IRoster,
  IRosterDay,
} from "../../helper/Interface";

interface IRosterStore {
  selectedWeek?: number;
  selectedYear?: number;
  selectedMonth?: number;
  selectedDate?: string;
  selectedJobType?: string;
  selectedClusterId?: number;
  selectedPlannedJobId?: number;
  selectedPlannedJobType?: string;
  selectedPlannedSecondaryJobType?: string;
  selectedPlannedMiscWorkId?: number;
  rosterWeekId?: number;
  cjpRosterWeekId?: number;
  draft: IRosterDay[];
  roster?: IRoster;
  cjpRoster?: ICJPRoster;
  isCloneWeekModalOpen?: boolean;
  empExceedingHoursList?: IEmpExceedingHours[];
  cjpDraft?: ICJPRoster["days"];
}

const initialState: IRosterStore = {
  draft: [],
};
const rosterSlice = createSlice({
  name: "roster",
  initialState: initialState,
  reducers: {
    resetRoster: (state) => {
      state.draft = [];
      state.isCloneWeekModalOpen = false;
      state.roster = undefined;
      state.rosterWeekId = undefined;
      state.selectedClusterId = undefined;
      state.selectedPlannedJobId = undefined;
      state.selectedPlannedJobType = undefined;
      state.selectedPlannedSecondaryJobType = undefined;
      state.selectedPlannedMiscWorkId = undefined;
      state.selectedDate = undefined;
      state.selectedJobType = undefined;
      state.selectedMonth = undefined;
      state.selectedWeek = undefined;
      state.selectedYear = undefined;
      state.empExceedingHoursList = undefined;
      state.cjpRoster = undefined;
      state.cjpRosterWeekId = undefined;
      state.cjpDraft = undefined;
    },
    updateSelectedWeek: (state, action: PayloadAction<number>) => {
      state.selectedWeek = action.payload;
    },
    updateSelectedYear: (state, action: PayloadAction<number>) => {
      state.selectedYear = action.payload;
    },
    updateSelectedMonth: (state, action: PayloadAction<number>) => {
      state.selectedMonth = action.payload;
    },
    updateSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    updateSelectedJobType: (state, action: PayloadAction<string>) => {
      state.selectedJobType = action.payload;
    },
    updateRosterWeekId: (state, action: PayloadAction<number>) => {
      state.rosterWeekId = action.payload;
    },
    updateCJPRosterWeekId: (state, action: PayloadAction<number>) => {
      state.cjpRosterWeekId = action.payload;
    },
    updateDraft: (state, action: PayloadAction<IRosterDay[]>) => {
      state.draft = action.payload;
    },
    updateCjpDraft: (state, action: PayloadAction<ICJPRoster["days"]>) => {
      state.cjpDraft = action.payload;
    },
    updateRoster: (state, action: PayloadAction<IRoster | undefined>) => {
      state.roster = action.payload;
    },
    updateCJPRoster: (state, action: PayloadAction<ICJPRoster | undefined>) => {
      state.cjpRoster = action.payload;
    },
    updateSelectedClusterId: (state, action: PayloadAction<number>) => {
      state.selectedClusterId = action.payload;
    },
    updateSelectedPlannedJobId: (state, action: PayloadAction<number>) => {
      state.selectedPlannedJobId = action.payload;
    },
    updateSelectedPlannedJobType: (state, action: PayloadAction<string>) => {
      state.selectedPlannedJobType = action.payload;
    },
    updateSelectedPlannedSecondaryJobType: (
      state,
      action: PayloadAction<string>
    ) => {
      state.selectedPlannedSecondaryJobType = action.payload;
    },
    updateSelectedPlannedMiscWorkId: (state, action: PayloadAction<number>) => {
      state.selectedPlannedMiscWorkId = action.payload;
    },
    updateCloneWeekModal: (state, action: PayloadAction<boolean>) => {
      state.isCloneWeekModalOpen = action.payload;
    },
    updateEmpExceedingHoursList: (
      state,
      action: PayloadAction<IEmpExceedingHours[]>
    ) => {
      state.empExceedingHoursList = action.payload;
    },
  },
});

const { reducer } = rosterSlice;
const {
  resetRoster,
  updateSelectedWeek,
  updateDraft,
  updateSelectedDate,
  updateSelectedMonth,
  updateSelectedYear,
  updateSelectedJobType,
  updateRosterWeekId,
  updateRoster,
  updateSelectedClusterId,
  updateSelectedPlannedJobId,
  updateSelectedPlannedJobType,
  updateSelectedPlannedSecondaryJobType,
  updateSelectedPlannedMiscWorkId,
  updateCloneWeekModal,
  updateEmpExceedingHoursList,
  updateCJPRoster,
  updateCJPRosterWeekId,
  updateCjpDraft,
} = rosterSlice.actions;

export {
  reducer as rosterReducer,
  resetRoster,
  updateSelectedWeek,
  updateDraft,
  updateSelectedDate,
  updateSelectedMonth,
  updateSelectedYear,
  updateSelectedJobType,
  updateRosterWeekId,
  updateRoster,
  updateSelectedClusterId,
  updateSelectedPlannedJobId,
  updateSelectedPlannedJobType,
  updateSelectedPlannedSecondaryJobType,
  updateSelectedPlannedMiscWorkId,
  updateCloneWeekModal,
  updateEmpExceedingHoursList,
  updateCJPRoster,
  updateCJPRosterWeekId,
  updateCjpDraft,
};
