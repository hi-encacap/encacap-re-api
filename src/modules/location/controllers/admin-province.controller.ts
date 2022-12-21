import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AddWebsiteIdToParam } from 'src/common/decorators/add-website-id-to-param.decorator';
import { User } from 'src/common/decorators/user.decorator';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { IUser } from 'src/modules/user/interfaces/user.interface';
import { ProvinceListQueryDto } from '../dtos/province-list-query.dto';
import { ProvinceWebsiteCreateBodyDto } from '../dtos/province-website-create-body.dto';
import { ProvinceWebsiteDeleteParamDto } from '../dtos/province-website-delete-param.dto';
import { ProvinceWebsiteService } from '../services/province-website.service';
import { ProvinceService } from '../services/province.service';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/locations/provinces')
export class AdminProvinceController {
  constructor(
    private readonly provinceService: ProvinceService,
    private readonly provinceWebsiteService: ProvinceWebsiteService,
  ) {}

  @Get()
  getAll(@Query() query: ProvinceListQueryDto, @User() user: IUser) {
    return this.provinceService.getAll({
      ...query,
      websiteId: user.websiteId,
    });
  }

  @Post()
  create(@Body() body: ProvinceWebsiteCreateBodyDto, @User() user: IUser) {
    return this.provinceService.create(body, user);
  }

  @Delete(':code')
  delete(@AddWebsiteIdToParam() @Param() param: ProvinceWebsiteDeleteParamDto, @User() user: IUser) {
    return this.provinceWebsiteService.delete(param.code, user.websiteId);
  }
}
