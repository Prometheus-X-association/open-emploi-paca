import { useState, useEffect, useCallback, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import {
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Grid,
} from "@material-ui/core";
import {
  ExpandMore as ExpandMoreIcon,
  Print as PrintIcon,
} from "@material-ui/icons";

import { useLazyQuery } from "@apollo/client";
import { gqlSuggestedOccupationsMatchings } from "./gql/SuggestedOccupationsMatchings.gql";
import { useLoggedUser } from "../../../../hooks/useLoggedUser";
import { LoadingSplashScreen } from "../../../widgets/LoadingSplashScreen";
import { Gauge } from "../../../widgets/Gauge";
import { CartonetExploreLayout } from "../CartonetExploreLayout";
import { OccupationDetails } from "./OccupationDetails";

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

export function useSuggestedOccupationsMatchings() {
  const { user } = useLoggedUser();
  const [
    getOccupationsMatching,
    { data: { suggestedOccupationsMatchings } = {}, loading },
  ] = useLazyQuery(gqlSuggestedOccupationsMatchings, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (user?.id) {
      getOccupationsMatching({
        variables: { personId: user?.id },
      });
    }
  }, [user]);

  return [suggestedOccupationsMatchings || [], { loading }];
}

/**
 *
 */
export default function OccupationsMatching({ print } = {}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const { user: me } = useLoggedUser();
  const [occupations, { loading }] = useSuggestedOccupationsMatchings();

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
                  {t("CARTONET.OCCUPATION_MATCHING.SUBTITLE")}
                </Typography>
              </Grid>
              <Grid xs item className={classes.occupationsList}>
                {occupations.map((occupation) => (
                  <Accordion
                    key={occupation.categoryId}
                    expanded={expanded === occupation.categoryId}
                    onChange={handleChange(occupation.categoryId)}
                    className={classes.occupation}
                  >
                    <AccordionSummary
                      classes={{
                        content: classes.categoryHeader,
                        expanded: classes.categoryHeaderExpanded,
                      }}
                      expandIcon={<ExpandMoreIcon />}
                    >
                      <Gauge value={occupation.score * 100} />
                      <Typography className={classes.categoryHeaderTitle}>
                        {occupation.categoryName}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <If condition={expanded === occupation.categoryId}>
                        <OccupationDetails
                          occupationId={occupation.categoryId}
                          personId={me?.id}
                          subOccupations={occupation.subOccupations}
                        />
                      </If>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Grid>
            </Grid>
          </div>
        </Otherwise>
      </Choose>
    </CartonetExploreLayout>
  );
}
