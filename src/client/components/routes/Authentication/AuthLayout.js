import Container from "@material-ui/core/Container";
import {makeStyles} from "@material-ui/core/styles";
import {Footer} from "../../layouts/Footer";
import Logo from "../../../assets/logo-region-sud.png";

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  logo: {
    margin: theme.spacing(4),
    height: theme.spacing(15),
    width: "auto"
  },
  bottom: {
    position: "fixed",
    bottom: 0
  }
}));

export default function AuthLayout({children}) {
  const classes = useStyles();

  return (
    <>
      <Container component="main" maxWidth="xs">
        <div className={classes.paper}>
          <img className={classes.logo} src={Logo} alt={"Logo Région Sud"} />
          {children}
        </div>
      </Container>
      <Footer className={classes.bottom} bottomDisabled />
    </>
  );
}
