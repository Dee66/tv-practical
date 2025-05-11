/**
 * BundleController
 *
 * This controller handles all operations related to bundles, including creating, retrieving, updating,
 * and fetching details of specific bundles.
 */
import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BundleService } from "./bundle.service";
import { CreateBundleDto } from "./dto/create-bundle.dto";
import { UpdateBundleDto } from "./dto/update-bundle.dto";

@ApiTags("bundles")
@Controller("bundles")
export class BundleController {
  constructor(private readonly bundleService: BundleService) {}

  /**
   * GET /bundles
   *
   * Endpoint to retrieve all bundles.
   *
   * @returns A list of all bundles.
   */
  @Get()
  async findAll() {
    const bundles = await this.bundleService.findAll();
    return { bundles };
  }

  /**
   * GET /bundles/:id
   *
   * Endpoint to retrieve details of a specific bundle by its ID.
   *
   * @param id - The ID of the bundle to retrieve.
   * @returns The details of the specified bundle.
   */
  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.bundleService.findOne(id);
  }

  /**
   * POST /bundles
   *
   * Endpoint to create a new bundle.
   *
   * @param createBundleDto - The data transfer object containing the details of the bundle to create.
   * @returns The created bundle.
   */
  @Post()
  async create(@Body() createBundleDto: CreateBundleDto) {
    return this.bundleService.create(createBundleDto);
  }

  /**
   * PATCH /bundles/:id
   *
   * Endpoint to update an existing bundle by its ID.
   *
   * @param id - The ID of the bundle to update.
   * @param updateBundleDto - The data transfer object containing the updated details of the bundle.
   * @returns The updated bundle.
   */
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateBundleDto: UpdateBundleDto,
  ) {
    return this.bundleService.update(id, updateBundleDto);
  }
}
