// Project data configuration file
// Used to manage data for the project display page

export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
	startDate: string;
	endDate?: string;
	featured?: boolean;
	tags?: string[];
	visitUrl?: string; // 添加前往项目链接字段
}

export const projectsData: Project[] = [
	{
		id: "visualization_platform",
		title: "visualization_platform",
		description: "面向多视频平台的内容、互动、情感和账号数据分析系统。",
		image: "",
		category: "web",
		techStack: ["Java", "JavaScript", "Tailwind CSS", "Vue", "HTML"],
		status: "completed",
		liveDemo: "https://visualization-platform.example.com",
		sourceCode: "https://gitee.com/with-the-wind1/visualization_platform",
		visitUrl: "https://gitee.com/with-the-wind1/visualization_platform",
		startDate: "2026-06-01",
		endDate: "2026-07-01",
		featured: true,
		tags: ["Platform", "Visual", "Close Source"],
	},
	{
		id: "Drone-obstacle-avoidance",
		title: "Drone Obstacle Avoidance",
		description: "一个基于无人机的避障系统，用于在复杂环境中安全导航。",
		image: "",
		category: "desktop",
		techStack: ["C++", "Python", "OpenCV", "TensorFlow"],
		status: "in-progress",
		liveDemo: "https://portfolio.example.com",
		sourceCode: "https://gitee.com/with-the-wind1/drone",
		visitUrl: "https://gitee.com/with-the-wind1/drone",
		startDate: "2025-11-01",
		endDate: "",
		featured: true,
		tags: ["Drone", "Avoidance", "Close Source"],
	},
	// {
	// 	id: "task-manager-app",
	// 	title: "Task Manager App",
	// 	description:
	// 		"Cross-platform task management application supporting team collaboration and project management.",
	// 	image: "",
	// 	category: "mobile",
	// 	techStack: ["React Native", "TypeScript", "Firebase"],
	// 	status: "in-progress",
	// 	startDate: "2024-03-01",
	// 	tags: ["Mobile", "Productivity", "Team Collaboration"],
	// },
	{
		id: "Harmony_Music",
		title: "Harmony Music",
		description:
			"一个功能完整、界面美观的音乐管理系统，包含前端和后端完整实现。",
		image: "",
		category: "web",
		techStack: ["C++", "Python", "OpenCV", "TensorFlow"],
		status: "completed",
		liveDemo: "https://harmony-music.example.com",
		sourceCode: "https://gitee.com/no-such-group-found/music_player_admin",
		visitUrl: "https://gitee.com/no-such-group-found/music_player_admin",
		startDate: "2025-12-01",
		endDate: "2026-01-01",
		featured: true,
		tags: ["Music", "Close Source"],
	},
	// {
	// 	id: "e-commerce-platform",
	// 	title: "E-commerce Platform",
	// 	description:
	// 		"Full-stack e-commerce platform including user management, product management, and order processing features.",
	// 	image: "",
	// 	category: "web",
	// 	techStack: ["Next.js", "Node.js", "PostgreSQL", "Stripe"],
	// 	status: "planned",
	// 	startDate: "2024-07-01",
	// 	tags: ["E-commerce", "Full Stack", "Payment Integration"],
	// },
];

// Get project statistics
export const getProjectStats = () => {
	const total = projectsData.length;
	const completed = projectsData.filter((p) => p.status === "completed").length;
	const inProgress = projectsData.filter(
		(p) => p.status === "in-progress",
	).length;
	const planned = projectsData.filter((p) => p.status === "planned").length;

	return {
		total,
		byStatus: {
			completed,
			inProgress,
			planned,
		},
	};
};

// Get projects by category
export const getProjectsByCategory = (category?: string) => {
	if (!category || category === "all") {
		return projectsData;
	}
	return projectsData.filter((p) => p.category === category);
};

// Get featured projects
export const getFeaturedProjects = () => {
	return projectsData.filter((p) => p.featured);
};

// Get all tech stacks
export const getAllTechStack = () => {
	const techSet = new Set<string>();
	projectsData.forEach((project) => {
		project.techStack.forEach((tech) => {
			techSet.add(tech);
		});
	});
	return Array.from(techSet).sort();
};
