import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ESTATE_STATUS_ENUM } from 'encacap/dist/re';
import { BaseListQueryDto } from 'src/base/base.dto';

export class EstateListQueryDto extends BaseListQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(ESTATE_STATUS_ENUM)
  status?: ESTATE_STATUS_ENUM;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  websiteId?: number;

  @IsOptional()
  @IsString()
  provinceCode?: string;

  @IsOptional()
  @IsString()
  districtCode?: string;

  @IsOptional()
  @IsString()
  wardCode?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;
}
