import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface CreateAppointmentDto {
  title: string;
  doctorName?: string;
  hospitalName?: string;
  doctorPhone?: string;
  appointmentDate?: string;
  timeStr?: string;
  notes?: string;
  status?: string;
  userId?: string;
  email?: string;
}

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveUserId(userId?: string): Promise<string | null> {
    if (!userId) return null;
    const user = await (this.prisma as any).user.findFirst({
      where: {
        OR: [{ id: userId }, { email: userId }],
      },
    });
    return user ? user.id : userId;
  }

  async create(userId: string, dto: CreateAppointmentDto) {
    const effectiveUserId = (await this.resolveUserId(userId || dto.userId || dto.email)) || userId;
    const aptDate = dto.appointmentDate ? new Date(dto.appointmentDate) : new Date();

    const appointment = await (this.prisma as any).appointment.create({
      data: {
        userId: effectiveUserId,
        title: dto.title || 'Doctor Consultation',
        doctorName: dto.doctorName,
        hospitalName: dto.hospitalName,
        doctorPhone: dto.doctorPhone,
        appointmentDate: isNaN(aptDate.getTime()) ? new Date() : aptDate,
        timeStr: dto.timeStr || '10:00 AM',
        notes: dto.notes,
        status: dto.status || 'UPCOMING',
      },
    });

    return {
      success: true,
      message: 'Appointment scheduled successfully',
      data: appointment,
    };
  }

  async findAll(userId: string) {
    const effectiveUserId = await this.resolveUserId(userId);
    if (!effectiveUserId) {
      return {
        success: true,
        data: [],
      };
    }

    const list = await (this.prisma as any).appointment.findMany({
      where: { userId: effectiveUserId },
      orderBy: { appointmentDate: 'asc' },
    });

    return {
      success: true,
      data: list,
    };
  }

  async toggleStatus(userId: string, id: string) {
    const effectiveUserId = (await this.resolveUserId(userId)) || userId;
    const apt = await (this.prisma as any).appointment.findFirst({
      where: { id, userId: effectiveUserId },
    });

    if (!apt) {
      throw new NotFoundException('Appointment not found');
    }

    const nextStatus = apt.status === 'COMPLETED' ? 'UPCOMING' : 'COMPLETED';
    const updated = await (this.prisma as any).appointment.update({
      where: { id },
      data: { status: nextStatus },
    });

    return {
      success: true,
      data: updated,
    };
  }

  async delete(userId: string, id: string) {
    const effectiveUserId = (await this.resolveUserId(userId)) || userId;
    const apt = await (this.prisma as any).appointment.findFirst({
      where: { id, userId: effectiveUserId },
    });

    if (!apt) {
      throw new NotFoundException('Appointment not found');
    }

    await (this.prisma as any).appointment.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Appointment deleted successfully',
    };
  }
}
