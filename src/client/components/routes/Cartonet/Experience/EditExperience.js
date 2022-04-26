import {useEffect, useRef, useState} from "react";
import * as Yup from "yup";
import dayjs from "dayjs";
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
  Dialog,
  Tabs,
  Tab,
  Badge,
  CircularProgress
} from "@material-ui/core";
import {useHistory, useParams} from "react-router-dom";
import {object} from "yup";
import {useLazyQuery, useMutation, makeReference} from "@apollo/client";
import {Form, Formik} from "formik";
import {useSnackbar} from "notistack";
import {
  prepareMutation,
  MutationConfig,
  LinkInputDefinition,
  DynamicFormDefinition
} from "@mnemotix/synaptix-client-toolkit";

import {DatePickerField, FormButtons, TextField, OrganizationPickerField} from "../../../widgets/Form";
import {WishedOccupations} from "../../Project/WishedOccupations";
import {AptitudePicker} from "../Aptitudes/AptitudePicker";
import {gqlOccupationFragment} from "../../Profile/gql/MyProfile.gql";
import {gqlAptitudeFragment} from "../Aptitudes/gql/Aptitude.gql";
import {gqlOrganizationFragment} from "../../../widgets/Autocomplete/OrganizationAutocomplete/gql/Organizations.gql";
import {gqlExperience, gqlExperienceFragment} from "./gql/Experience.gql";

import {gqlUpdateExperience} from "./gql/UpdateExperience.gql";
import {gqlCreateExperience} from "./gql/CreateExperience.gql";
import {ROUTES} from "../../../../routes";
import {gqlRemoveExperience} from "./gql/RemoveExperience.gql";
import {LoadingButton} from "../../../widgets/Button/LoadingButton";
import {CartonetEditLayout} from "../CartonetEditLayout";
import {Link} from "react-router-dom";
import {generateCartonetEditExperiencePath, generateCartonetPath} from "../utils/generateCartonetPath";
import Experiences from "../Cartography/Experiences";
import {useLoggedUser} from "../../../../hooks/useLoggedUser";

const useStyles = makeStyles((theme) => ({
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
  },
  tabs: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(-4),
    border: `1px solid ${theme.palette.grey[200]}`,
    borderBottom: 0
  },
  experiencesContainer: {
    borderRight: `1px solid ${theme.palette.grey[200]}`
  },
  form: {
    padding: theme.spacing(2)
  },
  actions: {
    padding: theme.spacing(1),
    flexBasis: theme.spacing(7),
    background: "white",
    zIndex: 3,
    borderTop: `1px solid ${theme.palette.grey[200]}`,
    margin: 0
  },
  button: {
    marginRight: theme.spacing(1)
  },
  red: {
    color: theme.palette.error.main
  },
  badge: {
    margin: theme.spacing(0, 1.5)
  }
}));

/**
 * @param {string} experienceType (experience|training|hobby)
 * @return {JSX.Element}
 * @constructor
 */
export default function EditExperience({experienceType = "experience"} = {}) {
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const selectedAptitudeRefContainer = useRef(null);
  const [editingExperience, setEditingExperience] = useState(null);

  const {user: me} = useLoggedUser() || {};
  const [getExperience, {data: {experience} = {}, loading: loadingExperience}] = useLazyQuery(gqlExperience);
  const [createExperience, {loading: savingProfile}] = useMutation(gqlCreateExperience);
  const [updateExperience, {loading: savingExperience}] = useMutation(gqlUpdateExperience);
  const [removeExperience, {loading: removingExperience}] = useMutation(gqlRemoveExperience);

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
    if (!id) {
      setEditingExperience(null);
    } else if (!loadingExperience && experience && experience.id !== editingExperience?.id) {
      setEditingExperience(experience);
    }
  }, [id, experience]);

  return (
    <CartonetEditLayout
      actions={
        <>
          <Button
            variant={"contained"}
            component={Link}
            to={generateCartonetPath({history, route: ROUTES.CARTONET_EXTRACT_SKILLS_FROM_CV})}>
            {t("ACTIONS.PREVIOUS")}
          </Button>
          <Button
            variant={"contained"}
            component={Link}
            to={generateCartonetPath({history, route: ROUTES.CARTONET_EDIT_APTITUDES})}>
            {t("ACTIONS.NEXT")}
          </Button>
        </>
      }
      description={
        <>
          <p>
            Vous allez pouvoir saisir vos compétences et les affecter à des expériences. Ces expériences peuvent être
            professionnelles (les différents emplois que vous avez occupés), des formations (scolaires ou non), ou
            extra-professionnelles (associations, hobbies, …).
          </p>
          <p className={classes.red}>
            Commencer par renseigner les champs obligatoires * de l’Expérience (
            <Badge badgeContent={"1"} color="error" className={classes.badge} />
            ), puis les Métiers sélectionnés pour l’expérience (
            <Badge badgeContent={"2"} color="error" className={classes.badge} />) pour enfin Sélectionner les
            compétences associées à cette expérience (
            <Badge badgeContent={"3"} color="error" className={classes.badge} />
            ).
          </p>
          <p>
            Cette sélection se fait soit sur le pool de compétences déjà saisies (extraites de votre CV ou déjà
            sélectionnées sur une expérience précédente) soit en lien avec un métier que vous indiquez.
          </p>

          <Tabs
            value={experienceType}
            className={classes.tabs}
            onChange={(e, experienceType) => handleNavigateTo(experienceType)}>
            <Tab value={"experience"} label={t(`CARTONET.EXPERIENCE.PAGE_TITLE`)} />
            <Tab value={"training"} label={t(`CARTONET.TRAINING.PAGE_TITLE`)} />
            <Tab value={"hobby"} label={t(`CARTONET.HOBBY.PAGE_TITLE`)} />
          </Tabs>
        </>
      }>
      <Grid container className={classes.content}>
        <Grid xs={3} item container wrap={"nowrap"} direction={"column"} className={classes.experiencesContainer}>
          <Grid xs item className={classes.experiences}>
            <Experiences aptitudesDisabled experienceType={experienceType} />
          </Grid>
          <Grid item container className={classes.actions} justify={"center"}>
            <Button
              size={"small"}
              variant={"contained"}
              color={"secondary"}
              onClick={() => handleNavigateTo(experienceType)}>
              {t("CARTONET.ACTIONS.ADD_EXPERIENCE")}
            </Button>
          </Grid>
        </Grid>
        <Grid xs={9} item>
          <Choose>
            <When condition={loadingExperience}>
              <CircularProgress />
            </When>
            <Otherwise>{renderExperienceForm()}</Otherwise>
          </Choose>
        </Grid>
      </Grid>
    </CartonetEditLayout>
  );

  function renderExperienceForm() {
    console.log(editingExperience);
    return (
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
              <Grid container direction={"column"} wrap={"nowrap"} className={classes.editor}>
                <Grid xs item container spacing={6} className={classes.form}>
                  <Grid item xs={12} md={6} container spacing={2}>
                    <Grid item xs={12}>
                      <Grid container alignItems="center">
                        <Grid item xs>
                          <Typography variant={"overline"}>
                            {t(`CARTONET.${experienceType.toUpperCase()}.FORM_DESCRIPTION_LABEL`)}{" "}
                          </Typography>
                        </Grid>
                        <Grid>
                          <Badge badgeContent={"1"} color="error" className={classes.badge} />
                        </Grid>
                      </Grid>

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
                        required
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

                    <Grid item xs={12}>
                      <Grid container alignItems="center" className={classes.categoryTitle}>
                        <Grid item xs>
                          <Typography variant="overline" display="block">
                            {t(`CARTONET.${experienceType.toUpperCase()}.FORM_OCCUPATIONS_LABEL`)}{" "}
                          </Typography>
                        </Grid>
                        <Grid>
                          <Badge badgeContent={"2"} color="error" className={classes.badge} />
                        </Grid>
                      </Grid>

                      <WishedOccupations dense name={"occupations"} includeLeafOccupations={true} />
                    </Grid>

                    <Grid item xs={12} container spacing={2} className={classes.aptitudes}>
                      <Grid item xs={12}>
                        <Typography variant={"overline"}>
                          {t(`CARTONET.${experienceType.toUpperCase()}.FORM_APTITUDES_LABEL`)}
                        </Typography>

                        <div ref={selectedAptitudeRefContainer}></div>
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Grid item xs={12}>
                      <Grid container alignItems="center">
                        <Grid item xs>
                          <Typography variant={"overline"}>
                            {t(`CARTONET.${experienceType.toUpperCase()}.FORM_EXISTING_APTITUDES_LABEL`)}
                          </Typography>
                        </Grid>
                        <Grid>
                          <Badge badgeContent={"3"} color="error" className={classes.badge} />
                        </Grid>
                      </Grid>

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
                <Grid item container className={classes.actions} justify={"flex-end"}>
                  <If condition={editingExperience}>
                    <Grid item className={classes.button}>
                      <Button variant={"contained"} color={"secondary"} onClick={() => setDeleteModalOpen(true)}>
                        {t("ACTIONS.DELETE")}
                      </Button>
                      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
                        <DialogTitle>{t("CARTONET.EXPERIENCE.REMOVE")}</DialogTitle>
                        <DialogContent>
                          <DialogContentText>
                            {t("CARTONET.EXPERIENCE.REMOVE_SURE", {name: editingExperience.title})}
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <LoadingButton
                            loading={removingExperience}
                            variant={"contained"}
                            color={"secondary"}
                            onClick={handleRemove}>
                            {t("ACTIONS.DELETE")}
                          </LoadingButton>
                          <Button onClick={() => setDeleteModalOpen(false)}>{t("ACTIONS.CANCEL")}</Button>
                        </DialogActions>
                      </Dialog>
                    </Grid>
                  </If>
                  <Grid item>
                    <FormButtons
                      inDialog
                      errors={errors}
                      touched={touched}
                      isValid={isValid}
                      dirty={dirty}
                      saving={saving}
                      resetForm={resetForm}
                      buttonVariant={"contained"}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Form>
          );
        }}
      </Formik>
    );
  }

  function getMutationConfig() {
    return new MutationConfig({
      scalarInputNames: ["title", "description", "startDate", "endDate"],
      linkInputDefinitions: [
        new LinkInputDefinition({
          name: "organization",
          inputName: "organizationInput",
          targetObjectFormDefinition: new DynamicFormDefinition({
            mutationConfig: new MutationConfig({
              gqlFragment: gqlOrganizationFragment
            })
          })
        }),
        new LinkInputDefinition({
          name: "occupations",
          inputName: "occupationInputs",
          isPlural: true,
          targetObjectFormDefinition: new DynamicFormDefinition({
            mutationConfig: new MutationConfig({
              gqlFragment: gqlOccupationFragment
            })
          })
        }),
        new LinkInputDefinition({
          name: "aptitudes",
          inputName: "aptitudeInputs",
          isPlural: true,
          targetObjectFormDefinition: new DynamicFormDefinition({
            mutationConfig: new MutationConfig({
              gqlFragment: gqlAptitudeFragment
            })
          }),
          nestedLinks: [
            new LinkInputDefinition({
              name: "skill",
              inputName: "skillInput"
            }),
            new LinkInputDefinition({
              name: "person",
              inputName: "personInput"
            }),
            new LinkInputDefinition({
              name: "rating",
              inputName: "ratingInput"
            })
          ],
          modifyValue: (aptitude) => {
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
        })
      ],
      gqlFragment: gqlExperienceFragment
    });
  }

  async function save(mutatingExperience) {
    const {objectInput, updateCache} = prepareMutation({
      initialObject: editingExperience,
      mutatedObject: mutatingExperience,
      mutationConfig: getMutationConfig()
    });

    objectInput.experienceType = experienceType;

    if (!!editingExperience) {
      await updateExperience({
        variables: {
          input: {
            objectId: editingExperience.id,
            objectInput
          }
        },
        update: (...props) => {
          updateCache(...props);
        }
      });
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
        },
        update: (cache, {data: {createExperience: {createdObject} = {}} = {}}) => {
          cache.modify({
            id: cache.identify(makeReference("ROOT_QUERY")),
            fields: {
              experiences(connection, {readField}) {
                let mutatedEdges = [...connection.edges];
                const newExperienceEdge = {
                  __typename: "ExperienceEdge",
                  node: cache.writeFragment({
                    id: createdObject.id,
                    fragment: gqlExperienceFragment,
                    data: {
                      id: createdObject.id,
                      experienceType,
                      ...mutatingExperience
                    }
                  })
                };

                let position = mutatedEdges.findIndex((mutatedEdge) => {
                  const startDate = readField("startDate", readField("node", mutatedEdge));
                  return dayjs(startDate).isAfter(mutatingExperience.startDate);
                });

                if (position >= 0) {
                  mutatedEdges.splice(position, 0, newExperienceEdge);
                } else {
                  mutatedEdges.push(newExperienceEdge);
                }

                return {
                  ...connection,
                  edges: mutatedEdges
                };
              }
            }
          });
        }
      });

      mutatingExperience.id = createdObject.id;
    }

    setEditingExperience(mutatingExperience);
    handleSaveCompleted();
  }

  function handleSaveCompleted({message} = {}) {
    enqueueSnackbar(message || t("ACTIONS.SUCCESS"), {
      variant: "success"
    });
  }

  function handleRemoveCompleted() {
    handleSaveCompleted({
      message: t("ACTIONS.SUCCESS_DELETE")
    });
  }

  async function handleRemove() {
    if (editingExperience) {
      await removeExperience({
        variables: {
          input: {
            objectId: editingExperience.id
          }
        },
        update: (cache) => {
          cache.modify({
            id: cache.identify(makeReference("ROOT_QUERY")),
            fields: {
              experiences(connection, {readField}) {
                return {
                  ...connection,
                  edges: connection.edges.filter((experienceEdge) => {
                    return editingExperience.id !== readField("id", readField("node", experienceEdge));
                  })
                };
              }
            }
          });
        }
      });

      handleNavigateTo(experienceType);
      handleRemoveCompleted();
    }
    setEditingExperience(null);
    setDeleteModalOpen(false);
  }

  function handleNavigateTo(experienceType) {
    history.push(
      generateCartonetPath({
        route: ROUTES[`CARTONET_EDIT_${experienceType.toUpperCase()}`],
        history
      })
    );
    setEditingExperience(null);
  }
}
