import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { useAppSelector, store } from "../../app/store/store";
import { useAppDispatch } from "../../app/store/store";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import {
  IEcoMobility,
  IMyTeamInfo,
  IPayrollConfig,
  IWeekOffResponse,
} from "../../helper/Interface";
import ManageEcoMobility from "./ManageEcoMobility";

const mockAddToast = jest.fn();
jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: mockAddToast,
  }),
}));

jest.mock("../../app/store/store", () => ({
  ...jest.requireActual("../../app/store/store"),
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(() => ({
    selectedCostCenterName: "IN1041",
    user: {
      empId: "DSI000486",
    },
  })),
}));
// jest.mock("moment", () => () => ({
//   format: jest.fn(() => "2026-01-07"),
//   startOf: () => ({ format: jest.fn(() => "2026-01-07") }),
//   endOf: () => ({ format: jest.fn(() => "2026-01-07") }),
//   set: () => ({ toDate: jest.fn(() => "2026-01-07") }),
//   get: jest.fn(() => "07"),
//   add: jest.fn(() => "07"),
//   diff: jest.fn(),
//   toDate: jest.fn(() => "2026-01-07"),
// }));
const mockWeeks = [
  {
    id: 762,
    year: 2026,
    number: 1,
    startDate: "2025-12-28",
    endDate: "2026-01-03",
  },
  {
    id: 763,
    year: 2026,
    number: 2,
    startDate: "2026-01-04",
    endDate: "2026-01-10",
  },
  {
    id: 764,
    year: 2026,
    number: 3,
    startDate: "2026-01-11",
    endDate: "2026-01-17",
  },
  {
    id: 765,
    year: 2026,
    number: 4,
    startDate: "2026-01-18",
    endDate: "2026-01-24",
  },
  {
    id: 766,
    year: 2026,
    number: 5,
    startDate: "2026-01-25",
    endDate: "2026-01-31",
  },
  {
    id: 767,
    year: 2026,
    number: 6,
    startDate: "2026-02-01",
    endDate: "2026-02-07",
  },
  {
    id: 768,
    year: 2026,
    number: 7,
    startDate: "2026-02-08",
    endDate: "2026-02-14",
  },
  {
    id: 769,
    year: 2026,
    number: 8,
    startDate: "2026-02-15",
    endDate: "2026-02-21",
  },
  {
    id: 770,
    year: 2026,
    number: 9,
    startDate: "2026-02-22",
    endDate: "2026-02-28",
  },
  {
    id: 771,
    year: 2026,
    number: 10,
    startDate: "2026-03-01",
    endDate: "2026-03-07",
  },
  {
    id: 772,
    year: 2026,
    number: 11,
    startDate: "2026-03-08",
    endDate: "2026-03-14",
  },
  {
    id: 773,
    year: 2026,
    number: 12,
    startDate: "2026-03-15",
    endDate: "2026-03-21",
  },
  {
    id: 774,
    year: 2026,
    number: 13,
    startDate: "2026-03-22",
    endDate: "2026-03-28",
  },
  {
    id: 775,
    year: 2026,
    number: 14,
    startDate: "2026-03-29",
    endDate: "2026-04-04",
  },
  {
    id: 776,
    year: 2026,
    number: 15,
    startDate: "2026-04-05",
    endDate: "2026-04-11",
  },
  {
    id: 777,
    year: 2026,
    number: 16,
    startDate: "2026-04-12",
    endDate: "2026-04-18",
  },
  {
    id: 778,
    year: 2026,
    number: 17,
    startDate: "2026-04-19",
    endDate: "2026-04-25",
  },
  {
    id: 779,
    year: 2026,
    number: 18,
    startDate: "2026-04-26",
    endDate: "2026-05-02",
  },
  {
    id: 780,
    year: 2026,
    number: 19,
    startDate: "2026-05-03",
    endDate: "2026-05-09",
  },
  {
    id: 781,
    year: 2026,
    number: 20,
    startDate: "2026-05-10",
    endDate: "2026-05-16",
  },
  {
    id: 782,
    year: 2026,
    number: 21,
    startDate: "2026-05-17",
    endDate: "2026-05-23",
  },
  {
    id: 783,
    year: 2026,
    number: 22,
    startDate: "2026-05-24",
    endDate: "2026-05-30",
  },
  {
    id: 784,
    year: 2026,
    number: 23,
    startDate: "2026-05-31",
    endDate: "2026-06-06",
  },
  {
    id: 785,
    year: 2026,
    number: 24,
    startDate: "2026-06-07",
    endDate: "2026-06-13",
  },
  {
    id: 786,
    year: 2026,
    number: 25,
    startDate: "2026-06-14",
    endDate: "2026-06-20",
  },
  {
    id: 787,
    year: 2026,
    number: 26,
    startDate: "2026-06-21",
    endDate: "2026-06-27",
  },
  {
    id: 788,
    year: 2026,
    number: 27,
    startDate: "2026-06-28",
    endDate: "2026-07-04",
  },
  {
    id: 789,
    year: 2026,
    number: 28,
    startDate: "2026-07-05",
    endDate: "2026-07-11",
  },
  {
    id: 790,
    year: 2026,
    number: 29,
    startDate: "2026-07-12",
    endDate: "2026-07-18",
  },
  {
    id: 791,
    year: 2026,
    number: 30,
    startDate: "2026-07-19",
    endDate: "2026-07-25",
  },
  {
    id: 792,
    year: 2026,
    number: 31,
    startDate: "2026-07-26",
    endDate: "2026-08-01",
  },
  {
    id: 793,
    year: 2026,
    number: 32,
    startDate: "2026-08-02",
    endDate: "2026-08-08",
  },
  {
    id: 794,
    year: 2026,
    number: 33,
    startDate: "2026-08-09",
    endDate: "2026-08-15",
  },
  {
    id: 795,
    year: 2026,
    number: 34,
    startDate: "2026-08-16",
    endDate: "2026-08-22",
  },
  {
    id: 796,
    year: 2026,
    number: 35,
    startDate: "2026-08-23",
    endDate: "2026-08-29",
  },
  {
    id: 797,
    year: 2026,
    number: 36,
    startDate: "2026-08-30",
    endDate: "2026-09-05",
  },
  {
    id: 798,
    year: 2026,
    number: 37,
    startDate: "2026-09-06",
    endDate: "2026-09-12",
  },
  {
    id: 799,
    year: 2026,
    number: 38,
    startDate: "2026-09-13",
    endDate: "2026-09-19",
  },
  {
    id: 800,
    year: 2026,
    number: 39,
    startDate: "2026-09-20",
    endDate: "2026-09-26",
  },
  {
    id: 801,
    year: 2026,
    number: 40,
    startDate: "2026-09-27",
    endDate: "2026-10-03",
  },
  {
    id: 802,
    year: 2026,
    number: 41,
    startDate: "2026-10-04",
    endDate: "2026-10-10",
  },
  {
    id: 803,
    year: 2026,
    number: 42,
    startDate: "2026-10-11",
    endDate: "2026-10-17",
  },
  {
    id: 804,
    year: 2026,
    number: 43,
    startDate: "2026-10-18",
    endDate: "2026-10-24",
  },
  {
    id: 805,
    year: 2026,
    number: 44,
    startDate: "2026-10-25",
    endDate: "2026-10-31",
  },
  {
    id: 806,
    year: 2026,
    number: 45,
    startDate: "2026-11-01",
    endDate: "2026-11-07",
  },
  {
    id: 807,
    year: 2026,
    number: 46,
    startDate: "2026-11-08",
    endDate: "2026-11-14",
  },
  {
    id: 808,
    year: 2026,
    number: 47,
    startDate: "2026-11-15",
    endDate: "2026-11-21",
  },
  {
    id: 809,
    year: 2026,
    number: 48,
    startDate: "2026-11-22",
    endDate: "2026-11-28",
  },
  {
    id: 810,
    year: 2026,
    number: 49,
    startDate: "2026-11-29",
    endDate: "2026-12-05",
  },
  {
    id: 811,
    year: 2026,
    number: 50,
    startDate: "2026-12-06",
    endDate: "2026-12-12",
  },
  {
    id: 812,
    year: 2026,
    number: 51,
    startDate: "2026-12-13",
    endDate: "2026-12-19",
  },
  {
    id: 813,
    year: 2026,
    number: 52,
    startDate: "2026-12-20",
    endDate: "2026-12-26",
  },
  {
    id: 814,
    year: 2026,
    number: 53,
    startDate: "2026-12-27",
    endDate: "2027-01-02",
  },
];
const mockPayrollConfig: IPayrollConfig = {
  currentPStartDateTime: "2026-01-05T00:00:00",
  currentPEndDateTime: "2026-02-04T17:05:00",
  currentManualHourStartTime: "2026-02-04T17:05:00",
  currentManualHourEndTime: "2026-02-04T17:50:00",
  currentPayrollExtractStartTime: "2026-02-03T14:30:00",
};
const mockMyTeamEmp: IMyTeamInfo = {
  success: true,
  message: "",
  userBasicInfoDTOList: [
    {
      userId: "e106c5f7-18b3-4bff-9b5c-e1f9da25c755",
      firstName: "VAJRAPPA",
      lastName: "DD",
      empId: "DSI000053",
      email: "vajrappa.gowda@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2009-01-19",
    },
    {
      userId: "0dab3336-9242-405b-8707-ea1364de5be0",
      firstName: "S GOPI",
      lastName: "sadashivan",
      empId: "DSI000152",
      email: "gopi.sadashivan@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2011-02-03",
    },
    {
      userId: "b1466dec-b2ef-4fbc-992a-0b1cd5bc1f78",
      firstName: "Sanjay",
      lastName: "S",
      empId: "DSI003732",
      email: "sanjay.s@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2016-09-15",
    },
    {
      userId: "57de118f-e0c0-4fc5-8e04-eedab93ab7e8",
      firstName: "Mohammed Jaffer",
      lastName: "Sadiq",
      empId: "DSI003876",
      email: "mohammed.sadiq@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2016-10-31",
    },
    {
      userId: "1baf6360-8d51-4fc4-a2dc-efb2d3ae39be",
      firstName: "ROSHAN",
      lastName: "M.T",
      empId: "DSI004094",
      email: "roshan.somaiah@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2017-01-18",
    },
    {
      userId: "9515be9e-dd87-4aec-91f4-d00f1130b6e1",
      firstName: "Godwin",
      lastName: "Fernandes",
      empId: "DSI004343",
      email: "godwin.godwin@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2017-05-04",
    },
    {
      userId: "0cf24ec5-f516-4af7-bad8-bf3d3eb341b0",
      firstName: "Arun",
      lastName: "Kumar",
      empId: "DSI004716",
      email: "arunkumar.narayanaswamy@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2017-08-19",
    },
    {
      userId: "e24c8073-0c57-4384-bdb0-e6a84faef0ed",
      firstName: "Sanju",
      lastName: "Mathew",
      empId: "DSI004743",
      email: "sanju.mathew@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2017-08-31",
    },
    {
      userId: "aee01dea-e42a-49a0-85a3-6ad4de5dfa39",
      firstName: "Varun",
      lastName: "Edward Kumar",
      empId: "DSI005134",
      email: "varun.varun@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2017-12-30",
    },
    {
      userId: "a052436e-b6bd-4459-a4a3-b3d3a619ba51",
      firstName: "N G Bisonath",
      lastName: "Singh",
      empId: "DSI005432",
      email: "ng.singh@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2018-03-04",
    },
    {
      userId: "7b23f940-105d-475d-94a1-2589cb445eec",
      firstName: "Arjun",
      lastName: "M",
      empId: "DSI005822",
      email: "arjun.nambiar@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2018-06-30",
    },
    {
      userId: "d8eecc46-13a2-444e-a0ba-766354d96a52",
      firstName: "Deepak",
      lastName: "Thakur",
      empId: "DSI006124",
      email: "deepak.thakur@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2018-09-30",
    },
    {
      userId: "a59a7e4e-3cbb-400f-8fc7-ad10b35b3f6f",
      firstName: "Suresh",
      lastName: "A",
      empId: "DP3782",
      email: "suresh.a@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 2,
      joiningDate: "2018-12-25",
    },
    {
      userId: "39ed4079-5a27-48a9-98fa-46625b7c773a",
      firstName: "Deva",
      lastName: "Balan F",
      empId: "DSI006448",
      email: "deva.balan@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2019-01-19",
    },
    {
      userId: "6a8683ef-43ee-4bdc-b30b-0cfd57e9c036",
      firstName: "Rohit",
      lastName: "R",
      empId: "DSI007067",
      email: "rohit.rohit@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2019-07-14",
    },
    {
      userId: "f73cb57e-1952-47af-b370-dac221af5ffb",
      firstName: "Richard",
      lastName: "Suvaris",
      empId: "DSI007256",
      email: "richard.suvaris@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2019-08-18",
    },
    {
      userId: "3183d7f9-77eb-4319-9c9f-e73a686c82b9",
      firstName: "DIVYA RACHEL",
      lastName: "MOHAN",
      empId: "DP4514",
      email: "divyarachel.mohan@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 2,
      joiningDate: "2019-09-09",
    },
    {
      userId: "91122645-045d-4e66-9a70-63733854b965",
      firstName: "Manoj",
      lastName: "C N",
      empId: "DSI007505",
      email: "manoj.manoj@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2019-11-07",
    },
    {
      userId: "51e3fe3a-f164-44fa-9149-32a4bc0c4c66",
      firstName: "Yashwanth",
      lastName: "C",
      empId: "DP5512",
      email: "DP5512",
      costCentreName: "IN1058",
      contractTypeId: 2,
      joiningDate: "2020-12-19",
    },
    {
      userId: "e44cb40b-99a9-49e3-8e71-4f291a857c49",
      firstName: "Venkatesh Govindraj",
      lastName: "Chitta",
      empId: "DSI007694",
      email: "venkatesh.govindrajchitta@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2019-12-31",
    },
    {
      userId: "945d1cc4-305d-4d5d-a30b-69e461aabffe",
      firstName: "Sai Vamsi",
      lastName: "Neelapu",
      empId: "DSI007950",
      email: "vamsi.neelapu@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2020-02-29",
    },
    {
      userId: "6eaed081-361f-43d2-9f16-430c97db6555",
      firstName: "Sathish",
      lastName: "Kumar",
      empId: "DSI007951",
      email: "sathish.kumar2@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2020-04-04",
    },
    {
      userId: "793516e8-2b80-4523-8256-1eb27919f07b",
      firstName: "Harshik",
      lastName: "K",
      empId: "DP5514",
      email: "harshik.harshik@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 2,
      joiningDate: "2020-12-19",
    },
    {
      userId: "e71b2b29-9987-4996-8318-1127f65ddd4e",
      firstName: "Saji",
      lastName: "Rahim",
      empId: "DSI008284",
      email: "saji.rahim@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2021-02-01",
    },
    {
      userId: "e876e452-489a-4fc3-a958-4bf5bcaab10c",
      firstName: "Manigandan",
      lastName: "S",
      empId: "DP5999",
      email: "mani.gandan1@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 2,
      joiningDate: "2021-03-14",
    },
    {
      userId: "7b50819f-53ba-4756-a213-45523f9452f3",
      firstName: "Sarath",
      lastName: "K",
      empId: "DSI008453",
      email: "sarath.kolenchery@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2021-06-20",
    },
    {
      userId: "7b52b06e-9e70-4027-9d21-7825107d26c4",
      firstName: "Madhu",
      lastName: "D L",
      empId: "DSI008560",
      email: "madhu.dl@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2021-08-02",
    },
    {
      userId: "903bf6fd-a83b-45ad-a31e-a8c9827ad88f",
      firstName: "Stephan",
      lastName: "Prajwal S",
      empId: "DSI008564",
      email: "stephan.prajwal@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2021-08-02",
    },
    {
      userId: "bca94801-cf20-44e7-854b-bdba672f8483",
      firstName: "Girish",
      lastName: "DN",
      empId: "DSI008577",
      email: "girish.dn@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2021-07-31",
    },
    {
      userId: "d00f2ed1-dd45-4a74-8bb3-34e1383d6785",
      firstName: "Raghu",
      lastName: "M",
      empId: "DSI008580",
      email: "raghu.m@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2021-07-31",
    },
    {
      userId: "2ac89cff-fdab-46f4-9d74-ba49011e02af",
      firstName: "S",
      lastName: "Ashish",
      empId: "DP6407",
      email: "s.ashish@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 2,
      joiningDate: "2021-08-13",
    },
    {
      userId: "dd6d8b79-fe31-4ba3-9664-0f745a3293fe",
      firstName: "GERALD RAKESH",
      lastName: "MOHAN",
      empId: "DSI000597",
      email: "samruddha.gadnayak@decathlon.com",
      costCentreName: "IN1058",
      contractTypeId: 1,
      joiningDate: "2013-07-06",
    },
  ],
};
const mockEcoMobilityResponse: IEcoMobility[] = [
  {
    empId: "DSI000597",
    date: "2026-01-05",
    costCentre: "IN1058",
    modeOfCommute: "CARPOOLING",
    roundTripDistance: 100,
    status: "FILLED",
    editable: true,
  },
  {
    empId: "DSI000597",
    date: "2026-01-06",
    costCentre: "IN1058",
    modeOfCommute: "CARPOOLING",
    roundTripDistance: 100,
    status: "FILLED",
    editable: true,
  },
  {
    empId: "DSI000597",
    date: "2026-01-07",
    costCentre: "IN1058",
    modeOfCommute: "CARPOOLING",
    roundTripDistance: 100,
    status: "FILLED",
    editable: true,
  },
  {
    empId: "DSI005822",
    date: "2026-01-08",
    costCentre: "IN1058",
    modeOfCommute: "CARPOOLING",
    roundTripDistance: 100,
    status: "FILLED",
    editable: true,
  },
];

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../../hooks/useApi", () => ({
  useApi: jest.fn(),
}));

jest.mock("../../hooks/usePermission", () => ({
  usePermission: jest.fn(),
}));

const useApiMock = useApi as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;

describe("ManageEcoMobility Component", () => {
  let mockDispatch: jest.Mock;
  beforeEach(() => {
    jest.setTimeout(60000);
    mockDispatch = jest.fn();

    useApiMock.mockReturnValue({
      get: jest.fn((endpoint: string) => {
        if (endpoint.includes("/hours/payroll-config")) {
          return Promise.resolve(mockPayrollConfig);
        }
        if (endpoint.includes("/hours/my-team-info")) {
          return Promise.resolve(mockMyTeamEmp);
        }
        if (endpoint.includes("/eco-mobility/DSI000597")) {
          return Promise.resolve([]);
        }
        if (endpoint.includes("/eco-mobility/DSI005822")) {
          return Promise.resolve(mockEcoMobilityResponse);
        }

        if (endpoint.includes("/eco-mobility/DSI000597")) {
          return Promise.resolve(mockEcoMobilityResponse);
        }
        if (endpoint.includes("/master/week")) {
          return Promise.resolve(mockWeeks);
        }

        return Promise.resolve({});
      }),
      post: jest.fn((endpoint: string) => {
        if (endpoint.includes("/eco-mobility")) {
          return Promise.resolve(mockEcoMobilityResponse);
        }
        return Promise.resolve({});
      }),
      put: jest.fn((endpoint: string) => {
        if (endpoint.includes("/eco-mobility")) {
          return Promise.resolve(mockEcoMobilityResponse);
        }
        return Promise.resolve({});
      }),
    });

    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch); // Mock useAppDispatch

    (useAppSelector as jest.Mock).mockReturnValue({
      selectedCostCenterName: "IN1058",
      user: {
        userId: "dd6d8b79-fe31-4ba3-9664-0f745a3293fe",
        firstName: "GERALD RAKESH",
        lastName: "MOHAN",
        email: "samruddha.gadnayak@decathlon.com",
        empId: "DSI000597",
        managerId: "EXP000036",
        costCentreName: "IN1058",
        contractTypeId: 1,
        contractTypeName: "Full Time",
        stateId: 13,
        countryId: 1,
      },
      contractTypes: [
        {
          id: 1,
          name: "Full Time",
          category: "FULL_TIME",
          deletable: false,
        },
        {
          id: 2,
          name: "Part Time",
          category: "NON_FULL_TIME",
          deletable: false,
        },
      ],
    });
    usePermissionMock.mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });
    jest
      .useFakeTimers()
      .setSystemTime(new Date("2026-01-06T00:00:00").getTime());
  });

  it("should render data", async () => {
    const mockDispatch = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
    jest
      .useFakeTimers()
      .setSystemTime(new Date("2026-01-06T00:00:00").getTime());

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageEcoMobility />
        </Provider>,
      );
    });
    const emp = screen.getByText("Arjun");

    fireEvent.click(emp);

    await waitFor(async () => {
      const texts = [
        "Manage Eco Mobility",
        "+ Add My Eco Mobility",
        "Employees",
        "You",
        "Sanju",
        "Date",
        "100 km",
      ];
      texts.forEach((text) => {
        expect(screen.getAllByText(text)[0]).toBeInTheDocument();
      });
      const testIds = ["my-check", "edit-eco-day"];
      testIds.forEach((testId) => {
        expect(screen.getAllByTestId(testId)[0]).toBeInTheDocument();
      });
      await waitFor(() => {
        const edit = screen.getAllByTestId("edit-eco-day");
        fireEvent.click(edit[0]);
      });
      await waitFor(() => {
        expect(screen.getByText("Update Eco Mobility")).toBeInTheDocument();
        const updateButton = screen.getByText("Update");
        expect(updateButton).toBeInTheDocument();
        fireEvent.click(updateButton);
      });
    });
  });
  it("should render add button", async () => {
    const mockDispatch = jest.fn();
    (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);

    await act(async () => {
      render(
        <Provider store={store}>
          <ManageEcoMobility />
        </Provider>,
      );
    });

    await waitFor(() => {
      const addButton = screen.getByText("+ Add My Eco Mobility");
      expect(addButton).toBeInTheDocument();
      fireEvent.click(addButton);
    });
    await waitFor(() => {
      expect(screen.getByText("Save")).toBeInTheDocument();
    });

    const combobox = screen.getByRole("combobox");
    fireEvent.mouseDown(combobox);
    await waitFor(() => {
      const modeOfCommuteOption = screen.getByText("Bus", { exact: true });
      fireEvent.click(modeOfCommuteOption);
    });
    const input = screen.getByPlaceholderText("Enter here");

    fireEvent.change(input, { target: { value: "123" } });

    fireEvent.change(input, { target: { value: "" } });

    fireEvent.change(input, { target: { value: "123" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);
  });

  it("should correctly apply 'Payroll Month' filter in Tabular View", async () => {
    render(
      <Provider store={store}>
        <ManageEcoMobility />
      </Provider>,
    );

    const tabularViewTab = screen.getByText("Tabular View");
    fireEvent.click(tabularViewTab);

    const payrollMonthFilter = screen.getByText("Payroll Month");
    fireEvent.click(payrollMonthFilter);

    const combobox = screen.getAllByRole("combobox");
    fireEvent.mouseDown(combobox[0]);
    await waitFor(() => {
      const yButton = screen.getAllByText(/5 jan/i);
      fireEvent.click(yButton[0]);
    });

    await waitFor(() => {
      const febOption = screen.getAllByText(/5 Feb/i);
      fireEvent.click(febOption[0]);
      expect(febOption[0]).toBeInTheDocument();
    });
  });

  it("should correctly apply 'Calender Month' filter in Tabular View", async () => {
    render(
      <Provider store={store}>
        <ManageEcoMobility />
      </Provider>,
    );

    const tabularViewTab = screen.getByText("Tabular View");
    fireEvent.click(tabularViewTab);

    const calendarMonthFilter = await waitFor(() =>
      screen.getByText(/Calendar Month/i),
    );
  });

  it("should correctly apply 'Custom Range' filter in Tabular View", async () => {
    render(
      <Provider store={store}>
        <ManageEcoMobility />
      </Provider>,
    );

    const tabularViewTab = screen.getByText("Tabular View");
    fireEvent.click(tabularViewTab);
    const employeeRow = await screen.findByText("GERALD RAKESH");
    fireEvent.click(employeeRow);
    expect(screen.getByText("GERALD RAKESH")).toBeInTheDocument();

    const calendarMonthFilter = await waitFor(() =>
      screen.getByText(/Calendar Month/i),
    );
    fireEvent.click(calendarMonthFilter);

    const combobox = screen.getAllByRole("combobox");
    fireEvent.mouseDown(combobox[0]);
    await waitFor(() => {
      const janButton = screen.getByText("February", { exact: true });
      fireEvent.click(janButton);
    });

    await waitFor(() => {
      const febOption = screen.getAllByText(/February/i);
      fireEvent.click(febOption[0]);
      expect(febOption[0]).toBeInTheDocument();
    });

    fireEvent.mouseDown(combobox[1]);
    await waitFor(() => {
      const yearButton = screen.getAllByText("2026", { exact: true });
      fireEvent.click(yearButton[0]);
    });

    await waitFor(() => {
      const newYOption = screen.getAllByText(/2027/i);
      fireEvent.click(newYOption[0]);
      expect(newYOption[0]).toBeInTheDocument();
    });

    const customRangeFilter = await waitFor(() =>
      screen.getByText(/Custom Range/i),
    );
    fireEvent.click(customRangeFilter);

    const fromDateInput = screen.getByLabelText(
      /custom_start_date/i,
    ) as HTMLInputElement;
    const toDateInput = screen.getByLabelText(
      /custom_end_date/i,
    ) as HTMLInputElement;

    expect(fromDateInput).toBeInTheDocument();
    expect(toDateInput).toBeInTheDocument();
  });
  it("should set the current month and year when clicked", async () => {
    render(
      <Provider store={store}>
        <ManageEcoMobility />
      </Provider>,
    );
    await waitFor(() => {
      const calendarViewTab = screen.getByText("Calendar View");
      fireEvent.click(calendarViewTab);
    });

    const todayButton = screen.getByRole("button", { name: /today/i });
    expect(todayButton).toBeInTheDocument();
    fireEvent.click(todayButton);

    await waitFor(() => {
      const week = screen.getByTestId("week-cell-5");
      expect(week).toBeInTheDocument();
      const date = screen.getAllByText("31");
      expect(date[0]).toBeInTheDocument();
    });

    const janButton = screen.getAllByText(/January/i);
    fireEvent.click(janButton[0]);
    await waitFor(() => {
      const febOption = screen.getAllByText(/February/i);
      fireEvent.click(febOption[0]);
      expect(febOption[0]).toBeInTheDocument();
    });
    const yButton = screen.getAllByText(/2026/i);
    fireEvent.click(yButton[0]);
    await waitFor(() => {
      const nyOption = screen.getAllByText(/2027/i);
      fireEvent.click(nyOption[0]);
      expect(nyOption[0]).toBeInTheDocument();
    });
  });

  it("should update selected employee ID, reset calendar hours, and call getEmpCalenderHours when an employee is selected", async () => {
    render(
      <Provider store={store}>
        <ManageEcoMobility />
      </Provider>,
    );
    const calendarViewButton = await screen.findByText("Calendar View");
    fireEvent.click(calendarViewButton);

    const employeeRow = await screen.findByText("GERALD RAKESH");
    fireEvent.click(employeeRow);

    expect(screen.getByText("GERALD RAKESH")).toBeInTheDocument();
  });
  it("filters users by search key", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageEcoMobility />
        </Provider>,
      );
    });

    const searchInput = screen.getByPlaceholderText("Search here");
    fireEvent.change(searchInput, { target: { value: "Snehal" } });

    await waitFor(() => {
      const unmatchedUser = screen.queryByText(/Vikram Kumar/i);
      expect(unmatchedUser).not.toBeInTheDocument();
    });

    fireEvent.change(searchInput, { target: { value: "Muskan" } });
  });
});
