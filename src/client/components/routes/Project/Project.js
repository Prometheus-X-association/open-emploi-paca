import { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import { useMutation, useQuery } from "@apollo/client";
import { Grid, InputAdornment, Typography } from "@material-ui/core";

import { Form, Formik } from "formik";
import pick from "lodash/pick";
import cloneDeep from "lodash/cloneDeep";

import { BlockContainer } from "../../widgets/BlockContainer";
import { FormButtons, TextField } from "../../widgets/Form";

import {
  gqlJobAreaFragment,
  gqlMyProfile,
  gqlMyProfileFragment,
  gqlOccupationFragment,
} from "../Profile/gql/MyProfile.gql";
import { gqlUpdateProject } from "./gql/UpdateProject.gql";
import { WishedOccupations } from "./WishedOccupations";
import { prepareMutation } from "../../../utilities/apollo/prepareMutation";
import { WishedJobAreas } from "./WishedJobAreas";
import {
  DynamicFormDefinition,
  LinkInputDefinition,
} from "../../../utilities/form";
import { MutationConfig } from "../../../utilities/apollo";

const useStyles = makeStyles((theme) => ({}));

/**
 *
 */
export default function Project({} = {}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const { data: { me } = {}, loading } = useQuery(gqlMyProfile);
  const [updateProject, { loading: saving }] = useMutation(gqlUpdateProject, {
    onCompleted: () => {
      enqueueSnackbar(t("ACTIONS.SUCCESS"), { variant: "success" });
    },
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant={"h2"}>{t("PROJECT.YOUR_PROJECT")}</Typography>
      </Grid>

      <If condition={!loading}>
        <Grid item xs={12}>
          <Formik
            initialValues={pick(cloneDeep(me), [
              "wishedMaxIncome",
              "wishedMinIncome",
              "wishedOccupations",
              "wishedJobAreas",
            ])}
            onSubmit={async (values, { setSubmitting, setStatus }) => {
              await save(values);
              setSubmitting(false);
              setStatus();
            }}
            validateOnChange={true}
            validateOnBlur={true}
          >
            {({ errors, touched, isValid, dirty, resetForm }) => {
              return (
                <Form>
                  <Grid container spacing={2} alignItems={"stretch"}>
                    <Grid item xs={12}>
                      <BlockContainer>
                        <Grid container spacing={2} alignItems={"center"}>
                          <Grid item xs>
                            <Typography>
                              {t("PROJECT.WISHED_INCOME")}
                            </Typography>
                          </Grid>
                          <Grid item xs>
                            <TextField
                              variant="outlined"
                              size={"small"}
                              name="wishedMinIncome"
                              label={t("PROJECT.WISHED_MIN_INCOME")}
                              type={"number"}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    € brut mensuel
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs>
                            <TextField
                              variant="outlined"
                              size={"small"}
                              name="wishedMaxIncome"
                              type={"number"}
                              label={t("PROJECT.WISHED_MAX_INCOME")}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    € brut mensuel
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={3} />
                        </Grid>
                      </BlockContainer>
                    </Grid>

                    <Grid item xs={6}>
                      <BlockContainer
                        title={t("PROJECT.WISHED_OCCUPATION.TITLE")}
                      >
                        <Typography>
                          {t("PROJECT.WISHED_OCCUPATION.TIP")}
                        </Typography>
                        <WishedOccupations
                          currentOccupation={me?.occupation}
                          name={"wishedOccupations"}
                        />
                      </BlockContainer>
                    </Grid>

                    <Grid item xs={6}>
                      <BlockContainer
                        title={t("PROJECT.WISHED_JOB_AREA.TITLE")}
                      >
                        <Typography>
                          {t("PROJECT.WISHED_JOB_AREA.TIP")}
                        </Typography>
                        <WishedJobAreas
                          currentJobArea={me?.jobArea}
                          name={"wishedJobAreas"}
                        />
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

  async function save(mutatedObject) {
    const { objectInput, updateCache } = prepareMutation({
      initialObject: me,
      mutatedObject,
      mutationConfig: new MutationConfig({
        scalarInputNames: ["wishedMaxIncome", "wishedMinIncome"],
        linkInputDefinitions: [
          new LinkInputDefinition({
            name: "wishedOccupations",
            isPlural: true,
            inputName: "wishedOccupationInputs",
            deleteInputName: "wishedOccupationInputsToDelete",
            targetObjectFormDefinition: new DynamicFormDefinition({
              mutationConfig: new MutationConfig({
                gqlFragment: gqlOccupationFragment,
              }),
            }),
          }),
          new LinkInputDefinition({
            name: "wishedJobAreas",
            inputName: "wishedJobAreaInputs",
            deleteInputName: "wishedJobAreaInputsToDelete",
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

    await updateProject({
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
