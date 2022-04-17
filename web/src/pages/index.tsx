import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import type { NextPage } from 'next'
import React, { useState } from 'react'
import { Layout } from '../components/Layout'
import { useDeletePostMutation, usePostsQuery } from '../generated/graphql'
import { UpdootSection } from '../components/UpdootSection'
import { DeleteIcon } from '@chakra-ui/icons'

// rerun
const Home: NextPage = () => {
  const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string});
  const [{ data, fetching }] = usePostsQuery({
    variables,
  })

  const [, deletePost] = useDeletePostMutation();

  if (!fetching && !data) {
    return <div>You got failed query for some reason.</div>
  }

  return (
    <Layout variant='regular'>
      {!data && fetching ?
        (<div>Loading...</div>) : (
          <Stack spacing={8}>
            {data!.posts.posts.map((post) =>
              !post ? null : (<Flex key={post.id} p={5} shadow="md" borderWidth="1px">
                <UpdootSection post={post} />
                <Box p={5} flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                    <Link>
                      <Heading fontSize='xl'>{post.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>posted by { post.creator.username}</Text>
                  <Flex align="center">
                    <Text flex={1} mt={4}>{post.textSnippet}</Text>
                    <IconButton
                      onClick={() => deletePost({id: post.id})}
                      icon={<DeleteIcon />}
                      boxSize={8}
                      aria-label="delete post"
                    />
                  </Flex>
                </Box>
              </Flex>)
            )}
          </Stack>
        )
      }
      {data && data.posts.hasMore ? (
        <Flex align="center">
          <Button onClick={() => {
            setVariables({
              limit: variables.limit,
              cursor: data.posts.posts[data.posts.posts.length - 1].created_at,
            })
          }} isLoading={fetching} m="auto" my={8}>
            Load more..
          </Button>
        </Flex>
      ): null}
    </Layout>
  )
}

export default Home
