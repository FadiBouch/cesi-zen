import axios from "axios";
import api from "../services/api"; // adapte le chemin si nécessaire

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("API Auth", () => {
  it("devrait retourner un token et un utilisateur après connexion", async () => {
    const mockResponse: any = {
      data: {
        token: "fake-token",
        user: {
          id: 8,
          username: "test5",
          email: "test@test.fr5",
          firstName: "test55",
          lastName: "test55",
          role: { id: 2, name: "User" },
        },
      },
    };

    mockedAxios.post.mockResolvedValue(mockResponse);

    const response: any = await api.post("/auth/login", {
      username: "test5",
      password: "password",
    });

    expect(response.data.token).toBe("fake-token");
    expect(response.data.user.username).toBe("test5");
    expect(response.data.user.role.name).toBe("User");
  });
});
