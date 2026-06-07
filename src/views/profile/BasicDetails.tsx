import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { IUserResponse } from "../../helper/Interface";

function BasicDetails(props: { readonly userDetails: IUserResponse }) {
  const { userDetails } = props;
  return (
    <Flex
      direction={"column"}
      style={{
        background: "#b6b6b61a",
        marginBottom: 16,
        borderRadius: 4,
        border: "1px solid lightgrey",
        overflow: "hidden",
      }}
    >
      <Flex
        style={{
          padding: "6px 10px",
          borderBottom: "1px solid lightgrey",
          minHeight: 56,
        }}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Text
          fontWeight={"bold"}
          style={{
            padding: "4px 12px",
          }}
          minWidth={"13%"}
        >
          Basic Details
        </Text>
      </Flex>

      <Flex flexWrap={"wrap"} background={"white"} py={"2"}>
        {[
          {
            key: "Employee Name",
            value: userDetails.firstName + " " + userDetails.lastName,
          },
          {
            key: "Employee Id",
            value: userDetails.empId,
          },
          {
            key: "Phone No",
            value: userDetails.phone,
          },
          {
            key: "Email Id",
            value: userDetails.email,
          },
          {
            key: "Cost Centre Name",
            value:
              userDetails.costCentreDisplayNameMap &&
              userDetails.costCentreDisplayNameMap[userDetails.costCentreName]
                ? userDetails.costCentreDisplayNameMap[
                    userDetails.costCentreName
                  ] + ` (${userDetails.costCentreName})`
                : userDetails.costCentreName,
          },
          {
            key: "Manager Id",
            value: userDetails.managerId,
          },
          {
            key: "Contract Type",
            value: userDetails.contractTypeName,
          },
          {
            key: "Fed Id",
            value: userDetails.fedId,
          },
        ].map(({ key, value }, i) => {
          return (
            <Flex minWidth={"50%"} key={key + "_" + value} px={"4"} py={"1"}>
              <Text minWidth={"45%"} fontSize={"sm"}>
                {key}:
              </Text>
              <Text fontWeight={"medium"} fontSize={"sm"}>
                {value ?? "--"}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}

export default BasicDetails;
