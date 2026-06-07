import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Flex, Input, Spinner } from "@chakra-ui/react";
import { useLogin } from "../../hooks/useLogin";
import { effiMateLogo } from "../../helper/Images";

const getRandomUrlString = () => {
  let baseUrl = "https://idpdecathlon.oxylane.com/assets/images/";
  let randomImg = Math.floor(Math.random() * 14) + 1;
  let finalUrl = baseUrl + randomImg + ".jpg";
  return 'url("' + finalUrl + '")';
};
const url = getRandomUrlString();
function Login() {
  const [searchParams] = useSearchParams();
  const { getToken, onLogin, onEmailLogin, email, setEmail, isLoading } =
    useLogin();
  useEffect(() => {
    if (searchParams?.get("code")) {
      const code = searchParams.get("code");
      if (code) getToken(code);
    }
  }, []);

  return (
    <Flex
      minH={"100vh"}
      width={"100%"}
      justifyContent={"center"}
      alignItems={"center"}
      direction={"column"}
      background={url}
      backgroundPosition={"center"}
      backgroundSize={"cover"}
      backgroundRepeat={"no-repeat"}
    >
      <Flex
        direction={"column"}
        background={"#fffffff2"}
        rounded={"md"}
        boxShadow={"md"}
        p={"2rem"}
      >
        <Flex
          maxWidth={"200px"}
          minWidth={"300px"}
          margin={"auto"}
          pb={"4"}
          justifyContent={"center"}
        >
          <img
            src={effiMateLogo}
            alt=""
            style={{
              maxWidth: "130px",
            }}
          />
        </Flex>
        <Flex borderTop={"1px solid #e2e8f1"} pt={"6"}>
          <Button onClick={onLogin} width={"full"}>
            Login With FEDID
          </Button>
        </Flex>
        {(process.env.REACT_APP_ENV || "").toLowerCase() !== "prod" ? (
          <Flex
            direction={"column"}
            p={"4"}
            borderTop={"1px solid #e2e8f1"}
            marginTop={"4"}
            minWidth={"300px"}
          >
            <Input
              textAlign={"center"}
              placeholder="Enter Email"
              mb={"2"}
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
            />
            <Button onClick={onEmailLogin} variant={"outline"}>
              {isLoading ? <Spinner /> : "Login with Email"}
            </Button>
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  );
}

export default Login;
