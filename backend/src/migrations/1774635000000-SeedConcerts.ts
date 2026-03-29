import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedConcerts1774635000000 implements MigrationInterface {
  name = 'SeedConcerts1774635000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Seed a default user for testing
    await queryRunner.query(
      `INSERT INTO "users" ("username", "email", "role") VALUES ('Saowapan', 'saowapan@example.com', 'user') ON CONFLICT DO NOTHING`,
    );

    // Seed 10 real-world concerts
    await queryRunner.query(`
      INSERT INTO "concerts" ("name", "description", "seats") VALUES
      ('Taylor Swift - The Eras Tour', 'Experience Taylor Swift live as she performs hits spanning her entire career, from her country roots to her latest pop anthems. A once-in-a-lifetime concert event.', 500),
      ('Justin Bieber - Justice World Tour', 'Justin Bieber brings his Justice album to life with electrifying performances, stunning visuals, and all your favorite hits from Baby to Peaches.', 300),
      ('Ed Sheeran - Mathematics Tour', 'Ed Sheeran performs solo with just his guitar and loop pedal, delivering an intimate yet powerful show featuring songs from all his albums.', 400),
      ('Beyonce - Renaissance World Tour', 'Queen Bey takes the stage with her iconic vocals, jaw-dropping choreography, and a setlist celebrating her Renaissance album and greatest hits.', 600),
      ('Coldplay - Music of the Spheres', 'Coldplay delivers a spectacular show with LED wristbands, confetti cannons, and hits like Yellow, Fix You, and My Universe.', 450),
      ('Bruno Mars - 24K Magic World Tour', 'Bruno Mars brings the funk with high-energy performances, smooth dance moves, and timeless hits from Uptown Funk to Just the Way You Are.', 350),
      ('Adele - Weekends with Adele', 'Adele performs her most beloved ballads in an intimate setting, showcasing her powerhouse vocals on songs like Rolling in the Deep and Someone Like You.', 200),
      ('The Weeknd - After Hours Til Dawn', 'The Weeknd delivers a cinematic concert experience with stunning production, featuring hits like Blinding Lights, Save Your Tears, and Starboy.', 500),
      ('Billie Eilish - Happier Than Ever Tour', 'Billie Eilish brings her unique artistry to the stage with haunting vocals, immersive visuals, and fan favorites from her Grammy-winning albums.', 350),
      ('Drake - It''s All a Blur Tour', 'Drake performs his biggest hits spanning over a decade, from Hotline Bling to God''s Plan, in a high-energy show with special guest appearances.', 400)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "concerts" WHERE "name" IN ('Taylor Swift - The Eras Tour', 'Justin Bieber - Justice World Tour', 'Ed Sheeran - Mathematics Tour', 'Beyonce - Renaissance World Tour', 'Coldplay - Music of the Spheres', 'Bruno Mars - 24K Magic World Tour', 'Adele - Weekends with Adele', 'The Weeknd - After Hours Til Dawn', 'Billie Eilish - Happier Than Ever Tour', 'Drake - It''s All a Blur Tour')`,
    );
  }
}
