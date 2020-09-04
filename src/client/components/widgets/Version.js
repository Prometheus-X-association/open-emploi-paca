import React from "react";
import Package from "../../../../package.json";
import dayjs from "dayjs";

export function Version({className} = {}) {
  let version = Package.version;
  let date = version.match(/(2020[0-9]*)/);

  return (
    <span className={className}>
      <Choose>
        <When condition={!!date}>Dernière mise à jour le {dayjs(date[0]).format("L")}</When>
        <Otherwise>Version : {version}</Otherwise>
      </Choose>
    </span>
  );
}
