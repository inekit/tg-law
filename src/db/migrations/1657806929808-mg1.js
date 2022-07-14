const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class mg11657806929808 {
    name = 'mg11657806929808'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "sum"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "sum" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "sum"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "sum" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }
}
