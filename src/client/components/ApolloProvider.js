import {getApolloClient} from "../utilities/apollo/getApolloClient";
import {useSnackbar} from "notistack";
import {ApolloProvider as DefaultApolloProvider} from "@apollo/client";

/**
 * @param {object} i18n - i18n instance
 * @param {object} possibleTypes - gql possible types to handle fragments @see https://www.apollographql.com/docs/react/data/fragments/ for more details.
 * @param children
 * @return {JSX.Element}
 */
export function ApolloProvider({i18n, children, possibleTypes}){
  const {enqueueSnackbar} = useSnackbar();
  const client = getApolloClient({i18n, enqueueSnackbar, possibleTypes});
  return (
    <DefaultApolloProvider client={client}>
      {children}
    </DefaultApolloProvider>
  );
}