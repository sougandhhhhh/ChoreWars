"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LandingScreen from '@/components/auth/LandingScreen';
import CredentialLoginScreen from '@/components/auth/CredentialLoginScreen';
import ProfileSelectionScreen from '@/components/auth/ProfileSelectionScreen';
import { OPERATIVES } from '@/data/operatives';
import PasscodeScreen from '@/components/auth/PasscodeScreen';
import useAuthStore from '@/stores/useAuthStore';
import { Toaster } from 'react-hot-toast';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, currentUser, logout } = useAuthStore();
  const [authView, setAuthView] = useState('landing');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Removed auto-redirect to allow landing page to be seen on fresh runs
  // useEffect(() => {
  //   if (isAuthenticated && currentUser) {
  //     router.push('/');
  //   }
  // }, [isAuthenticated, currentUser, router]);

  useEffect(() => {
    const isStartup = searchParams.get('startup');
    if (isStartup === 'true') {
      logout();
      // Clean up the URL
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('startup');
      const queryString = newParams.toString();
      router.replace(`/login${queryString ? `?${queryString}` : ''}`);
    }
  }, [searchParams, logout, router]);

  useEffect(() => {
    const view = searchParams.get('view');
    const profileId = searchParams.get('profileId');
    
    if (view === 'passcode' && profileId) {
      setAuthView('passcode');
      setSelectedProfileId(profileId);
    }
  }, [searchParams]);

  const handleLogin = (profileId: string) => {
    router.push('/');
  };

  const handleProfileSelect = (profileId: string) => {
    setSelectedProfileId(profileId);
    setAuthView('passcode');
  };

  const handlePasscodeSuccess = () => {
    const profile = OPERATIVES.find(op => op.profileId === selectedProfileId);
    if (!selectedProfileId) return;

    useAuthStore.setState({
      isAuthenticated: true,
      currentUser: {
        username: selectedProfileId,
        profileId: selectedProfileId,
        displayName: profile?.name || selectedProfileId.charAt(0).toUpperCase() + selectedProfileId.slice(1),
        avatar: profile?.image || '',
      },
      loginAttempts: 0,
      lockoutUntil: null,
    });
    router.push('/');
  };

  if (authView === 'credentials') {
    return <CredentialLoginScreen onLogin={handleLogin} onBack={() => setAuthView('landing')} />;
  }
  if (authView === 'profiles') {
    return <ProfileSelectionScreen onSelect={handleProfileSelect} onBack={() => setAuthView('landing')} />;
  }
  if (authView === 'passcode') {
    return <PasscodeScreen profileId={selectedProfileId} onSuccess={handlePasscodeSuccess} onBack={() => setAuthView('profiles')} />;
  }
  
  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 2500 }} />
      <LandingScreen
        onChooseCredentials={() => setAuthView('credentials')}
        onChoosePasscode={() => setAuthView('profiles')}
      />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
