import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

// Standard 40-Week Baby Size Comparisons Reference
const DEFAULT_BABY_METRICS: Record<number, { name: string; emoji: string; length: string; weight: string; highlight: string; tip: string }> = {
  4: { name: 'Poppy Seed', emoji: '🌱', length: '1 mm', weight: '< 1 g', highlight: 'Blastocyst implants securely in the uterine wall.', tip: 'Start 400mcg folic acid daily to support neural tube development.' },
  8: { name: 'Raspberry', emoji: '🍓', length: '1.6 cm', weight: '1 g', highlight: 'Webbed fingers and facial features start forming.', tip: 'Eat frequent small meals to ease morning nausea.' },
  12: { name: 'Lime', emoji: '🍋', length: '5.4 cm', weight: '14 g', highlight: 'Reflexes develop, kidneys start producing urine.', tip: 'First trimester screening & ultrasound window.' },
  16: { name: 'Avocado', emoji: '🥑', length: '11.6 cm', weight: '100 g', highlight: 'Baby eyes can perceive light; heart pumps 25 quarts a day.', tip: 'Second trimester energy boost begins. Stay hydrated!' },
  20: { name: 'Banana', emoji: '🍌', length: '25.6 cm', weight: '300 g', highlight: 'Halfway milestone! Baby can swallow amniotic fluid and hear mom’s voice.', tip: 'Schedule Level-II anatomy scan. Sleep on your left side with pillow support.' },
  24: { name: 'Ear of Corn', emoji: '🌽', length: '30 cm', weight: '600 g', highlight: 'Lungs begin producing surfactant for air breathing.', tip: 'Screen for gestational diabetes (GTT) between weeks 24-28.' },
  28: { name: 'Eggplant', emoji: '🍆', length: '37 cm', weight: '1 kg', highlight: 'Third trimester begins! Baby blinks and opens eyes.', tip: 'Count 10 kicks every evening using the Cardiff movement protocol.' },
  32: { name: 'Pineapple', emoji: '🍍', length: '42 cm', weight: '1.7 kg', highlight: 'Bones fully formed, rapid maternal calcium transfer.', tip: 'Pack hospital bag and prepare birth readiness items.' },
  36: { name: 'Papaya', emoji: '🍈', length: '47 cm', weight: '2.6 kg', highlight: 'Baby sheds lanugo coating, lungs near full maturity.', tip: 'Weekly obstetric checks start. Confirm birth plan with your doctor.' },
  40: { name: 'Watermelon', emoji: '🍉', length: '51 cm', weight: '3.4 kg', highlight: 'Full term! Baby ready to arrive any day.', tip: 'Watch for regular contractions, water release, or bloody show.' },
};

function getMetricsForWeek(week: number) {
  const milestones = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40];
  let closest = milestones[0];
  for (const m of milestones) {
    if (week >= m) closest = m;
  }
  return DEFAULT_BABY_METRICS[closest] || DEFAULT_BABY_METRICS[20];
}

@Injectable()
export class PregnancyContentService {
  constructor(private prisma: PrismaService) {}

  // 1. GET WEEKLY CONTENT (Live from DB or seeded on demand)
  async getContentByWeek(week: number) {
    const safeWeek = Math.max(1, Math.min(40, Number(week) || 20));

    let record = await (this.prisma as any).pregnancyContent.findFirst({
      where: { week: safeWeek, status: 'published' },
      orderBy: { updatedAt: 'desc' },
    });

    if (!record) {
      const metric = getMetricsForWeek(safeWeek);
      record = await (this.prisma as any).pregnancyContent.create({
        data: {
          week: safeWeek,
          title: `Week ${safeWeek} Fetal Development & Maternal Care`,
          summary: `Baby is the size of a ${metric.name}. ${metric.highlight}`,
          babySize: metric.name,
          babyLength: metric.length,
          babyWeight: metric.weight,
          fetalHighlight: metric.highlight,
          maternalTip: metric.tip,
          status: 'published',
          author: 'AparaiTech Clinical Board',
        },
      });
    }

    return {
      success: true,
      data: record,
    };
  }

  // 2. ADMIN: LIST ALL CONTENT
  async listAllContent(query?: { search?: string; status?: string; page?: number; pageSize?: number }) {
    const where: any = {};
    if (query?.status && query.status !== 'all') {
      where.status = query.status;
    }
    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const records = await (this.prisma as any).pregnancyContent.findMany({
      where,
      orderBy: { week: 'asc' },
    });

    return {
      success: true,
      data: records,
      total: records.length,
    };
  }

  // 3. ADMIN: UPSERT CONTENT
  async upsertContent(dto: {
    id?: string;
    week: number;
    title: string;
    summary: string;
    body?: string;
    babySize?: string;
    babyLength?: string;
    babyWeight?: string;
    fetalHighlight?: string;
    maternalTip?: string;
    status?: string;
  }) {
    if (dto.id) {
      const updated = await (this.prisma as any).pregnancyContent.update({
        where: { id: dto.id },
        data: {
          ...dto,
          week: Number(dto.week),
          updatedAt: new Date(),
        },
      });
      return { success: true, data: updated };
    }

    const created = await (this.prisma as any).pregnancyContent.create({
      data: {
        week: Number(dto.week),
        title: dto.title,
        summary: dto.summary,
        body: dto.body || '',
        babySize: dto.babySize || 'Custom Size',
        babyLength: dto.babyLength || '',
        babyWeight: dto.babyWeight || '',
        fetalHighlight: dto.fetalHighlight || '',
        maternalTip: dto.maternalTip || '',
        status: dto.status || 'published',
      },
    });

    return { success: true, data: created };
  }

  // 4. GET WEEKLY TASKS (Database Driven)
  async getTasksByWeek(week: number, userId?: string) {
    const safeWeek = Math.max(1, Math.min(40, Number(week) || 20));

    // Get tasks specific to this user OR global system tasks
    let records = await (this.prisma as any).weeklyTask.findMany({
      where: {
        week: safeWeek,
        OR: [{ userId: null }, ...(userId ? [{ userId }] : [])],
      },
      orderBy: { createdAt: 'asc' },
    });

    // If no tasks exist for this week, seed default routine items into DB
    if (!records || records.length === 0) {
      const defaultTasks = [
        {
          week: safeWeek,
          title: 'Prenatal Vitamins & Folic Acid',
          category: 'medication',
          timeStr: '08:30 AM',
          timeOfDay: 'morning',
          emoji: '💊',
          description: 'Essential micronutrients & neural tube support. Take with breakfast.',
          clinicalRationale: 'Maximizes iron and folate absorption.',
          isCompleted: false,
        },
        {
          week: safeWeek,
          title: 'Hydration Target (2,000 - 2,500 ml)',
          category: 'hydration',
          timeStr: 'Throughout Day',
          timeOfDay: 'morning',
          emoji: '💧',
          description: 'Maintains amniotic fluid index (AFI) and maternal plasma volume.',
          clinicalRationale: 'Prevents maternal UTIs and Braxton-Hicks cramping.',
          isCompleted: false,
        },
        {
          week: safeWeek,
          title: '15-Min Safe Pelvic Floor & Posture Stretch',
          category: 'exercise',
          timeStr: '02:30 PM',
          timeOfDay: 'afternoon',
          emoji: '🧘‍♀️',
          description: 'Gentle cat-cow, pelvic tilt & deep diaphragm relaxation.',
          clinicalRationale: 'Relieves lumbar compression and prepares pelvic flexibility.',
          isCompleted: false,
        },
        {
          week: safeWeek,
          title: 'Cardiff Kick Counting Session',
          category: 'kicks',
          timeStr: '07:30 PM',
          timeOfDay: 'evening',
          emoji: '👣',
          description: 'Rest on left side post-dinner and count 10 distinct baby movements.',
          clinicalRationale: 'Peak fetal motility confirms placental oxygenation.',
          isCompleted: false,
        },
      ];

      for (const t of defaultTasks) {
        await (this.prisma as any).weeklyTask.create({ data: t });
      }

      records = await (this.prisma as any).weeklyTask.findMany({
        where: { week: safeWeek },
        orderBy: { createdAt: 'asc' },
      });
    }

    return {
      success: true,
      data: records,
    };
  }

  // 5. TOGGLE TASK COMPLETION
  async toggleTask(taskId: string, isCompleted: boolean) {
    const updated = await (this.prisma as any).weeklyTask.update({
      where: { id: taskId },
      data: { isCompleted },
    });
    return { success: true, data: updated };
  }

  // 6. ADMIN CREATE WEEKLY TASK
  async createWeeklyTask(dto: {
    week: number;
    title: string;
    category: string;
    timeStr?: string;
    timeOfDay?: string;
    emoji?: string;
    description?: string;
    clinicalRationale?: string;
    userId?: string;
  }) {
    const created = await (this.prisma as any).weeklyTask.create({
      data: {
        week: Number(dto.week),
        title: dto.title,
        category: dto.category || 'planning',
        timeStr: dto.timeStr || '',
        timeOfDay: dto.timeOfDay || 'morning',
        emoji: dto.emoji || '📋',
        description: dto.description || '',
        clinicalRationale: dto.clinicalRationale || '',
        isCompleted: false,
        userId: dto.userId || null,
      },
    });

    return { success: true, data: created };
  }
}
