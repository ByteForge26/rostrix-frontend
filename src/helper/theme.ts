import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    red: {
      500: "#e36a5c",
    },
    brand: {
      50: "#f4f1fb",
      100: "#e8e2f4",
      200: "#d7cceb",
      300: "#bca9db",
      400: "#9a80c5",
      500: "#775ca7",
      600: "#5f478c",
      700: "#49366c",
      800: "#302544",
      900: "#211a30",
    },
  },
  fonts: {
    body: `'Roboto', sans-serif`,
  },
  components: {
    Button: {
      variants: {
        sm: {
          bg: "#302544",
          color: "white",
          fontSize: "sm",
          fontWeight: 700,
          borderRadius: "xl",
          boxShadow: "0 8px 18px rgba(48, 37, 68, 0.16)",
          _hover: {
            bg: "#49366c",
            boxShadow: "0 12px 22px rgba(48, 37, 68, 0.22)",
            transform: "translateY(-1px)",
          },
          _disabled: {
            _hover: {
              color: "gray.500",
            },
          },
        },
        outline: {
          fontSize: "sm",
          bg: "#f4f1fb",
          color: "#49366c",
          border: "1px solid #e2dbee",
          borderRadius: "xl",
          _hover: {
            bg: "#e8e2f4",
            boxShadow: "0 8px 18px rgba(48, 37, 68, 0.1)",
          },
        },
      },
      defaultProps: {
        variant: "sm",
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: "brand.500",
      },
    },
  },
});

export default theme;
