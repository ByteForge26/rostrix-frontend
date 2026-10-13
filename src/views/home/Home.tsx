import React from "react";
import AppContainer from "../../components/AppContainer";
import { Badge, Flex, Image, Text } from "@chakra-ui/react";
import workspaceOverview from "../../assets/images/workspace-overview.svg";

function Home() {
  return (
    <AppContainer heading="Overview">
      <Flex
        minH="calc(100vh - 150px)"
        alignItems="center"
        justifyContent="center"
      >
        <Flex
          width="full"
          maxW="1180px"
          minH={{ base: "auto", lg: "540px" }}
          alignItems="center"
          justifyContent="space-between"
          direction={{ base: "column-reverse", lg: "row" }}
          bg="white"
          border="1px solid #e9e5e1"
          borderRadius="3xl"
          boxShadow="0 18px 52px rgba(48, 37, 68, 0.07)"
          overflow="hidden"
        >
          <Flex
            flex="1"
            direction="column"
            alignItems={{ base: "center", lg: "flex-start" }}
            textAlign={{ base: "center", lg: "left" }}
            px={{ base: 6, md: 10, xl: 14 }}
            py={{ base: 8, lg: 12 }}
          >
            <Badge
              bg="#f4f1fb"
              color="brand.700"
              px="3"
              py="1.5"
              borderRadius="full"
              fontSize="xs"
              letterSpacing="0.08em"
              textTransform="uppercase"
            >
              Your workspace
            </Badge>
            <Text
              mt="6"
              fontSize={{ base: "3xl", md: "4xl", xl: "5xl" }}
              lineHeight="1.08"
              fontWeight="800"
              letterSpacing="-0.045em"
              color="brand.800"
            >
              Good work begins with a well-planned team.
            </Text>
            <Text
              mt="5"
              maxW="480px"
              fontSize={{ base: "sm", md: "md" }}
              lineHeight="1.8"
              color="gray.600"
            >
              Welcome to Rostrix. Explore workforce planning, team schedules,
              and operational insights from one place.
            </Text>
            <Flex
              mt="8"
              alignItems="center"
              gap="3"
              color="brand.700"
              fontSize="sm"
              fontWeight="600"
            >
              <Flex
                width="9px"
                height="9px"
                borderRadius="full"
                bg="#a5b75e"
              />
              Built for clearer day-to-day operations
            </Flex>
          </Flex>

          <Flex
            flex="1"
            width="full"
            minH={{ base: "260px", md: "360px", lg: "540px" }}
            alignItems="center"
            justifyContent="center"
            bg="#f4f1fb"
            px={{ base: 4, md: 8 }}
            py={{ base: 5, lg: 8 }}
          >
            <Image
              src={workspaceOverview}
              alt="Illustration of a team planning workspace"
              width="100%"
              maxW="590px"
              maxH="440px"
              objectFit="contain"
            />
          </Flex>
        </Flex>
      </Flex>
    </AppContainer>
  );
}

export default Home;
