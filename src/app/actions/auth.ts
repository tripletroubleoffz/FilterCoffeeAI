'use server';

import { authService } from '@/lib/services/auth';
import { redirect } from 'next/navigation';

export async function signInAction(email: string) {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  try {
    await authService.signIn(email);
  } catch (error: any) {
    return { error: error.message || 'Failed to sign in.' };
  }

  redirect('/');
}

export async function signUpAction(email: string, name: string) {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!name || name.trim().length < 2) {
    throw new Error('Please enter a valid name.');
  }

  try {
    await authService.signUp(email, name);
  } catch (error: any) {
    return { error: error.message || 'Failed to sign up.' };
  }

  redirect('/');
}

export async function signOutAction() {
  try {
    await authService.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
  redirect('/');
}
