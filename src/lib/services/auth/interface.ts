export interface IAuthService {
  getSessionUser(): Promise<any | null>;
  signIn(email: string): Promise<{ success: boolean; user: any }>;
  signUp(email: string, name: string): Promise<{ success: boolean; user: any }>;
  signOut(): Promise<{ success: boolean }>;
}
