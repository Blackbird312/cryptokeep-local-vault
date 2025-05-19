
import React, { useState } from 'react';
import { usePasswords } from '../context/PasswordContext';
import { useCrypto } from '../context/CryptoContext';
import PasswordList from './PasswordList';
import PasswordForm from './PasswordForm';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Key, Database } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { passwords, isLoading } = usePasswords();
  const { publicKey, privateKey, isUnlocked } = useCrypto();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  const toggleForm = () => {
    setIsFormOpen(!isFormOpen);
  };

  const copyPublicKey = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      toast.success('Clé publique copiée dans le presse-papier');
    }
  };

  

   const exportPrivateKey = () => {
    if (!privateKey) {
      toast.error('Aucune clé privée disponible');
      return;
    }
    const blob = new Blob([privateKey], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vault_private_key.pem';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Clé privée exportée');
  };

  return (
    <div className="animate-unlock py-4">
      {/* En-tête du tableau de bord */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Tableau de bord</h1>
          <p className="text-white/70">Gérez vos mots de passe en toute sécurité</p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setShowKeys(true)}
            variant="outline"
            className="gap-2 border-vault-accent/30 text-white bg-vault-accent/20 hover:bg-white hover:text-vault-dark"
          >
            <Key className="w-4 h-4" />
            Clés
          </Button>

          <Button onClick={toggleForm} className="bg-vault-primary hover:bg-vault-primary/80 gap-2">
            <Plus className="w-4 h-4" />
            Nouveau mot de passe
          </Button>
          {isUnlocked && privateKey && (
            <div className="mb-6">
              <Button
                size="sm"
                onClick={exportPrivateKey}
                className="gap-2 bg-vault-accent/30 hover:bg-vault-accent/50 text-white text-xs py-2"
              >
                <Key className="w-4 h-4" />
                Exporter la clé privée
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-vault-surface backdrop-blur-lg rounded-xl border border-vault-accent/30 shadow-lg overflow-hidden">
        <Tabs defaultValue="all" className="w-full">
          <div className="border-b border-vault-accent/30 px-4">
            <TabsList className="bg-transparent">
              <TabsTrigger
                value="all"
                className="text-white/70 data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:bg-vault-accent/20"
              >
                Tous les mots de passe
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-white/70">
                Chargement des mots de passe...
              </div>
            ) : passwords.length === 0 ? (
              <div className="p-8 flex flex-col items-center justify-center text-white/70">
                <Database className="w-12 h-12 mb-4 opacity-40" />
                <h3 className="text-xl font-medium mb-2">Aucun mot de passe</h3>
                <p className="mb-4">Commencez par ajouter un nouveau mot de passe</p>
                <Button
                  onClick={toggleForm}
                  className="bg-vault-primary hover:bg-vault-primary/80"
                >
                  Ajouter un mot de passe
                </Button>
              </div>
            ) : (
              <PasswordList passwords={passwords} />
            )}
          </TabsContent>

          <TabsContent value="favorites" className="p-0">
            <div className="p-8 text-center text-white/70">
              Cette fonctionnalité sera disponible prochainement.
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogue du formulaire d'ajout de mot de passe */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-vault-dark border-vault-accent/30 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau mot de passe</DialogTitle>
          </DialogHeader>
          <PasswordForm onComplete={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialogue d'affichage des clés */}
      <Dialog open={showKeys} onOpenChange={setShowKeys}>
        <DialogContent className="bg-vault-dark border-vault-accent/30 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Informations sur les clés</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1 text-white/80">Clé publique :</h4>
              <div className="relative">
                <pre className="bg-vault-surface p-3 rounded-md text-xs overflow-x-auto max-h-[150px] border border-vault-accent/30">
                  {publicKey || 'Aucune clé publique disponible'}
                </pre>
                <Button
                  size="sm"
                  onClick={copyPublicKey}
                  className="absolute top-2 right-2 bg-vault-accent/30 hover:bg-vault-accent/50 text-white text-xs py-1 h-auto"
                >
                  Copier
                </Button>
              </div>
            </div>

            <div className="text-xs text-white/70 mb-4">
              <p className="mb-2">
                <strong>Important</strong> : Votre clé privée n'est jamais stockée sur le serveur.
                Elle est uniquement conservée temporairement dans la mémoire de votre navigateur pendant la session.
              </p>
              <p>
                Si vous perdez votre clé privée, vous ne pourrez plus accéder à vos mots de passe chiffrés.
                Assurez-vous de la sauvegarder dans un endroit sûr.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowKeys(false)}
              className="w-full border-vault-accent/30 text-white hover:bg-vault-accent/20"
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
