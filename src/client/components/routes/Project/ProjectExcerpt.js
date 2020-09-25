import React from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useQuery} from "@apollo/client";
import {Grid, InputAdornment, Typography, TextField, ListItem, ListItemText, List} from "@material-ui/core";
import {Map, Polygon, TileLayer, CircleMarker, Popup, GeoJSON} from "react-leaflet";
import Wkt from "wicket";
import "wicket/wicket-leaflet";

import {createLink} from "../../../utilities/createLink";
import {ROUTES} from "../../../routes";
import {gqlMyProfile} from "../Profile/gql/MyProfile.gql";

const useStyles = makeStyles(theme => ({
  map: {
    width: "100%",
    height: theme.spacing(40)
  },
  empty: {
    color: theme.palette.text.emptyHint
  }
}));

/**
 *
 */
export default function ProjectExcerpt({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const {data: {me} = {}} = useQuery(gqlMyProfile);
  const wktHelper = new Wkt.Wkt();

  return (
    <Grid container spacing={2} alignItems={"stretch"}>
      <Grid item container xs={12}>
        <Grid item xs={4}>
          <Typography>{t("PROJECT.WISHED_OCCUPATION.TITLE")}</Typography>

          <List dense>
            <If condition={me?.occupation}>
              <ListItem>
                <ListItemText primary={me?.occupation.prefLabel} secondary={t("PROFILE.OCCUPATION")} />
              </ListItem>
            </If>

            <If condition={me?.wishedOccupations?.edges.length === 0}>
              <ListItem>
                <ListItemText className={classes.empty}  primary={t("PROJECT.WISHED_OCCUPATION.NONE")} secondary={createLink({
                  to: ROUTES.PROJECT,
                  text: t("PROJECT.EDIT")
                })}/>
              </ListItem>
            </If>


            {me?.wishedOccupations?.edges.map(({node: occupation}) => (
              <ListItem key={occupation.id}>
                <ListItemText primary={occupation?.prefLabel} />
              </ListItem>
            ))}
          </List>
        </Grid>

        <Grid item xs={4}>
          <Typography>{t("PROJECT.WISHED_JOB_AREA.TITLE")}</Typography>

          <List dense>
            <If condition={me?.jobArea}>
              <ListItem>
                <ListItemText primary={me?.jobArea.title} secondary={t("PROFILE.JOB_AREA")} />
              </ListItem>
            </If>

            <If condition={me?.wishedJobAreas?.edges.length === 0}>
              <ListItem>
                <ListItemText className={classes.empty} primary={t("PROJECT.WISHED_JOB_AREA.NONE")} secondary={createLink({
                  to: ROUTES.PROJECT,
                  text: t("PROJECT.EDIT")
                })}/>
              </ListItem>
            </If>

            {me?.wishedJobAreas?.edges.map(({node: jobArea}) => (
              <ListItem key={jobArea.id}>
                <ListItemText primary={jobArea?.title} />
              </ListItem>
            ))}
          </List>
        </Grid>

        <Grid item xs={4}>
          <Map className={classes.map} center={[43.7608, 6.0817]} zoom={7.1}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <If condition={me?.jobArea}>
              {(() => {
                {
                  wktHelper.read(me?.jobArea.asWKT);
                  return <GeoJSON color="green" data={wktHelper.toObject({}).toGeoJSON()} />;
                }
              })()}
            </If>

            {me?.wishedJobAreas?.edges
              .filter(({node: jobArea}) => !!jobArea.asWKT)
              .map(({node: jobArea}) => {
                wktHelper.read(jobArea.asWKT);
                return <GeoJSON key={jobArea.id} color="purple" data={wktHelper.toObject({}).toGeoJSON()} />;
              })}
          </Map>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems={"center"}>
          <Grid item xs>
            <Typography>{t("PROJECT.WISHED_INCOME")}</Typography>
          </Grid>
          <Grid item xs>
            <TextField
              variant="outlined"
              disabled={true}
              size={"small"}
              label={t("PROJECT.WISHED_MIN_INCOME")}
              InputProps={{
                endAdornment: <InputAdornment position="end">€ brut mensuel</InputAdornment>
              }}
              value={me?.wishedMinIncome || ""}
            />
          </Grid>
          <Grid item xs>
            <TextField
              variant="outlined"
              disabled={true}
              size={"small"}
              label={t("PROJECT.WISHED_MAX_INCOME")}
              InputProps={{
                readOnly: true,
                endAdornment: <InputAdornment position="end">€ brut mensuel</InputAdornment>
              }}
              value={me?.wishedMaxIncome || ""}
            />
          </Grid>
          <Grid item xs={3} />
        </Grid>
      </Grid>
    </Grid>
  );
}
