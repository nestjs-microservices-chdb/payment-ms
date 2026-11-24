import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class HealtCheckController {

  @Get()
  healthCheck() {
    return 'Payments microservice is up and running!!!'
  }
}
