import React from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import './styles.css';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>@rippleeffect/react</title>
      </Head>
      <div>
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default CustomApp;
