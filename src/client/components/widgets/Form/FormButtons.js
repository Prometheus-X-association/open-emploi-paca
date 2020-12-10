import {Button, Grid, Tooltip, Typography} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import {LoadingButton} from "../Button/LoadingButton";

/**
 * disabled or not a submit button of a form, display the reason with a tooltip
 * it can be disabled if no edit was done on inputs or required fields are not filled
 * it will be enabled if valuesFromLinkEdit contain any change
 * @param label
 * @param errors
 * @param touched
 * @param isValid
 * @param dirty
 * @param valuesFromLinkEdit
 * @param {boolean} saving
 */
export function FormButtons({label, errors, touched, isValid, dirty, saving, resetForm, cancelAction, extraSubmitAndResetButton, inDialog} = {}) {
  const {t} = useTranslation();

  let disabled = !isValid || !dirty;
  let submitButton;

  if (disabled) {
    let reason;
    if (errors) {
      let required = false;
      let tooShort = false;
      for (let i in errors) {
        if (errors[i] === "Required") {
          required = true;
        } else if (errors[i] === "Too Short!") {
          tooShort = true;
        }
      }
      if (required.length > 0 || tooShort.length > 0) {
        reason = (
          <div style={{fontSize: 14}}>
            {required.length > 0 && <>{t("FORM_ERRORS.FIELD_ERRORS.REQUIRED_S")}</>}
            {tooShort.length > 0 && <>{t("FORM_ERRORS.FIELD_ERRORS.TOO_SHORTS")}</>}
          </div>
        );
      }
    } else if (!dirty) {
      reason = (
        <Typography color="inherit">{t("FORM_ERRORS.GENERAL_ERRORS.DISABLED_BECAUSE_NO_MODIFICATION")}</Typography>
      );
    }

    submitButton = (
      <Tooltip title={reason || ""} arrow>
        <span>
          {/* don't remove this span or it will fire an error because of disabled button inside tooltip cannot being able to display title */}
          <Button disabled={disabled} type="submit">
            {label || t("ACTIONS.SAVE")}
          </Button>
        </span>
      </Tooltip>
    );
  } else {
    submitButton = (
      <LoadingButton loading={saving} type="submit" variant="contained" color="primary">
        {label || t("ACTIONS.SAVE")}
      </LoadingButton>
    );
  }

  return inDialog ? (
    <>
      {submitButton}
      <Button onClick={resetForm || cancelAction}>{t("ACTIONS.CANCEL")}</Button>
    </>
  ) : (
    <Grid container spacing={2} justify={"flex-end"}>
      <Grid item>{submitButton}</Grid>
      <If condition={cancelAction || (dirty && resetForm)}>
        <Button onClick={resetForm || cancelAction}>{t("ACTIONS.CANCEL")}</Button>
      </If>
    </Grid>
  );
}
