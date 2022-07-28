const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class mg11658926982357 {
    name = 'mg11658926982357'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "users" ("id" bigint NOT NULL, "username" character varying(255), "last_use" date, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admins" ("user_id" bigint NOT NULL, "can_update_admins" boolean NOT NULL DEFAULT false, CONSTRAINT "REL_2b901dd818a2a6486994d915a6" UNIQUE ("user_id"), CONSTRAINT "PK_2b901dd818a2a6486994d915a68" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "statistics" ("date" date NOT NULL, "users_per_day" integer NOT NULL DEFAULT '0', "cart_per_day" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_d6006c28497f00f23771c0ee7d5" PRIMARY KEY ("date"))`);
        await queryRunner.query(`CREATE TABLE "answers" ("id" SERIAL NOT NULL, CONSTRAINT "PK_9c32cec6c71e06da0254f2226c6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointments" ("id" SERIAL NOT NULL, "worker_id" bigint, "worker_rate" integer, "customer_id" bigint NOT NULL, "city" character varying(255) NOT NULL, "branch" character varying(255) NOT NULL, "description" character varying(2000) NOT NULL, "price" character varying(100) NOT NULL, "timeout" integer NOT NULL, CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lawyers" ("id" bigint NOT NULL, "username" character varying(255), "city" character varying(255), "fio" character varying(255), "sertificate" character varying(255), CONSTRAINT "PK_8adba1a65dc0076bb9fa0910d8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`DROP TABLE "lawyers"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        await queryRunner.query(`DROP TABLE "answers"`);
        await queryRunner.query(`DROP TABLE "statistics"`);
        await queryRunner.query(`DROP TABLE "admins"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
