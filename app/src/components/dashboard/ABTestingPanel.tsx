import { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  Pause, 
  TrendingUp, 
  Users, 
  Eye, 
  ThumbsUp,
  BarChart3,
  Split,
  CheckCircle2,
  RotateCcw,
  Zap,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/motion';

interface Variant {
  id: string;
  name: string;
  thumbnail: string;
  engagement: number;
  views: number;
  ctr: number;
  conversions: number;
  confidence: number;
}

interface ABTest {
  id: string;
  contentId: string;
  contentTitle: string;
  status: 'running' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  totalReach: number;
  variants: Variant[];
  winner?: string;
}

const mockTests: ABTest[] = [
  {
    id: 'test-1',
    contentId: 'content-1',
    contentTitle: 'Summer Sale Announcement',
    status: 'running',
    startDate: '2024-01-15',
    totalReach: 15420,
    variants: [
      {
        id: 'variant-a',
        name: 'Variant A - Bold CTA',
        thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=150&fit=crop',
        engagement: 8.4,
        views: 7710,
        ctr: 4.2,
        conversions: 324,
        confidence: 78
      },
      {
        id: 'variant-b',
        name: 'Variant B - Soft CTA',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=150&fit=crop',
        engagement: 11.2,
        views: 7710,
        ctr: 5.8,
        conversions: 447,
        confidence: 89
      }
    ]
  },
  {
    id: 'test-2',
    contentId: 'content-2',
    contentTitle: 'Product Launch Teaser',
    status: 'completed',
    startDate: '2024-01-10',
    endDate: '2024-01-14',
    totalReach: 28300,
    winner: 'variant-c',
    variants: [
      {
        id: 'variant-c',
        name: 'Video Version',
        thumbnail: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=200&h=150&fit=crop',
        engagement: 15.7,
        views: 14150,
        ctr: 7.3,
        conversions: 1033,
        confidence: 95
      },
      {
        id: 'variant-d',
        name: 'Image Carousel',
        thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=150&fit=crop',
        engagement: 9.2,
        views: 14150,
        ctr: 4.1,
        conversions: 580,
        confidence: 95
      }
    ]
  }
];



export function ABTestingPanel() {
  const [tests, setTests] = useState<ABTest[]>(mockTests);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(mockTests[0]);

  const toggleTestStatus = (testId: string) => {
    setTests(tests.map(test => 
      test.id === testId 
        ? { ...test, status: test.status === 'running' ? 'paused' : 'running' }
        : test
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><Play className="w-3 h-3 mr-1" /> Running</Badge>;
      case 'paused': return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Pause className="w-3 h-3 mr-1" /> Paused</Badge>;
      case 'completed': return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</Badge>;
    }
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
          { icon: FlaskConical, label: 'Active Tests', value: '3', color: 'text-purple-400', bg: 'bg-purple-500/20' },
          { icon: Target, label: 'Total Variants', value: '8', color: 'text-blue-400', bg: 'bg-blue-500/20' },
          { icon: Users, label: 'Test Reach', value: '45.2K', color: 'text-green-400', bg: 'bg-green-500/20' },
          { icon: TrendingUp, label: 'Avg Lift', value: '+23%', color: 'text-orange-400', bg: 'bg-orange-500/20' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test List */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-4"
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-400" />
                Active Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tests.map((test) => (
                <motion.div
                  key={test.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedTest(test)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedTest?.id === test.id 
                      ? 'bg-purple-500/20 border border-purple-500/50' 
                      : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-slate-200 text-sm">{test.contentTitle}</h4>
                    {getStatusBadge(test.status)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Split className="w-3 h-3" />
                      {test.variants.length} variants
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {(test.totalReach / 1000).toFixed(1)}K reach
                    </span>
                  </div>
                </motion.div>
              ))}

              <Button 
                variant="outline" 
                className="w-full border-dashed border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-500"
              >
                <Zap className="w-4 h-4 mr-2" />
                Create New Test
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Test Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <AnimatePresence mode="wait">
            {selectedTest && (
              <motion.div
                key={selectedTest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{selectedTest.contentTitle}</CardTitle>
                        <p className="text-sm text-slate-400 mt-1">
                          Started {selectedTest.startDate} • {selectedTest.totalReach.toLocaleString()} total reach
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {selectedTest.status !== 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTestStatus(selectedTest.id)}
                            className="border-slate-600"
                          >
                            {selectedTest.status === 'running' ? (
                              <><Pause className="w-4 h-4 mr-1" /> Pause</>
                            ) : (
                              <><Play className="w-4 h-4 mr-1" /> Resume</>
                            )}
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="border-slate-600">
                          <RotateCcw className="w-4 h-4 mr-1" /> Restart
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="comparison" className="w-full">
                      <TabsList className="bg-slate-800/50 mb-4">
                        <TabsTrigger value="comparison">Comparison</TabsTrigger>
                        <TabsTrigger value="metrics">Metrics</TabsTrigger>
                        <TabsTrigger value="timeline">Timeline</TabsTrigger>
                      </TabsList>

                      <TabsContent value="comparison" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {selectedTest.variants.map((variant, idx) => (
                            <motion.div
                              key={variant.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className={`relative p-4 rounded-xl border-2 ${
                                selectedTest.winner === variant.id
                                  ? 'border-green-500 bg-green-500/10'
                                  : 'border-slate-700 bg-slate-800/50'
                              }`}
                            >
                              {selectedTest.winner === variant.id && (
                                <div className="absolute -top-3 left-4">
                                  <Badge className="bg-green-500 text-white">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Winner
                                  </Badge>
                                </div>
                              )}
                              
                              <img 
                                src={variant.thumbnail} 
                                alt={variant.name}
                                className="w-full h-32 object-cover rounded-lg mb-3"
                              />
                              <h5 className="font-medium text-slate-200 mb-3">{variant.name}</h5>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-400">Engagement</span>
                                  <span className="text-slate-200 font-medium">{variant.engagement}%</span>
                                </div>
                                <Progress value={variant.engagement * 5} className="h-2" />
                                
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-400">CTR</span>
                                  <span className="text-slate-200 font-medium">{variant.ctr}%</span>
                                </div>
                                <Progress value={variant.ctr * 10} className="h-2" />
                                
                                <div className="flex justify-between text-sm pt-2">
                                  <span className="text-slate-400">Confidence</span>
                                  <span className={`font-medium ${
                                    variant.confidence >= 90 ? 'text-green-400' : 
                                    variant.confidence >= 70 ? 'text-yellow-400' : 'text-orange-400'
                                  }`}>{variant.confidence}%</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="metrics">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {selectedTest.variants.map((variant) => (
                            <div key={variant.id} className="space-y-4">
                              <h5 className="font-medium text-slate-300 text-sm">{variant.name}</h5>
                              
                              <Card className="bg-slate-800/50 border-slate-700">
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Eye className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs text-slate-400">Views</span>
                                  </div>
                                  <p className="text-lg font-bold text-slate-200">{variant.views.toLocaleString()}</p>
                                </CardContent>
                              </Card>
                              
                              <Card className="bg-slate-800/50 border-slate-700">
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <ThumbsUp className="w-4 h-4 text-pink-400" />
                                    <span className="text-xs text-slate-400">Engagement</span>
                                  </div>
                                  <p className="text-lg font-bold text-slate-200">{variant.engagement}%</p>
                                </CardContent>
                              </Card>
                              
                              <Card className="bg-slate-800/50 border-slate-700">
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <BarChart3 className="w-4 h-4 text-green-400" />
                                    <span className="text-xs text-slate-400">Conversions</span>
                                  </div>
                                  <p className="text-lg font-bold text-slate-200">{variant.conversions}</p>
                                </CardContent>
                              </Card>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="timeline">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                              <Play className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-200">Test Started</p>
                              <p className="text-sm text-slate-400">{selectedTest.startDate}</p>
                            </div>
                            <Badge variant="outline" className="border-green-500/50 text-green-400">Completed</Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-200">Reached 1,000 views</p>
                              <p className="text-sm text-slate-400">Day 2 • Statistical significance achieved</p>
                            </div>
                            <Badge variant="outline" className="border-blue-500/50 text-blue-400">Milestone</Badge>
                          </div>
                          
                          {selectedTest.winner && (
                            <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-green-400">Winner Declared</p>
                                <p className="text-sm text-slate-400">{selectedTest.variants.find(v => v.id === selectedTest.winner)?.name}</p>
                              </div>
                              <Badge className="bg-green-500 text-white">Winner</Badge>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
