import { Body, Controller, Post } from '@nestjs/common';
import { IRole } from '../interfaces/user.interface';
import { RoleService } from '../services/role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() body: IRole) {
    return this.roleService.create(body);
  }
}
