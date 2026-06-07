import React from "react";
import AppContainer from "../../components/AppContainer";
import { Flex, Text } from "@chakra-ui/react";
import { homeImage } from "../../helper/Images";

function Home() {
  return (
    <AppContainer heading="">
      <Flex
        direction={"column"}
        maxWidth={"420px"}
        margin={"auto"}
        justifyContent={"center"}
        minHeight={"80vh"}
      >
        <Flex>
          <img src={homeImage} alt="" />
        </Flex>

        <Text fontSize={"14px"} textAlign={"center"} fontWeight={"medium"}>
          Time to rock the roster with EffiMate! 🚀 Dive into the sidebar and let
          the fun begin!
        </Text>
      </Flex>
    </AppContainer>
  );
}

export default Home;
