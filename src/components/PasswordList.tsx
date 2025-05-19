
import React, { useState } from 'react';
import PasswordItem from './PasswordItem';
import { Password, usePasswords } from '../context/PasswordContext';
import { Input } from '../components/ui/input';
import { Search } from 'lucide-react';

interface PasswordListProps {
  passwords: Password[];
}

const PasswordList: React.FC<PasswordListProps> = ({ passwords }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPasswords = passwords.filter(password => 
    password.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      {/* Barre de recherche */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
          <Input
            placeholder="Rechercher un mot de passe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-vault-dark/50 border-vault-accent/30 text-white placeholder:text-white/40"
          />
        </div>
      </div>
      
      {/* Liste des mots de passe */}
      {filteredPasswords.length > 0 ? (
        <div className="divide-y divide-vault-accent/30">
          {filteredPasswords.map(password => (
            <PasswordItem key={password.id} password={password} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-white/70">
          Aucun mot de passe ne correspond à votre recherche.
        </div>
      )}
    </div>
  );
};

export default PasswordList;
