import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "https://gateway.master.sabay.com/graphql",
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  // const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization:
        "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMzUzMTY5MWItZjhiMy00Nzg5LTg0ZDQtN2Y3MDRmMTMzNTQ5IiwiYXBwX2lkIjoibXlzYWJheV91c2VyIiwiZnJvbSI6bnVsbCwiYXVkIjoidXNlciIsInRva2VuX2lkIjoiY2NiNTFlYzgtNjY1YS00ZTI0LWFlZWQtNTM5OWI3ZjFkNjI1IiwibXlzYWJheV91c2VyX2lkIjozOTU1NTkyMywiZW1haWxfdmVyaWZpZWQiOjEsInBob25lX3ZlcmlmaWVkIjoxLCJ1c2VybmFtZSI6ImFjY190ZXN0ZXIiLCJkaXNwbGF5X25hbWUiOiIgIiwiaWF0IjoxNzAwNzIwNzM0LCJleHAiOjE3MDA3NjM5MzR9.WX5RgQOw3B7w_jsPiFwIiwJdjxQoT9ALiOfzbtxFH9xTJocLqZbDxAT_BSEiGbX3wvB5VVr0F9O_fag4NNVJbzOr_DvgFoCMqr4b7VQn77NKrofWe896yY_15Hc-3CA2GUUT0mCYyj6girUMPv_XX28xrRMkTmApdVmFs2Iq8xss148ez7KRtyGflNeAdl1QQGx5izir5qt654qVveg8TQgEhKNoy15ZH3PtYz8qrg_uspEUK4IKYBrnjf2rgUnubzmNsWqshtVyu18GitTY-GhzAXD4r-Oo1MV7jizxquG8DvhI24CWo60_ktaAIjJJCjdNL-xhMID8vKmFE3SWJWdmZeizAG_suMlAp-3sKBqQu7HdBahjp2R7l_-3WdV3SqarsWiVBMjzn5KAxbxIDmXkQdIRpgUsapuyJllWbYNgjox-07hnS0M0vzqwHbpF2qMvLCINI6gH0q1U0JvujprNfggl_phu60UHfpqFW3ybcLP37cAP10UOiVZzFJJxyphBhGh_yYEOST0KX3rANMiB0zU4Nz7h1RKFEhExlaQLViE5RaXUjdx9_IKMf_m0KoTeff97QTNNcADvkke-8rcSoIeurs7CvCGH90qSO-WL0jMIxOkQsNjJX3NHO32sL-urt7l01rdf84iHssD23TBxfa3mrUSn4qO9wUh_Eug",
      "service-code": "mysabay_user",
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
