import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useQuery} from "@apollo/client";
import {gqlOccupationDetails} from "./gql/OccupationDetails.gql";
import {CircularProgress, Grid, List, ListItem, ListItemIcon, ListItemText, Typography} from "@material-ui/core";
import {Gauge} from "../../../widgets/Gauge";

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: "hidden",
    height: "40vh"
  },
  titles: {
    flexBasis: 0,
    marginBottom: theme.spacing(1)
  },
  details: {
    overflow: "hidden",
    height: "100%"
  },
  column: {
    height: "100%",
    overflow: "auto"
  },
  romeLink: {
    paddingRight: theme.spacing(2),
    color: theme.palette.secondary.main
  },
  empty: {
    color: theme.palette.text.emptyHint,
    textAlign: "center",
    marginTop: theme.spacing(2)
  },
  "@media print": {
    root: {
      height: "auto",
      overflow: "visible"
    },
    details: {
      height: "auto",
      overflow: "visible"
    },
    column: {
      overflow: "visible"
    },
    romeLink: {
      display: "none"
    }
  }
}));

/**
 *
 */
export function OccupationsDetails({occupationId, personId, subOccupations} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const {data: {occupation, skills, aptitudes} = {}, loading} = useQuery(gqlOccupationDetails, {
    variables: {
      occupationId,
      skillsFilters: [`hasOccupationCategory:${occupationId}`],
      aptitudesFilters: [`hasRelatedOccupation:${occupationId}`, `hasPerson:${personId}`]
    }
  });

  const aptitudesLabels = (aptitudes?.edges || []).map(({node: {skillLabel}}) => skillLabel);
  const filteredSkills = (skills?.edges || []).filter(({node: {prefLabel}}) => !aptitudesLabels.includes(prefLabel));

  return (
    <Grid container direction={"column"} wrap={"nowrap"} className={classes.root}>
      <Choose>
        <When condition={loading}>
          <CircularProgress />
        </When>
        <Otherwise>
          <Grid item container className={classes.titles}>
            <Grid xs item container alignItems="center">
              <Grid xs item>
                <Typography variant={"h6"}>{t("CARTONET.OCCUPATION_MATCHING.SUB_OCCUPATIONS")}</Typography>
              </Grid>
              <Grid item>
                <a
                  href={`https://candidat.pole-emploi.fr/marche-du-travail/fichemetierrome?codeRome=${occupation?.notation}`}
                  target="_blank"
                  className={classes.romeLink}>
                  {t("CARTONET.OCCUPATION_MATCHING.ROME_LINK")}
                </a>
              </Grid>
            </Grid>
            <Grid xs item container justify={"center"}>
              <Typography variant={"h6"}>{t("CARTONET.OCCUPATION_MATCHING.APTITUDES")}</Typography>
            </Grid>
            <Grid xs item container justify={"center"}>
              <Typography variant={"h6"}>{t("CARTONET.OCCUPATION_MATCHING.OTHER_SKILLS")}</Typography>
            </Grid>
          </Grid>
          <Grid xs item container className={classes.details}>
            <Grid xs item className={classes.column}>
              <List dense>
                {subOccupations.map((subOccupation) => (
                  <ListItem key={subOccupation.id}>
                    <ListItemText primary={subOccupation.prefLabel} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid xs item className={classes.column}>
              <Choose>
                <When condition={loading}>
                  <CircularProgress />
                </When>
                <When condition={(aptitudes?.edges || []).length === 0}>
                  <div className={classes.empty}>{t("CARTONET.OCCUPATION_MATCHING.NO_APTITUDE")}</div>
                </When>
                <Otherwise>
                  <List dense>
                    {aptitudes.edges.map(({node: aptitude}) => (
                      <ListItem key={aptitude.id}>
                        <ListItemIcon>
                          <Gauge value={(aptitude.ratingValue / 5) * 100} />
                        </ListItemIcon>
                        <ListItemText primary={aptitude.skillLabel} />
                      </ListItem>
                    ))}
                  </List>
                </Otherwise>
              </Choose>
            </Grid>
            <Grid xs item className={classes.column}>
              <Choose>
                <When condition={(filteredSkills?.edges || []).length === 0}>
                  <div className={classes.empty}>{t("CARTONET.OCCUPATION_MATCHING.NO_SKILL")}</div>
                </When>
                <Otherwise>
                  <List dense>
                    {filteredSkills.map(({node: skill}) => (
                      <ListItem key={skill.id}>
                        <ListItemText primary={skill.prefLabel} />
                      </ListItem>
                    ))}
                  </List>
                </Otherwise>
              </Choose>
            </Grid>
          </Grid>
        </Otherwise>
      </Choose>
    </Grid>
  );
}
