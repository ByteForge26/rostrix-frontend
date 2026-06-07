import { Flex } from "@chakra-ui/react";

export const CustomCircle = (props: { readonly color: string }) => {
  const { color } = props;
  return (
    <Flex
      position={"absolute"}
      top={"5"}
      bottom={"5"}
      left={"7"}
      right={"7"}
      border={`1px solid ${color}`}
      rounded={"xl"}
    >
      <Flex
        style={{
          width: 10,
          height: 10,
          background: color,
          borderRadius: "50%",
          position: "absolute",
          top: "-2px",
          right: "-2px",
        }}
      ></Flex>
    </Flex>
  );
};
export default CustomCircle;
