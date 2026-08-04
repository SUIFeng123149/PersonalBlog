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
  },
  {
    "id": "diary-1785821551915",
    "content": "与天天的极地馆一日游（￣︶￣）↗",
    "date": "2026-08-04T05:32",
    "images": [
      "/assets/diary/07fdf82d735a0fedbb6de75a9ce7b821-1785821509451.webp",
      "/assets/diary/21ed3fceb55a2bbb3c5fd5c2c1545b20-1785821509476.webp",
      "/assets/diary/7793a5b3a9c1d20a9119c508dfa1f668-1785821509497.webp",
      "/assets/diary/aceffe8353782b4b631c5b8ef375172c-1785821509516.webp",
      "/assets/diary/c931b6ba595cd71fa10d29ded49a3f77-1785821509531.webp",
      "/assets/diary/d05eca2424c26171bdeed54618e6fa9a-1785821509546.webp",
      "/assets/diary/d545a8b2cc128a874ae552498e7eb7a3-1785821509560.webp",
      "/assets/diary/e59ed2d8217e0c8c01291c39e98c2061-1785821509578.webp"
    ],
    "hidden": false
  }
];
