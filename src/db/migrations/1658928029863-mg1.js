const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class mg11658928029863 {
    name = 'mg11658928029863'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_2be3c78815aba227af1c3e8e413"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_68bcc55975b4f5b0b3a0ba8f41f"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_352dbaf062f849fcb93658a1b61"`);
        await queryRunner.query(`ALTER TABLE "answers" DROP CONSTRAINT "FK_b502d28495a3be597f9fe034b55"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "UQ_68bcc55975b4f5b0b3a0ba8f41f"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "UQ_2be3c78815aba227af1c3e8e413"`);
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
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "UQ_2be3c78815aba227af1c3e8e413" UNIQUE ("customer_id")`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "UQ_68bcc55975b4f5b0b3a0ba8f41f" UNIQUE ("worker_id")`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_b502d28495a3be597f9fe034b55" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "answers" ADD CONSTRAINT "FK_352dbaf062f849fcb93658a1b61" FOREIGN KEY ("lawyer_id") REFERENCES "lawyers"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_68bcc55975b4f5b0b3a0ba8f41f" FOREIGN KEY ("worker_id") REFERENCES "lawyers"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_2be3c78815aba227af1c3e8e413" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }
}
