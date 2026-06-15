import { authService } from './services/auth';

export async function getSessionUser(req?: Request) {
  return authService.getSessionUser(req);
}
