const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class mg11658929514301 {
  name = "mg11658929514301";

  async up(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_2be3c78815aba227af1c3e8e413"`
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_68bcc55975b4f5b0b3a0ba8f41f"`
    );
    await queryRunner.query(
      `ALTER TABLE "answers" DROP CONSTRAINT "FK_352dbaf062f849fcb93658a1b61"`
    );
    await queryRunner.query(
      `ALTER TABLE "answers" DROP CONSTRAINT "FK_b502d28495a3be597f9fe034b55"`
    );
    await queryRunner.query(
      `ALTER TABLE "answers" DROP CONSTRAINT "PK_9c32cec6c71e06da0254f2226c6"`
    );
    await queryRunner.query(
      `ALTER TABLE "answers" ADD CONSTRAINT "PK_5fdd4f774c27854b080f21d28eb" PRIMARY KEY ("lawyer_id", "appointment_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade`
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_2be3c78815aba227af1c3e8e413" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE cascade`
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_68bcc55975b4f5b0b3a0ba8f41f" FOREIGN KEY ("worker_id") REFERENCES "lawyers"("id") ON DELETE cascade ON UPDATE cascade`
    );
    await queryRunner.query(
      `ALTER TABLE "answers" ADD CONSTRAINT "FK_352dbaf062f849fcb93658a1b61" FOREIGN KEY ("lawyer_id") REFERENCES "lawyers"("id") ON DELETE cascade ON UPDATE cascade`
    );
    await queryRunner.query(
      `ALTER TABLE "answers" ADD CONSTRAINT "FK_b502d28495a3be597f9fe034b55" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE cascade ON UPDATE cascade`
    );
  }

  async down(queryRunner) {
    await queryRunner.query(
      `ALTER TABLE "answers" DROP CONSTRAINT "FK_b502d28495a3be597f9fe034b55"`
    );
    await queryRunner.query(
      `ALTER TABLE "answers" DROP CONSTRAINT "FK_352dbaf062f849fcb93658a1b61"`
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_68bcc55975b4f5b0b3a0ba8f41f"`
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" DROP CONSTRAINT "FK_2be3c78815aba227af1c3e8e413"`
    );
    await queryRunner.query(
      `ALTER TABLE "admins" DROP CONSTRAINT "FK_2b901dd818a2a6486994d915a68"`
    );
    await queryRunner.query(
      `ALTER TABLE "answers" DROP CONSTRAINT "PK_5fdd4f774c27854b080f21d28eb"`
    );
    await queryRunner.query(
      `ALTER TABLE "answers" ADD CONSTRAINT "PK_6043da5f339ca44f8beb6e26159" PRIMARY KEY ("id", "lawyer_id", "appointment_id")`
    );
    await queryRunner.query(
      `ALTER TABLE "answers" DROP CONSTRAINT "PK_5fdd4f774c27854b080f21d28eb"`
    );
    await queryRunner.query(
      `ALTER TABLE "answers" ADD CONSTRAINT "PK_9c32cec6c71e06da0254f2226c6" PRIMARY KEY ("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "answers" ADD CONSTRAINT "FK_b502d28495a3be597f9fe034b55" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "answers" ADD CONSTRAINT "FK_352dbaf062f849fcb93658a1b61" FOREIGN KEY ("lawyer_id") REFERENCES "lawyers"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_68bcc55975b4f5b0b3a0ba8f41f" FOREIGN KEY ("worker_id") REFERENCES "lawyers"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "appointments" ADD CONSTRAINT "FK_2be3c78815aba227af1c3e8e413" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "admins" ADD CONSTRAINT "FK_2b901dd818a2a6486994d915a68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }
};
