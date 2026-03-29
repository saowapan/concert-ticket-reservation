import { IsString, IsNotEmpty, IsInt, Min, MaxLength } from 'class-validator';

export class CreateConcertDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @IsInt()
  @Min(1)
  seats: number;
}
