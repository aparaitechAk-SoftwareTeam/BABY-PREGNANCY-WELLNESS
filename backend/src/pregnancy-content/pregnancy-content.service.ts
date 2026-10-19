import { Injectable, OnModuleInit } from '@nestjs/common';
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

function getClinicallyTailoredTasksForWeek(week: number) {
  const tasks: Array<{
    week: number;
    title: string;
    category: string;
    timeStr: string;
    timeOfDay: string;
    emoji: string;
    description: string;
    clinicalRationale: string;
    isCompleted: boolean;
  }> = [];

  if (week <= 12) {
    // Trimester 1 (Weeks 1 - 12)
    tasks.push(
      {
        week,
        title: 'Prenatal Folic Acid & Multivitamins',
        category: 'medication',
        timeStr: '08:30 AM',
        timeOfDay: 'morning',
        emoji: '💊',
        description: 'Take 400-800mcg folic acid with breakfast. Essential for embryonic neural tube closure.',
        clinicalRationale: 'Adequate early folate reduces neural tube defects by up to 70%.',
        isCompleted: false,
      },
      {
        week,
        title: 'Morning Hydration & Nausea Management',
        category: 'hydration',
        timeStr: '11:00 AM',
        timeOfDay: 'morning',
        emoji: '💧',
        description: 'Target 1,000 ml before lunch. Sip small amounts with lemon or ginger if experiencing morning sickness.',
        clinicalRationale: 'Maintains maternal intravascular volume and reduces dizziness and vomiting.',
        isCompleted: false,
      },
      {
        week,
        title: 'Gentle Diaphragmatic Breathing & Rest',
        category: 'exercise',
        timeStr: '03:00 PM',
        timeOfDay: 'afternoon',
        emoji: '🧘‍♀️',
        description: '10 minutes of slow belly breathing and posture realignment. Elevate legs slightly.',
        clinicalRationale: 'Counters maternal fatigue induced by rising progesterone levels.',
        isCompleted: false,
      },
      {
        week,
        title: 'Nutrient-Dense Light Evening Meal',
        category: 'nutrition',
        timeStr: '07:30 PM',
        timeOfDay: 'evening',
        emoji: '🥗',
        description: 'Lean proteins, dark leafy greens, whole grains, and healthy fats. Avoid spicy or greasy triggers.',
        clinicalRationale: 'Stabilizes nocturnal blood sugar and reduces gastroesophageal acid reflux.',
        isCompleted: false,
      },
    );

    if (week === 8) {
      tasks.push({
        week,
        title: 'First Prenatal Dating Ultrasound',
        category: 'clinical',
        timeStr: '10:00 AM',
        timeOfDay: 'morning',
        emoji: '🩺',
        description: 'Confirm intrauterine pregnancy, verify gestational age, and observe embryonic heartbeat.',
        clinicalRationale: 'Establishes accurate expected date of delivery (EDD) and baseline vitals.',
        isCompleted: false,
      });
    }

    if (week === 12) {
      tasks.push({
        week,
        title: 'First Trimester Screening & NT Scan',
        category: 'clinical',
        timeStr: '09:30 AM',
        timeOfDay: 'morning',
        emoji: '🔬',
        description: 'Nuchal Translucency (NT) ultrasound and maternal serum dual marker screen.',
        clinicalRationale: 'Evaluates chromosomal risk profiles and confirms anatomical development.',
        isCompleted: false,
      });
    }
  } else if (week <= 27) {
    // Trimester 2 (Weeks 13 - 27)
    tasks.push(
      {
        week,
        title: 'Prenatal Multivitamin + Iron Supplement',
        category: 'medication',
        timeStr: '08:30 AM',
        timeOfDay: 'morning',
        emoji: '💊',
        description: 'Take with citrus or vitamin C to maximize bioavailability. Avoid dairy within 1 hour.',
        clinicalRationale: 'Supports massive 45% maternal blood volume expansion and prevents anemia.',
        isCompleted: false,
      },
      {
        week,
        title: 'Midday Hydration Target (2,000 - 2,500 ml)',
        category: 'hydration',
        timeStr: '01:00 PM',
        timeOfDay: 'afternoon',
        emoji: '💧',
        description: 'Keep a water bottle close. Hydration is vital for healthy amniotic fluid production.',
        clinicalRationale: 'Maintains Amniotic Fluid Index (AFI) and prevents Braxton Hicks contractions.',
        isCompleted: false,
      },
      {
        week,
        title: '15-Min Safe Pelvic Floor & Lumbar Stretches',
        category: 'exercise',
        timeStr: '04:30 PM',
        timeOfDay: 'afternoon',
        emoji: '🧘‍♀️',
        description: 'Gentle cat-cow, pelvic tilts, and butterfly stretches to relieve lower back pressure.',
        clinicalRationale: 'Alleviates lumbar compression and improves pelvic joint flexibility.',
        isCompleted: false,
      },
      {
        week,
        title: 'Calcium & Vitamin D3 Supplement',
        category: 'medication',
        timeStr: '08:30 PM',
        timeOfDay: 'night',
        emoji: '🥛',
        description: 'Take after dinner, separated by at least 2 hours from your morning iron dose.',
        clinicalRationale: 'Prevents absorption competition with iron while supporting fetal skeletal mineralization.',
        isCompleted: false,
      },
    );

    if (week === 20) {
      tasks.push({
        week,
        title: 'Level-II Detailed Fetal Anatomy Ultrasound',
        category: 'clinical',
        timeStr: '10:00 AM',
        timeOfDay: 'morning',
        emoji: '🔬',
        description: 'Comprehensive 20-week anomaly scan examining baby brain, heart, kidneys, spine, and placenta position.',
        clinicalRationale: 'The cornerstone scan of mid-pregnancy to evaluate complete structural organogenesis.',
        isCompleted: false,
      });
    }

    if (week === 24 || week === 26) {
      tasks.push({
        week,
        title: 'Gestational Diabetes Screening (OGTT)',
        category: 'clinical',
        timeStr: '08:30 AM',
        timeOfDay: 'morning',
        emoji: '🩸',
        description: 'Oral Glucose Tolerance Test following overnight fasting as prescribed by your doctor.',
        clinicalRationale: 'Screens for gestational hyperglycemia to ensure normal fetal macrosomia prevention.',
        isCompleted: false,
      });
    }
  } else {
    // Trimester 3 (Weeks 28 - 40)
    tasks.push(
      {
        week,
        title: 'Morning Prenatal Vitamin + Iron Dosage',
        category: 'medication',
        timeStr: '08:30 AM',
        timeOfDay: 'morning',
        emoji: '💊',
        description: 'Supports high third-trimester fetal iron accumulation and maternal hemoglobin.',
        clinicalRationale: 'Fetal demand for iron peaks in the third trimester for neonatal reserves.',
        isCompleted: false,
      },
      {
        week,
        title: 'Hydration Target & Electrolyte Balance (2,500 ml)',
        category: 'hydration',
        timeStr: '12:00 PM',
        timeOfDay: 'afternoon',
        emoji: '💧',
        description: 'Sip steadily throughout the day. Taper fluid intake 1 hour before sleep to avoid nighttime disruption.',
        clinicalRationale: 'Facilitates constant amniotic fluid renewal and minimizes lower limb edema.',
        isCompleted: false,
      },
      {
        week,
        title: 'Pelvic Flex & Safe Birth Ball Rocking',
        category: 'exercise',
        timeStr: '04:00 PM',
        timeOfDay: 'afternoon',
        emoji: '🧘‍♀️',
        description: 'Pelvic circles on yoga ball and gentle pelvic floor relaxation stretches.',
        clinicalRationale: 'Optimizes fetal descent and relieves sacrococcygeal pressure.',
        isCompleted: false,
      },
      {
        week,
        title: 'Evening Cardiff Kick Counting Session',
        category: 'kicks',
        timeStr: '07:30 PM',
        timeOfDay: 'evening',
        emoji: '👣',
        description: 'Rest on your left side post-dinner and count 10 distinct fetal movements.',
        clinicalRationale: 'Cardiff protocol: 10 movements within 2 hours indicates healthy placental oxygenation.',
        isCompleted: false,
      },
      {
        week,
        title: 'Calcium Supplement & Left-Side SOS Sleep Position',
        category: 'sleep',
        timeStr: '10:00 PM',
        timeOfDay: 'night',
        emoji: '🛏️',
        description: 'Place pregnancy pillow between knees. Sleep tilted on left side to optimize IVC return.',
        clinicalRationale: 'Relieves pressure on the inferior vena cava and optimizes placental perfusion.',
        isCompleted: false,
      },
    );

    if (week === 28) {
      tasks.push({
        week,
        title: 'Trimester 3 Kick Counting Baseline & Blood Check',
        category: 'clinical',
        timeStr: '09:00 AM',
        timeOfDay: 'morning',
        emoji: '🩸',
        description: 'Repeat CBC, antibody screen (Anti-D injection if Rh-negative), and establish daily kick counting.',
        clinicalRationale: 'Prevents Rh isoimmunization and tracks late-pregnancy hemoglobin levels.',
        isCompleted: false,
      });
    }

    if (week === 35 || week === 36) {
      tasks.push({
        week,
        title: 'Pack Hospital Go-Bag for Mom, Baby & Partner',
        category: 'planning',
        timeStr: '02:00 PM',
        timeOfDay: 'afternoon',
        emoji: '🎒',
        description: 'Pack maternity records, nursing bras, baby clothes, swaddles, toiletries, and phone chargers.',
        clinicalRationale: 'Ensures stress-free emergency readiness as labor can initiate anytime after 36 weeks.',
        isCompleted: false,
      });
    }

    if (week === 36) {
      tasks.push({
        week,
        title: 'Group B Streptococcus (GBS) Screening Swab',
        category: 'clinical',
        timeStr: '10:30 AM',
        timeOfDay: 'morning',
        emoji: '🩺',
        description: 'Routine 36-week vagino-rectal culture swab performed by your obstetrician.',
        clinicalRationale: 'Identifies GBS colonization to determine intrapartum antibiotic prophylaxis.',
        isCompleted: false,
      });
    }

    if (week >= 37) {
      tasks.push({
        week,
        title: 'Weekly Obstetric Checkup & Fetal Presentation',
        category: 'clinical',
        timeStr: '10:00 AM',
        timeOfDay: 'morning',
        emoji: '👩‍⚕️',
        description: 'Check blood pressure, urine albumin, fundal height, cervical status, and fetal cephalic presentation.',
        clinicalRationale: 'Monitors preeclampsia risk and confirms baby is head-down for delivery.',
        isCompleted: false,
      });
    }
  }

  return tasks;
}

@Injectable()
export class PregnancyContentService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedAllWeeksIfEmpty();
    await this.seedAllWeeklyTasksIfEmpty();
  }

  private async seedAllWeeklyTasksIfEmpty() {
    try {
      for (let w = 1; w <= 40; w++) {
        const weekCount = await (this.prisma as any).weeklyTask.count({
          where: { week: w, userId: null },
        });
        if (weekCount === 0) {
          const tasks = getClinicallyTailoredTasksForWeek(w);
          for (const t of tasks) {
            await (this.prisma as any).weeklyTask.create({ data: t });
          }
        }
      }
    } catch (e) {
      // quiet fallback
    }
  }

  private async seedAllWeeksIfEmpty() {
    try {
      const count = await (this.prisma as any).pregnancyContent.count();
      if (count === 0) {
        const items = [];
        for (let w = 1; w <= 40; w++) {
          const metric = getMetricsForWeek(w);
          items.push({
            week: w,
            title: `Week ${w} Fetal Development & Maternal Care`,
            summary: `Baby is approximately the size of a ${metric.name}. ${metric.highlight}`,
            body: `During Week ${w} of pregnancy, your baby continues active organogenesis and neural growth. Clinical advice: ${metric.tip} Maintain maternal hydration and consistent prenatal checkups.`,
            babySize: metric.name,
            babyLength: metric.length,
            babyWeight: metric.weight,
            fetalHighlight: metric.highlight,
            maternalTip: metric.tip,
            status: 'published',
            author: 'AparaiTech Clinical Board',
          });
        }
        await (this.prisma as any).pregnancyContent.createMany({ data: items });
      }
    } catch (e) {
      // quiet fallback
    }
  }

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

    // If no tasks exist for this week, seed clinically tailored routine items into DB
    if (!records || records.length === 0) {
      const defaultTasks = getClinicallyTailoredTasksForWeek(safeWeek);
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

  // 7. ADMIN DELETE WEEKLY TASK
  async deleteWeeklyTask(taskId: string) {
    await (this.prisma as any).weeklyTask.delete({
      where: { id: taskId },
    });
    return { success: true, message: 'Weekly task deleted successfully' };
  }
}

