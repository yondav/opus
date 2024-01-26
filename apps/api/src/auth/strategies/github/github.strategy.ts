// src/auth/strategies/github/github.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile } from 'passport-github';

/**
 * GitHub Authentication Strategy using Passport.
 * Extends the PassportStrategy for GitHub OAuth.
 */
@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  /**
   * Constructor for the GitHubStrategy.
   * Configures the GitHub OAuth strategy with client credentials.
   */
  constructor() {
    super({
      clientID: process.env.GITHUB_OAUTH_CLIENT_ID,
      clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/github/redirect`,
      scope: ['read:user', 'user:email'],
    });
  }

  /**
   * Validate method called when a user is authenticated.
   * PLACEHOLDER
   * @param accessToken The GitHub OAuth access token.
   * @param refreshToken The GitHub OAuth refresh token.
   * @param profile The GitHub user profile.
   */
  validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);
  }
}

// yonbon-api:dev: {
// yonbon-api:dev:   id: '76503090',
// yonbon-api:dev:   displayName: 'Yoni David',
// yonbon-api:dev:   username: 'yondav',
// yonbon-api:dev:   profileUrl: 'https://github.com/yondav',
// yonbon-api:dev:   photos: [ { value: 'https://avatars.githubusercontent.com/u/76503090?v=4' } ],
// yonbon-api:dev:   provider: 'github',
// yonbon-api:dev:   _raw: `{"login":"yondav","id":76503090,"node_id":"MDQ6VXNlcjc2NTAzMDkw","avatar_url":"https://avatars.githubusercontent.com/u/76503090?v=4","gravatar_id":"","url":"https://api.github.com/users/yondav","html_url":"https://github.com/yondav","followers_url":"https://api.github.com/users/yondav/followers","following_url":"https://api.github.com/users/yondav/following{/other_user}","gists_url":"https://api.github.com/users/yondav/gists{/gist_id}","starred_url":"https://api.github.com/users/yondav/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/yondav/subscriptions","organizations_url":"https://api.github.com/users/yondav/orgs","repos_url":"https://api.github.com/users/yondav/repos","events_url":"https://api.github.com/users/yondav/events{/privacy}","received_events_url":"https://api.github.com/users/yondav/received_events","type":"User","site_admin":false,"name":"Yoni David","company":null,"blog":"https://www.yondav.us/","location":"Queens, NY","email":null,"hireable":null,"bio":"I'm a full-stack developer living in Queens, NY. I prioritize clean design, semantic HTML and reusable code.","twitter_username":null,"public_repos":41,"public_gists":0,"followers":17,"following":12,"created_at":"2020-12-23T01:41:22Z","updated_at":"2024-01-16T04:28:53Z","private_gists":1,"total_private_repos":17,"owned_private_repos":17,"disk_usage":852561,"collaborators":4,"two_factor_authentication":true,"plan":{"name":"free","space":976562499,"collaborators":0,"private_repos":10000}}`,
// yonbon-api:dev:   _json: {
// yonbon-api:dev:     login: 'yondav',
// yonbon-api:dev:     id: 76503090,
// yonbon-api:dev:     node_id: 'MDQ6VXNlcjc2NTAzMDkw',
// yonbon-api:dev:     avatar_url: 'https://avatars.githubusercontent.com/u/76503090?v=4',
// yonbon-api:dev:     gravatar_id: '',
// yonbon-api:dev:     url: 'https://api.github.com/users/yondav',
// yonbon-api:dev:     html_url: 'https://github.com/yondav',
// yonbon-api:dev:     followers_url: 'https://api.github.com/users/yondav/followers',
// yonbon-api:dev:     following_url: 'https://api.github.com/users/yondav/following{/other_user}',
// yonbon-api:dev:     gists_url: 'https://api.github.com/users/yondav/gists{/gist_id}',
// yonbon-api:dev:     starred_url: 'https://api.github.com/users/yondav/starred{/owner}{/repo}',
// yonbon-api:dev:     subscriptions_url: 'https://api.github.com/users/yondav/subscriptions',
// yonbon-api:dev:     organizations_url: 'https://api.github.com/users/yondav/orgs',
// yonbon-api:dev:     repos_url: 'https://api.github.com/users/yondav/repos',
// yonbon-api:dev:     events_url: 'https://api.github.com/users/yondav/events{/privacy}',
// yonbon-api:dev:     received_events_url: 'https://api.github.com/users/yondav/received_events',
// yonbon-api:dev:     type: 'User',
// yonbon-api:dev:     site_admin: false,
// yonbon-api:dev:     name: 'Yoni David',
// yonbon-api:dev:     company: null,
// yonbon-api:dev:     blog: 'https://www.yondav.us/',
// yonbon-api:dev:     location: 'Queens, NY',
// yonbon-api:dev:     email: null,
// yonbon-api:dev:     hireable: null,
// yonbon-api:dev:     bio: "I'm a full-stack developer living in Queens, NY. I prioritize clean design, semantic HTML and reusable code.",
// yonbon-api:dev:     twitter_username: null,
// yonbon-api:dev:     public_repos: 41,
// yonbon-api:dev:     public_gists: 0,
// yonbon-api:dev:     followers: 17,
// yonbon-api:dev:     following: 12,
// yonbon-api:dev:     created_at: '2020-12-23T01:41:22Z',
// yonbon-api:dev:     updated_at: '2024-01-16T04:28:53Z',
// yonbon-api:dev:     private_gists: 1,
// yonbon-api:dev:     total_private_repos: 17,
// yonbon-api:dev:     owned_private_repos: 17,
// yonbon-api:dev:     disk_usage: 852561,
// yonbon-api:dev:     collaborators: 4,
// yonbon-api:dev:     two_factor_authentication: true,
// yonbon-api:dev:     plan: {
// yonbon-api:dev:       name: 'free',
// yonbon-api:dev:       space: 976562499,
// yonbon-api:dev:       collaborators: 0,
// yonbon-api:dev:       private_repos: 10000
// yonbon-api:dev:     }
// yonbon-api:dev:   }
// yonbon-api:dev: }
