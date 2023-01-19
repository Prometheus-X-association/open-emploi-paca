import http from 'k6/http';
import { sleep, check } from 'k6';

// TODO : Set jwt token here before launching tests
const jwt = __ENV.JWT;

if(!jwt){
  throw new Error("You must define a JWT env variable to start that test.");
}

export default function () {
  const opts = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const getSynthesisGqlPayload = {
    query: "{       me { firstName        experiencesCount(filters: [\"experienceType:experience\"])         experiences(filters: [\"experienceT ││ ype:experience\"]) {           edges {             node {               title               startDate               endDate             }           }         }         aptitudesCount         aptitudesToRateCount: aptitudesCount(filters:[\"ratingValue:0\"])         selectedAptitudes: aptitudes(first: 5, filters: [\"isTop5:true\"]) {           edges {             node {               skillLabel               ratingValue             }           }         }         top5Aptitudes: aptitudes(first: 5, sortings: [{sortBy: \"ratingValue\", isSortDescending: true}]) {           edges {             node {               skillLabel               ratingValue             }           }           }       }       jobSuggestion: occupationsMatching(me: true)     } ",
    variables: {}
  };

  const updateProfileGqlPayload = {
    query: "mutation {  updateMe(input: {firstName: \"Olivier\"}){success}}",
    variables: {}
  };

  const responses = http.batch([
    ['POST', `https://preprod.aksis.dashemploi.eu/graphql?jwt=${jwt}`, JSON.stringify(updateProfileGqlPayload), opts],
    ['POST', `https://preprod.aksis.dashemploi.eu/graphql?jwt=${jwt}`, JSON.stringify(getSynthesisGqlPayload), opts]
  ]);

  check(responses[0], {
    'is Command OK': (r) => {
      return r.status === 200 && JSON.parse(r.body).data.updateMe.success === true;
    },
  });

  check(responses[1], {
    'is Query OK': (r) => {
      return r.status === 200 && JSON.parse(r.body).data.me.firstName === "Olivier"
    },
  });

  sleep(1);
}