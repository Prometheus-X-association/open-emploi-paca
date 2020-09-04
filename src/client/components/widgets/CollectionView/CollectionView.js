/*
 * Copyright (C) 2013-2020 MNEMOTIX <http://www.mnemotix.com/> and/or its affiliates
 * and other contributors as indicated by the @author tags.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, {useEffect, useState} from "react";
import {useApolloClient, useMutation, useQuery} from "@apollo/react-hooks";
import {LoadingSplashScreen} from "../../widgets/LoadingSplashScreen";
import {useTranslation} from "react-i18next";
import get from "lodash/get";
import {makeStyles} from "@material-ui/core/styles";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  IconButton,
  Paper
} from "@material-ui/core";
import MoodBadIcon from "@material-ui/icons/MoodBad";
import Pagination from "@material-ui/lab/Pagination";
import ViewListIcon from "@material-ui/icons/ViewList";
import AppsIcon from "@material-ui/icons/Apps";
import DeleteIcon from "@material-ui/icons/Delete";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import URLSearchParams from "@ungap/url-search-params";
import gql from "graphql-tag";
import {useHistory, useLocation} from "react-router-dom";

import {GridView} from "./GridView/GridView";
import {TableView} from "./TableView/TableView";
import {removeNodesInApolloCache} from "../../../utilities/removeNodesInApolloCache";
import Grid from "@material-ui/core/Grid";
import {LoadingButton} from "../Button/LoadingButton";
import {useSnackbar} from "notistack";
import {SearchBar} from "../SearchBar";

const gqlRemoveEntities = gql`
  mutation RemoveEntities($input: RemoveEntitiesInput!) {
    removeEntities(input: $input) {
      deletedIds
    }
  }
`;

export const builtinDisplayModes = [
  {
    key: "table",
    Icon: ViewListIcon,
    renderComponent: props => <TableView {...props} />
  },
  {
    key: "grid",
    Icon: AppsIcon,
    renderComponent: props => <GridView {...props} />
  }
];

/**
 * @param {object} gqlQuery
 * @param {string} gqlConnectionPath
 * @param {string} gqlCountPath
 * @param {object} [gqlSortings]
 * @param {object} [gqlVariables]
 * @param {object} [gqlFilters]
 * @param {number} [defaultPageSize=12]
 * @param {number} [defaultPage=1]
 * @param {string} [qs]
 * @param {array} [availableDisplayMode]
 * @param {string} [displayMode]
 * @param {array} [customDisplayModes]
 * @param {boolean} [removalEnabled]
 * @param {boolean} [searchEnabled]
 * @param {function} [renderLeftSideActions]
 * @param {function} [renderRightSideActions]
 * @param {function} [onDisplayModeChange]
 * @param {function} [onSelectNodes]
 * @return {*}
 * @constructor
 */
export function CollectionView({
  pageSize: defaultPageSize,
  page: defaultPage,
  qs: forceQs,
  displayMode: defaultDisplayMode,
  gqlQuery,
  gqlConnectionPath,
  gqlCountPath,
  gqlSortings,
  gqlVariables,
  gqlFilters,
  availableDisplayMode = [],
  onDisplayModeChange,
  removalEnabled,
  searchEnabled,
  onSelectNodes,
  renderFilters,
  renderLeftSideActions = () => {},
  renderRightSideActions = () => {},
  NoResultComponent,
  customDisplayModes,
  onGqlVariablesChange = () => {},
  ...props
}) {
  const params = new URLSearchParams(useLocation().search);

  if (params.has("pageSize")) {
    defaultPageSize = parseInt(params.get("pageSize"));
  }

  if (params.has("page")) {
    defaultPage = parseInt(params.get("page"));
  }

  const {t} = useTranslation();
  const {enqueueSnackbar} = useSnackbar();
  const apolloClient = useApolloClient();
  const history = useHistory();

  const displayModes = [].concat(builtinDisplayModes, customDisplayModes || []);
  const [displayMode, setDisplayMode] = useState(defaultDisplayMode || availableDisplayMode[0]);
  const [pageSize, setPageSize] = useState(defaultPageSize || 12);
  const [currentPage, setCurrentPage] = useState(defaultPage || 1);
  const [sortings, setSortings] = useState(gqlSortings);
  const [filters, setFilters] = useState(gqlFilters);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [removeConfirmDialogOpened, setRemoveConfirmDialogOpened] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [filtersActive, setFiltersActive] = useState(false);
  const [qs, setQs] = useState(forceQs);

  const classes = useStyles();

  useEffect(() => {
    setCurrentPage(defaultPage || 1);
  }, [qs]);

  useEffect(() => {
    setQs(forceQs);
  }, [forceQs]);

  useEffect(() => {
    setCurrentPage(defaultPage || 1);
  }, [qs]);

  useEffect(() => {
    setFilters(gqlFilters);
  }, [gqlFilters]);

  useEffect(() => {
    if (displayMode) {
      setDisplayMode(displayMode);
    }
  }, [displayMode]);

  useEffect(() => {
    if (defaultPageSize) {
      setPageSize(defaultPageSize);
    }
  }, [defaultPageSize]);

  useEffect(() => {
    onGqlVariablesChange(getGqlVariables());
  }, [qs, pageSize, currentPage, sortings, filters, JSON.stringify(gqlVariables)]);

  function getGqlVariables() {
    return {
      qs,
      first: pageSize,
      after: currentPage > 1 ? `offset:${(pageSize - 1) * (currentPage - 1)}` : null,
      sortings,
      filters,
      ...gqlVariables
    };
  }

  const {data, loading, error} = useQuery(gqlQuery, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    variables: getGqlVariables(),
    onCompleted: data => {
      const pageCount = Math.ceil(get(data, gqlCountPath) / pageSize);
      if (currentPage > pageCount) {
        handlePageChange(1);
      }
      setPageCount(pageCount);
    }
  });

  const [removeNodes, {loading: savingMutation}] = useMutation(gqlRemoveEntities, {
    onCompleted: async data => {
      enqueueSnackbar(t("REMOTE_TABLE.ACTIONS.REMOVE_SUCCESS"), {variant: "success"});
      if (pageCount > 1) {
        await apolloClient.reFetchObservableQueries();
      }
    }
  });

  function handlePageChange(page) {
    setCurrentPage(page);
    params.set("page", page);
    history.replace({search: params.toString()});
  }

  if (error) {
    console.error(error);
  }

  return !data ? (
    <LoadingSplashScreen />
  ) : (
    <div className={classes.root}>
      <ExpansionPanel expanded={filtersActive} variant={"outlined"} className={classes.actions}>
        <ExpansionPanelSummary>
          <Grid container spacing={2}>
            <Grid item md={6} xs={12}>
              <Grid container spacing={2} alignContent={"center"} alignItems={"center"}>
                <If condition={searchEnabled}>
                  <Grid item md={6} xs={12}>
                    <SearchBar
                      value={qs}
                      onRequestSearch={handleRequestSearch}
                      onCancelSearch={handleCancelSearch}
                      loading={loading}
                      placeholder={t("REMOTE_TABLE.TOOLBAR.SEARCH")}
                    />
                  </Grid>
                </If>
                <Grid item md={6} xs={12}>
                  <If condition={renderFilters}>
                    <Button
                      variant={filtersActive ? "contained" : "outlined"}
                      endIcon={filtersActive ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                      onClick={() => setFiltersActive(!filtersActive)}>
                      {t("REMOTE_TABLE.ACTIONS.FILTERS")}
                    </Button>
                  </If>
                  <If condition={availableDisplayMode.length > 1}>{renderDisplayButtons()}</If>

                  {renderLeftSideActions()}

                  <If condition={loading}>
                    <div className={classes.progressContainer}>
                      <CircularProgress size={25} className={classes.progress} />
                    </div>
                  </If>
                </Grid>
              </Grid>
            </Grid>
            <Grid item md={6} xs={12} className={classes.actionsRight}>
              <If condition={removalEnabled}>
                <LoadingButton
                  variant="contained"
                  startIcon={<DeleteIcon />}
                  color="secondary"
                  disabled={selectedNodes.length === 0}
                  loading={savingMutation}
                  onClick={() => setRemoveConfirmDialogOpened(true)}>
                  {t("REMOTE_TABLE.ACTIONS.REMOVE", {count: selectedNodes.length})}
                </LoadingButton>

                <Dialog open={removeConfirmDialogOpened} onClose={() => setRemoveConfirmDialogOpened(false)}>
                  <DialogContent>
                    <DialogContentText>
                      {t("REMOTE_TABLE.ACTIONS.REMOVE_CONFIRM_TEXT", {count: selectedNodes.length})}
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setRemoveConfirmDialogOpened(false)} color="primary">
                      {t("ACTIONS.CANCEL")}
                    </Button>
                    <LoadingButton onClick={handleRemoveNodes} color="primary" autoFocus loading={savingMutation}>
                      {t("ACTIONS.PROCEED")}
                    </LoadingButton>
                  </DialogActions>
                </Dialog>
              </If>

              {renderRightSideActions()}
            </Grid>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>{renderFilters ? renderFilters() : null}</ExpansionPanelDetails>
      </ExpansionPanel>

      <Choose>
        <When condition={gqlCountPath === null || get(data, gqlCountPath) > 0}>
          {renderDisplay()}

          <If condition={pageCount > 1}>
            <div className={classes.pagination}>
              <If condition={loading}>
                <div className={classes.progressContainer}>
                  <CircularProgress size={25} className={classes.progress} />
                </div>
              </If>
              <Pagination
                size="large"
                page={currentPage}
                count={pageCount}
                onChange={(event, page) => handlePageChange(page)}
              />
            </div>
          </If>
        </When>
        <Otherwise>
          {NoResultComponent || (
            <Paper variant={"outlined"} className={classes.noMatch}>
              <Grid container direction="column" alignItems="center">
                <Grid item xs={12}>
                  <MoodBadIcon fontSize="large" className={classes.noMatchIcon} />{" "}
                  <span className={classes.noMatchText}>{t("REMOTE_TABLE.BODY.NO_MATCH")}</span>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Otherwise>
      </Choose>
    </div>
  );

  function renderDisplayButtons() {
    return displayModes
      .filter(({key}) => availableDisplayMode.includes(key))
      .map(({key, Icon, Component}) => (
        <IconButton
          key={key}
          color={displayMode === key ? "primary" : "default"}
          onClick={() => handleChangeDisplayMode(key)}>
          <Icon fontSize="large" />
        </IconButton>
      ));
  }

  function renderDisplay() {
    const {renderComponent} = displayModes.find(({key}) => key === displayMode) || {};

    if (renderComponent) {
      const displayComponentSharedProps = {
        data,
        gqlConnectionPath,
        gqlCountPath,
        selectedNodes,
        onSelectNodes: nodes => {
          setSelectedNodes(nodes);
          if (onSelectNodes) {
            onSelectNodes(nodes);
          }
        },
        onColumnSortChange: (column, isSortDescending) => {
          setSortings([
            {
              sortBy: column.name,
              isSortDescending
            }
          ]);
        },
        key: displayMode,
        ...props
      };

      return renderComponent(displayComponentSharedProps);
    } else {
      throw new Error(`No config found for display mode "${displayMode}"...`);
    }
  }

  /**
   * @param displayMode
   */
  function handleChangeDisplayMode(displayMode) {
    setDisplayMode(displayMode);

    if (onDisplayModeChange) {
      onDisplayModeChange(displayMode);
    }
  }

  /**
   * Handler to remove nodes remotely and locally.
   */
  async function handleRemoveNodes() {
    await removeNodes({
      variables: {
        input: {
          ids: selectedNodes.map(({id}) => id)
        }
      },
      update: cache => {
        setSelectedNodes([]);
        if (onSelectNodes) {
          onSelectNodes([]);
        }
        setRemoveConfirmDialogOpened(false);

        removeNodesInApolloCache({
          cache,
          query: gqlQuery,
          variables: getGqlVariables(),
          connectionPathInData: gqlConnectionPath,
          countPathInData: gqlCountPath,
          data,
          deletedNodeIds: selectedNodes.map(({id}) => id)
        });
      }
    });
  }

  /**
   * In this callback called after a SearchBar update, we need to :
   *  - Update local state
   *  - Save this state in local storage to restore it after a goback routing
   *
   * @param qs
   */
  function handleRequestSearch(qs) {
    setQs(qs);
  }

  /**
   * In this callback called after a SearchBar cancel, we need to :
   */
  function handleCancelSearch() {
    setQs("");
  }
}

const useStyles = makeStyles(theme => ({
  progressContainer: {
    display: "inline-block",
    position: "relative",
    top: theme.spacing(1),
    left: theme.spacing(2)
  },
  pagination: {
    padding: [[theme.spacing(4), 0]],
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  root: {
    paddingBottom: theme.spacing(2),
    marginLeft: 10
  },
  actions: {
    border: "none"
  },
  actionsRight: {
    textAlign: "right",
    "& > *": {
      margin: theme.spacing(0.5)
    }
  },
  noMatch: {
    padding: [[theme.spacing(20), 0]]
  },
  noMatchText: {
    verticalAlign: "middle",
    fontSize: theme.typography.fontSize * 1.1
  },
  noMatchIcon: {
    verticalAlign: "middle",
    marginRight: theme.spacing(0.5)
  },
  filterPopper: {
    width: theme.spacing(50)
  }
}));
