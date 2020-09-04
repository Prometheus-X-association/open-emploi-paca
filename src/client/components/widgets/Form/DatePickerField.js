import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/dayjs";
import {Field} from "formik";
import {KeyboardDatePicker, KeyboardDateTimePicker} from "formik-material-ui-pickers";
import React from "react";
import {locale} from "dayjs";

/**
 * @param {boolean} pickTime - Show a Datetime picker instead of time picker.
 * @param {object} props - Props to pass to picker. @see https://stackworx.github.io/formik-material-ui/docs/api/material-ui-pickers#keyboarddatepicker
 */
export const DatePickerField = ({pickTime, ...props}) => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Field
        component={pickTime ? KeyboardDateTimePicker : KeyboardDatePicker}
        format={locale() === "fr" ? "DD/MM/YYYY" : "YYYY/MM/DD"}
        {...props}
      />
    </MuiPickersUtilsProvider>
  );
};
