import { Flex } from "@chakra-ui/react";

function CustomBox(props: {
  readonly color?: string;
  readonly background?: string;
  readonly size?: number;
}) {
  const { color, background, size } = props;
  return (
    <Flex
      rounded={"md"}
      style={{
        width: size ?? 18,
        height: size ?? 18,

        border: `1px solid ${color ?? "lightgray"}`,
        background: background ?? "",
      }}
    ></Flex>
  );
}

export default CustomBox;
