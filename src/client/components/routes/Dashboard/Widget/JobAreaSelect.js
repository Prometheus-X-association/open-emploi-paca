import { useEffect, useState } from "react";
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
export function JobAreaSelect({
  gutter = true, className, onSelectJobAreaId = () => {
  }
} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const [selectedJobAreaId, setSelectedJobAreaId] = useState();
  const {data: {me} = {}} = useQuery(gqlMyProfile);

  useEffect(() => {
    if (!selectedJobAreaId && me) {
      selectJobArea(me.jobArea?.id || me.wishedJobAreas?.edges?.[0]?.node?.id);
    }
  }, [me?.jobArea?.id, me?.wishedJobAreas.edges]);

  return (
    <Select className={clsx(className, classes.root, {[classes.gutter]: gutter})} value={selectedJobAreaId || ""}
            onChange={(e) => selectJobArea(e.target.value)}>
      <MenuItem value={me?.jobArea?.id}>{me?.jobArea?.title}</MenuItem>
      {(me?.wishedJobAreas?.edges || []).map(({node: jobArea}) => (
        <MenuItem key={jobArea.id} value={jobArea.id}>
          {jobArea.title}
        </MenuItem>
      ))}
    </Select>
  )

  function selectJobArea(jobAreaId) {
    setSelectedJobAreaId(jobAreaId);
    onSelectJobAreaId(jobAreaId);
  }
}
