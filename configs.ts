const configs:any = {
    testing: {
        relayURL: 'https://docker.dev:3002',
        wsURL: 'wss://docker.dev:3004'
    },
    hosted_test: {
        relayURL: 'https://stream-requests.com:8043',
        wsURL: 'wss://stream-requests.com:9004'
    },
    in_review: {
        relayURL: 'https://stream-requests.com:8043',
        wsURL: 'wss://stream-requests.com:9004'
    },
    released: {
        relayURL: 'https://stream-requests.com',
        wsURL: 'wss://stream-requests.com:3004'
    }
};

export default configs;