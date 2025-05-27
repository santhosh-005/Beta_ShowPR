import "next-auth";

declare module "next-auth" {
    interface Session {
    github?: {
      login: string;
      avatar_url: string;
      html_url: string;
      name: string;
      email: string;
      bio?: string;
      public_repos?: number;
    };
  }
  
  interface Profile {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    name: string;
    email: string;
  }
}