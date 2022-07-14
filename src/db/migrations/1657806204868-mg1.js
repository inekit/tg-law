const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class mg11657806204868 {
    name = 'mg11657806204868'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "UQ_2b901dd818a2a6486994d915a68" UNIQUE ("user_id")`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "nfts_id_seq" OWNED BY "nfts"."id"`);
        await queryRunner.query(`ALTER TABLE "nfts" ALTER COLUMN "id" SET DEFAULT nextval('"nfts_id_seq"')`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "orders_id_seq" OWNED BY "orders"."id"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "id" SET DEFAULT nextval('"orders_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "orders_id_seq"`);
        await queryRunner.query(`ALTER TABLE "nfts" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "nfts_id_seq"`);
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "UQ_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }
}
