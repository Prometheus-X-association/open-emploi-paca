import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Grid, InputAdornment, List, ListItem, Typography, ListSubheader, Divider} from "@material-ui/core";
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
import {prepareMutation} from "../../../utilities/apollo/prepareMutation";
import {gqlJobAreaFragment, gqlOccupationFragment} from "./gql/MyProfile.gql";
import {createLink} from "../../../utilities/createLink";
import {CartonetModal} from "../Cartonet/CartonetModal";
import {ROUTES} from "../../../routes";
import LogoMM from "../../../assets/logo-mm.png";
import LogoWever from "../../../assets/logo-wever.png";
import {generatePath} from "react-router";

const useStyles = makeStyles(theme => ({
  cartoNetSubHeader: {
    lineHeight: "initial",
    margin: [theme.spacing(1, 0)]
  },
  logoInsert: {
    position: "absolute",
    top: theme.spacing(2),
    right:theme.spacing(2),
    width: theme.spacing(10)
  }
}));
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
            initialValues={pick(me || {}, [
              "firstName",
              "lastName",
              "income",
              "occupation",
              "jobArea",
              "spouseOccupation"
            ])}
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

                    <Grid item xs={12}>
                      <BlockContainer title={"Ma situation"}>
                        <Grid container spacing={4} alignItems={"stretch"}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              name="income"
                              type={"number"}
                              label={t("PROFILE.INCOME")}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">€ brut mensuel</InputAdornment>
                              }}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <OccupationPickerField label={t("PROFILE.OCCUPATION")} name="occupation" multiple={false} />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <JobAreaPickerField label={t("PROFILE.JOB_AREA")} name="jobArea" multiple={false} />
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

                    <Grid item xs={12} md={6}>
                      <BlockContainer title={"Mon profil de compétences (Carto.net)"}>
                        <img src={LogoMM} alt={"Logo MM"} className={classes.logoInsert}/>
                        <List>
                          <ListSubheader disableGutters disableSticky className={classes.cartoNetSubHeader}>
                            {t("CARTONET.ACTIONS.EDITION")}
                          </ListSubheader>
                          <ListItem>
                            {createLink({
                              text: t("CARTONET.ACTIONS.ADD_EXPERIENCE"),
                              to: generatePath(`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_EXPERIENCE}`)
                            })}
                          </ListItem>
                          <ListItem>
                            {createLink({
                              text: t("CARTONET.ACTIONS.ADD_TRAINING"),
                              to: generatePath(`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_TRAINING}`)
                            })}
                          </ListItem>
                          <ListItem>
                            {createLink({
                              text: t("CARTONET.ACTIONS.ADD_HOBBY"),
                              to: generatePath(`${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_HOBBY}`)
                            })}
                          </ListItem>
                          <ListItem disabled>
                            {createLink({
                              text: t("CARTONET.ACTIONS.EXTRACT_SKILLS_FROM_CV"),
                            })}
                          </ListItem>
                          <ListItem>
                            {createLink({
                              text: t("CARTONET.ACTIONS.EDIT_APTITUDES"),
                              to: `${ROUTES.PROFILE}${ROUTES.CARTONET_EDIT_APTITUDES}`
                            })}
                          </ListItem>
                          <ListSubheader disableGutters disableSticky className={classes.cartoNetSubHeader}>
                            {t("CARTONET.ACTIONS.RESTITUTION")}
                          </ListSubheader>
                          <ListItem>
                            {createLink({
                              text: t("CARTONET.ACTIONS.SHOW_PROFILE"),
                              to: `${ROUTES.PROFILE}${ROUTES.CARTONET_SHOW_PROFILE}`
                            })}
                          </ListItem>
                          <ListItem disabled>
                            {createLink({
                              text: t("CARTONET.ACTIONS.PRINT_PROFILE"),
                            })}
                          </ListItem>
                          <ListItem>
                            {createLink({
                              text: t("CARTONET.ACTIONS.SHOW_JOBS"),
                              to: `${ROUTES.PROFILE}${ROUTES.CARTONET_SHOW_JOBS}`
                            })}
                          </ListItem>

                        </List>

                        <CartonetModal />
                      </BlockContainer>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <BlockContainer title={"Mon profil de mobilité (WeDiag)"}>
                        <img src={LogoWever} alt={"Logo Wever"} className={classes.logoInsert}/>

                        A venir...
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
      </If>
    </Grid>
  );

  async function save(values) {
    const {objectInput, updateCache} = prepareMutation({
      entity: me,
      values,
      links: [
        {
          name: "occupation",
          isPlural: false,
          inputName: "occupationInput",
          targetFragment: gqlOccupationFragment
        },
        {
          name: "spouseOccupation",
          isPlural: false,
          inputName: "spouseOccupationInput",
          targetFragment: gqlOccupationFragment
        },
        {
          name: "jobArea",
          isPlural: false,
          inputName: "jobAreaInput",
          targetFragment: gqlJobAreaFragment
        }
      ]
    });

    await updateProfile({
      variables: {
        input: {
          objectId: me.id,
          objectInput
        }
      },
      update: updateCache
    });
  }
}
