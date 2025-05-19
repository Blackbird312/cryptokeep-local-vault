
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  generateRSAKeyPair,
  encryptWithPublicKey,
  decryptWithPrivateKey,
  KeyPair
} from '../utils/crypto';
import { getStoredKeys, saveKeys, clearStoredKeys } from '../utils/storage';
import { toast } from 'sonner';

// Interface du contexte
interface CryptoContextType {
  publicKey: string | null;
  privateKey: string | null;
  hasStoredKeys: boolean;
  isUnlocked: boolean;
  generateKeys: () => Promise<KeyPair>;
  unlockVault: (privateKey: string) => void;
  lockVault: () => void;
  resetVault: () => void;
  encrypt: (data: string) => string | null;
  decrypt: (encryptedData: string) => string | null;
}

// Création du contexte
const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

const TEST_PLAIN = 'SUPMTICISI4GC';
// Props pour le provider
interface CryptoProviderProps {
  children: ReactNode;
}

// Provider du contexte
export const CryptoProvider: React.FC<CryptoProviderProps> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [hasStoredKeys, setHasStoredKeys] = useState<boolean>(false);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  // Vérification des clés stockées au chargement
  useEffect(() => {
    const storedKeys = getStoredKeys();
    if (storedKeys && storedKeys.keyExists) {
      setPublicKey(storedKeys.publicKey);
      setHasStoredKeys(true);
    }
  }, []);

  // Génération d'une nouvelle paire de clés
  const generateKeys = async () => {
    try {
      const newKeys = await generateRSAKeyPair();
      setPublicKey(newKeys.publicKey);
      setPrivateKey(newKeys.privateKey);
      setIsUnlocked(true);
      setHasStoredKeys(true);
      const encryptedTest = encryptWithPublicKey(TEST_PLAIN, newKeys.publicKey);
      // Sauvegarde de la clé publique uniquement
      saveKeys({ publicKey: newKeys.publicKey, encryptedTest });
      toast.success('Nouvelle paire de clés générée avec succès');

      return newKeys;
    } catch (error) {
      console.error('Erreur lors de la génération des clés:', error);
      toast.error('Erreur lors de la génération des clés');
      throw error;
    }
  };

  // Déverrouillage du coffre-fort avec la clé privée
  // const unlockVault = (privateKeyInput: string) => {
  //   try {
  //     // Vérification que la clé privée fournie correspond à la clé publique stockée
  //     // En pratique, on testerait le déchiffrement d'une donnée test
  //     setPrivateKey(privateKeyInput);
  //     setIsUnlocked(true);
  //     toast.success('Coffre-fort déverrouillé');
  //   } catch (error) {
  //     console.error('Erreur lors du déverrouillage:', error);
  //     toast.error('Clé privée invalide');
  //   }
  // };

  const unlockVault = (privateKeyInput: string) => {
    const stored = getStoredKeys();
    if (!stored.encryptedTest) {
      toast.error('Aucun test de validation disponible');
      return;
    }

    try {
      const decryptedTest = decryptWithPrivateKey(stored.encryptedTest, privateKeyInput);
      if (decryptedTest !== TEST_PLAIN) {
        throw new Error('Test invalide');
      }
      // Tout est OK : on peut déverrouiller
      setPrivateKey(privateKeyInput);
      setIsUnlocked(true);
      toast.success('Coffre-fort déverrouillé');
    } catch (err) {
      console.error('Échec du test de déchiffrement :', err);
      toast.error('Clé privée invalide');
    }
  };

  // Verrouillage du coffre-fort
  const lockVault = () => {
    setPrivateKey(null);
    setIsUnlocked(false);
    toast.info('Coffre-fort verrouillé');
  };

  // Réinitialisation du coffre-fort (suppression de toutes les clés)
  const resetVault = () => {
    setPublicKey(null);
    setPrivateKey(null);
    setIsUnlocked(false);
    setHasStoredKeys(false);
    clearStoredKeys();
    toast.info('Coffre-fort réinitialisé');
  };

  // Chiffrement des données
  const encrypt = (data: string): string | null => {
    if (!publicKey) {
      toast.error('Aucune clé publique disponible pour le chiffrement');
      return null;
    }

    try {
      return encryptWithPublicKey(data, publicKey);
    } catch (error) {
      console.error('Erreur lors du chiffrement:', error);
      toast.error('Erreur lors du chiffrement des données');
      return null;
    }
  };

  // Déchiffrement des données
  const decrypt = (encryptedData: string): string | null => {
    if (!privateKey || !isUnlocked) {
      toast.error('Le coffre-fort est verrouillé ou aucune clé privée n\'est disponible');
      return null;
    }

    try {
      return decryptWithPrivateKey(encryptedData, privateKey);
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error);
      toast.error('Erreur lors du déchiffrement des données');
      return null;
    }
  };

  // Valeurs exposées par le contexte
  const value: CryptoContextType = {
    publicKey,
    privateKey,
    hasStoredKeys,
    isUnlocked,
    generateKeys,
    unlockVault,
    lockVault,
    resetVault,
    encrypt,
    decrypt
  };

  return (
    <CryptoContext.Provider value={value}>
      {children}
    </CryptoContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useCrypto = (): CryptoContextType => {
  const context = useContext(CryptoContext);
  if (context === undefined) {
    throw new Error('useCrypto doit être utilisé à l\'intérieur d\'un CryptoProvider');
  }
  return context;
};
