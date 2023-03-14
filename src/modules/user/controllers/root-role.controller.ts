import { Body, Controller, Post } from '@nestjs/common';
import { IRole } from 'encacap/dist/re';
import { RoleService } from '../services/role.service';

@Controller('root/roles')
export class RootRoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  create(@Body() body: IRole) {
    return this.roleService.create(body);
  }
}
