import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/core/styles";
import {Field, Form, Formik} from "formik";
import {useTranslation} from "react-i18next";
import {TextField} from "formik-material-ui";
import {useMutation} from "@apollo/client";
import {useSnackbar} from "notistack";
import * as Yup from "yup";
import {gql} from "@apollo/client";
import AuthLayout from "./AuthLayout";

const useStyles = makeStyles(theme => ({
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  error: {
    margin: theme.spacing(1, 0, 1),
    color: theme.palette.error.dark
  }
}));

export const formikValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email()
    .required("Required")
});

export const gqlResetUserAccountPasswordByMail = gql`
  mutation ResetUserAccountPasswordByMail($input: ResetUserAccountPasswordByMailInput!) {
    resetUserAccountPasswordByMail(input: $input) {
      success
    }
  }
`;

export default function ProfilResetPassword() {
  const classes = useStyles();
  const {t} = useTranslation();
  let {enqueueSnackbar} = useSnackbar();

  const [resetUserAccount, {loading: savingMutation}] = useMutation(gqlResetUserAccountPasswordByMail, {
    onCompleted() {
      enqueueSnackbar(t("RESET_PASSWORD.CONFIRMATION"), {variant: "success"});
    }
  });

  const submitForm = async ({email}) => {
    await resetUserAccount({
      variables: {
        input: {
          email: email
        }
      }
    });
  };

  return (
    <AuthLayout>
      <Typography component="h1" variant="h5">
        {t("SIGN_IN.PASSWORD_FORGOTTEN")}
      </Typography>
      <Formik
        initialValues={{
          email: localStorage.getItem("rememberMe") || ""
        }}
        validationSchema={formikValidationSchema}
        validateOnChange={true}
        validateOnBlur={true}
        onSubmit={submitForm}>
        {({isSubmitting, values, errors}) => {
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

              <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
                {t("RESET_PASSWORD.CONFIRM")}
              </Button>

              {isSubmitting && <CircularProgress size={24} className={classes.buttonProgress} />}
            </Form>
          );
        }}
      </Formik>
    </AuthLayout>
  );
}
