import { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import { useLazyQuery, useQuery } from "@apollo/client";
import { gqlSuggestedOccupationsMatchings } from "../../Cartonet/OccupationsMatching/gql/SuggestedOccupationsMatchings.gql";
import { gqlMyProfile } from "../../Profile/gql/MyProfile.gql";
import { LoadingSplashScreen } from "../../../widgets/LoadingSplashScreen";
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
} from "@material-ui/core";
import { Gauge } from "../../../widgets/Gauge";

const useStyles = makeStyles((theme) => ({
  list: {
    marginTop: theme.spacing(4),
  },
  tip: {
    color: theme.palette.text.emptyHint,
    textAlign: "center",
    marginTop: theme.spacing(4),
  },
}));

export function useOccupationMatchings() {
  const { data: { me } = {} } = useQuery(gqlMyProfile);
  const [occupations, setOccupations] = useState([]);
  const [getOccupationsMatching, { data, loading }] = useLazyQuery(
    gqlSuggestedOccupationsMatchings,
    {
      fetchPolicy: "no-cache",
    }
  );

  useEffect(() => {
    if (me?.id) {
      let occupations = (me.wishedOccupations?.edges || []).map(
        ({ node: occupation }) => occupation
      );

      if (me.occupation) {
        occupations.unshift(me.occupation);
      }

      setOccupations(occupations);
    }
  }, [me]);

  useEffect(() => {
    if (occupations.length > 0) {
      getOccupationsMatching({
        variables: {
          personId: me?.id,
          occupationIds: occupations.map((occupation) => occupation.id),
        },
      });
    }
  }, [occupations]);

  let occupationMatchings = JSON.parse(data?.occupationsMatching || "[]");

  occupations.map((occupation) => {
    if (
      !occupationMatchings.find(
        ({ occupationId }) => occupationId === occupation.id
      )
    ) {
      occupationMatchings.push({
        occupationId: occupation.id,
        occupationPrefLabel: occupation.prefLabel,
        score: 0,
      });
    }
  });

  return [occupationMatchings, { loading }];
}
/**
 *
 */
export function OccupationsMatchingWidget({} = {}) {
  const classes = useStyles();
  const { t } = useTranslation();
  let [occupationMatchings, { loading }] = useOccupationMatchings();

  return (
    <Choose>
      <When condition={loading}>
        <LoadingSplashScreen />
      </When>
      <Otherwise>
        <List className={classes.list}>
          {occupationMatchings.map((occupation) => (
            <ListItem key={occupation.occupationPrefLabel}>
              <ListItemIcon>
                <Gauge value={occupation.score * 100} />
              </ListItemIcon>
              <ListItemText primary={occupation.occupationPrefLabel} />
            </ListItem>
          ))}
        </List>

        <Typography className={classes.tip}>
          {t("SKILLS.OCCUPATIONS_MATCHING_TIP")}
        </Typography>
      </Otherwise>
    </Choose>
  );
}
