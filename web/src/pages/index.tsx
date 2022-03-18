import type { NextPage } from 'next'
import React from 'react'
import { Navbar } from '../components/Navbar'

const Home: NextPage = () => {
  return (
    <React.Fragment>
      <Navbar />
      <div>Hello world!</div>
    </React.Fragment>
  )
}

export default Home
