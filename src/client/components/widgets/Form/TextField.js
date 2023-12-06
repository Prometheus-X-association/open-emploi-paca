import {TextField as MuiTextField} from "formik-material-ui";
import {Field} from "formik";

export function TextField(props) {
  return <Field fullWidth id={props.name} component={MuiTextField} {...props} />;
}
