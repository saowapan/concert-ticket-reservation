import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReservationHistory1774620000000 implements MigrationInterface {
  name = 'AddReservationHistory1774620000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "reservation_history" ("id" SERIAL NOT NULL, "action" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "concertId" integer, CONSTRAINT "PK_reservation_history_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_history" ADD CONSTRAINT "FK_reservation_history_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_history" ADD CONSTRAINT "FK_reservation_history_concert" FOREIGN KEY ("concertId") REFERENCES "concerts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reservation_history" DROP CONSTRAINT "FK_reservation_history_concert"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservation_history" DROP CONSTRAINT "FK_reservation_history_user"`,
    );
    await queryRunner.query(`DROP TABLE "reservation_history"`);
  }
}
