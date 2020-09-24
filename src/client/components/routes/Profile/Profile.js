import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Grid, InputAdornment, Typography} from "@material-ui/core";
import {useMutation, useQuery} from "@apollo/client";
import {Form, Formik} from "formik";
import {object, string} from "yup";
import pick from "lodash/pick";

import {BlockContainer} from "../../widgets/BlockContainer";
import {FormButtons, OccupationPickerField, TextField} from "../../widgets/Form";

import {gqlMyProfile} from "./gql/MyProfile.gql";
import {gqlUpdateProfile} from "./gql/UpdateProfile.gql";
import {useSnackbar} from "notistack";
import {JobAreaPickerField} from "../../widgets/Form/JobAreaPickerField";

const useStyles = makeStyles(theme => ({}));
/**
 *
 */
export default function Profile({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const {enqueueSnackbar} = useSnackbar();

  const {data: {me} = {}, loading} = useQuery(gqlMyProfile);
  const [updateProfile, {loading: saving}] = useMutation(gqlUpdateProfile, {
    onCompleted: () => {
      enqueueSnackbar(t("ACTIONS.SUCCESS"), {variant: "success"});
    }
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant={"h2"}>{t("PROFILE.YOUR_PROFILE")}</Typography>
      </Grid>

      <If condition={!loading}>
        <Grid item xs={12}>
          <Formik
            initialValues={pick(me || {}, ["firstName", "lastName", "income", "occupation", "jobArea"])}
            onSubmit={async (values, {setSubmitting}) => {
              await save(values);
              setSubmitting(false);
            }}
            validateOnChange={true}
            validateOnBlur={true}
            validationSchema={object().shape({
              firstName: string().required(t("Required")),
              lastName: string().required(t("Required"))
            })}>
            {({errors, touched, isValid, dirty, resetForm, setSubmitting}) => {
              return (
                <Form>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <BlockContainer>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField name="firstName" label={t("PROFILE.FIRST_NAME")} />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField name="lastName" label={t("PROFILE.LAST_NAME")} />
                          </Grid>
                        </Grid>
                      </BlockContainer>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <BlockContainer title={"Ma situation"}>
                        <Grid container spacing={2} alignItems={"stretch"}>
                          <Grid item xs={12}>
                            <TextField
                              name="income"
                              type={"number"}
                              label={t("PROFILE.INCOME")}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">€ brut mensuel</InputAdornment>
                              }}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <OccupationPickerField label={t("PROFILE.OCCUPATION")} name="occupation" multiple={false} />
                          </Grid>

                          <Grid item xs={12}>
                            <JobAreaPickerField label={t("PROFILE.JOB_AREA")} name="jobArea" multiple={false} />
                          </Grid>
                        </Grid>
                      </BlockContainer>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <BlockContainer title={"Carto.net"}></BlockContainer>
                    </Grid>

                    <Grid item xs={12}>
                      <BlockContainer>
                        <FormButtons
                          errors={errors}
                          touched={touched}
                          isValid={isValid}
                          dirty={dirty}
                          saving={saving}
                          resetForm={resetForm}
                        />
                      </BlockContainer>
                    </Grid>
                  </Grid>
                </Form>
              );
            }}
          </Formik>
        </Grid>
      </If>
    </Grid>
  );

  async function save(objectInput) {
    delete objectInput.occupation;
    delete objectInput.jobArea;

    await updateProfile({
      variables: {
        input: {
          objectId: me.id,
          objectInput
        }
      }
    });
  }
}
