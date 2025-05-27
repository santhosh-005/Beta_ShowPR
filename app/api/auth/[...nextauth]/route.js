import NextAuth from "next-auth/next";
import GithubProvider from "next-auth/providers/github";

const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: "read:user user:email repo pull_request",
      authorization: {
        params: {
          prompt: "login",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token;
 
        token.github = {
          login: profile.login, // GitHub username
          avatar_url: profile.avatar_url, // Profile picture URL
          html_url: profile.html_url,  // Profile URL
          name: profile.name, // Full name
          email: profile.email, // Email address
          bio: profile.bio, // Bio
          public_repos: profile.public_repos, // Public repositories count
          followers: profile.followers, // Followers count
        };
      }
      return token;
    },
 
    async session({ session, token }) {
      session.github = token.github;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };