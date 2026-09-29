import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CampaignPage from './pages/CampaignPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import { CampaignProvider } from './contexts/CampaignContext';
import { WalletProvider } from './contexts/WalletContext';
import {CivicAuthProvider} from '@civic/auth-web3/react'

function App() {
  return (
    <CivicAuthProvider clientId="8b5e0e59-edd6-4c98-8609-6886dbbc23d9" >
    <WalletProvider>
      <CampaignProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/campaign/:id" element={<CampaignPage />} />
              <Route path="/create" element={<CreateCampaignPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </Layout>
        </Router>
      </CampaignProvider>
    </WalletProvider>
  </CivicAuthProvider>
  );
}

export default App;