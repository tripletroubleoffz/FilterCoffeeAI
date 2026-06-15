export interface IAuthService {
  getSessionUser(req?: Request): Promise<any | null>;
  signIn(email: string): Promise<{ success: boolean; user: any }>;
  signUp(email: string, name: string): Promise<{ success: boolean; user: any }>;
  signOut(): Promise<{ success: boolean }>;
}
