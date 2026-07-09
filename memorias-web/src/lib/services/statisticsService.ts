import { prisma } from "@/lib/prisma";

export interface ProductionDataPoint {
  year: number;
  article: number;
  inproceedings: number;
  book: number;
  thesis: number;
  other: number;
  total: number;
}

export interface ActiveTrendDataPoint {
  year: number;
  count: number;
}

export interface ScholarshipTrendDataPoint {
  year: number;
  doctoral: number;
  postdoctoral: number;
  undergraduate: number;
  other: number;
  total: number;
}

export interface DistributionDataPoint {
  label: string;
  value: number;
}

export interface StatisticsData {
  production: ProductionDataPoint[];
  scholarships: ScholarshipTrendDataPoint[];
  qualifications: {
    degrees: DistributionDataPoint[];
    positions: DistributionDataPoint[];
  };
  activeProjects: ActiveTrendDataPoint[];
  fundingAgencies: DistributionDataPoint[];
  summary: {
    recentPublications: number;
    activeProjects: number;
    activeScholarships: number;
    totalMembers: number;
    activeTheses: number;
  };
}

export const statisticsService = {
  getStatisticsData: async (): Promise<StatisticsData> => {
    const currentYear = new Date().getFullYear();
    const startYearRange = currentYear - 9; // Last 10 years inclusive
    const yearsArray = Array.from({ length: 10 }, (_, i) => startYearRange + i);

    // --- 1. Yearly Scientific Production Trends ---
    const publications = await prisma.publication.findMany({
      select: {
        year: true,
        type: true,
      },
    });

    // Group by year and type
    const productionMap = new Map<number, Omit<ProductionDataPoint, "year" | "total">>();
    
    // Initialize all years in our 10-year range
    yearsArray.forEach((yr) => {
      productionMap.set(yr, { article: 0, inproceedings: 0, book: 0, thesis: 0, other: 0 });
    });

    publications.forEach((pub) => {
      const yr = pub.year;
      if (yr >= startYearRange && yr <= currentYear) {
        if (!productionMap.has(yr)) {
          productionMap.set(yr, { article: 0, inproceedings: 0, book: 0, thesis: 0, other: 0 });
        }
        
        const counts = productionMap.get(yr)!;
        const type = pub.type.toLowerCase();
        
        if (type === "article" || type === "journal") {
          counts.article++;
        } else if (type === "inproceedings" || type === "proceedings" || type === "conference") {
          counts.inproceedings++;
        } else if (type === "book" || type === "booklet") {
          counts.book++;
        } else if (type === "phdthesis" || type === "mastersthesis" || type === "thesis") {
          counts.thesis++;
        } else {
          counts.other++;
        }
      }
    });

    const production: ProductionDataPoint[] = Array.from(productionMap.entries())
      .map(([year, counts]) => ({
        year,
        ...counts,
        total: counts.article + counts.inproceedings + counts.book + counts.thesis + counts.other,
      }))
      .sort((a, b) => a.year - b.year);

    // --- 2. Scholarships and Research Grants ---
    const scholarships = await prisma.scholarship.findMany({
      select: {
        startDate: true,
        endDate: true,
        type: true,
      },
    });

    const activeScholarshipsTrend: ScholarshipTrendDataPoint[] = yearsArray.map((yr) => {
      const counts = { doctoral: 0, postdoctoral: 0, undergraduate: 0, other: 0 };
      
      scholarships.forEach((s) => {
        if (!s.startDate) return;
        const sStart = s.startDate.getFullYear();
        const sEnd = s.endDate ? s.endDate.getFullYear() : currentYear;
        
        if (yr >= sStart && yr <= sEnd) {
          const type = (s.type || "").toLowerCase();
          if (type.includes("doctorado") || type.includes("doctoral") || type.includes("phd")) {
            counts.doctoral++;
          } else if (type.includes("posdoc") || type.includes("postdoc") || type.includes("postdoctoral")) {
            counts.postdoctoral++;
          } else if (type.includes("grado") || type.includes("alumnos") || type.includes("undergraduate") || type.includes("estimulo")) {
            counts.undergraduate++;
          } else {
            counts.other++;
          }
        }
      });

      return {
        year: yr,
        ...counts,
        total: counts.doctoral + counts.postdoctoral + counts.undergraduate + counts.other,
      };
    });

    // --- 3. Academic Qualifications and Seniority ---
    const members = await prisma.member.findMany({
      select: {
        highestDegree: true,
        positionAtLab: true,
        endDate: true,
      },
    });

    const activeMembers = members.filter((m) => !m.endDate || m.endDate > new Date());

    // Highest Degree distribution
    const degreeCounts: Record<string, number> = {};
    // Lab Position distribution
    const positionCounts: Record<string, number> = {};

    activeMembers.forEach((m) => {
      const degree = m.highestDegree || "Unknown";
      degreeCounts[degree] = (degreeCounts[degree] || 0) + 1;

      const pos = m.positionAtLab || "Other";
      positionCounts[pos] = (positionCounts[pos] || 0) + 1;
    });

    const degrees: DistributionDataPoint[] = Object.entries(degreeCounts).map(([label, value]) => ({
      label,
      value,
    })).sort((a, b) => b.value - a.value);

    const positions: DistributionDataPoint[] = Object.entries(positionCounts).map(([label, value]) => ({
      label,
      value,
    })).sort((a, b) => b.value - a.value);

    // --- 4. Active Projects Evolution ---
    const projects = await prisma.project.findMany({
      select: {
        startDate: true,
        endDate: true,
        fundingAgency: true,
      },
    });

    const activeProjectsTrend: ActiveTrendDataPoint[] = yearsArray.map((yr) => {
      let count = 0;
      projects.forEach((p) => {
        if (!p.startDate) return;
        const pStart = p.startDate.getFullYear();
        const pEnd = p.endDate ? p.endDate.getFullYear() : currentYear;
        
        if (yr >= pStart && yr <= pEnd) {
          count++;
        }
      });
      return { year: yr, count };
    });

    // --- 5. Funding Agency Distribution (for active projects) ---
    const activeProjects = projects.filter((p) => {
      if (!p.startDate) return false;
      const pEnd = p.endDate ? p.endDate.getTime() : Infinity;
      return pEnd >= new Date().getTime();
    });

    const fundingCounts: Record<string, number> = {};
    
    activeProjects.forEach((p) => {
      let agency = p.fundingAgency ? p.fundingAgency.trim() : "Unknown";
      
      const upperAgency = agency.toUpperCase();
      if (upperAgency.includes("UNLP")) {
        agency = "UNLP";
      } else if (upperAgency.includes("CONICET")) {
        agency = "CONICET";
      } else if (upperAgency.includes("CIC")) {
        agency = "CIC";
      } else if (upperAgency.includes("ANPCYT") || upperAgency.includes("MINCYT") || upperAgency.includes("FONCYT")) {
        agency = "ANPCyT";
      } else if (upperAgency === "UNKNOWN" || agency === "") {
        agency = "Other/Unspecified";
      }
      
      fundingCounts[agency] = (fundingCounts[agency] || 0) + 1;
    });

    const fundingAgencies: DistributionDataPoint[] = Object.entries(fundingCounts).map(([label, value]) => ({
      label,
      value,
    })).sort((a, b) => b.value - a.value);

    // Summary KPIs
    const activeScholarshipsCount = activeScholarshipsTrend[activeScholarshipsTrend.length - 1]?.total || 0;
    const activeProjectsCount = activeProjects.length;

    // --- 6. Active Theses ---
    const theses = await prisma.thesis.findMany({
      select: {
        startDate: true,
        endDate: true,
        progress: true,
      },
    });

    const activeThesesCount = theses.filter((t) => {
      if (t.progress === 100) return false;
      if (t.endDate && t.endDate.getTime() <= new Date().getTime()) return false;
      return true;
    }).length;

    const recentPublicationsCount = publications.filter(
      (pub) => pub.year >= currentYear - 2 && pub.year <= currentYear
    ).length;

    return {
      production,
      scholarships: activeScholarshipsTrend,
      qualifications: {
        degrees,
        positions,
      },
      activeProjects: activeProjectsTrend,
      fundingAgencies,
      summary: {
        recentPublications: recentPublicationsCount,
        activeProjects: activeProjectsCount,
        activeScholarships: activeScholarshipsCount,
        totalMembers: activeMembers.length,
        activeTheses: activeThesesCount,
      },
    };
  },
};
