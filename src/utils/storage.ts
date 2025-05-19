
// Clés utilisées pour le stockage local
const KEYS_STORAGE_KEY = 'vault_keys';
const PASSWORDS_STORAGE_KEY = 'vault_passwords';

// Types pour le stockage des données
export interface StoredKeys {
  publicKey: string;
  // La clé privée n'est pas stockée de manière persistante pour des raisons de sécurité
  keyExists: boolean;
  encryptedTest: string;
}

export interface StoredPassword {
  id: string;
  name: string;
  username: string;
  encryptedPassword: string;
  url: string;
  category: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Sauvegarde des clés (seulement la clé publique)
export const saveKeys = (keys: { publicKey: string, encryptedTest: string }): void => {
  try {
    const keysData: StoredKeys = {
      publicKey: keys.publicKey,
      encryptedTest: keys.encryptedTest,
      keyExists: true
    };
    localStorage.setItem(KEYS_STORAGE_KEY, JSON.stringify(keysData));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des clés:', error);
    throw new Error('Impossible de sauvegarder les clés');
  }
};

// Récupération des clés stockées
export const getStoredKeys = (): StoredKeys | null => {
  try {
    const keysData = localStorage.getItem(KEYS_STORAGE_KEY);
    if (!keysData) return null;
    return JSON.parse(keysData) as StoredKeys;
  } catch (error) {
    console.error('Erreur lors de la récupération des clés:', error);
    return null;
  }
};

// Effacer les clés stockées
export const clearStoredKeys = (): void => {
  try {
    localStorage.removeItem(KEYS_STORAGE_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression des clés:', error);
  }
};

// Sauvegarde des mots de passe chiffrés
export const savePasswords = (passwords: StoredPassword[]): void => {
  try {
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des mots de passe:', error);
    throw new Error('Impossible de sauvegarder les mots de passe');
  }
};

// Récupération des mots de passe stockés
export const getStoredPasswords = (): StoredPassword[] => {
  try {
    const passwordsData = localStorage.getItem(PASSWORDS_STORAGE_KEY);
    if (!passwordsData) return [];
    return JSON.parse(passwordsData) as StoredPassword[];
  } catch (error) {
    console.error('Erreur lors de la récupération des mots de passe:', error);
    return [];
  }
};

// Effacer les mots de passe stockés
export const clearStoredPasswords = (): void => {
  try {
    localStorage.removeItem(PASSWORDS_STORAGE_KEY);
  } catch (error) {
    console.error('Erreur lors de la suppression des mots de passe:', error);
  }
};
