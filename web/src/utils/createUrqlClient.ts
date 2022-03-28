import { dedupExchange, errorExchange, fetchExchange } from "urql";
import { cacheExchange} from '@urql/exchange-graphcache';
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation } from "../generated/graphql"
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from "next/router";

export const createUrqlClient = (ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include' as const
  },
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        logout: (_result, _args, cache, _info) => {
          betterUpdateQuery<LogoutMutation, MeQuery>(
            cache,
            { query: MeDocument },
            _result,
            () => ({ me: null })
          )
        },

        login: (_result, _args, cache, _info) => {
          betterUpdateQuery<LoginMutation, MeQuery>(
            cache,
            { query: MeDocument },
            _result,
            (result, query) => {
              if (result.login.errors) {
                return query
              } else {
                return {
                  me: result.login.user
                }
              }
            }
          )
        },

        register: (_result, _args, cache, _info) => {
          betterUpdateQuery<RegisterMutation, MeQuery>(
            cache,
            { query: MeDocument },
            _result,
            (result, query) => {
              if (result.register.errors) {
                return query
              } else {
                return {
                  me: result.register.user
                }
              }
            }
          )
        },
      }
    }
  }),
  errorExchange({
      onError(error) {
        console.error(error);
        if (error.message.includes("Not authenticated")) {
          Router.replace("/login");
        }
      },
    }),
  ssrExchange,
  fetchExchange],
  
});
