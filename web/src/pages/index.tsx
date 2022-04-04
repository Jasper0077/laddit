import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { NextPage } from 'next'
import React from 'react'
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
    <React.Fragment>
      <Navbar />
      <div>Hello world!</div>
      <br />
      {!data ?
        (<div>Loading...</div>) : (
          <Stack spacing={8}>
            {data.posts.map((post) =>
              <Box p={5} shadow='md' borderWidth='1px'>
                <Heading fontSize='xl'>{post.title}</Heading>
                <Text mt={4}>{post.text.slice(0, 50)}</Text>
              </Box>
            )}
          </Stack>
          )}
    </React.Fragment>
  )
}

export default Home
