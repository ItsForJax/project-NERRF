import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload, Search, Database, Zap, Shield, Code2,
  Star, GitFork, Github, ArrowRight, CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const HomePage = () => {
  const [githubData, setGithubData] = useState({ stars: 0, forks: 0 });

  useEffect(() => {
    // Fetch GitHub repo data
    // Note: This may fail due to CORS in local development
    fetch('https://api.github.com/repos/ItsForJax/project-NERRF')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setGithubData({
          stars: data.stargazers_count || 0,
          forks: data.forks_count || 0
        });
      })
      .catch(err => {
        // Fallback to placeholder values if GitHub API fails (CORS in dev)
        console.log('GitHub API unavailable (CORS), using placeholder data');
        setGithubData({ stars: '⭐', forks: '🍴' });
      });
  }, []);

  const techStack = [
    { name: 'Nginx', icon: '🌐', color: 'text-green-500', desc: 'Reverse Proxy' },
    { name: 'Elasticsearch', icon: '🔍', color: 'text-yellow-500', desc: 'Search Engine' },
    { name: 'React', icon: '⚛️', color: 'text-blue-500', desc: 'Frontend' },
    { name: 'Redis', icon: '📮', color: 'text-red-500', desc: 'Message Broker' },
    { name: 'FastAPI', icon: '⚡', color: 'text-teal-500', desc: 'Backend API' },
  ];

  const features = [
    {
      icon: Upload,
      title: 'Smart Upload',
      description: 'Upload images with metadata, automatic duplicate detection using SHA256 hashing'
    },
    {
      icon: Search,
      title: 'Powerful Search',
      description: 'Full-text search with Elasticsearch and as-you-type autocomplete functionality'
    },
    {
      icon: Shield,
      title: 'Rate Limiting',
      description: 'IP-based rate limiting (25 uploads per IP) to prevent abuse'
    },
    {
      icon: Zap,
      title: 'Async Processing',
      description: 'Background thumbnail generation with Celery for optimal performance'
    },
    {
      icon: Database,
      title: 'Reliable Storage',
      description: 'PostgreSQL for metadata, filesystem for images, Redis for caching'
    },
    {
      icon: Code2,
      title: 'Modern Stack',
      description: 'Built with FastAPI, React, Docker - production-ready architecture'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span className="animate-pulse mr-2">✨</span>
              Full-Stack Image Platform
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                THE NERRF STACK
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground mb-4 max-w-3xl mx-auto">
              A Full-Stack Image Upload & Search Platform
            </p>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Production-ready application showcasing modern web development with
              microservices, async processing, and full-text search capabilities.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mb-12">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/upload">
                  <Upload className="mr-2 h-5 w-5" />
                  Try Upload
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/search">
                  <Search className="mr-2 h-5 w-5" />
                  Search Images
                </Link>
              </Button>
            </div>

            {/* GitHub Stats */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <a
                href="https://github.com/ItsForJax/project-NERRF"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
                View on GitHub
              </a>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{githubData.stars} stars</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                <span>{githubData.forks} forks</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The NERRF Stack</h2>
            <p className="text-muted-foreground text-lg">
              Built with industry-standard technologies for scalability and performance
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
            {techStack.map((tech, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className={`text-5xl mb-3 ${tech.color}`}>{tech.icon}</div>
                  <h3 className="font-semibold text-lg mb-1">{tech.name}</h3>
                  <p className="text-sm text-muted-foreground">{tech.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Architecture Diagram */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl">System Architecture</CardTitle>
              <CardDescription>Microservices architecture with Docker orchestration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-8 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Frontend */}
                  <div className="space-y-3">
                    <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Frontend Layer</div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                      <div className="font-medium mb-2">React SPA</div>
                      <div className="text-sm text-muted-foreground">
                        • Tailwind CSS<br/>
                        • shadcn/ui<br/>
                        • React Router
                      </div>
                    </div>
                  </div>

                  {/* Backend */}
                  <div className="space-y-3">
                    <div className="font-semibold text-green-600 dark:text-green-400 mb-2">Backend Layer</div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                      <div className="font-medium mb-2">FastAPI</div>
                      <div className="text-sm text-muted-foreground">
                        • REST API<br/>
                        • File Upload<br/>
                        • Rate Limiting
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                      <div className="font-medium mb-2">Celery Worker</div>
                      <div className="text-sm text-muted-foreground">
                        • Async Tasks<br/>
                        • Thumbnails
                      </div>
                    </div>
                  </div>

                  {/* Data Layer */}
                  <div className="space-y-3">
                    <div className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Data Layer</div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                      <div className="font-medium mb-2">PostgreSQL</div>
                      <div className="text-sm text-muted-foreground">Metadata Storage</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                      <div className="font-medium mb-2">Elasticsearch</div>
                      <div className="text-sm text-muted-foreground">Search Engine</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                      <div className="font-medium mb-2">Redis</div>
                      <div className="text-sm text-muted-foreground">Message Broker</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <ArrowRight className="inline h-4 w-4 mx-2" />
                  All services orchestrated with Docker Compose
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-muted-foreground text-lg">
              Enterprise-grade features for modern image management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Try It Out?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start uploading images or explore the search functionality
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8">
              <Link to="/upload">
                <Upload className="mr-2 h-5 w-5" />
                Upload Images
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              <a href="https://github.com/ItsForJax/project-NERRF" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-5 w-5" />
                View Source
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
