import { Request, Response } from "express";
import { Redis } from "ioredis";
import { EntityManager } from "typeorm";

export type MyContext = {
  em: EntityManager
  req: Request;
  res: Response;
  redis: Redis
};