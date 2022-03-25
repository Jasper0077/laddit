import React, { useState } from "react";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { Wrapper } from "../components/Wrapper";
import { Formik, Form } from "formik";
import { InputField } from "../components/InputField";
import { Box, Button } from "@chakra-ui/react";
import { useForgetPasswordMutation } from "../generated/graphql";

const ForgetPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgetPassword] = useForgetPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgetPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              if an account with that email exists, we will sent you the email
            </Box>
          ) : (
            <Form>
              <InputField
                name="email"
                placeholder="email"
                label="Email"
                type="email"
              />
              <Button
                mt={4}
                type="submit"
                isLoading={isSubmitting}
                color="teal"
              >
                Forgotten Password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(ForgetPassword)