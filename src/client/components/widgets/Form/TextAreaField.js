import {useField} from "formik";
import TextField from "@material-ui/core/TextField";
import React from "react";

export const TextAreaField = ({label, ...props}) => {
  const [field, meta] = useField(props);

  if (field && field.value === null) {
    field.value = "";
  }
  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <TextField label={label} id={props.name} multiline rows={5} {...field} {...props} />
      {meta.touched && meta.error ? (
        <div className="MuiFormHelperText-root" style={{color: "red"}}>
          {meta.error}
        </div>
      ) : null}
    </div>
  );
};
