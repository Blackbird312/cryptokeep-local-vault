
import React from 'react';
import Layout from '../components/Layout/Layout';
import LockScreen from '../components/LockScreen';
import Dashboard from '../components/Dashboard';
import { useCrypto } from '../context/CryptoContext';
import { PasswordProvider } from '../context/PasswordContext';

const Index = () => {
  const { isUnlocked } = useCrypto();

  return (
    <Layout>
      {isUnlocked ? (
        <PasswordProvider>
          <Dashboard />
        </PasswordProvider>
      ) : (
        <LockScreen />
      )}
    </Layout>
  );
};

export default Index;
