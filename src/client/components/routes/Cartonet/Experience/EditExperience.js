import React, {useState} from "react";
import * as Yup from "yup";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {DialogActions, DialogContent, DialogTitle, Grid, Typography, Checkbox, FormControlLabel, Paper} from "@material-ui/core";
import {useHistory} from "react-router";
import {object} from "yup";
import {useMutation, useQuery} from "@apollo/client";
import {Form, Formik} from "formik";
import {useSnackbar} from "notistack";

import {DatePickerField, FormButtons, TextField, OrganizationPickerField} from "../../../widgets/Form";
import {WishedOccupations} from "../../Project/WishedOccupations";
import {AptitudePicker} from "../../../widgets/Form/AptitudePicker";
import {gqlOccupationFragment} from "../../Profile/gql/MyProfile.gql";
import {gqlUpdateProfile} from "../../Profile/gql/UpdateProfile.gql";
import {prepareMutation} from "../../../../utilities/apollo/prepareMutation";
import {gqlAptitudeFragment} from "../Aptitudes/gql/Aptitude.gql";
import {gqlOrganizationFragment} from "../../../widgets/Autocomplete/OrganizationAutocomplete/gql/Organizations.gql";
import {gqlMyExperiences} from "./gql/MyExperiences.gql";

const useStyles = makeStyles(theme => ({
  categoryTitle: {
    marginTop: theme.spacing(2)
  },
  empty: {
    height: "100%",
    textAlign: "center",
    color: theme.palette.text.emptyHint,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing(2)
  }
}));

/**
 * @param {string} experienceType (experience|training|hobby)
 * @return {JSX.Element}
 * @constructor
 */
export default function EditExperience({experienceType = "experience"} = {}) {
  if (!["experience", "training", "hobby"].includes(experienceType)){
    throw new Error("experience type must be in [\"experience\", \"training\", \"hobby\"]");
  }

  const classes = useStyles();
  const {t} = useTranslation();
  const {enqueueSnackbar} = useSnackbar();
  const history = useHistory();
  const [saveAndResetForm, setSaveAndResetForm] = useState(false);

  const {data: {me} = {}} = useQuery(gqlMyExperiences);
  const [updateProfile, {loading: saving}] = useMutation(gqlUpdateProfile, {
    onCompleted: () => {
      enqueueSnackbar(t("ACTIONS.SUCCESS"), {variant: "success"});
      if (!saveAndResetForm){
        history.goBack();
      }
    }
  });
  return (
    <>
      <DialogTitle>
        {t(`CARTONET.${experienceType.toUpperCase()}.PAGE_TITLE`)}
      </DialogTitle>
      <Formik
        initialValues={{
          title: "",
          description: "",
          startDate: null,
          endDate: null,
          occupations: {edges: []},
          organization: null,
          aptitudes: {edges: []}
        }}
        onSubmit={async (values, {setSubmitting, resetForm}) => {
          await save(values);
          setSubmitting(false);

          if(saveAndResetForm){
            resetForm();
          }
        }}
        validateOnChange={true}
        validateOnBlur={true}
        validationSchema={object().shape({
          title: Yup.string().required("Required"),
          startDate: Yup.date().required("Required"),
          organization: Yup.object().required(),
          aptitudes: Yup.object().shape({
            edges: Yup.array().min(1)
          }),
        })}>
        {({errors, touched, isValid, dirty, resetForm, values}) => {
          const selectedOccupations = values.occupations;
          return (
            <Form>
              <DialogContent>
                <Grid container spacing={6}>
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant={"overline"}> {t(`CARTONET.${experienceType.toUpperCase()}.FORM_DESCRIPTION_LABEL`)}</Typography>
                        <TextField required name="title" label={t("CARTONET.EXPERIENCE.TITLE")} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField name="description" label={t("CARTONET.EXPERIENCE.DESCRIPTION")} multiline />
                      </Grid>
                      <Grid item xs={12}>
                        <OrganizationPickerField label={t(`CARTONET.${experienceType.toUpperCase()}.ORGANIZATION`)} name={"organization"} creatable={true} />
                      </Grid>
                      <Grid item xs={12} container>
                        <Grid item xs={6}>
                          <DatePickerField required name="startDate" label={t("CARTONET.EXPERIENCE.START_DATE")} />
                        </Grid>
                        <Grid item xs={6}>
                          <DatePickerField name="endDate" label={t("CARTONET.EXPERIENCE.END_DATE")} />
                        </Grid>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography className={classes.categoryTitle} variant="overline" display="block">
                          {t(`CARTONET.${experienceType.toUpperCase()}.FORM_OCCUPATIONS_LABEL`)}
                        </Typography>

                        <WishedOccupations dense name={"occupations"} />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant={"overline"}> {t(`CARTONET.${experienceType.toUpperCase()}.FORM_APTITUDES_LABEL`)}</Typography>

                        <Choose>
                          <When condition={selectedOccupations?.edges?.length > 0}>
                            <AptitudePicker
                              dense
                              name={"aptitudes"}
                              filterByRelatedOccupationIds={selectedOccupations.edges.map(
                                ({node: occupation}) => occupation.id
                              )}
                            />
                          </When>
                          <Otherwise>
                            <Paper variant="outlined" className={classes.empty}>
                              {t("CARTONET.EXPERIENCE.PLEASE_SELECT_OCCUPATIONS")}
                            </Paper>
                          </Otherwise>
                        </Choose>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <FormControlLabel
                  control={<Checkbox checked={saveAndResetForm} onChange={(e) => setSaveAndResetForm(e.target.checked)} />}
                  labelPlacement={"start"}
                  label={t("CARTONET.EXPERIENCE.SAVE_AND_ADD_NEW")}
                />
                <FormButtons
                  inDialog
                  errors={errors}
                  touched={touched}
                  isValid={isValid}
                  dirty={dirty}
                  saving={saving}
                  cancelAction={() => {
                    resetForm();
                    history.goBack();
                  }}
                />
              </DialogActions>
            </Form>
          );
        }}
      </Formik>
    </>
  );

  async function save(values) {
    const {objectInput} = prepareMutation({
      values,
      links: [
        {
          name: "organization",
          inputName: "organizationInput",
          targetFragment: gqlOrganizationFragment
        },
        {
          name: "occupations",
          isPlural: true,
          inputName: "occupationInputs",
          deleteInputName: "occupationsInputsToDelete",
          targetFragment: gqlOccupationFragment
        },
        {
          name: "aptitudes",
          isPlural: true,
          inputName: "aptitudeInputs",
          targetFragment: gqlAptitudeFragment,
          nestedLinks: [
            {
              name: "skill",
              inputName: "skillInput"
            },
            {
              name: "person",
              inputName: "personInput"
            },
            {
              name: "rating",
              inputName: "ratingInput"
            }
          ],
          modifyValue: value => ({
            ...value,
            person: {id: me.id},
            rating: {
              range: 5,
              value: 0
            }
          })
        }
      ]
    });

    objectInput.experienceType = experienceType;

    await updateProfile({
      variables: {
        input: {
          objectId: me.id,
          objectInput: {
            experienceInputs: [objectInput]
          }
        }
      }
    });
  }
}
