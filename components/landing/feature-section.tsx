import { GitPullRequest, GitMerge, Share2, BarChart3 } from "lucide-react";

const features = [
  {
    icon: <GitPullRequest className="h-10 w-10" />,
    title: "Visualize Your PRs",
    description: "Get a clear view of all your pull requests across repositories with intuitive filtering."
  },
  {
    icon: <BarChart3 className="h-10 w-10" />,
    title: "PR Analytics",
    description: "See trends and patterns in your contribution activity with beautiful charts and stats."
  },
  {
    icon: <GitMerge className="h-10 w-10" />,
    title: "Track Contributions",
    description: "Monitor your open, merged, and closed PRs with real-time updates and summaries."
  },
  {
    icon: <Share2 className="h-10 w-10" />,
    title: "Shareable Profiles",
    description: "Create a public profile to showcase your GitHub contributions on your resume or portfolio."
  }
];

export function FeatureSection() {
  return (
    <section className="py-20 px-4 sm:px-6 md:px-8 bg-background">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">Everything you need to showcase your work</h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            ShowPR provides powerful tools for developers to manage and highlight their contributions.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-card rounded-xl p-6 shadow-sm border border-border transition duration-300 hover:border-primary/50 hover:shadow-md group"
            >
              <div className="p-3 mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}