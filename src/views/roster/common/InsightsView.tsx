import { Flex, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../app/store/store";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Customized,
  Rectangle,
} from "recharts";
import { convertTime, getPeakHoursDistribution } from "../../../helper/Utils";

import { cloneDeep } from "lodash";

function InsightsView() {
  const [times, setTimes] = useState<
    { name: string; startTime: string; endTime: string }[]
  >([]);
  const { selectedDate, roster } = useAppSelector((state) => state.roster);
  const { contractTypes } = useAppSelector((state) => state.auth);
  useEffect(() => {
    getTimes();

    // if (roster && selectedDate) {
    //   getPeakHoursDistribution({
    //     empWeekRosters: roster.empWeekRosters,
    //     selectedDate: selectedDate,
    //   });
    // }
  }, [selectedDate, roster]);
  const getTimes = () => {
    const tempData: {
      name: string;
      startTime: string;
      endTime: string;
      startTime2: string;
      endTime2: string;
      startTime3: string;
      endTime3: string;
      startTime4: string;
      endTime4: string;
    }[] = [];
    if (roster?.empWeekRosters?.length && contractTypes?.length) {
      cloneDeep(roster.empWeekRosters)
        .sort(
          (a, b) =>
            contractTypes
              .filter(({ id }) => id === a.contractId)[0]
              .category.localeCompare(
                contractTypes.filter(({ id }) => id === b.contractId)[0]
                  .category
              ) || a.fistName.localeCompare(b.fistName)
        )
        .forEach(({ days, empId, fistName, lastName }) => {
          const day = days.find(({ date }) => date === selectedDate);

          const main = day?.main?.sort((a, b) => a.s.localeCompare(b.s)) ?? [];
          tempData.push({
            name: `${fistName} ${lastName}`,
            startTime: main?.length
              ? main[0].s.replaceAll(":", "").substring(0, 4)
              : "00000",
            endTime: main?.length
              ? main[0].e.replaceAll(":", "").substring(0, 4)
              : "00000",
            startTime2:
              main && main.length > 1
                ? main[1].s.replaceAll(":", "").substring(0, 4)
                : "00000",
            endTime2:
              main && main.length > 1
                ? main[1].e.replaceAll(":", "").substring(0, 4)
                : "00000",
            startTime3:
              main && main.length > 2
                ? main[2].s.replaceAll(":", "").substring(0, 4)
                : "00000",
            endTime3:
              main && main.length > 2
                ? main[2].e.replaceAll(":", "").substring(0, 4)
                : "00000",
            startTime4:
              main && main.length > 3
                ? main[3].s.replaceAll(":", "").substring(0, 4)
                : "00000",
            endTime4:
              main && main.length > 3
                ? main[3].e.replaceAll(":", "").substring(0, 4)
                : "00000",
          });
        });
    }
    setTimes(tempData);
  };
  const CustomizedRectangle = (props: any) => {
    const { formattedGraphicalItems } = props;
    return formattedGraphicalItems[0]?.props?.points.map(
      (_: any, index: number) => {
        const startTimePoint1 =
          formattedGraphicalItems[0]?.props?.points[index];
        const endTimePoint1 = formattedGraphicalItems[1]?.props?.points[index];
        const startTimePoint2 =
          formattedGraphicalItems[2]?.props?.points[index];
        const endTimePoint2 = formattedGraphicalItems[3]?.props?.points[index];
        const startTimePoint3 =
          formattedGraphicalItems[4]?.props?.points[index];
        const endTimePoint3 = formattedGraphicalItems[5]?.props?.points[index];
        const startTimePoint4 =
          formattedGraphicalItems[6]?.props?.points[index];
        const endTimePoint4 = formattedGraphicalItems[7]?.props?.points[index];
        const yDiff1 = startTimePoint1.x - endTimePoint1.x;
        const yDiff2 = startTimePoint2.x - endTimePoint2.x;
        const yDiff3 = startTimePoint3.x - endTimePoint3.x;
        const yDiff4 = startTimePoint4.x - endTimePoint4.x;
        return (
          <>
            <Rectangle
              width={-yDiff1}
              height={16}
              x={startTimePoint1.x}
              y={startTimePoint1.y - 24}
              fill={"#027dbc"}
            ></Rectangle>
            <Rectangle
              width={-yDiff2}
              height={16}
              x={startTimePoint2.x}
              y={startTimePoint2.y - 24}
              fill={"#027dbc"}
            ></Rectangle>
            <Rectangle
              width={-yDiff3}
              height={16}
              x={startTimePoint3.x}
              y={startTimePoint3.y - 24}
              fill={"#027dbc"}
            ></Rectangle>
            <Rectangle
              width={-yDiff4}
              height={16}
              x={startTimePoint4.x}
              y={startTimePoint4.y - 24}
              fill={"#027dbc"}
            ></Rectangle>
          </>
        );
      }
    );
  };
  const CustomizedAxisTick = (props: any) => {
    const { x, y, payload } = props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={8}
          y={4}
          dy={6}
          textAnchor="end"
          fill="#666"
          transform="rotate(-30)"
          fontSize={10}
        >
          {timeFormatter(payload.value)}
        </text>
      </g>
    );
  };
  const timeFormatter = (value: number) => {
    let t = value.toString();
    if (t.length === 1) {
      t = `000${t}`;
    }
    if (t.length === 2) {
      t = `00${t}`;
    }
    if (t.length === 3) {
      t = `0${t}`;
    }
    let time = `${t[0]}${t[1]}:${t[2]}${t[3]}`;
    return convertTime(time);
  };
  const CustomizedLabel = (props: any) => {
    const { x, y, stroke, index } = props;
    return (
      <text
        x={x - 6}
        y={y - 6}
        dy={-4}
        fill={stroke}
        fontSize={10}
        textAnchor="middle"
      >
        {index + 1}
      </text>
    );
  };
  const CustomTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <Flex
          direction={"column"}
          background={"white"}
          boxShadow={"0 0 4px 0 black"}
          rounded={"md"}
          px={"4"}
          py={"3"}
        >
          <Text fontSize={"sm"} fontWeight={"medium"}>{`${label}`}</Text>
          <Flex pt={"1"} direction={"column"}>
            <Text fontSize={"xs"}>
              {payload[0].value === "00000"
                ? "--"
                : `${convertTime(payload[0].value)} - ${convertTime(
                    payload[1].value
                  )}`}
            </Text>
            <Text fontSize={"xs"}>
              {payload[2].value === "00000"
                ? ""
                : `${convertTime(payload[2].value)} - ${convertTime(
                    payload[3].value
                  )}`}
            </Text>
            <Text fontSize={"xs"}>
              {payload[4].value === "00000"
                ? ""
                : `${convertTime(payload[4].value)} - ${convertTime(
                    payload[5].value
                  )}`}
            </Text>
            <Text fontSize={"xs"}>
              {payload[6].value === "00000"
                ? ""
                : `${convertTime(payload[6].value)} - ${convertTime(
                    payload[7].value
                  )}`}
            </Text>
          </Flex>
        </Flex>
      );
    }

    return null;
  };

  return (
    <Flex width={"full"} direction={"column"}>
      <Flex px={"2"} direction={"column"}>
        {/* <Flex borderBottom={"1px solid #f1f1f1"} direction={"column"} py={"2"}>
          <Text fontSize={"sm"} fontWeight={"bold"}>
            MYGAME STATS
          </Text>
          <Flex direction={"column"} py={"2"} fontSize={"sm"}>
            <Flex width={"full"} px={"1"} my={"1"}>
              <Text width={"50%"}>Quantity</Text>
              <Text fontWeight={"medium"}>1000</Text>
            </Flex>
            <Flex width={"full"} px={"1"} my={"1"}>
              <Text width={"50%"}>Hours</Text>
              <Text fontWeight={"medium"} display={"flex"}>
                <Text color={"red"} mr={"1"}>
                  800
                </Text>
                / 1000
              </Text>
            </Flex>
            <Flex width={"full"} px={"1"} my={"1"}>
              <Text width={"50%"}>Efficiency</Text>
              <Text fontWeight={"medium"} display={"flex"}>
                <Text color={"red"} mr={"1"}>
                  12.5
                </Text>
                / 10
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Flex borderBottom={"1px solid #f1f1f1"} direction={"column"} py={"2"}>
          <Text fontSize={"sm"} fontWeight={"bold"}>
            REDSHIFT STATS
          </Text>
          <Flex minHeight={"80px"}></Flex>
        </Flex> */}
        {times?.length ? (
          <Flex direction={"column"} py={"2"} overflow={"hidden"}>
            <Text fontSize={"sm"} fontWeight={"bold"}>
              SHIFT VISUALIZATION
            </Text>
            <Flex marginLeft={"-48px"}>
              <ResponsiveContainer width="100%" height={40 + times.length * 32}>
                <LineChart
                  data={times}
                  layout="vertical"
                  // margin={{
                  //   top: 6,
                  //   left: 6,
                  // }}
                >
                  <CartesianGrid stroke="#f5f5f5" />
                  <XAxis
                    type="number"
                    tick={<CustomizedAxisTick />}
                    scale="linear"
                    domain={["dataMin", "dataMax + 1"]}
                  />
                  <YAxis
                    dataKey="name"
                    tick={false}
                    type="category"
                    scale="band"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    dataKey="startTime"
                    stroke="#ffffff00"
                    fillOpacity={0}
                    label={<CustomizedLabel />}
                  />
                  <Line dataKey="endTime" stroke="#ffffff00" />
                  <Line
                    dataKey="startTime2"
                    stroke="#ffffff00"
                    // label={<CustomizedLabel />}
                  />
                  <Line dataKey="endTime2" stroke="#ffffff00" />
                  <Line
                    dataKey="startTime3"
                    stroke="#ffffff00"
                    // label={<CustomizedLabel />}
                  />
                  <Line dataKey="endTime3" stroke="#ffffff00" />
                  <Line
                    dataKey="startTime4"
                    stroke="#ffffff00"
                    // label={<CustomizedLabel />}
                  />
                  <Line dataKey="endTime4" stroke="#ffffff00" />
                  <Customized component={CustomizedRectangle} />
                </LineChart>
              </ResponsiveContainer>
            </Flex>
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  );
}

export default InsightsView;
