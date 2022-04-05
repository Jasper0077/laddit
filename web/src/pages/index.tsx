import { Box, Flex, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import type { NextPage } from 'next'
import React from 'react'
import { Layout } from '../components/Layout'
import { Navbar } from '../components/Navbar'
import { usePostsQuery } from '../generated/graphql'

// rerun
const Home: NextPage = () => {
  const [{ data }] = usePostsQuery({
    variables: {
      limit: 10
    }
  })

  return (
    <Layout variant='regular'>
      <Flex>
        <Heading>Laddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">Create post</Link>
        </NextLink>
      </Flex>
      <br />
      {!data ?
        (<div>Loading...</div>) : (
          <Stack spacing={8}>
            {data.posts.map((post) =>
              <Box p={5} shadow='md' borderWidth='1px'>
                <Heading fontSize='xl'>{post.title}</Heading>
                <Text mt={4}>{post.textSnippet}</Text>
              </Box>
            )}
          </Stack>
          )}
    </Layout>
  )
}

export default Home
