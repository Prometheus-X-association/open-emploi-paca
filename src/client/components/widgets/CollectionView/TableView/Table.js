import React, {useEffect, useState} from "react";
import {Checkbox, Table as MUITable, TableBody, TableCell, TableContainer, TableRow} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import get from "lodash/get";

import ErrorBoundary from "../../ErrorBoundary";
import {TableHead} from "./TableHead";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%"
  },
  table: {
    minWidth: 750
  },
  visuallyHidden: {
    bsort: 0,
    clip: "rect(0 0 0 0)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    top: 20,
    width: 1
  },
  cell: {
    padding: [[theme.spacing(1), theme.spacing(2)]]
  },
  grow: {
    flexGrow: 1
  }
}));

/**
 * @param className
 * @param dense
 * @param columns
 * @param dataRows
 */
export function Table(props) {
  return (
    <ErrorBoundary>
      <EnhancedTableCode {...props} />
    </ErrorBoundary>
  );
}

function EnhancedTableCode({className, dense, columns, rows, onColumnSortChange, onRowsIndexesSelected} = {}) {
  const classes = useStyles();
  const [sortBy, setSortBy] = useState();
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedRowsIndexes, setSelectedRowsIndexes] = useState([]);

  useEffect(() => {
    setSelectedRowsIndexes([]);
  }, [JSON.stringify(rows)]);

  return (
    <TableContainer className={clsx(classes.root, className)}>
      <MUITable
        className={classes.table}
        aria-labelledby="tableTitle"
        size={dense ? "small" : "medium"}
        aria-label="enhanced table">
        <TableHead
          classes={classes}
          columns={columns}
          selectAll={rows.length > 0 && selectedRowsIndexes.length === rows.length}
          selectPartial={selectedRowsIndexes.length > 0 && selectedRowsIndexes.length < rows.length}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSelectAll={handleSelectAll}
          onRequest={handleRequest}
          onRequestSort={handleSort}
        />
        <TableBody>
          {rows.map((row, rowIndex) => {
            const isItemSelected = selectedRowsIndexes.includes(rowIndex);
            const labelId = `enhanced-table-checkbox-${rowIndex}`;

            return (
              <TableRow
                hover
                onClick={() => handleSelectRow(rowIndex)}
                role="checkbox"
                aria-checked={isItemSelected}
                tabIndex={-1}
                key={rowIndex}
                selected={isItemSelected}
                className={classes.row}>
                <TableCell padding="checkbox">
                  <Checkbox checked={isItemSelected} inputProps={{"aria-labelledby": labelId}}/>
                </TableCell>
                {columns
                  .filter((column) => column.options?.display !== "excluded")
                  .map((column, cellIndex) => (
                    <TableCell
                      key={`${rowIndex}_${cellIndex}`}
                      component="th"
                      id={labelId}
                      scope="row"
                      classes={{
                        root: classes.cell
                      }}
                      {...getCellProps(column)}>
                      {renderCellValue(row, column)}
                    </TableCell>
                  ))}
              </TableRow>
            );
          })}
        </TableBody>
      </MUITable>
    </TableContainer>
  );

  /**
   * @param row
   * @param column
   * @return {*}
   */
  function renderCellValue(row, column) {
    let value;

    if (column.path) {
      value = get(row, column.path);
    } else {
      value = row[column.name];
    }

    if (column.transformValue) {
      return column.transformValue(value);
    } else if (column.options?.customBodyRender) {
      return column.options?.customBodyRender(value, {row, rowData: Object.values(row)});
    } else {
      return value;
    }
  }

  function handleRequest(event, property) {
    const isAsc = sortDirection === property && sortBy === "asc";
    setSortBy(isAsc ? "desc" : "asc");
    setSortDirection(property);
  }

  function handleSelectAll(selectAll) {
    let newSelectedRowsIndexes = [];

    if (selectAll === true) {
      newSelectedRowsIndexes = rows.map((row, index) => index);
    }

    setSelectedRowsIndexes(newSelectedRowsIndexes);
    onRowsIndexesSelected(newSelectedRowsIndexes);
  }

  function handleSelectRow(selectedIndex) {
    let newSelectedRowsIndexes = [].concat(selectedRowsIndexes, []);

    if (selectedRowsIndexes.includes(selectedIndex)) {
      newSelectedRowsIndexes.splice(selectedRowsIndexes.indexOf(selectedIndex), 1);
    } else {
      newSelectedRowsIndexes.push(selectedIndex);
    }

    setSelectedRowsIndexes(newSelectedRowsIndexes);
    onRowsIndexesSelected(newSelectedRowsIndexes);
  }

  function handleSort(column) {
    let newSortDirection = "asc";
    if (sortBy !== column.name) {
      setSortBy(column.name);
      setSortDirection();
    } else {
      newSortDirection = sortDirection === "asc" ? "desc" : "asc";
    }
    setSortDirection(newSortDirection);
    onColumnSortChange(column, newSortDirection === "desc");
  }
}

export function getCellProps(column) {
  let props;

  if (column.options?.setCellProps) {
    props = column.options?.setCellProps();
  }

  return props || {};
}
