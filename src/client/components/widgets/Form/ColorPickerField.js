import { useState } from "react";
import {useTranslation} from "react-i18next";
import {Button, Dialog, DialogActions, DialogContent} from "@material-ui/core";
import {ChromePicker} from "react-color";
import {useField, useFormikContext} from "formik";

import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  thumbnail: {
    padding: [[theme.spacing(3), theme.spacing(5)]],
    borderRadius: 3
  }
}));

export const ColorPickerField = ({name, label, ...props} = {}) => {
  const formikContext = useFormikContext();
  const [field, meta] = useField({name, ...props});
  const {t} = useTranslation();
  const classes = useStyles();
  const [color, setColor] = useState(field.value || "#333");
  const [showPicker, setShowPicker] = useState(false);
  const handleChange = color => {
    setColor(color.hex);
    formikContext.setFieldValue(name, color.hex);
  };

  return (
    <div
      style={{display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center", padding: 10}}>
      <label>{label}</label>
      <input type="hidden" {...field} {...props} />
      <div
        className={classes.thumbnail}
        style={{
          backgroundColor: color
        }}
        onClick={() => setShowPicker(true)}
      />
      {showPicker && (
        <Dialog open={showPicker}>
          <DialogContent>
            <label>{label}</label>
            <div
              style={{
                backgroundColor: color,
                marginTop: 10,
                marginBottom: 10,
                padding: 40,
                borderRadius: 3
              }}>
              <ChromePicker color={color} onChange={handleChange} />
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              color="inherit"
              onClick={() => {
                setShowPicker(false);
              }}>
              {t("ACTIONS.CANCEL")}
            </Button>

            <Button
              color="inherit"
              type="submit"
              onClick={() => {
                setShowPicker(false);
              }}>
              {t("ACTIONS.SAVE")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};
