import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Grid, Typography, InputAdornment} from "@material-ui/core";
import {useMutation, useQuery} from "@apollo/react-hooks";
import {Form, Formik} from "formik";
import {object, string} from "yup";
import pick from "lodash/pick";

import {BlockContainer} from "../../widgets/BlockContainer";
import {TextField, OccupationPickerField, FormButtons} from "../../widgets/Form";

import {gqlMe} from "./gql/Me.gql";
import {gqlUpdateProfile} from "./gql/UpdateProfile.gql";
import {useSnackbar} from "notistack";

const useStyles = makeStyles(theme => ({}));
/**
 *
 */
export default function Profile({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const {enqueueSnackbar} = useSnackbar();

  const {data, loading} = useQuery(gqlMe);
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
            initialValues={pick(data?.me || {}, ["firstName", "lastName", "income", "occupation"])}
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

                    <Grid item container xs={12} spacing={2} alignItems="stretch">
                      <Grid item xs={12} md={6}>
                        <BlockContainer title={"Ma situation"}>
                          <Grid container spacing={2}>
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
                              <TextField
                                disabled
                                name={"location"}
                                label={t("PROFILE.LOCATION")}
                              />
                            </Grid>
                          </Grid>
                        </BlockContainer>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <BlockContainer title={"Carto.net"}>

                        </BlockContainer>
                      </Grid>
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
    await updateProfile({
      variables: {
        input: {
          objectId: data.me.id,
          objectInput
        }
      }
    });
  }
}
