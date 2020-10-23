import React from "react";
import {LineChart, CartesianGrid, Line, ResponsiveContainer, XAxis, YAxis, Brush} from "recharts";
import {Colors} from "./Colors";

/**
 *
 */
export function ChartWidget({data = [], xAxisLabelKey = "label", yAxisKeys = [], yAxisVisibleKeys = []} = {}) {
  return (
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
          />
        ))}
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisLabelKey} />
        <YAxis />
        <Brush />
      </LineChart>
    </ResponsiveContainer>
  );
}
