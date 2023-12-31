import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

const minWHStyle = {minWidth: 500, minHeight: 250};

export const ConfirmDialog = props => {
  const {title, children, open, setOpen, onConfirm} = props;
  return (
    <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby="confirm-dialog">
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent style={minWHStyle}>{children}</DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => setOpen(false)} color="secondary">
          No
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setOpen(false);
            onConfirm();
          }}
          color="default">
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
