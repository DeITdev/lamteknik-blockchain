import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { User, RoleUser } from '../entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'role', required: false, enum: RoleUser })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'tenantId', required: false, type: Number })
  @ApiQuery({ name: 'institusiId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List users', type: [User] })
  async findAll(
    @Query('role') role?: RoleUser,
    @Query('isActive') isActive?: boolean,
    @Query('tenantId') tenantId?: number,
    @Query('institusiId') institusiId?: number,
  ): Promise<User[]> {
    return this.service.findAll({ role, isActive, tenantId, institusiId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found', type: User })
  async findOne(@Param('id') id: number): Promise<User> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created', type: User })
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated', type: User })
  async update(@Param('id') id: number, @Body() dto: UpdateUserDto): Promise<User> {
    return this.service.update(id, dto);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiResponse({ status: 200, description: 'User deactivated', type: User })
  async deactivate(@Param('id') id: number): Promise<User> {
    return this.service.deactivate(id);
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate user' })
  @ApiResponse({ status: 200, description: 'User activated', type: User })
  async activate(@Param('id') id: number): Promise<User> {
    return this.service.activate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.service.remove(id);
  }
}
