declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        companyId: string;
      };
    }
  }
}

export {};
