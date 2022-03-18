import NextLink from "next/link";
import { Box, Link, Flex, Button } from '@chakra-ui/react';
import React from 'react'
import { useMeQuery } from "../generated/graphql";

interface NavbarProps {

}

export const Navbar: React.FC<NavbarProps> = ({ }) => {
  const [{ data, fetching }] = useMeQuery()
  let body = null
  // data is loading
  if (fetching) {
    // user not logged in
  } else if (!data?.me) {
    console.log(data)
    body = (
      <>
        <NextLink href="/login">
          <Link color={"white"} mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link color={"white"} mr={2}>Register</Link>
        </NextLink>  
      </>    
    )
    // user logged in
  } else {
    body = (
      <Flex>
        <Box mr={2}>{data.me.username}</Box>
        <Button mr={2} variant="link">Logout</Button>
      </Flex>
    )
  }
  return (
    <Flex bg="tomato" p={4}>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
    );
}