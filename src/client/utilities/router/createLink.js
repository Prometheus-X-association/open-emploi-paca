import { forwardRef } from "react";
import {Link as RouterLink} from "react-router-dom";
import Link from "@material-ui/core/Link";

/**
 * A method to create a Router binded Link (react-router) wrapped in a MUI Link component
 * to preserve the theme.
 *
 * See https://github.com/ReactTraining/react-router/issues/6056
 *
 * @param to
 * @param text
 * @param children
 * @param props
 * @return {JSX.Element}
 */
export function createLink({to, text, children, ...props} = {}) {
  const WrappedLink = forwardRef((props, ref) => <RouterLink innerRef={ref} {...props} />);

  return (
    <Link component={WrappedLink} to={to} {...props}>
      {text || children || ""}
    </Link>
  );
}
