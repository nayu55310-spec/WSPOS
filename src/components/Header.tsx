import React from 'react';
import { User } from '../types';

interface HeaderProps {
  title: string;
  currentUser: User;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  currentUser,
}) => {
  return (
    <header className="h-16 px-6 border-b border-zinc-800/80 bg-[#121214]/60 backdrop-blur flex items-center justify-between shrink-0">
      <div className="flex flex-col">
        <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-zinc-400">
          Selamat datang kembali, {currentUser.name}
        </p>
      </div>
    </header>
  );
};
