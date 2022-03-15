import React from 'react'
import { Formik, Form } from 'formik'
import { FormErrorMessage, FormLabel, FormControl, Input, Box, Button } from '@chakra-ui/react';
import { Wrapper } from "../components/Wrapper";
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';

interface registerProps {

}

const Register: React.FC<registerProps> = ({ }) => {
  const [,register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, {setErrors}) => {
          const response = await register(values);
          if (response.data?.register.errors) {
            [{field: 'username', message: 'something wrong'}]
            setErrors(toErrorMap(response.data.register.errors));
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
            >Register</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register