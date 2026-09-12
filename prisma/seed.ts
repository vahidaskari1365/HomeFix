import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding HomeFix...");

  // wipe (order matters)
  await db.review.deleteMany();
  await db.orderEvent.deleteMany();
  await db.orderOffer.deleteMany();
  await db.order.deleteMany();
  await db.specialistSkill.deleteMany();
  await db.specialist.deleteMany();
  await db.service.deleteMany();
  await db.serviceCategory.deleteMany();

  // ---------- categories & services ----------
  const catData = [
    {
      slug: "ac",
      name: "کولر و تهویه",
      tagline: "سرویس، شارژ گاز، نصب و تعمیر کولر گازی و آبی",
      icon: "AirVent",
      color: "#059669",
      services: [
        { name: "سرویس و شارژ کولر گازی", desc: "شست‌وشوی کامل، شارژ گاز، تست عملکرد", price: 690000, dur: 90 },
        { name: "تعمیر کولر گازی", desc: "عیب‌یابی و رفع خرابی کمپرسور، برد و نشتی", price: 950000, dur: 120 },
        { name: "نصب و جابه‌جایی کولر گازی", desc: "نصب تخصصی پارته داخلی و خارجی", price: 2500000, dur: 180 },
        { name: "سرویس کولر آبی", desc: "شست‌وشو، تعویض پوشال، چک پمپ آب", price: 480000, dur: 60 },
      ],
    },
    {
      slug: "plumbing",
      name: "لوله‌کشی",
      tagline: "نشتی، گرفتگی، شیرآلات و تأسیسات",
      icon: "Droplets",
      color: "#0d9488",
      services: [
        { name: "رفع نشتی آب", desc: "یافتن و رفع نشتی لوله‌ها و اتصالات", price: 550000, dur: 90 },
        { name: "لوله‌بازکنی", desc: "باز کردن گرفتگی سینک، کف‌شور و فاضلاب", price: 720000, dur: 60 },
        { name: "نصب و تعویض شیرآلات", desc: "شیر روشو، شیر مخزن، شیرآلات بهداشتی", price: 420000, dur: 60 },
        { name: "تعویض سیفون و سифون‌بندی", desc: "سیفون سینک، روشویی و حمام", price: 450000, dur: 60 },
      ],
    },
    {
      slug: "electrical",
      name: "برق و روشنایی",
      tagline: "سیم‌کشی، پریز، کلید و روشنایی",
      icon: "Zap",
      color: "#d97706",
      services: [
        { name: "عیب‌یابی برق ساختمان", desc: "پیدا کردن قطعی، اتصالی و ریست کنتاکتور", price: 620000, dur: 90 },
        { name: "نصب پریز و کلید", desc: "نصب و تعویض انواع پریز و کلید", price: 350000, dur: 45 },
        { name: "نصب لوستر و چراغ", desc: "نصب لوستر، کریستال و نورپردازی مخفی", price: 480000, dur: 60 },
        { name: "نصب و راه‌اندازی دزدگیر", desc: "دزدگیر اماکن و سنسورها", price: 1600000, dur: 180 },
      ],
    },
    {
      slug: "boiler",
      name: "پکیج و آبگرمکن",
      tagline: "سرویس سالانه و تعمیر پکیج دیواری",
      icon: "Flame",
      color: "#ea580c",
      services: [
        { name: "سرویس سالانه پکیج", desc: "شست‌وشوی مبدل، چک گاز و فشار آب", price: 850000, dur: 90 },
        { name: "تعمیر پکیج", desc: "رفع خطا، تعویض قطعات، سرویس شعله", price: 1150000, dur: 120 },
        { name: "نصب آبگرمکن", desc: "نصب آبگرمکن دیواری و زمینی", price: 1350000, dur: 120 },
      ],
    },
    {
      slug: "appliances",
      name: "تعمیر لوازم خانگی",
      tagline: "لباسشویی، ظرفشویی، یخچال و فریزر",
      icon: "WashingMachine",
      color: "#7c3aed",
      services: [
        { name: "تعمیر ماشین لباسشویی", desc: "عیب‌یابی برد، موتور، پمپ و لرزش", price: 1050000, dur: 120 },
        { name: "تعمیر ظرفشویی", desc: "رفع نشتی، گرفتگی و خطاهای برد", price: 1100000, dur: 120 },
        { name: "تعمیر یخچال و فریزر", desc: "شارژ گاز، ترموستات، کمپرسور", price: 1250000, dur: 120 },
      ],
    },
    {
      slug: "cleaning",
      name: "نظافت و شویی",
      tagline: "نظافت منزل، مبل‌شویی و قالیشویی",
      icon: "Sparkles",
      color: "#16a34a",
      services: [
        { name: "نظافت منزل", desc: "نظافت کامل با تیم مجرب و مواد استاندارد", price: 780000, dur: 240 },
        { name: "مبل‌شویی در محل", desc: "شست‌وشوی مبل، صندلی و تشک با دستگاه", price: 950000, dur: 150 },
        { name: "قالیشویی در محل", desc: "شست‌وشو و خشک‌کردن فرش در محل", price: 1200000, dur: 180 },
      ],
    },
    {
      slug: "moving",
      name: "اسباب‌کشی",
      tagline: "باربری، بسته‌بندی و جابه‌جایی اسباب",
      icon: "Truck",
      color: "#c2410c",
      services: [
        { name: "باربری و اسباب‌کشی", desc: "با نیسان مسقف و کارگر مجرب", price: 1900000, dur: 300 },
        { name: "بسته‌بندی حرفه‌ای", desc: "بسته‌بندی لوازم شکستنی با کارتن و حباب‌دار", price: 950000, dur: 180 },
      ],
    },
    {
      slug: "painting",
      name: "نقاشی و ساختمان",
      tagline: "نقاشی، گچ‌کاری و کابینت",
      icon: "PaintRoller",
      color: "#a16207",
      services: [
        { name: "نقاشی ساختمان", desc: "رول پلاستیک، بلکا و مولتی‌کالر", price: 1600000, dur: 480 },
        { name: "گچ‌کاری و سفیدکاری", desc: "سفیدکاری دیوار و سقف", price: 1800000, dur: 480 },
      ],
    },
  ];

  const servicesBySlug: Record<string, { id: string; name: string }[]> = {};

  for (let i = 0; i < catData.length; i++) {
    const c = catData[i];
    const category = await db.serviceCategory.create({
      data: {
        slug: c.slug,
        name: c.name,
        tagline: c.tagline,
        icon: c.icon,
        color: c.color,
        sortOrder: i,
        services: {
          create: c.services.map((s) => ({
            name: s.name,
            description: s.desc,
            basePrice: s.price,
            durationMin: s.dur,
          })),
        },
      },
      include: { services: true },
    });
    servicesBySlug[c.slug] = category.services.map((s) => ({ id: s.id, name: s.name }));
  }

  // ---------- specialists ----------
  const specData = [
    {
      firstName: "محمد", lastName: "رضایی", phone: "09121000001", area: "تهران، شمال و مرکز",
      bio: "۱۲ سال سابقه سرویس و تعمیر کولرهای گازی خانگی و اداری، مدرک فنی تأسیسات",
      exp: 12, level: 3, plan: "PRO", rating: 4.9, ratingCount: 312, successful: 326, total: 340,
      skills: ["ac"],
      identity: true, skillsV: true, interview: true,
    },
    {
      firstName: "علی", lastName: "احمدی", phone: "09121000002", area: "تهران، غرب",
      bio: "تکنسین کولر و پکیج، نماینده مجرب برندهای معتبر",
      exp: 6, level: 2, plan: "FREE", rating: 4.7, ratingCount: 84, successful: 89, total: 96,
      skills: ["ac", "boiler"],
      identity: true, skillsV: true, interview: true,
    },
    {
      firstName: "حسین", lastName: "کریمی", phone: "09121000003", area: "تهران، شرق",
      bio: "لوله‌کش و تأسیسات‌کار با ۱۵ سال سابقه، متخصص نشت‌یابی",
      exp: 15, level: 3, plan: "PRO", rating: 4.8, ratingCount: 198, successful: 210, total: 224,
      skills: ["plumbing"],
      identity: true, skillsV: true, interview: true,
    },
    {
      firstName: "رضا", lastName: "موسوی", phone: "09121000004", area: "تهران، شمال",
      bio: "برق‌کار ساختمان دارای پروانه اتحادیه، متخصص عیب‌یابی",
      exp: 9, level: 2, plan: "FREE", rating: 4.6, ratingCount: 115, successful: 120, total: 130,
      skills: ["electrical"],
      identity: true, skillsV: true, interview: true,
    },
    {
      firstName: "امیر", lastName: "حسینی", phone: "09121000005", area: "تهران، مرکز",
      bio: "تعمیرکار لوازم خانگی برندهای ایرانی و خارجی",
      exp: 7, level: 2, plan: "FREE", rating: 4.5, ratingCount: 72, successful: 77, total: 85,
      skills: ["appliances"],
      identity: true, skillsV: true, interview: true,
    },
    {
      firstName: "مهدی", lastName: "قاسمی", phone: "09121000006", area: "تهران، جنوب",
      bio: "تیم نظافت و مبل‌شویی با تجهیزات روز",
      exp: 5, level: 2, plan: "PRO", rating: 4.8, ratingCount: 149, successful: 156, total: 160,
      skills: ["cleaning"],
      identity: true, skillsV: true, interview: true,
    },
    {
      firstName: "سعید", lastName: "نادری", phone: "09121000007", area: "تهران، حومه",
      bio: "اسباب‌کشی با نیسان مسقف، بسته‌بندی رایگان",
      exp: 3, level: 1, plan: "FREE", rating: 4.3, ratingCount: 34, successful: 34, total: 38,
      skills: ["moving"],
      identity: true, skillsV: false, interview: false,
    },
    {
      firstName: "جواد", lastName: "افشار", phone: "09121000008", area: "تهران، غرب",
      bio: "تکنسین پکیج و لوله‌کشی",
      exp: 8, level: 2, plan: "FREE", rating: 4.4, ratingCount: 55, successful: 58, total: 62,
      skills: ["boiler", "plumbing"],
      identity: true, skillsV: true, interview: true,
      unavailable: true,
    },
  ];

  const specialists: Record<string, string> = {};
  for (const s of specData) {
    const skillServiceIds = s.skills.flatMap((slug) =>
      servicesBySlug[slug].map((x) => x.id)
    );
    const spec = await db.specialist.create({
      data: {
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        nationalId: "00" + Math.floor(1000000000 + Math.random() * 8999999999),
        city: "تهران",
        area: s.area,
        bio: s.bio,
        experienceYears: s.exp,
        identityVerified: s.identity,
        skillsVerified: s.skillsV,
        interviewPassed: s.interview,
        status: "ACTIVE",
        verificationLevel: s.level,
        plan: s.plan,
        isAvailable: !s.unavailable,
        rating: s.rating,
        ratingCount: s.ratingCount,
        totalOrders: s.total,
        successfulOrders: s.successful,
        skills: { create: skillServiceIds.map((id) => ({ serviceId: id })) },
      },
    });
    specialists[s.phone] = spec.id;
  }

  // ---------- a few historical paid orders ----------
  const acService = servicesBySlug["ac"][0]; // سرویس و شارژ کولر گازی
  const plumbingService = servicesBySlug["plumbing"][1]; // لوله‌بازکنی
  const cleaningService = servicesBySlug["cleaning"][0];

  const hist = [
    {
      code: "HF-384921", serviceId: acService.id, specPhone: "09121000001",
      customerName: " خانم تهرانی", phone: "09351234567",
      address: "تهران، ونک، خیابان گاندی، پلاک ۱۲، واحد ۳",
      price: 690000, daysAgo: 6,
      customerReview: { rating: 5, comment: "خیلی منظم و حرفه‌ای بود، ممنون" },
      specialistReview: { rating: 5, comment: "مشتری محترم و منصف" },
    },
    {
      code: "HF-293118", serviceId: plumbingService.id, specPhone: "09121000003",
      customerName: "آقای محمدی", phone: "09351234568",
      address: "تهران، نارمک، خیابان گلستان، کوچه سوم، پلاک ۸",
      price: 720000, daysAgo: 4,
      customerReview: { rating: 5, comment: "سریع و تمیز کار کرد" },
    },
    {
      code: "HF-194427", serviceId: cleaningService.id, specPhone: "09121000006",
      customerName: "خانم رضوی", phone: "09351234569",
      address: "تهران، سعادت‌آباد، بلوار دریا، پلاک ۴۵، واحد ۹",
      price: 780000, daysAgo: 2,
      customerReview: { rating: 4, comment: "خوب بود، فقط کمی دیر رسید" },
    },
  ];

  for (const h of hist) {
    const specId = specialists[h.specPhone];
    const created = await db.order.create({
      data: {
        code: h.code,
        status: "PAID",
        serviceId: h.serviceId,
        specialistId: specId,
        customerName: h.customerName.trim(),
        customerPhone: h.phone,
        city: "تهران",
        address: h.address,
        scheduledDate: new Date(Date.now() - h.daysAgo * 86400000).toISOString().slice(0, 10),
        scheduledSlot: "17:00-19:00",
        price: h.price,
        commissionRate: 0.15,
        commissionAmount: Math.round(h.price * 0.15),
        specialistEarning: h.price - Math.round(h.price * 0.15),
        entryCode: String(Math.floor(1000 + Math.random() * 9000)),
        paymentMethod: "online",
        acceptedAt: new Date(Date.now() - h.daysAgo * 86400000),
        arrivedAt: new Date(Date.now() - h.daysAgo * 86400000),
        workStartedAt: new Date(Date.now() - h.daysAgo * 86400000),
        completedAt: new Date(Date.now() - h.daysAgo * 86400000),
        paidAt: new Date(Date.now() - h.daysAgo * 86400000),
        customerRated: true,
        specialistRated: !!h.specialistReview,
        events: {
          create: [
            { type: "STATUS", title: "سفارش ثبت شد", createdAt: new Date(Date.now() - h.daysAgo * 86400000) },
            { type: "STATUS", title: "متخصص سفارش را پذیرفت", createdAt: new Date(Date.now() - h.daysAgo * 86400000) },
            { type: "STATUS", title: "کار انجام شد", createdAt: new Date(Date.now() - h.daysAgo * 86400000) },
            { type: "PAYMENT", title: "پرداخت با موفقیت انجام شد", createdAt: new Date(Date.now() - h.daysAgo * 86400000) },
          ],
        },
      },
    });
    await db.review.create({
      data: {
        orderId: created.id,
        specialistId: specId,
        by: "CUSTOMER",
        rating: h.customerReview.rating,
        comment: h.customerReview.comment,
        createdAt: new Date(Date.now() - h.daysAgo * 86400000),
      },
    });
    if (h.specialistReview) {
      await db.review.create({
        data: {
          orderId: created.id,
          specialistId: specId,
          by: "SPECIALIST",
          rating: h.specialistReview.rating,
          comment: h.specialistReview.comment,
          createdAt: new Date(Date.now() - h.daysAgo * 86400000),
        },
      });
    }
  }

  const totalServices = Object.values(servicesBySlug).reduce((a, b) => a + b.length, 0);
  console.log(`✅ Seeded: ${catData.length} categories, ${totalServices} services, ${specData.length} specialists, ${hist.length} historical orders`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
