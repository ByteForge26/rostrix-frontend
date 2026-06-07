import { Flex, Grid, Text, Tooltip } from "@chakra-ui/react";
import React from "react";
import { BsInfoCircle } from "react-icons/bs";
const colors = ["#027dbc", "#fbe1e1", "#f29727", "#57f227"];

function AppDashboardCards(props: {
  noColor?: boolean;
  data: {
    child: {
      title: string;
      info: string;
      value: string;
      color?: string;
    }[];
  }[];
}) {
  const { data, noColor } = props;

  return (
    <Grid
      gridTemplateColumns={`repeat(${data.length}, 1fr)`}
      width={"full"}
      gap={"4"}
      mb={"4"}
    >
      {data
        .filter(({ child }) => child.length)
        .map(({ child }, i) => {
          return (
            <Flex
              key={i}
              p={"4"}
              rounded={"lg"}
              border={"1px solid"}
              boxShadow={"0 0 8px 0 #d3d3d375"}
              borderColor={"#e7e7e7"}
              direction={"column"}
              background={`radial-gradient(circle at 10% 50%, ${colors[noColor ? 1 : i]}0d 0%, ${colors[noColor ? 1 : i]}1a 90%)`}
            >
              {child.length > 1 ? (
                <>
                  {child.map(({ title, value }, j) => {
                    return (
                      <Flex key={`${i}_${j}`} justifyContent={"space-between"}>
                        <Text
                          fontSize={"md"}
                          fontWeight={"bold"}
                          color={"gray.600"}
                          display={"flex"}
                          alignItems={"center"}
                        >
                          {`${title}:`}
                        </Text>
                        <Text fontSize={"lg"} fontWeight={"medium"}>
                          {value}
                        </Text>
                      </Flex>
                    );
                  })}
                </>
              ) : (
                <>
                  <Text
                    fontSize={"md"}
                    fontWeight={"bold"}
                    color={"gray.600"}
                    display={"flex"}
                    alignItems={"center"}
                  >
                    {child[0].title}
                    {child[0].info ? (
                      <Tooltip hasArrow label={child[0].info}>
                        <Text ml={"2"}>
                          <BsInfoCircle fontSize={"14px"} />
                        </Text>
                      </Tooltip>
                    ) : null}
                  </Text>
                  <Text
                    fontSize={"2xl"}
                    fontWeight={"medium"}
                    color={child[0].color || "black"}
                  >
                    {child[0].value}
                  </Text>
                </>
              )}
            </Flex>
          );
        })}
    </Grid>
  );
}

export default AppDashboardCards;
