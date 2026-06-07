import { Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import { rosterV2Image } from "../../../helper/Images";

function NoRosterWrapper({ children }: { readonly children: ReactNode }) {
  return (
    <Flex
      width={"full"}
      minHeight={"400px"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Flex direction={"column"}>
        <Flex>
          <img
            src={rosterV2Image}
            alt=""
            style={{
              maxWidth: "280px",
            }}
          />
        </Flex>

        <Flex
          direction={"column"}
          textAlign={"center"}
          maxWidth={"300px"}
          pb={"4"}
        >
          {children}
        </Flex>
      </Flex>
    </Flex>
  );
}

export default NoRosterWrapper;
