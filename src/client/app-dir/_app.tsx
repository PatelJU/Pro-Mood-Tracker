import React from 'react';
import ErrorBoundary from '../../components/ErrorBoundary';
// ...existing code...

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;
