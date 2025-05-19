
import React, { useState } from 'react';
import { generateStrongPassword } from '../utils/crypto';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordGeneratorProps {
  onSelectPassword?: (password: string) => void;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onSelectPassword }) => {
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordLength, setPasswordLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  
  const generateNewPassword = () => {
    try {
      // Vérifier qu'au moins une option est sélectionnée
      if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
        toast.error('Veuillez sélectionner au moins un type de caractère');
        return;
      }
      
      const newPassword = generateStrongPassword(passwordLength, options);
      setGeneratedPassword(newPassword);
    } catch (error) {
      toast.error('Erreur lors de la génération du mot de passe');
    }
  };
  
  const copyPassword = () => {
    if (!generatedPassword) {
      toast.error('Aucun mot de passe généré');
      return;
    }
    
    navigator.clipboard.writeText(generatedPassword);
    toast.success('Mot de passe copié dans le presse-papier');
  };
  
  const handleOptionChange = (option: keyof typeof options) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  const handleSelectPassword = () => {
    if (onSelectPassword && generatedPassword) {
      onSelectPassword(generatedPassword);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Mot de passe généré</Label>
        <div className="relative">
          <Input
            value={generatedPassword}
            readOnly
            placeholder="Cliquez sur Générer pour créer un mot de passe"
            className="bg-vault-dark/50 border-vault-accent/30 pr-10 font-mono"
          />
          {generatedPassword && (
            <Button
              type="button"
              onClick={copyPassword}
              size="icon"
              variant="ghost"
              className="absolute right-1 top-1 h-8 w-8 text-white/70 hover:text-white hover:bg-vault-accent/20"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Longueur: {passwordLength} caractères</Label>
        </div>
        <Slider
          value={[passwordLength]}
          min={8}
          max={32}
          step={1}
          onValueChange={(value) => setPasswordLength(value[0])}
          className="my-4"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="uppercase" className="cursor-pointer">Majuscules (A-Z)</Label>
          <Switch
            id="uppercase"
            checked={options.uppercase}
            onCheckedChange={() => handleOptionChange('uppercase')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="lowercase" className="cursor-pointer">Minuscules (a-z)</Label>
          <Switch
            id="lowercase"
            checked={options.lowercase}
            onCheckedChange={() => handleOptionChange('lowercase')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="numbers" className="cursor-pointer">Chiffres (0-9)</Label>
          <Switch
            id="numbers"
            checked={options.numbers}
            onCheckedChange={() => handleOptionChange('numbers')}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <Label htmlFor="symbols" className="cursor-pointer">Symboles (!@#$...)</Label>
          <Switch
            id="symbols"
            checked={options.symbols}
            onCheckedChange={() => handleOptionChange('symbols')}
          />
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={generateNewPassword}
          className="w-full bg-vault-primary hover:bg-vault-primary/80"
        >
          Générer un mot de passe
        </Button>
        
        {onSelectPassword && (
          <Button
            type="button"
            onClick={handleSelectPassword}
            disabled={!generatedPassword}
            variant="outline"
            className="border-vault-accent/30 text-white hover:bg-vault-accent/20"
          >
            Utiliser
          </Button>
        )}
      </div>
    </div>
  );
};

export default PasswordGenerator;
