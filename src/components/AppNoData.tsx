import { Flex, Text } from "@chakra-ui/react";
import { noDataImage } from "../helper/Images";

interface IProps {
  readonly msg?: string;
  readonly hideImage?: boolean;
  readonly image?: string;
}
function AppNoData(props: IProps) {
  const { msg, hideImage, image } = props;
  return (
    <Flex
      direction={"column"}
      maxWidth={"460px"}
      margin={"auto"}
      justifyContent={"center"}
      minHeight={"70vh"}
      data-testid="no-data"
    >
      {!hideImage ? (
        <Flex>
          <img src={image || noDataImage} alt="" />
        </Flex>
      ) : null}

      <Text fontSize={"sm"} textAlign={"center"} fontWeight={"medium"}>
        <span
          dangerouslySetInnerHTML={{
            __html:
              msg ??
              "Looks like there is no data, start adding on your own or ask your leader.",
          }}
        />
      </Text>
    </Flex>
  );
}

export default AppNoData;
