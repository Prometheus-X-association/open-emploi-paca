import {useEffect, useState} from "react";
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
import {CartonetEditLayout} from "../CartonetEditLayout";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  uploadButton: {},
  uploadButtonContainer: {
    textAlign: "center",
    margin: theme.spacing(30, 0)
  },
  fileSelected: {
    margin: theme.spacing(4, 0)
  },
  message: {
    padding: theme.spacing(2)
  },
  matchingSkillsList: {
    borderTop: `solid 1px ${theme.palette.grey[200]}`,
    maxHeight: "50vh",
    overflow: "auto"
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
  const [savedSkills, setSavedSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  const {data: {me} = {}} = useQuery(gqlMyAptitudes);
  const [extractAptitudes, {loading, data: {skills} = {}}] = useLazyQuery(gqlExtractAptitudesFromCV, {
    fetchPolicy: "no-cache"
  });

  useEffect(() => {
    fetchExtractAptitudes();
  }, [file]);

  const [updateProfile, {loading: saving}] = useMutation(gqlUpdateProfile, {
    onCompleted: () => {
      setSavedSkills([].concat(savedSkills, selectedSkills));
      setSelectedSkills([]);

      enqueueSnackbar(t("ACTIONS.SUCCESS"), {variant: "success"});
      history.goBack();
    }
  });

  return (
    <CartonetEditLayout
      actions={
        <>
          <If condition={selectedSkills?.length > 0}>
            <LoadingButton loading={saving} variant="contained" color="primary" onClick={handleSave}>
              {t("CARTONET.EXTRACT_APTITUDES_FROM_CV.ACTION_SAVE", {count: selectedSkills?.length})}
            </LoadingButton>
          </If>
          <Button onClick={() => history.goBack()}>{t("ACTIONS.GO_BACK")}</Button>
        </>
      }>
      <div className={clsx(classes.uploadButtonContainer, {[classes.fileSelected]: file})}>
        <Button variant="contained" component="label" className={classes.uploadButton}>
          {t("CARTONET.EXTRACT_APTITUDES_FROM_CV.BUTTON")}
          <input type="file" hidden onChange={onChange} />
        </Button>
      </div>

      <If condition={file}>
        <Typography className={classes.message}>{t("CARTONET.EXTRACT_APTITUDES_FROM_CV.MESSAGE")}</Typography>

        <List dense className={classes.matchingSkillsList}>
          {(skills?.edges || []).map(({node: skill}) => {
            const indexOfSelected = selectedSkills.findIndex(({id}) => skill.id === id);
            const existingAptitudeEdge = (me?.aptitudes.edges || []).find(
              ({node: aptitude}) => aptitude.skillLabel === skill.prefLabel
            );

            return (
              <ListItem key={skill.id} disabled={existingAptitudeEdge}>
                <ListItemText>{skill.prefLabel}</ListItemText>
                <ListItemSecondaryAction>
                  <Button
                    disabled={existingAptitudeEdge || savedSkills.find(({id}) => id === skill.id)}
                    variant={indexOfSelected > -1 && "outlined"}
                    size={"small"}
                    onClick={() => {
                      if (indexOfSelected > -1) {
                        selectedSkills.splice(indexOfSelected, 1);
                        setSelectedSkills([...selectedSkills]);
                      } else {
                        setSelectedSkills([
                          ...selectedSkills,
                          {
                            id: skill.id
                          }
                        ]);
                      }
                    }}>
                    <Choose>
                      <When condition={existingAptitudeEdge}>
                        {t("CARTONET.EXTRACT_APTITUDES_FROM_CV.SKILL_ALREADY_SELECTED")}
                      </When>
                      <When condition={indexOfSelected > -1}>
                        {t("CARTONET.EXTRACT_APTITUDES_FROM_CV.SKILL_SELECTED")}
                      </When>
                      <Otherwise>{t("CARTONET.EXTRACT_APTITUDES_FROM_CV.SELECT_SKILL")}</Otherwise>
                    </Choose>
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>

        <If condition={loading}>
          <LoadingSplashScreen />
        </If>
      </If>
    </CartonetEditLayout>
  );

  function fetchExtractAptitudes() {
    if (file) {
      extractAptitudes({
        variables: {
          file,
          personId: user.id,
          first: 50
        }
      });
    }
  }

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
            aptitudeInputs: selectedSkills.map((skill) => ({
              isInCV: true,
              skillInput: {
                id: skill.id
              },
              ratingInput: {
                value: 0,
                range: 5
              }
            }))
          }
        }
      }
    });
  }
}
