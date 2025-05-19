
import React from 'react';
import { useCrypto } from '../../context/CryptoContext';
import { Lock } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isUnlocked, lockVault } = useCrypto();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-vault-dark to-vault-secondary">
      <header className="p-4 bg-vault-surface shadow-md backdrop-blur-lg border-b border-vault-accent/30">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-vault-primary rounded-full flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">SecureVault</h1>
          </div>
          
          {isUnlocked && (
            <button 
              onClick={lockVault}
              className="px-3 py-1.5 bg-vault-accent/30 hover:bg-vault-accent/50 text-white rounded-md text-sm transition-colors"
            >
              Verrouiller
            </button>
          )}
        </div>
      </header>
      
      <main className="container mx-auto p-4 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
      
      <footer className="p-4 bg-vault-surface border-t border-vault-accent/30 text-center text-white/60 text-sm">
        <div className="container mx-auto">
          SecureVault - Application sécurisée de gestion de mots de passe
        </div>
      </footer>
    </div>
  );
};

export default Layout;
