import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsIn(['admin', 'user'])
  role?: string;
}
