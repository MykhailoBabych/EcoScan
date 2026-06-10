import React, { createContext, useContext, useState } from "react";

type ProfileContextType = {
  step: string;
  setStep: (step: string) => void;
  characterIndex: number;
  setCharacterIndex: (index: number) => void;
  name: string;
  setName: (name: string) => void;
  scansCount: number;
  incrementScans: () => void;
  resetProfile: () => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState("initial");
  const [characterIndex, setCharacterIndex] = useState(0);
  const [name, setName] = useState("");
  const [scansCount, setScansCount] = useState(0);

  const incrementScans = () => setScansCount((prev) => prev + 1);

  const resetProfile = () => {
    setStep("initial");
    setCharacterIndex(0);
    setName("");
    setScansCount(0);
  };

  return (
    <ProfileContext.Provider
      value={{
        step,
        setStep,
        characterIndex,
        setCharacterIndex,
        name,
        setName,
        scansCount,
        incrementScans,
        resetProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
