const configs:any = {
    testing: {
        relayURL: 'https://localhost:3002',
        wsURL: 'wss://localhost:3004',
        cdnURL: ''
    },
    hosted_test: {
        relayURL: 'https://trivia.stream-requests.com:8043',
        wsURL: 'wss://trivia.stream-requests.com:9004',
        cdnURL: 'https://s3-us-west-2.amazonaws.com/stream-trivia-assets-staging'
    },
    in_review: {
        relayURL: 'https://trivia.stream-requests.com:8043',
        wsURL: 'wss://trivia.stream-requests.com:9004',
        cdnURL: 'https://s3-us-west-2.amazonaws.com/stream-trivia-assets-staging'
    },
    pending_action: {
        relayURL: 'https://trivia.stream-requests.com:8043',
        wsURL: 'wss://trivia.stream-requests.com:9004',
        cdnURL: 'https://s3-us-west-2.amazonaws.com/stream-trivia-assets-staging'
    },
    approved: {
        relayURL: 'https://trivia.stream-requests.com:8043',
        wsURL: 'wss://trivia.stream-requests.com:9004',
        cdnURL: 'https://s3-us-west-2.amazonaws.com/stream-trivia-assets-staging'
    },
    released: {
        relayURL: 'https://trivia.stream-requests.com',
        wsURL: 'wss://trivia.stream-requests.com:3004',
        cdnURL: 'https://s3-us-west-2.amazonaws.com/stream-trivia-assets'
    }
};

export default configs;