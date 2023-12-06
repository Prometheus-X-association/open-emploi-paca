import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import {
  IconButton,
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
} from "@material-ui/core";
import {
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from "@material-ui/icons";
import { gqlWishedOccupations } from "./gql/WishedOccupations.gql";
import { useQuery } from "@apollo/client";

import { Gauge } from "../../../widgets/Gauge";
import { OccupationDetails } from "../OccupationsMatching/OccupationDetails";
import { useLoggedUser } from "../../../../utilities/auth/useLoggedUser";
import { gqlOccupationMatching } from "./gql/OccupationMatching.gql";

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
  gauge: {
    marginLeft: theme.spacing(2),
  },
}));

export function WishedOccupation({ occupation, onClickRemove, personId } = {}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { data: { occupationMatching } = {}, loading } = useQuery(
    gqlOccupationMatching,
    {
      variables: {
        occupationId: occupation.id,
        personId: personId,
      },
    }
  );

  return (
    <Accordion
      className={classes.occupation}
      TransitionProps={{ mountOnEnter: true }}
    >
      <AccordionSummary
        classes={{
          content: classes.categoryHeader,
          expanded: classes.categoryHeaderExpanded,
        }}
        expandIcon={<ExpandMoreIcon />}
      >
        <IconButton
          edge="end"
          aria-label="comments"
          onClick={() => onClickRemove(occupation)}
        >
          <DeleteIcon />
        </IconButton>
        <Gauge
          value={(occupationMatching?.score || 0) * 100}
          className={classes.gauge}
          loading={loading}
        />
        <Typography className={classes.categoryHeaderTitle}>
          {occupation.prefLabel}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <OccupationDetails
          occupationId={occupation.id}
          personId={personId}
          subOccupations={occupationMatching?.subOccupations || []}
        />
      </AccordionDetails>
    </Accordion>
  );
}
