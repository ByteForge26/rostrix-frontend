import { ILegend } from "./Interface";

export const DRAWER_WIDTH = 250;
export const NAV_HEIGHT = 72;
export const AUTHORITY_URL = process.env.REACT_APP_AUTHORITY_URL;
export const BASE_URL = process.env.REACT_APP_BASE_URL;

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAYS_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const MAX_WEEK_IN_MONTH = 6;
export const LAYOUT = "LAYOUT";
export const ROSTER_DAY_CARD_MIN_HEIGHT = 60;
export const ROSTER_CELL_HEIGHT = 102;
export const ROSTER_EMPLOYEE_CELL_HEIGHT = 220;
export const INSIGHTS_WIDTH = 320;

export const CJP_DAY_CARD_HEIGHT = 52;
export const CJP_TIME_CELL_WIDTH = 76;
export const CJP_CELL_HEIGHT = 68;

export const DEFAULT_START_TIME = "07:00:00";
export const DEFAULT_MISC_START_TIME = "07:00:00";

export const DRAG_TYPE = "shift";

export const DEFAULT_OPEN_TIME = "00:00:00";
export const DEFAULT_CLOSE_TIME = "23:30:00";

export const MAX_SHIFT_WITHOUT_LUNCH = 9;
export const MAX_SHIFT_WITH_LUNCH = 10;

export const MAX_SHIFT_WITHOUT_LUNCH_PART_TIMER = 8;
export const MAX_SHIFT_WITH_LUNCH_PART_TIMER = 9;

export const LUNCH_INCLUDE = 6;

export const TIME_GAP = 30;
export const COLORS = [
  "#FF663333",
  "#FFB39933",
  // "#FFFF9933",
  "#00B3E633",
  "#E6B33333",
  "#3366E633",
  "#99996633",
  "#99FF9933",
  "#B34D4D33",
  "#80B30033",
  "#80990033",
  "#E6B3B333",
  "#6680B333",
  "#66991A33",
  "#FF99E633",
  "#66ac1833",
  "#FF1A6633",
  "#E6331A33",
  "#33FFCC33",
  "#66994D33",
  "#B366CC33",
  "#4D800033",
  "#B3330033",
  "#CC80CC33",
  "#66664D33",
  "#991AFF33",
  "#E666FF33",
  "#4DB3FF33",
  "#1AB39933",
  "#E666B333",
  "#33991A33",
  "#CC999933",
  "#B3B31A33",
  "#00E68033",
  "#4D806633",
  "#80998033",
  "#E6FF8033",
  "#1AFF3333",
  "#99993333",
  "#FF338033",
  "#CCCC0033",
  "#66E64D33",
  "#4D80CC33",
  "#9900B333",
  "#E64D6633",
  "#4DB38033",
  "#FF4D4D33",
  "#99E6E633",
  "#6666FF33",
];
export const ROSTER_STATUS = [
  {
    status: "NA",
    name: "Not Applicable",
    background: "#d3d3d3",
    color: "#d3d3d3",
    description: "Rosters for past months are not available",
  },
  {
    status: "NI",
    name: "Yet to be Created",
    color: "#c0c017",
    background: "#c0c017",
    description: "The roster for this month is still being finalized",
  },
  {
    status: "DRAFT",
    name: "Draft",
    background: "#027DBC",
    color: "#027DBC",
    description:
      "The roster for this month has been created but not yet published",
  },
  {
    status: "PUBLISHED",
    name: "Published",
    background: "#359735",
    color: "#359735",
    description: "The roster for this month is now live",
  },
  {
    status: "PUB_DRAFT",
    name: "Published Draft",
    background: "#F29727",
    color: "#F29727",
    description: "The roster for this month is live and has been updated",
  },
];

export const GLOBAL_VIEW_ROLES = [
  "ADMIN",
  "STORE_LEADER",
  "STORE_OPS",
  "CITY_LEADER",
];
export const SECONDARY_JOBS_CONFIG = [
  {
    jobType: "DM",
    label: "DM",
    edit: ["DM_COACH", "BDM", ...GLOBAL_VIEW_ROLES],
    view: ["DM_COACH", "BDM", "DM", ...GLOBAL_VIEW_ROLES],
  },
  {
    jobType: "PLAYGROUND",
    label: "Playground",
    edit: ["PLAYGROUND_COACH", ...GLOBAL_VIEW_ROLES],
    view: ["PLAYGROUND_COACH", "PLAYGROUND_MEMBER", ...GLOBAL_VIEW_ROLES],
  },
  {
    jobType: "CASHIERING",
    label: "Cashiering",
    edit: ["CASHIERING_COACH", ...GLOBAL_VIEW_ROLES],
    view: ["CASHIERING_COACH", "CASHIERING_MEMBER", ...GLOBAL_VIEW_ROLES],
  },
  {
    jobType: "CLICK_AND_COLLECT",
    label: "Click and Collect",
    edit: ["CNC_COACH", ...GLOBAL_VIEW_ROLES],
    view: ["CNC_COACH", "CNC_MEMBER", ...GLOBAL_VIEW_ROLES],
  },
  {
    jobType: "CRM",
    label: "CRM",
    edit: ["CRM_COACH", ...GLOBAL_VIEW_ROLES],
    view: ["CRM_COACH", "CRM_MEMBER", ...GLOBAL_VIEW_ROLES],
  },
];

export const LEAVE_STATUS_MAPING = [
  {
    label: "Auto Approved",
    value: "AUTO_APPROVED",
    color: "#009660",
  },
];
export const LEAVE_TYPE_MAPING = [
  {
    label: "General",
    value: "GENERAL",
    bgColor: "#DAF6E3",
    color: "#009660",
  },
  {
    label: "LOP",
    value: "LOP",
    bgColor: "#FFEFE7",
    color: "#DD4900",
  },
  {
    label: "Maternity",
    value: "MATERNITY",
    bgColor: "#FFEFE7",
    color: "#DD4900",
  },
  {
    label: "Paternity",
    value: "PATERNITY",
    bgColor: "#FFEFE7",
    color: "#DD4900",
  },
];
export const GENERAL = "GENERAL";
export const LOP = "LOP";
export const MATERNITY = "MATERNITY";
export const PATERNITY = "PATERNITY";
export const AUTO_APPROVED = "AUTO_APPROVED";
export const leaveTypes = [
  {
    label: "General",
    value: GENERAL,
  },
  {
    label: "LOP",
    value: LOP,
  },
  {
    label: "Maternity",
    value: MATERNITY,
  },
  {
    label: "Paternity",
    value: PATERNITY,
  },
];

export const RADIAN = Math.PI / 180;

export const GRAPH_COLORS: ILegend[] = [
  {
    color: "#0071A9",
    key: "COMMERCIAL",
    label: "Commercial",
    recommendedHoursKey: "COMMERCIAL",
    recommendedHoursLabel: "Commercial",
    recommendedHoursInfo: [
      "Planned hours are visible only when the roster is in a Published state. If unpublished, the hours shown are from the last published version.",
      "Recommended Commercial Hours are to be covered from Layout Shifts within that cluster.",
    ],
  },
  {
    color: "#FF4B3F",
    key: "NON_COMMERCIAL",
    label: "Non-Commercial",
    recommendedHoursKey: "GENERAL",
    recommendedHoursLabel: "General",
    recommendedHoursInfo: [
      "Planned hours are visible only when the roster is in a Published state. If unpublished, the hours shown are from the last published version.",
      "General Hours cover shifts like DM, Buddy DM, Welcomer/Goodbyer, Trial Room, Events, Playground, CRM, and Layout (general services).",
      "The general hours recommended are common across all stores and reflect the base operational coverage.",
    ],
  },
  {
    color: "#FDB833",
    key: "CASHIERING",
    label: "Cashiering",
    recommendedHoursKey: "CASHIERING",
    recommendedHoursLabel: "Cashiering",
    recommendedHoursInfo: [
      "Planned hours are visible only when the roster is in a Published state. If unpublished, the hours shown are from the last published version.",
      "Recommended Cashiering Hours to be covered through Main Shift (Cashiering) within the cashiering secondary job.",
    ],
  },
  {
    color: "#28AFB0",
    key: "ECOMMERCE",
    label: "E-Commerce",
    recommendedHoursKey: "ECOMMERCE",
    recommendedHoursLabel: "E-Commerce",
    recommendedHoursInfo: [
      "Planned hours are visible only when the roster is in a Published state. If unpublished, the hours shown are from the last published version.",
      "For the Layout/Cluster, recommended E-Commerce hours are covered through B2B and SFS shifts within the cluster. For the Secondary Roster, recommended E-Commerce hours are covered through the main shift (Click and Collect), B2B, and SFS shifts within the secondary job.",
    ],
  },
];

export const MH_LEGENDS: ILegend[] = [
  {
    color: "#0071A9",
    key: "totalHours",
    label: "Total Hours",
  },
  {
    color: "#FDB833",
    key: "manualHours",
    label: "Manual Hours",
  },
];
export const EFF_LEGENDS: ILegend[] = [
  {
    color: "#0071A9",
    key: "r_eff",
    label: "Realised Efficiency",
  },
  {
    color: "#FDB833",
    key: "p_eff",
    label: "Piloted Efficiency",
  },
];
export const PRO_LEGENDS: ILegend[] = [
  {
    color: "#0071A9",
    key: "r_prod",
    label: "Realised Productivity",
  },
  {
    color: "#FDB833",
    key: "p_prod",
    label: "Piloted Productivity",
  },
];
export const FT_PT_LEGENDS: ILegend[] = [
  {
    color: "#0071A9",
    key: "FULL_TIME",
    label: "Full Time",
  },
  {
    color: "#FDB833",
    key: "NON_FULL_TIME",
    label: "Part Time",
  },
];
export const WD_NWD_LEGENDS: ILegend[] = [
  {
    color: "#0071A9",
    key: "Weekday",
    label: "Weekday",
  },
  {
    color: "#FDB833",
    key: "Non-Weekday",
    label: "Weekend",
  },
];
export const PK_NPK_LEGENDS: ILegend[] = [
  {
    color: "#0071A9",
    key: "PEAK",
    label: "Peak",
  },
  {
    color: "#FDB833",
    key: "NON_PEAK",
    label: "Non Peak",
  },
];
export const AFFINITY_LEGENDS: ILegend[] = [
  {
    color: "#0071A9",
    key: "AFFINITY_RATE",
    label: "Affinity Rate",
  },
  {
    color: "#FDB833",
    key: "TOTAL_HOURS",
    label: "Total Commercial Hours",
    disabled: true,
  },
  {
    color: "#28AFB0",
    key: "TURN_OVER",
    label: "Total Turnover",
    disabled: true,
    currency: true,
  },
];
export const ECO_COM_LEGENDS: ILegend[] = [
  {
    color: "#009660",
    key: "ecoFriendlyKm",
    label: "Eco Friendly",
  },
  {
    color: "#FF4B3F",
    key: "nonEcoFriendlyKm",
    label: "Non-Eco Friendly",
  },
];
export const ECO_COM_GROWTH_LEGENDS: ILegend[] = [
  {
    color: "#009660",
    key: "ECO_KM",
    label: "Eco Friendly",
  },
  {
    color: "#FF4B3F",
    key: "NON_ECO_KM",
    label: "Non-Eco Friendly",
  },
];
export const VIEWS = [
  {
    name: "Metrics",
    value: "Metrics",
  },
  {
    name: "Performance",
    value: "Performance",
  },
];
export const VIEWS_WITH_EXTRACTION = [
  ...VIEWS,
  {
    name: "Data Extraction",
    value: "Data Extraction",
  },
];
export const COMMENT_MAX_LENGTH = 150;
export const PUBLISH_OPTIONS = [
  {
    label: "Just Publish",
    value: "NONE",
  },
  {
    label: "Publish & Notify All",
    value: "ALL",
  },
  {
    label: "Publish & Notify Concerned",
    value: "CONCERNED",
  },
];
export const MODE_OF_COMMUTE = [
  {
    label: "Bus",
    value: "BUS",
  },
  {
    label: "Metro/Train",
    value: "TRAIN_METRO",
  },
  { label: "Bicycle", value: "BICYCLE" },
  { label: "Walk", value: "WALKING" },
  { label: "Car", value: "CAR" },
  { label: "Carpool/Rideshare", value: "CARPOOLING" },
  { label: "Electric motorcycle", value: "ELECTRIC_MOTORCYCLE" },
  { label: "Electric car", value: "ELECTRIC_CAR" },
  { label: "Motorcycle", value: "MOTORCYCLE" },
  { label: "Auto", value: "AUTO_RICKSHAW" },
];
export const ECO_COM_LEGENDS_CAT: ILegend[] = [
  ...MODE_OF_COMMUTE.map(({ label, value }) => ({
    color: "#009660",
    key: value,
    label,
  })),
];
export const COMMUTE_CATEGORIES = [
  {
    label: "Zero Emission",
    color: "#009660",
    includes: ["WALKING", "BICYCLE"],
  },
  {
    label: "Electric",
    color: "#027DBC",
    includes: ["ELECTRIC_CAR", "ELECTRIC_MOTORCYCLE"],
  },
  {
    label: "Public / Shared",
    color: "#F29727",
    includes: ["BUS", "TRAIN_METRO", "CARPOOLING"],
  },
  {
    label: "Fuel-based",
    color: "#FF4B3F",
    includes: ["CAR", "MOTORCYCLE", "AUTO_RICKSHAW"],
  },
];
export const FILTERS = [
  {
    label: "Payroll Month",
    value: "PAYROLL_MONTH",
  },
  {
    label: "Calendar Month",
    value: "CALENDER_MONTH",
  },
  {
    label: "Custom Range",
    value: "CUSTOM_RANGE",
  },
];
export const DATA_VIEW_MODES = [
  {
    name: "Percentage",
    value: "percentage",
  },
  {
    name: "Absolute",
    value: "absolute",
  },
];
