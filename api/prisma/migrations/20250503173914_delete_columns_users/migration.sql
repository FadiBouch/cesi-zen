/*
  Warnings:

  - You are about to drop the column `resetPasswordExpires` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `menus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "pages" DROP CONSTRAINT "pages_menuId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "resetPasswordExpires",
DROP COLUMN "resetPasswordToken";

-- DropTable
DROP TABLE "menus";

-- DropTable
DROP TABLE "pages";
