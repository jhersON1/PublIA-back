import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TiktokService } from './tiktok.service';
import { CreateTiktokDto } from './dto/create-tiktok.dto';
import { UpdateTiktokDto } from './dto/update-tiktok.dto';

@Controller('tiktok')
export class TiktokController {
  constructor(private readonly tiktokService: TiktokService) {}

}
