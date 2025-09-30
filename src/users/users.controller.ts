import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, ChangeUserRoleDto, ChangeUserStatusDto, UpdateProfileDto } from '../models/user.dto';
import { AuthGuard } from '../guards/auth.guard';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Put(':id/role')
  async changeUserRole(@Param('id') id: string, @Body() changeRoleDto: ChangeUserRoleDto) {
    return this.usersService.changeUserRole(id, changeRoleDto);
  }

  @Put(':id/status')
  async changeUserStatus(@Param('id') id: string, @Body() changeStatusDto: ChangeUserStatusDto) {
    return this.usersService.changeUserStatus(id, changeStatusDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @Get('profile/me')
  async getMyProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Put('profile/me')
  async updateMyProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }
}
