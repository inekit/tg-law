const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class mg11657633971153 {
    name = 'mg11657633971153'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_225203bc7a9057c18dd484f6d26"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_225203bc7a9057c18dd484f6d26" FOREIGN KEY ("referer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE SET NULL`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade`);
        await queryRunner.query(`ALTER TABLE "users" ADD "captcha_request_datetime" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_225203bc7a9057c18dd484f6d26"`);
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_225203bc7a9057c18dd484f6d26" FOREIGN KEY ("referer_id") REFERENCES "users"("id") ON DELETE set null ON UPDATE set null`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "captcha_request_datetime"`);
    }
}
