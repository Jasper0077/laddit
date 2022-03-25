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
      {!data ? <div>Loading...</div> : data.posts.map((post) => <div key={post.id}>{ post.title }</div>)}
    </React.Fragment>
  )
}

export default Home
