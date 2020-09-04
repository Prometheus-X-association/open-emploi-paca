import React from "react";
import {useTranslation} from "react-i18next";
import get from "lodash/get";
import {Table} from "./Table";
import ErrorBoundary from "../../ErrorBoundary";

/**
 * @param {array} props.columns
 * @param {int} props.pageSize
 * @param {string} props.gqlConnectionPath
 * @param {array} props.selectedNodes
 * @param {function} props.onSelectNodes
 * @constructor
 */
export function TableView(props) {
  return (
    <ErrorBoundary>
      <TableViewCode {...props} />
    </ErrorBoundary>
  );
}

function TableViewCode({
  data,
  columns,
  className,
  gqlConnectionPath,
  selectedNodes,
  onSelectNodes = () => {
  },
  onColumnSortChange = () => {
  }
} = {}) {
  const {t} = useTranslation();

  // TODO : Make responsive working
  // const theme = useTheme();
  // const smSize = useMediaQuery(theme.breakpoints.down("sm"));
  // const responsiveParam = smSize ? "stacked" : "scrollFullHeight";

  const rows = get(data, `${gqlConnectionPath}.edges`, []).map(({node}) => node);

  return (
    <Table
      className={className}
      columns={columns}
      rows={rows}
      onColumnSortChange={handleColumnSortChange}
      onRowsIndexesSelected={handleRowsIndexesSelected}
    />
  );

  /**
   * @param selectedIndexes
   */
  function handleRowsIndexesSelected(selectedIndexes) {
    onSelectNodes(selectedIndexes.map((dataIndex) => rows[dataIndex]));
  }

  /**
   * @param {object} column
   * @param {boolean} isSortDescending
   */
  function handleColumnSortChange(column, isSortDescending) {
    onColumnSortChange(column, isSortDescending);
  }
}
