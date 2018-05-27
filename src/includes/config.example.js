export const config = {
  env: process.env.NODE_ENV || '',
  redis: process.env.REDISCLOUD_URL || '',
  postgres: process.env.DATABASE_URL || '',
  youtube: {
    refresh_token: '',
    client_id: '',
    client_secret: ''
  },
  reddit: {
    clientId: '',
    clientSecret: '',
    username: '',
    password: ''
  },
  subreddits: [
    {
      subreddit: 'leagueoflegends',
      metadata: {
        tags: [
          'league of legends',
          'lol',
          'oddshot',
          'funny moments',
          'clipthat',
          'tyler1',
          'pokimane',
          'yassuo',
          'synapse',
          'lol moments'
        ]
      },
      comments: [
        'I\'m here when the link isn\'t ^_^',
        'The best bot out there, maybe.',
        'I was built in an afternoon with 5 cups of coffee, seriously.',
        'My owner thinks im pretty cool.',
        'Maybe one day I\ll do more then post videos,'
      ]
    }
  ]
};