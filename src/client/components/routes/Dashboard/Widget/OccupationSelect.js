import React, {useEffect, useState} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";
import {useQuery} from "@apollo/client";
import clsx from "clsx";
import {Select, MenuItem} from "@material-ui/core";

import {gqlMyProfile} from "../../Profile/gql/MyProfile.gql";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
  },
  gutter: {
    margin: theme.spacing(2, 0)
  }
}));

/**
 *
 */
export function OccupationSelect({
  gutter = true, className, onSelectOccupationId = () => {
  }
} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const [selectedOccupationId, setSelectedOccupationId] = useState();
  const {data: {me} = {}} = useQuery(gqlMyProfile);

  useEffect(() => {
    if (!selectedOccupationId && me) {
      selectOccupation(me.occupation?.id || me.wishedOccupations?.edges?.[0]?.node?.id);
    }
  }, [me?.occupation?.id, me?.wishedOccupations.edges]);

  return (
    <Select className={clsx(className, classes.root, {[classes.gutter]: gutter})} value={selectedOccupationId || ""}
            onChange={(e) => selectOccupation(e.target.value)}>
      <MenuItem value={me?.occupation?.id}>{me?.occupation?.prefLabel}</MenuItem>
      {(me?.wishedOccupations?.edges || []).map(({node: occupation}) => (
        <MenuItem key={occupation.id} value={occupation.id}>
          {occupation.prefLabel}
        </MenuItem>
      ))}
    </Select>
  )

  function selectOccupation(occupationId) {
    setSelectedOccupationId(occupationId);
    onSelectOccupationId(occupationId);
  }
}
