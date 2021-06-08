import {gql} from "@apollo/client";

export const gqlOccupationDetails = gql`
  query OccupationsMatching($occupationId: ID!, $skillsFilters: [String], $aptitudesFilters: [String]) {
    occupation(id: $occupationId) {
      notation
    }
    skillsCount(filters: $skillsFilters)
    skills(filters: $skillsFilters) {
      edges {
        node {
          id
          prefLabel
        }
      }
    }
    aptitudes(filters: $aptitudesFilters) {
      edges {
        node {
          id
          skillLabel
          ratingValue
        }
      }
    }
  }
`;
