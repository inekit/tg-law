const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class mg11657803430427 {
  name = "mg11657803430427";

  async up(queryRunner) {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" bigint NOT NULL, "last_use" date, "wallet_arrd" character varying(255), "nft_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "admins" ("user_id" bigint NOT NULL, "can_update_admins" boolean NOT NULL DEFAULT false, CONSTRAINT "REL_2b901dd818a2a6486994d915a6" UNIQUE ("user_id"), CONSTRAINT "PK_2b901dd818a2a6486994d915a68" PRIMARY KEY ("user_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "statistics" ("date" date NOT NULL, "users_per_day" integer NOT NULL DEFAULT '0', "cart_per_day" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_d6006c28497f00f23771c0ee7d5" PRIMARY KEY ("date"))`
    );
    await queryRunner.query(
      `CREATE TABLE "nfts" ("id" integer NOT NULL, CONSTRAINT "PK_65562dd9630b48c4d4710d66772" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('created', 'payed')`
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" integer NOT NULL, "nft_id" integer, "customer_id" bigint NOT NULL, "count" integer NOT NULL DEFAULT '1', "sum" integer NOT NULL, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'created', CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade`
    );
  }

  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`
    );
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(`DROP TABLE "nfts"`);
    await queryRunner.query(`DROP TABLE "statistics"`);
    await queryRunner.query(`DROP TABLE "admins"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
};
