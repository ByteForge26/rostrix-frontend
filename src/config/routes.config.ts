import { IRoute } from "../helper/Interface";
import ManageRoles from "../views/access/ManageRoles";
import ManageRolesPermissions from "../views/access/ManageRolesPermissions";
import ManageUsersRoles from "../views/access/ManageUsersRoles";
import ManageSports from "../views/configuration/ManageSports";
import ManageHolidays from "../views/configuration/ManageHolidays";
import ManageContractTypes from "../views/configuration/ManageContractTypes";
import MangeLeaves from "../views/configuration/MangeLeaves";
import { PERMISSION } from "./permission.config";
import ManageStoreEmployees from "../views/my-store/ManageStoreEmployees";
import MyLeavesWeekOffs from "../views/leave/MyLeavesWeekOffs";
import ManageClusters from "../views/my-store/ManageClusters";
import MyTeamLeaves from "../views/leave/MyTeamLeaves";
import ManageSecondaryJobs from "../views/my-store/ManageSecondaryJobs";
import ManageShifts from "../views/my-store/ManageShifts";
import ManageRoster from "../views/roster/layout/ManageRoster";
import LayoutViewPublishedRoster from "../views/roster/layout/ViewPublishedRoster";
import ManageSecondaryRoster from "../views/roster/secondary/ManageRoster";
import SecondaryViewPublishedRoster from "../views/roster/secondary/ViewPublishedRoster";
import ManageLocations from "../views/configuration/ManageLocations";
import LayoutEditRoster from "../views/roster/layout/EditRoster";
import SecondaryEditRoster from "../views/roster/secondary/EditRoster";
import SecondaryPublishRoster from "../views/roster/secondary/PublishRoster";
import LayoutPublishRoster from "../views/roster/layout/PublishRoster";
import MangeMigration from "../views/migration/MangeMigration";
import ViewWeeks from "../views/configuration/ViewWeeks";
import ViewCostCenters from "../views/configuration/ViewCostCenters";
import MyWorkHours from "../views/working-hours/MyWorkHours";
import MySwapRequest from "../views/swap-request/MySwapRequest";
import MyTeamHours from "../views/working-hours/MyTeamHours";
import ManualHours from "../views/payroll-manual-hours/ManualHours";
import HoursApproval from "../views/payroll-manual-hours/HoursApproval";
import ExtractPayroll from "../views/payroll-manual-hours/ExtractPayroll";
import { MODULES_ICONS } from "../helper/Images";
import HoursDistribution from "../views/dashboard/HoursDistribution";
import ManualHoursContribution from "../views/dashboard/ManualHoursContribution";
import Efficiency from "../views/dashboard/Efficiency";
import DayView from "../views/my-store/DayView";
import ClusterJobPlanning from "../views/my-store/ClusterJobPlanning";
import ClusterJobPlanningEdit from "../views/my-store/ClusterJobPlanningEdit";
import ClusterJobConfiguration from "../views/my-store/ClusterJobConfiguration";
import StoreConfiguration from "../views/my-store/StoreConfiguration";
import HoursVisibility from "../views/dashboard/HoursVisibility";
import V1ToSalve from "../views/migration/V1ToSalve";
import LeaveSync from "../views/migration/LeaveSync";
import IntegratedJobSync from "../views/integration/IntegratedJobSync";
import StoreAffinityRate from "../views/my-store/StoreAffinityRate";
import AffinityRate from "../views/dashboard/AffinityRate";
import ManageEcoMobility from "../views/eco-mobility/ManageEcoMobility";
import EcoMobilityContribution from "../views/dashboard/EcoMobilityContribution";

export const PATH = {
  // Dashboard
  "hours-distribution": "hours-distribution",
  "hours-visibility": "hours-visibility",
  "manual-hours-contribution": "manual-hours-contribution",
  efficiency: "efficiency",
  "eco-mobility-contribution": "eco-mobility-contribution",

  // Roster
  roster: "roster",
  "view-published-roster": "view-published-roster",
  "publish-roster": "publish-roster",
  "swap-request": "swap-request",
  "performance-dashboard": "performance-dashboard",
  "affinity-rate": "affinity-rate",

  // Leaves
  "my-leaves-week-offs": "my-leaves-week-offs",
  "my-team-leaves": "my-team-leaves",

  // My Store
  "manage-store-employees": "manage-store-employees",
  "manage-clusters": "manage-clusters",
  "manage-secondary-jobs": "manage-secondary-jobs",
  "manage-shifts": "manage-shifts",
  "day-view": "day-view",
  "cluster-job-configuration": "cluster-job-configuration",
  "cluster-job-planning": "cluster-job-planning",
  "store-configuration": "store-configuration",
  "store-affinity-rate": "store-affinity-rate",

  // Eco Mobility
  "manage-eco-mobility": "manage-eco-mobility",

  // Access Management
  "manage-permissions": "manage-permissions",
  "manage-users": "manage-users",
  "manage-roles": "manage-roles",
  "my-team": "my-team",

  // Configuration
  "view-weeks": "view-weeks",
  "mange-contract-types": "mange-contract-types",
  "manage-holidays": "manage-holidays",
  "manage-sports": "manage-sports",
  "manage-locations": "manage-locations",
  "view-cost-centers": "view-cost-centers",
  "mange-leaves": "mange-leaves",

  // Migration
  "refresh-migration": "refresh-migration",
  "v1-to-slave": "v1-to-slave",
  "humine-leave-sync": "humine-leave-sync",

  // Integration
  "integrated-job-sync": "integrated-job-sync",

  // Working Hours
  "my-work-hours": "my-work-hours",
  "my-team-hours": "my-team-hours",

  // Payroll & Manual Hours
  "manual-hours": "manual-hours",
  "hours-approval": "hours-approval",
  "extract-payroll": "extract-payroll",

  // Swap Request
  "my-swap-request": "my-swap-request",
};
export const ROUTES: IRoute[] = [
  {
    label: "Dashboard",
    path: "dashboard",
    icon: MODULES_ICONS.dashboardIcon,
    children: [
      {
        label: "Hours Distribution",
        path: PATH["hours-distribution"],
        permissionKey: PERMISSION.Dashboards["Hours Distribution"].View,
        Component: HoursDistribution,
        isActive: true,
      },
      {
        label: "Manual Hours Contribution",
        path: PATH["manual-hours-contribution"],
        permissionKey: PERMISSION.Dashboards["Manual Hour Contribution"].View,
        Component: ManualHoursContribution,
        isActive: true,
      },
      {
        label: "Efficiency",
        path: PATH["efficiency"],
        permissionKey: PERMISSION.Dashboards["Efficiency"].View,
        Component: Efficiency,
        isActive: true,
      },
      {
        label: "Hours Visibility",
        path: PATH["hours-visibility"],
        permissionKey: PERMISSION.Dashboards["Hours Visibility"].View,
        Component: HoursVisibility,
        isActive: true,
      },
      {
        label: "Affinity Rate",
        path: PATH["affinity-rate"],
        permissionKey: PERMISSION.Dashboards["Affinity Rate"].View,
        Component: AffinityRate,
        isActive: true,
      },
      {
        label: "Eco Mobility Contribution",
        path: PATH["eco-mobility-contribution"],
        permissionKey: PERMISSION.Dashboards["Eco Mobility"].View,
        Component: EcoMobilityContribution,
        isActive: true,
        isNew: true,
      },
    ],
  },
  {
    label: "Configuration",
    path: "configuration",
    icon: MODULES_ICONS.configurationIcon,
    children: [
      {
        label: "View Weeks",
        path: PATH["view-weeks"],
        permissionKey: PERMISSION.Config["Weeks"].View,
        Component: ViewWeeks,
        isActive: true,
      },
      {
        label: "Manage Contract Types",
        path: PATH["mange-contract-types"],
        permissionKey: PERMISSION.Config["Contract Types"].View,
        Component: ManageContractTypes,
        isActive: true,
      },
      {
        label: "Manage Leaves",
        path: PATH["mange-leaves"],
        permissionKey: PERMISSION.Config["Leaves"].View,
        Component: MangeLeaves,
        isActive: true,
      },
      {
        label: "Manage Holidays",
        path: PATH["manage-holidays"],
        permissionKey: PERMISSION.Config["Holidays"].View,
        Component: ManageHolidays,
        isActive: true,
      },
      {
        label: "Manage Sports",
        path: PATH["manage-sports"],
        permissionKey: PERMISSION.Config["Sports"].View,
        Component: ManageSports,
        isActive: true,
      },
      {
        label: "Manage Locations",
        path: PATH["manage-locations"],
        permissionKey: PERMISSION.Config["Location"].View,
        Component: ManageLocations,
        isActive: true,
      },
      {
        label: "View Cost Centers",
        path: PATH["view-cost-centers"],
        permissionKey: PERMISSION.Config["Cost Centres"].View,
        Component: ViewCostCenters,
        isActive: true,
      },
    ],
  },

  {
    label: "Access Management",
    path: "access-management",
    icon: MODULES_ICONS.accessManagementIcon,
    children: [
      {
        label: "Manage Roles",
        path: PATH["manage-roles"],
        permissionKey: PERMISSION.Access["Manage Roles"].View,
        Component: ManageRoles,
        isActive: true,
      },
      {
        label: "Manage Permissions",
        path: PATH["manage-permissions"],
        permissionKey: PERMISSION.Access["Manage Role Permission"].View,
        Component: ManageRolesPermissions,
        isActive: true,
      },
      {
        label: "Manage Users",
        path: PATH["manage-users"],
        permissionKey: PERMISSION.Access["Manage User Roles"].View,
        Component: ManageUsersRoles,
        isActive: true,
      },
    ],
  },
  {
    label: "Migration",
    path: "migration",
    icon: MODULES_ICONS.migrationIcon,
    children: [
      {
        label: "Manage Migration",
        path: PATH["refresh-migration"],
        permissionKey:
          PERMISSION.Migration["Manage Migration"]["Perform Refresh"],
        Component: MangeMigration,
        isActive: true,
      },
      {
        label: "V1 to Slave",
        path: PATH["v1-to-slave"],
        permissionKey: PERMISSION.Migration["V1 To Slave"].View,
        Component: V1ToSalve,
        isActive: true,
      },
      {
        label: "Humine Leave Sync",
        path: PATH["humine-leave-sync"],
        permissionKey: PERMISSION.Migration["Effi To Humine"].View,
        Component: LeaveSync,
        isActive: true,
        isNew: true,
      },
    ],
  },
  {
    label: "Integration",
    path: "integration",
    icon: MODULES_ICONS.integrationIcon,
    children: [
      {
        label: "Integrated Job Sync",
        path: PATH["integrated-job-sync"],
        permissionKey: PERMISSION.Integration["Integrated Job Sync"].View,
        Component: IntegratedJobSync,
        isActive: true,
        isNew: true,
      },
    ],
  },

  {
    label: "My Store",
    path: "my-store",
    icon: MODULES_ICONS.myStoreIcon,
    children: [
      {
        label: "Manage Store Employees",
        path: PATH["manage-store-employees"],
        permissionKey: PERMISSION["My Store"]["Manage Store Employees"].View,
        Component: ManageStoreEmployees,
        isActive: true,
      },
      {
        label: "Manage Clusters",
        path: PATH["manage-clusters"],
        permissionKey: PERMISSION["My Store"]["Manage Clusters"].View,
        Component: ManageClusters,
        isActive: true,
      },
      {
        label: "Manage Secondary Jobs",
        path: PATH["manage-secondary-jobs"],
        permissionKey: PERMISSION["My Store"]["Manage Secondary Jobs"].View,
        Component: ManageSecondaryJobs,
        isActive: true,
      },

      {
        label: "Manage Shifts",
        path: PATH["manage-shifts"],
        permissionKey: PERMISSION["My Store"]["Manage Shifts"].View,
        Component: ManageShifts,
        isActive: true,
      },
      {
        label: "Day View",
        path: PATH["day-view"],
        permissionKey: PERMISSION["My Store"]["Day View"].View,
        Component: DayView,
        isActive: true,
      },
      {
        label: "Cluster Job Configuration",
        path: PATH["cluster-job-configuration"],
        permissionKey: PERMISSION["My Store"]["Cluster Job Configuration"].View,
        Component: ClusterJobConfiguration,
        isActive: true,
      },
      {
        label: "Cluster Job Planning",
        path: PATH["cluster-job-planning"],
        permissionKey: PERMISSION["My Store"]["Cluster Job Planning"].View,
        Component: ClusterJobPlanning,
        isActive: true,
      },
      {
        label: "Cluster Job Planning",
        path: PATH["cluster-job-planning"] + "/:week",
        permissionKey: PERMISSION["My Store"]["Cluster Job Planning"].Update,
        Component: ClusterJobPlanningEdit,
        isActive: false,
      },
      {
        label: "Store Configuration",
        path: PATH["store-configuration"],
        permissionKey: PERMISSION["My Store"]["Store Configuration"].View,
        Component: StoreConfiguration,
        isActive: true,
      },
      {
        label: "Store Affinity Rate",
        path: PATH["store-affinity-rate"],
        permissionKey: PERMISSION["My Store"]["Affinity Rate"].View,
        Component: StoreAffinityRate,
        isActive: true,
        isNew: true,
      },
    ],
  },

  {
    label: "Eco Mobility",
    path: "eco-mobility",
    icon: MODULES_ICONS.ecoMobilityIcon,
    children: [
      {
        label: "Manage Eco Mobility",
        path: PATH["manage-eco-mobility"],
        permissionKey: PERMISSION["Eco Mobility"]["My Eco Mobility"].View,
        Component: ManageEcoMobility,
        isActive: true,
        isNew: true,
      },
    ],
  },
  {
    label: "Leaves & Week Offs",
    path: "leave",
    icon: MODULES_ICONS.leaveIcon,
    children: [
      {
        label: "My Leaves & Week Offs",
        path: PATH["my-leaves-week-offs"],
        permissionKey: PERMISSION.Leave["My Leaves & Week Off's"].View,
        Component: MyLeavesWeekOffs,
        isActive: true,
      },
      {
        label: "My Team Leaves",
        path: PATH["my-team-leaves"],
        permissionKey: PERMISSION.Leave["My Team Leaves"].View,
        Component: MyTeamLeaves,
        isActive: true,
      },
    ],
  },

  {
    label: "Secondary Roster",
    path: "secondary",
    icon: MODULES_ICONS.secondaryIcon,
    children: [
      {
        label: "Create/Edit Roster",
        path: PATH["roster"],
        permissionKey: PERMISSION["Secondary Roster"]["Manage Roster"].View,
        Component: ManageSecondaryRoster,
        isActive: true,
      },
      {
        label: "Create/Edit Roster",
        path: PATH["roster"] + "/:week",
        permissionKey: PERMISSION["Secondary Roster"]["Manage Roster"].Update,
        Component: SecondaryEditRoster,
        hideFromNav: true,
        isActive: true,
      },
      {
        label: "View Published Roster",
        path: PATH["view-published-roster"],
        permissionKey: PERMISSION["Secondary Roster"]["My Team Roster"].View,
        Component: SecondaryViewPublishedRoster,
        isActive: true,
      },
      {
        label: "Publish Roster",
        path: PATH["publish-roster"],
        permissionKey: PERMISSION["Secondary Roster"]["Manage Roster"].View,
        Component: SecondaryPublishRoster,
        isActive: true,
      },
    ],
  },
  {
    label: "Layout Roster",
    path: "layout",
    icon: MODULES_ICONS.layoutIcon,
    children: [
      {
        label: "Create/Edit Roster",
        path: PATH["roster"],
        permissionKey: PERMISSION["Layout Roster"]["Manage Roster"].View,
        Component: ManageRoster,
        isActive: true,
      },
      {
        label: "Create/Edit Roster",
        path: PATH["roster"] + "/:week",
        permissionKey: PERMISSION["Layout Roster"]["Manage Roster"].Update,
        Component: LayoutEditRoster,
        hideFromNav: true,
        isActive: true,
      },
      {
        label: "View Published Roster",
        path: PATH["view-published-roster"],
        permissionKey: PERMISSION["Layout Roster"]["My Team Roster"].View,
        Component: LayoutViewPublishedRoster,
        isActive: true,
      },
      {
        label: "Publish Roster",
        path: PATH["publish-roster"],
        permissionKey: PERMISSION["Layout Roster"]["Manage Roster"].View,
        Component: LayoutPublishRoster,
        isActive: true,
      },
    ],
  },
  {
    label: "Working Hours",
    path: "working-hours",
    icon: MODULES_ICONS.workingHoursIcon,
    children: [
      {
        label: "My Work Hours",
        path: PATH["my-work-hours"],
        permissionKey: PERMISSION["Working Hours"]["My Work Hours"].View,
        Component: MyWorkHours,
        isActive: true,
      },
      {
        label: "My Team Hours",
        path: PATH["my-team-hours"],
        permissionKey: PERMISSION["Working Hours"]["My Team Work Hours"].View,
        Component: MyTeamHours,
        isActive: true,
      },
    ],
  },
  {
    label: "Payroll & Manual Hours",
    path: "payroll-manual-hours",
    icon: MODULES_ICONS.payrollManualHoursIcon,
    children: [
      {
        label: "Manual Hours",
        path: PATH["manual-hours"],
        permissionKey:
          PERMISSION["Payroll & Manual Hours"]["Manual Hours"].View,
        Component: ManualHours,
        isActive: true,
      },
      {
        label: "Hours Approval",
        path: PATH["hours-approval"],
        permissionKey:
          PERMISSION["Payroll & Manual Hours"]["Hours Approval"].View,
        Component: HoursApproval,
        isActive: true,
      },
      {
        label: "Extract Payroll",
        path: PATH["extract-payroll"],
        permissionKey:
          PERMISSION["Payroll & Manual Hours"]["Extract Payroll"].Extract,
        Component: ExtractPayroll,
        isActive: true,
      },
    ],
  },
  {
    label: "Swap Request",
    path: "swap-request",
    icon: MODULES_ICONS.swapRequestIcon,
    children: [
      {
        label: "My Swap Request",
        path: PATH["my-swap-request"],
        permissionKey: PERMISSION["Shift Swap"]["My Shift Swaps"].View,
        Component: MySwapRequest,
        isActive: true,
      },
    ],
  },
];
