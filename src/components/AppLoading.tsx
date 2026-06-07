import { Flex } from "@chakra-ui/react";
import React from "react";
import AppLoader from "./AppLoader";

function AppLoading(props: { message?: string }) {
  const { message } = props;
  return (
    <Flex position={"fixed"} inset={0} background={"#d4d4d480"} zIndex={2}>
      <AppLoader message={message} />
    </Flex>
  );
}

export default AppLoading;
