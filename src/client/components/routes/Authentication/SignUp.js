import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/core/styles";
import {createLink} from "../../../utilities/router/createLink";
import {ROUTES} from "../../../routes";
import {useTranslation} from "react-i18next";
import {Form, Formik} from "formik";
import CircularProgress from "@material-ui/core/CircularProgress";

import {getUserAuthenticationService} from "../../../utilities/auth/UserAuthenticationService";
import {useApolloClient} from "@apollo/client";
import {TextField} from "../../widgets/Form";
import AuthLayout from "./AuthLayout";

const useStyles = makeStyles(theme => ({
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  }
}));

export default function SignUp() {
  const classes = useStyles();
  const {t} = useTranslation();
  const userAuthenticationService = getUserAuthenticationService({apolloClient: useApolloClient()});
  const {subscribe, success, globalErrorMessage} = userAuthenticationService.useSubscribe();

  return (
    <AuthLayout>
      <Typography component="h1" variant="h5">
        {t("SIGN_UP.TITLE")}
      </Typography>
      <Formik
        initialValues={userAuthenticationService.getSubscribeFormInitialValues()}
        validationSchema={userAuthenticationService.getSubscribeValidationSchema()}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={subscribe}
        render={({errors, status, touched, isSubmitting, values}) => {
          return (
            <Form className={classes.form} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    autoComplete="fname"
                    name="firstName"
                    variant="outlined"
                    required
                    label={t("SIGN_UP.FIRST_NAME")}
                    autoFocus
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    required
                    label={t("SIGN_UP.LAST_NAME")}
                    name="lastName"
                    autoComplete="lname"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField variant="outlined" required label={t("SIGN_UP.EMAIL")} name="email" autoComplete="email" />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    name="password"
                    label={t("SIGN_UP.PASSWORD")}
                    type="password"
                    autoComplete="current-password"
                  />
                </Grid>
              </Grid>
              <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
                {t("SIGN_UP.SUBMIT")}
              </Button>

              {isSubmitting && <CircularProgress size={24} className={classes.buttonProgress} />}

              <Grid container justify="flex-end">
                <Grid item>
                  {createLink({to: ROUTES.SIGN_IN, text: t("SIGN_UP.REDIRECT_SIGN_IN"), variant: "body2"})}
                </Grid>
              </Grid>
            </Form>
          );
        }}
      />
    </AuthLayout>
  );
}
