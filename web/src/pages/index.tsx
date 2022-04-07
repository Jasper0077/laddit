import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import type { NextPage } from 'next'
import React from 'react'
import { Layout } from '../components/Layout'
import { usePostsQuery } from '../generated/graphql'

// rerun
const Home: NextPage = () => {
  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: 10
    }
  })

  if (!data && !fetching) {
    return <div>You got failed query for some reason.</div>
  }

  return (
    <Layout variant='regular'>
      <Flex align="center">
        <Heading>Laddit</Heading>
        <NextLink href="/create-post">
          <Link ml="auto">Create post</Link>
        </NextLink>
      </Flex>
      <br />
      {fetching && !data ?
        (<div>Loading...</div>) : (
          <Stack spacing={8}>
            {data!.posts.map((post) =>
              <Box p={5} shadow='md' borderWidth='1px'>
                <Heading fontSize='xl'>{post.title}</Heading>
                <Text mt={4}>{post.textSnippet}</Text>
              </Box>
            )}
          </Stack>
        )
      }
      {data ? (
        <Flex align="center">
          <Button isLoading={fetching} m="auto" my={8}>
            Load more..
          </Button>
        </Flex>
      ): null}
    </Layout>
  )
}

export default Home
