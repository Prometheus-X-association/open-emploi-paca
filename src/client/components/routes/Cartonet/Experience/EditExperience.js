import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";

const useStyles = makeStyles(theme => ({}));

/**
 *
 */
export default function EditExperience({experienceType} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();

  return (
    <>
      <Choose>
        <When condition={experienceType === "training"}>
          Edition de formation
        </When>
        <When condition={experienceType === "hooby"}>
          Edition d'expérience extra-pro
        </When>
        <Otherwise>
          Edition d'expérience
        </Otherwise>
      </Choose>
    </>
  );
}