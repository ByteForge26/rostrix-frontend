import React from "react";

const AppCustomizedAxisTick = (props: any) => {
  const truncate = (str: string) => {
    let limit = 15;
    return str.length > limit ? str.substring(0, limit) + "..." : str;
  };
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text y={4} dy={6} textAnchor="middle" fill="#666" fontSize={10}>
        {truncate((payload.value || "") as string)}
      </text>
    </g>
  );
};

export default AppCustomizedAxisTick;
