export interface DiaryEntry {
	id: string;
	content: string;
	date: string;
	images: string[];
	hidden: boolean;
}

export const diaryEntries: DiaryEntry[] = [
  {
    "id": "diary-1785313496476",
    "content": "test1",
    "date": "2026-07-29T16:29",
    "images": [
      "/assets/diary/d4-1785313620685.webp"
    ],
    "hidden": false
  }
];
