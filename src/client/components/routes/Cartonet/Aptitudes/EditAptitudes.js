import React from "react";
import {Button, DialogActions, DialogContent, DialogTitle, Checkbox} from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import {useMutation} from "@apollo/client";
import {makeStyles} from "@material-ui/core/styles";
import {useTranslation} from "react-i18next";

import {gqlMyAptitudes} from "./gql/MyAptitudes.gql";
import {useHistory} from "react-router";
import {CollectionView} from "../../../widgets/CollectionView/CollectionView";
import {useSnackbar} from "notistack";
import {gqlUpdateAptitude} from "./gql/UpdateAptitude.gql";

const useStyles = makeStyles(theme => ({}));

/**
 *
 */
export default function EditAptitudes({} = {}) {
  const classes = useStyles();
  const {t} = useTranslation();
  const history = useHistory();
  const {enqueueSnackbar} = useSnackbar();

  const [updateAptitude, {loading: saving}] = useMutation(gqlUpdateAptitude, {
    onCompleted: () => {
      enqueueSnackbar(t("ACTIONS.SUCCESS"), {variant: "success"});
    }
  });

  const columns = [
    {
      name: "skillLabel",
      label: t("CARTONET.APTITUDES.SKILL"),
      options: {
        sort: true,
        width: 500
      }
    },
    {
      name: "experiencesCount",
      label: t("CARTONET.APTITUDES.EXPERIENCE_COUNT"),
      options: {
        sort: true,
        width: 200,
        align: "center"
      }
    },
    {
      name: "ratingValue",
      label: t("CARTONET.APTITUDES.RATING"),
      options: {
        sort: true,
        width: 200,
        align: "center",
        customBodyRender: (_, {row: aptitude}) => {
          return (
            <Rating
              value={aptitude.rating?.value|| 0}
              name={`${aptitude.id}_rating`}
              onClick={e => e.stopPropagation()}
              onChange={(_, value) => handleUpdateAptitudeRating({aptitude, value})}
            />
          );
        }
      }
    },
    {
      name: "isTop5",
      label: t("CARTONET.APTITUDES.TOP_5"),
      options: {
        sort: true,
        width: 200,
        align: "center",
        customBodyRender: (_, {row: aptitude, rowsSharedState}) => {
          return (
            <Checkbox
              name={`${aptitude.id}_isTop5`}
              checked={!!aptitude.isTop5}
              disabled={!aptitude.isTop5 && rowsSharedState?.top5Count === 5}
              onClick={e => e.stopPropagation()}
              onChange={(e) => handleUpdateAptitudeRating({aptitude, isTop5: e.target.checked})}
            />
          );
        }
      }
    }
  ];

  return (
    <>
      <DialogTitle>{t("CARTONET.APTITUDES.PAGE_TITLE")}</DialogTitle>
      <DialogContent>
        <CollectionView
          columns={columns}
          gqlConnectionPath={"me.aptitudes"}
          gqlCountPath={"me.aptitudesCount"}
          gqlQuery={gqlMyAptitudes}
          gqlFilters={null}
          gqlSortings={[{sortBy: "skillLabel"}]}
          availableDisplayMode={["table"]}
          searchEnabled={true}
          removalEnabled={true}
          getRowsSharedState={({rows}) => {
            return {
              top5Count: rows.filter(({isTop5}) => isTop5 === true).length
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => history.goBack()}>{t("ACTIONS.GO_BACK")}</Button>
      </DialogActions>
    </>
  );

  /**
   * @param aptitude
   * @param value
   * @param isTop5
   */
  async function handleUpdateAptitudeRating({aptitude, value, isTop5} = {}){
    if (isTop5 !== true){
      isTop5 = null;
    }

    if (!value){
      value = aptitude.rating?.value || 0;
    }

    await updateAptitude({
      variables: {
        input: {
          objectId: aptitude.id,
          objectInput: {
            isTop5,
            ratingInput: {
              id: aptitude.rating?.id,
              value: value
            }
          }
        }
      },
      optimisticResponse: {
        updateAptitude: {
          __typename: "UpdateAptitudePayload",
          updatedObject: {
            __typename: "Aptitude",
            id: aptitude.id,
            isTop5,
            rating: {
              __typename: "AptitudeRating",
              id: aptitude.rating?.id,
              value
            }
          }
        }
      }
    })
  }
}
