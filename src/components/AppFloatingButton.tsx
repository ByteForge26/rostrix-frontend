import { Button, Flex } from "@chakra-ui/react";

interface IProps {
  readonly label: string;
  readonly onClick: () => void;
}
function AppFloatingButton(props: IProps) {
  const { label, onClick } = props;
  return (
    <Flex
      p={"4"}
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        maxWidth: "100%",
        margin: "auto",
      }}
    >
      <Button onClick={onClick} size={"lg"}>
        {label}
      </Button>
    </Flex>
  );
}

export default AppFloatingButton;
