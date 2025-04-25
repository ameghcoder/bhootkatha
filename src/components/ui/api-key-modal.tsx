import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Info, ExternalLink, Youtube, Play } from "lucide-react";

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApiKeySubmit: (apiKey: string) => void;
}

export function ApiKeyModal({ isOpen, onClose, onApiKeySubmit }: ApiKeyModalProps) {
    const [apiKey, setApiKey] = React.useState("");
    const [showVideo, setShowVideo] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            onApiKeySubmit(apiKey.trim());
            onClose();
        }
    };

    // Extract video ID from YouTube URL
    const videoId = "6BRyynZkvf0";
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Your API Key</DialogTitle>
                    <DialogDescription>
                        The daily quota for the default API key has been exceeded. Please add your own API key to continue generating stories.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="apiKey">Google Generative Language API Key</Label>
                            <Input
                                id="apiKey"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="Enter your API key"
                                type="password"
                            />
                        </div>
                        <Accordion type="single" collapsible>
                            <AccordionItem value="instructions">
                                <AccordionTrigger className="text-sm">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4" />
                                        How to get your own API key?
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">1</span>
                                            <a
                                                href="https://console.cloud.google.com/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline flex items-center gap-1"
                                            >
                                                Go to Google Cloud Console
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">2</span>
                                            <span>Create or select a project</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">3</span>
                                            <a
                                                href="https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline flex items-center gap-1"
                                            >
                                                Enable Generative Language API
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">4</span>
                                            <a
                                                href="https://console.cloud.google.com/apis/credentials"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline flex items-center gap-1"
                                            >
                                                Go to APIs & Services &gt; Credentials
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">5</span>
                                            <span>Click Create Credentials &gt; API key</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">6</span>
                                            <span>Copy the API key and paste it here</span>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-border/50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Youtube className="h-4 w-4 text-red-500" />
                                                <span className="font-medium">Video Tutorial</span>
                                            </div>

                                            {showVideo ? (
                                                <div className="relative w-full pt-[56.25%] rounded-md overflow-hidden">
                                                    <iframe
                                                        className="absolute top-0 left-0 w-full h-full"
                                                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                                                        title="How to get Google Gemini API Key"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className="relative w-full pt-[56.25%] rounded-md overflow-hidden cursor-pointer group"
                                                    onClick={() => setShowVideo(true)}
                                                >
                                                    <img
                                                        src={thumbnailUrl}
                                                        alt="Video thumbnail"
                                                        className="absolute top-0 left-0 w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                                        <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                            <Play className="h-8 w-8 text-white" fill="white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!apiKey.trim()}>
                            Add API Key
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 