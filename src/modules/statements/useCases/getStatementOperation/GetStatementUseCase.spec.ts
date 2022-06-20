import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";

import { OperationType } from "../../entities/Statement";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should list an user's statement", async () => {
    const createUser: ICreateUserDTO = {
      name: "User Statements",
      email: "user_statements1@email.com",
      password: "123456",
    };

    const user = await createUserUseCase.execute(createUser);

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      description: "Salary",
      amount: 10000,
      type: OperationType.DEPOSIT,
    });

    const response = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(response).toHaveProperty("id");
    expect(response).toEqual(statement);
  });

  it("should return error with user_id does not exists", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "user_id",
        statement_id: "statement_id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should return error with statement_id does not exists", async () => {
    expect(async () => {
      const createUser: ICreateUserDTO = {
        name: "User Statements",
        email: "user_statements1@email.com",
        password: "123456",
      };

      const user = await createUserUseCase.execute(createUser);

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "statement_id",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
