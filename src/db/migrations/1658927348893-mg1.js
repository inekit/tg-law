const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class mg11658927348893 {
    name = 'mg11658927348893'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "answers" ADD "lawyer_id" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "answers" ADD "appointment_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "UQ_2b901dd818a2a6486994d915a68" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "UQ_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP COLUMN "appointment_id"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP COLUMN "lawyer_id"`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }
}
