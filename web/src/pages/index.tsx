import type { NextPage } from 'next'
import React from 'react'
import { Navbar } from '../components/Navbar'
import { usePostsQuery } from '../generated/graphql'

const Home: NextPage = () => {
  const [{data}] = usePostsQuery();

  return (
    <React.Fragment>
      <Navbar />
      <div>Hello world!</div>
      <br />
      {!data ? null : data.posts.map((post) => <div key={post._id}>{ post.title }</div>)}
    </React.Fragment>
  )
}

export default Home
