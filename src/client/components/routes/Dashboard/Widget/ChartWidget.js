import React, {useState} from "react";
import {LineChart, CartesianGrid, Line, ResponsiveContainer, XAxis, YAxis, Brush} from "recharts";
import {Colors} from "./Colors";
import {makeStyles} from "@material-ui/core/styles";
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

import clsx from "clsx";

const useStyles = makeStyles(theme => ({
  line: {
    transition: "all 0.25s"
  },
  fade: {
    opacity: 0.2
  }
}));

/**
 *
 */
export function ChartWidget({
  data = [],
  xAxisLabelKey = "label",
  yAxisKeys = [],
  yAxisVisibleKeys = [],
  children
} = {}) {
  const classes = useStyles();
  const [yAxisKeyHover, setAxisKeyHover] = useState();

  return (
    <ClickAwayListener onClickAway={() => setAxisKeyHover()}>
      <ResponsiveContainer height={300}>
        <LineChart data={data}>
          {yAxisKeys.map((yAxisKey, index) => (
            <Line
              strokeWidth={yAxisVisibleKeys.includes(yAxisKey) ? 1 : 0}
              connectNulls
              key={yAxisKey}
              dot={false}
              type="monotone"
              dataKey={yAxisKey}
              stroke={Colors[index]}
              onMouseOver={() => setAxisKeyHover(yAxisKey)}
              className={clsx(classes.line, {[classes.fade]: yAxisKeyHover && yAxisKeyHover !== yAxisKey})}
            />
          ))}
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisLabelKey} />
          <YAxis />
          <Brush />
          {children}
        </LineChart>
      </ResponsiveContainer>
    </ClickAwayListener>
  );
}
