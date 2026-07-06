
export {};

declare global {
  namespace Express {
    interface User {
      user_id: string;
      username: string;
      role: 'COMPUTER_OPERATOR' | 'DISTRICT_SP' | 'SP_COMPUTER_CENTRE' | 'ADG_TECHNICAL_SERVICES' | 'ADMIN' | 'SUPERVISOR' | 'SP' | 'IG' | 'HQ' | 'SUPER_ADMIN';
      personnel_id: string | null;
      district_id: string | null;
    }

    interface Request {
      user?: User;
    }
  }
}
