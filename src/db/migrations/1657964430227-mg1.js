const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class mg11657964430227 {
  name = "mg11657964430227";

  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`
    );
    await queryRunner.query(`ALTER TABLE "users"
    RENAME COLUMN "wallet_arrd" TO "wallet_addr"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "wl_count" integer NOT NULL DEFAULT '0'`
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "lootbox_count" integer NOT NULL DEFAULT '1'`
    );
    await queryRunner.query(
      `ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade`
    );
  }

  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lootbox_count"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "wl_count"`);
    await queryRunner.query(`ALTER TABLE "users"
    RENAME COLUMN "wallet_addr" TO "wallet_arrd"`);
    await queryRunner.query(
      `ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }
};
