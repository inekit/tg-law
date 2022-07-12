const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class seed1657551046252 {

    async up(queryRunner) {
        await queryRunner.query(`INSERT INTO "users" (id) VALUES (296846972)`);
        await queryRunner.query(`INSERT INTO "admins" (user_id) VALUES (296846972)`);

        await queryRunner.query(`INSERT INTO "users" (id) VALUES (1758944905)`);
        await queryRunner.query(`INSERT INTO "admins" (user_id) VALUES (1758944905)`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM "users" WHERE id = 296846972`);

        await queryRunner.query(`DELETE FROM "users" WHERE id = 1758944905`);
    }

}
