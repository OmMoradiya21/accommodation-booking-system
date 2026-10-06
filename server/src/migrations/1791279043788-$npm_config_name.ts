import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1791279043788 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO roles (name, description) VALUES 
            ("ADMIN", "Have Access of all user, manager data. It can add accommodation and remove it.")
            ("MANAGER", "Have Access of company and customer data, manage customer requests, etc)
            ("USER", "Can Create company and request for accommodation behalf of company)
            `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "user" WHERE id IN ("1", "2","3")
        `);
    }

}
