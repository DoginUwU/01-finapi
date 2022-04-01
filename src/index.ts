import express, { NextFunction, request, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import { IAccount, IStatement } from './@types/account';

const app = express();
app.use(express.json());

const verifyIfExistsAccountCPF = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { cpf } = req.headers;

  const account = accounts.find((acc) => acc.cpf === cpf);

  if (!account) return res.status(400).json({ error: "Account not exists" });

  request.account = account;

  return next();
};

const getBalance = (statement: IStatement[]): number => {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    }

    return acc - operation.amount;
  }, 0);

  return balance;
};

const accounts: IAccount[] = [];

app.post("/account", (req, res) => { 
    const { name, cpf }: IAccount = req.body;

    const accountAlreadyExists = accounts.some(account => account.cpf === cpf);

    if (accountAlreadyExists)
        return res.status(400).json({ error: "Account already exists" });
    
    accounts.push({
      id: uuidv4(),
      cpf,
      name,
      statement: [],
    });

    return res.status(201).send();
});

app.put("/account", verifyIfExistsAccountCPF, (req, res) => {
  const { name } = req.body;
  const { account } = req;

  account.name = name;

  return res.status(201).send();
});

app.get("/account", verifyIfExistsAccountCPF, (req, res) => {
  const { account } = req;

  return res.json(account);
});

app.delete("/account", verifyIfExistsAccountCPF, (req, res) => {
  const { account } = req;

  accounts.splice(accounts.indexOf(account), 1);

  return res.status(200).send();
});

app.get("/statement", verifyIfExistsAccountCPF, (req, res) => { 
    const { account } = req;

    return res.json(account.statement);
    
});

app.get("/statement/date", verifyIfExistsAccountCPF, (req, res) => {
  const { date } = req.query;
  const { account } = req;

  const dateFormat = new Date(date + " 00:00");

  const statement = account.statement.filter((a) => a.created_at.toDateString() === dateFormat.toDateString());

  return res.json(statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (req, res) => {
    const { description, amount } = req.body;
    const { account } = req;

    const statementOperation = {
      description,
      amount,
      type: "credit",
      created_at: new Date(),
    } as IStatement;
    
    account.statement.push(statementOperation);
    
    return res.status(201).send();
});
  
app.post("/withdraw", verifyIfExistsAccountCPF, (req, res) => {
  const { amount } = req.body;
  const { account } = req;
  
  const balance = getBalance(account.statement);

  if (balance < amount) return res.status(400).json({ error: "Insufficient funds" });
  
  const statementOperation = {
    amount,
    type: "depit",
    created_at: new Date(),
  } as IStatement;

  account.statement.push(statementOperation);

  return res.status(201).send();
});

app.get("/balance", verifyIfExistsAccountCPF, (req, res) => {
  const { account } = req;

  const balance = getBalance(account.statement);

  return res.json(balance);
});

app.listen(3333, () => {
    console.log('🚀 Server started on port 3333!');
});
