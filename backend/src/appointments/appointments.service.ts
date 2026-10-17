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
}

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateAppointmentDto) {
    const aptDate = dto.appointmentDate ? new Date(dto.appointmentDate) : new Date();

    const appointment = await (this.prisma as any).appointment.create({
      data: {
        userId,
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
    const list = await (this.prisma as any).appointment.findMany({
      where: { userId },
      orderBy: { appointmentDate: 'asc' },
    });

    return {
      success: true,
      data: list,
    };
  }

  async toggleStatus(userId: string, id: string) {
    const apt = await (this.prisma as any).appointment.findFirst({
      where: { id, userId },
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
    const apt = await (this.prisma as any).appointment.findFirst({
      where: { id, userId },
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
