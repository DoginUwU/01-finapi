interface IAccount {
  id: string;
  name: string;
  cpf: string;
  statement: IStatement[];
}

interface IStatement {
  amount: number;
  description?: string;
  type: "credit" | "depit";
  created_at: Date;
}

export type { IAccount, IStatement };
