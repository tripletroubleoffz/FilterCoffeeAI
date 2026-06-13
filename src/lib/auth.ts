import { authService } from './services/auth';

export async function getSessionUser() {
  return authService.getSessionUser();
}
