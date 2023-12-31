import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { Grid, InputAdornment, Typography, Button } from "@material-ui/core";
import { useMutation, useQuery } from "@apollo/client";
import { Form, Formik } from "formik";
import { object, string } from "yup";
import pick from "lodash/pick";
import { BlockContainer } from "../../widgets/BlockContainer";
import {
  FormButtons,
  OccupationPickerField,
  TextField,
} from "../../widgets/Form";

import { gqlMyProfile, gqlMyProfileFragment } from "./gql/MyProfile.gql";
import { gqlUpdateProfile } from "./gql/UpdateProfile.gql";
import { useSnackbar } from "notistack";
import { JobAreaPickerField } from "../../widgets/Form/JobAreaPickerField";
import { prepareMutation } from "../../../utilities/apollo/prepareMutation";
import { gqlJobAreaFragment, gqlOccupationFragment } from "./gql/MyProfile.gql";
import { CartonetModal } from "../Cartonet/CartonetModal";
import { ROUTES } from "../../../routes";
import LogoMM from "../../../assets/logo-mm.png";
import LogoWever from "../../../assets/logo-wever.png";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import { generateCartonetPath } from "../Cartonet/generateCartonetPath";
import { MutationConfig } from "../../../utilities/apollo";
import {
  DynamicFormDefinition,
  LinkInputDefinition,
} from "../../../utilities/form";

const useStyles = makeStyles((theme) => ({
  cartoNetSubHeader: {
    lineHeight: "initial",
    margin: [theme.spacing(1, 0)],
  },
  logoInsert: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
    width: theme.spacing(10),
  },
  cartonetCatchPhrase: {
    marginTop: theme.spacing(2),
  },
  cartonetButton: {
    marginTop: theme.spacing(10),
    textAlign: "center",
  },
  strong: {
    fontWeight: "bold",
  },
}));
/**
 *
 */
export default function Profile({} = {}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const { data: { me } = {}, loading } = useQuery(gqlMyProfile);
  const [updateProfile, { loading: saving }] = useMutation(gqlUpdateProfile, {
    onCompleted: () => {
      enqueueSnackbar(t("ACTIONS.SUCCESS"), { variant: "success" });
    },
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant={"h2"}>{t("PROFILE.YOUR_PROFILE")}</Typography>
      </Grid>

      <If condition={!loading}>
        <Grid item xs={12}>
          <Formik
            initialValues={pick(me || {}, [
              "firstName",
              "lastName",
              "income",
              "occupation",
              "jobArea",
              "spouseOccupation",
            ])}
            onSubmit={async (values, { setSubmitting }) => {
              await save(values);
              setSubmitting(false);
            }}
            validateOnChange={true}
            validateOnBlur={true}
            validationSchema={object().shape({
              firstName: string().required(t("Required")),
              lastName: string().required(t("Required")),
            })}
          >
            {({
              errors,
              touched,
              isValid,
              dirty,
              resetForm,
              setSubmitting,
            }) => {
              return (
                <Form>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <BlockContainer>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              name="firstName"
                              label={t("PROFILE.FIRST_NAME")}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              name="lastName"
                              label={t("PROFILE.LAST_NAME")}
                            />
                          </Grid>
                        </Grid>
                      </BlockContainer>
                    </Grid>

                    <Grid item xs={12}>
                      <BlockContainer title={"Ma situation"}>
                        <Grid container spacing={4} alignItems={"stretch"}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              name="income"
                              type={"number"}
                              label={t("PROFILE.INCOME")}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    € brut mensuel
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <OccupationPickerField
                              label={t("PROFILE.OCCUPATION")}
                              name="occupation"
                              multiple={false}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <JobAreaPickerField
                              label={t("PROFILE.JOB_AREA")}
                              name="jobArea"
                              multiple={false}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <OccupationPickerField
                              label={t("PROFILE.SPOUSE_OCCUPATION")}
                              name="spouseOccupation"
                              multiple={false}
                            />
                          </Grid>
                        </Grid>
                      </BlockContainer>
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

        <Grid item xs={12} md={6}>
          <BlockContainer title={"Mon profil de compétences (Carto.net)"}>
            <img src={LogoMM} alt={"Logo MM"} className={classes.logoInsert} />
            <p className={classes.cartonetCatchPhrase}>
              <p>
                L’application Carto.net permet de créer votre profil de
                compétences au regard de vos différentes expériences
                (professionnelles, de formation, extra professionnelles).
              </p>
              <p>
                Ce profil est utilisé par les fonctionnalités du Diagnostic 360°
                pour affiner le gap de compétences à acquérir pour accéder aux
                métiers que vous envisagez ou qui vous sont suggérés.
              </p>
              <p>
                A termes, ce profil vous permettra d’avoir un parcours de
                formation individualisé.
              </p>
            </p>

            <Choose>
              <When condition={me.aptitudesCount === 0}>
                <p className={classes.strong}>
                  Laissez vous guider dans la création de votre profil de
                  compétences.
                </p>
                <div className={classes.cartonetButton}>
                  <Button
                    variant={"contained"}
                    color={"secondary"}
                    component={Link}
                    to={generateCartonetPath({
                      history,
                      route: ROUTES.CARTONET_EXTRACT_SKILLS_FROM_CV,
                    })}
                  >
                    Créer votre profil de compétences
                  </Button>
                </div>
              </When>
              <Otherwise>
                <p className={classes.strong}>
                  Vous pouvez visualiser/modifier votre profil de compétences.
                </p>
                <div className={classes.cartonetButton}>
                  <Button
                    variant={"contained"}
                    color={"secondary"}
                    component={Link}
                    to={generateCartonetPath({
                      history,
                      route: ROUTES.CARTONET_SHOW_PROFILE,
                    })}
                  >
                    Visualiser/Modifier votre profil de compétences
                  </Button>
                </div>
              </Otherwise>
            </Choose>
            <CartonetModal />
          </BlockContainer>
        </Grid>

        <Grid item xs={12} md={6}>
          <BlockContainer title={"Mon profil de mobilité (WeDiag)"}>
            <img
              src={LogoWever}
              alt={"Logo Wever"}
              className={classes.logoInsert}
            />
          </BlockContainer>
        </Grid>
      </If>
    </Grid>
  );

  async function save(mutatedObject) {
    const { objectInput, updateCache } = prepareMutation({
      initialObject: me,
      mutatedObject,
      mutationConfig: new MutationConfig({
        scalarInputNames: ["firstName", "lastName", "income"],
        linkInputDefinitions: [
          new LinkInputDefinition({
            name: "occupation",
            inputName: "occupationInput",
            targetObjectFormDefinition: new DynamicFormDefinition({
              mutationConfig: new MutationConfig({
                gqlFragment: gqlOccupationFragment,
              }),
            }),
          }),
          new LinkInputDefinition({
            name: "spouseOccupation",
            inputName: "spouseOccupationInput",
            targetObjectFormDefinition: new DynamicFormDefinition({
              mutationConfig: new MutationConfig({
                gqlFragment: gqlOccupationFragment,
              }),
            }),
          }),
          new LinkInputDefinition({
            name: "jobArea",
            inputName: "jobAreaInput",
            targetObjectFormDefinition: new DynamicFormDefinition({
              mutationConfig: new MutationConfig({
                gqlFragment: gqlJobAreaFragment,
              }),
            }),
          }),
        ],
        gqlFragment: gqlMyProfileFragment,
      }),
    });

    await updateProfile({
      variables: {
        input: {
          objectId: me.id,
          objectInput,
        },
      },
      update: updateCache,
    });
  }
}
