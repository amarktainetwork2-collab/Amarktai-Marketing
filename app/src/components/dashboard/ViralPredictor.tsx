import { useState } from 'react';
import { 
  Flame, 
  TrendingUp, 
  Zap, 
  Target,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Share2,
  Heart,
  RefreshCw,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/motion';

interface ViralScore {
  overall: number;
  hookStrength: number;
  emotionalImpact: number;
  shareability: number;
  timing: number;
  uniqueness: number;
}

interface ViralPrediction {
  score: ViralScore;
  viralProbability: number;
  estimatedReach: number;
  timeToViral: string;
  factors: {
    positive: string[];
    negative: string[];
  };
  recommendations: string[];
}

const mockPrediction: ViralPrediction = {
  score: {
    overall: 87,
    hookStrength: 92,
    emotionalImpact: 85,
    shareability: 88,
    timing: 78,
    uniqueness: 90
  },
  viralProbability: 73,
  estimatedReach: 125000,
  timeToViral: '24-48 hours',
  factors: {
    positive: [
      'Strong emotional hook in first 3 seconds',
      'Trending audio/sound usage detected',
      'Optimal video length for platform',
      'High-contrast visuals'
    ],
    negative: [
      'Posting time not optimal',
      'Hashtag count below recommended'
    ]
  },
  recommendations: [
    'Add 3-5 more trending hashtags',
    'Post at 6-8 PM for maximum reach',
    'Include a clear CTA in caption',
    'Consider adding text overlay'
  ]
};



export function ViralPredictor() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<ViralPrediction | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const analyzeContent = () => {
    setIsAnalyzing(true);
    setShowAnimation(true);
    
    setTimeout(() => {
      setPrediction(mockPrediction);
      setIsAnalyzing(false);
      setTimeout(() => setShowAnimation(false), 1000);
    }, 2500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getViralBadge = (probability: number) => {
    if (probability >= 70) return { text: 'High Viral Potential', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    if (probability >= 40) return { text: 'Moderate Potential', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    return { text: 'Low Viral Potential', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Flame, label: 'Viral Posts', value: '23', color: 'text-orange-400', bg: 'bg-orange-500/20' },
          { icon: TrendingUp, label: 'Avg Viral Score', value: '78', color: 'text-green-400', bg: 'bg-green-500/20' },
          { icon: Rocket, label: 'Viral Reach', value: '2.4M', color: 'text-purple-400', bg: 'bg-purple-500/20' },
          { icon: Zap, label: 'Time to Viral', value: '18h', color: 'text-blue-400', bg: 'bg-blue-500/20' },
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {!prediction ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
            <CardContent className="p-12 text-center">
              <motion.div 
                animate={showAnimation ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
              >
                <Flame className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-slate-200 mb-2">
                Viral Content Predictor
              </h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Our AI analyzes your content across 50+ viral factors to predict its potential to go viral and provides actionable recommendations.
              </p>
              <Button
                onClick={analyzeContent}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Viral Factors...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze Viral Potential
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Score Card */}
            <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    Viral Analysis Results
                  </CardTitle>
                  <Badge className={getViralBadge(prediction.viralProbability).color}>
                    {getViralBadge(prediction.viralProbability).text}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-700"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        initial={{ strokeDashoffset: `${2 * Math.PI * 56}` }}
                        animate={{ strokeDashoffset: `${2 * Math.PI * 56 * (1 - prediction.score.overall / 100)}` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={getScoreColor(prediction.score.overall)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${getScoreColor(prediction.score.overall)}`}>
                        {prediction.score.overall}
                      </span>
                      <span className="text-xs text-slate-400">Viral Score</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Rocket className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-slate-400">Est. Reach</span>
                        </div>
                        <p className="text-xl font-bold text-slate-200">
                          {(prediction.estimatedReach / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div className="p-3 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-slate-400">Time to Viral</span>
                        </div>
                        <p className="text-xl font-bold text-slate-200">{prediction.timeToViral}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Viral Probability</span>
                        <span className="text-sm font-medium text-slate-200">{prediction.viralProbability}%</span>
                      </div>
                      <Progress value={prediction.viralProbability} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { label: 'Hook', score: prediction.score.hookStrength, icon: Target },
                    { label: 'Emotion', score: prediction.score.emotionalImpact, icon: Heart },
                    { label: 'Shareable', score: prediction.score.shareability, icon: Share2 },
                    { label: 'Timing', score: prediction.score.timing, icon: Zap },
                    { label: 'Unique', score: prediction.score.uniqueness, icon: Sparkles },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-3 bg-slate-800/50 rounded-lg">
                      <item.icon className={`w-5 h-5 mx-auto mb-2 ${getScoreColor(item.score)}`} />
                      <p className="text-2xl font-bold {getScoreColor(item.score)}">{item.score}</p>
                      <p className="text-xs text-slate-400">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Positive Factors */}
              <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Viral Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prediction.factors.positive.map((factor, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2 text-sm text-slate-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        {factor}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Areas to Improve */}
              <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-yellow-400">
                    <AlertCircle className="w-4 h-4" />
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prediction.factors.negative.map((factor, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2 text-sm text-slate-300"
                      >
                        <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        {factor}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-400">
                    <Sparkles className="w-4 h-4" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prediction.recommendations.map((rec, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2 text-sm text-slate-300"
                      >
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        {rec}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Button
                onClick={() => setPrediction(null)}
                variant="outline"
                className="w-full border-slate-600 text-slate-400 hover:text-slate-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Analyze New Content
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
