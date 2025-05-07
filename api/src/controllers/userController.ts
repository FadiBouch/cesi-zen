// Modèle utilisateur avec Prisma
import bcrypt from "bcrypt";
import { Role, User } from "@prisma/client";
import prisma from "../utils/database";
import { RegisterData, UpdateProfileData } from "../types/auth";

class UserController {
  public static async create(userData: RegisterData): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const role = await prisma.role.findFirst({
      where: { name: userData.role },
    });
    if (!role) throw new Error("Le rôle est introuvable.");

    console.log(userData);

    return prisma.user.create({
      data: {
        email: userData.email,
        userName: userData.username,
        firstName: userData.firstname || null,
        lastName: userData.lastname || null,
        password: hashedPassword,
        roleId: role.id,
      },
    });
  }

  public static async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        userName: username,
      },
    });
  }

  public static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  public static async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        id: id,
      },
    });
  }

  public static async exists(
    username: string,
    email: string
  ): Promise<boolean> {
    const userCount = await prisma.user.count({
      where: {
        OR: [{ userName: username }, { email: email }],
      },
    });

    return userCount > 0;
  }

  public static async getAll(): Promise<Omit<User, "password">[]> {
    const users = await prisma.user.findMany();

    return users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  public static async update(
    id: number,
    data: UpdateProfileData
  ): Promise<User> {
    return prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }

  public static async updatePassword(
    id: number,
    hashedPassword: string
  ): Promise<User> {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });
  }

  public static async setActiveStatus(
    id: number,
    isActive: boolean
  ): Promise<User> {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive,
      },
    });
  }

  public static async deleteUser(id: number): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }
}

export default UserController;
