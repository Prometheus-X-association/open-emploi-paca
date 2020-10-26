import React, {useEffect} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {Button, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, ListItemSecondaryAction, ListSubheader, Accordion, AccordionDetails, AccordionSummary, Typography} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import {useHistory} from "react-router";
import {useLazyQuery} from "@apollo/client";
import {gqlOccupationsMatching} from "./gql/OccupationsMatching.gql";
import {useLoggedUser} from "../../../../hooks/useLoggedUser";
import {LoadingSplashScreen} from "../../../widgets/LoadingSplashScreen";
import {Gauge} from "../../../widgets/Gauge";

const useStyles = makeStyles(theme => ({
  categoryHeader: {
    alignItems: "center"
  },
  categoryHeaderExpanded: {
    margin: 0
  },
  categoryHeaderTitle: {
    marginLeft: theme.spacing(2)
  }
}));

/**
 *
 */
export default function OccupationsMatching({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const history = useHistory();
  const [expanded, setExpanded] = React.useState(false);
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const {user} = useLoggedUser();
  const [getOccupationsMatching, {data, loading}] = useLazyQuery(gqlOccupationsMatching, {fetchPolicy: "no-cache"});

  useEffect(() => {
    if (user?.id) {
      getOccupationsMatching({
        variables: {personId: user?.id}
      });
    }
  }, [user]);

  const occupations = JSON.parse(data?.occupationsMatching || "[]");

  return (
    <>
      <DialogTitle>{t("CARTONET.OCCUPATION_MATCHING.PAGE_TITLE")}</DialogTitle>
      <DialogContent>
        <Choose>
          <When condition={loading}>
            <LoadingSplashScreen />
          </When>
          <Otherwise>

            {occupations.map(occupation => (
              <Accordion key={occupation.categoryName} expanded={expanded === occupation.categoryName} onChange={handleChange(occupation.categoryName)}>
                <AccordionSummary classes={{content: classes.categoryHeader, expanded: classes.categoryHeaderExpanded}} expandIcon={<ExpandMoreIcon />} >
                  <Gauge value={occupation.score * 100}/>
                  <Typography className={classes.categoryHeaderTitle}>{occupation.categoryName}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <If condition={expanded === occupation.categoryName}>
                    <List dense>
                      {occupation.subOccupations.map((occupation) => (
                        <ListItem key={occupation}>
                          <ListItemText primary={occupation.prefLabel} />
                        </ListItem>
                      ))}
                    </List>
                  </If>
                </AccordionDetails>
              </Accordion>
            ))}
          </Otherwise>
        </Choose>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => history.goBack()}>{t("ACTIONS.GO_BACK")}</Button>
      </DialogActions>
    </>
  );
}
