import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link/Link";

export function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      Open Emploi Région Sud par&nbsp;
      <Link color="inherit" href="https://www.mnemotix.com">
        Mnemotix
      </Link> et&nbsp;
      <Link color="inherit" href="https://carto.mindmatcher.org/">
        MindMatcher
      </Link>
    </Typography>
  );
}
