import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Req,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto, LoginDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private jwtService: JwtService,
    ) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto.email, dto.password, dto.role);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user' })
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto.email, dto.password);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token using refresh token' })
    async refresh(@Body() body: { refreshToken: string }) {
        if (!body.refreshToken) {
            throw new BadRequestException('Refresh token is required');
        }
        
        try {
            const payload = this.jwtService.decode(body.refreshToken) as { sub: string };
            if (!payload || !payload.sub) {
                throw new UnauthorizedException('Invalid refresh token');
            }
            return this.authService.refreshTokens(payload.sub, body.refreshToken);
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout user' })
    async logout(@Req() req: any) {
        await this.authService.logout(req.user.sub);
        return { message: 'Logged out successfully' };
    }
}
