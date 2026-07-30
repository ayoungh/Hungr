import { Controller, Get } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MongooseHealthIndicator,
} from "@nestjs/terminus";

@ApiTags("Status")
@Controller("healthz")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ operationId: "getHealth", summary: "Check API health" })
  @ApiOkResponse({ description: "API and MongoDB are healthy." })
  @ApiServiceUnavailableResponse({ description: "MongoDB is unavailable." })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.mongoose.pingCheck("mongodb", { timeout: 1_500 }),
    ]);
  }
}
