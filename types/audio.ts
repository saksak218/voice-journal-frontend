export interface AudioJournal {
  _id: string;
  userId: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  format: string;
  duration: number;
  category: "daily" | "best-moments" | "custom";
  customCategory?: string;
  tags?: string[];
  cloudinaryPublicId?: string;
  transcription?: string;
  summary?: string;
  isTranscribed: boolean;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AudioUploadData {
  title?: string;
  category: string;
  customCategory?: string;
  tags?: string[];
  audio: File | Blob;
}

export interface AudioStats {
  totalAudios: number;
  totalStorage: number;
  totalDuration: number;
  avgDuration: number;
  categories: Array<{
    _id: string;
    count: number;
  }>;
}

export interface AudioResponse {
  success: boolean;
  message?: string;
  data?: AudioJournal;
  count?: number;
}

export interface AudioListResponse {
  success: boolean;
  count: number;
  data: AudioJournal[];
}
