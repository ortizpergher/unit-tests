import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

import { CreateUserError } from "./CreateUserError";

describe("Create user", () => {
  let createUserUseCase: CreateUserUseCase;
  let inMemoryUsersRepository: InMemoryUsersRepository;

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "John Test",
      email: "john@email.com",
      password: "123456",
    });

    expect(user).toHaveProperty("id");
    expect(user.name).toBe("John Test");
  });

  it("should not create a new user if user already exists", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "John Test",
        email: "john@email.com",
        password: "123456",
      });

      await createUserUseCase.execute({
        name: "John Test",
        email: "john@email.com",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
