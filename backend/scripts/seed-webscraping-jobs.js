import mongoose from "mongoose";
import dotenv from "dotenv";
import ScrapedJob from "../models/scrapedJob.model.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/workmate";

const sampleJobs = [
  {
    title: "Senior Full Stack Developer",
    company: "Tech Innovations Inc",
    location: "San Francisco, CA",
    salary: {
      min: 150000,
      max: 200000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "LinkedIn",
    description:
      "We are looking for an experienced Full Stack Developer with expertise in React, Node.js, and MongoDB. You will work on building scalable web applications.",
    skills: ["React", "Node.js", "MongoDB", "JavaScript", "AWS"],
    experience: "Senior",
    applyLink: "https://linkedin.com/jobs/view/senior-full-stack-developer",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "Data Scientist",
    company: "AI Solutions Ltd",
    location: "New York, NY",
    salary: {
      min: 120000,
      max: 180000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "Indeed",
    description:
      "Join our data science team to analyze large datasets and build machine learning models. Experience with Python and TensorFlow required.",
    skills: [
      "Python",
      "Machine Learning",
      "TensorFlow",
      "SQL",
      "Data Analysis",
    ],
    experience: "Mid Level",
    applyLink: "https://indeed.com/jobs/data-scientist",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "Frontend Developer (React)",
    company: "Creative Studios",
    location: "Remote",
    salary: {
      min: 80000,
      max: 120000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "Stack Overflow",
    description:
      "Build beautiful and responsive user interfaces using React and Tailwind CSS. We are looking for a junior to mid-level developer.",
    skills: ["React", "Tailwind CSS", "JavaScript", "HTML/CSS", "Git"],
    experience: "Entry Level",
    applyLink: "https://stackoverflow.com/jobs/frontend-react",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "DevOps Engineer",
    company: "Cloud Services Co",
    location: "Austin, TX",
    salary: {
      min: 130000,
      max: 170000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "GitHub Jobs",
    description:
      "We need a DevOps engineer to manage our cloud infrastructure on AWS and maintain CI/CD pipelines.",
    skills: ["AWS", "Docker", "Kubernetes", "Linux", "Jenkins"],
    experience: "Mid Level",
    applyLink: "https://github.com/jobs/devops-engineer",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "UX/UI Designer",
    company: "Design Agency Pro",
    location: "Los Angeles, CA",
    salary: {
      min: 75000,
      max: 110000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "Glassdoor",
    description:
      "Design beautiful and intuitive user interfaces for web and mobile applications. Experience with Figma required.",
    skills: ["Figma", "UI Design", "UX Research", "Prototyping", "Adobe XD"],
    experience: "Mid Level",
    applyLink: "https://glassdoor.com/jobs/ux-ui-designer",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "Backend Developer (Python)",
    company: "StartUp Ventures",
    location: "Boston, MA",
    salary: {
      min: 100000,
      max: 140000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "AngelList",
    description:
      "Build scalable backend systems using Python and Django. Join a fast-growing startup with great benefits.",
    skills: ["Python", "Django", "PostgreSQL", "REST API", "Docker"],
    experience: "Mid Level",
    applyLink: "https://angellist.com/jobs/backend-python",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "Mobile App Developer",
    company: "Mobile First Inc",
    location: "Seattle, WA",
    salary: {
      min: 110000,
      max: 160000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "RemoteOk",
    description:
      "Develop cross-platform mobile applications using React Native. Fully remote position with flexible hours.",
    skills: ["React Native", "JavaScript", "Firebase", "iOS", "Android"],
    experience: "Mid Level",
    applyLink: "https://remoteok.io/jobs/mobile-app-developer",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "QA Engineer",
    company: "Quality Assurance Systems",
    location: "Chicago, IL",
    salary: {
      min: 70000,
      max: 100000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "FlexJobs",
    description:
      "Test web and mobile applications, write automated test cases, and ensure product quality. Contract position with potential for full-time.",
    skills: ["Selenium", "Python", "Jest", "Testing", "JIRA"],
    experience: "Entry Level",
    applyLink: "https://flexjobs.com/jobs/qa-engineer",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "Solutions Architect",
    company: "Enterprise Solutions Ltd",
    location: "New York, NY",
    salary: {
      min: 160000,
      max: 220000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "LinkedIn",
    description:
      "Design and implement enterprise cloud solutions for Fortune 500 companies. Requires 5+ years of experience.",
    skills: ["AWS", "Azure", "Enterprise Architecture", "Cloud", "Leadership"],
    experience: "Senior",
    applyLink: "https://linkedin.com/jobs/solutions-architect",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "Freelance Web Developer",
    company: "Client Project",
    location: "Remote",
    salary: {
      min: 50000,
      max: 80000,
      currency: "USD",
    },
    jobType: "Freelance",
    platform: "Upwork",
    description:
      "Build custom websites for clients. Looking for experienced developers with WordPress, PHP, and JavaScript skills.",
    skills: ["WordPress", "PHP", "JavaScript", "HTML/CSS", "MySQL"],
    experience: "Mid Level",
    applyLink: "https://upwork.com/jobs/web-developer",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "Database Administrator",
    company: "Data Systems Corp",
    location: "Denver, CO",
    salary: {
      min: 95000,
      max: 135000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "Indeed",
    description:
      "Manage and optimize large databases, ensure data security, and implement backup strategies.",
    skills: ["PostgreSQL", "MySQL", "MongoDB", "Linux", "Backup Management"],
    experience: "Mid Level",
    applyLink: "https://indeed.com/jobs/database-admin",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "Machine Learning Engineer",
    company: "AI Research Lab",
    location: "San Francisco, CA",
    salary: {
      min: 140000,
      max: 200000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "Glassdoor",
    description:
      "Develop and deploy machine learning models for production systems. Experience with PyTorch and TensorFlow required.",
    skills: ["Python", "PyTorch", "TensorFlow", "ML", "Data Science"],
    experience: "Senior",
    applyLink: "https://glassdoor.com/jobs/ml-engineer",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "Project Manager",
    company: "Tech Management Consultants",
    location: "Chicago, IL",
    salary: {
      min: 90000,
      max: 130000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "LinkedIn",
    description:
      "Manage software development projects, coordinate with teams, and ensure on-time delivery. Agile/Scrum experience preferred.",
    skills: [
      "Project Management",
      "Agile",
      "Scrum",
      "Leadership",
      "Communication",
    ],
    experience: "Mid Level",
    applyLink: "https://linkedin.com/jobs/project-manager",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "Security Engineer",
    company: "Cybersecurity Experts",
    location: "Washington, DC",
    salary: {
      min: 125000,
      max: 175000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "Stack Overflow",
    description:
      "Implement and maintain security systems, conduct penetration testing, and ensure compliance with security standards.",
    skills: [
      "Cybersecurity",
      "Penetration Testing",
      "Linux",
      "Networking",
      "Python",
    ],
    experience: "Senior",
    applyLink: "https://stackoverflow.com/jobs/security-engineer",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "Content Manager",
    company: "Media Publishing Co",
    location: "Remote",
    salary: {
      min: 60000,
      max: 90000,
      currency: "USD",
    },
    jobType: "Part-Time",
    platform: "RemoteOk",
    description:
      "Create and manage content for web and social media. Experience with SEO and content marketing helpful.",
    skills: [
      "Content Writing",
      "SEO",
      "Social Media",
      "WordPress",
      "Analytics",
    ],
    experience: "Entry Level",
    applyLink: "https://remoteok.io/jobs/content-manager",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "IT Support Specialist",
    company: "Tech Support Services",
    location: "Phoenix, AZ",
    salary: {
      min: 45000,
      max: 70000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "Indeed",
    description:
      "Provide technical support to end users, troubleshoot IT issues, and maintain company systems.",
    skills: ["IT Support", "Windows", "Linux", "Networking", "Troubleshooting"],
    experience: "Entry Level",
    applyLink: "https://indeed.com/jobs/it-support",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "Technical Writer",
    company: "Documentation Services",
    location: "San Diego, CA",
    salary: {
      min: 70000,
      max: 110000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "GitHub Jobs",
    description:
      "Write technical documentation, user guides, and API documentation for software products.",
    skills: [
      "Technical Writing",
      "Documentation",
      "Markdown",
      "API Documentation",
      "Git",
    ],
    experience: "Mid Level",
    applyLink: "https://github.com/jobs/technical-writer",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "Business Analyst",
    company: "Consulting Group International",
    location: "Boston, MA",
    salary: {
      min: 85000,
      max: 125000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "Glassdoor",
    description:
      "Analyze business requirements, create specifications, and work with development teams. MBA preferred.",
    skills: [
      "Business Analysis",
      "Requirements Gathering",
      "SQL",
      "Excel",
      "Communication",
    ],
    experience: "Mid Level",
    applyLink: "https://glassdoor.com/jobs/business-analyst",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "Graphic Designer",
    company: "Design House Creative",
    location: "Los Angeles, CA",
    salary: {
      min: 55000,
      max: 90000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "AngelList",
    description:
      "Create visual designs for print and digital media. Experience with Adobe Creative Suite required.",
    skills: [
      "Graphic Design",
      "Adobe Creative Suite",
      "Photoshop",
      "Illustrator",
      "InDesign",
    ],
    experience: "Entry Level",
    applyLink: "https://angellist.com/jobs/graphic-designer",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
  {
    title: "System Administrator",
    company: "Infrastructure Management",
    location: "Dallas, TX",
    salary: {
      min: 80000,
      max: 120000,
      currency: "USD",
    },
    jobType: "Full-Time",
    platform: "LinkedIn",
    description:
      "Manage company servers, networks, and IT infrastructure. Experience with Windows Server and Linux required.",
    skills: [
      "System Administration",
      "Windows Server",
      "Linux",
      "Networking",
      "Security",
    ],
    experience: "Mid Level",
    applyLink: "https://linkedin.com/jobs/system-admin",
    companyLogo: "https://via.placeholder.com/100",
    source: "web-scraper",
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing jobs
    await ScrapedJob.deleteMany({});
    console.log("Cleared existing jobs");

    // Insert sample jobs
    const inserted = await ScrapedJob.insertMany(sampleJobs);
    console.log(`✅ Successfully inserted ${inserted.length} sample jobs`);

    // Create indexes
    await ScrapedJob.collection.createIndex({
      title: "text",
      description: "text",
      skills: "text",
    });
    await ScrapedJob.collection.createIndex({ platform: 1, isActive: 1 });
    await ScrapedJob.collection.createIndex({
      location: 1,
      jobType: 1,
      experience: 1,
    });
    console.log("✅ Indexes created");

    // Get statistics
    const stats = await ScrapedJob.countDocuments();
    console.log(`\n📊 Database Statistics:`);
    console.log(`   Total Jobs: ${stats}`);

    const platformStats = await ScrapedJob.aggregate([
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
        },
      },
    ]);
    console.log("   By Platform:");
    platformStats.forEach((stat) => {
      console.log(`     - ${stat._id}: ${stat.count}`);
    });

    console.log("\n✨ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedDatabase();
