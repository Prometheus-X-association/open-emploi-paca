import { forwardRef } from "react";
import {Link as RouterLink} from "react-router-dom";
import Link from "@material-ui/core/Link";

export function createLink({to, text, children, ...props} = {}) {
  // The use of React.forwardRef will no longer be required for react-router-dom v6.
  // See https://github.com/ReactTraining/react-router/issues/6056
  const WrappedLink = forwardRef((props, ref) => <RouterLink innerRef={ref} {...props} />);

  return (
    <Link component={WrappedLink} to={to} {...props}>
      {text || children || ""}
    </Link>
  );
}
