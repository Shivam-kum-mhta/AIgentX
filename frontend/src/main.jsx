import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import { client } from './services/graphqlService'
import App from './App.jsx'
import './index.css'
import './App.css'

// Enable Apollo Dev Tools in development
if (process.env.NODE_ENV === 'development') {
  window.__APOLLO_CLIENT__ = client;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  
)