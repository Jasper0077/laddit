import React from 'react'
import { Formik, Form } from 'formik'
import { Box, Button, Flex, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { Wrapper } from "../components/Wrapper";
import { InputField } from '../components/InputField';
import { useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from "next/router";

const Login: React.FC<{}> = ({ }) => {
  const router = useRouter();
  const [, login] = useLoginMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, {setErrors}) => {
          const response = await login(values);
          if (response.data?.login.errors) {
            [{field: 'username', message: 'something wrong'}]
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            //worked
            console.log(response.data.login.user);
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => 
        (
          <Form>
            <InputField
              name='usernameOrEmail'
              label='Username or Email'
              placeholder='username or email'
            />
            {/* <Box mt={4}>
              <InputField name="email" placeholder="email" label="Email" />
            </Box> */}
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Flex mt={2}>
              <NextLink href="/forget-password">
                <Link ml="auto">forgotten password?</Link>
              </NextLink>
            </Flex>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >Login</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Login