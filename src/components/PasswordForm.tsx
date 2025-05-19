
import React, { useState } from 'react';
import { usePasswords, NewPassword } from '../context/PasswordContext';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Eye, EyeOff, Copy, Save } from 'lucide-react';
import { generateStrongPassword, passwordStrength } from '../utils/crypto';
import { toast } from 'sonner';

interface PasswordFormProps {
  onComplete: () => void;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ onComplete }) => {
  const { addPassword } = usePasswords();
  const [formData, setFormData] = useState<NewPassword>({
    name: '',
    username: '',
    password: '',
    url: '',
    category: 'général',
    notes: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    
    if (!formData.password.trim()) {
      toast.error('Le mot de passe est requis');
      return;
    }
    
    addPassword(formData);
    onComplete();
  };
  
  const generatePassword = () => {
    const newPassword = generateStrongPassword(16);
    setFormData(prev => ({ ...prev, password: newPassword }));
    toast.success('Nouveau mot de passe généré');
  };
  
  const copyGeneratedPassword = () => {
    navigator.clipboard.writeText(formData.password);
    toast.success('Mot de passe copié dans le presse-papier');
  };
  
  const strengthInfo = passwordStrength(formData.password);
  
  // Détermination de la couleur de la barre de force du mot de passe
  const getStrengthBarColor = () => {
    if (strengthInfo.score < 30) return 'bg-red-500';
    if (strengthInfo.score < 50) return 'bg-orange-500';
    if (strengthInfo.score < 70) return 'bg-yellow-500';
    if (strengthInfo.score < 90) return 'bg-green-500';
    return 'bg-emerald-500';
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            name="name"
            placeholder="Ex: Gmail, Facebook..."
            value={formData.name}
            onChange={handleChange}
            className="bg-vault-dark/50 border-vault-accent/30"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username">Nom d'utilisateur ou email</Label>
          <Input
            id="username"
            name="username"
            placeholder="nom.utilisateur@exemple.com"
            value={formData.username}
            onChange={handleChange}
            className="bg-vault-dark/50 border-vault-accent/30"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Mot de passe</Label>
            <Button 
              type="button" 
              onClick={generatePassword}
              size="sm"
              variant="outline"
              className="text-xs h-7 px-2 py-1 bg-vault-accent/20 border-vault-accent/30 text-white hover:bg-vault-accent/30"
            >
              Générer
            </Button>
          </div>
          
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              className="bg-vault-dark/50 border-vault-accent/30 pr-16"
            />
            <div className="absolute right-2 top-2 flex space-x-1">
              {formData.password && (
                <button
                  type="button"
                  onClick={copyGeneratedPassword}
                  className="p-1 hover:bg-vault-accent/20 rounded-sm text-white/70 hover:text-white"
                >
                  <Copy size={16} />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 hover:bg-vault-accent/20 rounded-sm text-white/70 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          {/* Indicateur de force du mot de passe */}
          {formData.password && (
            <div className="mt-2">
              <div className="h-1 w-full bg-vault-dark rounded overflow-hidden">
                <div 
                  className={`h-full ${getStrengthBarColor()}`} 
                  style={{ width: `${strengthInfo.score}%` }}
                />
              </div>
              <p className="text-xs mt-1 text-white/70">
                Force: {strengthInfo.feedback}
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="url">URL du site web (optionnel)</Label>
          <Input
            id="url"
            name="url"
            placeholder="exemple.com"
            value={formData.url}
            onChange={handleChange}
            className="bg-vault-dark/50 border-vault-accent/30"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full rounded-md border border-vault-accent/30 bg-vault-dark/50 p-2 text-white"
          >
            <option value="général">Général</option>
            <option value="travail">Travail</option>
            <option value="personnel">Personnel</option>
            <option value="finance">Finance</option>
            <option value="social">Réseaux sociaux</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optionnel)</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Informations supplémentaires..."
            value={formData.notes}
            onChange={handleChange}
            className="bg-vault-dark/50 border-vault-accent/30 min-h-[80px]"
          />
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button 
          type="submit"
          className="bg-vault-primary hover:bg-vault-primary/80 w-full flex gap-2"
        >
          <Save className="w-4 h-4" />
          Enregistrer
        </Button>
      </div>
    </form>
  );
};

export default PasswordForm;
