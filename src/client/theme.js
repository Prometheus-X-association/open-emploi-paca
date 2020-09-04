import {createMuiTheme} from "@material-ui/core/styles";

const mainBlue = "#014d88";
const mainOrange = "#FCB018";
const backgroundGrey = "#F0EFEF";
const textBlue = "#0072BC";
const linkBlue = "#007bff";
const emptyGrey = "#6c757d";
const fontSize = 14;

export const theme = createMuiTheme({
  typography: {
    fontSize
  },
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: mainBlue
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: mainOrange,
      contrastText: "#FFFFFF"
    },
    text: {
      emptyHint: emptyGrey,
      enhanced: textBlue,
      drawerMenuItemText: textBlue,
      mainBlue,
      mainOrange,
      textBlue
    },
    background: backgroundGrey
  },
  overrides: {
    MuiTypography: {
      h2: {
        fontSize: fontSize * 1.5
      }
    },
    MuiContainer: {
      root: {
        backgroundColor: "#FFFFFF"
      }
    },
    MuiLink: {
      root: {
        color: textBlue
      }
    },
    MuiIconButton: {
      colorPrimary: {
        color: mainOrange
      },
      colorInherit: {
        color: mainBlue
      }
    }
  }
});
