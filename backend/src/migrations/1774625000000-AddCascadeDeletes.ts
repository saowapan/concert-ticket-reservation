import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeletes1774625000000 implements MigrationInterface {
  name = 'AddCascadeDeletes1774625000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update reservations.concertId FK to CASCADE on delete
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP CONSTRAINT "FK_5d7382c01ba60ba2b99c50114aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD CONSTRAINT "FK_5d7382c01ba60ba2b99c50114aa" FOREIGN KEY ("concertId") REFERENCES "concerts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Update reservation_history.concertId FK to SET NULL on delete
    await queryRunner.query(
      `ALTER TABLE "reservation_history" DROP CONSTRAINT "FK_reservation_history_concert"`,
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
      `ALTER TABLE "reservation_history" ADD CONSTRAINT "FK_reservation_history_concert" FOREIGN KEY ("concertId") REFERENCES "concerts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "reservations" DROP CONSTRAINT "FK_5d7382c01ba60ba2b99c50114aa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD CONSTRAINT "FK_5d7382c01ba60ba2b99c50114aa" FOREIGN KEY ("concertId") REFERENCES "concerts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
