import CircularProgress from "@material-ui/core/CircularProgress";

export function LoadingSpinner({children, ...props}) {
  return (
    <>
      <CircularProgress {...props} />
      {children}
    </>
  );
}
