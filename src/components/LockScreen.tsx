
import React, { useState } from 'react';
import { useCrypto } from '../context/CryptoContext';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Lock, Key, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const LockScreen: React.FC = () => {
  const { hasStoredKeys, generateKeys, unlockVault } = useCrypto();
  const [privateKey, setPrivateKey] = useState('');
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false);
  
  const handleGenerateKeys = async () => {
    try {
      setIsGeneratingKeys(true);
      await generateKeys();
    } catch (error) {
      toast.error('Erreur lors de la génération des clés');
    } finally {
      setIsGeneratingKeys(false);
    }
  };
  
  const handleUnlock = () => {
    if (!privateKey.trim()) {
      toast.error('Veuillez entrer votre clé privée');
      return;
    }
    
    unlockVault(privateKey);
  };
  
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
      <div className="w-20 h-20 bg-vault-primary/20 rounded-full flex items-center justify-center mb-6">
        <Lock className="w-10 h-10 text-vault-primary" />
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-2">SecureVault</h1>
      <p className="text-white/70 text-center max-w-md mb-8">
        Gestionnaire de mots de passe sécurisé avec chiffrement RSA côté client
      </p>
      
      <div className="bg-vault-surface backdrop-blur-lg p-6 rounded-xl border border-vault-accent/30 shadow-xl w-full max-w-md">
        {hasStoredKeys ? (
          <div className="animate-unlock">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5" />
              Déverrouiller le coffre-fort
            </h2>
            
            <p className="text-white/70 mb-4 text-sm">
              Entrez votre clé privée pour déverrouiller vos mots de passe.
            </p>
            
            <Textarea
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="-----BEGIN RSA PRIVATE KEY-----..."
              className="min-h-[150px] mb-4 text-xs bg-vault-dark/50 border-vault-accent/30 text-white/90"
            />
            
            <div className="flex gap-4">
              <Button
                onClick={handleUnlock}
                className="w-full bg-vault-primary hover:bg-vault-primary/80"
              >
                Déverrouiller
              </Button>
              <Button
                onClick={() => setPrivateKey('')}
                variant="outline"
                className="border-vault-accent/30 text-white/80 hover:bg-vault-accent/20"
              >
                Effacer
              </Button>
            </div>
          </div>
        ) : (
          <div className="animate-unlock">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Premier accès
            </h2>
            
            <p className="text-white/70 mb-6 text-sm">
              Bienvenue dans SecureVault ! Pour commencer, veuillez générer une nouvelle paire de clés. La clé privée sera utilisée pour déverrouiller votre coffre-fort à l'avenir.
            </p>
            
            <Button
              onClick={handleGenerateKeys}
              disabled={isGeneratingKeys}
              className="w-full bg-vault-primary hover:bg-vault-primary/80"
            >
              {isGeneratingKeys ? 'Génération en cours...' : 'Générer une nouvelle paire de clés'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LockScreen;
