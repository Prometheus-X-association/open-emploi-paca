import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import Logo from "../../../assets/logo-region-sud.png";

const useStyles = makeStyles(theme => ({
  logo: {
    height:  theme.spacing(4),
    padding: theme.spacing(0.25),
    width: "auto",
    marginRight: theme.spacing(2),
    cursor: "pointer",
    verticalAlign: "middle",
    background: "rgba(255, 255, 255, 0.5)",
    borderRadius: 3
  },
}));

/**
 *
 */
export function GrecoAppBarTitle({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();

  return (
    <>
      <img className={classes.logo} src={Logo} alt={"Logo Région Sud"} onClick={() => location.assign("/")}/>
      GRECO
    </>
  );
}