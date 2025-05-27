import Image from "next/image";

function DemoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <h4 className="font-medium mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function DemoSection() {
  return (
    <section className="py-20 px-4 sm:px-6 md:px-8 bg-secondary/10">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">Beautiful, intuitive interface</h2>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
            Interact with your GitHub data through a thoughtfully designed dashboard
          </p>
        </div>
       
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="rounded-xl overflow-hidden shadow-xl flex flex-col justify-center">
            <div className="aspect-[16/9] relative bg-card/50 overflow-hidden flex items-center justify-center  object-contain scale-105">
              <Image 
                src="/thumbnail.png" 
                alt="Dashboard Visualization" 
                fill
                className="object-contain" 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
                priority={false}
              />
            </div>
          </div>
         
          <div className="space-y-6 flex flex-col justify-center">
            <h3 className="text-2xl font-bold">Powerful dashboard at your fingertips</h3>
            <p className="text-muted-foreground">
              Gain insights into your GitHub activity with our interactive dashboard. Filter by repository,
              PR status, or search for specific contributions. View trends over time and see how your work impacts projects.
            </p>
           
            <div className="grid grid-cols-2 gap-4">
              <DemoCard
                title="PR Summary"
                description="Quick stats on open, merged, and closed PRs"
              />
              <DemoCard
                title="Activity Graph"
                description="Visual timeline of your contributions"
              />
              <DemoCard
                title="PR Listing"
                description="Detailed view of all your pull requests"
              />
              <DemoCard
                title="Profile Export"
                description="Shareable view of your work"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}