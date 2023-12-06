import {useField} from "formik";
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";

export const SelectField = ({label, value, name, inputProps, options, ...props} = {}) => {
  const [field, meta] = useField({name, ...props});

  return (
    <FormControl>
      <InputLabel>{label}</InputLabel>
      <Select name={name} {...field}>
        {(options || []).map(({label, value}) => (
          <MenuItem value={value} key={value}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
