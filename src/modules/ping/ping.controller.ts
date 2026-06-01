import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('ping')
export class PingController {
  @Get()
  @ApiOperation({
    summary: 'Ping',
    description: 'Endpoint simples para verificar se a API está respondendo.',
  })
  @ApiResponse({
    status: 200,
    description: 'API respondendo',
    schema: { example: 'pong!' },
  })
  ping(): string {
    return 'pong!';
  }
}
