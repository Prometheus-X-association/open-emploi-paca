import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, Typography} from "@material-ui/core";
import {useHistory} from "react-router";
import {object} from "yup";
import {Form, Formik} from "formik";
import {DatePickerField, FormButtons, TextField, OrganizationPickerField} from "../../../widgets/Form";
import {WishedOccupations} from "../../Project/WishedOccupations";

const useStyles = makeStyles(theme => ({
  categoryTitle: {
    marginTop: theme.spacing(2),
  }
}));

/**
 *
 */
export default function EditExperience({experienceType} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const history = useHistory();

  return (
    <>
      <DialogTitle>
        <Choose>
          <When condition={experienceType === "training"}>Edition de formation</When>
          <When condition={experienceType === "hobby"}>Edition d'expérience extra-professionelle</When>
          <Otherwise>Edition d'expérience</Otherwise>
        </Choose>
      </DialogTitle>
      <Formik
        initialValues={{
          title: "",
          description: "",
          startDate: null,
          endDate: null,
          occupations: {edges: []},
          organization: {
            name: ""
          }
        }}
        onSubmit={async (values, {setSubmitting}) => {
          await save(values);
          setSubmitting(false);
        }}
        validateOnChange={true}
        validateOnBlur={true}
        validationSchema={object().shape({})}>
        {({errors, touched, isValid, dirty, resetForm, setSubmitting}) => {
          return (
            <Form>
              <DialogContent>
                <Grid container>
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant={"overline"}> {t("CARTONET.EXPERIENCE.FORM_DESCRIPTION_LABEL")}</Typography>

                        <TextField name="title" label={t("CARTONET.EXPERIENCE.TITLE")} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField name="description" label={t("CARTONET.EXPERIENCE.DESCRIPTION")} />
                      </Grid>
                      <Grid item xs={12}>
                        <OrganizationPickerField name={"organization"} creatable={true}/>
                      </Grid>
                      <Grid item xs={12} container>
                        <Grid item xs={6}>
                          <DatePickerField name="startDate" label={t("CARTONET.EXPERIENCE.START_DATE")} />
                        </Grid>
                        <Grid item xs={6}>
                          <DatePickerField name="endDate" label={t("CARTONET.EXPERIENCE.END_DATE")} />
                        </Grid>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography className={classes.categoryTitle} variant="overline" display="block">
                          {t("CARTONET.EXPERIENCE.FORM_DESCRIPTION_OCCUPATIONS")}
                        </Typography>

                        <WishedOccupations name={"occupations"} />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={6}></Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <FormButtons
                  errors={errors}
                  touched={touched}
                  isValid={isValid}
                  dirty={dirty}
                  saving={false}
                  resetForm={resetForm}
                />
              </DialogActions>
            </Form>
          );
        }}
      </Formik>
    </>
  );
}
