import React, {useState} from "react";
import {LineChart, CartesianGrid, Line, ResponsiveContainer, XAxis, YAxis, Brush, BarChart, Bar} from "recharts";
import {Colors} from "./Colors";
import {makeStyles} from "@material-ui/core/styles";

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
  children,
  type = "line"
} = {}) {
  const classes = useStyles();
  const [yAxisKeyHover, setAxisKeyHover] = useState();

  return (
    <ResponsiveContainer height={300}>{type === "bar" ? renderBarChart() : renderLineChart()}</ResponsiveContainer>
  );

  function renderLineChart() {
    return (
      <LineChart data={data} onMouseLeave={() => setAxisKeyHover()}>
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
    );
  }

  function renderBarChart() {
    return (
      <BarChart data={data} onMouseLeave={() => setAxisKeyHover()}>
        {yAxisKeys.map((yAxisKey, index) => (
          <If condition={yAxisVisibleKeys.includes(yAxisKey)}>
            <Bar
              key={yAxisKey}
              dataKey={yAxisKey}
              stackId="a"
              fill={Colors[index]}
              onMouseOver={() => setAxisKeyHover(yAxisKey)}
              className={clsx(classes.line, {[classes.fade]: yAxisKeyHover && yAxisKeyHover !== yAxisKey})}
            />
          </If>
        ))}
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisLabelKey} />
        <YAxis />
        <Brush />
        {children}
      </BarChart>
    );
  }
}
