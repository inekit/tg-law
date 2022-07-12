const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class mg11657599865125 {
    name = 'mg11657599865125'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "users" ("id" bigint NOT NULL, "last_use" date, "is_captcha_needed" boolean NOT NULL DEFAULT true, "is_subscribed" boolean NOT NULL DEFAULT false, "is_subscribed_private" boolean NOT NULL DEFAULT false, "is_subscribed_add" boolean NOT NULL DEFAULT false, "referer_id" bigint, CONSTRAINT "REL_225203bc7a9057c18dd484f6d2" ("referer_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admins" ("user_id" bigint NOT NULL, "can_update_admins" boolean NOT NULL DEFAULT false, CONSTRAINT "REL_2b901dd818a2a6486994d915a6" UNIQUE ("user_id"), CONSTRAINT "PK_2b901dd818a2a6486994d915a68" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`CREATE TABLE "statistics" ("date" date NOT NULL, "users_per_day" integer NOT NULL DEFAULT '0', "cart_per_day" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_d6006c28497f00f23771c0ee7d5" PRIMARY KEY ("date"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_225203bc7a9057c18dd484f6d26" FOREIGN KEY ("referer_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE set null`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_225203bc7a9057c18dd484f6d26"`);
        await queryRunner.query(`DROP TABLE "statistics"`);
        await queryRunner.query(`DROP TABLE "admins"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
