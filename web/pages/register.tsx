import React from 'react'
import { Formik, Form } from 'formik'
import { FormErrorMessage, FormLabel, FormControl, Input, Box } from '@chakra-ui/react';
import { Wrapper } from "../components/Wrapper";

interface registerProps {

}

const Register: React.FC<registerProps> = ({ }) => {
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => {
          console.log(values);
        }}
      >
        {(values: { username: string | number | readonly string[] | undefined; }, handleChange: React.ChangeEventHandler<HTMLInputElement> | undefined) =>
        (
          <Form>
            <FormControl>
              <FormLabel htmlFor="username">First name</FormLabel>
              <Input value={values.username} onChange={handleChange}
                id="name" placeholder="name" />
              {/* <FormErrorMessage>{form.errors.name}</FormErrorMessage> */}
            </FormControl>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register