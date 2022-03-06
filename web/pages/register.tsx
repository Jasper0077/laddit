import React from 'react'
import { Formik, Form } from 'formik'
import { FormErrorMessage, FormLabel, FormControl, Input, Box, Button } from '@chakra-ui/react';
import { Wrapper } from "../components/Wrapper";
import { InputField } from '../components/InputField';
import { useMutation } from 'urql';

interface registerProps {

}

const REGISTER_MUT = `
mutation Register($username: String, $password: String) {
  register(options: {username: $username, password: $password}) {
    errors {
      field
      message
    }
    user {
      _id
      username
    }
  }
}
`

const Register: React.FC<registerProps> = ({ }) => {
  const [,register] = useMutation(REGISTER_MUT);
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => {
          console.log(values);
          register(values);
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
            <Box mt={4}>
              <InputField name="email" placeholder="email" label="Email" />
            </Box>
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
            >Register</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register