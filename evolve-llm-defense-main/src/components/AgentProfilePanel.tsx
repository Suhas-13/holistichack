import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Shield,
  AlertTriangle,
  TrendingUp,
  Activity,
  Zap,
  Target,
  Lock,
  Unlock,
  Eye,
  MessageSquare,
  Wrench,
  Download,
} from "lucide-react";
import { ApiService } from "@/services/api";

interface AgentProfile {
  target_endpoint: string;
  total_attacks_analyzed: number;

  // Scores
  success_rate_against_attacks: number;
  overall_vulnerability_score: number;
  defense_strength_score: number;
  behavioral_consistency: number;
  consistency_score: number;

  // Tool usage
  tool_usage_patterns: Array<{
    tool_name: string;
    total_invocations: number;
    success_rate_when_used: number;
    purpose: string;
    effectiveness: number;
  }>;
  most_used_tools: string[];
  total_tool_calls: number;

  // Behaviors
  behavior_patterns: Array<{
    pattern_name: string;
    description: string;
    observed_count: number;
    pattern_type: string;
    confidence: number;
    exploitability: number;
    implications: string;
  }>;
  dominant_behaviors: string[];

  // Failures
  failure_modes: Array<{
    failure_type: string;
    description: string;
    occurrence_count: number;
    success_rate: number;
    severity: string;
    common_triggers: string[];
    mitigation_suggestions: string[];
  }>;
  critical_vulnerabilities: string[];

  // Defenses
  defense_mechanisms: Array<{
    mechanism_type: string;
    description: string;
    detection_rate: number;
    strength: string;
    known_bypasses: string[];
    bypass_success_rate: number;
  }>;

  // Response patterns
  response_patterns: {
    avg_response_length: number;
    tone: string;
    personality_traits: string[];
    common_phrases: string[];
  };

  // LLM insights
  psychological_profile: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  overall_assessment: string;
}

interface AgentProfilePanelProps {
  attackId: string | null;
  onClose: () => void;
}

const AgentProfilePanel = ({ attackId, onClose }: AgentProfilePanelProps) => {
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!attackId) return;

      try {
        setLoading(true);
        setError(null);
        const apiService = ApiService.getInstance();
        const response = await apiService.getAttackResults(attackId);

        // Extract profile from session metadata
        const profileData = response.session?.metadata?.target_agent_profile;
        if (profileData) {
          setProfile(profileData);
        } else {
          setError("Profile data not yet available. The attack may still be processing.");
        }
      } catch (error) {
        console.error("Failed to load agent profile:", error);
        setError(error instanceof Error ? error.message : "Failed to load agent profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [attackId]);

  if (loading) {
    return (
      <div className="w-[500px] glass border-l border-border/50 p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <Eye className="absolute inset-0 m-auto w-8 h-8 text-primary/50" />
            </div>
            <p className="text-sm text-muted-foreground">Analyzing agent psyche...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[600px] glass border-l border-border/50 p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to Load Profile</h3>
          <p className="text-sm text-muted-foreground max-w-md">{error}</p>
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 glass rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-[600px] glass border-l border-border/50 p-6">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Brain className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No agent profile available yet.</p>
          <p className="text-sm text-muted-foreground/70 mt-2">
            Complete an attack to generate a profile.
          </p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/50";
      case "high":
        return "text-orange-500 bg-orange-500/10 border-orange-500/50";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/50";
      case "low":
        return "text-blue-500 bg-blue-500/10 border-blue-500/50";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/50";
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength.toLowerCase()) {
      case "strong":
        return "text-green-500";
      case "moderate":
        return "text-yellow-500";
      case "weak":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const exportProfile = () => {
    if (!profile) return;

    const dataStr = JSON.stringify(profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `agent-profile-${attackId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-[600px] glass border-l border-border/50 overflow-hidden flex flex-col animate-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Agent Glass Box
              </h2>
              <p className="text-xs text-muted-foreground">Deep Behavioral Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportProfile}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors group"
              title="Export profile as JSON"
            >
              <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="glass p-4 border-border/50">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-2xl font-bold text-green-500">
                {(profile.success_rate_against_attacks * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Defense Rate</p>
          </Card>

          <Card className="glass p-4 border-border/50">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-2xl font-bold text-red-500">
                {(profile.overall_vulnerability_score * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Vulnerability</p>
          </Card>

          <Card className="glass p-4 border-border/50">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-2xl font-bold text-blue-500">
                {(profile.behavioral_consistency * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Consistency</p>
          </Card>

          <Card className="glass p-4 border-border/50">
            <div className="flex items-center justify-between mb-2">
              <Lock className="w-4 h-4 text-purple-500" />
              <span className="text-2xl font-bold text-purple-500">
                {(profile.defense_strength_score * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Defense Strength</p>
          </Card>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="glass grid grid-cols-5 w-full">
            <TabsTrigger value="overview" className="gap-2">
              <Brain className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tools" className="gap-2">
              <Wrench className="w-4 h-4" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="behaviors" className="gap-2">
              <Activity className="w-4 h-4" />
              Behaviors
            </TabsTrigger>
            <TabsTrigger value="vulnerabilities" className="gap-2">
              <Unlock className="w-4 h-4" />
              Weaknesses
            </TabsTrigger>
            <TabsTrigger value="defenses" className="gap-2">
              <Shield className="w-4 h-4" />
              Defenses
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Psychological Profile */}
            <Card className="glass p-5 border-border/50 space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Psychological Profile</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile.psychological_profile || "No psychological profile available."}
              </p>

              <div className="pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium">Communication Style</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="glass">
                    {profile.response_patterns.tone || "Unknown"}
                  </Badge>
                  {profile.response_patterns.personality_traits.map((trait) => (
                    <Badge key={trait} variant="outline" className="glass">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>

            {/* Assessment */}
            <Card className="glass p-5 border-border/50 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Overall Assessment</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile.overall_assessment || "No assessment available."}
              </p>
            </Card>

            {/* Strengths */}
            <Card className="glass p-5 border-border/50 space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">Strengths</h3>
              </div>
              <div className="space-y-2">
                {profile.strengths.map((strength, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                    <p className="text-sm text-muted-foreground flex-1">{strength}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Weaknesses */}
            <Card className="glass p-5 border-border/50 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold">Critical Weaknesses</h3>
              </div>
              <div className="space-y-2">
                {profile.weaknesses.map((weakness, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2" />
                    <p className="text-sm text-muted-foreground flex-1">{weakness}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="glass p-5 border-border/50 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold">Recommendations</h3>
              </div>
              <div className="space-y-2">
                {profile.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full glass flex items-center justify-center text-xs font-bold text-primary mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-sm text-muted-foreground flex-1">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground">
                Total tool calls: {profile.total_tool_calls}
              </p>
              <p className="text-xs text-muted-foreground">
                Unique tools: {profile.tool_usage_patterns.length}
              </p>
            </div>

            {profile.most_used_tools.length > 0 && (
              <Card className="glass p-4 border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <h4 className="text-sm font-semibold">Most Used Tools</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.most_used_tools.map((tool, i) => (
                    <Badge key={i} variant="outline" className="glass border-primary/30 text-primary">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {profile.tool_usage_patterns.length > 0 ? (
              <div className="space-y-3">
                {profile.tool_usage_patterns.map((tool, i) => (
                  <Card
                    key={i}
                    className="glass p-4 border-border/50 space-y-3 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Wrench className="w-4 h-4 text-primary" />
                          <h4 className="font-medium">{tool.tool_name}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">{tool.purpose}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Invocations</p>
                        <p className="text-2xl font-bold text-primary">{tool.total_invocations}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Success Rate</p>
                        <div className="space-y-1">
                          <Progress value={tool.success_rate_when_used * 100} className="h-2" />
                          <p className="text-xs font-medium text-right">
                            {(tool.success_rate_when_used * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Effectiveness</p>
                        <div className="space-y-1">
                          <Progress value={tool.effectiveness * 100} className="h-2" />
                          <p className="text-xs font-medium text-right">
                            {(tool.effectiveness * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass p-6 border-border/50 text-center">
                <Wrench className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No tool usage data available</p>
              </Card>
            )}
          </TabsContent>

          {/* Behaviors Tab */}
          <TabsContent value="behaviors" className="space-y-4">
            <p className="text-xs text-muted-foreground mb-3">
              Detected: {profile.behavior_patterns.length} behavioral patterns
            </p>
            {profile.behavior_patterns.map((behavior, i) => (
              <Card
                key={i}
                className="glass p-5 border-border/50 space-y-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{behavior.pattern_name}</h4>
                    <p className="text-sm text-muted-foreground">{behavior.description}</p>
                  </div>
                  <Badge variant="outline" className={`ml-2 ${
                    behavior.pattern_type === "vulnerable" ? "border-red-500/50 text-red-500" :
                    behavior.pattern_type === "defensive" ? "border-green-500/50 text-green-500" :
                    "border-blue-500/50 text-blue-500"
                  }`}>
                    {behavior.pattern_type}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Confidence</p>
                    <Progress value={behavior.confidence * 100} className="h-2" />
                    <p className="text-right mt-1 font-medium">{(behavior.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Exploitability</p>
                    <Progress value={behavior.exploitability * 100} className="h-2" />
                    <p className="text-right mt-1 font-medium">{(behavior.exploitability * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Observed</p>
                    <p className="text-2xl font-bold text-primary">{behavior.observed_count}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground italic">{behavior.implications}</p>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Vulnerabilities Tab */}
          <TabsContent value="vulnerabilities" className="space-y-4">
            <p className="text-xs text-muted-foreground mb-3">
              Identified: {profile.failure_modes.length} failure modes
            </p>
            {profile.failure_modes.map((failure, i) => (
              <Card
                key={i}
                className={`glass p-5 border space-y-3 ${getSeverityColor(failure.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{failure.failure_type.replace(/_/g, " ").toUpperCase()}</h4>
                      <Badge variant="outline" className={getSeverityColor(failure.severity)}>
                        {failure.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{failure.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Occurrences</p>
                    <p className="text-2xl font-bold">{failure.occurrence_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Success Rate</p>
                    <p className="text-2xl font-bold">{(failure.success_rate * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {failure.common_triggers.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2">Common Triggers:</p>
                    <div className="flex flex-wrap gap-1">
                      {failure.common_triggers.map((trigger, j) => (
                        <Badge key={j} variant="outline" className="text-xs glass">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {failure.mitigation_suggestions.length > 0 && (
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-xs font-medium mb-2">Mitigations:</p>
                    <div className="space-y-1">
                      {failure.mitigation_suggestions.map((suggestion, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <div className="w-1 h-1 rounded-full bg-current mt-2" />
                          <p className="text-xs text-muted-foreground flex-1">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>

          {/* Defenses Tab */}
          <TabsContent value="defenses" className="space-y-4">
            <p className="text-xs text-muted-foreground mb-3">
              Active: {profile.defense_mechanisms.length} defense mechanisms
            </p>
            {profile.defense_mechanisms.map((defense, i) => (
              <Card
                key={i}
                className="glass p-5 border-border/50 space-y-3 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-primary" />
                      <h4 className="font-medium">{defense.mechanism_type.replace(/_/g, " ").toUpperCase()}</h4>
                      <Badge variant="outline" className={getStrengthColor(defense.strength)}>
                        {defense.strength}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{defense.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Detection Rate</p>
                    <div className="space-y-1">
                      <Progress value={defense.detection_rate * 100} className="h-2" />
                      <p className="text-xs font-medium text-right">{(defense.detection_rate * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Bypass Rate</p>
                    <div className="space-y-1">
                      <Progress value={defense.bypass_success_rate * 100} className="h-2" />
                      <p className="text-xs font-medium text-right">{(defense.bypass_success_rate * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                {defense.known_bypasses.length > 0 && (
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-xs font-medium mb-2">Known Bypasses:</p>
                    <div className="flex flex-wrap gap-1">
                      {defense.known_bypasses.map((bypass, j) => (
                        <Badge key={j} variant="outline" className="text-xs glass border-red-500/30 text-red-500">
                          {bypass}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentProfilePanel;
