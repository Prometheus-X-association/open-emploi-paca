import React, {useEffect, useState} from "react";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
  ListItemSecondaryAction,
  IconButton
} from "@material-ui/core";
import ClearIcon from "@material-ui/icons/Clear";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";

import {useHistory} from "react-router";
import {useSnackbar} from "notistack";
import {gqlExtractAptitudesFromCV, gqlMyAptitudes} from "./gql/ExtractAptitudes.gql";
import {useLoggedUser} from "../../../../hooks/useLoggedUser";
import {useLazyQuery, useMutation, useQuery} from "@apollo/client";
import Rating from "@material-ui/lab/Rating";
import {LoadingSplashScreen} from "../../../widgets/LoadingSplashScreen";
import {gqlUpdateProfile} from "../../Profile/gql/UpdateProfile.gql";
import {LoadingButton} from "../../../widgets/Button/LoadingButton";

const useStyles = makeStyles(theme => ({
  uploadButton: {
    marginBottom: theme.spacing(2)
  }
}));

/**
 *
 */
export default function ExtractAptitudesFromCV({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const history = useHistory();
  const {enqueueSnackbar} = useSnackbar();
  const [file, setFile] = useState();
  const {user} = useLoggedUser();
  const [selectedSkills, setSelectedSkills] = useState([]);

  const {data: {me} = {}} = useQuery(gqlMyAptitudes);
  const [extractAptitudes, {loading, data: {skills} = {}}] = useLazyQuery(gqlExtractAptitudesFromCV, {
    fetchPolicy: "no-cache"
  });

  useEffect(() => {
    if (file) {
      extractAptitudes({
        variables: {
          file,
          personId: user.id,
          first: 50
        }
      });
    }
  }, [file]);

  const [updateProfile, {loading: saving}] = useMutation(gqlUpdateProfile, {
    onCompleted: () => {
      enqueueSnackbar(t("ACTIONS.SUCCESS"), {variant: "success"});
      history.goBack();
    }
  });

  return (
    <>
      <DialogTitle>{t("CARTONET.EXTRACT_APTITUDES_FROM_CV.PAGE_TITLE")}</DialogTitle>
      <DialogContent>
        <Button variant="contained" component="label" className={classes.uploadButton}>
          {t("CARTONET.EXTRACT_APTITUDES_FROM_CV.BUTTON")}
          <input type="file" hidden onChange={onChange} />
        </Button>

        <If condition={file}>
          <Typography>{t("CARTONET.EXTRACT_APTITUDES_FROM_CV.MESSAGE")}</Typography>

          <If condition={loading}>
            <LoadingSplashScreen />
          </If>

          <List dense>
            {(skills?.edges || []).map(({node: skill}) => {
              const indexOfSelected = selectedSkills.findIndex(({id}) => skill.id === id);
              const existingAptitudeEdge = (me?.aptitudes.edges || []).find(
                ({node: aptitude}) => aptitude.skillLabel === skill.prefLabel
              );

              return (
                <ListItem key={skill.id}>
                  <ListItemText>{skill.prefLabel}</ListItemText>
                  <ListItemSecondaryAction>
                    <Choose>
                      <When condition={existingAptitudeEdge || indexOfSelected > -1}>
                        <Grid container spacing={2}>
                          <Grid item>
                            <Rating
                              disabled={existingAptitudeEdge}
                              name={`rating_${skill.id}`}
                              value={
                                existingAptitudeEdge?.node?.ratingValue ||
                                selectedSkills?.[indexOfSelected]?.ratingValue ||
                                0
                              }
                              onChange={(e, ratingValue) => {
                                selectedSkills.splice(indexOfSelected, 1, {
                                  ...selectedSkills[indexOfSelected],
                                  ratingValue
                                });
                                setSelectedSkills([...selectedSkills]);
                              }}
                            />
                          </Grid>
                          <Grid item>
                            <IconButton
                              disabled={existingAptitudeEdge}
                              size={"small"}
                              variant={"outlined"}
                              onClick={() => {
                                selectedSkills.splice(indexOfSelected, 1);
                                setSelectedSkills([...selectedSkills]);
                              }}>
                              <ClearIcon />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </When>
                      <Otherwise>
                        <Button
                          size={"small"}
                          onClick={() => {
                            setSelectedSkills([
                              ...selectedSkills,
                              {
                                id: skill.id
                              }
                            ]);
                          }}>
                          {t("CARTONET.EXTRACT_APTITUDES_FROM_CV.SELECT_SKILL")}
                        </Button>
                      </Otherwise>
                    </Choose>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </If>
      </DialogContent>
      <DialogActions>
        <If condition={selectedSkills?.length > 0}>
          <LoadingButton loading={saving} variant="contained" color="primary" onClick={handleSave}>
            {t("CARTONET.EXTRACT_APTITUDES_FROM_CV.ACTION_SAVE", {count: selectedSkills?.length})}
          </LoadingButton>
        </If>
        <Button onClick={() => history.goBack()}>{t("ACTIONS.CANCEL")}</Button>
      </DialogActions>
    </>
  );

  function onChange({
    target: {
      validity,
      files: [file]
    }
  }) {
    if (validity.valid) {
      setFile(file);
    }
  }

  async function handleSave() {
    await updateProfile({
      variables: {
        input: {
          objectId: user.id,
          objectInput: {
            aptitudeInputs: selectedSkills.map(skill => ({
              isInCV: true,
              skillInput: {
                id: skill.id
              },
              ratingInput: {
                value: skill.ratingValue || 0,
                range: 5
              }
            }))
          }
        }
      }
    });
  }
}
