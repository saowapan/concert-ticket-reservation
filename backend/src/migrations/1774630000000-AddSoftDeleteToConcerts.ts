import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteToConcerts1774630000000 implements MigrationInterface {
  name = 'AddSoftDeleteToConcerts1774630000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "concerts" ADD "deletedAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "concerts" DROP COLUMN "deletedAt"`,
    );
  }
}
