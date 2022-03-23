import type { NextPage } from 'next'
import { withUrqlClient } from 'next-urql'
import React from 'react'
import { Navbar } from '../components/Navbar'
import { createUrqlClient } from '../utils/createUrqlClient'

const Home: NextPage = () => {
  return (
    <React.Fragment>
      <Navbar />
      <div>Hello world!</div>
    </React.Fragment>
  )
}

export default withUrqlClient(createUrqlClient)(Home)
