import { Flex } from "@chakra-ui/react";
import React from "react";

function AppHeader(props: {
  readonly children?: React.ReactNode;
  readonly justifyContentLeft?: boolean;
}) {
  const { children, justifyContentLeft } = props;

  return (
    <>
      {children ? (
        <Flex
          justifyContent={justifyContentLeft ? "space-between" : "flex-end"}
          alignItems={"center"}
          minH={"12"}
          mb={"4"}
          width={"full"}
        >
          {children}
        </Flex>
      ) : null}
    </>
  );
}

export default AppHeader;
