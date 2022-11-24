import { useState, useEffect, useCallback, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import { useSnackbar } from "notistack";
import { Formik, Form } from "formik";
import pick from "lodash/pick";
import cloneDeep from "lodash/cloneDeep";
import { Button, Typography, Grid } from "@material-ui/core";
import { Print as PrintIcon } from "@material-ui/icons";
import { useMutation, useQuery } from "@apollo/client";

import { LoadingSplashScreen } from "../../../widgets/LoadingSplashScreen";
import { CartonetExploreLayout } from "../CartonetExploreLayout";
import { WishedOccupations } from "./WishedOccupations";
import { MutationConfig, prepareMutation } from "../../../../utilities/apollo";
import {
  DynamicFormDefinition,
  LinkInputDefinition,
} from "../../../../utilities/form";
import { FormButtons } from "../../../widgets/Form";

import {
  gqlWishedOccupations,
  gqlWishedOccupationsFragment,
} from "./gql/WishedOccupations.gql";
import { gqlUpdateWishedOccupations } from "./gql/UpdateWishedOccupations.gql";
import { gqlOccupationFragment } from "../../Profile/gql/MyProfile.gql";

const useStyles = makeStyles((theme) => ({
  categoryHeader: {
    alignItems: "center",
  },
  categoryHeaderExpanded: {
    margin: 0,
  },
  categoryHeaderTitle: {
    marginLeft: theme.spacing(2),
  },
  root: {
    position: "relative",
    overflow: "hidden",
    height: "100%",
  },
  occupationsContainer: {
    overflow: "hidden",
    height: "100%",
  },
  occupationsList: {
    overflow: "auto",
  },
  categoryTitle: {
    padding: theme.spacing(2),
  },
  occupation: {
    breakInside: "avoid",
  },
  printButton: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 100,
  },
  form: {
    padding: theme.spacing(1),
  },
  formButtons: {
    padding: theme.spacing(2),
  },
  "@media print": {
    root: {
      height: "auto",
      overflow: "visible",
    },
    occupationsContainer: {
      height: "auto",
      margin: "auto",
      padding: theme.spacing(5),
    },
    occupationsList: {
      overflow: "visible",
    },
  },
}));

/**
 *
 */
export default function WishedOccupationsMatching({} = {}) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const [updateWishedOccupations, { loading: saving }] = useMutation(
    gqlUpdateWishedOccupations
  );
  const { data: { me } = {}, loading } = useQuery(gqlWishedOccupations);

  const componentRef = useRef(null);

  const reactToPrintContent = useCallback(() => {
    return componentRef.current;
  }, [componentRef.current]);

  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
    documentTitle: t("CARTONET.OCCUPATION_MATCHING.PAGE_TITLE"),
    onBeforeGetContent: () => {},
    onBeforePrint: () => {},
    onAfterPrint: () => {},
  });

  return (
    <CartonetExploreLayout>
      <Choose>
        <When condition={loading}>
          <LoadingSplashScreen />
        </When>
        <Otherwise>
          <div className={classes.root}>
            <Button
              className={classes.printButton}
              onClick={handlePrint}
              endIcon={<PrintIcon />}
            >
              {t("CARTONET.ACTIONS.PRINT")}
            </Button>
            <Grid
              container
              direction={"column"}
              wrap={"nowrap"}
              className={classes.occupationsContainer}
              ref={componentRef}
            >
              <Grid item style={{ flexBasis: 0 }}>
                <Typography
                  variant={"h6"}
                  display="block"
                  className={classes.categoryTitle}
                >
                  {t("CARTONET.WISHED_OCCUPATION_MATCHING.SUBTITLE")}
                </Typography>
              </Grid>
              <Grid xs item className={classes.occupationsList}>
                <Formik
                  enableReinitialize={true}
                  initialValues={pick(cloneDeep(me), ["wishedOccupations"])}
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
                      <Form className={classes.form}>
                        <WishedOccupations personId={me.id} />
                        <FormButtons
                          className={classes.formButtons}
                          errors={errors}
                          touched={touched}
                          isValid={isValid}
                          dirty={dirty}
                          saving={saving}
                          resetForm={resetForm}
                        />
                      </Form>
                    );
                  }}
                </Formik>
              </Grid>
            </Grid>
          </div>
        </Otherwise>
      </Choose>
    </CartonetExploreLayout>
  );

  async function save(mutatedObject) {
    const { objectInput, updateCache } = prepareMutation({
      initialObject: me,
      mutatedObject,
      mutationConfig: new MutationConfig({
        linkInputDefinitions: [
          new LinkInputDefinition({
            name: "wishedOccupations",
            isPlural: true,
            inputName: "wishedOccupationInputs",
            deleteInputName: "wishedOccupationInputsToDelete",
            targetObjectGqlFragment: gqlOccupationFragment,
          }),
        ],
        gqlFragment: gqlWishedOccupationsFragment,
      }),
    });

    await updateWishedOccupations({
      variables: {
        input: {
          objectId: me.id,
          objectInput,
        },
      },
      update: updateCache,
    });

    enqueueSnackbar(t("ACTIONS.SUCCESS"), { variant: "success" });
  }
}
