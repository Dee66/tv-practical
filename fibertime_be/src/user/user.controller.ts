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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
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
  @ApiOperation({ summary: "Retrieve all bundles for the authenticated user" })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "User's active bundle(s) and data balance",
    schema: {
      example: {
        bundle: {
          _id: "68211abf779fd8de44cf05a2",
          name: "Starter Bundle",
          description: "Basic internet package for new users",
          duration_days: 30,
          price: 29.99,
          subscriptionData: 5000,
        },
        dataBalance: 5000,
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Get("user-bundle")
  async getUserBundle(@Req() req: any) {
    const bundle = await this.userService.getUserBundle(String(req.user._id));
    const dataBalance = await this.userService.getUserDataBalance(String(req.user._id));
    return { bundle, dataBalance };
  }

  /**
   * GET /user/:id
   *
   * Endpoint to retrieve details of a specific user by their ID.
   *
   * @param id - The ID of the user to retrieve.
   * @returns The details of the specified user.
   */
  @ApiOperation({ summary: "Retrieve details of a user by ID (admin only)" })
  @ApiBearerAuth()
  @ApiParam({ name: "id", description: "The ID of the user" })
  @ApiResponse({
    status: 200,
    description: "User details",
    schema: {
      example: {
        _id: "userObjectId",
        cell_number: "+27123456789",
        devices: ["deviceObjectId"],
        bundles: ["bundleObjectId"],
        createdAt: "2024-05-12T12:00:00.000Z",
        updatedAt: "2024-05-12T12:00:00.000Z",
      },
    },
  })
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
  @ApiOperation({ summary: "Update a user's details by ID (admin only)" })
  @ApiBearerAuth()
  @ApiParam({ name: "id", description: "The ID of the user" })
  @ApiBody({
    schema: {
      example: {
        cell_number: "+27123456789",
        bundles: ["bundleObjectId"],
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Updated user details",
    schema: {
      example: {
        _id: "userObjectId",
        cell_number: "+27123456789",
        devices: ["deviceObjectId"],
        bundles: ["bundleObjectId"],
        createdAt: "2024-05-12T12:00:00.000Z",
        updatedAt: "2024-05-12T12:10:00.000Z",
      },
    },
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Put(":id")
  async update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }
}
