import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                emailVerified: true,
                kycStatus: true,
                createdAt: true,
                studentProfile: true,
                employerProfile: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!user.kycStatus) {
            const latestKyc = await this.prisma.kYCDocument.findFirst({
                where: { userId: id },
                orderBy: { createdAt: 'desc' },
                select: { status: true },
            });

            if (latestKyc?.status) {
                return { ...user, kycStatus: latestKyc.status };
            }
        }

        return user;
    }

    async updateStudentProfile(userId: string, data: any) {
        return this.prisma.studentProfile.update({
            where: { userId },
            data,
        });
    }

    async updateEmployerProfile(userId: string, data: any) {
        return this.prisma.employerProfile.update({
            where: { userId },
            data,
        });
    }
}
