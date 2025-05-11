/**
 * UserController
 *
 * This controller handles all operations related to user management, including creating users,
 * updating user details, retrieving user information, and fetching user bundles.
 */
import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserService } from "./user.service";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";

@ApiTags("user")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /user/user-bundle
   * Endpoint to retrieve all bundles associated with the authenticated user.
   */
  @UseGuards(JwtAuthGuard)
  @Get("user-bundle")
  async getUserBundle(@Req() req: any) {
    try {
      const bundle = await this.userService.getUserBundle(String(req.user._id));
      const dataBalance = await this.userService.getUserDataBalance(String(req.user._id));
      return { bundle, dataBalance };
    } catch (error) {
      throw new HttpException(error.message || "Server Error", 500);
    }
  }

  /**
   * GET /user/:id
   *
   * Endpoint to retrieve details of a specific user by their ID.
   *
   * @param id - The ID of the user to retrieve.
   * @returns The details of the specified user.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.userService.findById(id);
  }

  /**
   * PUT /user/:id
   *
   * Endpoint to update an existing user's details by their ID.
   *
   * @param id - The ID of the user to update.
   * @param updateUserDto - The data transfer object containing the updated user details.
   * @returns The updated user.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Put(":id")
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }
}
