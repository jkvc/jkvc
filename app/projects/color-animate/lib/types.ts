export interface ColorRegion {
  description: string;
  confidence: number;
}

export interface ProcessingStep {
  stepNumber: number;
  imageUrl: string;
  regionsDetected: ColorRegion[];
  promptUsed?: string;
  timestamp: number;
}

export interface AnimationResult {
  videoUrl: string;
  status: "pending" | "processing" | "completed" | "failed";
  timestamp: number;
}

export interface ColorAnimateSession {
  id: string;
  originalImageUrl: string;
  steps: ProcessingStep[];
  animationResult?: AnimationResult;
  createdAt: number;
  updatedAt: number;
}
