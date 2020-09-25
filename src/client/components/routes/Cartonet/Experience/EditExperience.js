import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel} from "@material-ui/core";
import {useHistory} from "react-router";
import {object} from "yup";
import {Form, Formik} from "formik";
import {DatePickerField, FormButtons, TextField} from "../../../widgets/Form";
import {WishedOccupations} from "../../Project/WishedOccupations";

const useStyles = makeStyles(theme => ({
  occupations: {
    width: "100%",
    marginTop: theme.spacing(1)
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
          occupations: {edges: []}
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
                        <TextField name="title" label={t("CARTONET.EXPERIENCE.TITLE")} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField name="description" label={t("CARTONET.EXPERIENCE.DESCRIPTION")} />
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
                        <FormControl className={classes.occupations}>
                          <InputLabel shrink={true}>{t("CARTONET.EXPERIENCE.OCCUPATIONS")}</InputLabel>
                          <WishedOccupations name={"occupations"} />
                        </FormControl>
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
