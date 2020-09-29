import {gql} from "@apollo/client";

export const gqlOrganizationFragment = gql`
  fragment OrganizationFragment on Organization{
    id
    name
  }
`

export const gqlOrganizations = gql`
  query Organizations($qs: String, $first: Int, $filters: [String], $sortings: [SortingInput]) {
    organizations(qs: $qs, first: $first, sortings: $sortings, filters: $filters) {
      edges {
        node {
          ...OrganizationFragment
        }
      }
    }
  }
  
  ${gqlOrganizationFragment}
`;
