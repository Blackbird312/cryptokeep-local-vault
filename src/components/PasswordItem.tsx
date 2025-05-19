
import React, { useState } from 'react';
import { Password, usePasswords } from '../context/PasswordContext';
import { 
  Eye, 
  EyeOff,
  Trash,
  Copy,
  LinkIcon,
  MoreVertical
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';

interface PasswordItemProps {
  password: Password;
}

const PasswordItem: React.FC<PasswordItemProps> = ({ password }) => {
  const { deletePassword } = usePasswords();
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copié dans le presse-papier`);
  };
  
  const openWebsite = () => {
    let url = password.url;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    window.open(url, '_blank');
  };
  
  const handleDelete = () => {
    deletePassword(password.id);
    setIsDeleteDialogOpen(false);
  };
  
  const maskPassword = (pwd: string) => {
    return '•'.repeat(Math.min(12, pwd.length));
  };
  
  const getIconForSite = () => {
    try {
      const url = new URL(/^https?:\/\//i.test(password.url) ? password.url : `https://${password.url}`);
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
    } catch (e) {
      return null;
    }
  };

  const siteIcon = getIconForSite();
  
  return (
    <div className="p-4 hover:bg-vault-accent/10 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {siteIcon ? (
            <div className="w-10 h-10 rounded-full overflow-hidden mr-4 bg-white/5 flex items-center justify-center">
              <img 
                src={siteIcon} 
                alt={password.name} 
                className="w-6 h-6"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-vault-primary/20 text-vault-primary flex items-center justify-center mr-4">
              {password.name.substring(0, 1).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="font-medium text-white">{password.name}</h3>
            <p className="text-sm text-white/60">{password.username}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          {/* Affichage du mot de passe */}
          <div className="hidden md:flex items-center mr-2 bg-vault-dark/50 rounded px-2 py-1">
            <span className="text-white/80 text-sm font-mono">
              {showPassword ? password.password : maskPassword(password.password)}
            </span>
            <button 
              onClick={toggleShowPassword} 
              className="ml-2 text-white/60 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          
          {/* Menu d'actions */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="p-2 hover:bg-vault-accent/20 rounded-full">
                <MoreVertical size={16} className="text-white/60" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-vault-dark border-vault-accent/30 text-white">
              <DropdownMenuItem 
                onClick={toggleShowPassword}
                className="cursor-pointer hover:bg-vault-accent/20 flex gap-2 md:hidden"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => copyToClipboard(password.username, 'Nom d\'utilisateur')}
                className="cursor-pointer hover:bg-vault-accent/20 flex gap-2"
              >
                <Copy size={16} />
                Copier le nom d'utilisateur
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => copyToClipboard(password.password, 'Mot de passe')}
                className="cursor-pointer hover:bg-vault-accent/20 flex gap-2"
              >
                <Copy size={16} />
                Copier le mot de passe
              </DropdownMenuItem>
              {password.url && (
                <DropdownMenuItem 
                  onClick={openWebsite}
                  className="cursor-pointer hover:bg-vault-accent/20 flex gap-2"
                >
                  <LinkIcon size={16} />
                  Ouvrir le site web
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="cursor-pointer hover:bg-vault-accent/20 text-red-400 flex gap-2"
              >
                <Trash size={16} />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-vault-dark border-vault-accent/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce mot de passe ?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Êtes-vous sûr de vouloir supprimer le mot de passe pour "{password.name}" ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-vault-accent/30 text-white hover:bg-vault-accent/20">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500/80 hover:bg-red-500 text-white"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PasswordItem;
