import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {Checkbox, TableCell, TableHead as MUITableHead, TableRow, TableSortLabel} from "@material-ui/core";
import {getCellProps} from "./Table";
import ErrorBoundary from "../../ErrorBoundary";

export function TableHead(props) {
  return (
    <ErrorBoundary>
      <EnhancedTableHeadCode {...props} />
    </ErrorBoundary>
  );
}

function EnhancedTableHeadCode({
  classes,
  sortBy,
  sortDirection,
  selectAll,
  selectPartial,
  columns,
  onRequestSort = () => {},
  onSelectAll = () => {}
} = {}) {
  const [selectAllChecked, setSelectAllChecked] = useState(selectAll);
  const [selectPartialChecked, setSelectPartialChecked] = useState(selectPartial);

  useEffect(() => {
    setSelectPartialChecked(selectPartial);
    setSelectAllChecked(false);
  }, [selectPartial]);

  useEffect(() => {
    setSelectPartialChecked(false);
    setSelectAllChecked(selectAll);
  }, [selectAll]);

  return (
    <MUITableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={selectPartialChecked}
            checked={selectAllChecked && !selectPartialChecked}
            onChange={handleSelectAll}
            inputProps={{"aria-label": "select all desserts"}}
          />
        </TableCell>
        {columns
          .filter(column => column.options?.display !== "excluded")
          .map((column, index) => (
            <TableCell
              key={index}
              align={column.numeric ? "right" : "left"}
              padding={column.disablePadding ? "none" : "default"}
              sortDirection={sortBy === column.name ? sortDirection : false}
              {...getCellProps(column)}>
              <Choose>
                <When condition={column.name && column.options?.sort}>
                  <TableSortLabel
                    active={sortBy === column.name}
                    direction={sortBy === column.name ? sortDirection : "asc"}
                    onClick={() => handleSort(column)}>
                    {column.label}

                    {sortDirection === column.name ? (
                      <span className={classes.visuallyHidden}>
                        {sortDirection === "desc" ? "sorted descending" : "sorted ascending"}
                      </span>
                    ) : null}
                  </TableSortLabel>
                </When>
                <Otherwise>{column.label}</Otherwise>
              </Choose>
            </TableCell>
          ))}
      </TableRow>
    </MUITableHead>
  );

  function handleSelectAll() {
    setSelectAllChecked(!selectAll);
    setSelectPartialChecked(false);
    onSelectAll(!selectAll);
  }

  function handleSort(column) {
    onRequestSort(column);
  }
}

TableHead.propTypes = {
  classes: PropTypes.object,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  sortDirection: PropTypes.oneOf(["asc", "desc"]),
  sortBy: PropTypes.string,
  columns: PropTypes.array.isRequired
};
