// Timeline data configuration file
// Used to manage data for the timeline page

export interface TimelineItem {
	id: string;
	title: string;
	description: string;
	type: "education" | "work" | "project" | "achievement";
	startDate: string;
	endDate?: string; // If empty, it means current
	location?: string;
	organization?: string;
	position?: string;
	skills?: string[];
	achievements?: string[];
	links?: {
		name: string;
		url: string;
		type: "website" | "certificate" | "project" | "other";
	}[];
	icon?: string; // Iconify icon name
	color?: string;
	featured?: boolean;
}

export const timelineData: TimelineItem[] = [
	{
		id: "当前学习",
		title: "计算机科学与技术学习",
		description: "目前正在学习计算机科学与技术，专注于Web开发和软件工程。",
		type: "education",
		startDate: "2025-12-01",
		location: "哈尔滨",
		organization: "哈尔滨理工大学",
		skills: ["Java", "Spring", "JavaScript", "HTML/CSS", "MySQL"],
		achievements: ["完成数据结构课程项目", "参与多个课程项目开发"],
		icon: "material-symbols:school",
		color: "#059669",
		featured: true,
	},

	{
		id: "音乐管理系统",
		title: "音乐管理系统课程项目",
		description: "数据库课程结课项目，开发了一个完整音乐信息管理系统。",
		type: "project",
		startDate: "2025-12-01",
		endDate: "2026-01-07",
		skills: ["Java", "MySQL", "Swing", "JDBC"],
		achievements: [
			"获得优秀课程项目成绩",
			"实现完整的增删改查功能",
			"学习数据库设计和优化",
		],
		icon: "material-symbols:database",
		color: "#EA580C",
	},
	{
		id: "编程竞赛",
		title: "大学编程竞赛",
		description: "编程竞赛，参与了多个编程竞赛，获得了多个奖励。",
		type: "achievement",
		startDate: "2024-10-20",
		location: "哈尔滨理工大学",
		organization: "哈尔滨理工大学",
		skills: ["C++", "Algorithms", "Data Structures"],
		achievements: ["赢得传智杯校赛一等奖", "提高了算法能力", "提高了编程能力"],
		icon: "material-symbols:emoji-events",
		color: "#7C3AED",
	},
	{
		id: "高中毕业",
		title: "高中毕业",
		description:
			"高中毕业，成绩优秀，被哈尔滨理工大学数据科学与大数据技术专业录取。",
		type: "education",
		startDate: "2021-09-01",
		endDate: "2024-06-30",
		location: "Daqing, HeiLongjiang",
		organization: "大庆市第四中学",
		achievements: ["高考成绩：561"],
		icon: "material-symbols:school",
		color: "#2563EB",
	},
	{
		id: "第一次编程经历",
		title: "第一次编程经历",
		description: "第一次在课外班接触编程，开始学习 Python 的基本语法。",
		type: "education",
		startDate: "2020-07-01",
		skills: ["Python", "Basic Programming Concepts"],
		achievements: [
			'完成了第一个 "Hello World" 程序',
			"学习了基本的循环和条件语句。",
			"产生了对编程的兴趣。",
		],
		icon: "material-symbols:code",
		color: "#7C3AED",
	},
];

// Get timeline statistics
export const getTimelineStats = () => {
	const total = timelineData.length;
	const byType = {
		education: timelineData.filter((item) => item.type === "education").length,
		work: timelineData.filter((item) => item.type === "work").length,
		project: timelineData.filter((item) => item.type === "project").length,
		achievement: timelineData.filter((item) => item.type === "achievement")
			.length,
	};

	return { total, byType };
};

// Get timeline items by type
export const getTimelineByType = (type?: string) => {
	if (!type || type === "all") {
		return timelineData.sort(
			(a, b) =>
				new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
		);
	}
	return timelineData
		.filter((item) => item.type === type)
		.sort(
			(a, b) =>
				new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
		);
};

// Get featured timeline items
export const getFeaturedTimeline = () => {
	return timelineData
		.filter((item) => item.featured)
		.sort(
			(a, b) =>
				new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
		);
};

// Get current ongoing items
export const getCurrentItems = () => {
	return timelineData.filter((item) => !item.endDate);
};

// Calculate total work experience
export const getTotalWorkExperience = () => {
	const workItems = timelineData.filter((item) => item.type === "work");
	let totalMonths = 0;

	workItems.forEach((item) => {
		const startDate = new Date(item.startDate);
		const endDate = item.endDate ? new Date(item.endDate) : new Date();
		const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
		const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
		totalMonths += diffMonths;
	});

	return {
		years: Math.floor(totalMonths / 12),
		months: totalMonths % 12,
	};
};
