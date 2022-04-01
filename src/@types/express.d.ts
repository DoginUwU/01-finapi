import * as express from "express";
import { IAccount } from "./account";

declare global {
  namespace Express {
    interface Request {
      account: IAccount;
    }
  }
}
