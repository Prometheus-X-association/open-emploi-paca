import {useEffect, useRef, useState} from "react";
import * as Yup from "yup";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Typography,
  Button,
  Paper,
  Dialog
} from "@material-ui/core";
import {useHistory, useParams, generatePath, matchPath} from "react-router";
import {object} from "yup";
import {useLazyQuery, useMutation, useQuery} from "@apollo/client";
import {Form, Formik} from "formik";
import {useSnackbar} from "notistack";

import {DatePickerField, FormButtons, TextField, OrganizationPickerField} from "../../../widgets/Form";
import {WishedOccupations} from "../../Project/WishedOccupations";
import {AptitudePicker} from "../Aptitudes/AptitudePicker";
import {gqlOccupationFragment} from "../../Profile/gql/MyProfile.gql";
import {prepareMutation} from "../../../../utilities/apollo/prepareMutation";
import {gqlAptitudeFragment} from "../Aptitudes/gql/Aptitude.gql";
import {gqlOrganizationFragment} from "../../../widgets/Autocomplete/OrganizationAutocomplete/gql/Organizations.gql";
import {gqlMyExperiences} from "./gql/MyExperiences.gql";
import {gqlExperience} from "./gql/Experience.gql";

import clsx from "clsx";
import {gqlUpdateExperience} from "./gql/UpdateExperience.gql";
import {ExperienceItem} from "../Cartography/Cartography";
import {gqlCreateExperience} from "./gql/CreateExperience.gql";
import {ROUTES} from "../../../../routes";
import {gqlRemoveExperience} from "./gql/RemoveExperience.gql";
import {LoadingButton} from "../../../widgets/Button/LoadingButton";

const useStyles = makeStyles(theme => ({
  categoryTitle: {
    marginTop: theme.spacing(2)
  },
  fullscreen: {
    overflowY: "initial"
  },
  aptitudes: {
    marginTop: theme.spacing(2)
  },
  onTheFlyExperiences: {
    padding: theme.spacing(2)
  }
}));

/**
 * @param {string} experienceType (experience|training|hobby)
 * @param {boolean} fullscreen
 * @return {JSX.Element}
 * @constructor
 */
export default function EditExperience({experienceType = "experience", fullscreen} = {}) {
  if (!["experience", "training", "hobby"].includes(experienceType)) {
    throw new Error('experience type must be in ["experience", "training", "hobby"]');
  }

  let {id} = useParams();

  if (id) {
    id = decodeURIComponent(id);
  }

  const classes = useStyles();
  const {t} = useTranslation();
  const {enqueueSnackbar} = useSnackbar();
  const history = useHistory();
  const [saveAndResetForm, setSaveAndResetForm] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const selectedAptitudeRefContainer = useRef(null);
  const [editingExperience, setEditingExperience] = useState(null);
  const [onTheFlyExperiences, setOnTheFlyExperiences] = useState([]);

  const {data: {me} = {}} = useQuery(gqlMyExperiences);
  const [getExperience, {data: {experience} = {}, loading: loadingExperience}] = useLazyQuery(gqlExperience, {
    fetchPolicy: "network-only"
  });

  const [createExperience, {loading: savingProfile}] = useMutation(gqlCreateExperience, {
    onCompleted: handleSaveCompleted
  });

  const [updateExperience, {loading: savingExperience}] = useMutation(gqlUpdateExperience, {
    onCompleted: handleSaveCompleted
  });

  const [removeExperience, {loading: removingExperience}] = useMutation(gqlRemoveExperience, {
    onCompleted: handleRemoveCompleted
  });

  const saving = savingProfile || savingExperience;

  useEffect(() => {
    if (id) {
      getExperience({
        variables: {
          id
        }
      });
    }
  }, [id]);

  useEffect(() => {
    if (editingExperience?.id !== experience?.id) {
      setEditingExperience(experience);
    }
  }, [experience?.id, loadingExperience]);

  return (
    <>
      <DialogTitle>{t(`CARTONET.${experienceType.toUpperCase()}.PAGE_TITLE`)}</DialogTitle>
      <Formik
        enableReinitialize={true}
        initialValues={
          editingExperience || {
            title: "",
            description: "",
            startDate: null,
            endDate: null,
            occupations: {edges: []},
            organization: null,
            aptitudes: {edges: []}
          }
        }
        onSubmit={async (values, {setSubmitting, resetForm}) => {
          await save(values);
          setSubmitting(false);
          resetForm();
        }}
        validateOnChange={true}
        validateOnBlur={true}
        validationSchema={object().shape({
          title: Yup.string().required("Required"),
          startDate: Yup.date().required("Required"),
          organization: Yup.object().required()
        })}>
        {({errors, touched, isValid, dirty, resetForm, values}) => {
          const selectedOccupations = values.occupations;
          return (
            <Form>
              <DialogContent className={clsx({[classes.fullscreen]: fullscreen})}>
                <Grid container spacing={6}>
                  <Grid item xs={12} md={6} container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant={"overline"}>
                        {" "}
                        {t(`CARTONET.${experienceType.toUpperCase()}.FORM_DESCRIPTION_LABEL`)}
                      </Typography>
                      <TextField required name="title" label={t("CARTONET.EXPERIENCE.TITLE")} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField name="description" label={t("CARTONET.EXPERIENCE.DESCRIPTION")} multiline />
                    </Grid>
                    <Grid item xs={12}>
                      <OrganizationPickerField
                        label={t(`CARTONET.${experienceType.toUpperCase()}.ORGANIZATION`)}
                        name={"organization"}
                        creatable={true}
                      />
                    </Grid>
                    <Grid item xs={12} container>
                      <Grid item xs={6}>
                        <DatePickerField required name="startDate" label={t("CARTONET.EXPERIENCE.START_DATE")} />
                      </Grid>
                      <Grid item xs={6}>
                        <DatePickerField name="endDate" label={t("CARTONET.EXPERIENCE.END_DATE")} />
                      </Grid>
                    </Grid>

                    <Grid item xs={12} container spacing={2} className={classes.aptitudes}>
                      <Grid item xs={12}>
                        <Typography variant={"overline"}>
                          {" "}
                          {t(`CARTONET.${experienceType.toUpperCase()}.FORM_APTITUDES_LABEL`)}
                        </Typography>

                        <div ref={selectedAptitudeRefContainer}></div>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Grid item xs={12}>
                      <Typography className={classes.categoryTitle} variant="overline" display="block">
                        {t(`CARTONET.${experienceType.toUpperCase()}.FORM_OCCUPATIONS_LABEL`)}
                      </Typography>

                      <WishedOccupations dense name={"occupations"} includeLeafOccupations={true} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant={"overline"}>
                        {" "}
                        {t(`CARTONET.${experienceType.toUpperCase()}.FORM_EXISTING_APTITUDES_LABEL`)}
                      </Typography>

                      <AptitudePicker
                        dense
                        name={"aptitudes"}
                        filterByRelatedOccupationIds={selectedOccupations.edges.map(
                          ({node: occupation}) => occupation.id
                        )}
                        selectedAptitudeRefContainer={selectedAptitudeRefContainer}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <If condition={editingExperience}>
                  <Button variant={"contained"} color={"secondary"} onClick={() => setDeleteModalOpen(true)}>
                    {t("ACTIONS.DELETE")}
                  </Button>
                  <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                    <DialogTitle>
                      {t("CARTONET.EXPERIENCE.REMOVE")}
                    </DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        {t("CARTONET.EXPERIENCE.REMOVE_SURE", {name: experience.title})}
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <LoadingButton loading={removingExperience} variant={"contained"} color={"secondary"} onClick={handleRemove}>
                        {t("ACTIONS.DELETE")}
                      </LoadingButton>
                      <Button  onClick={() => setDeleteModalOpen(false)}>
                        {t("ACTIONS.CANCEL")}
                      </Button>
                    </DialogActions>
                  </Dialog>
                </If>
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

      <If condition={onTheFlyExperiences.length > 0}>
        <Paper variant={"outlined"} className={classes.onTheFlyExperiences}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography>{t("CARTONET.EXPERIENCE.ON_THE_FLY_EXPERIENCES")}</Typography>
            </Grid>
            {onTheFlyExperiences.map(experience => (
              <Grid item xs={12}>
                <ExperienceItem experience={experience} key={experience.id} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </If>
    </>
  );

  async function save(mutatingExperience) {
    const {objectInput} = prepareMutation({
      entity: experience,
      values: mutatingExperience,
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
          modifyValue: aptitude => {
            if (aptitude.skill?.aptitudeId) {
              return {
                id: aptitude.skill?.aptitudeId
              };
            } else {
              return {
                ...aptitude,
                person: {id: me.id},
                rating: {
                  range: 5,
                  value: 0
                }
              };
            }
          }
        }
      ]
    });

    objectInput.experienceType = experienceType;

    if (!!editingExperience) {
      await updateExperience({
        variables: {
          input: {
            objectId: editingExperience.id,
            objectInput
          }
        }
      });

      mutatingExperience.id = editingExperience.id;
    } else {
      const {data: {createExperience: {createdObject = {}} = {}} = {}} = await createExperience({
        variables: {
          input: {
            objectInput: {
              ...objectInput,
              personInput: {
                id: me.id
              }
            }
          }
        }
      });

      mutatingExperience.id = createdObject?.id;
    }

    saveOnTheFlyExperience(mutatingExperience);
  }

  function handleSaveCompleted({message} = {}) {
    enqueueSnackbar(message || t("ACTIONS.SUCCESS"), {
      variant: "success",
      anchorOrigin: {horizontal: "right", vertical: "bottom"}
    });

    setEditingExperience(null);
    history.replace(getEditLink());
  }

  function handleRemoveCompleted(){
    handleSaveCompleted({
      message: t("ACTIONS.SUCCESS_DELETE")
    });
  }


  async function handleRemove(){
    if(editingExperience){
      await removeExperience({
        variables: {
          input: {
            objectId: editingExperience.id
          }
        }
      });
      removeOnTheFlyExperience(editingExperience);
    }
    setDeleteModalOpen(false);
  }

  function saveOnTheFlyExperience(experience) {
    const indexOf = onTheFlyExperiences.findIndex(onTheFlyExperience => onTheFlyExperience.id === experience.id);

    if (indexOf >= 0) {
      onTheFlyExperiences.splice(indexOf, 1, experience);
    } else {
      onTheFlyExperiences.push(experience);
      onTheFlyExperiences.sort((experienceA, experienceB) => {
        return 0;
      });
    }

    setOnTheFlyExperiences([...onTheFlyExperiences]);
  }

  function removeOnTheFlyExperience(experience) {
    const indexOf = onTheFlyExperiences.findIndex(onTheFlyExperience => onTheFlyExperience.id === experience.id);

    if (indexOf >= 0) {
      onTheFlyExperiences.splice(indexOf, 1);
      setOnTheFlyExperiences([...onTheFlyExperiences]);
    }
  }

  function getEditLink() {
    const location = history.location.pathname.replace(ROUTES.PROFILE, "");

    let route = ROUTES.CARTONET_EDIT_EXPERIENCE;

    if(!!matchPath(location, {path: ROUTES.CARTONET_EDIT_TRAINING, exact: false, strict: false})){
      route = ROUTES.CARTONET_EDIT_TRAINING;
    } else if(!!matchPath(location, {path: ROUTES.CARTONET_EDIT_HOBBY, exact: false, strict: false})) {
      route = ROUTES.CARTONET_EDIT_HOBBY;
    }

    // This is a hack to guess if we are in cartonet standalone mode or in openemploi.
    if (!!matchPath(history.location.pathname, {path: ROUTES.PROFILE, exact: false, strict: false})) {
      route = `${ROUTES.PROFILE}${route}`;
    }

    return generatePath(route);
  }
}
