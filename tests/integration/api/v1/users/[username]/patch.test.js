import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  test("With non existent username", async () => {
    const response = await fetch(
      "http://localhost:3000/api/v1/users/NonExistentUser",
      {
        method: "PATCH",
      },
    );
    expect(response.status).toBe(404);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "NotFoundError",
      message: "O username informado não foi encontrado no sistema.",
      action: "Verifique se o username foi digitado corretamente",
      status_code: 404,
    });
  });
  test("With duplicated username", async () => {
    await orchestrator.createUser({
      username: "user1",
    });

    await orchestrator.createUser({
      username: "user2",
    });

    const response = await fetch("http://localhost:3000/api/v1/users/user1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "user2",
      }),
    });
    expect(response.status).toBe(400);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "ValidationError",
      message: "O usuário informado já existe.",
      action: "Utilize outro usuário para realizar a operação.",
      status_code: 400,
    });
  });
  test("With duplicated email", async () => {
    const createdUser1 = await orchestrator.createUser({
      email: "user3@devlogging.com.br",
    });

    await orchestrator.createUser({
      email: "user4@devlogging.com.br",
    });

    const response = await fetch(
      `http://localhost:3000/api/v1/users/${createdUser1.username}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "user4@devlogging.com.br",
        }),
      },
    );
    expect(response.status).toBe(400);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      name: "ValidationError",
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar a operação.",
      status_code: 400,
    });
  });
  test("With unique username", async () => {
    const createdUser = await orchestrator.createUser();

    const response = await fetch(
      `http://localhost:3000/api/v1/users/${createdUser.username}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "anotheruniqueuser",
        }),
      },
    );
    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      id: responseBody.id,
      username: "anotheruniqueuser",
      email: createdUser.email,
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });

    expect(uuidVersion(responseBody.id)).toBe(4);
    expect(Date.parse(responseBody.created_at)).not.toBe(NaN);
    expect(Date.parse(responseBody.updated_at)).not.toBe(NaN);

    expect(responseBody.updated_at > responseBody.created_at).toBe(true);
  });
  test("With unique email", async () => {
    const createdUser = await orchestrator.createUser();

    const response = await fetch(
      `http://localhost:3000/api/v1/users/${createdUser.username}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "anotheruniqueemail@devlogging.com.br",
        }),
      },
    );
    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      id: responseBody.id,
      username: createdUser.username,
      email: "anotheruniqueemail@devlogging.com.br",
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });

    expect(uuidVersion(responseBody.id)).toBe(4);
    expect(Date.parse(responseBody.created_at)).not.toBe(NaN);
    expect(Date.parse(responseBody.updated_at)).not.toBe(NaN);

    expect(responseBody.updated_at > responseBody.created_at).toBe(true);
  });
  test("With new password", async () => {
    const createdUser = await orchestrator.createUser({
      password: "password",
    });

    const response = await fetch(
      `http://localhost:3000/api/v1/users/${createdUser.username}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: "anotherpassword",
        }),
      },
    );
    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toEqual({
      id: responseBody.id,
      username: createdUser.username,
      email: createdUser.email,
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });

    expect(uuidVersion(responseBody.id)).toBe(4);
    expect(Date.parse(responseBody.created_at)).not.toBe(NaN);
    expect(Date.parse(responseBody.updated_at)).not.toBe(NaN);

    expect(responseBody.updated_at > responseBody.created_at).toBe(true);

    const userInDatabase = await user.findOneByUsername(createdUser.username);

    const correctPasswordMatch = await password.compare(
      "anotherpassword",
      userInDatabase.password,
    );
    const incorrectPasswordMatch = await password.compare(
      "password",
      userInDatabase.password,
    );

    expect(correctPasswordMatch).toBe(true);
    expect(incorrectPasswordMatch).toBe(false);
  });
});
