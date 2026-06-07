import { Badge, Button, Flex, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { IMiscWork } from "../../../helper/Interface";
import { COLORS, DRAG_TYPE } from "../../../helper/Constant";

interface IProps {
  miscWorks: IMiscWork[];
}
function BottomBar(props: IProps) {
  const { miscWorks } = props;
  const LIMIT = 7;
  const [showMore, setShowMore] = useState(false);
  const JobCard = (props: { miscWork: IMiscWork; type: string }) => {
    const { type, miscWork } = props;
    const [_, drag] = useDrag({
      item: { miscWork, type },
      type,
      collect: (monitor) => {
        return {
          isDragging: monitor.isDragging(),
        };
      },
      end: (item: any, monitor) => {},
    });

    return (
      <Badge
        cursor={"grab"}
        ref={drag}
        m={"1"}
        variant={"subtle"}
        background={COLORS[miscWork.id % COLORS.length]}
        px={"3"}
        py={"1"}
        rounded={"2xl"}
      >
        <Text fontSize={"sm"} fontWeight={"medium"}>
          {miscWork.name}
        </Text>
      </Badge>
    );
  };
  return (
    <Flex
      position={"fixed"}
      bottom={0}
      left={0}
      right={0}
      background={"white"}
      borderTop={"1px solid #f1f1f1"}
      justifyContent={"center"}
    >
      <Flex overflow={"auto"} p={"2"} alignItems={"center"}>
        {miscWorks
          .sort((a, b) => a.name.localeCompare(b.name))
          .filter((_, i) => {
            if (showMore) {
              return true;
            } else {
              return i < LIMIT;
            }
          })
          .map((miscWork) => {
            return (
              <JobCard miscWork={miscWork} type={DRAG_TYPE} key={miscWork.id} />
            );
          })}
        <Flex>
          <Button
            onClick={() => setShowMore(!showMore)}
            variant={"ghost"}
            size={"sm"}
            p={2}
            color={"#027DBC"}
            ml={"1"}
          >
            {showMore
              ? "Show Less"
              : `+ ${miscWorks.filter((_, i) => i >= LIMIT).length} More`}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default BottomBar;
