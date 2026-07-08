
export {};

declare global {
  namespace Express {
    interface User {
      user_id: string;
      username: string;
      role: 'SUPER_ADMIN' | 'APPLICANT' | 'DISTRICT_ADMIN' | 'DISTRICT_SP' | 'TS_UPCC_ADMIN' | 'TS_UPCC_SP' | 'TS_DIG_IG' | 'TSHQ_ADMIN' | 'ADG_TS';
      personnel_id: string | null;
      district_id: string | null;
    }

    interface Request {
      user?: User;
    }
  }
}
