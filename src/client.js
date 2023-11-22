import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "https://gateway.master.sabay.com/graphql"
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  // const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization:
        "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMzUzMTY5MWItZjhiMy00Nzg5LTg0ZDQtN2Y3MDRmMTMzNTQ5IiwiYXBwX2lkIjoibXlzYWJheV91c2VyIiwiZnJvbSI6bnVsbCwiYXVkIjoidXNlciIsInRva2VuX2lkIjoiODA3ZGYyYTktNTZlNi00ZWUzLWE4NzAtOTBjMzA3NTgzZDJhIiwibXlzYWJheV91c2VyX2lkIjozOTU1NTkyMywiZW1haWxfdmVyaWZpZWQiOjEsInBob25lX3ZlcmlmaWVkIjoxLCJ1c2VybmFtZSI6ImFjY190ZXN0ZXIiLCJkaXNwbGF5X25hbWUiOiIgIiwiaWF0IjoxNjg1NDE4MjQwLCJleHAiOjE2ODU0NjE0NDB9.tKge1gNCNXXqGdmZZqYm4B_LVzXIcGUbXDc8O3yqtEaBSYI2ASiMqLOxesjDvUMKk8rhIptvUptwr-N98w0nnQpme4E7r2TyxziCn7t2-jjqm1013QCYWuFRYMvIllE9Z5lGystZ4uV7c1GrUJNtv7LNDDSKlBwjARV11UJvKzzUidRln7P1_tt-l1U0y55j55U-GG291auje72xHx9yTFcAfJWATYqqb-pgB1iz68REkD5nT-5zHUIn_cAMVMijP79O2xwJaA32KagrmaXReVsXxO4KVC8irnR3J6vuxjIMPQI7fxsuohQDMO4WdfQrr4VtSEan4W38b3Esf1mOmv3SenJ4medD-A-olxSeoMcndyFBcAz-0bqu-2Ih5AP3clGomxema7bsxOM3oTeYgIDGxyQCphMXGsq_yfMgRvC818ozUYKhfVwR_Whq6J47MaiOnM-xUgSBREkH1EQQBlVnJSL-kXxtBnGSF0JjkeYVaT16tbg8tcch5WvJ9l7zpY96Cj8Rk6WyiUIb_XgUWHFGQpIn2uv49jOpU19pQSZ79AJvCiqb2q_WpxpnZsHsY88cxSbF6u2pusUFMtsTo9EO3aC2Q66Wd7TdZq51RZ9a4aTD3A9H_3sSpPtY6hldqDvW_CLxHuQdH9qzTMMyU_qC1ClAYg0I4-Gq4y-yI4w",
      "service-code": "mysabay_user"
    }
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
