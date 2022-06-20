import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { OperationType } from "../../entities/Statement";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Statements", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to do a deposit", async () => {
    const createUser: ICreateUserDTO = {
      name: "User Test Statements",
      email: "user_statements@email.com",
      password: "123456",
    };

    const user = await createUserUseCase.execute(createUser);

    const createStatement: ICreateStatementDTO = {
      user_id: user.id as string,
      description: "Salary",
      amount: 1000,
      type: OperationType.DEPOSIT,
    };

    const response = await createStatementUseCase.execute(createStatement);

    expect(response).toHaveProperty("id");
    expect(response).toHaveProperty("user_id");
    expect(response).toHaveProperty("description");
    expect(response).toHaveProperty("amount");
    expect(response).toHaveProperty("type");
    expect(response.user_id).toBe(user.id);
  });

  it("Should return error with user_id does not exists", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "user_id",
        description: "Salary",
        amount: 1000,
        type: OperationType.DEPOSIT,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should be able to do withdraw", async () => {
    const createUser: ICreateUserDTO = {
      name: "User Statements",
      email: "user_statements1@email.com",
      password: "123456",
    };

    const user = await createUserUseCase.execute(createUser);

    await createStatementUseCase.execute({
      user_id: user.id as string,
      description: "Salary",
      amount: 10000,
      type: OperationType.DEPOSIT,
    });

    const createStatement: ICreateStatementDTO = {
      user_id: user.id as string,
      description: "Shop",
      amount: 1000,
      type: OperationType.WITHDRAW,
    };

    const response = await createStatementUseCase.execute(createStatement);

    expect(response).toHaveProperty("id");
    expect(response).toHaveProperty("user_id");
    expect(response).toHaveProperty("description");
    expect(response).toHaveProperty("amount");
    expect(response).toHaveProperty("type");
    expect(response.user_id).toBe(user.id);
    expect(response.amount).toBe(createStatement.amount);
    expect(response.description).toBe(createStatement.description);
  });

  it("Should return error if user has no funds available", async () => {
    expect(async () => {
      const createUser: ICreateUserDTO = {
        name: "User Statements",
        email: "user_stat@email.com",
        password: "159159",
      };

      const user = await createUserUseCase.execute(createUser);

      await createStatementUseCase.execute({
        user_id: user.id as string,
        description: "Shop",
        amount: 2000,
        type: OperationType.WITHDRAW,
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
