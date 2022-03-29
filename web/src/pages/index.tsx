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
      {!data ? <div>Loading...</div> : data.posts.map((post) => <div key={post.id}>{ post.title }</div>)}
    </React.Fragment>
  )
}

export default Home
