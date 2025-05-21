import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      await orchestrator.createUser({
        username: "ExactCase",
        email: "exact.case@devlogging.com.br",
        password: "password",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/ExactCase",
      );
      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "ExactCase",
        email: "exact.case@devlogging.com.br",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBe(NaN);
      expect(Date.parse(response2Body.updated_at)).not.toBe(NaN);
    });

    test("With case mismatch", async () => {
      await orchestrator.createUser({
        username: "CaseMismatch",
        email: "case.mismatch@devlogging.com.br",
        password: "password",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/casemismatch",
      );
      expect(response2.status).toBe(200);

      const response2Body = await response2.json();

      expect(response2Body).toEqual({
        id: response2Body.id,
        username: "CaseMismatch",
        email: "case.mismatch@devlogging.com.br",
        password: response2Body.password,
        created_at: response2Body.created_at,
        updated_at: response2Body.updated_at,
      });

      expect(uuidVersion(response2Body.id)).toBe(4);
      expect(Date.parse(response2Body.created_at)).not.toBe(NaN);
      expect(Date.parse(response2Body.updated_at)).not.toBe(NaN);
    });

    test("With non existent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/NonExistentUser",
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
  });
});
