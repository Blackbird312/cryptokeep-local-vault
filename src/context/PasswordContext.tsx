
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useCrypto } from './CryptoContext';
import { getStoredPasswords, savePasswords, StoredPassword } from '../utils/storage';
import { toast } from 'sonner';

// Interface pour les mots de passe déchiffrés (pour l'affichage)
export interface Password {
  id: string;
  name: string;
  username: string;
  password: string;  // Mot de passe déchiffré
  url: string;
  category: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Interface pour l'ajout d'un nouveau mot de passe
export interface NewPassword {
  name: string;
  username: string;
  password: string;
  url: string;
  category: string;
  notes?: string;
}

// Interface du contexte
interface PasswordContextType {
  passwords: Password[];
  addPassword: (newPassword: NewPassword) => void;
  updatePassword: (id: string, updatedPassword: Partial<NewPassword>) => void;
  deletePassword: (id: string) => void;
  getPasswordById: (id: string) => Password | undefined;
  isLoading: boolean;
}

// Création du contexte
const PasswordContext = createContext<PasswordContextType | undefined>(undefined);

// Props pour le provider
interface PasswordProviderProps {
  children: ReactNode;
}

// Provider du contexte
export const PasswordProvider: React.FC<PasswordProviderProps> = ({ children }) => {
  const [encryptedPasswords, setEncryptedPasswords] = useState<StoredPassword[]>([]);
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { encrypt, decrypt, isUnlocked } = useCrypto();

  // Charger les mots de passe chiffrés au démarrage
  useEffect(() => {
    const loadPasswords = () => {
      try {
        const storedPasswords = getStoredPasswords();
        setEncryptedPasswords(storedPasswords);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des mots de passe:', error);
        toast.error('Erreur lors du chargement des mots de passe');
        setIsLoading(false);
      }
    };
    
    loadPasswords();
  }, []);

  // Déchiffrer les mots de passe quand le coffre est déverrouillé
  useEffect(() => {
  if (isUnlocked && decrypt) {
    const decryptedList: Password[] = [];

    encryptedPasswords.forEach(encPass => {
      try {
        const plain = decrypt(encPass.encryptedPassword);
        if (plain == null) {
          throw new Error(`decrypt returned ${plain}`);
        }
        decryptedList.push({
          id: encPass.id,
          name: encPass.name,
          username: encPass.username,
          password: plain,
          url: encPass.url,
          category: encPass.category,
          notes: encPass.notes,
          createdAt: encPass.createdAt,
          updatedAt: encPass.updatedAt,
        });
      } catch (err) {
        console.error(`Impossible de déchiffrer « ${encPass.name} »:`, err);
        toast.error(`Impossible de déchiffrer le mot de passe « ${encPass.name} ». Il a été ignoré.`);
      }
    });

    setPasswords(decryptedList);
  } else {
    setPasswords([]);
  }
}, [isUnlocked, encryptedPasswords, decrypt]);

  // Ajouter un nouveau mot de passe
  const addPassword = (newPassword: NewPassword) => {
    if (!encrypt) {
      toast.error('Le système de chiffrement n\'est pas initialisé');
      return;
    }

    try {
      const encryptedPassword = encrypt(newPassword.password);
      if (!encryptedPassword) {
        throw new Error('Échec du chiffrement du mot de passe');
      }
      
      const now = Date.now();
      const passwordData: StoredPassword = {
        id: uuidv4(),
        name: newPassword.name,
        username: newPassword.username,
        encryptedPassword,
        url: newPassword.url,
        category: newPassword.category,
        notes: newPassword.notes,
        createdAt: now,
        updatedAt: now
      };
      
      const updatedEncryptedPasswords = [...encryptedPasswords, passwordData];
      setEncryptedPasswords(updatedEncryptedPasswords);
      savePasswords(updatedEncryptedPasswords);
      
      toast.success(`Mot de passe "${newPassword.name}" ajouté`);
      
      // Si le coffre est déverrouillé, mettre à jour également les mots de passe déchiffrés
      if (isUnlocked && decrypt) {
        const passwordWithDecrypted: Password = {
          ...passwordData,
          password: newPassword.password
        };
        setPasswords([...passwords, passwordWithDecrypted]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du mot de passe:', error);
      toast.error('Erreur lors de l\'ajout du mot de passe');
    }
  };

  // Mettre à jour un mot de passe existant
  const updatePassword = (id: string, updatedPassword: Partial<NewPassword>) => {
    if (!encrypt || !isUnlocked) {
      toast.error('Le coffre-fort est verrouillé');
      return;
    }

    try {
      const passwordIndex = encryptedPasswords.findIndex(p => p.id === id);
      if (passwordIndex === -1) {
        toast.error('Mot de passe non trouvé');
        return;
      }
      
      const oldPassword = encryptedPasswords[passwordIndex];
      const decryptedOldPassword = passwords.find(p => p.id === id);
      
      // Préparation des données à mettre à jour
      const updatedData: Partial<StoredPassword> = {
        ...updatedPassword,
        updatedAt: Date.now()
      };
      
      // Si le mot de passe lui-même est modifié, il faut le chiffrer à nouveau
      if (updatedPassword.password !== undefined) {
        const encryptedPassword = encrypt(updatedPassword.password);
        if (!encryptedPassword) {
          throw new Error('Échec du chiffrement du nouveau mot de passe');
        }
        updatedData.encryptedPassword = encryptedPassword;
      }
      
      // Mise à jour des mots de passe chiffrés
      const newEncryptedPasswords = [...encryptedPasswords];
      newEncryptedPasswords[passwordIndex] = {
        ...oldPassword,
        ...updatedData
      };
      
      setEncryptedPasswords(newEncryptedPasswords);
      savePasswords(newEncryptedPasswords);
      
      // Mise à jour des mots de passe déchiffrés si le coffre est déverrouillé
      if (isUnlocked && decryptedOldPassword) {
        const newPasswords = [...passwords];
        newPasswords[passwords.findIndex(p => p.id === id)] = {
          ...decryptedOldPassword,
          ...updatedPassword,
          updatedAt: Date.now()
        };
        setPasswords(newPasswords);
      }
      
      toast.success(`Mot de passe "${oldPassword.name}" mis à jour`);
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      toast.error('Erreur lors de la mise à jour du mot de passe');
    }
  };

  // Supprimer un mot de passe
  const deletePassword = (id: string) => {
    try {
      const passwordToDelete = encryptedPasswords.find(p => p.id === id);
      if (!passwordToDelete) {
        toast.error('Mot de passe non trouvé');
        return;
      }
      
      const newEncryptedPasswords = encryptedPasswords.filter(p => p.id !== id);
      setEncryptedPasswords(newEncryptedPasswords);
      savePasswords(newEncryptedPasswords);
      
      // Mise à jour des mots de passe déchiffrés si le coffre est déverrouillé
      if (isUnlocked) {
        setPasswords(passwords.filter(p => p.id !== id));
      }
      
      toast.success(`Mot de passe "${passwordToDelete.name}" supprimé`);
      
    } catch (error) {
      console.error('Erreur lors de la suppression du mot de passe:', error);
      toast.error('Erreur lors de la suppression du mot de passe');
    }
  };

  // Récupérer un mot de passe par son ID
  const getPasswordById = (id: string): Password | undefined => {
    return passwords.find(p => p.id === id);
  };

  // Valeurs exposées par le contexte
  const value: PasswordContextType = {
    passwords,
    addPassword,
    updatePassword,
    deletePassword,
    getPasswordById,
    isLoading
  };

  return (
    <PasswordContext.Provider value={value}>
      {children}
    </PasswordContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const usePasswords = (): PasswordContextType => {
  const context = useContext(PasswordContext);
  if (context === undefined) {
    throw new Error('usePasswords doit être utilisé à l\'intérieur d\'un PasswordProvider');
  }
  return context;
};
