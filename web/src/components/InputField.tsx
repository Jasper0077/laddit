import React, { InputHTMLAttributes } from "react";
import { useField } from "formik";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
} from "@chakra-ui/react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  textarea?: boolean;
};

// '' => false
// 'error message stuff' => true

export const InputField: React.FC<InputFieldProps> = ({
  label,
  textarea,
  size: _,
  ...props
}) => {
  let InputOrTextarea = Input;
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      { textarea && (
        <Textarea {...field} />
      )}
      {!textarea && (
        <InputOrTextarea {...field} {...props} id={field.name} />
      )}
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};