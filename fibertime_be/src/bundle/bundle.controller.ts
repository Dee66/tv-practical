/**
 * BundleController
 *
 * This controller handles all operations related to bundles, including creating, retrieving, updating,
 * and fetching details of specific bundles.
 */
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { BundleService } from "./bundle.service";
import { CreateBundleDto } from "./dto/create-bundle.dto";
import { UpdateBundleDto } from "./dto/update-bundle.dto";

@ApiTags("bundles")
@Controller("bundles")
export class BundleController {
  constructor(private readonly bundleService: BundleService) {}

  @ApiOperation({ summary: "Retrieve all bundles" })
  @ApiResponse({ status: 200, description: "A list of all bundles." })
  @Get()
  async findAll() {
    const bundles = await this.bundleService.findAll();
    return { bundles };
  }

  @ApiOperation({ summary: "Retrieve a bundle by ID" })
  @ApiParam({ name: "id", description: "The ID of the bundle" })
  @ApiResponse({
    status: 200,
    description: "The details of the specified bundle.",
  })
  @ApiResponse({ status: 404, description: "Bundle not found." })
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.bundleService.findOne(id);
  }

  @ApiOperation({ summary: "Create a new bundle" })
  @ApiBearerAuth()
  @ApiBody({ type: CreateBundleDto })
  @ApiResponse({ status: 201, description: "The created bundle." })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Post()
  async create(@Body() createBundleDto: CreateBundleDto) {
    return this.bundleService.create(createBundleDto);
  }

  @ApiOperation({ summary: "Update an existing bundle by ID" })
  @ApiBearerAuth()
  @ApiParam({ name: "id", description: "The ID of the bundle" })
  @ApiBody({ type: UpdateBundleDto })
  @ApiResponse({ status: 200, description: "The updated bundle." })
  @ApiResponse({ status: 404, description: "Bundle not found." })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateBundleDto: UpdateBundleDto,
  ) {
    return this.bundleService.update(id, updateBundleDto);
  }
}
