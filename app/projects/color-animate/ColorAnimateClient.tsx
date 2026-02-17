"use client";

import { useState } from "react";
import { ColorAnimateSession, ProcessingStep, ColorRegion } from "./lib/types";
import ImageUploader from "./components/ImageUploader";
import ProcessingView from "./components/ProcessingView";
import PlaybackView from "./components/PlaybackView";
import GalleryView from "./components/GalleryView";
import DevOnlyButton from "@/app/components/DevOnlyButton";

type ViewMode = "upload" | "processing" | "playback" | "gallery";

// Helper to get current timestamp (wrapped to avoid lint issues)
const getCurrentTimestamp = () => Date.now();

export default function ColorAnimateClient() {
  const [viewMode, setViewMode] = useState<ViewMode>("upload");
  const [session, setSession] = useState<ColorAnimateSession | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");

  const handleImageSelected = async (file: File) => {
    // Upload image and start processing
    setViewMode("processing");
    setIsProcessing(true);
    setStatus("Uploading image...");

    try {
      // Convert file to data URL for initial display
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;

        // Create new session
        const timestamp = getCurrentTimestamp();
        const newSession: ColorAnimateSession = {
          id: `session-${timestamp}`,
          originalImageUrl: imageUrl,
          steps: [],
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        setSession(newSession);

        // Start processing workflow
        await processImage(file, imageUrl, newSession);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing image:", error);
      setStatus("Error processing image");
      setIsProcessing(false);
    }
  };

  const processImage = async (
    file: File,
    currentImageUrl: string,
    currentSession: ColorAnimateSession
  ) => {
    let stepNumber = 1;
    let currentFile = file;
    let hasColor = true;

    // Start animation concurrently with the first image
    startAnimation(file);

    while (hasColor) {
      setStatus(`Step ${stepNumber}: Detecting colored regions...`);

      // Detect colored regions
      const regions = await detectColoredRegions(currentFile);

      // Create step with timestamp
      const step: ProcessingStep = {
        stepNumber,
        imageUrl: currentImageUrl,
        regionsDetected: regions,
        timestamp: getCurrentTimestamp(),
      };

      currentSession.steps.push(step);
      setSession({ ...currentSession });
      setCurrentStep(stepNumber - 1);

      // Save to gallery
      await saveSession(currentSession);

      if (regions.length === 0) {
        hasColor = false;
        setStatus("Complete! All color removed.");
        setIsProcessing(false);
        
        // Wait a moment then move to playback
        setTimeout(() => {
          setViewMode("playback");
        }, 1000);
        break;
      }

      // Generate prompt to remove color
      const prompt = generateRemovalPrompt(regions);
      step.promptUsed = prompt;

      setStatus(`Step ${stepNumber}: Removing color...`);

      // Remove color using Flux2Klein
      const newImageUrl = await removeColor(currentFile, prompt);

      if (!newImageUrl) {
        setStatus("Error removing color");
        setIsProcessing(false);
        break;
      }

      // Convert new image URL to file for next iteration
      currentFile = await urlToFile(newImageUrl, `step-${stepNumber + 1}.jpg`);
      currentImageUrl = newImageUrl;
      stepNumber++;

      // Safety limit
      if (stepNumber > 10) {
        setStatus("Maximum steps reached");
        setIsProcessing(false);
        setViewMode("playback");
        break;
      }
    }
  };

  const detectColoredRegions = async (file: File): Promise<ColorRegion[]> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/color-animate/detect-color", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.regions || [];
  };

  const removeColor = async (file: File, prompt: string): Promise<string | null> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("prompt", prompt);

    const response = await fetch("/api/color-animate/remove-color", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.imageUrl || null;
  };

  const startAnimation = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/color-animate/animate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.videoUrl && session) {
        // Update session with video URL
        session.animationResult = {
          videoUrl: data.videoUrl,
          status: "completed",
          timestamp: getCurrentTimestamp(),
        };
        setSession({ ...session });
        await saveSession(session);
      }
    } catch (error) {
      console.error("Error starting animation:", error);
    }
  };

  const generateRemovalPrompt = (regions: ColorRegion[]): string => {
    // Take the highest confidence region
    const topRegion = regions.sort((a, b) => b.confidence - a.confidence)[0];
    return `Convert the ${topRegion.description} to white, keeping everything else the same`;
  };

  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  const saveSession = async (sessionToSave: ColorAnimateSession) => {
    try {
      sessionToSave.updatedAt = getCurrentTimestamp();
      await fetch("/api/color-animate/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionToSave),
      });
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  const handleRestart = () => {
    setSession(null);
    setCurrentStep(0);
    setStatus("");
    setViewMode("upload");
  };

  const handleSessionSelect = (selectedSession: ColorAnimateSession) => {
    setSession(selectedSession);
    setViewMode("playback");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dev-only gallery button */}
      {viewMode !== "gallery" && (
        <div className="flex justify-center">
          <DevOnlyButton
            text="View Gallery"
            onClick={() => setViewMode("gallery")}
          />
        </div>
      )}

      {/* Main content */}
      {viewMode === "upload" && (
        <ImageUploader
          onImageSelected={handleImageSelected}
          disabled={isProcessing}
        />
      )}

      {viewMode === "processing" && session && (
        <ProcessingView
          steps={session.steps}
          currentStep={currentStep}
          isProcessing={isProcessing}
          status={status}
        />
      )}

      {viewMode === "playback" && session && (
        <PlaybackView
          steps={session.steps}
          videoUrl={session.animationResult?.videoUrl}
          onRestart={handleRestart}
        />
      )}

      {viewMode === "gallery" && (
        <GalleryView
          onSessionSelect={handleSessionSelect}
          onClose={() => setViewMode("upload")}
        />
      )}
    </div>
  );
}
