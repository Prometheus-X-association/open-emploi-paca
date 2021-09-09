import {gql} from "@apollo/client";

export const gqlWeverProfile = gql`
  query Me {
    me {
      id
      weverUser {
        mapId
        reportId
        token
      }
    }
  }
`;
