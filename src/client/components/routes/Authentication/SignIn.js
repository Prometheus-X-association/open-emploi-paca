import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { ROUTES } from "../../../routes";
import { createLink } from "../../../utilities/router/createLink";
import { getUserAuthenticationService } from "../../../utilities/auth/UserAuthenticationService";
import { Field, Form, Formik } from "formik";
import { useTranslation } from "react-i18next";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import { useApolloClient } from "@apollo/client";
import AuthLayout from "./AuthLayout";

const useStyles = makeStyles((theme) => ({
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  error: {
    margin: theme.spacing(1, 0, 1),
    color: theme.palette.error.dark,
  },
}));

export default function SignIn() {
  const classes = useStyles();
  const { t } = useTranslation();
  const userAuthenticationService = getUserAuthenticationService({
    apolloClient: useApolloClient(),
  });
  const { login, globalErrorMessage } = userAuthenticationService.useLogin();

  return (
    <AuthLayout>
      <Typography component="h1" variant="h5">
        {t("SIGN_IN.TITLE")}
      </Typography>
      <Formik
        initialValues={{
          email: localStorage.getItem("rememberMe") || "",
          rememberMe: !!localStorage.getItem("rememberMe"),
          password: "",
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={userAuthenticationService.getLoginValidationSchema()}
        onSubmit={async (values, { setSubmitting, ...formikOptions }) => {
          setSubmitting(true);

          if (values.rememberMe) {
            localStorage.setItem("rememberMe", values.email);
          } else {
            localStorage.removeItem("rememberMe");
          }

          await login(values, { setSubmitting, ...formikOptions });
        }}
      >
        {({ isSubmitting, values, errors }) => {
          return (
            <Form className={classes.form} noValidate>
              <Field
                component={TextField}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label={t("SIGN_IN.EMAIL")}
                name="email"
                autoComplete="email"
                autoFocus
              />
              <Field
                component={TextField}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label={t("SIGN_IN.PASSWORD")}
                type="password"
                id="password"
                autoComplete="current-password"
              />

              <Field
                type="checkbox"
                component={CheckboxWithLabel}
                name="rememberMe"
                checked={values.rememberMe}
                color="primary"
                Label={{ label: t("SIGN_IN.REMEMBER_ME") }}
              />

              <If condition={globalErrorMessage}>
                <Typography className={classes.error}>
                  {t(globalErrorMessage)}
                </Typography>
              </If>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
              >
                {t("SIGN_IN.SUBMIT")}
              </Button>

              {isSubmitting && (
                <CircularProgress
                  size={24}
                  className={classes.buttonProgress}
                />
              )}

              <Grid container>
                <Grid item xs>
                  {createLink({
                    to: ROUTES.PASSWORD_FORGOTTEN,
                    text: t("SIGN_IN.PASSWORD_FORGOTTEN"),
                    variant: "body2",
                  })}
                </Grid>
                <Grid item>
                  {createLink({
                    to: ROUTES.SIGN_UP,
                    text: t("SIGN_IN.REDIRECT_SIGN_UP"),
                    variant: "body2",
                  })}
                </Grid>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    </AuthLayout>
  );
}
