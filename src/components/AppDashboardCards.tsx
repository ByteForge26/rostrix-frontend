import { Flex, Grid, Text, Tooltip } from "@chakra-ui/react";
import React from "react";
import { BsInfoCircle } from "react-icons/bs";
const colors = ["#775ca7", "#d9ee9a", "#e6a48b", "#a99abd"];

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
      gridTemplateColumns={{
        base: "1fr",
        md: `repeat(${Math.min(data.length, 2)}, minmax(0, 1fr))`,
        xl: `repeat(${data.length}, minmax(0, 1fr))`,
      }}
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
              rounded={"2xl"}
              border={"1px solid"}
              boxShadow={"0 8px 24px rgba(48, 37, 68, 0.05)"}
              borderColor={"#e9e5e1"}
              direction={"column"}
              background={`radial-gradient(circle at 8% 10%, ${colors[noColor ? 1 : i]}1c 0%, #ffffff 76%)`}
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
