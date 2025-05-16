'use client';


import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";

// Updated Story interface to better match Prisma model
interface Story {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: string; // Assuming string format from JSON
  updatedAt: string; // Assuming string format from JSON
  userId: string;
}


interface NewStoryData {
  title: string;
  shortDescription: string;
  content: string;
}

// Define LeftSidebar props if it needs access to session, status, etc.
interface LeftSidebarProps {
  session: ReturnType<typeof useSession>['data'];
  status: ReturnType<typeof useSession>['status'];
  onSignIn: () => void;
  onSignOut: () => void;
  onCreateStoryOpen: () => void;
  selectedStory: Story | null;
}

// Placeholder for LeftSidebar - content will be moved from existing header
const LeftSidebar = ({ session, status, onSignIn, onSignOut, onCreateStoryOpen, selectedStory }: LeftSidebarProps) => {
  return (
    <aside className="w-72 bg-background border-r p-6 flex flex-col justify-between min-h-screen">
      <div>
        {/* Content that was previously in the top part of the header (e.g., auth, create story) */}
        {status === "authenticated" ? (
          <div className="space-y-4">
            <Dialog /* open={isCreateStoryDialogOpen} onOpenChange={setIsCreateStoryDialogOpen} - This state needs to be managed by parent or passed */ >
              <DialogTrigger asChild>
                <Button onClick={onCreateStoryOpen} className="w-full">Create New Story</Button>
              </DialogTrigger>
              {/* DialogContent for Create Story will remain, but triggered from here */}
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>{session?.user?.email || "Account"}</span>
                  <span>▼</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Display selected story's title and dates here, below auth buttons */}
            {selectedStory && (
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-lg font-semibold mb-1 break-words">{selectedStory.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Created: {new Date(selectedStory.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  Updated: {new Date(selectedStory.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Button onClick={onSignIn} variant="outline" className="w-full">Sign In</Button>
            <Link href="/auth/signup" passHref>
              <Button className="w-full">Sign Up</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Title at the bottom of the sidebar */}
      <div className="mt-auto"> {/* Reverted to unconditional mt-auto */}
        <h1 className="text-2xl font-bold text-center">
          Interview Story Hub
        </h1>
      </div>
    </aside>
  );
};

export default function Home() {
  const { data: session, status } = useSession();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isCreateStoryDialogOpen, setIsCreateStoryDialogOpen] = useState(false);
  const [newStoryData, setNewStoryData] = useState<NewStoryData>({
    title: '',
    shortDescription: '',
    content: '',
  });
  const [createStoryError, setCreateStoryError] = useState<string | null>(null);

  const fetchStories = async () => {
    if (status === "authenticated") {
      setIsLoadingStories(true);
      try {
        const response = await fetch('/api/stories');
        if (!response.ok) {
          throw new Error('Failed to fetch stories');
        }
        const data: Story[] = await response.json();
        setStories(data);
      } catch (error) {
        console.error("Error fetching stories:", error);
        setStories([]); // Set to empty or handle error state appropriately
      } finally {
        setIsLoadingStories(false);
      }
    }
  };

  useEffect(() => {
    fetchStories();
  }, [status, fetchStories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewStoryData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateStorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCreateStoryError(null);
    if (!newStoryData.title || !newStoryData.shortDescription || !newStoryData.content) {
      setCreateStoryError("All fields are required.");
      return;
    }

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStoryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to create story. Please try again." }));
        throw new Error(errorData.message || "Failed to create story.");
      }

      // const createdStory: Story = await response.json(); // Optionally use this
      setNewStoryData({ title: '', shortDescription: '', content: '' }); // Reset form
      setIsCreateStoryDialogOpen(false); // Close dialog
      await fetchStories(); // Refresh stories list

    } catch (error) {
      console.error("Error creating story:", error);
      // Changed error: any to error: unknown, and used (error as Error).message
      setCreateStoryError((error as Error).message || "An unexpected error occurred.");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading session...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Pass necessary props to LeftSidebar */}
      <LeftSidebar 
        session={session} 
        status={status} 
        onSignIn={() => signIn()} 
        onSignOut={() => signOut({ callbackUrl: '/' })}
        onCreateStoryOpen={() => setIsCreateStoryDialogOpen(true)}
        selectedStory={selectedStory}
      />

      {/* Create Story Dialog - remains at this level to be controlled by isCreateStoryDialogOpen */}
      {isCreateStoryDialogOpen && (
          <Dialog open={isCreateStoryDialogOpen} onOpenChange={setIsCreateStoryDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Interview Story</DialogTitle>
                <DialogDescription>
                  Fill in the details for your new story. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateStorySubmit} className="grid gap-4 py-4">
                {createStoryError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
                    {createStoryError}
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    name="title"
                    value={newStoryData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., My FAANG Interview Experience"
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shortDescription">Short Description (Max 200 chars)</Label>
                  <Textarea 
                    id="shortDescription" 
                    name="shortDescription"
                    value={newStoryData.shortDescription}
                    onChange={handleInputChange}
                    placeholder="A brief summary of your story..."
                    maxLength={200}
                    rows={3}
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Full Story Content</Label>
                  <Textarea 
                    id="content" 
                    name="content"
                    value={newStoryData.content}
                    onChange={handleInputChange}
                    placeholder="Describe your interview experience in detail..."
                    rows={10}
                    required 
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Save Story</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
      )}

      <main className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Area for selected story content */}
        {selectedStory && (
          <div className="p-4 border rounded-lg shadow-lg bg-card overflow-y-auto mb-4 flex-shrink-0 max-h-[65vh]">
            <div className="prose max-w-none">
              {selectedStory.content.split('\\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
             <Button onClick={() => setSelectedStory(null)} variant="outline" className="mt-4">Close Story</Button>
          </div>
        )}

        {/* Stories Grid - always visible if there's no selected story, or below selected story */}
        <div className="flex-1 overflow-y-auto">
          {status === "authenticated" ? (
            <>
              {!selectedStory && ( // Only show this header if no story is selected
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-semibold">Your Interview Stories</h2>
                  <p className="text-muted-foreground">
                    Click on a story to view its full content above, or create a new one using the sidebar.
                  </p>
                </div>
              )}
              {isLoadingStories ? (
                <div className="text-center py-12">
                  <p>Loading your stories...</p>
                </div>
              ) : stories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {stories.map((story) => (
                    // Remove DialogTrigger and Dialog from here
                    <Button
                      key={story.id}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start text-left hover:shadow-lg transition-shadow duration-200 whitespace-normal break-words"
                      onClick={() => setSelectedStory(story)}
                    >
                      <h3 className="text-md font-semibold mb-1 line-clamp-2">{story.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {story.shortDescription}
                      </p>
                    </Button>
                  ))}
                </div>
              ) : (
                !isLoadingStories && <p className="text-center text-muted-foreground">No stories found. Create one to get started!</p>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-3xl font-semibold mb-2">Welcome to Interview Story Hub</h2>
              <p className="text-muted-foreground mb-6">Sign in or sign up to manage and view interview stories.</p>
              {/* Image can be styled or removed as preferred */}
              <Image src="/next.svg" alt="Next.js Logo" width={180} height={37} priority className="mx-auto mb-4" />
              <div className="flex justify-center gap-4">
                <Button onClick={() => signIn()} size="lg">Get Started</Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
