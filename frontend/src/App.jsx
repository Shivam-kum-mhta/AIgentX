import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Web3Provider } from './context/Web3Context'
import { LanguageProvider } from './context/LanguageContext'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Mint } from './pages/Mint'
import { Marketplace } from './pages/Marketplace'
import { AgentDetails } from './components/marketplace/AgentDetails'
import { MyAgents } from './pages/MyAgents'
import { AgentChat } from './components/marketplace/AgentChat'
import './styles/index.css'

export default function App() {
  return (
    <Web3Provider>
      <LanguageProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mint" element={<Mint />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/agent/:tokenId" element={<AgentDetails />} />
              <Route path="/my-agents" element={<MyAgents />} />
              <Route path="/chat/:tokenURI" element={<AgentChat />} />
            </Routes>
          </Layout>
        </Router>
        <Toaster position="top-right" theme="dark" />
      </LanguageProvider>
    </Web3Provider>
  )
}
