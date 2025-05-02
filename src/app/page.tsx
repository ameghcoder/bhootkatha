"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Copy, Bot, Clapperboard, Loader2, Sparkles, Info } from "lucide-react"; // Added Info

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  generateHorrorScript,
  GenerateHorrorScriptInput,
  GenerateHorrorScriptOutput,
} from "@/ai/flows/generate-horror-script";
import {
  generateVisualScenePrompts,
  GenerateVisualScenePromptsInput,
  GenerateVisualScenePromptsOutput,
} from "@/ai/flows/generate-visual-scene-prompts";
import { canGenerateStory, incrementGenerationCount, getRemainingGenerations } from "@/lib/rate-limiter"; // Import rate limiting functions
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // Import Tooltip components
import { ApiKeyModal } from "@/components/ui/api-key-modal";
import { isUsingCustomApiKey, setUserApiKey, removeUserApiKey } from "@/lib/api-key-manager";
import { Badge } from "@/components/ui/badge";

const MoodSchema = z.enum([
  'Psychological',
  'Supernatural',
  'Gore',
  'Thriller',
  'Paranormal Mystery',
]);

const LengthSchema = z.enum(["Short", "Medium", "Long"]);

const LanguageSchema = z.enum(["Hindi", "English", "Spanish", "French"]);

// Apply coercion and specific error messages to the frontend schema
const FormSchema = z.object({
  mood: MoodSchema,
  length: LengthSchema,
  language: LanguageSchema,
  words: z.coerce
    .number()
    .int()
    .min(50, { message: "Must be at least 50 words." })
    .max(5000, { message: "Must be 5000 words or less." }),
  referencePrompt: z.string().optional(),
});

export default function Home() {
  const { toast } = useToast();
  const [generatedScript, setGeneratedScript] = React.useState<string | null>(
    null
  );
  const [visualPrompts, setVisualPrompts] = React.useState<string[] | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = React.useState(false);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = React.useState(false);
  const [remainingGenerations, setRemainingGenerations] = React.useState<number | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = React.useState(false);
  const [usingCustomKey, setUsingCustomKey] = React.useState(false);

  // Load remaining generations on component mount (client-side only)
  React.useEffect(() => {
    setRemainingGenerations(getRemainingGenerations());
  }, []);

  // Load API key status on component mount
  React.useEffect(() => {
    setUsingCustomKey(isUsingCustomApiKey());
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mood: 'Supernatural',
      length: 'Medium',
      language: 'Hindi',
      words: 200,
      referencePrompt: '',
    },
  });

  const handleApiKeySubmit = (apiKey: string) => {
    setUserApiKey(apiKey);
    setUsingCustomKey(true);
    toast({
      title: "API Key Added",
      description: "Your custom API key has been saved. You can now generate more stories.",
    });
  };

  const handleResetApiKey = () => {
    removeUserApiKey();
    setUsingCustomKey(false);
    toast({
      title: "API Key Reset",
      description: "Reverted to using the default API key.",
    });
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!canGenerateStory()) {
      setShowApiKeyModal(true);
      return;
    }

    setIsGeneratingScript(true);
    setGeneratedScript(null);
    setVisualPrompts(null);
    try {
      const input: GenerateHorrorScriptInput = {
        mood: data.mood,
        length: data.length,
        language: data.language,
        words: data.words,
        referencePrompt: data.referencePrompt || undefined,
      };

      const result: GenerateHorrorScriptOutput = await generateHorrorScript(input);
      setGeneratedScript(result.script);

      incrementGenerationCount();
      setRemainingGenerations(getRemainingGenerations());

      toast({
        title: "Script Generated!",
        description: `Your ${data.language} horror script is ready.`,
      });
    } catch (error: any) {
      console.error("Error generating script:", error);
      if (error?.message?.includes("quota") || error?.status === 500) {
        setShowApiKeyModal(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate script. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsGeneratingScript(false);
    }
  }

  async function handleGenerateVisualPrompts() {
    if (!generatedScript) {
      toast({
        title: "Error",
        description: "Please generate a script first.",
        variant: "destructive",
      });
      return;
    }

    // Note: Visual prompt generation does not count towards the daily limit currently.
    // If it should, add the rate limit check here as well.

    setIsGeneratingPrompts(true);
    setVisualPrompts(null);
    try {
      const input: GenerateVisualScenePromptsInput = { script: generatedScript };
      const result: GenerateVisualScenePromptsOutput = await generateVisualScenePrompts(input);
      setVisualPrompts(result.prompts);
      toast({
        title: "Visual Prompts Generated!",
        description: "Scene prompts are ready for your image generation tool.",
      });
    } catch (error) {
      console.error("Error generating visual prompts:", error);
      toast({
        title: "Error",
        description: "Failed to generate visual prompts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPrompts(false);
    }
  }

  function copyToClipboard(text: string | null | string[]) {
    if (!text) return;
    const textToCopy = Array.isArray(text)
      ? text.map((p, i) => `Scene ${i + 1}: ${p}`).join('\n\n')
      : text;

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        toast({
          title: "Copied!",
          description: `${Array.isArray(text) ? 'Prompts' : 'Script'} copied to clipboard.`,
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Error",
          description: `Failed to copy ${Array.isArray(text) ? 'prompts' : 'script'}.`,
          variant: "destructive",
        });
      }
    );
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12 bg-gradient-to-br from-background to-secondary/30 dark">
      <Card className="w-full max-w-3xl shadow-xl border-primary/20">
        <CardHeader className="text-center relative"> {/* Added relative positioning */}
          <h1 className="text-4xl font-bold font-creepy text-primary mb-2">👻 Bhootkatha 👻</h1>
          <CardDescription className="text-muted-foreground text-lg">
            Generate cinematic horror scripts with AI. Choose your poison...
          </CardDescription>
          {/* Daily Limit Info */}
          {remainingGenerations !== null && (
            <div className="absolute top-4 right-4 text-xs text-muted-foreground flex items-center space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>You can generate up to 15 scripts per day.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span>{remainingGenerations} left today</span>
            </div>
          )}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold font-creepy text-primary">BhootKatha</h1>
            <div className="flex items-center gap-2">
              {usingCustomKey && (
                <>
                  <Badge variant="secondary" className="bg-accent/20">
                    Using Custom API Key
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetApiKey}
                    className="text-xs"
                  >
                    Reset to Default
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKeyModal(true)}
                className="text-xs"
              >
                Use your API Key
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-accent-foreground">Mood</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-accent focus:ring-accent">
                            <SelectValue placeholder="Select the horror mood" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MoodSchema.options.map((mood) => (
                            <SelectItem key={mood} value={mood}>
                              {mood}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-accent-foreground">Length</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-accent focus:ring-accent">
                            <SelectValue placeholder="Select script length" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LengthSchema.options.map((length) => (
                            <SelectItem key={length} value={length}>
                              {length}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-accent-foreground">Language</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-accent focus:ring-accent">
                            <SelectValue placeholder="Select output language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LanguageSchema.options.map((language) => (
                            <SelectItem key={language} value={language}>
                              {language}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="words"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-accent-foreground">Words</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Words (50-5000)"
                        className="border-accent focus:ring-accent"
                        {...field}
                        onChange={e => field.onChange(e.target.value)}
                        value={field.value ?? ''}
                        min={50}
                        max={5000}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referencePrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-accent-foreground">Reference Prompt (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a story idea, character concept, or specific scene to inspire the AI..."
                        className="resize-none border-accent focus:ring-accent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Disable button if generating or limit reached */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isGeneratingScript || (remainingGenerations !== null && remainingGenerations <= 0)}
              >
                {isGeneratingScript ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Script...
                  </>
                ) : (
                  <>
                    <Bot className="mr-2 h-4 w-4" /> Generate Script
                  </>
                )}
              </Button>
            </form>
          </Form>

          {generatedScript && (
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold font-creepy text-primary">Generated Script</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(generatedScript)}
                  aria-label="Copy Script"
                >
                  <Copy className="h-5 w-5 text-accent hover:text-accent-foreground" />
                </Button>
              </div>
              <ScrollArea className="h-72 w-full rounded-md border border-input p-4 bg-card/50">
                <pre className="whitespace-pre-wrap text-sm text-foreground">{generatedScript}</pre>
              </ScrollArea>
              <Button
                onClick={handleGenerateVisualPrompts}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mt-4"
                disabled={isGeneratingPrompts || isGeneratingScript} // Disable if either is running
              >
                {isGeneratingPrompts ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Visuals...
                  </>
                ) : (
                  <>
                    <Clapperboard className="mr-2 h-4 w-4" /> Generate Visual Scenes
                  </>
                )}
              </Button>
            </div>
          )}

          {visualPrompts && (
            <div className="mt-8 space-y-4">
              <h2 className="text-2xl font-semibold font-creepy text-primary">Visual Scene Prompts</h2>
              <ScrollArea className="h-72 w-full rounded-md border border-input p-4 bg-card/50">
                <ul className="space-y-3">
                  {visualPrompts.map((prompt, index) => (
                    <li key={index} className="text-sm text-foreground border-b border-border/50 pb-2">
                      <strong className="text-accent-foreground">Scene {index + 1}:</strong> {prompt}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
              <Button
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary/10"
                onClick={() => copyToClipboard(visualPrompts)}
                aria-label="Copy All Prompts"
              >
                <Copy className="mr-2 h-4 w-4" /> Copy All Prompts
              </Button>
            </div>
          )}

          {/* Combined Loading Indicator */}
          {(isGeneratingScript || isGeneratingPrompts) && (
            <div className="mt-8 flex justify-center items-center space-x-2 text-muted-foreground animate-pulse">
              <Sparkles className="h-5 w-5 text-primary animate-spin" />
              <span>{isGeneratingScript ? 'Conjuring script...' : 'Visualizing horrors...'}</span>
            </div>
          )}

        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground/70 pt-4">
          Built by
          <a className="mx-1 underline text-blue-400" href="https://linkedin.com/in/yrjdeveloper">Yashraj Developer</a> - Using Firebase Studio |
          Powered by AI | Bhootkatha &copy; {new Date().getFullYear()}
        </CardFooter>
      </Card>
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onApiKeySubmit={handleApiKeySubmit}
      />
    </main>
  );
}

