import {
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
} from "@chakra-ui/react";
import React from "react";
import { PUBLISH_OPTIONS } from "../../../helper/Constant";

function RosterPublishButton(props: {
  readonly setGlobalNotifyTo: (notifyTo: string) => void;
  readonly onPublishRoster: (props: {
    notifyTo: string;
    forceConfirm?: boolean;
    week?: number;
  }) => void;
  readonly withSave: boolean;
}) {
  const { setGlobalNotifyTo, onPublishRoster, withSave } = props;
  return (
    <Menu>
      <MenuButton as={Button} data-testid="menu-button">
        <Button>{`${withSave ? "Save & " : ""}Publish`}</Button>
      </MenuButton>
      <MenuList>
        {PUBLISH_OPTIONS.map(({ label, value }) => (
          <MenuItemOption
            key={value}
            onClick={() => {
              setGlobalNotifyTo(value);
              onPublishRoster({ notifyTo: value });
            }}
            fontSize={"sm"}
          >
            {label}
          </MenuItemOption>
        ))}
      </MenuList>
    </Menu>
  );
}

export default RosterPublishButton;
