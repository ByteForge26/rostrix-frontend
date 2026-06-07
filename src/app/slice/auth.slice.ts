import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import {
  IRoleResponse,
  IUserTransformedPermissions,
  IUserResponse,
  IContractTypeResponse,
} from "../../helper/Interface";

interface IAuth {
  user?: IUserResponse;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  userRoles?: IRoleResponse[];
  roles?: IRoleResponse[];
  contractTypes?: IContractTypeResponse[];
  isLoggedIn: boolean;
  userTransformedPermissions?: IUserTransformedPermissions[];
  selectedCostCenterName?: string;
  roleLevel?: number;
  fcmToken?: string;
  fcmTokenId?: number;
  ecoMobility?: {
    currentPStartDate: string;
    currentPEndDate: string;
    currentDate: string;
    submitted: boolean;
    empId: IUserResponse["empId"];
  };
  isEcoModalOpen?: boolean;
}

const initialState: IAuth = {
  isLoggedIn: false,
};
const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    resetUser: (state) => {
      state.user = undefined;
      state.accessToken = undefined;
      state.refreshToken = undefined;
      state.isLoggedIn = false;
      state.expiresIn = undefined;
      state.roles = undefined;
      state.contractTypes = undefined;
      state.userRoles = undefined;
      state.selectedCostCenterName = undefined;
      state.userTransformedPermissions = undefined;
      state.roleLevel = undefined;
      state.fcmToken = undefined;
      state.fcmTokenId = undefined;
    },
    updateUser: (state, action: PayloadAction<IUserResponse>) => {
      state.user = action.payload;
    },
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      state.isLoggedIn = true;
    },
    updateRefreshToken: (state, action: PayloadAction<string>) => {
      state.refreshToken = action.payload;
    },
    updateExpiresIn: (state, action: PayloadAction<number>) => {
      state.expiresIn = action.payload;
    },
    updateUserRoles: (state, action: PayloadAction<IRoleResponse[]>) => {
      state.userRoles = action.payload;
    },
    updateRoles: (state, action: PayloadAction<IRoleResponse[]>) => {
      state.roles = action.payload;
    },
    updateContractTypes: (
      state,
      action: PayloadAction<IContractTypeResponse[]>
    ) => {
      state.contractTypes = action.payload;
    },
    updateUserTransformedPermissions: (
      state,
      action: PayloadAction<IUserTransformedPermissions[]>
    ) => {
      state.userTransformedPermissions = action.payload;
    },
    updateSelectedCostCenterName: (state, action: PayloadAction<string>) => {
      state.selectedCostCenterName = action.payload;
    },
    updateRoleLevel: (state, action: PayloadAction<number>) => {
      state.roleLevel = action.payload;
    },
    updateFcmToken: (state, action: PayloadAction<string>) => {
      state.fcmToken = action.payload;
    },
    updateFcmTokenId: (state, action: PayloadAction<number>) => {
      state.fcmTokenId = action.payload;
    },
    updateEcoMobilitySubmission: (
      state,
      action: PayloadAction<IAuth["ecoMobility"]>
    ) => {
      state.ecoMobility = action.payload;
    },
    updateEcoModalOpen: (
      state,
      action: PayloadAction<IAuth["isEcoModalOpen"]>
    ) => {
      state.isEcoModalOpen = action.payload;
    },
  },
});

const { reducer } = authSlice;
const {
  resetUser,
  updateUser,
  updateAccessToken,
  updateRefreshToken,
  updateExpiresIn,
  updateRoles,
  updateContractTypes,
  updateUserRoles,
  updateUserTransformedPermissions,
  updateSelectedCostCenterName,
  updateRoleLevel,
  updateFcmToken,
  updateFcmTokenId,
  updateEcoMobilitySubmission,
  updateEcoModalOpen,
} = authSlice.actions;

export {
  reducer as authReducer,
  resetUser,
  updateUser,
  updateAccessToken,
  updateRefreshToken,
  updateExpiresIn,
  updateRoles,
  updateContractTypes,
  updateUserRoles,
  updateUserTransformedPermissions,
  updateSelectedCostCenterName,
  updateRoleLevel,
  updateFcmToken,
  updateFcmTokenId,
  updateEcoMobilitySubmission,
  updateEcoModalOpen,
};
