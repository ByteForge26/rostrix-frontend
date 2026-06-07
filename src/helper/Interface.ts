export interface IApiResponse {
  success: boolean;
  message: string;
  messages?: {
    messageType: "INFO" | "WARN";
    message: string;
  }[];
  warn?: boolean;
  empExceedingHoursList?: IEmpExceedingHours[];
  empWeeklyExceedingHoursList?: IEmpWeeklyExceedingHours[];
  empDailyExceedingHoursList?: IEmpDailyExceedingHours[];
  weekUncoveredShifts?: IWeekUncoveredShift[];
}
export interface IWeekUncoveredShift {
  week: number;
  year: number;
  dateUncoveredShifts: IDateUncoveredShift[];
}
export interface IDateUncoveredShift {
  date: string;
  uncoveredShifts: IUncoveredShift[];
}
export interface IUncoveredShift {
  miscWorkId: number;
  miscWorkName: string;
  secondaryJobType: string;
  plannedShift: {
    et: string;
    st: string;
  };
  uncoveredPeriods: {
    start: string;
    end: string;
  }[];
}
export interface IAuthResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}
export interface ITokenExchangeResponse {
  accessToken: string;
  expiresIn: number;
  message: string;
  refreshToken: string;
  success: boolean;
}
export interface IUserResponse {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fedId: string;
  empId: string;
  managerId: string;
  costCentreName: string;
  contractTypeId: number;
  contractTypeName: string;
  lastLoginDate: string;
  stateId: number;
  countryId: number;
  userRoles: Record<string, number[]>;
  costCentreDisplayNameMap: Record<string, string>;
  clusterName?: string;
  clusterId?: number;
  userRolesDetails?: {
    costCentre: string;
    roleId: number;
    roleType: string;
  }[];
}

export interface IRoute {
  label: string;
  icon: string;
  path: string;
  children: IRouteChildren[];
}
export interface IRouteChildren {
  isActive: boolean;
  label: string;
  path: string;
  permissionKey: string;
  Component: () => JSX.Element;
  hideFromNav?: boolean;
  isNew?: boolean;
}
export interface IPermissionResponse {
  id: number;
  name: string;
  category: string;
  subCategory: string;
}
export interface IRoleResponse {
  id: number;
  name: string;
  description: string;
  editable: boolean;
  basic: boolean;
  type: string;
  permissions?: IPermissionResponse[];
  title: string;
  deletable: boolean;
  level: number;
  lvlPrimary: boolean;
  assignable: boolean;
}
export interface IUserTransformedPermissions {
  category: string;
  // id: number;
  // isGlobalPermissionForCategory: boolean;
  subCategories: {
    // id: number;
    subCategory: string;
    permissions: {
      name: string;
      id: number;
    }[];
    // isGlobalPermissionForSubCategory: boolean;
  }[];
}
export interface IWeekResponse {
  id: number;
  year: number;
  number: number;
  startDate: string;
  endDate: string;
}
export interface IContractTypeResponse {
  id: number;
  name: string;
  category: string;
  deletable: boolean;
}
export interface IContractType {
  id: number;
  name: string;
  weekOffs?: IWeekOffResponse[];
  workHours?: IWorkHourResponse[];
  leavePolicies?: ILeavePoliciesResponse[];
}
export interface IWeekOffResponse {
  id: number;
  numWeekOff: number;
  effectiveDate: string;
  contractTypeId: number;
}
export interface IWorkHourResponse {
  id: number;
  effectiveDate: string;
  contractTypeId: number;
  week: number;
  day: number;
  month: number;
}
export interface ILeavePoliciesResponse {
  id: number;
  effectiveDate: string;
  contractTypeId: number;
  leavePolicy: string;
}
export interface ICountryResponse {
  id: number;
  name: string;
  code: string;
  capitalName: string;
  phoneCode: string;
  currency: string;
  nationality: string;
}
export interface IStateResponse {
  id: number;
  name: string;
  code: string;
  countryId: number;
  countryName: string;
}
export interface ICityResponse {
  id: number;
  name: string;
  stateName: string;
  stateId: number;
}
export interface IHolidayResponse {
  id: number;
  name: string;
  date: string;
  stateId: number;
}
export interface ISport {
  id: number;
  name: string;
  modifiedDate: string;
}
export interface ICostCenter {
  id: number;
  costCentreName: string;
  displayName: string;
  costCentreZone: string;
  address: string;
  pinCode: number;
  cityId: number;
  stateId: number;
  countryId: number;
  city: string;
  state: string;
  country: string;
  updatedAt: string;
  managerEmpId: string;
  superManagerEmpId: string;
  type: "SERVICES" | "RETAIL";
  disabled: boolean;
}
export interface ICostCenterResponse {
  costCenters: ICostCenter[];
  totalPages: number;
}
export interface ILeaveResponse {
  id: number;
  numLeaves: number;
  effectiveDate: string;
  state: string;
  stateId: string;
}
export interface IMyLeaveResponse {
  totalAllowedLeaves: number;
  stateId: number;
  contractTypeId: number;
  leaves: IMyLeave[];
}
export interface IMyLeave {
  id: number;
  empId: string;
  fromDate: string;
  toDate: string;
  appliedOn: string;
  comment: string;
  status: string;
  type: string;
  authorizedBy: string;
  actedOn: string;
}
export interface IMyWeekOff {
  id: number;
  date: string;
}
export interface IClusterResponse {
  id: number;
  name: string;
  sportIds: number[];
  costCentre: string;
  leaderEmpId: string;
  leaderEmpName: string;
  editable: boolean;
}
export interface IClusterUserResponse {
  firstName: string;
  lastName: string;
  empId: string;
  contractTypeId: number;
  addedDate: string;
}
export interface IMyTeamLeavesResponse {
  empLeaveSummaryList: {
    userId: string;
    empId: string;
    firstName: string;
    lastName: string;
    managerId: string;
    costCentreName: string;
    contractTypeId: number;
    stateId: number;
    totalAllowed: number;
    availedGeneral: number;
    plannedGeneral: number;
    clusterName: string;
    clusterId: number;
    availedLop: number;
    plannedLop: number;
    matOrPatAvailed: boolean;
  }[];
}
export interface ISecondaryJob {
  id: number;
  type: string;
  hourCategory: string;
  description: string;
  allowSubMem: boolean;
  subMemName: string;
}
export interface IStoreSecondaryJob {
  id: number;
  jobType: string;
  costCentre: string;
  coachEmpId?: string;
  firstName?: string;
  lastName?: string;
}
export interface IStoreSecondaryJobEmployee {
  empId: string;
  firstName: string;
  lastName: string;
  contractTypeId: number;
  configId: number;
  type: string;
}
export interface IShift {
  contractTypeId: number;
  costCentre: string;
  endTime: string;
  id: number;
  jobType: string;
  lunchHours: number;
  startTime: string;
  clusterId: number;
}
export interface IRoster {
  rosterWeekId: number;
  empWeekRosters: {
    empId: string;
    fistName: string;
    lastName: string;
    contractId: number;
    days: IRosterDay[];
    allowedHours: number;
    empHours: {
      pendDate: string;
      pstartDate: string;
      totalHours: number;
    }[];
  }[];
  assignedJobShifts: IAssignedJobShift[];
  message: string;
  rosterStatus: string;
  success: boolean;
}
export interface IAssignedJobShift {
  date: string;
  jobs: {
    jobType: string;
    miscWorkId: number;
    type: string;
    shifts: {
      id: number;
      startTime: string;
      endTime: string;
    }[];
  }[];
}
export interface IRosterDay {
  id: number;
  date: string;
  empId: string;
  status: string;
  edit: boolean;
  impacted: boolean;
  subRole?: string;
  impacts: {
    type: string;
    ts: string;
  }[];
  metaData: string;
  main: {
    s: string;
    e: string;
    c: string;
  }[];
  misc?: {
    s: string;
    e: string;
    c: string;
    workId?: number;
    plannedJob?: boolean;
    secondaryJobType?: string;
    type?: string;
  }[];
  others: {
    s: string;
    e: string;
    c: string;
    type: string;
    workId?: number;
    secondaryJobType?: string;
  }[];
}

export interface ICalender {
  row: number;
  column: number;
  date: Date;
  today?: boolean;
  holiday?: string;
  leaveId?: number;
  weekOff?: boolean;
  roster?: boolean;
}
export interface IUserClusterInfoResponse {
  memberOfClusters: number[];
  leaderOfClusters: number[];
}
export interface IMigration {
  migrationEntity: string;
  initialLoadAt: string;
  initLoadSuccess: boolean;

  lastUpdatedAt: string;
  lastManualUpdatedAt: string;

  errorMessage: string;
  manualUpdateErrorMessage: string;

  status: string;
  manualUpdateStatus: string;

  lastSuccessAt: string;
  manualUpdateLastSuccessAt: string;

  updateSuccess: boolean;
  manualUpdateSuccess: boolean;

  refreshEndPointPath: string;
}
export interface IIntegration {
  jobEntity: string;
  dateMode: "NO_DATE" | "RANGE" | "PAY_ROLL";
  costCentreBased: boolean;
  allowedFutureDate: string;
  allowedPastDate: string;
  refreshEndPointPath: string;
  lastScheduleUpdatedAt: string;
  scheduleUpdatedStatus: string;
  manualUpdateStatus: string;
  lastManualUpdatedAt: string;
}
export interface IIntegrationLog {
  id: number;
  dateOfExecution: string;
  executionType: string;
  status: string;
  dateRange: string;
  parameters: string;
  errors: {
    id: number;
    costCentre: string;
    errorMessage: string;
  }[];
}
export interface IMonthSummary {
  month: number;
  status: string;
  publishable: boolean;
  weekList: {
    week: number;
    status: string;
    startDate: string;
    endDate: string;
    initBy: string;
    impacted: boolean;
    initAt: string;
    updatedBy: string;
    updatedAt: string;
    rweekId: number;
  }[];
}

export interface IRosterHookProps {
  viewMode: "LATEST" | "PUBLISHED";
  mode: "edit" | "view" | "summary";
  rosterType: "primary" | "secondary" | "cjp" | "misc" | "secondaryMisc";
}
export interface IMiscWork {
  id: number;
  name: string;
  hourCategory: string;
  disabled?: boolean;
}
export interface IRosterDetails {
  data: {
    firstName: string;
    lastName: string;
    costCentre: string;
    empId: string;
    assignedClusterId: number;
    assignedSJTypes: string[];
    dayStatus: string;
    metaData: string;
    main: {
      s: string;
      e: string;
      c: string;
    }[];
    others: {
      s: string;
      e: string;
      c: string;
      type: string;
    }[];
    misc: {
      s: string;
      e: string;
      c: string;
      workId?: number;
      plannedJob?: boolean;
      secondaryJobType?: string;
    }[];
    secondaryMisc?: {
      s: string;
      e: string;
      c: string;
      workId?: number;
      plannedJob?: boolean;
      type: string;
    }[];

    exited: boolean;
    lastWorkingDate: string;
    costCenterChange: boolean;
    newCostCentre: string;
    costCentreChangeDate: string;
  };
  applicableForChange: boolean;
  message: string;
  success: boolean;
}
export interface IManualHours {
  empId: string;
  fistName: string;
  lastName: string;
  date: string;
  action: string;
  prevHours: number;
  updatedHours: number;
  comment: string;
  modifiedDate: string;
}
export interface IHoursValidate {
  empExceedingHoursList: IEmpExceedingHours[];
}
export interface IEmpExceedingHours {
  empId: string;
  empName: string;

  totalHours: number;
  allowedHours: number;
  pendDate: string;
  pstartDate: string;
}
export interface IEmpWeeklyExceedingHours {
  empId: string;
  empName: string;
  weekNumber: number;
  totalHours: number;
  allowedHours: number;
  wstartDate: string;
  wendDate: string;
}
export interface IEmpDailyExceedingHours {
  empId: string;
  empName: string;
  weekNumber: number;
  workHours: number;
  date: string;
}

export interface IMyWorkHours {
  tempCalculation?: {
    realisedHours: number;
    plannedHours: number;
    totalHours: number;
    realisedWh: number;
    plannedWh: number;
  };
  status: "NOT_PRESENT" | "INTERMEDIATE" | "FINALISED";
  finalized: boolean;
  fnumHours: number;
  fnumLop: number;
  fnumWorkingHolidays: number;
  fmanualHours: number;
  message: string;
}
export interface IMyTeamHours {
  status: "NOT_PRESENT" | "INTERMEDIATE" | "FINALISED";
  message: string;
  success: boolean;
  intermediateWorkHoursList?: {
    contractTypeName: string;
    empId: string;
    name: string;
    numWorkingHolidays: number;
    plannedHours: number;
    plannedWh: number;
    realisedHours: number;
    realisedWh: number;
    totalWorkHours: number;
  }[];

  finalisedWorkHoursList: {
    id: number;
    name: string;
    empId: string;
    contractTypeName: string;
    numWorkingHours: number;
    numWorkingHolidays: number;
    manualHours: number;
    totalHours: number;
    numLop: number;
    approvalStatus: string;
    clusterName: string;
    approvalLogs?: {
      status: string;
      actionTimestamp: string;
      comment: string;
      version: number;
      email: string;
      empId: string;
      name: string;
    }[];
  }[];
}
export interface ISwapRequest {
  id: number;
  costCentre: string;
  weekNo: number;
  clusterId: number;
  clusterName: string;
  jobType: string;
  senderEmpId: string;
  senderName: string;
  receiverEmpId: string;
  receiverName: string;
  senderDate: string;
  receiverDate: string;
  status: string;
  deletedReason: string;
  requestedAt: string;
  approvedAt: string;
  senderShifts: {
    s: string;
    e: string;
    c: string;
    workId?: number;
    type?: string;
  }[];
  receiverShifts: {
    s: string;
    e: string;
    c: string;
    workId?: number;
    type?: string;
  }[];
}
export interface IPayrollConfig {
  currentPStartDateTime: string;
  currentPEndDateTime: string;
  currentManualHourStartTime: string;
  currentManualHourEndTime: string;
  currentPayrollExtractStartTime: string;
}
export interface IAnalyticsKeyValue {
  key: string;
  value: number;
}
export interface IAnalyticsKeyValueCategory extends IAnalyticsKeyValue {
  category: string;
}

export interface IAnalyticsCombinedData {
  byCategory: IAnalyticsKeyValue[];
  byType: IAnalyticsKeyValueCategory[];
}
export interface IAnalyticsCellKeyValue {
  key: string;
  data: IAnalyticsKeyValue[];
}
export interface IAnalyticsCellKeyValueCategory {
  key: string;
  data: IAnalyticsKeyValueCategory[];
}
export interface IAnalyticsData {
  byZone: IAnalyticsKeyValue[];
  byCity: IAnalyticsKeyValue[];
  byStore: IAnalyticsKeyValue[];
  byCluster: IAnalyticsKeyValue[];
}
export interface IAnalyticsCategoryData {
  byZone: IAnalyticsCellKeyValue[];
  byCity: IAnalyticsCellKeyValue[];
  byStore: IAnalyticsCellKeyValue[];
  byCluster: IAnalyticsCellKeyValue[];
}
export interface IAnalyticsWorkTypeData {
  byZone: IAnalyticsCellKeyValueCategory[];
  byCity: IAnalyticsCellKeyValueCategory[];
  byStore: IAnalyticsCellKeyValueCategory[];
  byCluster: IAnalyticsCellKeyValueCategory[];
}

export interface IAnalyticsGrowthCellData {
  key: string;
  data: IAnalyticsKeyValue[];
  startDate: string;
}
export interface IAnalyticsGrowthData {
  data: IAnalyticsGrowthCellData[];
  comparisonData: IAnalyticsGrowthCellData[];
}
export interface IAnalyticsMHContributionData {
  totalHours: number;
  manualHours: number;
  manualHourContribPercentage: number;
  rosteredHours: number;
}
export interface IAnalyticsMHContributionDistData {
  byStore: {
    key: string;
    totalHours: number;
    manualHours: number;
    manualHourContribPercentage: number;
    rosteredHours: number;
  }[];
  byCluster: {
    key: string;
    totalHours: number;
    manualHours: number;
    manualHourContribPercentage: number;
    rosteredHours: number;
  }[];
}
export interface IAnalyticsMHContributionMOMData {
  key: string;
  totalHours: number;
  manualHours: number;
  manualHourContribPercentage: number;
  rosteredHours: number;
  pmonth: string;
}
export interface ILegend {
  color: string;
  key: string;
  label: string;
  disabled?: boolean;
  currency?: boolean;
  recommendedHoursKey?: string;
  recommendedHoursLabel?: string;
  recommendedHoursInfo?: string[];
}
export interface IAnalyticsEffCombinedData {
  pilotedEfficiency: number;
  pilotedProductivity: number;
  realisedEfficiency: number;
  realisedProductivity: number;
}
export interface IDayView {
  clusters: IDayViewJob[];
  secondaryJobs: IDayViewJob[];
  unRosteredClusters?: IDayViewJob[];
}
export interface IDayViewJob {
  name: string;
  totalHours: number;
  empDayShifts: {
    empId: string;
    name: string;
    contractId: number;
    status?: string;
    shifts: {
      s: string;
      e: string;
      type?: string;
      workName?: string;
      workId?: number;
    }[];
  }[];
}
export interface ICalenderHour {
  date: string;
  hours: number;
  status: string;
  type: string;
}
export interface IMyTeamInfo {
  success: boolean;
  message: string;
  userBasicInfoDTOList: {
    userId: string;
    firstName: string;
    lastName: string;
    empId: string;
    email: string;
    costCentreName: string;
    contractTypeId: number;
    joiningDate: string;
  }[];
}
export interface IEmpHours {
  allowedHours: number;
  empId: string;
  pendDate: string;
  pstartDate: string;
  totalHours: number;
}
export interface IPlannedJob {
  id: number;
  type: string;
  jobType: string;
  miscWorkId: number;
  miscWorkJobName: string;
}
export interface IStorePlannedJob {
  costCentre: string;
  secondaryJobType: string;
  disabled: boolean;
  id: number;
  type: string;
  miscWorkId: number | null;
  miscWorkJobName: string;
}
export interface IPlannedJobWeekResponse {
  year: number;
  week: number;
  startDate: string;
  endDate: string;
  weekStatus: string;
}
export interface ICJPRoster {
  pweekId: number;
  days: {
    date: string;
    status: string;
    metadata: string;
    edit: boolean;
    shifts: {
      id: number | null;
      startTime: string;
      endTime: string;
      clusterId: number;
      deleted: boolean;
    }[];
  }[];
  status: string;
  success: boolean;
  message: string;
}

export interface IAnalyticsHrsCombinedData {
  totalHours: number;
  employmentTypeWorkHours: IAnalyticsKeyValue[];
  dayTypeWorkHours: IAnalyticsKeyValue[];
  peakNonPeakHours: IAnalyticsKeyValue[];
}
export interface IPeakHoursConfig {
  id: number;
  configType: "STORE" | "DEFAULT";
  costCentre: string;
  effectiveDate: string;
  peakHourIntervals: {
    startTime: string;
    endTime: string;
  }[];
}
export interface IAffinityRateCell {
  date: string;
  totalHours: number;
  totalTurnover: number;
  affinityRate: number;
}
export interface IAffinityRateTotal {
  totalHours: number;
  totalTurnover: number;
  affinityRate: number;
}
export interface IRecommendedHours {
  date: string;
  recommendedHours: {
    category: string;
    hours: number;
    rosteredHours: number;
  }[];
}
export interface IEcoMobility {
  empId: string;
  date: string;
  costCentre: string;
  modeOfCommute: string;
  roundTripDistance: number;
  status: string;
  editable: boolean;
}
export interface IAnalyticsEcoCombinedData {
  kmEcoDistribution: {
    totalKm: number;
    ecoFriendlyKm: number;
    nonEcoFriendlyKm: number;
  };
  ecoModeKmWiseDistribution: IAnalyticsKeyValue[];
  nonEcoModeKmWiseDistribution: IAnalyticsKeyValue[];
  avgCommuteKmPerEmpPerDay: number;
  numEmpEcoDistribution: {
    empHavingAtLeastOneEcoTrip: number;
    empHavingNoEcoTrips: number;
  };
}
export interface IAnalyticsEcoKeyValue {
  key: string;
  value: {
    totalKm: number;
    ecoFriendlyKm: number;
    nonEcoFriendlyKm: number;
  };
}
export interface IAnalyticsEcoCategoryData {
  byZone: IAnalyticsEcoKeyValue[];
  byCity: IAnalyticsEcoKeyValue[];
  byStore: IAnalyticsEcoKeyValue[];
  byCluster: IAnalyticsEcoKeyValue[];
}
export interface IAnalyticsEcoExtraction {
  data: {
    year: string;
    month: string;
    costCentre: string;
    modeOfCommute: string;
    unit: string;
    value: string;
  }[];
}
