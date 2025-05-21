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
    const user1response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "user1",
        email: "user1@devlogging.com.br",
        password: "password",
      }),
    });
    expect(user1response.status).toBe(201);

    const user2response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "user2",
        email: "user2@devlogging.com.br",
        password: "password",
      }),
    });
    expect(user2response.status).toBe(201);

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
    const user3response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "user3",
        email: "user3@devlogging.com.br",
        password: "password",
      }),
    });
    expect(user3response.status).toBe(201);

    const user4response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "user4",
        email: "user4@devlogging.com.br",
        password: "password",
      }),
    });
    expect(user4response.status).toBe(201);

    const response = await fetch("http://localhost:3000/api/v1/users/user3", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "user4@devlogging.com.br",
      }),
    });
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
    const uniqueuserresponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueuser",
          email: "uniqueuser@devlogging.com.br",
          password: "password",
        }),
      },
    );
    expect(uniqueuserresponse.status).toBe(201);

    const response = await fetch(
      "http://localhost:3000/api/v1/users/uniqueuser",
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
      email: "uniqueuser@devlogging.com.br",
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
    const uniqueemailresponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueemail",
          email: "uniqueemail@devlogging.com.br",
          password: "password",
        }),
      },
    );
    expect(uniqueemailresponse.status).toBe(201);

    const response = await fetch(
      "http://localhost:3000/api/v1/users/uniqueemail",
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
      username: "uniqueemail",
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
    const newpasswordresponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newpassword",
          email: "newpassword@devlogging.com.br",
          password: "password",
        }),
      },
    );
    expect(newpasswordresponse.status).toBe(201);

    const response = await fetch(
      "http://localhost:3000/api/v1/users/newpassword",
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
      username: "newpassword",
      email: "newpassword@devlogging.com.br",
      password: responseBody.password,
      created_at: responseBody.created_at,
      updated_at: responseBody.updated_at,
    });

    expect(uuidVersion(responseBody.id)).toBe(4);
    expect(Date.parse(responseBody.created_at)).not.toBe(NaN);
    expect(Date.parse(responseBody.updated_at)).not.toBe(NaN);

    expect(responseBody.updated_at > responseBody.created_at).toBe(true);

    const userInDatabase = await user.findOneByUsername("newpassword");

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
