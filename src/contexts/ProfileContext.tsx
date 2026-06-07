import React, { createContext, useContext, useState } from 'react';

type ProfileContextType = {
  step: string;
  setStep: (step: string) => void;
  characterIndex: number;
  setCharacterIndex: (index: number) => void;
  name: string;
  setName: (name: string) => void;
  resetProfile: () => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState('initial');
  const [characterIndex, setCharacterIndex] = useState(0);
  const [name, setName] = useState('');

  const resetProfile = () => {
    setStep('initial');
    setCharacterIndex(0);
    setName('');
  };

  return (
    <ProfileContext.Provider 
      value={{ 
        step, setStep, 
        characterIndex, setCharacterIndex, 
        name, setName, 
        resetProfile 
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
