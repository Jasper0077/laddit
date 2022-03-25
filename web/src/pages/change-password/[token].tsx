import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { useState } from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';

export const ChangePassword: NextPage = () => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
    return (<Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: ""}}
        onSubmit={async (values, {setErrors}) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            token:
              typeof router.query.token === "string"
                ? router.query.token
                : "",
          })
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ("token" in errorMap) {
              setTokenError(errorMap.token);
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            //worked
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => 
        (
          <Form>
            <InputField
              name='newPassword'
              label='New Password'
              placeholder='new password'
              type="password"
            />
            {tokenError ? (
              <Flex>
                <Box mr={2} style={{ color: "red" }}>
                  {tokenError}
                </Box>
                <NextLink href="/forget-password">
                  <Link>click here to get a new one</Link>
                </NextLink>
              </Flex>
            ) : null}
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >Change Password</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>);
}

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string
  }
}

export default withUrqlClient(createUrqlClient)(ChangePassword)