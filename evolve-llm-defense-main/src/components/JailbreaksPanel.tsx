import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Zap,
  Search,
  ExternalLink,
  BookOpen,
  Sparkles,
  RefreshCw,
  X,
  Plus,
} from "lucide-react";
import { ApiService } from "@/services/api";
import { toast } from "sonner";

interface JailbreakFinding {
  title: string;
  url: string;
  content: string;
  relevance_score: number;
  source_query: string;
  query_category: string;
  timestamp: string;
  citation_string?: string;
  authors?: string[];
  publication_date?: string;
}

interface JailbreaksPanelProps {
  onClose: () => void;
}

const JailbreaksPanel = ({ onClose }: JailbreaksPanelProps) => {
  const [findings, setFindings] = useState<JailbreakFinding[]>([]);
  const [filteredFindings, setFilteredFindings] = useState<JailbreakFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newJailbreak, setNewJailbreak] = useState({
    title: "",
    content: "",
    url: "",
    category: "custom_jailbreaks",
  });

  useEffect(() => {
    loadJailbreaks();
  }, []);

  useEffect(() => {
    // Filter findings based on search and category
    let filtered = findings;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.title.toLowerCase().includes(query) ||
          f.content.toLowerCase().includes(query) ||
          f.query_category.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((f) => f.query_category === selectedCategory);
    }

    setFilteredFindings(filtered);
  }, [findings, searchQuery, selectedCategory]);

  const loadJailbreaks = async () => {
    try {
      setLoading(true);
      const apiService = ApiService.getInstance();
      const response = await apiService.getJailbreaks();
      setFindings(response.findings || []);
    } catch (error) {
      console.error("Failed to load jailbreaks:", error);
      toast.error("Failed to load jailbreaks");
    } finally {
      setLoading(false);
    }
  };

  const discoverNewJailbreaks = async () => {
    try {
      setDiscovering(true);
      toast.info("Starting jailbreak discovery...", {
        description: "This may take a few minutes. Searching research papers and techniques.",
      });

      const apiService = ApiService.getInstance();
      const response = await apiService.discoverJailbreaks();

      // Poll for completion
      const discoveryId = response.discovery_id;
      const pollInterval = setInterval(async () => {
        try {
          const status = await apiService.getDiscoveryStatus(discoveryId);

          if (status.status === "completed") {
            clearInterval(pollInterval);
            setDiscovering(false);
            toast.success(`Discovery complete!`, {
              description: `Found ${status.findings_count} new jailbreak techniques.`,
            });
            await loadJailbreaks();
          } else if (status.status === "failed") {
            clearInterval(pollInterval);
            setDiscovering(false);
            toast.error("Discovery failed", {
              description: status.error || "Unknown error",
            });
          }
        } catch (error) {
          clearInterval(pollInterval);
          setDiscovering(false);
          console.error("Error polling discovery status:", error);
        }
      }, 3000);
    } catch (error) {
      setDiscovering(false);
      console.error("Failed to start discovery:", error);
      toast.error("Failed to start discovery");
    }
  };

  const saveCustomJailbreak = async () => {
    if (!newJailbreak.title || !newJailbreak.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const apiService = ApiService.getInstance();
      await apiService.saveCustomJailbreak({
        ...newJailbreak,
        timestamp: new Date().toISOString(),
        relevance_score: 1.0,
        source_query: "custom",
        query_category: "custom_jailbreaks",
      });

      toast.success("Custom jailbreak saved!");
      setShowAddDialog(false);
      setNewJailbreak({ title: "", content: "", url: "", category: "custom_jailbreaks" });
      await loadJailbreaks();
    } catch (error) {
      console.error("Failed to save custom jailbreak:", error);
      toast.error("Failed to save jailbreak");
    }
  };

  const categories = Array.from(
    new Set(findings.map((f) => f.query_category))
  ).sort();

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      foundational_research: "border-blue-500/50 text-blue-500",
      attack_techniques: "border-red-500/50 text-red-500",
      model_specific: "border-purple-500/50 text-purple-500",
      defense_mechanisms: "border-green-500/50 text-green-500",
      prompt_injection: "border-orange-500/50 text-orange-500",
      red_teaming: "border-yellow-500/50 text-yellow-500",
    };
    return colors[category] || "border-gray-500/50 text-gray-500";
  };

  return (
    <div className="w-[500px] glass border-l border-border/50 flex flex-col animate-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                Jailbreak Library
              </h2>
              <p className="text-xs text-muted-foreground">
                Research-backed attack techniques
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={discoverNewJailbreaks}
              disabled={discovering}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {discovering ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Discovering...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Discover New
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddDialog(true)}
              variant="outline"
              className="glass"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jailbreak techniques..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass border-border/50 focus:border-accent/50"
          />
        </div>

        {/* Category Filters */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer glass"
            onClick={() => setSelectedCategory(null)}
          >
            All ({findings.length})
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer glass ${
                selectedCategory === category ? getCategoryColor(category) : ""
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.replace(/_/g, " ")} (
              {findings.filter((f) => f.query_category === category).length})
            </Badge>
          ))}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
                <Zap className="absolute inset-0 m-auto w-8 h-8 text-accent/50" />
              </div>
              <p className="text-sm text-muted-foreground">Loading jailbreak library...</p>
            </div>
          </div>
        ) : filteredFindings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">No jailbreaks found</p>
            <p className="text-sm text-muted-foreground/70">
              {findings.length === 0
                ? "Click 'Discover New' to find jailbreak techniques"
                : "Try adjusting your search filters"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFindings.map((finding, idx) => (
              <Card
                key={idx}
                className="glass p-4 border-border/50 hover:border-accent/50 transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-medium text-sm leading-tight group-hover:text-accent transition-colors">
                    {finding.title}
                  </h3>
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getCategoryColor(finding.query_category)}`}
                    >
                      {finding.query_category.replace(/_/g, " ")}
                    </Badge>
                    {finding.url && (
                      <a
                        href={finding.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-accent/10 rounded transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-accent" />
                      </a>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3 line-clamp-3">
                  {finding.content}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {finding.relevance_score && (
                      <Badge variant="outline" className="glass text-xs">
                        {(finding.relevance_score * 100).toFixed(0)}% relevant
                      </Badge>
                    )}
                    {finding.authors && finding.authors.length > 0 && (
                      <span className="text-muted-foreground">
                        {finding.authors[0]}
                        {finding.authors.length > 1 && ` +${finding.authors.length - 1}`}
                      </span>
                    )}
                  </div>
                  {finding.publication_date && (
                    <span className="text-muted-foreground">
                      {new Date(finding.publication_date).getFullYear()}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Add Custom Jailbreak Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl glass">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-accent" />
              Add Custom Jailbreak
            </DialogTitle>
            <DialogDescription>
              Add your own jailbreak technique or research finding to the library
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., DAN (Do Anything Now) Prompt"
                value={newJailbreak.title}
                onChange={(e) => setNewJailbreak({ ...newJailbreak, title: e.target.value })}
                className="glass"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Description/Content *</Label>
              <Textarea
                id="content"
                placeholder="Describe the jailbreak technique, how it works, and when to use it..."
                value={newJailbreak.content}
                onChange={(e) => setNewJailbreak({ ...newJailbreak, content: e.target.value })}
                className="glass min-h-[150px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Source URL (optional)</Label>
              <Input
                id="url"
                placeholder="https://..."
                value={newJailbreak.url}
                onChange={(e) => setNewJailbreak({ ...newJailbreak, url: e.target.value })}
                className="glass"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="glass"
              >
                Cancel
              </Button>
              <Button
                onClick={saveCustomJailbreak}
                className="bg-accent hover:bg-accent/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Save Jailbreak
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JailbreaksPanel;
