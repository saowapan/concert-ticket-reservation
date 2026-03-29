import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsersAndReservations1774615458650 implements MigrationInterface {
    name = 'AddUsersAndReservations1774615458650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_d7dbf48ad681965ca77e3cbde13"`);
        await queryRunner.query(`ALTER TABLE "reservations" RENAME COLUMN "ticketId" TO "concertId"`);
        await queryRunner.query(`CREATE TABLE "concerts" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL, "seats" integer NOT NULL, CONSTRAINT "PK_6ca96059628588a3988a5f3236a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_5d7382c01ba60ba2b99c50114aa" FOREIGN KEY ("concertId") REFERENCES "concerts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reservations" DROP CONSTRAINT "FK_5d7382c01ba60ba2b99c50114aa"`);
        await queryRunner.query(`DROP TABLE "concerts"`);
        await queryRunner.query(`ALTER TABLE "reservations" RENAME COLUMN "concertId" TO "ticketId"`);
        await queryRunner.query(`ALTER TABLE "reservations" ADD CONSTRAINT "FK_d7dbf48ad681965ca77e3cbde13" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
