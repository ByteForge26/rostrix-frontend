import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    red: {
      500: "#e85f5f",
    },
    brand: {
      500: "#027DBC",
    },
  },
  fonts: {
    body: `'Roboto', sans-serif`,
  },
  components: {
    Button: {
      variants: {
        sm: {
          bg: "#027DBC",
          color: "white",
          fontSize: "sm",
          _hover: {
            boxShadow: "0 0 2px 0 lightgray",
          },
          _disabled: {
            _hover: {
              color: "gray.500",
            },
          },
        },
        outline: {
          fontSize: "sm",
          bg: "#027DBC29",
          color: "#027DBC",
          border: "none",
          _hover: {
            bg: "#027DBC29",
            boxShadow: "0 0 2px 0 #027DBC29",
          },
        },
      },
      defaultProps: {
        variant: "sm",
      },
    },
  },
});

export default theme;
