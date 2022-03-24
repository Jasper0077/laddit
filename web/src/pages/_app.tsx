import { ChakraProvider } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { createUrqlClient } from '../utils/createUrqlClient';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}

export default withUrqlClient(createUrqlClient, { ssr: true })(MyApp)
