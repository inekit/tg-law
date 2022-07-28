const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class mg11659018655289 {
    name = 'mg11659018655289'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_2be3c78815aba227af1c3e8e413"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_68bcc55975b4f5b0b3a0ba8f41f"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_352dbaf062f849fcb93658a1b61"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_b502d28495a3be597f9fe034b55"`);
        await queryRunner.query(`ALTER TYPE "public"."lawyers_verification_status_enum" RENAME TO "lawyers_verification_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."lawyers_verification_status_enum" AS ENUM('cancelled', 'verified', 'issued', 'created')`);
        await queryRunner.query(`ALTER TABLE "lawyers" ALTER COLUMN "verification_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "lawyers" ALTER COLUMN "verification_status" TYPE "public"."lawyers_verification_status_enum" USING "verification_status"::"text"::"public"."lawyers_verification_status_enum"`);
        await queryRunner.query(`ALTER TABLE "lawyers" ALTER COLUMN "verification_status" SET DEFAULT 'created'`);
        await queryRunner.query(`DROP TYPE "public"."lawyers_verification_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_2be3c78815aba227af1c3e8e413" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_68bcc55975b4f5b0b3a0ba8f41f" FOREIGN KEY ("worker_id") REFERENCES "lawyers"("id") ON DELETE cascade ON UPDATE cascade`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_352dbaf062f849fcb93658a1b61" FOREIGN KEY ("lawyer_id") REFERENCES "lawyers"("id") ON DELETE cascade ON UPDATE cascade`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_b502d28495a3be597f9fe034b55" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE cascade ON UPDATE cascade`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_b502d28495a3be597f9fe034b55"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_352dbaf062f849fcb93658a1b61"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_68bcc55975b4f5b0b3a0ba8f41f"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_2be3c78815aba227af1c3e8e413"`);
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`CREATE TYPE "public"."lawyers_verification_status_enum_old" AS ENUM('cancelled', 'verified', 'issued')`);
        await queryRunner.query(`ALTER TABLE "lawyers" ALTER COLUMN "verification_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "lawyers" ALTER COLUMN "verification_status" TYPE "public"."lawyers_verification_status_enum_old" USING "verification_status"::"text"::"public"."lawyers_verification_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "lawyers" ALTER COLUMN "verification_status" SET DEFAULT 'issued'`);
        await queryRunner.query(`DROP TYPE "public"."lawyers_verification_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."lawyers_verification_status_enum_old" RENAME TO "lawyers_verification_status_enum"`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_b502d28495a3be597f9fe034b55" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_352dbaf062f849fcb93658a1b61" FOREIGN KEY ("lawyer_id") REFERENCES "lawyers"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_68bcc55975b4f5b0b3a0ba8f41f" FOREIGN KEY ("worker_id") REFERENCES "lawyers"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_2be3c78815aba227af1c3e8e413" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }
}
