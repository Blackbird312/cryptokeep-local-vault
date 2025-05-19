
import forge from 'node-forge';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedData {
  encryptedValue: string;
  iv: string;
}

// Génération d'une paire de clés RSA
export const generateRSAKeyPair = (): Promise<KeyPair> => {
  return new Promise((resolve, reject) => {
    try {
      // Génération d'une paire de clés RSA de 2048 bits
      const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });

      // Conversion des clés en format PEM
      const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
      const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);

      resolve({ publicKey, privateKey });
    } catch (error) {
      reject(error);
    }
  });
};

// Chiffrement avec la clé publique RSA
export const encryptWithPublicKey = (data: string, publicKeyPem: string): string => {
  try {
    // Conversion de la clé publique PEM en objet utilisable
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);

    // Chiffrement des données
    // Note: RSA peut seulement chiffrer des données de taille limitée
    // Pour des données plus longues, on utiliserait une approche hybride (AES+RSA)
    const encrypted = publicKey.encrypt(forge.util.encodeUtf8(data), 'RSA-OAEP', {
      md: forge.md.sha256.create(),    // ← SHA-256 pour OAEP
      mgf1: { md: forge.md.sha256.create() },
    });

    // Retourne les données chiffrées en base64
    return forge.util.encode64(encrypted);
  } catch (error) {
    console.error('Erreur lors du chiffrement:', error);
    throw new Error('Échec du chiffrement');
  }
};

// Déchiffrement avec la clé privée RSA
export const decryptWithPrivateKey = (encryptedData: string, privateKeyPem: string): string => {
  try {
    // Conversion de la clé privée PEM en objet utilisable
    const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);

    // Décodage des données chiffrées depuis base64
    const encrypted = forge.util.decode64(encryptedData);

    // Déchiffrement des données
    const decrypted = privateKey.decrypt(encrypted, 'RSA-OAEP', {
      md: forge.md.sha256.create(),
      mgf1: { md: forge.md.sha256.create() },
    });

    // Conversion du résultat en chaîne UTF-8
    return forge.util.decodeUtf8(decrypted);
  } catch (error) {
    console.error('Erreur lors du déchiffrement:', error);
    throw new Error('Échec du déchiffrement');
  }
};

// Génération d'un mot de passe aléatoire fort
export const generateStrongPassword = (
  length = 16,
  options = {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  }
): string => {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = '';
  if (options.uppercase) chars += uppercaseChars;
  if (options.lowercase) chars += lowercaseChars;
  if (options.numbers) chars += numberChars;
  if (options.symbols) chars += symbolChars;

  if (chars.length === 0) {
    throw new Error('Au moins une option de caractères doit être activée');
  }

  // Génération du mot de passe
  let password = '';
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    password += chars[randomValues[i] % chars.length];
  }

  // Vérification que le mot de passe contient au moins un caractère de chaque type activé
  const hasUppercase = !options.uppercase || /[A-Z]/.test(password);
  const hasLowercase = !options.lowercase || /[a-z]/.test(password);
  const hasNumbers = !options.numbers || /[0-9]/.test(password);
  const hasSymbols = !options.symbols || /[^A-Za-z0-9]/.test(password);

  // Si le mot de passe ne satisfait pas toutes les contraintes, en générer un nouveau
  if (!(hasUppercase && hasLowercase && hasNumbers && hasSymbols)) {
    return generateStrongPassword(length, options);
  }

  return password;
};

// Test de la force d'un mot de passe (retourne un score de 0 à 100)
export const passwordStrength = (password: string): { score: number; feedback: string } => {
  if (!password) return { score: 0, feedback: 'Aucun mot de passe fourni' };

  let score = 0;

  // Longueur (jusqu'à 30 points)
  score += Math.min(30, password.length * 2);

  // Complexité (jusqu'à 70 points)
  if (/[A-Z]/.test(password)) score += 15;  // Majuscules
  if (/[a-z]/.test(password)) score += 15;  // Minuscules
  if (/[0-9]/.test(password)) score += 15;  // Chiffres
  if (/[^A-Za-z0-9]/.test(password)) score += 25;  // Symboles

  // Feedback basé sur le score
  let feedback = '';
  if (score < 30) {
    feedback = 'Très faible';
  } else if (score < 50) {
    feedback = 'Faible';
  } else if (score < 70) {
    feedback = 'Moyen';
  } else if (score < 90) {
    feedback = 'Fort';
  } else {
    feedback = 'Très fort';
  }

  return { score, feedback };
};
