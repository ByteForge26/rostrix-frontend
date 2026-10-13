import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Badge,
  Button,
  Flex,
  Image,
  Input,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useLogin } from "../../hooks/useLogin";
import loginWorkspace from "../../assets/images/login-workspace.svg";

function Login() {
  const [searchParams] = useSearchParams();
  const { getToken, onLogin, onEmailLogin, email, setEmail, isLoading } =
    useLogin();
  useEffect(() => {
    if (searchParams?.get("code")) {
      const code = searchParams.get("code");
      if (code) getToken(code);
    }
  }, [getToken, searchParams]);

  return (
    <Flex
      minH={"100vh"}
      width={"100%"}
      bg="#f6f5f2"
      direction={{ base: "column", lg: "row" }}
      p={{ base: 0, lg: 5 }}
      gap={{ base: 0, lg: 5 }}
    >
      <Flex
        flex="1"
        minH={{ base: "35vh", lg: "calc(100vh - 40px)" }}
        direction="column"
        justifyContent="space-between"
        bg="#211a30"
        color="white"
        borderRadius={{ base: 0, lg: "2xl" }}
        px={{ base: 6, md: 10, xl: 14 }}
        py={{ base: 6, md: 8, lg: 10 }}
        position="relative"
        overflow="hidden"
        _after={{
          content: '""',
          position: "absolute",
          width: "420px",
          height: "420px",
          borderRadius: "full",
          border: "1px solid rgba(217,238,154,0.12)",
          right: "-190px",
          top: "-190px",
          pointerEvents: "none",
        }}
      >
        <Flex alignItems="center" gap="3" position="relative" zIndex="1">
          <Flex
            alignItems="center"
            justifyContent="center"
            width="42px"
            height="42px"
            bg="#d9ee9a"
            color="#211a30"
            borderRadius="xl"
            fontSize="lg"
            fontWeight="900"
          >
            R
          </Flex>
          <Text fontSize="xl" fontWeight="700" letterSpacing="-0.03em">
            Rostrix
          </Text>
        </Flex>

        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          flex="1"
          py={{ base: 4, lg: 0 }}
          position="relative"
          zIndex="1"
        >
          <Flex maxW="620px" width="100%" justifyContent="center">
            <Image
              src={loginWorkspace}
              alt="A preview of the workforce planning workspace"
              width="100%"
              maxH={{ base: "190px", md: "310px", lg: "430px" }}
              objectFit="contain"
            />
          </Flex>
          <Text
            maxW="560px"
            mt={{ base: 3, lg: 5 }}
            fontSize={{ base: "xl", md: "2xl", xl: "3xl" }}
            lineHeight="1.2"
            fontWeight="700"
            letterSpacing="-0.03em"
            textAlign="center"
          >
            Better planning starts with a clearer view.
          </Text>
          <Text
            maxW="480px"
            mt="3"
            color="rgba(255,255,255,0.68)"
            fontSize={{ base: "sm", md: "md" }}
            textAlign="center"
          >
            Your team schedules, store operations, and workforce insights in one
            focused workspace.
          </Text>
        </Flex>

        <Text
          display={{ base: "none", lg: "block" }}
          color="rgba(255,255,255,0.5)"
          fontSize="xs"
          position="relative"
          zIndex="1"
        >
          Workforce operations workspace
        </Text>
      </Flex>

      <Flex
        flex={{ base: "1", lg: "0 0 43%" }}
        minH={{ base: "65vh", lg: "calc(100vh - 40px)" }}
        alignItems="center"
        justifyContent="center"
        px={{ base: 5, md: 10, lg: 8, xl: 14 }}
        py={{ base: 8, lg: 10 }}
      >
        <Flex
          direction="column"
          width="100%"
          maxW="440px"
          bg="white"
          border="1px solid #ebe7e2"
          borderRadius="2xl"
          boxShadow="0 18px 52px rgba(48, 37, 68, 0.08)"
          p={{ base: 6, md: 9 }}
        >
          <Flex justifyContent="center" mb="5">
            <Badge
              variant="subtle"
              bg="#f4f1fb"
              color="brand.700"
              px={"3"}
              py={"1"}
              borderRadius={"full"}
              fontSize={"xs"}
              fontWeight={"700"}
              letterSpacing={"0.08em"}
              textTransform={"uppercase"}
            >
              Workforce planner
            </Badge>
          </Flex>

          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight={700}
            color="brand.800"
            textAlign="center"
            mb={"0.5rem"}
          >
            Welcome back
          </Text>
          <Text
            fontSize={"sm"}
            color="gray.600"
            textAlign="center"
            mb={"2rem"}
          >
            Sign in to continue to your operations workspace.
          </Text>

          <Flex borderTop={"1px solid #eeeaf2"} pt={"6"}>
            <Button onClick={onLogin} width={"full"} minH="52px">
              Login With FEDID
            </Button>
          </Flex>
          {(process.env.REACT_APP_ENV || "").toLowerCase() !== "prod" ? (
            <Flex
              direction={"column"}
              p={"4"}
              borderTop={"1px solid #eeeaf2"}
              marginTop={"4"}
              minWidth={{ base: "100%", md: "300px" }}
            >
              <Input
                textAlign={"center"}
                placeholder="Enter Email"
                mb={"2"}
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                focusBorderColor="brand.500"
                borderColor="gray.200"
                borderRadius="xl"
                minH="48px"
                _hover={{ borderColor: "brand.300" }}
              />
              <Button onClick={onEmailLogin} variant={"outline"}>
                {isLoading ? <Spinner /> : "Login with Email"}
              </Button>
            </Flex>
          ) : null}
        </Flex>
      </Flex>
    </Flex>
  );
}

export default Login;
