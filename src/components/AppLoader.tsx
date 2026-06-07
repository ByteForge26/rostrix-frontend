import { Flex, Spinner, Text } from "@chakra-ui/react";

function AppLoader(props: { message?: string }) {
  const { message } = props;
  return (
    <Flex
      minH={"60vh"}
      justifyContent={"center"}
      alignItems={"center"}
      width={"full"}
      data-testid="loading"
    >
      <Spinner />
      {message ? (
        <Text ml={"2"} fontWeight={"medium"} fontSize={"lg"}>
          {message}
        </Text>
      ) : null}
    </Flex>
  );
}

export default AppLoader;
