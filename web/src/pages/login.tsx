import React from 'react'
import { Formik, Form } from 'formik'
import { Box, Button } from '@chakra-ui/react';
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
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, {setErrors}) => {
          const response = await login({ options: values});
          if (response.data?.login.errors) {
            [{field: 'username', message: 'something wrong'}]
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            //worked
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => 
        (
          <Form>
            <InputField
              name='username'
              label='Username'
              placeholder='username'
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