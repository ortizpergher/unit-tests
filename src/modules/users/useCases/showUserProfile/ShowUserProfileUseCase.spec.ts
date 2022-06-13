import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";

let showUserProfile: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Show user profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    showUserProfile = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("should be able to get a user profile by token", async () => {
    const user: ICreateUserDTO = {
      name: "User Test",
      email: "user@email.com",
      password: "123456",
    };

    await createUserUseCase.execute(user);

    const auth = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    const profile = await showUserProfile.execute(auth.user.id as string);

    expect(profile).toHaveProperty("id");
    expect(profile.name).toBe(user.name);
  });

  it("should not return a user profile by wrong id", async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "User Teste Wrong Token",
        email: "user_test@email.com",
        password: "159147258",
      };

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: user.email,
        password: user.password,
      });

      await showUserProfile.execute("wrong_id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
